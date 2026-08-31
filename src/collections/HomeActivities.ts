import type {CollectionConfig} from 'payload';

import {revalidateHomeActivities} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Homepage "News & activities" banners. Owner requirement (2026-08-07): activity
 * / promotion content MUST be editable in the CMS, never hard-coded. Localised
 * per front-end locale (see payload.config.ts `localization`).
 *
 * Do not seed real promotions here in code; content is entered by the owner.
 */
export const HomeActivities: CollectionConfig = {
  slug: 'home-activities',
  labels: {
    singular: adminLabel('Home activity', '最新消息', '最新消息'),
    plural: adminLabel('Home activities', '最新消息／活動', '最新消息／活动')
  },
  access: contentCollectionAccess('home-activities'),
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tag', 'order', 'enabled', 'date'],
    group: ADMIN_GROUPS.content,
    description: adminLabel(
      'Homepage news & activities cards. Create / edit / sort / publish; 3 locales.',
      '首頁「最新消息與活動」卡片。可新增／編輯／排序／上下架，支援三語。',
      '首页「最新消息与活动」卡片。可新增／编辑／排序／上下架，支持三语。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => { revalidateHomeActivities(); }],
    afterDelete: [() => { revalidateHomeActivities(); }]
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
      name: 'summary',
      type: 'textarea',
      localized: true,
      label: adminLabel('Summary', '摘要', '摘要')
    },
    {
      name: 'tag',
      type: 'text',
      localized: true,
      label: adminLabel('Tag', '分類標籤', '分类标签'),
      admin: {
        description: adminLabel(
          'e.g. Event, Notice, Product, Platform.',
          '例如：活動、公告、產品、交易平台。',
          '例如：活动、公告、产品、交易平台。'
        )
      }
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: adminLabel('Image', '圖片', '图片'),
      admin: {
        description: adminLabel(
          'If empty, the front-end shows a brand gradient banner.',
          '未上傳時前台以品牌漸層 banner 呈現。',
          '未上传时前台以品牌渐层 banner 呈现。'
        )
      }
    },
    {
      name: 'href',
      type: 'text',
      label: adminLabel('Link (URL)', '連結 (URL)', '链接 (URL)'),
      admin: {
        description: adminLabel(
          'Optional; when set, the card is clickable.',
          '可留空；填寫後卡片可點擊。',
          '可留空；填写后卡片可点击。'
        )
      }
    },
    {
      name: 'date',
      type: 'date',
      label: adminLabel('Date', '日期', '日期'),
      admin: {date: {pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd'}}
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
      access: {update: fieldUpdateAccess('home-activities', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
