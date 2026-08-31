'use client';

import Link from 'next/link';
import React from 'react';
import {useTranslation} from '@payloadcms/ui';

/**
 * Top-right logout action (owner request: move logout out of the sidebar foot).
 * Renders in `admin.components.actions` (app header, top-right). Links to the
 * Payload admin logout route; the default sidebar logout is hidden via CSS.
 * Styles: `adminBrand.css` (loaded globally from the Payload layout).
 */
export default function AdminHeaderLogout() {
  const {t} = useTranslation();
  const label = t('authentication:logOut');

  return (
    <Link className="hatc-admin-logout" href="/admin/logout" aria-label={label}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
      <span className="hatc-admin-logout__label">{label}</span>
    </Link>
  );
}
