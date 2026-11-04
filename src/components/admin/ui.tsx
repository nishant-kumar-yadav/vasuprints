import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { LeadStatus } from '@/schemas/lead';

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back}
        <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-navy-900">{title}</h1>
        {description ? <p className="mt-1.5 text-[15px] text-text-secondary">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ title, actions, children, className, padded = true }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={cn('rounded-xl border border-border bg-white', className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <h2 className="font-display text-base font-bold text-navy-900">{title}</h2>
          {actions}
        </div>
      ) : null}
      <div className={padded ? 'p-5' : undefined}>{children}</div>
    </section>
  );
}

export const statusLabel: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};

const statusTone: Record<LeadStatus, string> = {
  new: 'bg-teal-50 text-teal-800 ring-teal-200',
  contacted: 'bg-navy-50 text-navy-700 ring-navy-200',
  quoted: 'bg-[#fff7e6] text-warning ring-[#f5d9a6]',
  won: 'bg-[#e8f6ec] text-success ring-[#b9e2c5]',
  lost: 'bg-surface-2 text-text-muted ring-border',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', statusTone[status])}>
      {statusLabel[status]}
    </span>
  );
}

export function PublishBadge({ status }: { status: 'draft' | 'published' }) {
  return status === 'published' ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f6ec] px-2.5 py-0.5 text-xs font-semibold text-success ring-1 ring-inset ring-[#b9e2c5]">
      <span className="size-1.5 rounded-full bg-success" aria-hidden />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-text-secondary ring-1 ring-inset ring-border">
      <span className="size-1.5 rounded-full bg-navy-300" aria-hidden />
      Draft
    </span>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-teal-50 text-teal-600">{icon}</span>
      <p className="mt-4 font-display text-lg font-bold text-navy-900">{title}</p>
      {body ? <p className="mt-1 max-w-sm text-[15px] text-text-secondary">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warning'; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 text-[15px]',
        tone === 'warning' ? 'border-warning/30 bg-warning/5 text-navy-900' : 'border-teal-200 bg-teal-50 text-navy-800',
      )}
    >
      {children}
    </div>
  );
}

const ist = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
const istTime = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });

export function formatDate(d: Date | string) {
  return ist.format(new Date(d));
}
export function formatDateTime(d: Date | string) {
  const x = new Date(d);
  return `${ist.format(x)}, ${istTime.format(x)}`;
}
export function timeAgo(d: Date | string, now = Date.now()) {
  const s = Math.round((now - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days} d ago`;
  return formatDate(d);
}
