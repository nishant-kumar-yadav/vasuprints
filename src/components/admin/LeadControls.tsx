'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { BellRing, CheckCircle2, ChevronDown, Clock, Mail, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { addLeadNote, deleteLead, resendLeadEmail, setFollowUp, updateLeadStatus } from '@/app/admin/(panel)/leads/actions';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { LEAD_STATUSES, type EmailStatus, type LeadStatus } from '@/schemas/lead';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from './Toaster';
import { formatDateTime, statusLabel } from './ui';

export function LeadStatusSelect({ reference, status }: { reference: string; status: LeadStatus }) {
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-navy-900">
      Status
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as LeadStatus;
          const prev = value;
          setValue(next);
          start(async () => {
            const r = await updateLeadStatus({ reference, status: next });
            if (r.ok) toast(`Status updated to ${statusLabel[next]}`);
            else {
              setValue(prev);
              toast(r.error, 'error');
            }
          });
        }}
        className="h-11 rounded-md border border-border bg-white px-3 text-[15px] font-normal focus:border-teal-500 focus:outline-none focus:ring-[3px] focus:ring-teal-100 disabled:opacity-60"
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {statusLabel[s]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LeadNotes({ reference, notes }: { reference: string; notes: { body: string; at: string }[] }) {
  const [list, setList] = useState(notes);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await addLeadNote({ reference, body });
            if (r.ok) {
              setList((l) => [...l, r.data]);
              setBody('');
              setError(null);
              toast('Note added');
            } else setError(r.fields?.body ?? r.error);
          });
        }}
        className="flex flex-col gap-2"
      >
        <label htmlFor="note" className="sr-only">
          Add a note
        </label>
        <textarea
          id="note"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Add a note — call outcome, price quoted, follow-up date…"
          className={cn(
            'w-full resize-y rounded-md border bg-white px-3 py-2.5 text-[15px] focus:outline-none focus:ring-[3px]',
            error ? 'border-danger focus:ring-danger/15' : 'border-border focus:border-teal-500 focus:ring-teal-100',
          )}
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" size="sm" variant="secondary" loading={pending} disabled={!body.trim()} className="self-end">
          Add note
        </Button>
      </form>
      {list.length ? (
        <ol className="flex flex-col gap-3 border-l-2 border-border pl-4">
          {[...list].reverse().map((n, i) => (
            <li key={`${n.at}-${i}`} className="relative">
              <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-teal-500 ring-4 ring-white" aria-hidden />
              <p className="whitespace-pre-wrap text-[15px] text-navy-900">{n.body}</p>
              <p className="text-xs text-text-muted">{formatDateTime(n.at)}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-text-muted">No notes yet.</p>
      )}
    </div>
  );
}

const emailIcon: Record<EmailStatus, React.ReactNode> = {
  sent: <CheckCircle2 className="size-4 text-success" aria-hidden />,
  failed: <XCircle className="size-4 text-danger" aria-hidden />,
  pending: <Clock className="size-4 text-warning" aria-hidden />,
  skipped: <Mail className="size-4 text-text-muted" aria-hidden />,
};

export function EmailDelivery({
  reference,
  which,
  label,
  status,
  error,
}: {
  reference: string;
  which: 'admin' | 'customer';
  label: string;
  status: EmailStatus;
  error?: string;
}) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[15px] font-medium text-navy-900">
          {emailIcon[status]}
          {label}
        </p>
        <p className="truncate pl-6 text-sm capitalize text-text-muted" title={error}>
          {status}
          {error ? ` — ${error}` : ''}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        loading={pending}
        icon={<RefreshCw className="size-4" aria-hidden />}
        onClick={() =>
          start(async () => {
            const r = await resendLeadEmail({ reference, which });
            toast(r.ok ? 'Email sent' : r.error, r.ok ? 'success' : 'error');
            router.refresh();
          })
        }
      >
        Resend
      </Button>
    </div>
  );
}

