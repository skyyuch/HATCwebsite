import type {CollectionConfig} from 'payload';

import {revalidateTestimonials} from '@/lib/revalidateContent';
import {contentCollectionAccess, fieldUpdateAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-managed client testimonials (surfaced on `/funding`, Figma 75:305).
 *
 * ⚠️ Governance red line: testimonials are real client statements and count as
 * company facts — they must NOT be fabricated. This collection is therefore
 * seeded with NOTHING in code; the front-end section is hidden until the owner
 * publishes genuine, review-approved testimonials in the CMS (mirrors the
 * news/activities "no fabricated seeds → neutral empty UI" policy).
 */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: adminLabel('Testimonial', '客戶見證', '客户见证'),
    plural: adminLabel('Testimonials', '客戶見證', '客户见证')
  },
  access: contentCollectionAccess('testimonials'),
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'authorTitle', 'order', 'enabled'],
    group: ADMIN_GROUPS.content,
    description: adminLabel(
      'Real, review-approved client testimonials. Do NOT invent quotes or people. Empty = the front-end testimonials section is hidden.',
      '真實、經審核的客戶見證。請勿虛構引言或人物。留空＝前台客戶見證區塊隱藏。',
      '真实、经审核的客户见证。请勿虚构引言或人物。留空＝前台客户见证区块隐藏。'
    )
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => { revalidateTestimonials(); }],
    afterDelete: [() => { revalidateTestimonials(); }]
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      localized: true,
      label: adminLabel('Quote', '引言', '引言')
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
      localized: true,
      label: adminLabel('Author name', '客戶姓名', '客户姓名')
    },
    {
      name: 'authorTitle',
      type: 'text',
      localized: true,
      label: adminLabel('Author title / role', '客戶身份', '客户身份')
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
      access: {update: fieldUpdateAccess('testimonials', 'enabled')},
      label: adminLabel('Enabled (show on site)', '啟用（顯示於前台）', '启用（显示于前台）')
    }
  ]
};
