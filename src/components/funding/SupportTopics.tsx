import {getLocale, getTranslations} from 'next-intl/server';
import {
  Shield,
  Smartphone,
  TrendingUp,
  User,
  Users,
  Wallet,
  type LucideIcon
} from 'lucide-react';
import {getFundingMarketing} from '@/lib/fundingMarketing';
import type {Locale} from '@/i18n/routing';

/**
 * Frequently searched support topics (Figma 75:264). Light section, 6 cards.
 * These are generic navigation cards (not company facts). Items are i18n
 * structural strings (`funding.topics.items`); section chrome is CMS-overridable.
 */

type TopicIcon =
  | 'trendingUp'
  | 'wallet'
  | 'user'
  | 'shield'
  | 'users'
  | 'smartphone';

type Topic = {title: string; desc: string; icon: TopicIcon};

const ICONS: Record<TopicIcon, LucideIcon> = {
  trendingUp: TrendingUp,
  wallet: Wallet,
  user: User,
  shield: Shield,
  users: Users,
  smartphone: Smartphone
};

export default async function SupportTopics() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('funding.topics');
  const marketing = await getFundingMarketing(locale);
  const items = t.raw('items') as Topic[];

  return (
    <section className="bg-[var(--fig-light)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 py-20 sm:px-10 lg:px-[120px] lg:py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            {marketing.topics.kicker}
          </span>
          <h2 className="font-sans text-[clamp(1.7rem,3.5vw,2rem)] font-extrabold leading-[1.15] text-[var(--fig-heading-dark)]">
            {marketing.topics.heading}
          </h2>
          <p className="max-w-[38rem] text-base leading-[1.6] text-[var(--fig-text-muted)]">
            {marketing.topics.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => {
            const Icon = ICONS[item.icon] ?? Wallet;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center gap-4 rounded-[16px] border border-[var(--fig-border-light)] bg-white p-6 text-center shadow-[0px_4px_5px_rgba(16,24,40,0.05)]"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <Icon className="size-6" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-sans text-[15px] font-bold text-[var(--fig-heading-dark)]">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-[1.5] text-[var(--fig-text-muted)]">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
