'use client';

import {useState} from 'react';
import {ChevronDown, Menu, X} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import type {MegaData, NavLink} from './HeaderNav';

/**
 * Compact drawer for the white Figma header (node 38:5) on small screens (< lg).
 * Mirrors the desktop nav: top-level links plus an expandable "黃金交易" section
 * that lists the mega-menu items, then login / open-account actions.
 */
export default function HeaderMobileMenu({
  links,
  mega,
  loginLabel,
  openAccountLabel,
  openAccountHref,
  menuLabel,
  closeLabel
}: {
  links: NavLink[];
  mega: MegaData;
  loginLabel: string;
  openAccountLabel: string;
  openAccountHref: string | null;
  menuLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const close = () => setOpen(false);
  const megaItems = [...mega.products, ...mega.support];

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? closeLabel : menuLabel}
        onClick={() => setOpen((v) => !v)}
        className="grid size-10 place-items-center rounded-[6px] border border-[#e6e6e6] text-[#181917] hover:bg-[#f4f6f9]"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-20 max-h-[calc(100vh-5rem)] overflow-y-auto border-b border-[#e6e6e6] bg-white shadow-[0px_12px_12px_rgba(0,0,0,0.12)]">
          <nav className="mx-auto flex max-w-[1440px] flex-col gap-1 px-6 py-4 sm:px-10">
            {links.map((item) =>
              item.mega ? (
                <div key={item.key} className="flex flex-col">
                  <button
                    type="button"
                    aria-expanded={megaOpen}
                    onClick={() => setMegaOpen((v) => !v)}
                    className="flex items-center justify-between rounded-[6px] px-3 py-3 text-left text-[15px] font-semibold text-[#181917] hover:bg-[#f4f6f9]"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'size-4 text-[#8e99b0] transition-transform',
                        megaOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  {megaOpen ? (
                    <div className="mb-1 flex flex-col gap-0.5 border-l border-[#e6e6e6] pl-3">
                      {megaItems.map((it) => (
                        <Link
                          key={it.key}
                          href={it.href}
                          onClick={close}
                          className="flex flex-col gap-0.5 rounded-[6px] px-3 py-2 hover:bg-[#f4f6f9]"
                        >
                          <span className="text-sm font-semibold text-[#0c111d]">
                            {it.title}
                          </span>
                          <span className="text-xs text-[#475467]">{it.desc}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={close}
                  className="rounded-[6px] px-3 py-3 text-[15px] font-semibold text-[#8e99b0] hover:bg-[#f4f6f9] hover:text-[#0c111d]"
                >
                  {item.label}
                </Link>
              )
            )}

            <div className="mt-3 flex flex-col gap-3 border-t border-[#e6e6e6] pt-4">
              <Link
                href="/account"
                onClick={close}
                className="px-3 text-[15px] font-semibold text-[#181917]"
              >
                {loginLabel}
              </Link>
              {openAccountHref ? (
                <a
                  href={openAccountHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className={cn(
                    buttonVariants({size: 'fig'}),
                    'bg-[#1a3366] text-white hover:bg-[#12264d]'
                  )}
                >
                  {openAccountLabel}
                </a>
              ) : (
                <Link
                  href="/register"
                  onClick={close}
                  className={cn(
                    buttonVariants({size: 'fig'}),
                    'bg-[#1a3366] text-white hover:bg-[#12264d]'
                  )}
                >
                  {openAccountLabel}
                </Link>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
