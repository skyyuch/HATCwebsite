import type {CollectionConfig} from 'payload';

import {revalidateFundingMethods} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable deposit / withdrawal channels shown on `/funding` (Figma
 * deposit 75:5 + withdrawal 75:189, integrated into one page). Each document is
 * one table row; the `type` field routes it to the 入金 or 出金 table.
 *
 * ⚠️ Governance (第六十九輪, owner 2026-10-14): what is stored here is published as
 * HATC's **real** channel list — the front-end no longer labels it「示意數據」, so
 * anything typed in is live customer-facing operational information. Consequences:
 * - There is **no i18n fallback any more.** An empty list hides the whole table
 *   section rather than substituting sample rows (the retired seed listed
 *   Figma-template providers HATC does not offer).
 * - Every row must be filled **per locale** (繁中／简中／English). The row is
 *   localized, so leaving a locale empty falls back to 繁體中文 and pasting the
 *   same text into all three publishes e.g. simplified Chinese on the English
 *   site. Use the 「一鍵機器翻譯」button next to Save to draft the other locales.
 * - Processing times / fees are the owner's own operating data; they are NOT
 *   written into `HATC_FACTS.md` (they change and are not trading conditions).
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
      '⚠️ The REAL deposit/withdrawal channels published on /funding — there is no sample label and no fallback, so whatever you save here is what customers see. Use "Type" to route each row to the deposit or withdrawal table. Fill every row in all three locales (use the Machine-translate button next to Save); an empty list hides the whole table section.',
      '⚠️ 這是 /funding 上對外公布的正式出入金渠道表 —— 前台不再標示「示意數據」、也沒有預設資料，存進來的內容就是客戶看到的內容。用「類型」把每一列分到入金或出金表。每一列都要填三個語系（可用 Save 旁的「一鍵機器翻譯」產生草稿）；整張表留空則前台不顯示該區塊。',
      '⚠️ 这是 /funding 上对外公布的正式出入金渠道表 —— 前台不再标示「示意数据」、也没有默认数据，存进来的内容就是客户看到的内容。用「类型」把每一列分到入金或出金表。每一列都要填三个语系（可用 Save 旁的「一键机器翻译」生成草稿）；整张表留空则前台不显示该区块。'
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
      label: adminLabel('Processing time', '處理時間', '处理时间'),
      admin: {
        description: adminLabel(
          'Shown as typed. The page already notes that times are estimates affected by banks, payment providers and blockchain networks — do not phrase this as a guarantee.',
          '照字面顯示。頁面下方已註明處理時間為預估、受銀行／支付機構／區塊鏈網絡影響，請勿寫成保證到賬時限。',
          '照字面显示。页面下方已注明处理时间为预估、受银行／支付机构／区块链网络影响，请勿写成保证到账时限。'
        )
      }
    },
    {
      name: 'fee',
      type: 'text',
      localized: true,
      label: adminLabel('Fee', '手續費', '手续费'),
      admin: {
        description: adminLabel(
          'The fee HATC charges. Third-party bank / payment / network fees are excluded by the note under the table, so do not write「免任何費用」or imply there are no overnight or transfer charges.',
          '指華安泰昌收取的費用。第三方銀行／支付機構／區塊鏈費用已由表格下方說明排除，請勿寫「免任何費用」或暗示沒有隔夜利息／轉賬費用。',
          '指华安泰昌收取的费用。第三方银行／支付机构／区块链费用已由表格下方说明排除，请勿写「免任何费用」或暗示没有隔夜利息／转账费用。'
        )
      }
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
      label: adminLabel('Available currencies', '可選貨幣', '可选货币')
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
