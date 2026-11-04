import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { Media } from '@/components/site/Media';
import { imagesManifest } from '@/content/images-manifest';
import { CategoryBento } from '@/components/site/CategoryBento';
import { CtaBand } from '@/components/site/CtaBand';
import { FeatureCard, ProductCard } from '@/components/site/Cards';
import { CropMarks } from '@/components/site/motifs/Motifs';
import { ProcessSteps } from '@/components/site/ProcessSteps';
import { Section, SectionHeader } from '@/components/site/Section';
import { Chip } from '@/components/site/SpecTable';
import { TrustStrip } from '@/components/site/TrustStrip';
import { ctas } from '@/content/pages/global';
import { home } from '@/content/pages/home';
import { getCatalog } from '@/lib/catalog';
import { metaFor } from '@/lib/seo';

export const metadata = metaFor('/');

export default async function HomePage() {
  const catalog = await getCatalog();
  const { hero, intro, why, featured, capabilities } = home;
  return (
    <>
      {/* S1 Hero */}
      <section className="relative overflow-hidden pb-16 pt-10 lg:pb-24 lg:pt-16" aria-labelledby="hero-title">
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 hidden w-[44%] rounded-bl-[48px] bg-surface lg:block"
        />
        <div className="container-site relative grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6 lg:pr-6">
            <p className="text-eyebrow text-teal-700">{hero.eyebrow}</p>
            <h1 id="hero-title" className="text-display mt-4 max-w-[18ch] text-navy-900">
              {hero.titleLead}{' '}
              <span className="relative inline-block whitespace-nowrap">
                {hero.titleAccent}
                <svg
                  aria-hidden
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-[96%] text-teal-500"
                >
                  <path d="M2 9 C 50 3, 120 2, 198 6" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-lead mt-6 max-w-[56ch] text-text-secondary">{hero.text}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/get-a-quote" size="lg" arrow>
                Get a Quote
              </LinkButton>
              <LinkButton href="#products" size="lg" variant="secondary">
                Explore Products
              </LinkButton>
            </div>
            <TrustStrip className="mt-10" />
          </div>
          <div className="lg:col-span-6">
            <div className="relative">
              <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-surface-2 shadow-sm ring-1 ring-border lg:aspect-[4/3]">
                <Media image={imagesManifest.hero ? { ...imagesManifest.hero, alt: hero.imageAlt } : null} k="hero" label={hero.imageAlt} priority sizes="(min-width: 1024px) 50vw, 100vw" />
              </div>
              <CropMarks inset={-14} size={24} className="text-teal-500" />
            </div>
          </div>
        </div>
      </section>

      {/* S2 Introduction */}
      <Section labelledBy="intro-title" className="border-t border-border">
        <div className="container-site grid gap-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <SectionHeader id="intro-title" eyebrow={intro.eyebrow} title={intro.title} />
          </div>
          <div className="flex flex-col gap-5 text-lead text-text-secondary lg:col-span-6 lg:col-start-7 lg:pt-9" data-reveal>
            {intro.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <Link
              href="/about"
              className="group inline-flex items-center gap-1.5 self-start text-base font-semibold text-teal-700 hover:text-teal-800"
            >
              {intro.link}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </Section>

      {/* S3 Categories */}
      <Section tone="surface" id="products" labelledBy="cats-title">
        <div className="container-site">
          <SectionHeader id="cats-title" {...home.categories} />
          <CategoryBento className="mt-10 lg:mt-14" catalog={catalog} />
        </div>
      </Section>

      {/* S4 Why */}
      <Section labelledBy="why-title">
        <div className="container-site">
          <SectionHeader id="why-title" eyebrow={why.eyebrow} title={why.title} />
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {why.items.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </Section>

      {/* S5 Process */}
      <ProcessSteps />

      {/* S6 Featured */}
      <Section labelledBy="featured-title">
        <div className="container-site">
          <SectionHeader
            id="featured-title"
            eyebrow={featured.eyebrow}
            title={featured.title}
            action={
              <Link href="/#products" className="group inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-teal-800">
                {featured.link}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            }
          />
        </div>
        <div className="container-site mt-10">
          <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {catalog.featured().map((p) => (
              <li key={p.slug} className="w-[80%] shrink-0 snap-start sm:w-auto" data-reveal>
                <ProductCard product={p} categoryName={catalog.categoryName(p)} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* S7 Capabilities */}
      <Section tone="surface" labelledBy="cap-title">
        <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHeader id="cap-title" eyebrow={capabilities.eyebrow} title={capabilities.title} lead={capabilities.text} />
              <LinkButton href="/get-a-quote" variant="secondary" arrow className="mt-8 hidden lg:inline-flex">
                Not sure what to choose? Ask us
              </LinkButton>
            </div>
          </div>
          <div className="flex flex-col gap-8 lg:col-span-6 lg:col-start-7" data-reveal>
            {capabilities.groups.map((g) => (
              <div key={g.title} className="rounded-lg border border-border bg-white p-6">
                <h3 className="text-h4 text-navy-900">{g.title}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((i) => (
                    <li key={i}>
                      <Chip>{i}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* S8 CTA */}
      <CtaBand {...ctas.main} />
    </>
  );
}
