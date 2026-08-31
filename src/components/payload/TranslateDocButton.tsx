import React from 'react';
import type {Payload, TypedUser} from 'payload';

import {isMtConfigured} from '@/lib/mt/provider';
import TranslateDocButtonClient from './TranslateDocButtonClient';

/**
 * Server gate for the one-click machine-translation control (route B), rendered
 * in `beforeDocumentControls` next to Save. Two gates run here, server-side, so
 * neither the API key nor the button leaks to unauthorised users:
 *
 * 1. Full-access only (owner decision, 第三十三輪): machine translation writes
 *    drafts across every content locale, so the control is shown only to
 *    full-access roles — matching the `/api/translate` endpoint check. Other
 *    users never see the button (avoids a 403 on click).
 * 2. `configured` reflects the server-only MT config so the button degrades
 *    gracefully (disabled + hint) when no `MT_API_KEY` is set. The API key never
 *    reaches the browser.
 */
type Props = {
  payload?: Payload;
  user?: TypedUser | null;
};

async function userHasFullAccess(
  payload: Payload | undefined,
  user: {role?: unknown} | null | undefined
): Promise<boolean> {
  const ref = user?.role;
  if (!ref) return false;
  // Relationship may arrive populated (object) or as an id, depending on depth.
  if (typeof ref === 'object') {
    return Boolean((ref as {fullAccess?: boolean | null}).fullAccess);
  }
  if (!payload) return false;
  try {
    const role = await payload.findByID({
      collection: 'roles',
      id: ref as string | number,
      depth: 0,
      overrideAccess: true
    });
    return Boolean((role as {fullAccess?: boolean | null} | null)?.fullAccess);
  } catch {
    return false;
  }
}

export default async function TranslateDocButton({payload, user}: Props) {
  const fullAccess = await userHasFullAccess(
    payload,
    user as {role?: unknown} | null | undefined
  );
  if (!fullAccess) return null;
  return <TranslateDocButtonClient configured={isMtConfigured()} />;
}
