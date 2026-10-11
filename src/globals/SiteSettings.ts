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
    },
    {
      type: 'collapsible',
      label: adminLabel('Accounts', '帳戶入口', '账户入口'),
      fields: [
        {
          name: 'openAccountUrl',
          type: 'text',
          label: adminLabel(
            'Open-account (registration) URL',
            '開戶（註冊）連結 (URL)',
            '开户（注册）链接 (URL)'
          ),
          admin: {
            description: adminLabel(
              'Destination of every "Open account" button. Leave empty to fall back to the customer-service link.',
              '全站「立即開戶」按鈕的目的地。留空＝退回使用上方的客服連結。',
              '全站「立即开户」按钮的目的地。留空＝退回使用上方的客服链接。'
            )
          }
        },
        {
          name: 'demoAccountUrl',
          type: 'text',
          label: adminLabel(
            'Demo account application URL',
            '模擬帳戶申請連結 (URL)',
            '模拟账户申请链接 (URL)'
          ),
          admin: {
            description: adminLabel(
              'Leave empty to hide the demo-account buttons across the site.',
              '留空＝全站隱藏「申請模擬帳戶」按鈕（不做死連結）。',
              '留空＝全站隐藏「申请模拟账户」按钮（不做死链接）。'
            )
          }
        },
        {
          name: 'memberLoginUrl',
          type: 'text',
          label: adminLabel(
            'Member login URL',
            '會員登入連結 (URL)',
            '会员登录链接 (URL)'
          ),
          admin: {
            description: adminLabel(
              'Destination of the header "Log in" link. Leave empty to hide it.',
              '頁首「登入」連結的目的地（例如交易端登入頁）。留空＝隱藏該連結。',
              '页首「登录」链接的目的地（例如交易端登录页）。留空＝隐藏该链接。'
            )
          }
        }
      ]
    }
  ]
};
