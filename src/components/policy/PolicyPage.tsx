import { LinkButton } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { WhatsAppIcon } from '@/components/site/icons/WhatsApp';
import { formatDate, getPolicy } from '@/lib/policies';
import { buildWhatsAppUrl, whatsappTexts } from '@/lib/whatsapp';

export function PolicyPage({ slug }: { slug: string }) {
  const p = getPolicy(slug);
  return (
    <div className="pb-20 pt-6 lg:pb-28 lg:pt-8">
      <div className="container-site">
        <Breadcrumbs items={[{ name: p.title, href: `/${p.slug}` }]} />
        <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-8">
          <aside className="hidden lg:col-span-3 lg:block">
            <nav aria-label="On this page" className="sticky top-28">
              <p className="text-eyebrow text-text-muted">On this page</p>
              <ol className="mt-4 flex flex-col gap-0.5 border-l border-border">
                {p.toc.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-text-secondary transition-colors hover:border-teal-500 hover:text-navy-900"
                    >
                      {t.text.replace(/^\d+\.\s*/, '')}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
          <article className="min-w-0 lg:col-span-8 lg:col-start-5">
            <header className="border-b border-border pb-8">
              <h1 className="text-h1 text-navy-900">{p.title}</h1>
              <p className="text-lead mt-4 text-text-secondary">{p.intro}</p>
              <p className="mt-4 text-sm text-text-muted">Last updated: {formatDate(p.updated)}</p>
            </header>
            <div className="prose-policy max-w-[68ch] text-[16px] leading-[1.7]" dangerouslySetInnerHTML={{ __html: p.html }} />
            <div className="mt-16 flex flex-col gap-5 rounded-xl bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900">Questions about this policy?</h2>
                <p className="mt-1 text-[15px] text-text-secondary">Our team is happy to help.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <LinkButton href={buildWhatsAppUrl(whatsappTexts.global)} variant="whatsapp" icon={<WhatsAppIcon />}>
                  {p.whatsappCta}
                </LinkButton>
                <LinkButton href="/contact" variant="secondary">
                  Contact page
                </LinkButton>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
