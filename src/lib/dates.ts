/**
 * Locale-aware date formatting for CMS dates (academy articles, announcements).
 *
 * Shared by server and client components — keep this module free of
 * `server-only`. Both helpers fall back to the raw ISO string if the value is
 * unparseable, so a half-filled CMS field degrades to text instead of throwing.
 */

/** Numeric form for list rows, normalised to `YYYY-MM-DD` in every locale. */
export function formatDateShort(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
      .format(new Date(iso))
      .replace(/\//g, '-');
  } catch {
    return iso;
  }
}

/** Long form for article / notice headers (e.g. 2026年10月12日). */
export function formatDateLong(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
