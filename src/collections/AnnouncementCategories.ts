import type {CollectionConfig} from 'payload';

import {revalidateAnnouncementCategories} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';
import {autoSlug, slugRequired} from '@/payload/slug';

/**
 * Announcement categories (owner decision 2026-10-12, 第六十輪): the owner asked
 * to be able to add categories himself, so the taxonomy is a collection rather
 * than a fixed list in code or a free-text field on the announcement.
 *
 * Why a relationship and not free text (the `academy-articles.category`
 * approach): a localized free-text tag silently stops matching the front-end
 * filter the moment it is reworded in one locale. Here every announcement
 * points at a category document, so the `/announcements` filter and the
 * announcements always agree, and `slug` gives the filter a locale-independent
 * value for `?category=` deep links.
 *
 * The two categories the owner named (重要公告 / 交易安排) are created by
 * `scripts/seed-announcements.ts`; everything else is his to add.
 */
export const AnnouncementCategories: CollectionConfig = {
  slug: 'announcement-categories',
  labels: {
    singular: adminLabel('Announcement category', '公告分類', '公告分类'),
    plural: adminLabel('Announcement categories', '公告分類', '公告分类')
  },
  access: contentCollectionAccess('announcement-categories'),
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order', 'enabled'],
    group: ADMIN_GROUPS.content,
    description: adminLabel(
      'Categories for the /announcements filter. Add your own; each one appears as a filter option on the site.',
      '公告頁的分類篩選選項。可自行新增，新增後會自動出現在前台篩選器。',
      '公告页的分类筛选选项。可自行新增，新增后会自动出现在前台筛选器。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [
      () => {
        revalidateAnnouncementCategories();
      }
    ],
    afterDelete: [
      () => {
        revalidateAnnouncementCategories();
      }
    ]
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: adminLabel('Name', '分類名稱', '分类名称')
    },
    {
      // Normalised and de-duplicated like the announcement slug, but NOT
      // auto-generated: this one is a shareable filter URL set up once per
      // category, and `?category=category-2` would be meaningless. A Chinese-only
      // name therefore still asks for a slug — with a message that says what to
      // type, which is the part the owner was missing in 第六十一輪.
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      access: {update: fieldUpdateAccess('announcement-categories', 'slug')},
      hooks: {
        beforeValidate: [
          autoSlug('announcement-categories', (data) => [data?.name])
        ]
      },
      validate: slugRequired(
        adminLabel(
          'Enter a slug in ASCII letters, numbers and hyphens, e.g. important or trading-arrangement.',
          '請填寫網址代稱，使用英數與連字號，例如 important 或 trading-arrangement。',
          '请填写网址代称，使用英数与连字符，例如 important 或 trading-arrangement。'
        )
      ),
      label: adminLabel('URL slug', '網址代稱', '网址代称'),
      admin: {
        description: adminLabel(
          'Used by the filter link /announcements?category=… — ASCII letters, numbers and hyphens, e.g. important or trading-arrangement.',
          '用於篩選連結 /announcements?category=…；請用英數與連字號，例如 important 或 trading-arrangement。',
          '用于筛选链接 /announcements?category=…；请用英数与连字符，例如 important 或 trading-arrangement。'
        )
      }
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: adminLabel('Order', '排序', '排序'),
      admin: {
        description: adminLabel(
          'Lower numbers appear first.',
          '數字越小越前面。',
          '数字越小越靠前。'
        )
      }
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      access: {update: fieldUpdateAccess('announcement-categories', 'enabled')},
      label: adminLabel(
        'Enabled (show as a filter)',
        '啟用（顯示為篩選選項）',
        '启用（显示为筛选选项）'
      ),
      admin: {
        description: adminLabel(
          'Disabling hides the filter option; announcements in this category still show under "All".',
          '取消啟用只會隱藏篩選選項；該分類的公告仍會出現在「全部」。',
          '取消启用只会隐藏筛选选项；该分类的公告仍会出现在「全部」。'
        )
      }
    }
  ]
};
