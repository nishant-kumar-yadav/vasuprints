'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Mail, Paperclip, Pencil } from 'lucide-react';
import { Button, LinkButton } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/site/icons/WhatsApp';
import { buildQuoteMessage, quoteSubject, type QuoteValues } from '@/lib/quote';
import { buildMailtoUrl, buildWhatsAppUrl } from '@/lib/whatsapp';

/** P1 hand-off (UI-UX §4.5): the request is ready; the buyer sends it on WhatsApp or by email. */
export function HandoffPanel({
  values,
  productName,
  categoryName,
  fileNames,
  onEdit,
  onSent,
}: {
  values: QuoteValues;
  productName?: string;
  categoryName?: string;
  fileNames: string[];
  onEdit: () => void;
  onSent: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const message = buildQuoteMessage({ values, productName, categoryName, fileNames });

  useEffect(() => {
    heading.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    heading.current?.focus({ preventScroll: true });
  }, []);

  const markSent = () => {
    setSent(true);
    onSent();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the text is visible to copy manually */
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-5">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <Check className="size-7" strokeWidth={2.5} aria-hidden />
        </span>
        <div>
          <h2 ref={heading} tabIndex={-1} className="text-h2 text-navy-900 outline-none">
            Your request is ready to send
          </h2>
          <p className="text-lead mt-3 text-text-secondary">
            Choose how you&apos;d like to send it — your details are already filled in.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <LinkButton href={buildWhatsAppUrl(message)} size="lg" arrow icon={<WhatsAppIcon className="fill-navy-900" />} onClick={markSent}>
          Send on WhatsApp
        </LinkButton>
        <LinkButton
          href={buildMailtoUrl(quoteSubject(productName, categoryName), message)}
          size="lg"
          variant="outline"
          icon={<Mail className="size-5" aria-hidden />}
          onClick={markSent}
        >
          Send by email
        </LinkButton>
      </div>

      {fileNames.length ? (
        <p className="flex items-start gap-2.5 rounded-lg bg-teal-50 p-4 text-[15px] text-navy-800">
          <Paperclip className="mt-0.5 size-5 shrink-0 text-teal-700" aria-hidden />
          <span>
            Remember to attach your artwork in the WhatsApp chat or email:{' '}
            <strong className="font-semibold">{fileNames.join(', ')}</strong>
          </span>
        </p>
      ) : (
        <p className="text-[15px] text-text-secondary">Have artwork files? Attach them in the WhatsApp chat or email.</p>
      )}

      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="text-sm font-medium text-navy-900">Message preview</p>
          <button type="button" onClick={copy} className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-teal-700 hover:bg-white">
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? 'Copied' : 'Copy text'}
          </button>
        </div>
        <pre className="whitespace-pre-wrap break-words px-5 py-4 font-sans text-[15px] leading-relaxed text-text-secondary">{message}</pre>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button variant="ghost" icon={<Pencil className="size-4" aria-hidden />} onClick={onEdit} className="-ml-3">
          Edit request
        </Button>
        {sent ? (
          <Link href="/get-a-quote/thank-you" className="text-[15px] font-semibold text-teal-700 underline-offset-4 hover:underline">
            I&apos;ve sent my request →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
