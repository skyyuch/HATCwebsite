'use client';

import {useEffect, useRef, useState, type ComponentType} from 'react';
import {
  ArrowRight,
  BarChart3,
  LayoutGrid,
  SlidersHorizontal,
  UserRound,
  Wallet
} from 'lucide-react';
import {Link, usePathname} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

/**
 * A top-level entry may open one of two panels, never both:
 * - `mega` → the two-column 交易 panel described by `MegaData`;
 * - `menu` → a compact list of links (關於 HATC, 第七十二輪).
 */
export type NavLink = {
  key: string;
  label: string;
  href: string;
  mega?: boolean;
  menu?: NavMenuItem[];
};

export type NavMenuItem = {key: string; label: string; href: string};

export type MegaItem = {
  key: string;
  title: string;
  desc: string;
  href: string;
  icon: 'overview' | 'allProducts' | 'account' | 'conditions' | 'funding';
};

export type MegaData = {
  openLabel: string;
  navLabel: string;
  productsTitle: string;
  supportTitle: string;
  products: MegaItem[];
  support: MegaItem[];
  banner: {title: string; desc: string; href: string; external: boolean};
};

const ICONS: Record<MegaItem['icon'], ComponentType<{className?: string}>> = {
  overview: BarChart3,
  allProducts: LayoutGrid,
  account: UserRound,
  conditions: SlidersHorizontal,
  funding: Wallet
};

