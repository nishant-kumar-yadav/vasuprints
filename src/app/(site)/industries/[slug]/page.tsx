import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cn, rail, railItem } from '@/lib/cn';
import { ArrowRight } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { IconTile } from '@/components/site/Cards';
import { CtaBand } from '@/components/site/CtaBand';
import { Faq } from '@/components/site/Faq';
import { WhatsAppIcon } from '@/components/site/icons/WhatsApp';
import { Media } from '@/components/site/Media';
import { IndustryCard, RelatedGuides } from '@/components/site/Resources';
import { Section, SectionHeader } from '@/components/site/Section';
import { TrustStrip } from '@/components/site/TrustStrip';
import { getCatalog } from '@/lib/catalog';
import { allIndustries, getGuide, getIndustry } from '@/lib/resources';
import { JsonLd, ogImagePath, pageMeta, serviceLd } from '@/lib/seo';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { lc } from '@/lib/text';

export const dynamicParams = false;

export function generateStaticParams() {
  return allIndustries().map((i) => ({ slug: i.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const i = getIndustry((await params).slug);
  if (!i) return {};
  return pageMeta({ path: `/industries/${i.slug}`, title: i.seoTitle, description: i.description, image: ogImagePath('industries', i.slug) });
}

export default async function IndustryPage({ params }: Props) {
  const i = getIndustry((await params).slug);
  if (!i) notFound();
  const catalog = await getCatalog();
  const picks = i.products.map((x) => ({ ...x, product: catalog.getProduct(x.slug) })).filter((x) => x.product !== undefined);
  const guides = i.guides.map((s) => getGuide(s)).filter((g) => g !== undefined);
  const others = allIndustries().filter((x) => x.slug !== i.slug).slice(0, 3);
  const quoteHref = `/get-a-quote?product=${picks[0]?.slug ?? ''}`;
  const wa = buildWhatsAppUrl(`Hi VasuPrint, I'm looking for ${lc(i.name)} packaging/printing. `);
  const [lead, ...rest] = i.intro;
  return (
    <>
      <JsonLd
        data={serviceLd({
          path: `/industries/${i.slug}`,
          name: i.heading,
          description: i.description,
          audience: i.name,
          products: picks.map((p) => ({ name: p.product!.name, path: `/${p.slug}` })),
        })}
      />
      <section className="pb-14 pt-6 lg:pb-20 lg:pt-8" aria-labelledby="ind-title" data-hero>
        <div className="container-site">
          <Breadcrumbs items={[{ name: 'Industries', href: '/industries' }, { name: i.name, href: `/industries/${i.slug}` }]} />
          <div className="mt-8 grid items-center gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7 lg:pr-6">
              <p className="text-eyebrow text-teal-700">{i.name}</p>
              <h1 id="ind-title" className="text-h1 mt-4 text-navy-900">
                {i.heading}
              </h1>
              <p className="text-lead mt-5 text-text-secondary">{lead}</p>
              {rest.map((p) => (
                <p key={p} className="mt-4 text-[17px] leading-[1.7] text-text-secondary">
                  {p}
                </p>
              ))}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LinkButton href={quoteHref} size="lg" arrow>
                  Get a Quote
                </LinkButton>
                <LinkButton href={wa} size="lg" variant="whatsapp" icon={<WhatsAppIcon />}>
                  WhatsApp
                </LinkButton>
              </div>
              <TrustStrip className="mt-10" />
            </div>
            <div className="lg:col-span-5">
              <ul className="grid grid-cols-2 gap-3">
                {picks.map((p) => (
                  <li key={p.slug} className="relative aspect-square overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border">
                    <Media image={p.product!.images[0]} k={p.slug} sizes="(min-width: 1024px) 20vw, 50vw" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Section tone="surface" labelledBy="needs-title">
        <div className="container-site">
          <SectionHeader id="needs-title" eyebrow="What matters" title={`What ${lc(i.name)} brands need from packaging`} />
          <ul className="mt-8 grid gap-x-8 gap-y-7 sm:mt-12 sm:gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {i.needs.map((n) => (
              <li key={n.title} className="flex flex-row gap-4 sm:flex-col" data-reveal>
                <IconTile name={i.icon} />
                <div>
                  <h3 className="text-h4 text-navy-900">{n.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-text-secondary">{n.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section labelledBy="fit-title">
        <div className="container-site">
          <SectionHeader id="fit-title" eyebrow="Recommended products" title="Products that fit, and why" />
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {picks.map((p) => (
              <li key={p.slug} className="group relative flex gap-5 rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-md sm:p-6" data-reveal>
                <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-surface-2 sm:size-28">
                  <Media image={p.product!.images[0]} k={p.slug} sizes="112px" />
                </div>
                <div className="min-w-0">
                  <p className="text-eyebrow text-teal-700">{catalog.categoryName(p.product!)}</p>
                  <h3 className="mt-1.5 font-display text-lg font-bold text-navy-900">
                    <Link href={`/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                      {p.product!.name}
                    </Link>
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-text-secondary">{p.why}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700">
                    View product
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
                <span className="pointer-events-none absolute inset-0 rounded-lg ring-teal-500 group-has-[a:focus-visible]:ring-2" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="surface" labelledBy="faq-title">
        <div className="container-narrow">
          <SectionHeader id="faq-title" eyebrow="FAQ" title={`${i.name}: common questions`} />
          <div className="mt-10">
            <Faq items={i.faqs} />
          </div>
        </div>
      </Section>

      <RelatedGuides guides={guides} />

      <Section tone="surface" labelledBy="other-title">
        <div className="container-site">
          <SectionHeader id="other-title" eyebrow="Other industries" title="We also work with" />
          <ul className={cn('mt-8 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3', rail)}>
            {others.map((x) => (
              <li key={x.slug} className={railItem} data-reveal>
                <IndustryCard industry={x} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBand title={`Packaging for your ${lc(i.name)} brand`} text="Share your product, size and quantity. We'll recommend the right material and send a quotation." button="Get a Quote" href={quoteHref} />
    </>
  );
}
