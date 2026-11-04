import Link from 'next/link';
import { Check } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/site/icons/WhatsApp';
import { categories } from '@/lib/catalog';
import { metaFor } from '@/lib/seo';
import { buildWhatsAppUrl, whatsappTexts } from '@/lib/whatsapp';

export const metadata = metaFor('/get-a-quote/thank-you', { noindex: true });

const next = [
  'We review your specifications',
  'You receive a quotation on WhatsApp or email',
  'We share an artwork proof for approval',
  'Production and dispatch',
];

export default function ThankYouPage() {
  return (
    <section className="section-y">
      <div className="container-narrow text-center">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-teal-50 text-teal-500">
          <Check className="size-8" strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className="text-h1 mt-6 text-navy-900">Thank you — we&apos;ve received your request</h1>
        <p className="text-lead mx-auto mt-5 max-w-[52ch] text-text-secondary">
          Our team will review your specifications and get back to you on WhatsApp or email, usually within one business day.
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
          <LinkButton href={buildWhatsAppUrl(whatsappTexts.global)} size="lg" variant="whatsapp" icon={<WhatsAppIcon />}>
            Chat on WhatsApp
          </LinkButton>
          <LinkButton href="/" size="lg" variant="secondary" arrow>
            Continue browsing
          </LinkButton>
        </div>

        <ul className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-border pt-8 text-[15px]">
          {categories.slice(0, 3).map((c) => (
            <li key={c.slug}>
              <Link href={`/${c.slug}`} className="font-medium text-teal-700 hover:text-teal-800">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
