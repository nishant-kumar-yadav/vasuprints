import { Plus } from 'lucide-react';
import type { Faq as FaqItem } from '@/lib/catalog';
import { JsonLd, faqLd } from '@/lib/seo';
import { RichText } from './RichText';

/** FAQ accordion on native <details>: keyboard and screen-reader friendly with zero JS. */
export function Faq({ items, jsonLd = true }: { items: FaqItem[]; jsonLd?: boolean }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {jsonLd ? <JsonLd data={faqLd(items)} /> : null}
      {items.map((f) => (
        <details key={f.q} className="group/faq">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <h3 className="text-h4 text-navy-900">{f.q}</h3>
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-navy-200 text-navy-800 transition-[transform,background-color] duration-220 group-open/faq:rotate-45 group-open/faq:border-teal-500 group-open/faq:bg-teal-50">
              <Plus className="size-4" aria-hidden />
            </span>
          </summary>
          <p className="max-w-[68ch] pb-6 pr-12 text-text-secondary">
            <RichText text={f.a} />
          </p>
        </details>
      ))}
    </div>
  );
}
