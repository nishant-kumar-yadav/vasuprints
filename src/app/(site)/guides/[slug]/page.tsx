import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cn, rail, railItem } from '@/lib/cn';
import { Clock, RefreshCw } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { ProductCard } from '@/components/site/Cards';
import { CtaBand } from '@/components/site/CtaBand';
import { Faq } from '@/components/site/Faq';
import { WhatsAppIcon } from '@/components/site/icons/WhatsApp';
import { RelatedGuides } from '@/components/site/Resources';
import { Section, SectionHeader } from '@/components/site/Section';
import { ShareButton } from '@/components/site/ShareButton';
import { ctas } from '@/content/pages/global';
import { getCatalog } from '@/lib/catalog';
import { formatDate } from '@/lib/policies';
import { allGuides, getGuide, guidesFor } from '@/lib/resources';
import { JsonLd, absoluteUrl, articleLd, ogImagePath, pageMeta } from '@/lib/seo';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export const dynamicParams = false;

export function generateStaticParams() {
  return allGuides().map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  return pageMeta({
    path: `/guides/${g.slug}`,
    title: g.seoTitle,
    description: g.description,
    image: ogImagePath('guides', g.slug),
    article: { published: g.published, modified: g.updated, section: g.topic },
  });
}

export default async function GuidePage({ params }: Props) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const catalog = await getCatalog();
  const products = g.products.map((s) => catalog.getProduct(s)).filter((p) => p !== undefined);
  const more = guidesFor(g.products, 4).filter((x) => x.slug !== g.slug).slice(0, 3);
  const wa = buildWhatsAppUrl(`Hi VasuPrint, I read your guide "${g.title}" and have a question: `);
  return (
    <>
      <JsonLd data={articleLd(g)} />
      <div className="pb-16 pt-6 lg:pb-20 lg:pt-8">
        <div className="container-site">
          <Breadcrumbs items={[{ name: 'Guides', href: '/guides' }, { name: g.title, href: `/guides/${g.slug}` }]} />
          <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-8">
            <aside aria-label="Contents" className="hidden lg:col-span-3 lg:block">
              <nav aria-label="On this page" className="sticky top-28">
                <p className="text-eyebrow text-text-muted">On this page</p>
                <ol className="mt-4 flex flex-col gap-0.5 border-l border-border">
                  {g.toc.map((t) => (
                    <li key={t.id}>
                      <a
                        href={`#${t.id}`}
                        className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-text-secondary transition-colors hover:border-teal-500 hover:text-navy-900"
                      >
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ol>
                <LinkButton href="/get-a-quote" size="sm" arrow className="mt-8">
                  Get a Quote
                </LinkButton>
              </nav>
            </aside>
            <article className="min-w-0 lg:col-span-8 lg:col-start-5">
              <header className="border-b border-border pb-8">
                <p className="text-eyebrow text-teal-700">{g.topic}</p>
                <h1 className="text-h1 mt-4 text-navy-900">{g.title}</h1>
                <p className="text-lead mt-5 text-text-secondary">{g.excerpt}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
                  <span>By the VasuPrint team</span>
                  <span className="inline-flex items-center gap-1.5">
                    <RefreshCw className="size-3.5" aria-hidden />
                    Updated <time dateTime={g.updated}>{formatDate(g.updated)}</time>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" aria-hidden />
                    {g.readMinutes} min read
                  </span>
                </div>
              </header>
              <div className="prose-policy max-w-[68ch] text-[17px] leading-[1.75]" dangerouslySetInnerHTML={{ __html: g.html }} />
              <div className="mt-14 flex flex-col gap-5 rounded-xl bg-navy-900 p-6 text-white sm:p-8">
                <div>
                  <h2 className="font-display text-xl font-bold">Still not sure what to choose?</h2>
                  <p className="mt-1.5 text-[15px] text-navy-100">
                    Tell us what you are packaging or branding. We&apos;ll recommend the material and finish, and send a quotation.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <LinkButton href="/get-a-quote" arrow>
                    Get a Quote
                  </LinkButton>
                  <LinkButton href={wa} variant="outline-inverse" icon={<WhatsAppIcon />}>
                    Ask on WhatsApp
                  </LinkButton>
                </div>
              </div>
              <div className="mt-6 max-w-xs">
                <ShareButton title={`${g.title} | VasuPrint`} url={absoluteUrl(`/guides/${g.slug}`)} label="Share this guide" />
              </div>
            </article>
          </div>
        </div>
      </div>

      {products.length ? (
        <Section tone="surface" labelledBy="gp-title">
          <div className="container-site">
            <SectionHeader id="gp-title" eyebrow="Products in this guide" title="Ready to order?" />
            <ul className={cn('mt-8 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4', rail)}>
              {products.map((p) => (
                <li key={p.slug} className={railItem} data-reveal>
                  <ProductCard product={p} categoryName={catalog.categoryName(p)} />
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      <Section labelledBy="faq-title">
        <div className="container-narrow">
          <SectionHeader id="faq-title" eyebrow="FAQ" title="Quick answers" />
          <div className="mt-10">
            <Faq items={g.faqs} />
          </div>
        </div>
      </Section>

      <RelatedGuides guides={more} tone="surface" title="Keep reading" />
      <CtaBand {...ctas.main} />
    </>
  );
}
