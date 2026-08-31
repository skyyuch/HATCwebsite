import type {GlobalConfig} from 'payload';

import {
  optionalText,
  optionalTextarea
} from '@/globals/fields/optionalLocalized';
import {revalidateTradingMarketing} from '@/lib/revalidateContent';
import {globalAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable /trading marketing copy. Structure stays in code; empty fields
 * fall back to i18n (`trading.*`). Sample tables are a separate global.
 */
export const TradingPage: GlobalConfig = {
  slug: 'trading-page',
  label: adminLabel('Trading page', '交易概覽文案', '交易概览文案'),
  access: globalAccess('trading-page'),
  admin: {
    group: ADMIN_GROUPS.pages,
    description: adminLabel(
      'Trading overview (/trading) marketing overrides. Edit sample tables under “Sample trading tables”. Empty = i18n default.',
      '「概覽」(/trading) 行銷文案覆寫。示意點差／帳戶表請改「示意交易條件」；留空＝i18n 預設。',
      '「概览」(/trading) 营销文案覆盖。示意点差／账户表请改「示意交易条件」；留空＝i18n 默认。'
    )
  },
  hooks: {
    afterChange: [() => { revalidateTradingMarketing(); }]
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero',
      fields: [
        optionalText('heroTitleLine1', '標題行 1'),
        optionalText('heroTitleLine2', '標題行 2'),
        optionalTextarea('heroSubtitle', '副標')
      ]
    },
    {
      type: 'collapsible',
      label: '交易服務',
      fields: [
        optionalText('servicesBadge', '徽章'),
        optionalText('servicesHeading', '標題'),
        optionalTextarea('servicesSubtitle', '副標')
      ]
    },
    {
      type: 'collapsible',
      label: '帳戶比較（區塊 chrome）',
      fields: [
        optionalText('accountsBadge', '徽章'),
        optionalText('accountsHeading', '標題'),
        optionalTextarea('accountsSubtitle', '副標')
      ]
    },
    {
      type: 'collapsible',
      label: '即時點差（區塊 chrome）',
      fields: [
        optionalText('pricingBadge', '徽章'),
        optionalText('pricingHeading', '標題'),
        optionalTextarea('pricingSubtitle', '副標'),
        optionalText('pricingCta', 'CTA')
      ]
    },
    {
      type: 'collapsible',
      label: 'FAQ（區塊 chrome）',
      fields: [
        optionalText('faqBadge', '徽章'),
        optionalText('faqHeading', '標題'),
        optionalTextarea('faqSubtitle', '副標')
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
