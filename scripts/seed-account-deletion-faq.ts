/**
 * Add (or refresh) the single「如何關閉（註銷）我的交易帳戶？」FAQ in the
 * `accounts` category, in all three locales, from `accounts.faq.items` in
 * `src/messages/*` (第七十五輪 — Google Play's account deletion requirement).
 *
 * Why this is not just `scripts/seed-accounts.ts`: that one is REPLACE mode —
 * it deletes every `accounts` FAQ and every `account-benefits` card and
 * re-creates them from the i18n copy, so running it on production to pick up
 * one new question would silently discard any wording the owner has since
 * edited in /admin. This script touches exactly one row and leaves the rest
 * alone, so it is safe to run on a live database.
 *
 * It matters that the row reaches the database at all: `lib/faqs.ts` falls back
 * to the i18n seed at *collection* level, so as soon as the `accounts` category
 * has any row the whole i18n list is ignored — adding the question to
 * `src/messages/*` alone would show it on a database-less build and nowhere
 * else.
 *
 * Usage (needs DATABASE_URI + PAYLOAD_SECRET, hence `payload:<env>` rather than
 * the bare `payload` script — that one skips scripts/with-env.mjs and so never
 * loads config/env/<env>.secrets.env, failing with "missing secret key"):
 *
 *   npm run payload:local -- run scripts/seed-account-deletion-faq.ts
 *
 * On the production host prefix with the node path (docs/DEPLOYMENT.md §2.0b):
 *   sudo env PATH=/www/server/nodejs/v22.22.3/bin:$PATH \
 *     npm run payload:prd -- run scripts/seed-account-deletion-faq.ts
 *
 * Idempotent: re-running updates the same row rather than adding a second one.
 * CLI scripts cannot revalidate, so press Save once in /admin afterwards.
 */
import {writeSync} from 'node:fs';

import {getPayload} from 'payload';

import config from '@payload-config';

import zhHant from '../src/messages/zh-Hant.json';
import zhHans from '../src/messages/zh-Hans.json';
import en from '../src/messages/en.json';

type Loc = 'zh-Hant' | 'zh-Hans' | 'en';
type Qa = {q: string; a: string};

const MESSAGES: Record<Loc, {accounts: {faq: {items: Qa[]}}}> = {
  'zh-Hant': zhHant,
  'zh-Hans': zhHans,
  en
};
const LOCALES = Object.keys(MESSAGES) as Loc[];

function say(message: string): void {
  // Payload's pino logger buffers and this script ends with `process.exit`.
  writeSync(1, `${message}\n`);
}

/** The question is the last entry of the shared seed list in every locale. */
function seedRow(locale: Loc): Qa {
  const items = MESSAGES[locale].accounts.faq.items;
  return items[items.length - 1];
}

const payload = await getPayload({config});
const canonical = seedRow('zh-Hant');

const existing = await payload.find({
  collection: 'faqs',
  locale: 'zh-Hant',
  fallbackLocale: false,
  where: {category: {equals: 'accounts'}},
  sort: 'order',
  limit: 200,
  depth: 0,
  overrideAccess: true
});

// Match on the seed wording, or on 註銷 so a row the owner has reworded is
// updated rather than duplicated.
const match = existing.docs.find((doc) => {
  const question = String(doc.question ?? '');
  return question === canonical.q || question.includes('註銷');
});

const order = match
  ? Number(match.order ?? 0)
  : existing.docs.reduce((max, doc) => Math.max(max, Number(doc.order ?? 0)), -1) + 1;

let id = match?.id;
for (const locale of LOCALES) {
  const row = seedRow(locale);
  const data = {
    question: row.q,
    answer: row.a,
    category: 'accounts' as const,
    order,
    enabled: true
  };

  // The document has to exist before the remaining locales can be written, so
  // the first pass may create it and the rest always update.
  if (id === undefined) {
    id = (await payload.create({collection: 'faqs', locale, data, overrideAccess: true})).id;
  } else {
    await payload.update({collection: 'faqs', id, locale, data, overrideAccess: true});
  }
}

say(
  `${match ? 'updated' : 'created'} the account-deletion FAQ (accounts, order ${order})` +
    ` in ${LOCALES.join(', ')}`
);
say('Now press Save once in /admin so the public pages pick it up.');

process.exit(0);
