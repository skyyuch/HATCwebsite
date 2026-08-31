import type {CollectionConfig} from 'payload';

import {revalidateAcademyArticles} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Gold Academy educational articles. Localised; owner-editable. Body is Lexical
 * richtext (owner default for Phase 3). When the database is not configured,
 * readers fall back to i18n seed cards (`home.goldAcademy.articles` a1–a3).
 *
 * Content must stay neutral education — not investment advice.
 */
export const AcademyArticles: CollectionConfig = {
  slug: 'academy-articles',
  labels: {
    singular: adminLabel('Academy article', '學堂文章', '学堂文章'),
    plural: adminLabel('Academy articles', '黃金學堂', '黄金学堂')
  },
  access: contentCollectionAccess('academy-articles'),
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'order', 'enabled', 'publishedAt'],
    group: ADMIN_GROUPS.content,
    description: adminLabel(
      'Gold Academy articles. Neutral education only — not investment advice. Falls back to i18n seeds without DB.',
      '黃金學堂文章。中性教育內容，非投資建議。無資料庫時前台回退 i18n 預設三卡。',
      '黄金学堂文章。中性教育内容，非投资建议。无数据库时前台回退 i18n 默认三卡。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [
      () => {
        revalidateAcademyArticles();
      }
    ],
    afterDelete: [
      () => {
        revalidateAcademyArticles();
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
      access: {update: fieldUpdateAccess('academy-articles', 'slug')},
      label: adminLabel('URL slug', '網址代稱', '网址代称'),
      admin: {
        description: adminLabel(
          'Used for /academy/[slug]; unique site-wide; prefer ASCII + hyphens.',
          '用於 /academy/[slug]；建議英數與連字號，全站唯一。',
          '用于 /academy/[slug]；建议英数与连字符，全站唯一。'
        )
      }
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: adminLabel('Excerpt', '摘要', '摘要'),
      admin: {
        description: adminLabel(
          'Short blurb for list / homepage cards.',
          '列表／首頁卡片用短摘要。',
          '列表／首页卡片用短摘要。'
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
          'Full article (Lexical). Neutral education — not investment advice.',
          '完整文章（Lexical）。中性教育內容，勿寫成投資建議。',
          '完整文章（Lexical）。中性教育内容，勿写成投资建议。'
        )
      }
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: adminLabel('Cover image', '封面圖', '封面图'),
      admin: {
        description: adminLabel(
          'If empty, the front-end uses a brand gradient or seed placeholder.',
          '未上傳時前台以品牌漸層或種子佔位圖呈現。',
          '未上传时前台以品牌渐层或种子占位图呈现。'
        )
      }
    },
    {
      name: 'category',
      type: 'text',
      localized: true,
      label: adminLabel('Category tag', '分類標籤', '分类标签'),
      admin: {
        description: adminLabel(
          'e.g. Basics, MT5 practice, Macro view.',
          '例如：基礎教學、MT5實戰、巨集觀視野。',
          '例如：基础教学、MT5实战、宏观视野。'
        )
      }
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: adminLabel('Published date', '發布日期', '发布日期'),
      admin: {
        date: {pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd'}
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
      access: {update: fieldUpdateAccess('academy-articles', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
