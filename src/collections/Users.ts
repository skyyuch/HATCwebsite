import type {CollectionConfig} from 'payload';

import {
  canAccessAdmin,
  fieldUpdateAccess,
  opAccess,
  usersReadOrSelf,
  usersUpdateOrSelf
} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: adminLabel('User', '使用者', '用户'),
    plural: adminLabel('Users', '使用者', '用户')
  },
  auth: true,
  access: {
    // Any user with a role may enter the panel; capabilities are per-resource.
    admin: canAccessAdmin,
    // Full access / granted roles manage everyone; others see only themselves.
    read: usersReadOrSelf,
    update: usersUpdateOrSelf,
    create: opAccess('users', 'create'),
    delete: opAccess('users', 'delete')
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role'],
    group: ADMIN_GROUPS.system,
    description: adminLabel(
      'CMS login accounts. Each user is assigned a Role that decides their permissions.',
      '後台登入帳號。每個帳號指派一個「角色」決定其權限。',
      '后台登录账号。每个账号指派一个「角色」决定其权限。'
    )
  },
  hooks: {
    // The very first account bootstraps as the full-access administrator by
    // linking it to the seeded Administrator role (see payload.config `onInit`).
    beforeChange: [
      async ({req, operation, data}) => {
        if (operation === 'create' && !data.role) {
          const {totalDocs} = await req.payload.count({collection: 'users'});
          if (totalDocs === 0) {
            const adminRole = await req.payload.find({
              collection: 'roles',
              where: {fullAccess: {equals: true}},
              limit: 1,
              depth: 0,
              overrideAccess: true,
              req
            });
            if (adminRole.docs[0]) {
              data.role = adminRole.docs[0].id;
            }
          }
        }
        return data;
      }
    ]
  },
  fields: [
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'roles',
      saveToJWT: true,
      // Only full-access admins (or a role explicitly granted the field) may set /
      // change a user's role — prevents privilege self-escalation.
      access: {
        update: fieldUpdateAccess('users', 'role')
      },
      label: adminLabel('Role', '角色', '角色'),
      admin: {
        description: adminLabel(
          'The role assigned to this account. Manage roles under System → Roles.',
          '指派給此帳號的角色。角色於「系統 → 角色」管理。',
          '指派给此账号的角色。角色于「系统 → 角色」管理。'
        )
      }
    }
  ]
};
