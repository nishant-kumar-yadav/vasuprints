import Link from 'next/link';
import { cn, rail, railItem } from '@/lib/cn';
import { Check, Phone } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { ProductCard } from '@/components/site/Cards';
import { CtaBand } from '@/components/site/CtaBand';
import { DynamicIcon } from '@/components/site/DynamicIcon';
import { Faq } from '@/components/site/Faq';
import { WhatsAppIcon } from '@/components/site/icons/WhatsApp';
import { ShareButton } from '@/components/site/ShareButton';
import { MobileActionBar } from '@/components/site/MobileActionBar';
import { ProcessSteps } from '@/components/site/ProcessSteps';
import { RichText } from '@/components/site/RichText';
import { RelatedGuides } from '@/components/site/Resources';
import { Section, SectionHeader } from '@/components/site/Section';
import { Chip, SpecTable } from '@/components/site/SpecTable';
import { ctas } from '@/content/pages/global';
import type { CatalogView, Product } from '@/lib/catalog/view';
import { JsonLd, absoluteUrl, productLd } from '@/lib/seo';
import { guidesFor, industriesFor } from '@/lib/resources';
import { buildWhatsAppUrl, telUrl, whatsappTexts } from '@/lib/whatsapp';
import { Gallery } from './Gallery';
import { SubNav } from './SubNav';
import { lc } from '@/lib/text';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'options', label: 'Options' },
  { id: 'applications', label: 'Applications' },
  { id: 'faq', label: 'FAQ' },
];

const optionGroups = [
  ['materials', 'Materials'],
  ['printing', 'Printing'],
  ['finishes', 'Finishes'],
  ['formats', 'Formats & styles'],
] as const;

