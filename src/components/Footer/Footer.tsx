import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {company} from '@/content/company';
import {
  ACADEMY_CATEGORY_SLUGS,
  academyCategoryHref
} from '@/lib/academyCategories';
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
const COLS = ['about', 'trading', 'platforms', 'academy'] as const;
const LINKS = ['l1', 'l2', 'l3', 'l4'] as const;

type Col = (typeof COLS)[number];
type StaticCol = Exclude<Col, 'academy'>;
type LinkKey = (typeof LINKS)[number];

// Centralised link map — fill these in when the owner supplies a full link table.
// `/#...` are homepage section anchors; `/products` is the dedicated Products /
// CFD page (owner 待辦5, 2026-08-10) which now carries the approved trading
// conditions, so the former `/trading-rules` and `/margin` stubs are retired and
// the 交易服務 column points at `/products` anchors instead. `/news`, `/privacy`,
// `/disclaimer` remain "coming soon" stubs awaiting owner content.
//
// 2026-10-11 (第五十三輪): the former `mt5` column is now `platforms` — it pointed
// every link at the homepage `#mt5` teaser and advertised destinations that don't
// exist (client download, mobile guide) plus an unconfirmed platform capability
// (EA / algo support). It now resolves to the real `/platforms` page and its
// section anchors, matching the header rename done in 第三十八輪.
//
// 2026-10-11 (第五十四輪): the academy column is built separately — see
// FOOTER_ACADEMY_CATEGORIES below.
const FOOTER_LINKS: Record<StaticCol, Record<LinkKey, string>> = {
  about: {l1: '/about', l2: '/about', l3: '/about', l4: '/news'},
  trading: {
    l1: '/products#gold',
    l2: '/products#silver',
    l3: '/products#conditions',
    l4: '/products#conditions'
  },
  platforms: {
    l1: '/platforms',
    l2: '/platforms#platform-types',
    l3: '/platforms#platform-types',
    l4: '/platforms#platform-faq'
  }
};

// 2026-10-11 (第五十四輪): the academy column used to carry four labels
// (基礎課程 / 進階分析 / 巨集觀基本面 / 技術指標解讀) that match none of the six
// canonical categories on `/academy`, with all four pointing at the unfiltered
// list. It now links the academy index plus three real categories, deep-linked
// through the `?category=` filter. Labels are read from `academy.categories`
// rather than duplicated into footer keys, so they can never drift from the
// filter options. The owner kept the column at four rows (2026-10-11), so three
// of the six categories are represented; the rest are reachable on `/academy`.
const FOOTER_ACADEMY_CATEGORIES = [0, 1, 2] as const;

const LEGAL_LINKS = {privacy: '/privacy', disclaimer: '/disclaimer'} as const;

export default async function Footer() {
  const t = await getTranslations();
  const f = await getTranslations('home.footerV2');
  const year = new Date().getFullYear();
  const categories = t.raw('academy.categories') as string[];

  const columns = COLS.map((col) => ({
    key: col,
    title: f(`cols.${col}.title`),
    links:
      col === 'academy'
        ? [
            {href: '/academy', label: f('cols.academy.l1')},
            ...FOOTER_ACADEMY_CATEGORIES.map((index) => ({
              href: academyCategoryHref(ACADEMY_CATEGORY_SLUGS[index]),
              label: categories[index]
            }))
          ]
        : LINKS.map((l) => ({
            href: FOOTER_LINKS[col as StaticCol][l],
            label: f(`cols.${col}.${l}`)
          }))
  }));

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

          {columns.map((column) => (
            <nav key={column.key} className="flex flex-col gap-2.5">
              <h3 className="mb-1 text-[13px] font-bold text-gold">
                {column.title}
              </h3>
              {column.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-xs transition-colors hover:text-white"
                >
                  {link.label}
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
