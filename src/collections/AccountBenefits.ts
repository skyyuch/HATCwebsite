import type {CollectionConfig} from 'payload';

import {revalidateAccountBenefits} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable core-benefit cards shown on `/accounts` (Figma 62:171). Each
 * document is one benefit card; the icon is chosen from a fixed set so the
 * front-end never renders an unknown glyph. When the database is not configured
 * or the list is empty, the reader falls back to i18n seeds
 * (`accounts.benefits.items`).
 */
export const AccountBenefits: CollectionConfig = {
  slug: 'account-benefits',
  labels: {
    singular: adminLabel('Account benefit', '帳戶優勢', '账户优势'),
    plural: adminLabel('Account benefits', '帳戶優勢', '账户优势')
  },
  access: contentCollectionAccess('account-benefits'),
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'icon', 'order', 'enabled'],
    group: ADMIN_GROUPS.operations,
    description: adminLabel(
      'Core benefit cards for /accounts. Empty / no DB = i18n seed fallback.',
      '/accounts 的核心優勢卡。無資料庫或留空＝i18n 預設文案。',
      '/accounts 的核心优势卡。无数据库或留空＝i18n 默认文案。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => { revalidateAccountBenefits(); }],
    afterDelete: [() => { revalidateAccountBenefits(); }]
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
      name: 'desc',
      type: 'textarea',
      localized: true,
      label: adminLabel('Description', '說明', '说明')
    },
    {
      name: 'icon',
      type: 'select',
      required: true,
      defaultValue: 'percent',
      label: adminLabel('Icon', '圖示', '图示'),
      options: [
        {label: adminLabel('Percent', '百分比', '百分比'), value: 'percent'},
        {label: adminLabel('Lightning', '閃電', '闪电'), value: 'zap'},
        {label: adminLabel('Card', '卡片', '卡片'), value: 'creditCard'},
        {label: adminLabel('Monitor', '螢幕', '屏幕'), value: 'monitor'}
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
      access: {update: fieldUpdateAccess('account-benefits', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
