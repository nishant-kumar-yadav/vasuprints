'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Loader2, Search } from 'lucide-react';

/** Debounced (300 ms) search box synced to `?q=`. Resets pagination. */
export function SearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');
  const [pending, start] = useTransition();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set('q', value.trim());
      else next.delete('q');
      next.delete('page');
      start(() => router.replace(`${path}${next.size ? `?${next}` : ''}`, { scroll: false }));
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <label className="relative block w-full sm:max-w-xs">
      <span className="sr-only">Search</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-border bg-white pl-9 pr-9 text-[15px] focus:border-teal-500 focus:outline-none focus:ring-[3px] focus:ring-teal-100"
      />
      {pending ? <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-navy-400" aria-hidden /> : null}
    </label>
  );
}
