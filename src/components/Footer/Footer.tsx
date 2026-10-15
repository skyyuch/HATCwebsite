import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {company} from '@/content/company';
import {CFD_PRODUCTS} from '@/components/products/tradingConditions';
import {
  ACADEMY_CATEGORY_SLUGS,
  academyCategoryHref
} from '@/lib/academyCategories';
import BrandLogo from '../BrandLogo';

// main-footer (Figma 4:296): dark global footer.
//
// Every label here must name a page or section that actually exists, and must not
// promise a capability the owner has not confirmed (第五十三輪). These are
// content-navigation links — operational customer-service links still resolve via
// getSiteSettings() — so internal route paths are fine.
const COLS = ['about', 'trading', 'platforms', 'academy'] as const;

type Col = (typeof COLS)[number];
type StaticCol = Exclude<Col, 'trading' | 'academy'>;

// Columns whose rows are declared here. The 交易服務 and 黃金學院 columns are
// generated from their canonical sources instead — see the branches in the
// component below. `labelKey` is a full message path so a row can borrow the label
// of the page it points at rather than duplicating the string into a footer-only
// key (the i18n rule: identical text never gets a second key).
//
// 2026-10-11 (第五十三輪): the former `mt5` column is now `platforms` — it pointed
// every link at the homepage `#mt5` teaser and advertised destinations that don't
// exist (client download, mobile guide) plus an unconfirmed platform capability
// (EA / algo support). It now resolves to the real `/platforms` page and its
// section anchors, matching the header rename done in 第三十八輪.
//
// 2026-10-12 (第六十一輪): the owner asked for an announcements entry in the footer
// as well (the header got its top-level item in 第六十輪). It lives in the about
// column, directly above 最新新聞, because both are notice surfaces and a fifth nav
// column would squeeze all of them to roughly 70px at the `md` breakpoint. It is a
// single link to the index on purpose: announcement categories live in the CMS, and
// deep-linking them from the global footer would make every static page depend on
// the `announcementCategories` cache tag (which only revalidates /announcements).
//
// ⚠️ The about column's first three rows all land on `/about` with no anchor: the
// section ids the old warm-white About had (#milestones / #credentials / #office)
// disappeared in the 第十三輪 rebuild and were never restored. Fixing it means
// adding ids to src/components/about/* first; the owner deferred this in 第五十七輪.
const FOOTER_LINKS: Record<
  StaticCol,
  readonly {href: string; labelKey: string}[]
> = {
  about: [
    {href: '/about', labelKey: 'home.footerV2.cols.about.l1'},
    {href: '/about', labelKey: 'home.footerV2.cols.about.l2'},
    {href: '/about', labelKey: 'home.footerV2.cols.about.l3'},
    {href: '/announcements', labelKey: 'announcements.hero.title'},
    {href: '/news', labelKey: 'home.footerV2.cols.about.l4'},
    // 第七十二輪: the new FAQ page. The header reaches it through the 關於 HATC
    // dropdown; this is the second entry point, in the column that already
    // collects the other about/notice surfaces.
    {href: '/faq', labelKey: 'faq.hero.title'}
  ],
  platforms: [
    {href: '/platforms', labelKey: 'home.footerV2.cols.platforms.l1'},
    {
      href: '/platforms#platform-types',
      labelKey: 'home.footerV2.cols.platforms.l2'
    },
    {
      href: '/platforms#platform-types',
      labelKey: 'home.footerV2.cols.platforms.l3'
    },
    {
      href: '/platforms#platform-faq',
      labelKey: 'home.footerV2.cols.platforms.l4'
    }
  ]
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

  const columns = COLS.map((col) => {
    let links: {href: string; label: string}[];

    if (col === 'academy') {
      links = [
        {href: '/academy', label: f('cols.academy.l1')},
        ...FOOTER_ACADEMY_CATEGORIES.map((index) => ({
          href: academyCategoryHref(ACADEMY_CATEGORY_SLUGS[index]),
          label: categories[index]
        }))
      ];
    } else if (col === 'trading') {
      // Generated from CFD_PRODUCTS (第五十七輪): the previous hard-coded labels
      // (倫敦黃金交易 / 倫敦白銀交易 / 市場交易細則 / 合約保證金) were missing the RMB
      // kilobar, sent l3 and l4 to the same `#conditions` anchor, and promised
      // margin content the site does not have. Labels come from products.items.*
      // so they match the destination cards, which render `id={p.key}`.
      links = [
        ...CFD_PRODUCTS.map((p) => ({
          href: `/products#${p.key}`,
          label: t(`products.items.${p.key}.name`)
        })),
        {href: '/products#conditions', label: t('products.conditions.heading')}
      ];
    } else {
      links = FOOTER_LINKS[col].map((row) => ({
        href: row.href,
        label: t(row.labelKey)
      }));
    }

    return {key: col, title: f(`cols.${col}.title`), links};
  });

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
