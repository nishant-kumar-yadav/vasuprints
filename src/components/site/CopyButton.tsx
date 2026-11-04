'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="inline-flex size-11 items-center justify-center rounded-md text-navy-500 hover:bg-white hover:text-navy-900 active:bg-white"
      aria-label={done ? 'Copied' : `${label} ${text}`}
    >
      {done ? <Check className="size-4 text-success" aria-hidden /> : <Copy className="size-4" aria-hidden />}
    </button>
  );
}
