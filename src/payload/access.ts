/**
 * Shared Payload access-control helpers (Roles & Permissions v2).
 *
 * Each user links to a `roles` document (`Users.role` relationship). A role either
 * has `fullAccess` (superuser / administrator) or a matrix of per-resource and
 * per-field permission checkboxes (keys from `permissions/registry.ts`). These
 * helpers only decide **who may edit in the CMS** — they never change what is true
 * (facts live in `docs/HATC_FACTS.md`; approved trading conditions in
 * `src/components/products/tradingConditions.ts`).
 *
 * Front-end reads stay open (`publicRead`) so the site keeps working with or without
 * a database (SSG + i18n fallback). Managing the `roles` collection itself is locked
 * to full-access administrators (`isFullAccess`) so a delegated role can never
 * escalate its own privileges.
 */
import type {Access, FieldAccess, PayloadRequest} from 'payload';

import {fieldPermKey, permKey} from './permissions/registry';
import type {PermOp} from './permissions/registry';

type RoleDoc = {
  id: string | number;
  fullAccess?: boolean | null;
} & Record<string, unknown>;

const ROLE_CACHE = Symbol.for('hatc.roleCache');

/**
 * Resolve the current user's role document, memoised per request. Uses
 * `overrideAccess` when fetching so reading a role never recurses through this
 * same access layer.
 */
export async function loadRole(req: PayloadRequest): Promise<RoleDoc | null> {
  const user = req?.user as {id?: string | number; role?: unknown} | null | undefined;
  if (!user) return null;

  const cacheHost = req as unknown as Record<PropertyKey, unknown>;
  const cached = cacheHost[ROLE_CACHE] as Promise<RoleDoc | null> | undefined;
  if (cached) return cached;

  const resolved = (async (): Promise<RoleDoc | null> => {
    const ref = user.role;
    if (!ref) return null;
    if (typeof ref === 'object') return ref as RoleDoc;
    try {
      const doc = await req.payload.findByID({
        collection: 'roles',
        id: ref as string | number,
        depth: 0,
        overrideAccess: true,
        req
      });
      return (doc as unknown as RoleDoc) ?? null;
    } catch {
      return null;
    }
  })();

  cacheHost[ROLE_CACHE] = resolved;
  return resolved;
}

function allow(role: RoleDoc | null, slug: string, op: PermOp): boolean {
  if (!role) return false;
  if (role.fullAccess) return true;
  return role[permKey(slug, op)] === true;
}

/** Public read — front-end consumers and SSG fallback. */
export const publicRead: Access = () => true;

/** Full-access administrators only (used to lock down the Roles collection). */
export const isFullAccess: Access = async ({req}) =>
  Boolean((await loadRole(req))?.fullAccess);

/**
 * Panel entry: any authenticated user that has a role assigned may open `/admin`
 * (what they can actually do is governed per-resource below). Users without a role
 * are denied until an administrator assigns one. Must resolve to a boolean.
 */
export const canAccessAdmin = async ({
  req
}: {
  req: PayloadRequest;
}): Promise<boolean> => (await loadRole(req)) != null;

/** Resource-level operation access driven by the role permission matrix. */
export const opAccess =
  (slug: string, op: PermOp): Access =>
  async ({req}) =>
    allow(await loadRole(req), slug, op);

/**
 * Boolean permission check for use outside collection/global `access` configs
 * (e.g. custom endpoints). Mirrors `opAccess(slug, op)` — full-access roles pass,
 * others need the matching matrix checkbox.
 */
export async function hasResourcePermission(
  req: PayloadRequest,
  slug: string,
  op: PermOp
): Promise<boolean> {
  return allow(await loadRole(req), slug, op);
}

/**
 * Boolean full-access check for use outside collection/global `access` configs
 * (e.g. custom endpoints). Mirrors the `isFullAccess` Access helper.
 */
export async function hasFullAccess(req: PayloadRequest): Promise<boolean> {
  return Boolean((await loadRole(req))?.fullAccess);
}

/** Standard content-collection access: public read + matrix-driven writes. */
export const contentCollectionAccess = (slug: string) => ({
  read: publicRead,
  create: opAccess(slug, 'create'),
  update: opAccess(slug, 'update'),
  delete: opAccess(slug, 'delete')
});

/** Standard global access: public read + matrix-driven update. */
export const globalAccess = (slug: string) => ({
  read: publicRead,
  update: opAccess(slug, 'update')
});

/**
 * Users read: full-access admins and roles granted `users.read` see everyone; any
 * other authenticated user is limited to their own record (so they can still edit
 * their own email / password).
 */
export const usersReadOrSelf: Access = async ({req}) => {
  const role = await loadRole(req);
  if (role?.fullAccess || allow(role, 'users', 'read')) return true;
  if (req.user) return {id: {equals: req.user.id}};
  return false;
};

/** Users update: same rule as read, scoped to self otherwise. */
export const usersUpdateOrSelf: Access = async ({req}) => {
  const role = await loadRole(req);
  if (role?.fullAccess || allow(role, 'users', 'update')) return true;
  if (req.user) return {id: {equals: req.user.id}};
  return false;
};

/**
 * Field-level update guard (deny by default): editable only by full-access admins,
 * or by a role that has the resource `update` permission AND an explicit per-field
 * grant. Applied to sensitive fields such as `Users.role`.
 */
export const fieldUpdateAccess =
  (slug: string, field: string): FieldAccess =>
  async ({req}) => {
    const role = await loadRole(req);
    if (!role) return false;
    if (role.fullAccess) return true;
    if (!allow(role, slug, 'update')) return false;
    return role[fieldPermKey(slug, field, 'update')] === true;
  };