function isActive(pathname: string, href: string) {
  // Only real routes highlight as current; homepage anchors ("/#...") never do.
  if (!href.startsWith('/') || href.startsWith('/#') || href === '/') return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MegaLinkItem({item, onNavigate}: {item: MegaItem; onNavigate: () => void}) {
  const Icon = ICONS[item.icon];
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="group/item flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-[#f4f6f9] focus-visible:bg-[#f4f6f9] focus-visible:outline-none"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e4e7ec] text-[#475467] transition-colors group-hover/item:bg-[rgba(28,74,112,0.12)] group-hover/item:text-[#1C4A70] group-focus-visible/item:bg-[rgba(28,74,112,0.12)] group-focus-visible/item:text-[#1C4A70]">
        <Icon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[15px] font-bold text-[#0c111d] transition-colors group-hover/item:text-[#1C4A70] group-focus-visible/item:text-[#1C4A70]">
          {item.title}
        </span>
        <span className="text-xs leading-snug text-[#475467]">{item.desc}</span>
      </span>
    </Link>
  );
}

function MegaPanel({
  mega,
  onNavigate
}: {
  mega: MegaData;
  onNavigate: () => void;
}) {
  return (
    <div className="w-[min(720px,calc(100vw-2rem))] overflow-hidden rounded-lg bg-white shadow-[0px_12px_12px_rgba(0,0,0,0.24)] ring-1 ring-black/5">
      <div className="flex gap-6 p-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="text-xs font-bold text-[#8e99b0]">{mega.productsTitle}</p>
          {mega.products.map((it) => (
            <MegaLinkItem key={it.key} item={it} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="text-xs font-bold text-[#8e99b0]">{mega.supportTitle}</p>
          {mega.support.map((it) => (
            <MegaLinkItem key={it.key} item={it} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      {mega.banner.external ? (
        <a
          href={mega.banner.href}
          onClick={onNavigate}
          className="flex items-center justify-between gap-2 border-t border-[#f2e6d1] bg-[#fffbf2] px-6 py-4 transition-colors hover:bg-[#fdf4e3]"
        >
          <span className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="font-bold text-[#1C4A70]">{mega.banner.title}</span>
            <span className="text-[#0c111d]">{mega.banner.desc}</span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-[#1C4A70]" />
        </a>
      ) : (
        <Link
          href={mega.banner.href}
          onClick={onNavigate}
          className="flex items-center justify-between gap-2 border-t border-[#f2e6d1] bg-[#fffbf2] px-6 py-4 transition-colors hover:bg-[#fdf4e3]"
        >
          <span className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="font-bold text-[#1C4A70]">{mega.banner.title}</span>
            <span className="text-[#0c111d]">{mega.banner.desc}</span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-[#1C4A70]" />
        </Link>
      )}
    </div>
  );
}

/**
 * Compact dropdown (關於 HATC). Labels only, no icons or descriptions: the
 * mega-menu's blurbs are marketing copy for product pages, and inventing a
 * sentence for 關於我們 / 常見問題 / 客戶支援 would add unapproved claims for no
 * navigational benefit.
 */
function MenuPanel({
  items,
  pathname,
  onNavigate
}: {
  items: NavMenuItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  // 264px keeps the longest label — English "Frequently asked questions" — on
  // one line; it wrapped at 220.
  return (
    <div className="w-[264px] overflow-hidden rounded-lg bg-white p-2 shadow-[0px_12px_12px_rgba(0,0,0,0.24)] ring-1 ring-black/5">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            'block rounded-[6px] px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-[#f4f6f9] hover:text-[#1C4A70] focus-visible:bg-[#f4f6f9] focus-visible:outline-none',
            isActive(pathname, item.href) ? 'text-[#1C4A70]' : 'text-[#0c111d]'
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default function HeaderNav({
  links,
  mega
}: {
  links: NavLink[];
  mega: MegaData;
}) {
  const pathname = usePathname();
  // Which entry's panel is open (null = none). A boolean was enough while 交易
  // was the only dropdown; 關於 HATC made it ambiguous (第七十二輪).
  const [openKey, setOpenKey] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const openMenu = (key: string) => {
    cancelClose();
    setOpenKey(key);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenKey(null), 120);
  };
  const closeNow = () => {
    cancelClose();
    setOpenKey(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenKey(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => cancelClose, []);

  return (
    <nav
      aria-label={mega.navLabel}
      className="hidden items-center gap-6 min-[1360px]:flex 2xl:gap-8"
    >
      {links.map((item) => {
        // A parent also counts as current when one of its children is open in
        // the browser (e.g. /faq under 關於 HATC).
        const active =
          isActive(pathname, item.href) ||
          (item.menu?.some((child) => isActive(pathname, child.href)) ?? false);

        if (!item.mega && !item.menu) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'text-sm font-semibold transition-colors hover:text-[#1C4A70]',
                active ? 'text-[#1C4A70]' : 'text-[#8e99b0]'
              )}
            >
              {item.label}
            </Link>
          );
        }

        const open = openKey === item.key;
        const highlighted = active || open;

        return (
          <div
            key={item.key}
            className="relative"
            onMouseEnter={() => openMenu(item.key)}
            onMouseLeave={scheduleClose}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) closeNow();
            }}
          >
            <Link
              href={item.href}
              aria-haspopup="true"
              aria-expanded={open}
              onFocus={() => openMenu(item.key)}
              onClick={closeNow}
              className={cn(
                'text-sm font-semibold transition-colors hover:text-[#1C4A70]',
                highlighted ? 'text-[#1C4A70]' : 'text-[#8e99b0]'
              )}
            >
              {item.label}
            </Link>

            {open ? (
              <div
                className={cn(
                  'absolute top-full z-40 pt-3',
                  // The wide mega panel is centred on its trigger; the narrow
                  // menu hangs from the left edge, which is the first nav item
                  // and would otherwise push past the logo.
                  item.mega ? 'left-1/2 -translate-x-1/2' : 'left-0'
                )}
                onMouseEnter={() => openMenu(item.key)}
                onMouseLeave={scheduleClose}
              >
                {item.mega ? (
                  <MegaPanel mega={mega} onNavigate={closeNow} />
                ) : (
                  <MenuPanel
                    items={item.menu ?? []}
                    pathname={pathname}
                    onNavigate={closeNow}
                  />
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