export function ProductView({ product: p, catalog }: { product: Product; catalog: CatalogView }) {
  const cat = catalog.categoryOf(p);
  const quoteHref = `/get-a-quote?product=${p.slug}`;
  const wa = buildWhatsAppUrl(whatsappTexts.interest(p.name, absoluteUrl(`/${p.slug}`)));
  const tel = telUrl();
  const related = catalog.related(p);
  const quickSpecs = p.specs.slice(0, 3);
  const guides = guidesFor([p.slug]);
  const industries = industriesFor(p.slug);

  return (
    <>
      <JsonLd data={productLd(p, cat.name)} />
      <section className="pb-14 pt-6 lg:pb-20 lg:pt-8" aria-labelledby="p-title" data-hero>
        <div className="container-site">
          <Breadcrumbs
            items={[
              { name: cat.name, href: `/${cat.slug}` },
              { name: p.name, href: `/${p.slug}` },
            ]}
          />
          <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <Gallery artKey={p.slug} alts={p.imageAlts.length ? p.imageAlts : [p.name]} images={p.images} />
            </div>
            <div className="lg:col-span-5">
              <p className="text-eyebrow text-teal-700">{cat.name}</p>
              <h1 id="p-title" className="text-h1 mt-3 text-navy-900 lg:text-[2.75rem]">
                {p.heading}
              </h1>
              <p className="text-lead mt-5 text-text-secondary">{p.summary}</p>
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {p.features.slice(0, 4).map((f) => (
                  <li key={f.title} className="flex items-center gap-2.5 text-[15px] font-medium text-navy-800">
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                      <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                    </span>
                    {f.title}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3">
                <LinkButton href={quoteHref} size="lg" arrow className="w-full">
                  Get a Quote for this product
                </LinkButton>
                <div className="grid grid-cols-2 gap-3">
                  <LinkButton href={wa} variant="whatsapp" icon={<WhatsAppIcon />} className={tel ? '' : 'col-span-2'}>
                    WhatsApp
                  </LinkButton>
                  {tel ? (
                    <LinkButton href={tel} variant="outline" icon={<Phone className="size-4" aria-hidden />}>
                      Call
                    </LinkButton>
                  ) : null}
                </div>
                <ShareButton title={`${p.name} | VasuPrint`} url={absoluteUrl(`/${p.slug}`)} />
              </div>
              <div className="mt-8 rounded-lg border border-border bg-surface px-5 py-2">
                <p className="text-eyebrow pb-1 pt-3 text-text-secondary">Quick specs</p>
                <SpecTable specs={quickSpecs} compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SubNav sections={sections} quoteHref={quoteHref} />

      {/* Overview */}
      <Section id="overview" labelledBy="ov-title" className="scroll-mt-32 border-t border-border">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7" data-reveal>
            <p className="text-eyebrow text-teal-700">Overview</p>
            <h2 id="ov-title" className="text-h2 mt-3 text-navy-900">
              About {lc(p.name)}
            </h2>
            <div className="mt-6 flex max-w-[68ch] flex-col gap-5 text-[17px] leading-[1.7] text-text-secondary">
              {p.intro.map((para) => (
                <p key={para}>
                  <RichText text={para} />
                </p>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9" data-reveal>
            <h3 className="text-h4 text-navy-900">Key features</h3>
            <ul className="mt-5 flex flex-col gap-6">
              {p.features.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                    <DynamicIcon name={f.icon} className="size-[22px]" />
                  </span>
                  <div>
                    <p className="font-display font-semibold text-navy-900">{f.title}</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-text-secondary">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Specifications */}
      <Section id="specifications" tone="surface" labelledBy="spec-title" className="scroll-mt-32">
        <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <SectionHeader
              id="spec-title"
              eyebrow="Specifications"
              title="Technical details"
              lead="Options available on request. Your quotation confirms the exact specification for your order."
            />
          </div>
          <div className="rounded-lg border border-border bg-white px-6 py-2 lg:col-span-7 lg:col-start-6" data-reveal>
            <SpecTable specs={p.specs} />
          </div>
        </div>
      </Section>

      {/* Options */}
      <Section id="options" labelledBy="opt-title" className="scroll-mt-32">
        <div className="container-site">
          <SectionHeader id="opt-title" eyebrow="Options" title="Choose your material, print and finish" />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {optionGroups.map(([key, label]) => (
              <div key={key} className="rounded-lg border border-border p-6" data-reveal>
                <h3 className="text-h4 text-navy-900">{label}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.options[key].map((o) => (
                    <li key={o}>
                      <Chip>{o}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[15px] text-text-secondary">
            Don&apos;t see what you need? Mention it in your quote request — we&apos;ll confirm feasibility.
          </p>
        </div>
      </Section>

      {/* Applications */}
      <Section id="applications" tone="surface" labelledBy="app-title" className="scroll-mt-32">
        <div className="container-site">
          <SectionHeader id="app-title" eyebrow="Applications" title={`Where ${lc(p.name)} are used`} />
          <ul className="mt-8 grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {p.applications.map((a, i) => (
              <li
                key={a}
                className="flex min-h-14 items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-[15px] font-medium text-navy-900 sm:min-h-20 sm:p-5"
                data-reveal
              >
                <span className="font-display text-sm font-bold tabular-nums text-teal-700">{String(i + 1).padStart(2, '0')}</span>
                <span className="h-6 w-px bg-border" aria-hidden />
                {a}
              </li>
            ))}
          </ul>
          {industries.length ? (
            <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-[15px] text-text-secondary">
              <span className="font-medium text-navy-900">Popular with:</span>
              {industries.map((ind) => (
                <Link
                  key={ind.slug}
                  href={`/industries/${ind.slug}`}
                  className="rounded-full border border-border bg-white px-3 py-1 text-sm font-medium text-navy-800 transition-colors hover:border-teal-500 hover:text-teal-700"
                >
                  {ind.name}
                </Link>
              ))}
            </p>
          ) : null}
        </div>
      </Section>

      <ProcessSteps variant="compact" />

      {/* FAQ */}
      <Section id="faq" labelledBy="faq-title" className="scroll-mt-32">
        <div className="container-narrow">
          <SectionHeader id="faq-title" eyebrow="FAQ" title={`${p.name}: common questions`} />
          <div className="mt-10">
            <Faq items={p.faqs} />
          </div>
        </div>
      </Section>

      <RelatedGuides guides={guides} tone="surface" />

      {related.length ? (
        <Section labelledBy="rel-title">
          <div className="container-site">
            <SectionHeader id="rel-title" eyebrow="Related products" title="You may also need" />
            <ul className={cn('mt-8 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4', rail)}>
              {related.map((r) => (
                <li key={r.slug} className={railItem} data-reveal>
                  <ProductCard product={r} categoryName={catalog.categoryName(r)} />
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      <CtaBand {...ctas.product} href={quoteHref} whatsappText={whatsappTexts.interest(p.name)} />
      <MobileActionBar quoteHref={quoteHref} whatsappHref={wa} />
    </>
  );
}
