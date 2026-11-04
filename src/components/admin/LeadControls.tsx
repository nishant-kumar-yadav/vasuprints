'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CheckCircle2, Clock, Mail, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { addLeadNote, deleteLead, resendLeadEmail, updateLeadStatus } from '@/app/admin/(panel)/leads/actions';
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
