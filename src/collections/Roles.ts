import type {CollectionConfig} from 'payload';

import {isFullAccess} from '@/payload/access';
import {ADMIN_GROUPS, adminLabel} from '@/payload/adminLabels';
import {buildRolePermissionFields} from '@/payload/permissions/roleFields';

/**
 * CMS roles (Roles & Permissions v2). An administrator defines roles here and ticks
 * which resources / fields each role may act on. Managing this collection is locked
 * to **full-access administrators** (`isFullAccess`) so a delegated role can never
 * grant itself more power. See `src/payload/permissions/registry.ts`.
 */
export const Roles: CollectionConfig = {
  slug: 'roles',
  labels: {
    singular: adminLabel('Role', '角色', '角色'),
    plural: adminLabel('Roles', '角色', '角色')
  },
  access: {
    read: isFullAccess,
    create: isFullAccess,
    update: isFullAccess,
    delete: isFullAccess
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'fullAccess'],
    group: ADMIN_GROUPS.system,
    description: adminLabel(
      'CMS roles & permissions. Full access = administrator (all permissions). Otherwise tick per-resource / per-field permissions.',
      'CMS 角色與權限。全權＝管理員（所有權限）；否則逐資源／逐欄位勾選權限。',
      'CMS 角色与权限。全权＝管理员（所有权限）；否则逐资源／逐字段勾选权限。'
    )
  },
  hooks: {
    beforeChange: [
      async ({req, data, originalDoc, operation}) => {
        // Never allow removing full access from the last full-access role (lockout).
        if (
          operation === 'update' &&
          originalDoc?.fullAccess &&
          data.fullAccess === false
        ) {
          const others = await req.payload.count({
            collection: 'roles',
            where: {
              and: [
                {fullAccess: {equals: true}},
                {id: {not_equals: originalDoc.id}}
              ]
            }
          });
          if (others.totalDocs === 0) {
            throw new Error(
              '必須至少保留一個全權角色（管理員）。請先建立另一個全權角色再取消此角色的全權。'
            );
          }
        }
        return data;
      }
    ],
    beforeDelete: [
      async ({req, id}) => {
        // Block deleting a role still assigned to any user.
        const inUse = await req.payload.count({
          collection: 'users',
          where: {role: {equals: id}}
        });
        if (inUse.totalDocs > 0) {
          throw new Error(
            '此角色仍有使用者使用，請先將這些使用者改派其他角色後再刪除。'
          );
        }
        // Block deleting the last full-access role.
        const target = await req.payload.findByID({
          collection: 'roles',
          id,
          depth: 0,
          overrideAccess: true,
          req
        });
        if (target?.fullAccess) {
          const others = await req.payload.count({
            collection: 'roles',
            where: {
              and: [{fullAccess: {equals: true}}, {id: {not_equals: id}}]
            }
          });
          if (others.totalDocs === 0) {
            throw new Error('必須至少保留一個全權角色（管理員），無法刪除。');
          }
        }
      }
    ]
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      label: adminLabel('Role name', '角色名稱', '角色名称')
    },
    {
      name: 'fullAccess',
      type: 'checkbox',
      defaultValue: false,
      label: adminLabel(
        'Full access (administrator)',
        '全權（管理員）',
        '全权（管理员）'
      ),
      admin: {
        description: adminLabel(
          'Grants every permission and can manage roles & users. Ignores the matrix below.',
          '擁有所有權限，可管理角色與使用者；忽略下方細項。',
          '拥有所有权限，可管理角色与用户；忽略下方细项。'
        )
      }
    },
    ...buildRolePermissionFields()
  ]
};
