/**
 * Batch machine-translation pre-fill for all CMS content (route B, scalable).
 *
 * Fills EMPTY localized text/textarea leaves in the non-source content locales
 * with machine-translated drafts for the owner to proofread. Only fills empties
 * (never overwrites) unless `--overwrite` is passed. Uses the same orchestrator
 * as the admin button (`src/lib/mt/translateDocument.ts`), including its
 * automatic source-locale pick — so a document typed in Simplified Chinese is
 * translated **from** Simplified Chinese (第七十一輪).
 *
 * Requires a configured engine (`MT_API_KEY`) and a database (`DATABASE_URI`).
 * With no key it exits cleanly without touching data (`--dry-run` still works).
 *
 * Usage (⚠ always via `payload:local` / `payload:uat` / `payload:prd`, so the
 * environment's `*.secrets.env` is loaded — a bare `payload` has no secret key):
 *   npm run payload:prd -- run scripts/translate-content.ts -- --only announcements --dry-run
 *   npm run payload:prd -- run scripts/translate-content.ts -- --only announcements
 *   npm run payload:local -- run scripts/translate-content.ts
 *   npm run payload:local -- run scripts/translate-content.ts -- --to en
 *   npm run payload:local -- run scripts/translate-content.ts -- --overwrite
 *
 * 🚩 The CLI cannot revalidate (no request context, see `revalidateContent.ts`),
 * so after a run open any document in `/admin` and press Save once to refresh
 * the public pages, the `/embed` twins and `/sitemap.xml`.
 *
 * Governance: this never authors facts — it only rewrites editorial localized
 * copy. Sample tables keep their「示意數據」label; numbers/symbols/codes are
 * preserved by the provider prompt. Machine output is a **proofreading draft**.
 */
import {getPayload} from 'payload';
import config from '@payload-config';

import type {Locale} from '../src/i18n/routing';
import {configHasLocalizedText} from '../src/lib/mt/localizedFields';
import {isMtConfigured} from '../src/lib/mt/provider';
import {translateDocument} from '../src/lib/mt/translateDocument';

function parseArgs(argv: string[]): {
  to: Locale[];
  only?: string;
  overwrite: boolean;
  dryRun: boolean;
} {
  const to: Locale[] = [];
  let only: string | undefined;
  let overwrite = false;
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--overwrite') overwrite = true;
    else if (arg === '--dry-run') dryRun = true;
    else if (arg === '--to') to.push(argv[++i] as Locale);
    else if (arg.startsWith('--to=')) to.push(arg.slice('--to='.length) as Locale);
    else if (arg === '--only') only = argv[++i];
    else if (arg.startsWith('--only=')) only = arg.slice('--only='.length);
  }
  return {to, only, overwrite, dryRun};
}

const {to, only, overwrite, dryRun} = parseArgs(process.argv.slice(2));

if (!isMtConfigured() && !dryRun) {
  console.error(
    'MT_API_KEY is not configured — set it in the host environment or config/env/<env>.secrets.env. Nothing changed.'
  );
  process.exit(0);
}

const payload = await getPayload({config});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = payload as any;

const targetLocales = to.length > 0 ? to : undefined;

const collections = payload.config.collections.filter(
  (c) => configHasLocalizedText(c.fields) && (!only || c.slug === only)
);
const globals = payload.config.globals.filter(
  (g) => configHasLocalizedText(g.fields) && (!only || g.slug === only)
);

let totalFilled = 0;
let failedDocs = 0;

for (const collection of collections) {
  const slug = collection.slug;
  const list = await p.find({collection: slug, limit: 1000, depth: 0, locale: 'all'});
  payload.logger.info(
    `${dryRun ? 'Planning' : 'Translating'} ${slug} (${list.docs.length} docs)…`
  );
  for (const doc of list.docs) {
    // Resilient per-doc: a single failing document (e.g. an upstream hiccup on a
    // long article) must not abort the whole batch. translateDocument only fills
    // empties, so re-running later completes any skipped doc.
    try {
      const result = await translateDocument({
        payload,
        target: {kind: 'collection', slug, id: doc.id},
        targetLocales,
        overwrite,
        dryRun
      });
      if (result.ok && result.filled) {
        const filled = Object.values(result.filled).reduce((a, b) => a + (b || 0), 0);
        totalFilled += filled;
        if (filled > 0) {
          // Name the source: it is the locale the editor implicitly declared
          // canonical, and the one the owner should proofread the draft against.
          const detail = Object.entries(result.filled)
            .filter(([, n]) => (n ?? 0) > 0)
            .map(([locale, n]) => `${locale} ${n}`)
            .join(', ');
          payload.logger.info(
            `  ${slug}#${doc.id} ← ${result.source}${result.autoSource ? ' (auto)' : ''}: ${detail}`
          );
        }
      }
    } catch (err) {
      failedDocs += 1;
      payload.logger.error(
        `Translate failed for ${slug}#${doc.id}: ${
          err instanceof Error ? err.message : String(err)
        } — continuing.`
      );
    }
  }
}

for (const global of globals) {
  const slug = global.slug;
  payload.logger.info(`${dryRun ? 'Planning' : 'Translating'} global ${slug}…`);
  const result = await translateDocument({
    payload,
    target: {kind: 'global', slug},
    targetLocales,
    overwrite,
    dryRun
  });
  if (result.ok && result.filled) {
    totalFilled += Object.values(result.filled).reduce((a, b) => a + (b || 0), 0);
  }
}

payload.logger.info(
  (dryRun
    ? `Dry run: would fill ${totalFilled} field(s). Nothing was written.`
    : `Machine translation done. Filled ${totalFilled} field(s). ` +
      'Open any document in /admin and press Save once so the public pages, ' +
      'the /embed twins and /sitemap.xml pick it up.') +
    (failedDocs > 0 ? ` ${failedDocs} doc(s) failed — re-run to complete them.` : '')
);
process.exit(0);
