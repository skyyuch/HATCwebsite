import React from 'react';

/**
 * Short owner-facing tip above the dashboard cards.
 * Clarifies content Locale vs admin UI language (common confusion).
 * Styles: `adminBrand.css` (imported from Payload layout).
 */
export default function DashboardIntro() {
  return (
    <aside className="hatc-admin-intro" role="note">
      <p className="hatc-admin-intro__title">HATC 內容管理</p>
      <ul className="hatc-admin-intro__list">
        <li>
          右上角 <strong>語言地區（Locale）</strong>
          ：切換<strong>內容</strong>的繁／簡／英；<strong>不會</strong>改後台選單語言。
        </li>
        <li>
          後台<strong>介面語言</strong>：點右上角<strong>帳號 → 語言</strong>切換（預設繁體中文）。
        </li>
        <li>
          「示意交易條件表」僅供版面示意；核可點差／槓桿請勿在此改寫。
        </li>
      </ul>
    </aside>
  );
}
