/**
 * Admin-panel label helpers.
 *
 * IMPORTANT: these keys follow Payload **admin i18n** language codes
 * (`en` / `zh-TW` / `zh`), NOT front-end content locales (`zh-Hant` / `zh-Hans`).
 * Official `@payloadcms/translations` registers Traditional Chinese as `zh-TW`
 * (see their `translations` export). Content localisation stays separate in
 * `payload.config.ts` → `localization`.
 */
export type AdminLabel = {
  en: string;
  'zh-TW': string;
  zh: string;
};

export function adminLabel(en: string, zhTW: string, zh: string): AdminLabel {
  return {en, 'zh-TW': zhTW, zh};
}

/** Sidebar groups — keep short; order is alphabetical by group label in Payload. */
export const ADMIN_GROUPS = {
  content: adminLabel('Content', '內容', '内容'),
  pages: adminLabel('Page copy', '頁面文案', '页面文案'),
  operations: adminLabel('Operations', '營運與示意', '运营与示意'),
  system: adminLabel('System', '系統', '系统')
} as const;
