import type {GlobalConfig} from 'payload';

import {revalidateSiteSettings} from '@/lib/revalidateContent';
import {globalAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Operational links (customer service / contact) are configured here, never
 * hard-coded in the app (see .cursor/rules/hatc-website.mdc).
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: adminLabel('Site settings', '網站營運設定', '网站运营设定'),
  access: globalAccess('site-settings'),
  admin: {
    group: ADMIN_GROUPS.operations,
    description: adminLabel(
      'Customer-service / contact operational links.',
      '客服／聯絡連結等營運性設定。',
      '客服／联络链接等运营性设定。'
    )
  },
  hooks: {
    afterChange: [() => { revalidateSiteSettings(); }]
  },
  fields: [
    {
      type: 'collapsible',
      label: adminLabel('Contact', '客服／聯絡', '客服／联络'),
      fields: [
        {
          name: 'whatsapp',
          type: 'text',
          label: adminLabel('WhatsApp number', 'WhatsApp 號碼', 'WhatsApp 号码')
        },
        {name: 'phone', type: 'text', label: adminLabel('Phone', '電話', '电话')},
        {name: 'email', type: 'email', label: 'Email'},
        {
          name: 'liveChatUrl',
          type: 'text',
          label: adminLabel('Live chat URL', '線上客服連結 (URL)', '在线客服链接 (URL)')
        }
      ]
    }
  ]
};
