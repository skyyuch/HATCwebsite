/**
 * Compact page list with ellipses, e.g. `1 2 3 4 5 … 8`.
 *
 * Shared by the client-side paginators (`/academy`, `/announcements`) so both
 * pages elide long ranges the same way. Pure logic — no `server-only`.
 */
export type PageItem = number | 'ellipsis';

export function pageItems(total: number, current: number): PageItem[] {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
  const items: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push('ellipsis');
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < total - 1) items.push('ellipsis');
  items.push(total);
  return items;
}
