'use client';

import {useState} from 'react';
import {ChevronDown, Menu, X} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {buttonVariants} from '@/components/ui/button';
import type {MegaData, NavLink} from './HeaderNav';

/**
 * Compact drawer for the white Figma header (node 38:5) below 1360px. Mirrors
 * the desktop nav: top-level links, plus an expandable section for each entry
 * that opens a panel on desktop — "交易" (mega-menu items) and "關於 HATC"
 * (compact link list, 第七十二輪) — then login / open-account actions.
 *
 * The cutover is 1360px, not `lg`: the top-level links plus the locale
 * switcher, login link and open-account button need 1307px of header (measured,
 * English labels) — at 1024 the labels wrapped and squeezed the logo to zero
 * width (第六十輪). See the note in `Header.tsx`.
 */
export default function HeaderMobileMenu({
  links,
  mega,
  loginLabel,
  loginHref,
  openAccountLabel,
  openAccountHref,
  menuLabel,
  closeLabel
}: {
  links: NavLink[];
  mega: MegaData;
  loginLabel: string | null;
  loginHref: string | null;
  openAccountLabel: string;
  openAccountHref: string | null;
  menuLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  // Which accordion is expanded (null = none); 交易 was the only one until
  // 關於 HATC gained a menu too (第七十二輪).
  const [sectionKey, setSectionKey] = useState<string | null>(null);
  const close = () => setOpen(false);
  const megaItems = [...mega.products, ...mega.support];

  const toggle = (key: string) =>
    setSectionKey((current) => (current === key ? null : key));

  return (
    <div className="min-[1360px]:hidden">
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
            {links.map((item) => {
              if (!item.mega && !item.menu) {
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={close}
                    className="rounded-[6px] px-3 py-3 text-[15px] font-semibold text-[#8e99b0] hover:bg-[#f4f6f9] hover:text-[#0c111d]"
                  >
                    {item.label}
                  </Link>
                );
              }

              const expanded = sectionKey === item.key;

              return (
                <div key={item.key} className="flex flex-col">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => toggle(item.key)}
                    className="flex items-center justify-between rounded-[6px] px-3 py-3 text-left text-[15px] font-semibold text-[#181917] hover:bg-[#f4f6f9]"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'size-4 text-[#8e99b0] transition-transform',
                        expanded && 'rotate-180'
                      )}
                    />
                  </button>
                  {expanded ? (
                    <div className="mb-1 flex flex-col gap-0.5 border-l border-[#e6e6e6] pl-3">
                      {item.mega
                        ? megaItems.map((it) => (
                            <Link
                              key={it.key}
                              href={it.href}
                              onClick={close}
                              className="flex flex-col gap-0.5 rounded-[6px] px-3 py-2 hover:bg-[#f4f6f9]"
                            >
                              <span className="text-sm font-semibold text-[#0c111d]">
                                {it.title}
                              </span>
                              <span className="text-xs text-[#475467]">
                                {it.desc}
                              </span>
                            </Link>
                          ))
                        : item.menu?.map((it) => (
                            <Link
                              key={it.key}
                              href={it.href}
                              onClick={close}
                              className="rounded-[6px] px-3 py-2 text-sm font-semibold text-[#0c111d] hover:bg-[#f4f6f9]"
                            >
                              {it.label}
                            </Link>
                          ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div className="mt-3 flex flex-col gap-3 border-t border-[#e6e6e6] pt-4">
              {loginHref && loginLabel ? (
                <a
                  href={loginHref}
                  onClick={close}
                  className="px-3 text-[15px] font-semibold text-[#181917]"
                >
                  {loginLabel}
                </a>
              ) : null}
              {openAccountHref ? (
                <a
                  href={openAccountHref}
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
