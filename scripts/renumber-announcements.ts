/**
 * One-off: renumber existing announcement slugs to the serial scheme
 * `YYYY-NNN` (owner decision 2026-10-14, 第七十輪 追加).
 *
 * The old rule derived the slug from the title, falling back to the publication
 * date — which gave every notice a date-shaped URL (meaningless once two share a
 * date) and, when a title started with digits, something worse: 「2025美国实施冬令
 * 时间通告」became `/announcements/2025`. See src/payload/slug.ts →
 * autoSerialSlug for the full reasoning.
 *
 * Usage (needs DATABASE_URI + PAYLOAD_SECRET, hence `payload:<env>` rather than
 * the bare `payload` script — that one skips scripts/with-env.mjs and so never
 * loads config/env/<env>.secrets.env, failing with "missing secret key"):
 *
 *   npm run payload:local -- run scripts/renumber-announcements.ts -- --dry-run
 *   npm run payload:local -- run scripts/renumber-announcements.ts
 *
 * On the production host prefix with the node path (docs/DEPLOYMENT.md §2.0b):
 *   sudo env PATH=/www/server/nodejs/v22.22.3/bin:$PATH \
 *     npm run payload:prd -- run scripts/renumber-announcements.ts
 *
 * Numbering follows publication date, oldest first, so serials read
 * chronologically. Already-correct slugs are left alone, so this is safe to
 * re-run (it will report "no change needed").
 *
 * 🚩 Two things to know before running it on production:
 *
 * 1. **The old URLs stop working.** Nothing on the site links to a notice by a
 *    hard-coded slug, but anyone holding a copied link (or the App, if the dev
 *    team pasted a test URL) needs the new one — the mapping is printed.
 * 2. **Revalidation does not fire from a CLI script** (there is no Next request
 *    context, so `revalidateContent.ts` swallows it by design). After running
 *    this, open any notice in `/admin` and press Save once: that triggers
 *    `afterChange`, which refreshes the list, the `/embed` list and the sitemap.
 */
import {writeSync} from 'node:fs';

import {getPayload} from 'payload';

import config from '@payload-config';

function say(message: string): void {
  // Payload's pino logger buffers and this script ends with `process.exit`, so
  // logged lines can be truncated — a rename that printed nothing at all looks
  // exactly like one that silently did nothing.
  writeSync(1, `${message}\n`);
}

/** Same Hong Kong year as the field hook, so the script agrees with new saves. */
function hongKongYear(value: unknown): string {
  const date = value ? new Date(String(value)) : new Date();
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric'
  }).format(date);
}

const dryRun = process.argv.includes('--dry-run');
const payload = await getPayload({config});

const {docs} = await payload.find({
  collection: 'announcements',
  // Oldest first so serials run in chronological order. Undated notices sort
  // last and are numbered into the current year.
  sort: 'publishedAt',
  limit: 1000,
  depth: 0,
  overrideAccess: true
});

if (docs.length === 0) {
  say('no announcements found — nothing to do');
  process.exit(0);
}

const counters = new Map<string, number>();
const plan = docs.map((doc) => {
  const year = hongKongYear(doc.publishedAt) || hongKongYear(new Date());
  const next = (counters.get(year) ?? 0) + 1;
  counters.set(year, next);

  return {
    id: String(doc.id),
    title: String(doc.title ?? ''),
    from: String(doc.slug ?? ''),
    to: `${year}-${String(next).padStart(3, '0')}`
  };
});

const changes = plan.filter((item) => item.from !== item.to);

say(`${docs.length} announcement(s); ${changes.length} to renumber`);
for (const item of plan) {
  const mark = item.from === item.to ? '=' : '→';
  say(`  ${item.from || '(blank)'} ${mark} ${item.to}  ${item.title}`);
}

if (changes.length === 0) {
  say('no change needed');
  process.exit(0);
}

if (dryRun) {
  say('\n--dry-run: nothing written');
  process.exit(0);
}

// Two passes: `slug` has a unique index, and a target serial may still be held
// by another notice at this point (e.g. swapping two of them), so park every
// changed row on a temporary slug first.
for (const item of changes) {
  await payload.update({
    collection: 'announcements',
    id: item.id,
    data: {slug: `tmp-renumber-${item.id}`},
    overrideAccess: true
  });
}

for (const item of changes) {
  await payload.update({
    collection: 'announcements',
    id: item.id,
    data: {slug: item.to},
    overrideAccess: true
  });
}

say('\nrenumbered. New addresses:');
for (const item of changes) {
  say(`  /announcements/${item.to}   (was /announcements/${item.from || '—'})`);
}
say(
  '\nNow open any notice in /admin and press Save once, so the list, the /embed' +
    ' list and /sitemap.xml pick up the new URLs (CLI scripts cannot revalidate).'
);

process.exit(0);
