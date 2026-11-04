'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Mail, Phone, X } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { NavCategory } from '@/lib/nav';
import { Logo } from './Logo';
import { WhatsAppIcon } from './icons/WhatsApp';

interface Props {
  open: boolean;
  onClose: () => void;
  nav: NavCategory[];
  phone: { display: string; href: string } | null;
  whatsappHref: string;
  pathname: string;
}

/** Full-height sheet built on <dialog>: native focus trap, Esc to close, focus returns to the trigger. */
export function MobileMenu({ open, onClose, nav, phone, whatsappHref, pathname }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const activeCat = nav.find((c) => pathname === `/${c.slug}` || c.products.some((p) => pathname === `/${p.slug}`));
  const [expanded, setExpanded] = useState<string | null>(activeCat?.slug ?? null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = 'hidden';
    } else if (!open && d.open) {
      d.close();
    }
    if (!open) document.documentElement.style.overflow = '';
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label="Menu"
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-[420px] bg-white p-0 backdrop:bg-navy-950/50 open:animate-[sheet-in_260ms_var(--ease-out)] backdrop:animate-[fade-in_200ms_ease-out] lg:hidden"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex size-11 items-center justify-center rounded-md text-navy-900 hover:bg-navy-50"
          >
            <X className="size-6" aria-hidden />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-eyebrow px-2 pb-2 text-text-muted">Products</p>
          <ul className="divide-y divide-border border-y border-border">
            {nav.map((c) => {
              const isOpen = expanded === c.slug;
              return (
                <li key={c.slug}>
                  <div className="flex items-center">
                    <Link
                      href={`/${c.slug}`}
                      className={cn(
                        'flex min-h-13 flex-1 items-center px-2 font-display text-[17px] font-semibold text-navy-900',
                        pathname === `/${c.slug}` && 'text-teal-700',
                      )}
                    >
                      {c.name}
                    </Link>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`m-${c.slug}`}
                      aria-label={`${isOpen ? 'Hide' : 'Show'} ${c.name} products`}
                      onClick={() => setExpanded(isOpen ? null : c.slug)}
                      className="inline-flex size-11 items-center justify-center rounded-md text-navy-800 hover:bg-navy-50"
                    >
                      <ChevronDown className={cn('size-5 transition-transform duration-220', isOpen && 'rotate-180')} aria-hidden />
                    </button>
                  </div>
                  <ul id={`m-${c.slug}`} hidden={!isOpen} className="pb-3 pl-2">
                    {c.products.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/${p.slug}`}
                          aria-current={pathname === `/${p.slug}` ? 'page' : undefined}
                          className={cn(
                            'flex min-h-11 items-center border-l-2 border-navy-100 pl-4 text-[15px] text-text-secondary',
                            pathname === `/${p.slug}` && 'border-teal-500 font-medium text-navy-900',
                          )}
                        >
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>

          <ul className="mt-4 flex flex-col">
            {[
              { href: '/about', label: 'About Us' },
              { href: '/contact', label: 'Contact Us' },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    'flex min-h-13 items-center px-2 font-display text-[17px] font-semibold text-navy-900',
                    pathname === l.href && 'text-teal-700',
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
            {phone ? (
              <a href={phone.href} className="flex min-h-11 items-center gap-3 px-2 text-[15px] text-navy-800">
                <Phone className="size-5 text-teal-700" aria-hidden />
                {phone.display}
              </a>
            ) : null}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-3 px-2 text-[15px] text-navy-800"
            >
              <WhatsAppIcon />
              Chat on WhatsApp
            </a>
            <Link href="/contact" className="flex min-h-11 items-center gap-3 px-2 text-[15px] text-navy-800">
              <Mail className="size-5 text-teal-700" aria-hidden />
              Email us
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1 px-2 text-sm text-text-muted">
            {[
              ['/privacy-policy', 'Privacy'],
              ['/terms-and-conditions', 'Terms'],
              ['/shipping-policy', 'Shipping'],
              ['/refund-policy', 'Refund'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href!} className="inline-flex min-h-8 items-center hover:text-navy-900">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <LinkButton href="/get-a-quote" size="lg" arrow className="w-full">
            Get a Quote
          </LinkButton>
        </div>
      </div>
    </dialog>
  );
}
