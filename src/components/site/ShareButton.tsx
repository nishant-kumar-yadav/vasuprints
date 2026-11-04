'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

/** Native share sheet on phones (WhatsApp, email…); copies the link elsewhere. */
export function ShareButton({ title, url, label = 'Share this product with your team' }: { title: string; url: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
            await navigator.share({ title, url });
            return;
          }
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* dismissed or blocked */
        }
      }}
      className="inline-flex items-center gap-1.5 self-center rounded-md px-2 py-1.5 text-sm font-medium text-text-secondary hover:text-navy-900"
    >
      {copied ? <Check className="size-4 text-success" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
      <span aria-live="polite">{copied ? 'Link copied' : label}</span>
    </button>
  );
}
