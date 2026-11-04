import Link from 'next/link';
import { Check } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { CopyButton } from '@/components/site/CopyButton';
import { WhatsAppIcon } from '@/components/site/icons/WhatsApp';
import { getCatalog } from '@/lib/catalog';
import { metaFor } from '@/lib/seo';
import { buildWhatsAppUrl, whatsappTexts } from '@/lib/whatsapp';

export const metadata = metaFor('/get-a-quote/thank-you', { noindex: true, ogKey: 'get-a-quote' });

const next = [
  'We review your specifications',
  'You receive a quotation on WhatsApp or email',
  'We share an artwork proof for approval',
  'Production and dispatch',
];

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ ref?: string | string[]; kind?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.ref) ? sp.ref[0] : sp.ref;
  const ref = raw && /^VP-\d{4}-\d{6}$/.test(raw) ? raw : null;
  const isMessage = (Array.isArray(sp.kind) ? sp.kind[0] : sp.kind) === 'message';
  const { categories } = await getCatalog();
  const wa = buildWhatsAppUrl(ref ? `Hi VasuPrint, I've sent ${isMessage ? 'a message' : 'a quote request'} (${ref}).` : whatsappTexts.global);
  return (
    <section className="section-y">
      <div className="container-narrow text-center">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-teal-50 text-teal-500">
          <Check className="size-8" strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className="text-h1 mt-6 text-navy-900">{isMessage ? 'Thank you — we\u2019ve received your message' : 'Thank you — we\u2019ve received your request'}</h1>
        {ref ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-5 pr-1 sm:gap-3">
            <span className="text-sm text-text-muted max-[379px]:sr-only">Your reference</span>
            <span className="whitespace-nowrap font-display text-lg font-bold tabular-nums tracking-wide text-navy-900">{ref}</span>
            <CopyButton text={ref} label="Copy reference" />
          </div>
        ) : null}
        <p className="text-lead mx-auto mt-5 max-w-[52ch] text-text-secondary">
          {ref ? 'We\u2019ve emailed you a copy. ' : ''}Our team will review your {isMessage ? 'message' : 'specifications'} and get back to you on WhatsApp or email, usually
          within one business day.
        </p>

        <ol className="mx-auto mt-10 grid max-w-xl gap-3 text-left sm:grid-cols-2">
          {next.map((s, i) => (
            <li key={s} className="flex items-start gap-3 rounded-lg border border-border p-4">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-navy-800 font-display text-[13px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-[15px] leading-snug text-navy-900">{s}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href={wa} size="lg" variant="whatsapp" icon={<WhatsAppIcon />}>
            Chat on WhatsApp
          </LinkButton>
          <LinkButton href="/" size="lg" variant="secondary" arrow>
            Continue browsing
          </LinkButton>
        </div>

        <ul className="mt-12 flex flex-wrap justify-center gap-2 border-t border-border pt-8 text-[15px]">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/${c.slug}`} className="inline-flex h-10 items-center rounded-full border border-border px-4 font-medium text-navy-800 hover:border-navy-800 hover:bg-navy-50">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
