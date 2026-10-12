/**
 * Seed the two announcement categories the owner asked for (重要公告 /
 * 交易安排) so `/admin` → 公告 has something to pick on day one. Everything
 * else about the taxonomy is his: new categories are added in the panel and
 * show up in the `/announcements` filter automatically.
 *
 * ⚠️ Governance: this script seeds **categories only**. No announcement is
 * created — inventing a notice would be inventing a company statement (same
 * rule as news/activities and testimonials). An empty collection renders the
 * neutral empty state.
 *
 * Idempotent: a category is created only when its slug is missing, so
 * re-running never duplicates and never overwrites a renamed category.
 *
 * Run: npm run payload -- run scripts/seed-announcements.ts
 */
import {getPayload} from 'payload';
import config from '@payload-config';

type Loc = 'zh-Hant' | 'zh-Hans' | 'en';

const CATEGORIES: {slug: string; names: Record<Loc, string>}[] = [
  {
    slug: 'important',
    names: {
      'zh-Hant': '重要公告',
      'zh-Hans': '重要公告',
      en: 'Important notices'
    }
  },
  {
    slug: 'trading-arrangement',
    names: {
      'zh-Hant': '交易安排',
      'zh-Hans': '交易安排',
      en: 'Trading arrangements'
    }
  }
];

const payload = await getPayload({config});

for (let i = 0; i < CATEGORIES.length; i++) {
  const {slug, names} = CATEGORIES[i];
  const existing = await payload.find({
    collection: 'announcement-categories',
    where: {slug: {equals: slug}},
    limit: 1,
    depth: 0
  });

  if (existing.docs.length > 0) {
    payload.logger.info(`Skip announcement category "${slug}" (exists)`);
    continue;
  }

  const created = await payload.create({
    collection: 'announcement-categories',
    locale: 'zh-Hant',
    data: {slug, order: i, enabled: true, name: names['zh-Hant']}
  });

  for (const loc of ['zh-Hans', 'en'] as const) {
    await payload.update({
      collection: 'announcement-categories',
      id: created.id,
      locale: loc,
      data: {name: names[loc]}
    });
  }

  payload.logger.info(`Seeded announcement category "${slug}"`);
}

payload.logger.info('Announcement categories seeding done.');
process.exit(0);
