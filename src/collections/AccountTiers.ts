import type {CollectionConfig} from 'payload';

import {revalidateAccountTiers} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable account-tier cards shown on `/accounts` (Figma 62:37). Each
 * document is one tier card.
 *
 * ⚠️ Governance: every spec (min deposit / spread / commission / leverage /
 * execution / platform) is **SAMPLE / illustrative** — the front-end keeps the
 * 「示意數據」label and these are NOT approved facts. Approved trading conditions
 * (gold 27 / silver 30 / 1:100) live in
 * `src/components/products/tradingConditions.ts` (surfaced on `/products`); do
 * not treat these editable cells as fact. When the database is not configured or
 * the list is empty, the reader falls back to i18n seeds (`accounts.tiersSample`).
 */
export const AccountTiers: CollectionConfig = {
  slug: 'account-tiers',
  labels: {
    singular: adminLabel('Account tier', '交易帳戶', '交易账户'),
    plural: adminLabel('Account tiers', '交易帳戶類型', '交易账户类型')
  },
  access: contentCollectionAccess('account-tiers'),
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'popular', 'order', 'enabled'],
    group: ADMIN_GROUPS.operations,
    description: adminLabel(
      '⚠️ SAMPLE account cards for /accounts. Min deposit / spread / commission / leverage / execution / platform are illustrative (front-end keeps the sample label), NOT approved facts. Approved figures live in tradingConditions.ts. Empty / no DB = i18n seed fallback.',
      '⚠️ /accounts 的示意帳戶卡。最低入金／點差／佣金／槓桿／執行方式／平台皆為示意數據（前台保留「示意數據」標示），非核可事實。核可數字在程式碼 tradingConditions.ts。無資料庫或留空＝i18n 預設。',
      '⚠️ /accounts 的示意账户卡。最低入金／点差／佣金／杠杆／执行方式／平台皆为示意数据（前台保留「示意数据」标示），非核可事实。核可数字在程序 tradingConditions.ts。无数据库或留空＝i18n 默认。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => { revalidateAccountTiers(); }],
    afterDelete: [() => { revalidateAccountTiers(); }]
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: adminLabel('Account name', '帳戶名稱', '账户名称')
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      label: adminLabel('Code (e.g. Standard STP)', '代號（如 Standard STP）', '代号（如 Standard STP）')
    },
    {
      name: 'badge',
      type: 'text',
      localized: true,
      label: adminLabel('Badge (e.g. Most popular)', '徽章（如 最受歡迎）', '徽章（如 最受欢迎）')
    },
    {
      name: 'popular',
      type: 'checkbox',
      defaultValue: false,
      label: adminLabel('Highlight as popular', '標示為推薦（金框）', '标示为推荐（金框）'),
      admin: {
        description: adminLabel(
          'Highlighted with a gold border. Use on at most one tier.',
          '以金色外框強調，建議最多一張卡開啟。',
          '以金色外框强调，建议最多一张卡开启。'
        )
      }
    },
    {
      name: 'desc',
      type: 'textarea',
      localized: true,
      label: adminLabel('Short description', '簡短說明', '简短说明')
    },
    {
      name: 'minDeposit',
      type: 'text',
      localized: true,
      label: adminLabel('Min deposit (sample)', '最低入金（示意）', '最低入金（示意）')
    },
    {
      name: 'spread',
      type: 'text',
      localized: true,
      label: adminLabel('Min spread (sample)', '最小點差（示意）', '最小点差（示意）')
    },
    {
      name: 'commission',
      type: 'text',
      localized: true,
      label: adminLabel('Commission / lot (sample)', '每手佣金（示意）', '每手佣金（示意）')
    },
    {
      name: 'leverage',
      type: 'text',
      localized: true,
      label: adminLabel('Leverage (sample)', '槓桿比例（示意）', '杠杆比例（示意）')
    },
    {
      name: 'execution',
      type: 'text',
      localized: true,
      label: adminLabel('Execution (sample)', '執行方式（示意）', '执行方式（示意）')
    },
    {
      name: 'platform',
      type: 'text',
      localized: true,
      label: adminLabel('Platforms (sample)', '支援平台（示意）', '支持平台（示意）')
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
      access: {update: fieldUpdateAccess('account-tiers', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
