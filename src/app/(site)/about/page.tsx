import { Eye, Target } from 'lucide-react';
import { Media } from '@/components/site/Media';
import { imagesManifest } from '@/content/images-manifest';
import { CategoryMiniCard, FeatureCard } from '@/components/site/Cards';
import { CtaBand } from '@/components/site/CtaBand';
import { CropMarks } from '@/components/site/motifs/Motifs';
import { Section, SectionHeader } from '@/components/site/Section';
import { about } from '@/content/pages/about';
import { ctas } from '@/content/pages/global';
import { getCatalog } from '@/lib/catalog';
import { metaFor } from '@/lib/seo';

export const metadata = metaFor('/about');

export default async function AboutPage() {
  const catalog = await getCatalog();
  return (
    <>
      <section className="pb-16 pt-10 lg:pb-24 lg:pt-16" aria-labelledby="about-title">
        <div className="container-site grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6 lg:pr-6">
            <p className="text-eyebrow text-teal-700">{about.eyebrow}</p>
            <h1 id="about-title" className="text-h1 mt-4 text-navy-900">
              {about.title}
            </h1>
            <p className="text-lead mt-5 text-text-secondary">{about.lead}</p>
          </div>
          <div className="relative lg:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border">
              <Media image={imagesManifest.pages.about ? { ...imagesManifest.pages.about, alt: 'Print finishing workspace at VasuPrint' } : null} k="hero" view={2} label="Printed packaging, labels, transfers and tags made by VasuPrint" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            <CropMarks inset={-14} size={24} />
          </div>
        </div>
      </section>

      <Section className="border-t border-border" labelledBy="story-title">
        <div className="container-narrow" data-reveal>
          <h2 id="story-title" className="text-eyebrow text-teal-700">
            Our story
          </h2>
          <p className="text-lead mt-5 text-text-secondary">{about.story}</p>
          <blockquote className="mt-10 border-l-[3px] border-teal-500 pl-6">
            <p className="font-display text-[clamp(1.375rem,1.2rem+0.8vw,1.875rem)] font-bold leading-snug tracking-[-0.02em] text-navy-900">
              {about.highlight}
            </p>
          </blockquote>
        </div>
      </Section>

      <Section tone="surface" labelledBy="mv-title">
        <h2 id="mv-title" className="sr-only">
          Mission and vision
        </h2>
        <div className="container-site grid gap-6 md:grid-cols-2">
          {[
            { Icon: Target, title: 'Our Mission', text: about.mission },
            { Icon: Eye, title: 'Our Vision', text: about.vision },
          ].map(({ Icon, title, text }) => (
            <div key={title} className="rounded-lg border border-border bg-white p-8 lg:p-10" data-reveal>
              <span className="inline-flex size-11 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                <Icon className="size-[22px]" strokeWidth={1.5} aria-hidden />
              </span>
              <h3 className="text-h3 mt-6 text-navy-900">{title}</h3>
              <p className="mt-3 text-[17px] leading-relaxed text-text-secondary">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section labelledBy="make-title">
        <div className="container-site">
          <SectionHeader id="make-title" eyebrow="What we make" title={about.makeTitle} />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.categories.map((c) => (
              <li key={c.slug} data-reveal>
                <CategoryMiniCard category={c} count={catalog.productsIn(c.slug).length} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="surface" labelledBy="how-title">
        <div className="container-site">
          <SectionHeader id="how-title" eyebrow="Values" title={about.howTitle} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {about.how.map((f) => (
              <FeatureCard key={f.title} feature={f} bordered />
            ))}
          </div>
        </div>
      </Section>

      <CtaBand {...ctas.main} />
    </>
  );
}
