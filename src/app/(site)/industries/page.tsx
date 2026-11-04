import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { CtaBand } from '@/components/site/CtaBand';
import { IndustryCard } from '@/components/site/Resources';
import { Section } from '@/components/site/Section';
import { ctas } from '@/content/pages/global';
import { allIndustries } from '@/lib/resources';
import { JsonLd, collectionLd, ogImagePath, pageMeta } from '@/lib/seo';

const title = 'Packaging & Printing Solutions by Industry';
const description =
  'Custom packaging, labels, transfers and tags for cosmetics, pharma, food and beverage, apparel, FMCG and corporate gifting businesses across India.';

export const metadata = pageMeta({ path: '/industries', title, description, image: ogImagePath('page', 'industries') });

export default function IndustriesPage() {
  const list = allIndustries();
  return (
    <>
      <JsonLd data={collectionLd({ path: '/industries', name: title, description, items: list.map((i) => ({ name: i.name, path: `/industries/${i.slug}` })) })} />
      <section className="pb-12 pt-6 lg:pb-16 lg:pt-8" aria-labelledby="ind-title">
        <div className="container-site">
          <Breadcrumbs items={[{ name: 'Industries', href: '/industries' }]} />
          <div className="mt-8 max-w-3xl lg:mt-12">
            <p className="text-eyebrow text-teal-700">Industries</p>
            <h1 id="ind-title" className="text-h1 mt-4 text-navy-900">
              Printing and packaging for the way your industry sells
            </h1>
            <p className="text-lead mt-5 text-text-secondary">
              Every industry asks something different of its packaging. Pick yours to see what matters, which products fit and why.
            </p>
          </div>
        </div>
      </section>
      <Section tone="surface" labelledBy="ind-list" className="!pt-14 lg:!pt-16">
        <div className="container-site">
          <h2 id="ind-list" className="sr-only">
            Industries we serve
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((i) => (
              <li key={i.slug} data-reveal>
                <IndustryCard industry={i} />
              </li>
            ))}
          </ul>
        </div>
      </Section>
      <CtaBand {...ctas.main} />
    </>
  );
}
