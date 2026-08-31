/**
 * Permission resource registry (Roles & Permissions v2).
 *
 * Single source of truth for **what can be permissioned** in the CMS. The Roles
 * collection builds its checkbox matrix from this list, and the access helpers in
 * `src/payload/access.ts` read the same keys off a role document.
 *
 * Governance / red lines:
 * - Front-end reads stay PUBLIC (SSG + i18n fallback). We therefore do NOT expose a
 *   "read" permission for content collections / globals whose `read` is public;
 *   only `users` (non-public read) exposes a read toggle.
 * - The `roles` collection itself is intentionally NOT listed here: managing roles
 *   is locked to full-access administrators (`isFullAccess`) in code, so a delegated
 *   role can never grant itself more power.
 * - Facts stay in `docs/HATC_FACTS.md`; approved trading conditions stay in
 *   `src/components/products/tradingConditions.ts`. Permissions only decide *who may
 *   edit in the CMS*, never what is true.
 *
 * MAINTENANCE: when you add/remove a collection, global, or a controllable field,
 * update this registry (and run `npm run generate:types`). Field-level entries also
 * require wiring `fieldUpdateAccess(slug, field)` onto the matching field config.
 */
import type {AdminLabel} from '@/payload/adminLabels';
import {adminLabel} from '@/payload/adminLabels';

export type PermOp = 'create' | 'read' | 'update' | 'delete';

export type PermField = {
  /** Field name as declared on the collection. */
  name: string;
  label: AdminLabel;
};

export type PermResource = {
  slug: string;
  kind: 'collection' | 'global';
  label: AdminLabel;
  /** Operations exposed as permission toggles for this resource. */
  ops: PermOp[];
  /**
   * Controllable fields (field-level, update). Editing one of these requires BOTH
   * the resource `update` permission AND an explicit per-field grant (deny by
   * default) — unless the role has full access.
   */
  fields?: PermField[];
};

const publishField: PermField = {
  name: 'enabled',
  label: adminLabel('Publish (enabled)', '上下架（啟用）', '上下架（启用）')
};

export const PERM_RESOURCES: PermResource[] = [
  {
    slug: 'home-activities',
    kind: 'collection',
    label: adminLabel('Home activities', '最新消息／活動', '最新消息／活动'),
    ops: ['create', 'update', 'delete'],
    fields: [publishField]
  },
  {
    slug: 'faqs',
    kind: 'collection',
    label: adminLabel('FAQs', '常見問題', '常见问题'),
    ops: ['create', 'update', 'delete'],
    fields: [publishField]
  },
  {
    slug: 'academy-articles',
    kind: 'collection',
    label: adminLabel('Academy articles', '黃金學堂', '黄金学堂'),
    ops: ['create', 'update', 'delete'],
    fields: [
      {name: 'slug', label: adminLabel('URL slug', '網址代稱', '网址代称')},
      publishField
    ]
  },
  {
    slug: 'instruments',
    kind: 'collection',
    label: adminLabel('Instruments (all products)', '交易產品列表', '交易产品列表'),
    ops: ['create', 'update', 'delete'],
    fields: [publishField]
  },
  {
    slug: 'account-tiers',
    kind: 'collection',
    label: adminLabel('Account tiers', '交易帳戶類型', '交易账户类型'),
    ops: ['create', 'update', 'delete'],
    fields: [publishField]
  },
  {
    slug: 'account-benefits',
    kind: 'collection',
    label: adminLabel('Account benefits', '帳戶優勢', '账户优势'),
    ops: ['create', 'update', 'delete'],
    fields: [publishField]
  },
  {
    slug: 'account-spreads',
    kind: 'collection',
    label: adminLabel('Account spreads', '帳戶點差表', '账户点差表'),
    ops: ['create', 'update', 'delete'],
    fields: [publishField]
  },
  {
    slug: 'account-platforms',
    kind: 'collection',
    label: adminLabel('Account platforms', '帳戶平台', '账户平台'),
    ops: ['create', 'update', 'delete'],
    fields: [publishField]
  },
  {
    slug: 'trading-platforms',
    kind: 'collection',
    label: adminLabel('Trading platforms', '交易平台', '交易平台'),
    ops: ['create', 'update', 'delete'],
    fields: [publishField]
  },
  {
    slug: 'funding-methods',
    kind: 'collection',
    label: adminLabel('Funding methods', '出金渠道表', '出金渠道表'),
    ops: ['create', 'update', 'delete'],
    fields: [publishField]
  },
  {
    slug: 'testimonials',
    kind: 'collection',
    label: adminLabel('Testimonials', '客戶見證', '客户见证'),
    ops: ['create', 'update', 'delete'],
    fields: [publishField]
  },
  {
    slug: 'media',
    kind: 'collection',
    label: adminLabel('Media library', '媒體庫', '媒体库'),
    ops: ['create', 'update', 'delete']
  },
  {
    slug: 'users',
    kind: 'collection',
    label: adminLabel('Users', '使用者', '用户'),
    ops: ['read', 'create', 'update', 'delete'],
    fields: [{name: 'role', label: adminLabel('Assign role', '指派角色', '指派角色')}]
  },
  {
    slug: 'site-settings',
    kind: 'global',
    label: adminLabel('Site settings', '網站營運設定', '网站运营设定'),
    ops: ['update']
  },
  {
    slug: 'home-page',
    kind: 'global',
    label: adminLabel('Home page copy', '首頁文案', '首页文案'),
    ops: ['update']
  },
  {
    slug: 'trading-page',
    kind: 'global',
    label: adminLabel('Trading page copy', '交易頁文案', '交易页文案'),
    ops: ['update']
  },
  {
    slug: 'about-page',
    kind: 'global',
    label: adminLabel('About page copy', '關於頁文案', '关于页文案'),
    ops: ['update']
  },
  {
    slug: 'products-page',
    kind: 'global',
    label: adminLabel('Products page copy', '產品頁文案', '产品页文案'),
    ops: ['update']
  },
  {
    slug: 'funding-page',
    kind: 'global',
    label: adminLabel('Funding page copy', '入金／出金頁文案', '入金／出金页文案'),
    ops: ['update']
  },
  {
    slug: 'platforms-page',
    kind: 'global',
    label: adminLabel('Platforms page assets', '交易平台頁圖片', '交易平台页图片'),
    ops: ['update']
  },
  {
    slug: 'sample-trading-conditions',
    kind: 'global',
    label: adminLabel('Sample trading tables', '示意交易條件表', '示意交易条件表'),
    ops: ['update']
  }
];

/** Slugs contain hyphens (`home-page`); field names must not, so sanitise. */
export const safeKey = (value: string): string => value.replace(/-/g, '_');

/** Checkbox key on a Role doc for a resource-level operation. */
export const permKey = (slug: string, op: PermOp): string =>
  `can__${safeKey(slug)}__${op}`;

/** Checkbox key on a Role doc for a field-level operation. */
export const fieldPermKey = (slug: string, field: string, op: PermOp): string =>
  `fld__${safeKey(slug)}__${safeKey(field)}__${op}`;
