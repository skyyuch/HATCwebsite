import type {GlobalConfig} from 'payload';

import {revalidatePlatformsMarketing} from '@/lib/revalidateContent';
import {globalAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

/**
 * Owner-editable /platforms page assets. Currently just the hero device visual:
 * an optional upload that overrides the Figma sample mockup. Per-platform detail
 * screenshots live on the `trading-platforms` collection (`visual` field). Empty
 * = front-end uses the Figma sample device image (labelled 示意). Section copy
 * stays in i18n (`platforms.*`), so this global carries no localized text.
 */
export const PlatformsPage: GlobalConfig = {
  slug: 'platforms-page',
  label: adminLabel('Platforms page', '交易平台頁', '交易平台页'),
  access: globalAccess('platforms-page'),
  admin: {
    group: ADMIN_GROUPS.pages,
    description: adminLabel(
      'Trading-platforms page hero image. Per-platform screenshots are edited in "Trading platforms". Empty = Figma sample mockup.',
      '交易平台頁 hero 圖。各平台截圖請至「交易平台」集合編輯。留空＝使用 Figma 示意裝置圖。',
      '交易平台页 hero 图。各平台截图请至「交易平台」集合编辑。留空＝使用 Figma 示意设备图。'
    )
  },
  hooks: {
    afterChange: [() => { revalidatePlatformsMarketing(); }]
  },
  fields: [
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: adminLabel('Hero device visual', 'Hero 裝置圖', 'Hero 设备图'),
      admin: {
        description: adminLabel(
          'Multi-device showcase shown in the hero. Empty = Figma sample mockup (labelled 示意).',
          'Hero 右側的多裝置展示圖。留空＝使用 Figma 示意裝置圖（前台標「示意」）。',
          'Hero 右侧的多设备展示图。留空＝使用 Figma 示意设备图（前台标「示意」）。'
        )
      }
    }
  ]
};
