/**
 * Seed the `instruments` collection with the two SAMPLE rows (gold / silver) so
 * they exist in the CMS and are editable in `/admin`, matching the front-end
 * i18n fallback. Idempotent: skips a symbol that already exists.
 *
 * ⚠️ These are illustrative sample rows (front-end keeps the「示意數據」label),
 * NOT approved facts. Approved figures stay in tradingConditions.ts.
 *
 * Run: npm run payload -- run scripts/seed-instruments.ts
 */
import {getPayload} from 'payload';
import config from '@payload-config';

type Seed = {
  symbol: string;
  category: 'metals';
  contractSize: string;
  spread: string;
  leverage: string;
  order: number;
  name: {'zh-Hant': string; 'zh-Hans': string; en: string};
  tradingHours: {'zh-Hant': string; 'zh-Hans': string; en: string};
};

const SEEDS: Seed[] = [
  {
    symbol: 'XAU/USD',
    category: 'metals',
    contractSize: '100 oz',
    spread: '27',
    leverage: '1:100',
    order: 0,
    name: {'zh-Hant': '倫敦金', 'zh-Hans': '伦敦金', en: 'Loco London Gold'},
    tradingHours: {
      'zh-Hant': '週一至週五 24 小時',
      'zh-Hans': '周一至周五 24 小时',
      en: 'Mon–Fri, 24 hours'
    }
  },
  {
    symbol: 'XAG/USD',
    category: 'metals',
    contractSize: '5000 oz',
    spread: '30',
    leverage: '1:100',
    order: 1,
    name: {'zh-Hant': '倫敦銀', 'zh-Hans': '伦敦银', en: 'Loco London Silver'},
    tradingHours: {
      'zh-Hant': '週一至週五 24 小時',
      'zh-Hans': '周一至周五 24 小时',
      en: 'Mon–Fri, 24 hours'
    }
  }
];

const payload = await getPayload({config});

for (const seed of SEEDS) {
    const existing = await payload.find({
      collection: 'instruments',
      where: {symbol: {equals: seed.symbol}},
      limit: 1,
      depth: 0
    });

    if (existing.docs.length > 0) {
      payload.logger.info(`Skip ${seed.symbol} (already exists)`);
      continue;
    }

    // Create in the default locale (zh-Hant), then fill the other locales for
    // the localized fields (name / tradingHours).
    const created = await payload.create({
      collection: 'instruments',
      locale: 'zh-Hant',
      data: {
        symbol: seed.symbol,
        category: seed.category,
        contractSize: seed.contractSize,
        spread: seed.spread,
        leverage: seed.leverage,
        order: seed.order,
        enabled: true,
        name: seed.name['zh-Hant'],
        tradingHours: seed.tradingHours['zh-Hant']
      }
    });

    for (const locale of ['zh-Hans', 'en'] as const) {
      await payload.update({
        collection: 'instruments',
        id: created.id,
        locale,
        data: {
          name: seed.name[locale],
          tradingHours: seed.tradingHours[locale]
        }
      });
    }

    payload.logger.info(`Created ${seed.symbol} (id=${created.id})`);
  }

payload.logger.info('Instrument seeding done.');
process.exit(0);
