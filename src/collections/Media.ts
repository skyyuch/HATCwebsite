import type {CollectionConfig} from 'payload';

import {opAccess, publicRead} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: adminLabel('Media', '媒體', '媒体'),
    plural: adminLabel('Media', '媒體', '媒体')
  },
  access: {
    read: publicRead,
    // Upload / replace / delete are governed by the role permission matrix
    // (System → Roles → Media library).
    create: opAccess('media', 'create'),
    update: opAccess('media', 'update'),
    delete: opAccess('media', 'delete')
  },
  admin: {
    group: ADMIN_GROUPS.system,
    description: adminLabel(
      'Uploaded images and files used across the site.',
      '全站共用的圖片與檔案。',
      '全站共用的图片与文件。'
    )
  },
  upload: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      label: adminLabel('Alt text', '替代文字', '替代文本')
    }
  ]
};
