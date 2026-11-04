import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { GuideData, IndustryData } from '@/lib/resources';
import { cn, rail, railItem } from '@/lib/cn';
import { IconTile } from './Cards';
import { Section, SectionHeader } from './Section';

export function GuideCard({ guide, className }: { guide: GuideData; className?: string }) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-lg border border-border bg-white p-6 transition-[transform,box-shadow] duration-220 ease-(--ease-out) hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <p className="text-eyebrow flex items-center gap-2 text-teal-700">
        <BookOpen className="size-4" aria-hidden />
        {guide.topic}
      </p>
      <h3 className="mt-3 font-display text-lg font-bold leading-snug tracking-[-0.015em] text-navy-900">
        <Link href={`/guides/${guide.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {guide.title}
        </Link>
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{guide.excerpt}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-teal-700">
        Read the guide
        <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-teal-500 group-has-[a:focus-visible]:ring-2" aria-hidden />
    </article>
  );
}

export function IndustryCard({ industry, className }: { industry: IndustryData; className?: string }) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-lg border border-border bg-white p-6 transition-[transform,box-shadow] duration-220 ease-(--ease-out) hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <IconTile name={industry.icon} />
      <h3 className="mt-4 font-display text-lg font-bold leading-snug tracking-[-0.015em] text-navy-900">
        <Link href={`/industries/${industry.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {industry.name}
        </Link>
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{industry.excerpt}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-teal-700">
        See solutions
        <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-teal-500 group-has-[a:focus-visible]:ring-2" aria-hidden />
    </article>
  );
}

/** "Helpful guides" band for product, category and industry pages. */
export function RelatedGuides({ guides, tone = 'white', title = 'Helpful guides' }: { guides: GuideData[]; tone?: 'white' | 'surface'; title?: string }) {
  if (!guides.length) return null;
  return (
    <Section tone={tone} labelledBy="guides-title">
      <div className="container-site">
        <SectionHeader
          id="guides-title"
          eyebrow="Buyer guides"
          title={title}
          action={
            <Link href="/guides" className="group inline-flex min-h-11 items-center gap-1.5 font-semibold text-teal-700 hover:text-teal-800">
              All guides
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          }
        />
        <ul className={cn('mt-8 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3', rail)}>
          {guides.map((g) => (
            <li key={g.slug} className={railItem} data-reveal>
              <GuideCard guide={g} />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
