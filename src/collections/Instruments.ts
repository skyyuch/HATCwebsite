import type {CollectionConfig} from 'payload';

import {revalidateInstruments} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable "all tradeable products" table shown on `/products/all`
 * (Vantage-style instrument list). Each document is one row.
 *
 * ⚠️ Governance: the numeric columns (contract size, spread, leverage, trading
 * hours) are **SAMPLE / illustrative** display values — the front-end keeps the
 * 「示意數據」label and they are NOT approved facts. Approved spreads/leverage
 * (gold 27 / silver 30 / 1:100) live in `src/components/products/tradingConditions.ts`
 * and are surfaced on `/products` — do not treat these editable cells as fact.
 * When the database is not configured, the reader falls back to i18n seeds
 * (`productsAll.sample.rows`).
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
      '⚠️ SAMPLE product table for /products/all. Contract size / spread / leverage / hours are illustrative (front-end keeps the sample label), NOT approved facts. Approved figures live in tradingConditions.ts. Empty / no DB = i18n seed fallback.',
      '⚠️ /products/all 的示意產品表。合約規模／點差／槓桿／時段皆為示意數據（前台保留「示意數據」標示），非核可事實。核可數字在程式碼 tradingConditions.ts。無資料庫或留空＝i18n 預設。',
      '⚠️ /products/all 的示意产品表。合约规模／点差／杠杆／时段皆为示意数据（前台保留「示意数据」标示），非核可事实。核可数字在程序 tradingConditions.ts。无数据库或留空＝i18n 默认。'
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
      label: adminLabel('Symbol / code', '代號（如 XAU/USD）', '代号（如 XAU/USD）')
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
      name: 'contractSize',
      type: 'text',
      label: adminLabel('Contract size (sample)', '合約規模（示意）', '合约规模（示意）')
    },
    {
      name: 'spread',
      type: 'text',
      label: adminLabel('Avg spread (sample)', '平均點差（示意）', '平均点差（示意）')
    },
    {
      name: 'leverage',
      type: 'text',
      label: adminLabel('Leverage (sample)', '槓桿（示意）', '杠杆（示意）')
    },
    {
      name: 'tradingHours',
      type: 'text',
      localized: true,
      label: adminLabel('Trading hours (sample)', '交易時段（示意）', '交易时段（示意）')
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
