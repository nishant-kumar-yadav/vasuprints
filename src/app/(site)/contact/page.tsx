import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { WhatsAppIcon } from '@/components/site/icons/WhatsApp';
import { MapEmbed } from '@/components/site/MapEmbed';
import { business, formatAddress, isSet, show } from '@/config/business';
import { contact } from '@/content/pages/about';
import { quoteCatalog } from '@/lib/quote-catalog';
import { metaFor } from '@/lib/seo';
import { buildWhatsAppUrl, telUrl, whatsappTexts } from '@/lib/whatsapp';

export const metadata = metaFor('/contact');

export default function ContactPage() {
  const tel = telUrl();
  const rows = [
    { icon: <Phone className="size-[22px]" strokeWidth={1.5} aria-hidden />, label: 'Phone', value: show(business.phoneDisplay), action: tel ? { href: tel, text: 'Call' } : null },
    {
      icon: <WhatsAppIcon className="size-[22px] fill-teal-700" />,
      label: 'WhatsApp',
      value: isSet(business.whatsappE164) ? business.phoneDisplay : '—',
      action: { href: buildWhatsAppUrl(whatsappTexts.global), text: 'Chat on WhatsApp' },
    },
    {
      icon: <Mail className="size-[22px]" strokeWidth={1.5} aria-hidden />,
      label: 'Email',
      value: show(business.email),
      action: isSet(business.email) ? { href: `mailto:${business.email}`, text: 'Send email' } : null,
    },
    {
      icon: <MapPin className="size-[22px]" strokeWidth={1.5} aria-hidden />,
      label: 'Address',
      value: formatAddress(),
      action: isSet(business.mapsUrl) ? { href: business.mapsUrl, text: 'Get directions' } : null,
    },
    { icon: <Clock className="size-[22px]" strokeWidth={1.5} aria-hidden />, label: 'Business hours', value: show(business.businessHours), action: null },
  ];

  return (
    <>
      <section className="pb-12 pt-10 lg:pb-16 lg:pt-16" aria-labelledby="contact-title">
        <div className="container-site max-w-[1240px]">
          <p className="text-eyebrow text-teal-700">{contact.eyebrow}</p>
          <h1 id="contact-title" className="text-h1 mt-4 max-w-[20ch] text-navy-900">
            {contact.title}
          </h1>
          <p className="text-lead mt-5 max-w-[60ch] text-text-secondary">{contact.text}</p>
        </div>
      </section>

      <section className="bg-surface pb-16 pt-12 lg:pb-24 lg:pt-16" aria-label="Contact details and form">
        <div className="container-site grid gap-8 lg:grid-cols-12">
          <ul className="flex flex-col divide-y divide-border self-start rounded-xl border border-border bg-white lg:col-span-5">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-4 p-5 sm:p-6">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">{r.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-muted">{r.label}</p>
                  <p className="break-words font-medium text-navy-900">{r.value}</p>
                </div>
                {r.action ? (
                  <a
                    href={r.action.href}
                    {...(r.action.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="shrink-0 rounded-md px-2 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                  >
                    {r.action.text}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-border bg-white p-6 sm:p-8 lg:col-span-7 lg:p-10">
            <h2 className="text-h3 text-navy-900">{contact.formTitle}</h2>
            <p className="mt-2 text-[15px] text-text-secondary">
              {contact.formSub}{' '}
              <Link href="/get-a-quote" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
                Open the quote form <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </p>
            <div className="mt-8">
              <Suspense fallback={<div className="h-[640px]" aria-hidden />}>
                <QuoteForm catalog={quoteCatalog()} compact />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y" aria-label="Map">
        <div className="container-site">
          <MapEmbed />
        </div>
      </section>
    </>
  );
}
