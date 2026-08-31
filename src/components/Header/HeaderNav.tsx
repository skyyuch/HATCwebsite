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

export type NavLink = {key: string; label: string; href: string; mega?: boolean};

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

export default function HeaderNav({
  links,
  mega
}: {
  links: NavLink[];
  mega: MegaData;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const openMenu = () => {
    cancelClose();
    setOpen(true);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };
  const closeNow = () => {
    cancelClose();
    setOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => cancelClose, []);

  return (
    <nav
      aria-label={mega.navLabel}
      className="hidden items-center gap-8 lg:flex"
    >
      {links.map((item) => {
        const active = isActive(pathname, item.href);

        if (!item.mega) {
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

        const highlighted = active || open;

        return (
          <div
            key={item.key}
            className="relative"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) closeNow();
            }}
          >
            <Link
              href={item.href}
              aria-haspopup="true"
              aria-expanded={open}
              onFocus={openMenu}
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
                className="absolute left-1/2 top-full z-40 -translate-x-1/2 pt-3"
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
              >
                <div className="w-[min(720px,calc(100vw-2rem))] overflow-hidden rounded-lg bg-white shadow-[0px_12px_12px_rgba(0,0,0,0.24)] ring-1 ring-black/5">
                  <div className="flex gap-6 p-6">
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <p className="text-xs font-bold text-[#8e99b0]">
                        {mega.productsTitle}
                      </p>
                      {mega.products.map((it) => (
                        <MegaLinkItem key={it.key} item={it} onNavigate={closeNow} />
                      ))}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <p className="text-xs font-bold text-[#8e99b0]">
                        {mega.supportTitle}
                      </p>
                      {mega.support.map((it) => (
                        <MegaLinkItem key={it.key} item={it} onNavigate={closeNow} />
                      ))}
                    </div>
                  </div>

                  {mega.banner.external ? (
                    <a
                      href={mega.banner.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeNow}
                      className="flex items-center justify-between gap-2 border-t border-[#f2e6d1] bg-[#fffbf2] px-6 py-4 transition-colors hover:bg-[#fdf4e3]"
                    >
                      <span className="flex flex-wrap items-center gap-2 text-[13px]">
                        <span className="font-bold text-[#1C4A70]">
                          {mega.banner.title}
                        </span>
                        <span className="text-[#0c111d]">{mega.banner.desc}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-[#1C4A70]" />
                    </a>
                  ) : (
                    <Link
                      href={mega.banner.href}
                      onClick={closeNow}
                      className="flex items-center justify-between gap-2 border-t border-[#f2e6d1] bg-[#fffbf2] px-6 py-4 transition-colors hover:bg-[#fdf4e3]"
                    >
                      <span className="flex flex-wrap items-center gap-2 text-[13px]">
                        <span className="font-bold text-[#1C4A70]">
                          {mega.banner.title}
                        </span>
                        <span className="text-[#0c111d]">{mega.banner.desc}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-[#1C4A70]" />
                    </Link>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
