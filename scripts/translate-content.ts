/**
 * Batch machine-translation pre-fill for all CMS content (route B, scalable).
 *
 * Fills EMPTY localized text/textarea leaves in the non-source content locales
 * with machine-translated drafts for the owner to proofread. Only fills empties
 * (never overwrites) unless `--overwrite` is passed. Uses the same orchestrator
 * as the admin button (`src/lib/mt/translateDocument.ts`).
 *
 * Requires a configured engine (`MT_API_KEY`) and a database (`DATABASE_URI`).
 * With no key it exits cleanly without touching data.
 *
 * Usage:
 *   npm run payload -- run scripts/translate-content.ts
 *   npm run payload -- run scripts/translate-content.ts -- --to en
 *   npm run payload -- run scripts/translate-content.ts -- --to zh-Hans --to en
 *   npm run payload -- run scripts/translate-content.ts -- --only faqs
 *   npm run payload -- run scripts/translate-content.ts -- --overwrite
 *
 * Governance: this never authors facts — it only rewrites editorial localized
 * copy. Sample tables keep their「示意數據」label; numbers/symbols/codes are
 * preserved by the provider prompt.
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
} {
  const to: Locale[] = [];
  let only: string | undefined;
  let overwrite = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--overwrite') overwrite = true;
    else if (arg === '--to') to.push(argv[++i] as Locale);
    else if (arg.startsWith('--to=')) to.push(arg.slice('--to='.length) as Locale);
    else if (arg === '--only') only = argv[++i];
    else if (arg.startsWith('--only=')) only = arg.slice('--only='.length);
  }
  return {to, only, overwrite};
}

const {to, only, overwrite} = parseArgs(process.argv.slice(2));

if (!isMtConfigured()) {
  console.error(
    'MT_API_KEY is not configured — set it in .env to enable translation. Nothing changed.'
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

for (const collection of collections) {
  const slug = collection.slug;
  const list = await p.find({collection: slug, limit: 1000, depth: 0, locale: 'all'});
  payload.logger.info(`Translating ${slug} (${list.docs.length} docs)…`);
  for (const doc of list.docs) {
    const result = await translateDocument({
      payload,
      target: {kind: 'collection', slug, id: doc.id},
      targetLocales,
      overwrite
    });
    if (result.ok && result.filled) {
      const filled = Object.values(result.filled).reduce((a, b) => a + (b || 0), 0);
      totalFilled += filled;
    }
  }
}

for (const global of globals) {
  const slug = global.slug;
  payload.logger.info(`Translating global ${slug}…`);
  const result = await translateDocument({
    payload,
    target: {kind: 'global', slug},
    targetLocales,
    overwrite
  });
  if (result.ok && result.filled) {
    totalFilled += Object.values(result.filled).reduce((a, b) => a + (b || 0), 0);
  }
}

payload.logger.info(`Machine translation done. Filled ${totalFilled} field(s).`);
process.exit(0);
