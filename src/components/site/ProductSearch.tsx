'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CornerDownLeft, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { NavCategory } from '@/lib/nav';

interface Hit {
  href: string;
  title: string;
  sub: string;
  kind: 'Category' | 'Product';
  score: number;
}

const synonyms: Record<string, string> = {
  label: 'sticker', labels: 'stickers', box: 'boxes', carton: 'carton', tag: 'tags', tshirt: 'dtf', 't-shirt': 'dtf', shirt: 'dtf',
  apparel: 'dtf', glass: 'uv', bottle: 'vinyl', jar: 'uv', mug: 'uv', tumbler: 'uv', transfer: 'dtf', heat: 'dtf',
};

function search(nav: NavCategory[], q: string): Hit[] {
  const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return nav.map((c) => ({ href: `/${c.slug}`, title: c.name, sub: `${c.products.length} products`, kind: 'Category' as const, score: 0 }));
  }
  const terms = words.map((w) => [w, synonyms[w]].filter(Boolean) as string[]);
  const hits: Hit[] = [];
  const score = (hay: { name: string; rest: string }) => {
    let s = 0;
    for (const alts of terms) {
      const best = Math.max(...alts.map((t) => (hay.name.startsWith(t) ? 6 : hay.name.includes(t) ? 4 : hay.rest.includes(t) ? 1 : 0)));
      if (!best) return 0;
      s += best;
    }
    return s;
  };
  for (const c of nav) {
    const s = score({ name: c.name.toLowerCase(), rest: c.slug });
    if (s) hits.push({ href: `/${c.slug}`, title: c.name, sub: `${c.products.length} products`, kind: 'Category', score: s + 1 });
    for (const p of c.products) {
      const ps = score({ name: p.name.toLowerCase(), rest: `${c.name} ${p.summary} ${p.keywords}`.toLowerCase() });
      if (ps) hits.push({ href: `/${p.slug}`, title: p.name, sub: c.name, kind: 'Product', score: ps });
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 8);
}

/** Header product finder: button + ⌘K / Ctrl+K / "/" shortcut, keyboard navigable results. */
export function ProductSearch({ nav, compact }: { nav: NavCategory[]; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const hits = useMemo(() => search(nav, q), [nav, q]);

  useEffect(() => {
    // Both header variants are mounted (one hidden by breakpoint); only the desktop one owns the shortcut.
    if (compact) return;
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [compact]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      input.current?.focus({ preventScroll: true });
    } else if (!open && d.open) d.close();
  }, [open]);

  const go = (h: Hit | undefined) => {
    if (!h) return;
    setOpen(false);
    setQ('');
    router.push(h.href);
  };

  return (
    <>
      {compact ? (
        <button type="button" onClick={() => setOpen(true)} aria-label="Search products" className="inline-flex size-11 items-center justify-center rounded-md text-navy-900 hover:bg-navy-50">
          <Search className="size-5" aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface pl-3 pr-2 text-sm text-text-secondary transition-colors hover:border-navy-200 hover:text-navy-900"
        >
          <Search className="size-4" aria-hidden />
          <span>Search products</span>
          <kbd className="ml-2 rounded border border-border bg-white px-1.5 py-0.5 font-sans text-[11px] font-semibold text-text-muted">/</kbd>
        </button>
      )}
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && setOpen(false)}
        aria-label="Search products"
        className="mx-auto mt-[12vh] w-[calc(100%-32px)] max-w-xl overflow-hidden rounded-xl border border-border bg-white p-0 text-navy-900 shadow-lg backdrop:bg-navy-900/40 backdrop:backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-5 shrink-0 text-teal-600" aria-hidden />
          <input
            ref={input}
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, hits.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                go(hits[active]);
              }
            }}
            placeholder="Boxes, labels for bottles, T-shirt transfers…"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={hits[active] ? `sr-${active}` : undefined}
            aria-label="Search products"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-text-muted"
          />
          <button type="button" onClick={() => setOpen(false)} aria-label="Close search" className="inline-flex size-9 items-center justify-center rounded-md text-navy-400 hover:bg-surface hover:text-navy-900">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <ul id="search-results" role="listbox" aria-label="Results" className="max-h-[60vh] overflow-y-auto p-2">
          {!q.trim() ? <li className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted" role="presentation">Categories</li> : null}
          {hits.map((h, i) => (
            <li
              key={h.href}
              id={`sr-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setActive(i)}
              onClick={() => go(h)}
              className={cn('flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5', i === active ? 'bg-teal-50' : 'hover:bg-surface')}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-navy-900">{h.title}</span>
                <span className="block truncate text-sm text-text-secondary">
                  {h.kind} · {h.sub}
                </span>
              </span>
              {i === active ? <CornerDownLeft className="size-4 text-teal-700" aria-hidden /> : <ArrowRight className="size-4 text-navy-300" aria-hidden />}
            </li>
          ))}
          {q.trim() && !hits.length ? (
            <li className="px-3 py-6 text-center text-[15px] text-text-secondary">
              No match for “{q}”. <a href={`/get-a-quote`} className="font-semibold text-teal-700 underline underline-offset-4">Describe it in a quote request</a> and we&apos;ll suggest the right product.
            </li>
          ) : null}
        </ul>
      </dialog>
    </>
  );
}
