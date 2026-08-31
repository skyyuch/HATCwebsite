import type {GlobalConfig} from 'payload';

import {
  optionalText,
  optionalTextarea
} from '@/globals/fields/optionalLocalized';
import {revalidateHomeMarketing} from '@/lib/revalidateContent';
import {globalAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable homepage marketing copy. Structure stays in code; empty fields
 * fall back to i18n seeds (`home.*`). Do not expose card grids / feature lists.
 */
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: adminLabel('Home page', '首頁文案', '首页文案'),
  access: globalAccess('home-page'),
  admin: {
    group: ADMIN_GROUPS.pages,
    description: adminLabel(
      'Homepage marketing overrides (hero / section intros / CTAs). Layout stays in code; empty = i18n default.',
      '首頁行銷文案覆寫。只開放 hero／區塊 intro／CTA；版面結構仍由程式控制。留空＝i18n 預設。',
      '首页营销文案覆盖。只开放 hero／区块 intro／CTA；版面结构仍由程序控制。留空＝i18n 默认。'
    )
  },
  hooks: {
    afterChange: [() => { revalidateHomeMarketing(); }]
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero',
      fields: [
        optionalText('heroBadge', '徽章'),
        optionalText('heroTitleLine1', '標題行 1'),
        optionalText('heroTitleBrand', '標題品牌名'),
        optionalText('heroTitleTail', '標題尾段'),
        optionalTextarea('heroSubtitle', '副標'),
        optionalText('heroCtaPrimary', '主 CTA')
      ]
    },
    {
      type: 'collapsible',
      label: '優質交易服務',
      fields: [
        optionalText('servicesKicker', 'Kicker'),
        optionalText('servicesHeading', '標題'),
        optionalText('servicesSubheading', '小標'),
        optionalTextarea('servicesBody', '說明'),
        optionalText('servicesCta', 'CTA')
      ]
    },
    {
      type: 'collapsible',
      label: 'MT5 平台',
      fields: [
        optionalText('mt5Kicker', 'Kicker'),
        optionalText('mt5Heading', '標題'),
        optionalText('mt5Subheading', '小標'),
        optionalTextarea('mt5Body', '說明'),
        optionalText('mt5CtaPrimary', '主 CTA'),
        optionalText('mt5CtaSecondary', '次 CTA')
      ]
    },
    {
      type: 'collapsible',
      label: '為什麼選擇 HATC',
      fields: [
        optionalText('whyKicker', 'Kicker'),
        optionalText('whyHeading', '標題')
      ]
    },
    {
      type: 'collapsible',
      label: '黃金學堂（區塊 chrome）',
      fields: [
        optionalText('academyKicker', 'Kicker'),
        optionalText('academyHeading', '標題')
      ]
    },
    {
      type: 'collapsible',
      label: '企業故事',
      fields: [
        optionalText('storyKicker', 'Kicker'),
        optionalText('storyHeading', '標題'),
        optionalTextarea('storyBody', '說明'),
        optionalText('storyCta', 'CTA')
      ]
    },
    {
      type: 'collapsible',
      label: '客戶支援',
      fields: [
        optionalText('supportKicker', 'Kicker'),
        optionalText('supportHeading', '標題'),
        optionalText('supportCta', 'CTA')
      ]
    },
    {
      type: 'collapsible',
      label: '最終 CTA',
      fields: [
        optionalText('finalHeading', '標題'),
        optionalTextarea('finalBody', '說明'),
        optionalText('finalCtaPrimary', '主 CTA'),
        optionalText('finalCtaSecondary', '次 CTA')
      ]
    }
  ]
};
