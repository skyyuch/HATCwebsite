import type {CollectionConfig} from 'payload';

import {revalidateTradingPlatforms} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable trading-platform cards shown on `/platforms` (Figma 89:4).
 * Each document is one platform tab (HATC app / web trader / MetaTrader 5).
 * `panelLabel` is the short badge overlaid on the device visual. `visual` is an
 * optional per-platform screenshot upload — when empty the front-end falls back
 * to the Figma template device mockup (labelled 示意). When the database is not
 * configured or the list is empty, the reader falls back to i18n seeds
 * (`platforms.types.items`).
 */
export const TradingPlatforms: CollectionConfig = {
  slug: 'trading-platforms',
  labels: {
    singular: adminLabel('Trading platform', '交易平台', '交易平台'),
    plural: adminLabel('Trading platforms', '交易平台', '交易平台')
  },
  access: contentCollectionAccess('trading-platforms'),
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'panelLabel', 'order', 'enabled'],
    group: ADMIN_GROUPS.operations,
    description: adminLabel(
      'Platform tabs for /platforms. Empty / no DB = i18n seed fallback.',
      '/platforms 的交易平台分頁。無資料庫或留空＝i18n 預設文案。',
      '/platforms 的交易平台分页。无数据库或留空＝i18n 默认文案。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => { revalidateTradingPlatforms(); }],
    afterDelete: [() => { revalidateTradingPlatforms(); }]
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: adminLabel('Name (tab label)', '名稱（分頁標籤）', '名称（分页标签）')
    },
    {
      name: 'panelLabel',
      type: 'text',
      label: adminLabel('Panel badge (e.g. MT5)', '卡面短標（如 MT5）', '卡面短标（如 MT5）'),
      admin: {
        description: adminLabel(
          'Short label drawn on the placeholder panel (not localised).',
          '畫在佔位卡面上的短標，不隨語系翻譯。',
          '画在占位卡面上的短标，不随语系翻译。'
        )
      }
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      label: adminLabel('Tagline (detail heading)', '標語（詳情標題）', '标语（详情标题）')
    },
    {
      name: 'desc',
      type: 'textarea',
      localized: true,
      label: adminLabel('Description', '說明', '说明')
    },
    {
      name: 'visual',
      type: 'upload',
      relationTo: 'media',
      label: adminLabel('Device screenshot', '平台截圖', '平台截图'),
      admin: {
        description: adminLabel(
          'Real platform/device screenshot. Empty = Figma sample mockup (labelled 示意).',
          '真實平台／裝置截圖。留空＝使用 Figma 示意裝置圖（前台標「示意」）。',
          '真实平台／设备截图。留空＝使用 Figma 示意设备图（前台标「示意」）。'
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
      access: {update: fieldUpdateAccess('trading-platforms', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
