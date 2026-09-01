/**
 * Read-only diagnostic: report which academy-articles have their localized
 * `body` (Lexical) filled per non-default locale. Uses fallbackLocale:false so a
 * stored value is distinguishable from the zh-Hant fallback. No API calls.
 *
 *   npm run payload -- run scripts/check-academy-i18n.ts
 */
import {getPayload} from 'payload';
import config from '@payload-config';

import {isRichTextEmpty} from '../src/lib/mt/richText';

const payload = await getPayload({config});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = payload as any;

const locales = ['zh-Hans', 'en'] as const;

const list = await p.find({
  collection: 'academy-articles',
  limit: 1000,
  depth: 0,
  locale: 'all'
});

let filledHans = 0;
let filledEn = 0;
const pending: string[] = [];

for (const doc of list.docs) {
  const status: Record<string, string> = {};
  for (const loc of locales) {
    const body = doc.body?.[loc];
    const filled = body && !isRichTextEmpty(body);
    status[loc] = filled ? 'OK' : '—';
    if (filled && loc === 'zh-Hans') filledHans++;
    if (filled && loc === 'en') filledEn++;
  }
  const line = `${doc.slug}\tzh-Hans:${status['zh-Hans']}\ten:${status.en}`;
  if (status['zh-Hans'] !== 'OK' || status.en !== 'OK') pending.push(line);
}

payload.logger.info(`Total: ${list.docs.length} articles`);
payload.logger.info(`body zh-Hans filled: ${filledHans}/${list.docs.length}`);
payload.logger.info(`body en filled:      ${filledEn}/${list.docs.length}`);
if (pending.length) {
  payload.logger.info(`Pending (missing at least one locale):`);
  for (const l of pending) console.log('  ' + l);
}
process.exit(0);
