import { LinkButton } from '@/components/ui/Button';
import { Art } from '@/components/site/art/Art';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { FeatureCard, ProductCard } from '@/components/site/Cards';
import { CtaBand } from '@/components/site/CtaBand';
import { Faq } from '@/components/site/Faq';
import { WhatsAppIcon } from '@/components/site/icons/WhatsApp';
import { MobileActionBar } from '@/components/site/MobileActionBar';
import { CropMarks } from '@/components/site/motifs/Motifs';
import { ProcessSteps } from '@/components/site/ProcessSteps';
import { Section, SectionHeader } from '@/components/site/Section';
import { TrustStrip } from '@/components/site/TrustStrip';
import { ctas } from '@/content/pages/global';
import { productsIn, type Category } from '@/lib/catalog';
import { absoluteUrl } from '@/lib/seo';
import { buildWhatsAppUrl, whatsappTexts } from '@/lib/whatsapp';

export function CategoryView({ category: c }: { category: Category }) {
  const items = productsIn(c.slug);
  const quoteHref = `/get-a-quote?category=${c.slug}`;
  const wa = buildWhatsAppUrl(whatsappTexts.interest(c.name, absoluteUrl(`/${c.slug}`)));
  const [intro1, ...introRest] = c.intro;
  return (
    <>
      <section className="pb-16 pt-6 lg:pb-24 lg:pt-8" aria-labelledby="cat-title" data-hero>
        <div className="container-site">
          <Breadcrumbs items={[{ name: c.name, href: `/${c.slug}` }]} />
          <div className="mt-8 grid items-center gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6 lg:pr-6">
              <p className="text-eyebrow text-teal-700">{c.name}</p>
              <h1 id="cat-title" className="text-h1 mt-4 text-navy-900">
                {c.heading}
              </h1>
              <p className="text-lead mt-5 text-text-secondary">{intro1}</p>
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
            <div className="relative lg:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border">
                <Art k={c.slug} label={`${c.name} by VasuPrint`} />
              </div>
              <CropMarks inset={-14} size={24} />
            </div>
          </div>
        </div>
      </section>

      <Section tone="surface" labelledBy="range-title">
        <div className="container-site">
          <SectionHeader
            id="range-title"
            eyebrow={`${items.length} ${items.length === 1 ? 'product' : 'products'}`}
            title={`Our ${c.name.toLowerCase()} range`}
            lead={introRest[0]}
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <li key={p.slug} data-reveal>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section labelledBy="hl-title">
        <div className="container-site">
          <SectionHeader id="hl-title" eyebrow="Highlights" title="What you can expect" />
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {c.highlights.map((h) => (
              <FeatureCard key={h.title} feature={h} />
            ))}
          </div>
        </div>
      </Section>

      <ProcessSteps variant="compact" />

      <Section labelledBy="faq-title">
        <div className="container-narrow">
          <SectionHeader id="faq-title" eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mt-10">
            <Faq items={c.faqs} />
          </div>
        </div>
      </Section>

      <CtaBand {...ctas.category(c.name)} href={quoteHref} whatsappText={whatsappTexts.interest(c.name)} />
      <MobileActionBar quoteHref={quoteHref} whatsappHref={wa} />
    </>
  );
}
