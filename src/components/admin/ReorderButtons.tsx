'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ActionResult } from '@/lib/admin/action';
import { useToast } from './Toaster';

export function ReorderButtons({
  id,
  first,
  last,
  label,
  move,
}: {
  id: string;
  first: boolean;
  last: boolean;
  label: string;
  move: (input: { id: string; dir: 'up' | 'down' }) => Promise<ActionResult<{ moved: boolean }>>;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const go = (dir: 'up' | 'down') =>
    start(async () => {
      const r = await move({ id, dir });
      if (!r.ok) toast(r.error, 'error');
      router.refresh();
    });
  const btn = 'inline-flex size-8 items-center justify-center rounded-md text-navy-400 hover:bg-surface hover:text-navy-900 disabled:opacity-30';
  return (
    <span className={cn('flex gap-0.5', pending && 'opacity-50')}>
      <button type="button" className={btn} disabled={first || pending} onClick={() => go('up')} aria-label={`Move ${label} up`}>
        <ArrowUp className="size-4" aria-hidden />
      </button>
      <button type="button" className={btn} disabled={last || pending} onClick={() => go('down')} aria-label={`Move ${label} down`}>
        <ArrowDown className="size-4" aria-hidden />
      </button>
    </span>
  );
}
