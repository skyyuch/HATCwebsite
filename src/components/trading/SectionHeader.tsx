/**
 * Centered section header for the light /trading ("概覽") page (Figma 44:4):
 * a cream pill badge (gold text) above an Instrument Serif display heading and a
 * Geist subtitle. Distinct from the dark homepage SectionTitle — this page uses
 * the lighter navy/gold system (docs/HANDOFF.md 第十八輪). Copy comes from i18n.
 */
export default function SectionHeader({
  badge,
  heading,
  subtitle
}: {
  badge: string;
  heading: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="inline-flex items-center rounded-full border border-[var(--trd-gold)] bg-[var(--trd-cream)] px-3 py-1 text-xs font-semibold text-[var(--trd-gold)]">
        {badge}
      </span>
      <h2 className="font-[family-name:var(--font-serif-display)] text-[clamp(2rem,4vw,2.5rem)] font-normal leading-[1.2] text-[var(--trd-heading)]">
        {heading}
      </h2>
      <p className="max-w-[720px] text-base leading-[1.5] text-[var(--trd-body)]">
        {subtitle}
      </p>
    </div>
  );
}
