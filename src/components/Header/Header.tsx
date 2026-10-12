import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {
  getSiteSettings,
  memberLoginHref,
  openAccountHref
} from '@/lib/siteSettings';
import LocaleSwitcher from '../LocaleSwitcher/LocaleSwitcher';
import BrandLogo from '../BrandLogo';
import HeaderNav, {type MegaData, type NavLink} from './HeaderNav';
import HeaderMobileMenu from './HeaderMobileMenu';

// Figma-led WHITE sticky header (owner 2026-08-10, node 38:5). Supersedes the
// earlier dark global header for the top bar (footer stays dark). Section links
// are absolute to the homepage so they resolve from any page; About and the
// Gold-trading mega-menu point at dedicated pages/anchors.
// `label` is resolved from i18n at render time (see the `.map` below), so the
// static table omits it — hence Omit<NavLink, 'label'>.
const NAV: ReadonlyArray<Omit<NavLink, 'label'>> = [
  {key: 'aboutHatc', href: '/about'},
  // 「交易」top link → the gold-trading overview page (owner IA decision
  // 2026-08-10); /products remains the trading-conditions detail sub-page.
  {key: 'goldTrading', href: '/trading', mega: true},
  {key: 'platforms', href: '/platforms'},
  {key: 'goldAcademy', href: '/academy'},
  // Owner request 2026-10-12: announcements get their own top-level entry.
  {key: 'announcements', href: '/announcements'},
  {key: 'support', href: '/#support'}
];

// Mega-menu destinations: real routes/anchors where a page exists (/trading,
// /products/all, /accounts, /products#conditions, /funding). These are content
// links, not operational ones.
const MEGA_HREF = {
  overview: '/trading',
  allProducts: '/products/all',
  account: '/accounts',
  conditions: '/products#conditions',
  funding: '/funding'
} as const;

export default async function Header() {
  const t = await getTranslations('common');
  const nav = await getTranslations('nav');
  const settings = await getSiteSettings();
  // Open-account and member login are operational links → resolve via CMS,
  // never hard-coded. Login stays hidden until the owner supplies a real
  // destination (owner 2026-10-11, 第五十七輪).
  const openHref = openAccountHref(settings);
  const loginHref = memberLoginHref(settings);

  const links: NavLink[] = NAV.map((item) => ({...item, label: nav(item.key)}));

  const megaItem = (key: MegaData['products'][number]['key']) => ({
    key,
    title: nav(`mega.items.${key}.title`),
    desc: nav(`mega.items.${key}.desc`),
    href: MEGA_HREF[key as keyof typeof MEGA_HREF],
    icon: key as MegaData['products'][number]['icon']
  });

  const mega: MegaData = {
    openLabel: nav('mega.openLabel'),
    navLabel: nav('primary'),
    productsTitle: nav('mega.products.title'),
    supportTitle: nav('mega.support.title'),
    products: [megaItem('overview'), megaItem('allProducts')],
    support: [megaItem('account'), megaItem('conditions'), megaItem('funding')],
    banner: {
      title: nav('mega.banner.title'),
      desc: nav('mega.banner.desc'),
      href: openHref ?? '/register',
      external: Boolean(openHref)
    }
  };

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-[#e6e6e6] bg-white">
      {/*
        The desktop row only fits from 1360px up. Measured at 1440 (English, the
        widest labels, including the member-login link the owner has yet to
        configure): logo 119 + nav 766 + actions 326 + 2×48 padding = 1307.
        Below that the drawer takes over — do not move the nav back to `lg`,
        which squeezed the logo to zero width (第六十輪).
      */}
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-12 2xl:px-20">
        <Link
          href="/"
          aria-label={t('brandFull')}
          className="flex shrink-0 items-center rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
        >
          <BrandLogo height={35} alt="" chip={false} priority />
        </Link>

        <HeaderNav links={links} mega={mega} />

        <div className="hidden items-center gap-5 min-[1360px]:flex">
          <LocaleSwitcher />
          {loginHref ? (
            <a
              href={loginHref}
              className="text-sm font-semibold text-[#181917] hover:text-[#1C4A70]"
            >
              {nav('login')}
            </a>
          ) : null}
          {openHref ? (
            <a
              href={openHref}
              className={cn(buttonVariants({size: 'fig'}), 'bg-[#1a3366] text-white hover:bg-[#12264d]')}
            >
              {nav('openAccount')}
            </a>
          ) : (
            <Link
              href="/register"
              className={cn(buttonVariants({size: 'fig'}), 'bg-[#1a3366] text-white hover:bg-[#12264d]')}
            >
              {nav('openAccount')}
            </Link>
          )}
        </div>

        <HeaderMobileMenu
          links={links}
          mega={mega}
          loginLabel={loginHref ? nav('login') : null}
          loginHref={loginHref}
          openAccountLabel={nav('openAccount')}
          openAccountHref={openHref}
          menuLabel={t('openMenu')}
          closeLabel={t('closeMenu')}
        />
      </div>
    </header>
  );
}
