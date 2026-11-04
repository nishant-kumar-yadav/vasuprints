'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * Destructive-action confirmation. When `typeToConfirm` is set the buyer-facing identifier (reference or
 * slug) must be typed before the action button enables.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Delete',
  typeToConfirm,
  pending,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  typeToConfirm?: string;
  pending?: boolean;
  onConfirm: (typed: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState('');
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const ready = !typeToConfirm || typed.trim() === typeToConfirm;
  return (
    <dialog
      ref={ref}
      onClose={() => {
        setTyped('');
        onClose();
      }}
      className="m-auto w-[calc(100%-32px)] max-w-md rounded-xl border border-border bg-white p-0 text-navy-900 shadow-lg backdrop:bg-navy-900/50"
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onConfirm(typed.trim());
        }}
        className="flex flex-col gap-4 p-6"
      >
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <div className="text-[15px] text-text-secondary">{body}</div>
        {typeToConfirm ? (
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span>
              Type <code className="rounded bg-surface-2 px-1.5 py-0.5 font-semibold">{typeToConfirm}</code> to confirm
            </span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="h-11 rounded-md border border-border px-3 text-base focus:border-teal-500 focus:outline-none focus:ring-[3px] focus:ring-teal-100"
            />
          </label>
        ) : null}
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => ref.current?.close()}>
            Cancel
          </Button>
          <Button type="submit" disabled={!ready} loading={pending} className="bg-danger text-white hover:bg-danger/90 active:bg-danger">
            {confirmLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
