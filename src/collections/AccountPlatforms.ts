import type {CollectionConfig} from 'payload';

import {revalidateAccountPlatforms} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable supported-platform cards shown on `/accounts` (Figma 62:235).
 * Each document is one platform card. `panelLabel` is the short badge drawn on
 * the branded gradient placeholder (no fake screenshots — red line). When the
 * database is not configured or the list is empty, the reader falls back to i18n
 * seeds (`accounts.platforms.items`).
 */
export const AccountPlatforms: CollectionConfig = {
  slug: 'account-platforms',
  labels: {
    singular: adminLabel('Platform', '交易平台', '交易平台'),
    plural: adminLabel('Account platforms', '帳戶平台', '账户平台')
  },
  access: contentCollectionAccess('account-platforms'),
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'panelLabel', 'order', 'enabled'],
    group: ADMIN_GROUPS.operations,
    description: adminLabel(
      'Supported-platform cards for /accounts. Empty / no DB = i18n seed fallback.',
      '/accounts 的支援平台卡。無資料庫或留空＝i18n 預設文案。',
      '/accounts 的支持平台卡。无数据库或留空＝i18n 默认文案。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => { revalidateAccountPlatforms(); }],
    afterDelete: [() => { revalidateAccountPlatforms(); }]
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: adminLabel('Name', '名稱', '名称')
    },
    {
      name: 'desc',
      type: 'textarea',
      localized: true,
      label: adminLabel('Description', '說明', '说明')
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
      access: {update: fieldUpdateAccess('account-platforms', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
