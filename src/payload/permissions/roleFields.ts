/**
 * Builds the Roles collection permission matrix from the resource registry.
 *
 * One collapsible per resource (initially collapsed, hidden when `fullAccess` is
 * ticked) containing a row of operation checkboxes, plus an optional field-level
 * sub-group. All checkbox keys match `permKey` / `fieldPermKey` so the access
 * helpers can read them directly off a Role document.
 */
import type {Field} from 'payload';

import {adminLabel} from '@/payload/adminLabels';
import type {PermOp} from './registry';
import {PERM_RESOURCES, fieldPermKey, permKey} from './registry';

const OP_LABEL: Record<PermOp, ReturnType<typeof adminLabel>> = {
  create: adminLabel('Create', '新增', '新增'),
  read: adminLabel('Read', '讀取', '读取'),
  update: adminLabel('Update', '更新', '更新'),
  delete: adminLabel('Delete', '刪除', '删除')
};

/** Hide the matrix entirely when the role has full access. */
const hideWhenFullAccess = (data: Record<string, unknown> | undefined): boolean =>
  !Boolean(data?.fullAccess);

export function buildRolePermissionFields(): Field[] {
  return PERM_RESOURCES.map((res): Field => {
    const opChecks: Field[] = res.ops.map((op) => ({
      name: permKey(res.slug, op),
      type: 'checkbox',
      label: OP_LABEL[op],
      admin: {width: '25%'}
    }));

    const inner: Field[] = [{type: 'row', fields: opChecks}];

    if (res.fields?.length) {
      const fieldChecks: Field[] = res.fields.map((f) => ({
        name: fieldPermKey(res.slug, f.name, 'update'),
        type: 'checkbox',
        label: f.label,
        admin: {
          width: '50%',
          description: adminLabel(
            'Also requires this resource\u2019s Update permission.',
            '需同時具備此資源的「更新」權限。',
            '需同时具备此资源的「更新」权限。'
          )
        }
      }));
      inner.push({
        type: 'collapsible',
        label: adminLabel('Field-level (update)', '欄位級（更新）', '字段级（更新）'),
        admin: {initCollapsed: true},
        fields: [{type: 'row', fields: fieldChecks}]
      });
    }

    return {
      type: 'collapsible',
      label: res.label,
      admin: {
        initCollapsed: true,
        condition: (data) => hideWhenFullAccess(data as Record<string, unknown>)
      },
      fields: inner
    };
  });
}
