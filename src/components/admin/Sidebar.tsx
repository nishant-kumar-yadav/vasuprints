'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExternalLink, FolderTree, Inbox, LayoutDashboard, LogOut, Menu, Package, X } from 'lucide-react';
import { LogoMark } from '@/components/site/Logo';
import { cn } from '@/lib/cn';

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads', label: 'Leads', icon: Inbox, badge: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
];

function Nav({ newLeads, logout, onNavigate }: { newLeads: number; logout: () => Promise<void>; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex h-full flex-col gap-1 p-3">
      {items.map(({ href, label, icon: Icon, exact, badge }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-11 items-center gap-3 rounded-md px-3 text-[15px] font-medium transition-colors',
              active ? 'bg-white/10 text-white' : 'text-navy-200 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon className={cn('size-[18px]', active ? 'text-teal-300' : 'text-navy-300')} aria-hidden />
            <span className="flex-1">{label}</span>
            {badge && newLeads > 0 ? (
              <span className="rounded-full bg-teal-500 px-2 py-0.5 text-xs font-bold tabular-nums text-navy-900" aria-label={`${newLeads} new`}>
                {newLeads}
              </span>
            ) : null}
          </Link>
        );
      })}
      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3">
        <a href="/" target="_blank" rel="noreferrer" className="flex h-11 items-center gap-3 rounded-md px-3 text-[15px] font-medium text-navy-200 hover:bg-white/5 hover:text-white">
          <ExternalLink className="size-[18px] text-navy-300" aria-hidden />
          View site
        </a>
        <form action={logout}>
          <button type="submit" className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-[15px] font-medium text-navy-200 hover:bg-white/5 hover:text-white">
            <LogOut className="size-[18px] text-navy-300" aria-hidden />
            Log out
          </button>
        </form>
      </div>
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <LogoMark inverse className="size-8" />
      <span className="font-display text-lg font-extrabold tracking-[-0.03em] text-white">
        Vasu<span className="text-teal-300">Print</span>
      </span>
    </Link>
  );
}

export function Sidebar({ newLeads, logout }: { newLeads: number; logout: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const [lastPath, setLastPath] = useState(path);
  if (lastPath !== path) {
    setLastPath(path);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-navy-900 lg:flex">
        <div className="flex h-16 items-center px-5">
          <Brand />
        </div>
        <Nav newLeads={newLeads} logout={logout} />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-navy-900 px-4 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="relative inline-flex size-11 items-center justify-center rounded-md text-white hover:bg-white/10"
        >
          <Menu className="size-5" aria-hidden />
          {newLeads > 0 ? <span className="absolute right-2 top-2 size-2 rounded-full bg-teal-400" aria-hidden /> : null}
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 animate-[fade-in_160ms] bg-navy-900/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[272px] max-w-[85%] flex-col bg-navy-900 shadow-lg">
            <div className="flex h-14 items-center justify-between px-4">
              <Brand />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="inline-flex size-11 items-center justify-center rounded-md text-white hover:bg-white/10">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <Nav newLeads={newLeads} logout={logout} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
