import type {CollectionConfig} from 'payload';

import {revalidateFaqs} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable FAQs. Localised per front-end locale. Category groups items
 * for page consumers (e.g. `/trading` reads `trading`). When the database is
 * not configured, readers fall back to i18n seed copy (`trading.faq.items`).
 */
export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: {
    singular: adminLabel('FAQ', '常見問題', '常见问题'),
    plural: adminLabel('FAQs', '常見問題', '常见问题')
  },
  access: contentCollectionAccess('faqs'),
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'order', 'enabled'],
    group: ADMIN_GROUPS.content,
    description: adminLabel(
      'FAQs by category. Front-end falls back to i18n seeds when empty / no DB.',
      '常見問題。依分類供各頁面讀取；無資料庫時前台回退 i18n 預設文案。',
      '常见问题。依分类供各页面读取；无数据库时前台回退 i18n 默认文案。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => { revalidateFaqs(); }],
    afterDelete: [() => { revalidateFaqs(); }]
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      localized: true,
      label: adminLabel('Question', '問題', '问题')
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
      localized: true,
      label: adminLabel('Answer', '答案', '答案')
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'trading',
      label: adminLabel('Category', '分類', '分类'),
      options: [
        {
          label: adminLabel('Trading overview (/trading)', '交易概覽 (/trading)', '交易概览 (/trading)'),
          value: 'trading'
        },
        {
          label: adminLabel('Products / conditions', '產品／交易條件', '产品／交易条件'),
          value: 'products'
        },
        {
          label: adminLabel('Trading accounts (/accounts)', '交易帳戶 (/accounts)', '交易账户 (/accounts)'),
          value: 'accounts'
        },
        {
          label: adminLabel('Trading platforms (/platforms)', '交易平台 (/platforms)', '交易平台 (/platforms)'),
          value: 'platforms'
        },
        {
          label: adminLabel('General', '一般', '一般'),
          value: 'general'
        }
      ]
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
      access: {update: fieldUpdateAccess('faqs', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
