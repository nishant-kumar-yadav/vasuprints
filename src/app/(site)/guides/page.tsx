import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { CtaBand } from '@/components/site/CtaBand';
import { GuideCard } from '@/components/site/Resources';
import { Section } from '@/components/site/Section';
import { ctas } from '@/content/pages/global';
import { allGuides } from '@/lib/resources';
import { JsonLd, collectionLd, ogImagePath, pageMeta } from '@/lib/seo';

const title = 'Printing & Packaging Guides for Buyers';
const description =
  'Practical guides to custom printing and packaging: choosing board and finishes, sticker materials, DTF vs UV DTF, print-ready artwork and what drives box prices.';

export const metadata = pageMeta({ path: '/guides', title, description, image: ogImagePath('page', 'guides') });

export default function GuidesPage() {
  const guides = allGuides();
  const topics = [...new Set(guides.map((g) => g.topic))];
  return (
    <>
      <JsonLd data={collectionLd({ path: '/guides', name: title, description, items: guides.map((g) => ({ name: g.title, path: `/guides/${g.slug}` })) })} />
      <section className="pb-12 pt-6 lg:pb-16 lg:pt-8" aria-labelledby="guides-title">
        <div className="container-site">
          <Breadcrumbs items={[{ name: 'Guides', href: '/guides' }]} />
          <div className="mt-8 max-w-3xl lg:mt-12">
            <p className="text-eyebrow text-teal-700">Buyer guides</p>
            <h1 id="guides-title" className="text-h1 mt-4 text-navy-900">
              Know what to order before you order it
            </h1>
            <p className="text-lead mt-5 text-text-secondary">
              Straight answers to the questions our customers ask most, from choosing a board for your boxes to setting up artwork that prints right the first time.
            </p>
          </div>
        </div>
      </section>
      {topics.map((t, i) => (
        <Section key={t} tone={i % 2 === 0 ? 'surface' : 'white'} labelledBy={`topic-${i}`} className="!py-14 lg:!py-16">
          <div className="container-site">
            <h2 id={`topic-${i}`} className="text-h3 text-navy-900">
              {t}
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guides
                .filter((g) => g.topic === t)
                .map((g) => (
                  <li key={g.slug} data-reveal>
                    <GuideCard guide={g} />
                  </li>
                ))}
            </ul>
          </div>
        </Section>
      ))}
      <CtaBand {...ctas.main} />
    </>
  );
}
