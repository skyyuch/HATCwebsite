import type {CollectionConfig} from 'payload';

import {revalidateInstruments} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable "all tradeable products" table shown on `/products/all`
 * (Vantage-style instrument list). Each document is one row.
 *
 * ⚠️ Governance (owner 2026-10-11): contract size, spread, leverage and trading
 * hours are APPROVED FACTS (docs/HATC_FACTS.md) and therefore are NOT fields on
 * this collection — they come from `src/components/products/tradingConditions.ts`
 * so the admin UI cannot edit them. This collection owns presentation only:
 * display name, grouping, order and whether a row shows.
 *
 * The three approved products always render, with or without a document here;
 * a document matching an approved symbol just overrides its presentation. A
 * document with any other symbol is treated as a product whose conditions are
 * not approved yet, and its condition cells render "將另行公佈".
 */
export const Instruments: CollectionConfig = {
  slug: 'instruments',
  labels: {
    singular: adminLabel('Instrument', '交易產品', '交易产品'),
    plural: adminLabel('Instruments', '交易產品列表', '交易产品列表')
  },
  access: contentCollectionAccess('instruments'),
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'symbol', 'category', 'order', 'enabled'],
    group: ADMIN_GROUPS.operations,
    description: adminLabel(
      'Presentation of the /products/all table. Contract size, spread, leverage and trading hours are approved facts held in code and cannot be edited here. The three approved products (XAU/USD, XAG/USD, RKG/CNH) always appear; a document with a matching symbol only overrides its name, grouping and order. A document with any other symbol renders its conditions as "to be announced" until the owner approves them.',
      '/products/all 表格的顯示設定。合約規模／點差／槓桿／交易時段為已核可事實，由程式碼管理，無法在此編輯。三個核可產品（XAU/USD、XAG/USD、RKG/CNH）一律顯示；符號相同的文件只會覆寫其名稱、分類與排序。使用其他符號新增的產品，其交易條件會顯示「將另行公佈」，直到業主核可。',
      '/products/all 表格的显示设置。合约规模／点差／杠杆／交易时段为已核可事实，由程序管理，无法在此编辑。三个核可产品（XAU/USD、XAG/USD、RKG/CNH）一律显示；符号相同的文档只会覆写其名称、分类与排序。使用其他符号新增的产品，其交易条件会显示「将另行公布」，直到业主核可。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => { revalidateInstruments(); }],
    afterDelete: [() => { revalidateInstruments(); }]
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: adminLabel('Product name', '產品名稱', '产品名称')
    },
    {
      name: 'symbol',
      type: 'text',
      required: true,
      label: adminLabel('Symbol / code', '代號（如 XAU/USD）', '代号（如 XAU/USD）'),
      admin: {
        description: adminLabel(
          'Use XAU/USD, XAG/USD or RKG/CNH to restyle an approved product. Any other symbol creates a product with no approved trading conditions.',
          '填 XAU/USD、XAG/USD 或 RKG/CNH 即為調整該核可產品的顯示方式；填其他代號則會新增一個尚無核可交易條件的產品。',
          '填 XAU/USD、XAG/USD 或 RKG/CNH 即为调整该核可产品的显示方式；填其他代号则会新增一个尚无核可交易条件的产品。'
        )
      }
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'metals',
      label: adminLabel('Category', '分類', '分类'),
      admin: {
        description: adminLabel(
          'Rows are grouped by category on the page.',
          '前台依分類分組顯示。',
          '前台依分类分组显示。'
        )
      },
      options: [
        {label: adminLabel('Precious metals', '貴金屬', '贵金属'), value: 'metals'},
        {label: adminLabel('Forex', '外匯', '外汇'), value: 'forex'},
        {label: adminLabel('Indices', '指數', '指数'), value: 'indices'},
        {label: adminLabel('Energy', '能源', '能源'), value: 'energy'},
        {label: adminLabel('Other', '其他', '其他'), value: 'other'}
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
      access: {update: fieldUpdateAccess('instruments', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
