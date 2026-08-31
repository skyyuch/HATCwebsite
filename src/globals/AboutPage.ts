import type {GlobalConfig} from 'payload';

import {
  optionalText,
  optionalTextarea
} from '@/globals/fields/optionalLocalized';
import {revalidateAboutMarketing} from '@/lib/revalidateContent';
import {globalAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable /about marketing copy. Structure stays in code; empty fields
 * fall back to i18n (`about.*`). Timeline item facts stay in FACTS / i18n seeds.
 */
export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: adminLabel('About page', '關於我們文案', '关于我们文案'),
  access: globalAccess('about-page'),
  admin: {
    group: ADMIN_GROUPS.pages,
    description: adminLabel(
      'About-page marketing overrides. Credentials / milestone facts stay in code / FACTS. Empty = i18n default.',
      '關於我們行銷文案覆寫。只開放 hero／區塊 intro／CTA；資質卡片與里程碑細節仍由程式／FACTS 控制。留空＝i18n 預設。',
      '关于我们营销文案覆盖。只开放 hero／区块 intro／CTA；资质卡片与里程碑细节仍由程序／FACTS 控制。留空＝i18n 默认。'
    )
  },
  hooks: {
    afterChange: [() => { revalidateAboutMarketing(); }]
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero',
      fields: [
        optionalText('heroTitleLead', '標題'),
        optionalTextarea('heroSubtitle', '副標')
      ]
    },
    {
      type: 'collapsible',
      label: '公司簡介',
      fields: [
        optionalText('identityKicker', 'Kicker'),
        optionalText('identityHeading', '標題')
      ]
    },
    {
      type: 'collapsible',
      label: '會員資格',
      fields: [
        optionalText('credentialsKicker', 'Kicker'),
        optionalText('credentialsHeading', '標題')
      ]
    },
    {
      type: 'collapsible',
      label: '服務理念',
      fields: [
        optionalText('principlesKicker', 'Kicker'),
        optionalText('principlesHeading', '標題')
      ]
    },
    {
      type: 'collapsible',
      label: '發展歷程',
      fields: [
        optionalText('timelineKicker', 'Kicker'),
        optionalText('timelineHeading', '標題')
      ]
    },
    {
      type: 'collapsible',
      label: '香港連結',
      fields: [
        optionalText('hongkongKicker', 'Kicker'),
        optionalText('hongkongHeadingLead', '標題前段'),
        optionalText('hongkongHeadingAccent', '標題強調'),
        optionalTextarea('hongkongBody', '說明')
      ]
    },
    {
      type: 'collapsible',
      label: '牌照／辦公室／榮譽',
      fields: [
        optionalText('galleryKicker', 'Kicker'),
        optionalText('galleryHeading', '標題')
      ]
    },
    {
      type: 'collapsible',
      label: '最終 CTA',
      fields: [
        optionalText('ctaHeading', '標題'),
        optionalTextarea('ctaBody', '說明'),
        optionalText('ctaSecondary', '次 CTA')
      ]
    }
  ]
};
