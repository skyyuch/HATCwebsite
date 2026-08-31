/**
 * Milestone dates are approved facts. SINGLE SOURCE = docs/HATC_FACTS.md.
 * The date is factual and locale-neutral; the description text lives in the
 * i18n message files under `home.milestones.items.*` (three languages).
 * Do not add or change dates here without updating docs/HATC_FACTS.md first.
 */
export const milestoneEntries = [
  {date: '2025-01-13', key: 'm1'},
  {date: '2025-10-09', key: 'm2'},
  {date: '2026-03-27', key: 'm3'},
  {date: '2026-03-30', key: 'm4'}
] as const;
