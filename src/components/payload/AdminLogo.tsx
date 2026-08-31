import React from 'react';

/** Full wordmark on login / create-first-user. Styles via layout `adminBrand.css`. */
export default function AdminLogo() {
  return (
    <div className="hatc-admin-logo" aria-label="HATC CMS">
      {/* eslint-disable-next-line @next/next/no-img-element -- Payload admin, not Next Image context */}
      <img
        src="/brand/hatc-logo.png"
        alt="HATC"
        width={220}
        height={65}
        className="hatc-admin-logo__img"
      />
      <p className="hatc-admin-logo__tag">內容管理後台</p>
    </div>
  );
}
