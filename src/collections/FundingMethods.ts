import type {CollectionConfig} from 'payload';

import {revalidateFundingMethods} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable deposit / withdrawal channels shown on `/funding` (Figma
 * deposit 75:5 + withdrawal 75:189, integrated into one page). Each document is
 * one table row; the `type` field routes it to the 入金 or 出金 table.
 *
 * ⚠️ Governance: every channel, processing time, fee and currency here is
 * **SAMPLE / illustrative** — the front-end keeps the「示意數據」label and this is
 * NOT an approved fact nor an operational guarantee. Real available channels and
 * timelines are owner-supplied. When the database is not configured or the list
 * is empty, the reader falls back to i18n seeds (`funding.{deposit,withdraw}.methodsSample`).
 */
export const FundingMethods: CollectionConfig = {
  slug: 'funding-methods',
  labels: {
    singular: adminLabel('Funding channel', '出入金渠道', '出入金渠道'),
    plural: adminLabel('Funding channels', '出入金渠道表', '出入金渠道表')
  },
  access: contentCollectionAccess('funding-methods'),
  admin: {
    useAsTitle: 'method',
    defaultColumns: ['method', 'type', 'time', 'fee', 'free', 'order', 'enabled'],
    group: ADMIN_GROUPS.operations,
    description: adminLabel(
      '⚠️ SAMPLE deposit/withdrawal channels for /funding. Use "Type" to route each row to the deposit or withdrawal table. Method / time / fee / currencies are illustrative (front-end keeps the sample label), NOT approved facts or guarantees. Empty / no DB = i18n seed fallback.',
      '⚠️ /funding 的示意出入金渠道表。用「類型」把每一列分到入金或出金表。方式／處理時間／手續費／貨幣皆為示意數據（前台保留「示意數據」標示），非核可事實、非到賬承諾。無資料庫或留空＝i18n 預設。',
      '⚠️ /funding 的示意出入金渠道表。用「类型」把每一列分到入金或出金表。方式／处理时间／手续费／货币皆为示意数据（前台保留「示意数据」标示），非核可事实、非到账承诺。无数据库或留空＝i18n 默认。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => { revalidateFundingMethods(); }],
    afterDelete: [() => { revalidateFundingMethods(); }]
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'withdrawal',
      index: true,
      options: [
        {label: adminLabel('Deposit', '入金', '入金'), value: 'deposit'},
        {label: adminLabel('Withdrawal', '出金', '出金'), value: 'withdrawal'}
      ],
      label: adminLabel('Type', '類型', '类型'),
      admin: {
        description: adminLabel(
          'Deposit rows show in the 入金 table; withdrawal rows in the 出金 table.',
          '「入金」列顯示於入金表；「出金」列顯示於出金表。',
          '「入金」列显示于入金表；「出金」列显示于出金表。'
        )
      }
    },
    {
      name: 'method',
      type: 'text',
      required: true,
      localized: true,
      label: adminLabel('Method', '方式', '方式')
    },
    {
      name: 'time',
      type: 'text',
      localized: true,
      label: adminLabel('Processing time (sample)', '處理時間（示意）', '处理时间（示意）')
    },
    {
      name: 'fee',
      type: 'text',
      localized: true,
      label: adminLabel('Fee (sample)', '手續費（示意）', '手续费（示意）')
    },
    {
      name: 'free',
      type: 'checkbox',
      defaultValue: false,
      label: adminLabel(
        'Highlight fee as free (green)',
        '手續費標示為免費（綠色）',
        '手续费标示为免费（绿色）'
      )
    },
    {
      name: 'currencies',
      type: 'text',
      localized: true,
      label: adminLabel('Available currencies (sample)', '可選貨幣（示意）', '可选货币（示意）')
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
      access: {update: fieldUpdateAccess('funding-methods', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
