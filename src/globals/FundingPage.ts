import type {GlobalConfig} from 'payload';

import {
  optionalText,
  optionalTextarea
} from '@/globals/fields/optionalLocalized';
import {revalidateFundingMarketing} from '@/lib/revalidateContent';
import {globalAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable /funding marketing copy (hero / deposit + withdrawal intro /
 * support topics / testimonials chrome / CTA). Structure stays in code; only copy
 * is overridable and empty fields fall back to the i18n seed (`funding.*`). The
 * deposit & withdrawal channel tables are one collection (`funding-methods`,
 * routed by `type`); testimonials are the `testimonials` collection — this global
 * only carries section chrome + optional background images.
 */
export const FundingPage: GlobalConfig = {
  slug: 'funding-page',
  label: adminLabel('Funding page', '入金／出金頁文案', '入金／出金页文案'),
  access: globalAccess('funding-page'),
  admin: {
    group: ADMIN_GROUPS.pages,
    description: adminLabel(
      'Deposit/withdrawal page marketing copy. Channels are edited in "Funding methods"; testimonials in "Testimonials". Empty = i18n default.',
      '入金／出金頁行銷文案。出金渠道請至「出金渠道表」編輯；客戶見證請至「客戶見證」編輯。留空＝i18n 預設。',
      '入金／出金页营销文案。出金渠道请至「出金渠道表」编辑；客户见证请至「客户见证」编辑。留空＝i18n 默认。'
    )
  },
  hooks: {
    afterChange: [() => { revalidateFundingMarketing(); }]
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
      label: '入金說明（intro）',
      fields: [
        optionalText('depositIntroHeading', '標題'),
        optionalTextarea('depositIntroBody', '說明')
      ]
    },
    {
      type: 'collapsible',
      label: '入金渠道（區塊 chrome）',
      fields: [
        optionalText('depositMethodsKicker', 'Kicker'),
        optionalText('depositMethodsHeading', '標題'),
        optionalTextarea('depositMethodsNote', '附註')
      ]
    },
    {
      type: 'collapsible',
      label: '出金說明（intro）',
      fields: [
        optionalText('withdrawIntroHeading', '標題'),
        optionalTextarea('withdrawIntroBody', '說明')
      ]
    },
    {
      type: 'collapsible',
      label: '出金渠道（區塊 chrome）',
      fields: [
        optionalText('withdrawMethodsKicker', 'Kicker'),
        optionalText('withdrawMethodsHeading', '標題'),
        optionalTextarea('withdrawMethodsNote', '附註')
      ]
    },
    {
      type: 'collapsible',
      label: '支援主題（區塊 chrome）',
      fields: [
        optionalText('topicsKicker', 'Kicker'),
        optionalText('topicsHeading', '標題'),
        optionalTextarea('topicsSubtitle', '副標')
      ]
    },
    {
      type: 'collapsible',
      label: '客戶見證（區塊 chrome）',
      fields: [
        optionalText('testimonialsKicker', 'Kicker'),
        optionalText('testimonialsHeading', '標題'),
        optionalTextarea('testimonialsSubtitle', '副標')
      ]
    },
    {
      type: 'collapsible',
      label: '最終 CTA',
      fields: [
        optionalText('ctaHeading', '標題'),
        optionalTextarea('ctaBody', '說明')
      ]
    },
    {
      type: 'collapsible',
      label: '背景圖片（可選）',
      fields: [
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
          label: adminLabel('Hero background', 'Hero 背景圖', 'Hero 背景图'),
          admin: {
            description: adminLabel(
              'Optional. Empty = built-in placeholder image.',
              '選填。留空＝使用內建佔位圖。',
              '选填。留空＝使用内建占位图。'
            )
          }
        },
        {
          name: 'depositImage',
          type: 'upload',
          relationTo: 'media',
          label: adminLabel('Deposit visual', '入金說明配圖', '入金说明配图'),
          admin: {
            description: adminLabel(
              'Optional. Empty = built-in placeholder image.',
              '選填。留空＝使用內建佔位圖。',
              '选填。留空＝使用内建占位图。'
            )
          }
        },
        {
          name: 'withdrawImage',
          type: 'upload',
          relationTo: 'media',
          label: adminLabel('Withdrawal visual', '出金說明配圖', '出金说明配图'),
          admin: {
            description: adminLabel(
              'Optional. Empty = built-in placeholder image.',
              '選填。留空＝使用內建佔位圖。',
              '选填。留空＝使用内建占位图。'
            )
          }
        },
        {
          name: 'ctaImage',
          type: 'upload',
          relationTo: 'media',
          label: adminLabel('CTA background', 'CTA 背景圖', 'CTA 背景图'),
          admin: {
            description: adminLabel(
              'Optional. Empty = built-in placeholder image.',
              '選填。留空＝使用內建佔位圖。',
              '选填。留空＝使用内建占位图。'
            )
          }
        }
      ]
    }
  ]
};
