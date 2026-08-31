import type {GlobalConfig} from 'payload';

import {
  optionalText,
  optionalTextarea
} from '@/globals/fields/optionalLocalized';
import {revalidateProductsMarketing} from '@/lib/revalidateContent';
import {globalAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable /products marketing copy. Approved trading conditions
 * (gold 27 / silver 30 / 1:100) stay in `tradingConditions.ts` — this global
 * must never override those numbers.
 */
export const ProductsPage: GlobalConfig = {
  slug: 'products-page',
  label: adminLabel(
    'Products page',
    '產品／交易條件文案',
    '产品／交易条件文案'
  ),
  access: globalAccess('products-page'),
  admin: {
    group: ADMIN_GROUPS.pages,
    description: adminLabel(
      'Products-page marketing overrides. Approved spreads/leverage live in tradingConditions.ts — do not change numbers here. Empty = i18n default.',
      '產品頁行銷文案覆寫。核可點差／槓桿（金27／銀30／1:100）在程式碼 tradingConditions.ts，此處不得改數字。留空＝i18n 預設。',
      '产品页营销文案覆盖。核可点差／杠杆（金27／银30／1:100）在程序 tradingConditions.ts，此处不得改数字。留空＝i18n 默认。'
    )
  },
  hooks: {
    afterChange: [() => { revalidateProductsMarketing(); }]
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero',
      fields: [
        optionalText('heroTitleLead', '標題前段'),
        optionalText('heroTitleAccent', '標題強調'),
        optionalText('heroTitleTail', '標題尾段'),
        optionalTextarea('heroSubtitle', '副標')
      ]
    },
    {
      type: 'collapsible',
      label: '可交易產品',
      fields: [
        optionalText('listKicker', 'Kicker'),
        optionalText('listHeading', '標題'),
        optionalTextarea('listSubheading', '副標')
      ]
    },
    {
      type: 'collapsible',
      label: '交易條件（區塊 chrome）',
      fields: [
        optionalText('conditionsKicker', 'Kicker'),
        optionalText('conditionsHeading', '標題')
      ]
    },
    {
      type: 'collapsible',
      label: '信任帶',
      fields: [
        optionalText('credibilityKicker', 'Kicker'),
        optionalText('credibilityHeading', '標題')
      ]
    },
    {
      type: 'collapsible',
      label: '最終 CTA',
      fields: [
        optionalText('ctaHeading', '標題'),
        optionalTextarea('ctaBody', '說明')
      ]
    }
  ]
};
