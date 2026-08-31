import {getTranslations} from 'next-intl/server';
import {ShieldCheck, Award, BadgeCheck} from 'lucide-react';

// Trust strip (Figma 4:52): three credibility columns on a dark card band.
// All facts trace to docs/HATC_FACTS.md (HKGX AA member, seat No. 008).
const ITEMS = [
  {key: 'field', Icon: ShieldCheck},
  {key: 'grade', Icon: Award},
  {key: 'member', Icon: BadgeCheck}
] as const;

export default async function TrustStrip() {
  const t = await getTranslations('home.trust');

  return (
    <section className="border-b border-[var(--fig-border)] bg-[var(--fig-surface)]">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-10 sm:px-10 md:grid-cols-3 lg:px-[120px]">
        {ITEMS.map(({key, Icon}) => (
          <div key={key} className="flex items-center gap-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-3xl bg-[rgba(212,175,55,0.12)] text-gold">
              <Icon className="size-6" aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="font-sans text-xl font-extrabold text-white">
                {t(`${key}.title`)}
              </h3>
              <p className="text-xs leading-[1.5] text-[var(--fig-text-dim)]">
                {t(`${key}.sub`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
