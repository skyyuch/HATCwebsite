import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {company} from '@/content/company';
import BrandLogo from '../BrandLogo';

// main-footer (Figma 4:296): dark global footer.
//
// Link destinations were confirmed by the owner (2026-08-10, 第十一輪):
// content/nav links resolve to existing pages/anchors; links whose destination
// pages don't exist yet (最新新聞 / 交易細則 / 合約保證金 / 隱私權 / 免責) point at
// "coming soon" stub pages until the owner supplies the real content/routes.
// These are content-navigation links (not operational customer-service links,
// which still resolve via getSiteSettings()), so internal route paths are fine.
// The risk statement makes clear that all on-site prices/charts are sample data.
const COLS = ['about', 'trading', 'mt5', 'academy'] as const;
const LINKS = ['l1', 'l2', 'l3', 'l4'] as const;

type Col = (typeof COLS)[number];
type LinkKey = (typeof LINKS)[number];

// Centralised link map — fill these in when the owner supplies a full link table.
// `/#...` are homepage section anchors; `/products` is the dedicated Products /
// CFD page (owner 待辦5, 2026-08-10) which now carries the approved trading
// conditions, so the former `/trading-rules` and `/margin` stubs are retired and
// the 交易服務 column points at `/products` anchors instead. `/news`, `/privacy`,
// `/disclaimer` remain "coming soon" stubs awaiting owner content.
const FOOTER_LINKS: Record<Col, Record<LinkKey, string>> = {
  about: {l1: '/about', l2: '/about', l3: '/about', l4: '/news'},
  trading: {
    l1: '/products#gold',
    l2: '/products#silver',
    l3: '/products#conditions',
    l4: '/products#conditions'
  },
  mt5: {l1: '/#mt5', l2: '/#mt5', l3: '/#mt5', l4: '/#mt5'},
  academy: {
    l1: '/academy',
    l2: '/academy',
    l3: '/academy',
    l4: '/academy'
  }
};

const LEGAL_LINKS = {privacy: '/privacy', disclaimer: '/disclaimer'} as const;

export default async function Footer() {
  const t = await getTranslations();
  const f = await getTranslations('home.footerV2');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--fig-border)] bg-[var(--fig-ink)] text-[var(--fig-text-dim)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 pb-10 pt-20 sm:px-10 lg:px-[120px]">
        <div className="grid gap-12 md:grid-cols-[327fr_repeat(4,153fr)]">
          <div className="flex flex-col gap-4">
            <BrandLogo height={28} alt={t('common.brandFull')} className="self-start" />
            <p className="max-w-[24rem] text-xs leading-[1.5]">
              {f('brandDesc')}
            </p>
          </div>

          {COLS.map((col) => (
            <nav key={col} className="flex flex-col gap-2.5">
              <h3 className="mb-1 text-[13px] font-bold text-gold">
                {f(`cols.${col}.title`)}
              </h3>
              {LINKS.map((l) => (
                <Link
                  key={l}
                  href={FOOTER_LINKS[col][l]}
                  className="text-xs transition-colors hover:text-white"
                >
                  {f(`cols.${col}.${l}`)}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--fig-border)] pt-8">
          <p className="text-[10px] leading-[1.5] text-[var(--fig-text-dim)]">
            {f('risk')}
          </p>
          <div className="flex flex-col gap-3 text-[11px] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {company.legalNameEn} {t('common.brandFull')}.{' '}
              {t('footer.rights')}.
            </p>
            <div className="flex gap-4">
              <Link
                href={LEGAL_LINKS.privacy}
                className="transition-colors hover:text-white"
              >
                {f('privacy')}
              </Link>
              <Link
                href={LEGAL_LINKS.disclaimer}
                className="transition-colors hover:text-white"
              >
                {f('disclaimer')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
