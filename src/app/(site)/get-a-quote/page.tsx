import { Suspense } from 'react';
import { Lock } from 'lucide-react';
import { ContactActions } from '@/components/quote/ContactActions';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { quoteFormConfig } from '@/lib/quote-config';
import { quoteCatalog } from '@/lib/quote-catalog';
import { getCatalog } from '@/lib/catalog';
import { metaFor } from '@/lib/seo';

export const metadata = metaFor('/get-a-quote');

const next = [
  'We review your specifications',
  'You receive a quotation on WhatsApp or email',
  'We share an artwork proof for approval',
  'Production and dispatch',
];

export default async function QuotePage() {
  const catalog = await getCatalog();
  return (
    <div className="bg-surface pb-20 pt-10 lg:pb-28 lg:pt-14">
      <div className="container-site grid gap-8 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-border bg-white p-5 sm:p-8 lg:p-12">
            <p className="text-eyebrow text-teal-700">GET A QUOTE</p>
            <h1 className="text-h1 mt-3 text-navy-900">Tell us what you need</h1>
            <p className="text-lead mt-4 max-w-[56ch] text-text-secondary">
              Share your specifications and our team will get back to you with product options and a quotation.
            </p>
            <div className="mt-10">
              <Suspense fallback={<div className="h-[1200px]" aria-hidden />}>
                <QuoteForm catalog={quoteCatalog(catalog)} {...quoteFormConfig()} />
              </Suspense>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4" aria-label="About your quote">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="rounded-xl bg-navy-800 p-6 text-white sm:p-8">
              <h2 className="font-display text-xl font-bold">What happens next</h2>
              <ol className="relative mt-6 flex flex-col gap-5">
                <span className="absolute bottom-4 left-[15px] top-4 border-l-[1.5px] border-dashed border-teal-500/60" aria-hidden />
                {next.map((s, i) => (
                  <li key={s} className="relative flex items-start gap-4">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-bold text-navy-900 ring-4 ring-navy-800">
                      {i + 1}
                    </span>
                    <span className="pt-1 text-[15px] leading-snug text-navy-100">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-navy-900">Prefer to talk?</h2>
              <div className="mt-4">
                <ContactActions />
              </div>
            </div>
            <p className="flex items-start gap-2.5 px-2 text-sm text-text-secondary">
              <Lock className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden />
              Your files stay private and are used only for your order.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
