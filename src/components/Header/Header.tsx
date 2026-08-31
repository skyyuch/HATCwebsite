import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import {getSiteSettings, primaryContactHref} from '@/lib/siteSettings';
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
  // Open-account is an operational link → resolve via CMS, never hard-coded.
  const openAccountHref = primaryContactHref(settings);

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
      href: openAccountHref ?? '/register',
      external: Boolean(openAccountHref)
    }
  };

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-[#e6e6e6] bg-white">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-20">
        <Link
          href="/"
          aria-label={t('brandFull')}
          className="flex items-center rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
        >
          <BrandLogo height={35} alt="" chip={false} priority />
        </Link>

        <HeaderNav links={links} mega={mega} />

        <div className="hidden items-center gap-5 lg:flex">
          <LocaleSwitcher />
          <Link
            href="/account"
            className="text-sm font-semibold text-[#181917] hover:text-[#1C4A70]"
          >
            {nav('login')}
          </Link>
          {openAccountHref ? (
            <a
              href={openAccountHref}
              target="_blank"
              rel="noopener noreferrer"
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
          loginLabel={nav('login')}
          openAccountLabel={nav('openAccount')}
          openAccountHref={openAccountHref}
          menuLabel={t('openMenu')}
          closeLabel={t('closeMenu')}
        />
      </div>
    </header>
  );
}
