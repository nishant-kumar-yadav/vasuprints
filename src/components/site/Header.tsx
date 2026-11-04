'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Menu, Phone } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { NavCategory } from '@/lib/nav';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { ProductSearch } from './ProductSearch';
import { Art } from './art/Art';

interface HeaderProps {
  nav: NavCategory[];
  phone: { display: string; href: string } | null;
  whatsappHref: string;
  promo: { title: string; text: string; link: string };
}

export function Header({ nav, phone, whatsappHref, promo }: HeaderProps) {
  const pathname = usePathname();
  const [scroll, setScroll] = useState(0);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const intent = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const on = () => setScroll(window.scrollY);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // Close menus on route change (adjusting state during render, per React docs).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMegaOpen(false);
    setMobileOpen(false);
  }

  const close = useCallback((focusTrigger = false) => {
    setMegaOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(true);
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [megaOpen, close]);

  const hoverOpen = () => {
    if (intent.current) clearTimeout(intent.current);
    intent.current = setTimeout(() => setMegaOpen(true), 120);
  };
  const hoverClose = () => {
    if (intent.current) clearTimeout(intent.current);
    intent.current = setTimeout(() => setMegaOpen(false), 160);
  };

  const condensed = scroll > 120;
  const bordered = scroll > 8 || megaOpen;
  const productsActive = nav.some((c) => pathname === `/${c.slug}` || c.products.some((p) => pathname === `/${p.slug}`));

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-[box-shadow,border-color] duration-220',
        bordered ? 'border-b border-border' : 'border-b border-transparent',
        condensed && 'shadow-sm',
      )}
    >
      <div
        className={cn(
          'container-site flex items-center justify-between gap-6 transition-[height] duration-220',
          condensed ? 'h-16' : 'h-16 lg:h-[76px]',
        )}
      >
        <Logo />

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 pl-6 lg:flex">
          <div onMouseEnter={hoverOpen} onMouseLeave={hoverClose}>
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={megaOpen}
              aria-controls="mega-menu"
              onClick={() => setMegaOpen((o) => !o)}
              className={cn(
                'inline-flex h-11 items-center gap-1 rounded-md px-3.5 text-[15px] font-medium transition-colors hover:bg-navy-50',
                productsActive || megaOpen ? 'text-navy-900' : 'text-navy-800',
              )}
            >
              Products
              <ChevronDown
                className={cn('size-4 transition-transform duration-220', megaOpen && 'rotate-180')}
                aria-hidden
              />
            </button>
          </div>
          <NavLink href="/about" active={pathname === '/about'}>
            About Us
          </NavLink>
          <NavLink href="/contact" active={pathname === '/contact'}>
            Contact Us
          </NavLink>
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <ProductSearch nav={nav} />
          {phone ? (
            <a href={phone.href} className="inline-flex items-center gap-2 text-sm font-medium text-navy-800 hover:text-teal-700">
              <Phone className="size-4 text-teal-700" aria-hidden />
              {phone.display}
            </a>
          ) : null}
          {pathname !== '/get-a-quote' ? (
            <LinkButton href="/get-a-quote" arrow>
              Get a Quote
            </LinkButton>
          ) : null}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 lg:hidden">
          <ProductSearch nav={nav} compact />
          {pathname !== '/get-a-quote' ? (
            <LinkButton href="/get-a-quote" size="sm">
              Get a Quote
            </LinkButton>
          ) : null}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="inline-flex size-11 items-center justify-center rounded-md text-navy-900 hover:bg-navy-50"
          >
            <Menu className="size-6" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mega-menu */}
      <div
        id="mega-menu"
        ref={panelRef}
        onMouseEnter={hoverOpen}
        onMouseLeave={hoverClose}
        hidden={!megaOpen}
        className="absolute inset-x-0 top-full hidden pt-2 lg:block"
      >
        <div className="container-site">
          <div className="animate-[mega-in_220ms_var(--ease-out)] overflow-hidden rounded-lg border border-border bg-white shadow-lg">
            <div className="grid grid-cols-[1fr_1fr_1fr_280px] gap-8 p-8">
              {[nav.slice(0, 1).concat(nav.slice(4, 5)), nav.slice(1, 2), nav.slice(2, 4)].map((col, ci) => (
                <div key={ci} className="flex flex-col gap-8">
                  {col.map((c) => (
                    <div key={c.slug}>
                      <Link
                        href={`/${c.slug}`}
                        className="text-eyebrow inline-block rounded-sm text-teal-700 hover:text-teal-800"
                      >
                        {c.name}
                      </Link>
                      <ul className="mt-3 flex flex-col gap-1">
                        {c.products.map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/${p.slug}`}
                              className={cn(
                                '-mx-2 block rounded-sm px-2 py-1.5 text-[15px] text-navy-800 transition-colors hover:bg-navy-50 hover:text-navy-900',
                                pathname === `/${p.slug}` && 'bg-teal-50 font-medium text-navy-900',
                              )}
                            >
                              {p.name}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={`/${c.slug}`}
                            className="-mx-2 inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm font-medium text-teal-700 hover:text-teal-800"
                          >
                            View all <ArrowRight className="size-3.5" aria-hidden />
                          </Link>
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
              <Link
                href="/get-a-quote"
                className="group relative flex flex-col overflow-hidden rounded-lg bg-surface transition-shadow hover:shadow-md"
              >
                <span className="block aspect-[4/3] overflow-hidden">
                  <Art k="hero" view={2} />
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="font-display text-lg font-bold text-navy-900">{promo.title}</span>
                  <span className="mt-1 text-sm text-text-secondary">{promo.text}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                    {promo.link}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        nav={nav}
        phone={phone}
        whatsappHref={whatsappHref}
        pathname={pathname}
      />
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative inline-flex h-11 items-center rounded-md px-3.5 text-[15px] font-medium text-navy-800 transition-colors hover:bg-navy-50 hover:text-navy-900',
        active && 'text-navy-900 after:absolute after:inset-x-3.5 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-teal-500',
      )}
    >
      {children}
    </Link>
  );
}
