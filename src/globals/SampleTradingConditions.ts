import type {GlobalConfig} from 'payload';

import {revalidateSampleTradingConditions} from '@/lib/revalidateContent';
import {globalAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

const CELL_TYPES = [
  {label: adminLabel('Pending', '待確認 (pending)', '待确认 (pending)'), value: 'pending'},
  {label: adminLabel('Text', '文字', '文字'), value: 'text'},
  {label: adminLabel('Check', '勾選', '勾选'), value: 'check'},
  {label: adminLabel('Priority check', '優先勾選', '优先勾选'), value: 'priority'},
  {label: adminLabel('Dash', '破折號', '破折号'), value: 'dash'}
] as const;

/**
 * SAMPLE trading-condition display tables for /trading.
 *
 * ⚠️ Illustrative only — UI must keep the「示意數據」label.
 * Approved facts (gold 27 / silver 30 / leverage 1:100) live in
 * `src/components/products/tradingConditions.ts` and MUST NOT be overwritten here.
 * Empty arrays fall back to `sampleTradingData.ts` seeds.
 */
export const SampleTradingConditions: GlobalConfig = {
  slug: 'sample-trading-conditions',
  label: adminLabel(
    'Sample trading tables',
    '示意交易條件表',
    '示意交易条件表'
  ),
  access: globalAccess('sample-trading-conditions'),
  admin: {
    group: ADMIN_GROUPS.operations,
    description: adminLabel(
      '⚠️ SAMPLE data only (not approved facts). Front-end keeps the sample label. Approved spreads/leverage live on /products (tradingConditions.ts). Empty arrays = sampleTradingData seeds.',
      '⚠️ 示意數據（非核可事實）。前台仍標「示意數據」。核可點差／槓桿在 /products（tradingConditions.ts），此處不得覆蓋。陣列留空＝程式碼 sampleTradingData 預設。',
      '⚠️ 示意数据（非核可事实）。前台仍标「示意数据」。核可点差／杠杆在 /products（tradingConditions.ts），此处不得覆盖。数组留空＝程序 sampleTradingData 默认。'
    )
  },
  hooks: {
    afterChange: [() => { revalidateSampleTradingConditions(); }]
  },
  fields: [
    {
      name: 'pricingRows',
      type: 'array',
      label: '即時點差示意表',
      labels: {singular: '報價列', plural: '報價列'},
      admin: {
        description: 'bid／ask／spread／change 皆為示意數字，上線前由業主替換。'
      },
      fields: [
        {name: 'symbol', type: 'text', required: true, label: '代碼（如 XAU / USD）'},
        {
          name: 'nameKey',
          type: 'select',
          required: true,
          label: '名稱鍵（對應 i18n trading.pricing.names）',
          options: [
            {label: '倫敦金', value: 'londonGold'},
            {label: '公斤條 HKD', value: 'kilobarHkd'}
          ]
        },
        {name: 'bid', type: 'text', required: true, label: 'Bid（示意）'},
        {name: 'ask', type: 'text', required: true, label: 'Ask（示意）'},
        {name: 'spread', type: 'text', required: true, label: '點差（示意）'},
        {name: 'change', type: 'text', required: true, label: '漲跌（示意）'}
      ]
    },
    {
      name: 'accountRows',
      type: 'array',
      label: '帳戶比較示意表',
      labels: {singular: '比較列', plural: '比較列'},
      admin: {
        description:
          '雙帳戶比較為示意格式。rowKey 對應 i18n trading.accounts.rows.*；type=text 時填 value（localized）。'
      },
      fields: [
        {
          name: 'rowKey',
          type: 'text',
          required: true,
          label: '列鍵（如 minDeposit、spread）',
          admin: {
            description: '必須對應 trading.accounts.rows.<key> 的 i18n 標籤鍵。'
          }
        },
        {
          type: 'group',
          name: 'standard',
          label: '標準帳戶',
          fields: [
            {
              name: 'type',
              type: 'select',
              required: true,
              defaultValue: 'pending',
              options: [...CELL_TYPES],
              label: '儲存格類型'
            },
            {
              name: 'value',
              type: 'text',
              localized: true,
              label: '文字值（type=text 時）',
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'text',
                description: '留空且 type=text 時，前台回退 i18n（若有對應鍵）。'
              }
            },
            {
              name: 'textKey',
              type: 'text',
              label: 'i18n 鍵備援（type=text，選填）',
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'text',
                description: '對應 trading.accounts.<textKey>；value 優先。'
              }
            }
          ]
        },
        {
          type: 'group',
          name: 'professional',
          label: '專業帳戶',
          fields: [
            {
              name: 'type',
              type: 'select',
              required: true,
              defaultValue: 'pending',
              options: [...CELL_TYPES],
              label: '儲存格類型'
            },
            {
              name: 'value',
              type: 'text',
              localized: true,
              label: '文字值（type=text 時）',
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'text'
              }
            },
            {
              name: 'textKey',
              type: 'text',
              label: 'i18n 鍵備援（type=text，選填）',
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'text'
              }
            }
          ]
        }
      ]
    }
  ]
};
