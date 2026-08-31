/**
 * Analytics placeholder. The tracking tool is not decided yet
 * (see docs/HATC_PROJECT_BRIEF.md). The tracking ID is read from an env var and
 * must never be hard-coded. When a tool (e.g. GA4 / GTM) is chosen, inject its
 * script here via next/script using `id`.
 */
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  if (!id) return null;

  // TODO: wire the chosen analytics tool using `id`.
  return null;
}
