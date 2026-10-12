import type {CollectionConfig} from 'payload';

import {revalidateAnnouncements} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Official announcements (owner request 2026-10-12, 第六十輪): `/announcements`
 * list + `/announcements/[slug]` detail page, categorised via the
 * `announcement-categories` collection (owner-managed taxonomy).
 *
 * Separate from `home-activities` ("最新消息／活動", homepage cards + /news) by
 * owner decision: activities are marketing cards that link out, announcements
 * are dated notices with a full body page.
 *
 * Governance: nothing is seeded here — an empty collection renders a neutral
 * empty state, never a fabricated notice (same rule as news/activities and
 * testimonials). Content typed in by the owner must still respect the site's
 * fact red lines: approved trading conditions live in
 * `src/components/products/tradingConditions.ts` / `docs/HATC_FACTS.md`, and a
 * notice must not introduce conditions, products or claims that contradict them.
 */
export const Announcements: CollectionConfig = {
  slug: 'announcements',
  labels: {
    singular: adminLabel('Announcement', '公告', '公告'),
    plural: adminLabel('Announcements', '公告', '公告')
  },
  access: contentCollectionAccess('announcements'),
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'pinned', 'enabled'],
    group: ADMIN_GROUPS.content,
    description: adminLabel(
      'Official notices shown on /announcements. Newest first; pinned ones stay on top. Trading details must match the approved trading conditions.',
      '官方公告，顯示於 /announcements。依發布日期由新到舊排列，置頂者固定在最前。涉及交易細節請與已核可的交易條件一致。',
      '官方公告，显示于 /announcements。依发布日期由新到旧排列，置顶者固定在最前。涉及交易细节请与已核可的交易条件一致。'
    )
  },
  defaultSort: '-publishedAt',
  hooks: {
    afterChange: [
      () => {
        revalidateAnnouncements();
      }
    ],
    afterDelete: [
      () => {
        revalidateAnnouncements();
      }
    ]
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: adminLabel('Title', '標題', '标题')
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      access: {update: fieldUpdateAccess('announcements', 'slug')},
      label: adminLabel('URL slug', '網址代稱', '网址代称'),
      admin: {
        description: adminLabel(
          'Used for /announcements/[slug]; unique site-wide; prefer ASCII + hyphens.',
          '用於 /announcements/[slug]；建議英數與連字號，全站唯一。',
          '用于 /announcements/[slug]；建议英数与连字符，全站唯一。'
        )
      }
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'announcement-categories',
      label: adminLabel('Category', '分類', '分类'),
      admin: {
        description: adminLabel(
          'Optional. Without a category the notice only appears under "All".',
          '可留空；未選分類的公告只會出現在「全部」。',
          '可留空；未选分类的公告只会出现在「全部」。'
        )
      }
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: adminLabel('Summary', '摘要', '摘要'),
      admin: {
        description: adminLabel(
          'Short blurb for the list page.',
          '列表頁顯示的短摘要。',
          '列表页显示的短摘要。'
        )
      }
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      label: adminLabel('Body', '內文', '正文'),
      admin: {
        description: adminLabel(
          'Full notice (headings, lists and tables supported).',
          '公告完整內文（可用標題、清單與表格）。',
          '公告完整正文（可用标题、清单与表格）。'
        )
      }
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      label: adminLabel('Published date', '發布日期', '发布日期'),
      admin: {
        date: {pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd'},
        description: adminLabel(
          'Drives the list order (newest first).',
          '決定列表排序（由新到舊）。',
          '决定列表排序（由新到旧）。'
        )
      }
    },
    {
      name: 'pinned',
      type: 'checkbox',
      defaultValue: false,
      label: adminLabel('Pin to top', '置頂', '置顶'),
      admin: {
        description: adminLabel(
          'Pinned notices stay above the dated list.',
          '置頂公告固定排在日期排序之前。',
          '置顶公告固定排在日期排序之前。'
        )
      }
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      access: {update: fieldUpdateAccess('announcements', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
