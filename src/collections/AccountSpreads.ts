import type {CollectionConfig} from 'payload';

import {revalidateAccountSpreads} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable spreads-preview rows shown on `/accounts` (Figma 62:200). Each
 * document is one product row.
 *
 * ⚠️ Governance: every bid / ask / spread here is **SAMPLE / illustrative** — the
 * front-end keeps the「示意數據」label and this is NOT a live feed nor an approved
 * fact. Approved average spreads (gold 27 / silver 30) live in
 * `src/components/products/tradingConditions.ts` (surfaced on `/products`). When
 * the database is not configured or the list is empty, the reader falls back to
 * i18n seeds (`accounts.spreadsSample`).
 */
export const AccountSpreads: CollectionConfig = {
  slug: 'account-spreads',
  labels: {
    singular: adminLabel('Spread row', '帳戶點差列', '账户点差列'),
    plural: adminLabel('Account spreads', '帳戶點差表', '账户点差表')
  },
  access: contentCollectionAccess('account-spreads'),
  admin: {
    useAsTitle: 'pair',
    defaultColumns: ['pair', 'bid', 'ask', 'spread', 'order', 'enabled'],
    group: ADMIN_GROUPS.operations,
    description: adminLabel(
      '⚠️ SAMPLE spreads preview for /accounts. Bid / ask / spread are illustrative (front-end keeps the sample label), NOT a live feed or approved fact. Approved average spreads live in tradingConditions.ts. Empty / no DB = i18n seed fallback.',
      '⚠️ /accounts 的示意點差表。買入／賣出／點差皆為示意數據（前台保留「示意數據」標示），非即時行情、非核可事實。核可平均點差在程式碼 tradingConditions.ts。無資料庫或留空＝i18n 預設。',
      '⚠️ /accounts 的示意点差表。买入／卖出／点差皆为示意数据（前台保留「示意数据」标示），非即时行情、非核可事实。核可平均点差在程序 tradingConditions.ts。无数据库或留空＝i18n 默认。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => { revalidateAccountSpreads(); }],
    afterDelete: [() => { revalidateAccountSpreads(); }]
  },
  fields: [
    {
      name: 'pair',
      type: 'text',
      required: true,
      localized: true,
      label: adminLabel('Pair', '交易對', '交易对')
    },
    {
      name: 'bid',
      type: 'text',
      label: adminLabel('Bid (sample)', '買入價（示意）', '买入价（示意）')
    },
    {
      name: 'ask',
      type: 'text',
      label: adminLabel('Ask (sample)', '賣出價（示意）', '卖出价（示意）')
    },
    {
      name: 'spread',
      type: 'text',
      localized: true,
      label: adminLabel('Spread (sample)', '平均點差（示意）', '平均点差（示意）')
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
      access: {update: fieldUpdateAccess('account-spreads', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
