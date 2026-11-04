import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Download, Inbox, Paperclip } from 'lucide-react';
import { SearchInput } from '@/components/admin/SearchInput';
import { Card, EmptyState, PageHeader, StatusBadge, formatDate, statusLabel, timeAgo } from '@/components/admin/ui';
import { buttonClasses } from '@/components/ui/Button';
import { leadCounts, leadQuerySchema, listLeads } from '@/lib/admin/leads';
import { cn } from '@/lib/cn';
import { LEAD_STATUSES } from '@/models/lead';

export const metadata: Metadata = { title: 'Leads' };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function LeadsPage({ searchParams }: { searchParams: SP }) {
  const raw = await searchParams;
  const one = (k: string) => (Array.isArray(raw[k]) ? raw[k][0] : raw[k]);
  const q = leadQuerySchema.parse({ status: one('status'), q: one('q'), page: one('page') });
  const [counts, { rows, total, pages }] = await Promise.all([leadCounts(), listLeads(q)]);

  const href = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status: q.status === 'all' ? undefined : q.status, q: q.q || undefined, page: q.page > 1 ? q.page : undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== '') p.set(k, String(v));
    return `/admin/leads${p.size ? `?${p}` : ''}`;
  };
  const exportHref = `/api/admin/leads/export?status=${q.status}${q.q ? `&q=${encodeURIComponent(q.q)}` : ''}`;
  const tabs = ['all', ...LEAD_STATUSES] as const;

  return (
    <>
      <PageHeader
        title="Leads"
        description="Quote requests and contact messages, newest first."
        actions={
          <a href={exportHref} className={buttonClasses('outline', 'md')} download>
            <Download className="size-4" aria-hidden />
            Export CSV
          </a>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {tabs.map((t) => {
            const active = q.status === t;
            return (
              <Link
                key={t}
                href={href({ status: t === 'all' ? undefined : t, page: undefined })}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors',
                  active ? 'bg-navy-900 text-white' : 'text-text-secondary hover:bg-white hover:text-navy-900',
                )}
              >
                {t === 'all' ? 'All' : statusLabel[t]}
                <span className={cn('tabular-nums text-xs', active ? 'text-navy-200' : 'text-text-muted')}>{counts[t]}</span>
              </Link>
            );
          })}
        </nav>
        <SearchInput placeholder="Search name, company, phone, reference…" />
      </div>

      <Card padded={false}>
        {rows.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-6" aria-hidden />}
            title={counts.all === 0 ? 'No leads yet' : 'No leads match'}
            body={counts.all === 0 ? 'Share your site link — new quote requests will appear here.' : 'Try another search or status.'}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[15px]">
                <thead className="border-b border-border bg-surface text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Reference</th>
                    <th className="px-3 py-3 font-semibold">Customer</th>
                    <th className="px-3 py-3 font-semibold">Product</th>
                    <th className="px-3 py-3 font-semibold">Qty</th>
                    <th className="px-3 py-3 font-semibold">City</th>
                    <th className="px-3 py-3 font-semibold">
                      <span className="sr-only">Files</span>
                      <Paperclip className="size-3.5" aria-hidden />
                    </th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((l) => (
                    <tr key={l.reference} className="group relative hover:bg-surface">
                      <td className="px-5 py-3.5 align-top">
                        <Link href={`/admin/leads/${l.reference}`} className="font-semibold tabular-nums text-navy-900 after:absolute after:inset-0 group-hover:text-teal-700">
                          {l.reference}
                        </Link>
                        <div className="text-sm text-text-muted" title={formatDate(l.createdAt)}>
                          {timeAgo(l.createdAt)}
                        </div>
                      </td>
                      <td className="max-w-[220px] px-3 py-3.5 align-top">
                        <div className={cn('truncate', l.status === 'new' ? 'font-semibold' : 'font-medium')}>{l.customer.name}</div>
                        <div className="truncate text-sm text-text-muted">{l.customer.company || l.customer.email}</div>
                      </td>
                      <td className="max-w-[220px] px-3 py-3.5 align-top">
                        <div className="truncate">{l.request.productName ?? l.request.categoryName}</div>
                        {l.kind === 'message' ? <div className="text-sm text-text-muted">Contact message</div> : null}
                      </td>
                      <td className="px-3 py-3.5 align-top tabular-nums">{l.request.quantity}</td>
                      <td className="px-3 py-3.5 align-top">{l.request.deliveryCity || '—'}</td>
                      <td className="px-3 py-3.5 align-top tabular-nums text-text-secondary">{l.files.length || ''}</td>
                      <td className="px-5 py-3.5 align-top">
                        <StatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile list */}
            <ul className="divide-y divide-border md:hidden">
              {rows.map((l) => (
                <li key={l.reference}>
                  <Link href={`/admin/leads/${l.reference}`} className="flex flex-col gap-1 px-4 py-3.5 active:bg-surface">
                    <span className="flex items-center justify-between gap-3">
                      <span className={cn('truncate', l.status === 'new' ? 'font-semibold' : 'font-medium')}>{l.customer.name}</span>
                      <StatusBadge status={l.status} />
                    </span>
                    <span className="truncate text-sm text-text-secondary">
                      {l.request.productName ?? l.request.categoryName} · {l.request.quantity}
                      {l.request.deliveryCity ? ` · ${l.request.deliveryCity}` : ''}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-text-muted">
                      <span className="tabular-nums">{l.reference}</span>· {timeAgo(l.createdAt)}
                      {l.files.length ? (
                        <span className="inline-flex items-center gap-0.5">
                          · <Paperclip className="size-3" aria-hidden /> {l.files.length}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      {pages > 1 ? (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm text-text-secondary">
          <span>
            Page {q.page} of {pages} · {total} leads
          </span>
          <span className="flex gap-2">
            {q.page > 1 ? (
              <Link href={href({ page: q.page - 1 })} className={buttonClasses('outline', 'sm')}>
                <ChevronLeft className="size-4" aria-hidden /> Previous
              </Link>
            ) : null}
            {q.page < pages ? (
              <Link href={href({ page: q.page + 1 })} className={buttonClasses('outline', 'sm')}>
                Next <ChevronRight className="size-4" aria-hidden />
              </Link>
            ) : null}
          </span>
        </nav>
      ) : null}
    </>
  );
}