export function DeleteLead({ reference }: { reference: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <>
      <Button variant="outline" size="sm" icon={<Trash2 className="size-4" aria-hidden />} onClick={() => setOpen(true)} className="border-danger/30 text-danger hover:border-danger hover:bg-danger/5">
        Delete lead
      </Button>
      <ConfirmDialog
        open={open}
        title={`Delete ${reference}?`}
        body="This permanently deletes the lead, its notes and all uploaded artwork files. Use it for spam or when a customer asks for their data to be erased."
        typeToConfirm={reference}
        confirmLabel="Delete permanently"
        pending={pending}
        onClose={() => setOpen(false)}
        onConfirm={(confirm) =>
          start(async () => {
            const r = await deleteLead({ reference, confirm });
            if (r.ok) {
              toast(`${reference} deleted`);
              router.replace('/admin/leads');
            } else toast(r.error, 'error');
          })
        }
      />
    </>
  );
}

function daysFromToday(days: number) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(Date.now() + days * 864e5));
}

export function FollowUp({ reference, date }: { reference: string; date: string | null }) {
  const [value, setValue] = useState(date ?? '');
  const [pending, start] = useTransition();
  const toast = useToast();
  const save = (next: string | null) =>
    start(async () => {
      const r = await setFollowUp({ reference, date: next });
      if (r.ok) {
        setValue(next ?? '');
        toast(next ? 'Reminder set' : 'Reminder cleared');
      } else toast(r.error, 'error');
    });
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="follow-up" className="flex items-center gap-1.5 text-sm font-medium text-navy-900">
        <BellRing className="size-4 text-teal-700" aria-hidden /> Follow up on
      </label>
      <div className="flex gap-2">
        <input
          id="follow-up"
          type="date"
          value={value}
          disabled={pending}
          onChange={(e) => save(e.target.value || null)}
          className="h-11 min-w-0 flex-1 rounded-md border border-border bg-white px-3 text-[15px] focus:border-teal-500 focus:outline-none focus:ring-[3px] focus:ring-teal-100"
        />
        {value ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => save(null)} disabled={pending} className="h-11">
            Clear
          </Button>
        ) : null}
      </div>
      {!value ? (
        <div className="flex flex-wrap gap-1.5">
          {[
            ['Tomorrow', 1],
            ['In 3 days', 3],
            ['Next week', 7],
          ].map(([l, d]) => (
            <button
              key={l}
              type="button"
              disabled={pending}
              onClick={() => save(daysFromToday(d as number))}
              className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-secondary hover:border-teal-500 hover:text-navy-900"
            >
              {l}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Ready-made WhatsApp replies; each opens WhatsApp with the text filled in for this customer. */
export function WhatsAppTemplates({ phone, firstName, reference, product }: { phone: string; firstName: string; reference: string; product: string }) {
  const digits = phone.replace(/\D/g, '');
  const templates = [
    ['Acknowledge', `Hello ${firstName}, this is VasuPrint. Thank you for your enquiry ${reference} for ${product}. We're reviewing your requirements and will share a quotation shortly.`],
    ['Ask for artwork', `Hello ${firstName}, for your request ${reference} could you please share your artwork (CDR, AI, PDF or high-resolution PNG) and the final size? We'll prepare a proof for approval.`],
    ['Send quotation', `Hello ${firstName}, please find the quotation for ${reference} (${product}) attached. Let us know if you'd like to change the quantity, material or finish.`],
    ['Proof ready', `Hello ${firstName}, the artwork proof for ${reference} is ready. Please review and reply "Approved" or share any changes.`],
    ['Dispatched', `Hello ${firstName}, your order ${reference} has been dispatched. We'll share the tracking details shortly. Thank you for choosing VasuPrint!`],
  ] as const;
  return (
    <details className="group rounded-lg border border-border">
      <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-3 text-[15px] font-medium text-navy-900 [&::-webkit-details-marker]:hidden">
        WhatsApp message templates
        <ChevronDown className="size-4 text-navy-400 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <ul className="flex flex-col border-t border-border p-1.5">
        {templates.map(([label, text]) => (
          <li key={label}>
            <a
              href={`https://wa.me/${digits}?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-md px-2.5 py-2 hover:bg-surface"
            >
              <span className="block text-sm font-semibold text-navy-900">{label}</span>
              <span className="line-clamp-2 text-xs text-text-secondary">{text}</span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
