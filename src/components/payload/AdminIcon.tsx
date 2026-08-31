import React from 'react';

/** Compact mark in the admin nav header (cream chip so the navy wordmark reads). */
export default function AdminIcon() {
  return (
    <span className="hatc-admin-icon" aria-label="HATC CMS">
      {/* eslint-disable-next-line @next/next/no-img-element -- Payload admin, not Next Image context */}
      <img src="/brand/hatc-logo.png" alt="" width={112} height={32} />
    </span>
  );
}
