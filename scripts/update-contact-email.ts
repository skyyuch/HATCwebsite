/**
 * One-off: replace a retired customer-service email address everywhere it is
 * stored in the CMS (owner decision 2026-11-04, 第七十五輪 —「客服電郵是
 * info@hatcmarket.com，官網其他位置都要改」).
 *
 * The code side of the change is just `config/env/*.env` + docs, but the
 * address also lives in the database in two places that a grep of this repo
 * cannot see:
 *
 *   1. `site-settings.email` — the CMS value every contact surface actually
 *      reads. It WINS over `CONTACT_EMAIL`, so leaving it alone would keep the
 *      dead address on the site no matter what the environment file says.
 *   2. Six academy articles imported verbatim from the owner's GitBook
 *      (scripts/seed-academy-from-gitbook.ts keeps contact details as written),
 *      where it appears both as body text and inside `mailto:` link nodes.
 *
 * The old site URL `www.hatchk.com` is deliberately NOT touched: it is still an
 * approved fact (HATC_FACTS.md → "Official contact & website") and the owner has
 * never clarified its relationship with www.hatcmarket.com.
 *
 * Usage (needs DATABASE_URI + PAYLOAD_SECRET, hence `payload:<env>` rather than
 * the bare `payload` script — that one skips scripts/with-env.mjs and so never
 * loads config/env/<env>.secrets.env, failing with "missing secret key"):
 *
 *   npm run payload:local -- run scripts/update-contact-email.ts -- --dry-run
 *   npm run payload:local -- run scripts/update-contact-email.ts
 *
 * On the production host prefix with the node path (docs/DEPLOYMENT.md §2.0b):
 *   sudo env PATH=/www/server/nodejs/v22.22.3/bin:$PATH \
 *     npm run payload:prd -- run scripts/update-contact-email.ts
 *
 * Idempotent: a second run reports "nothing to replace".
 *
 * 🚩 Two things to know before running it on production:
 *
 * 1. **Revalidation does not fire from a CLI script** (there is no Next request
 *    context, so `revalidateContent.ts` swallows it by design). Afterwards open
 *    `/admin → 網站營運設定` and press Save once.
 * 2. **Writes go through the native driver, not `payload.update`.** The academy
 *    body is a required *localized* field and many articles are missing a
 *    translation in one locale, so `payload.update` would refuse to touch them
 *    — whether an article is translated is a content question and must not
 *    block a factual correction. A raw `$set` of the already-computed value
 *    skips hooks and validation, which is exactly right here.
 *
 *    It has to be `model.collection`, not the Mongoose model: globals are
 *    stored under one base schema that declares little beyond `globalType`, so
 *    a `$set` through Mongoose is silently stripped down to nothing and
 *    `site-settings.email` stays on the dead address while the script reports
 *    success.
 */
import {writeSync} from 'node:fs';

import {getPayload} from 'payload';

import config from '@payload-config';

/** Retired 2026-11-04. Must not reappear anywhere on the site. */
const OLD_EMAIL = 'info@hatchk.com';
const NEW_EMAIL = 'info@hatcmarket.com';

function say(message: string): void {
  // Payload's pino logger buffers and this script ends with `process.exit`, so
  // logged lines can be truncated — a run that printed nothing at all looks
  // exactly like one that silently did nothing.
  writeSync(1, `${message}\n`);
}

/**
 * Replace in every string of a stored document, including the text and `mailto:`
 * URLs buried in Lexical nodes. Serialising is safe here because these are plain
 * JSON values read straight back out of Mongo.
 */
function replaceDeep<T>(value: T): {value: T; hits: number} {
  const before = JSON.stringify(value);
  if (before === undefined) return {value, hits: 0};

  const hits = before.split(OLD_EMAIL).length - 1;
  if (hits === 0) return {value, hits: 0};

  return {value: JSON.parse(before.split(OLD_EMAIL).join(NEW_EMAIL)) as T, hits};
}

const dryRun = process.argv.includes('--dry-run');
const payload = await getPayload({config});

type Change = {where: string; label: string; hits: number; apply: () => Promise<void>};
type Model = {find: (query: object) => {lean: () => Promise<unknown[]>}; collection: {
  updateOne: (filter: object, update: object) => Promise<unknown>;
}};

async function scan(where: string, model: Model): Promise<Change[]> {
  const found: Change[] = [];

  for (const doc of await model.find({}).lean()) {
    const raw = doc as Record<string, unknown>;
    const {value, hits} = replaceDeep(raw);
    if (hits === 0) continue;

    // The filter has to use the ObjectId off the ORIGINAL document: `value`
    // came back through JSON, so its `_id` is a string and the native driver —
    // unlike Mongoose — does not cast it, which matches nothing and "succeeds".
    const id = raw._id;
    const {_id, __v, ...fields} = value as Record<string, unknown>;
    void _id;
    void __v;

    found.push({
      where,
      label: String(raw.globalType ?? raw.slug ?? raw.name ?? id),
      hits,
      apply: async () => {
        await model.collection.updateOne({_id: id}, {$set: fields});
      }
    });
  }

  return found;
}

const changes: Change[] = [
  // `site-settings.email` is the value every contact surface actually reads.
  ...(await scan('globals', payload.db.globals as unknown as Model)),
  ...(
    await Promise.all(
      Object.entries(payload.db.collections).map(([slug, model]) =>
        scan(slug, model as unknown as Model)
      )
    )
  ).flat()
];

if (changes.length === 0) {
  say(`nothing to replace — "${OLD_EMAIL}" is not stored in the CMS`);
  process.exit(0);
}

const total = changes.reduce((sum, change) => sum + change.hits, 0);
say(`${OLD_EMAIL} → ${NEW_EMAIL}`);
say(`${total} occurrence(s) across ${changes.length} document(s):`);
for (const change of changes) {
  say(`  ${change.where}: ${change.label}  (${change.hits}×)`);
}

if (dryRun) {
  say('\n--dry-run: nothing written');
  process.exit(0);
}

for (const change of changes) {
  await change.apply();
}

say('\nreplaced.');
say(
  'Now open /admin → 網站營運設定 and press Save once, so the contact details,' +
    ' the legal pages and the academy articles pick up the new address' +
    ' (CLI scripts cannot revalidate).'
);

process.exit(0);
