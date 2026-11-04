import type { Metadata } from 'next';
import { business, formatAddress, isSet } from '@/config/business';
import { seoData } from '@/content/seo-data';
import type { Faq, Product } from '@/lib/catalog/view';

export function absoluteUrl(path: string): string {
  return new URL(path, business.siteUrl).toString();
}

/** SEO.md §2: "{title} | VasuPrint" when it fits in 60 chars, otherwise the title alone. */
export function pageTitle(title: string): Metadata['title'] {
  return `${title} | VasuPrint`.length <= 60 ? title : { absolute: title };
}

export function metaFor(path: string, opts: { noindex?: boolean } = {}): Metadata {
  const s = seoData[path];
  const title = s?.title ?? 'VasuPrint';
  return {
    title: path === '/' ? { absolute: title } : pageTitle(title),
    description: s && s.description !== '—' ? s.description : undefined,
    alternates: { canonical: path },
    openGraph: { title, description: s?.description, url: path },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
  };
}

/** Metadata for a category or product page from its own SEO fields (editable in admin). */
export function catalogMeta(item: { slug: string; seo: { title: string; description: string }; images?: { src: string }[] }): Metadata {
  const path = `/${item.slug}`;
  const image = item.images?.[0]?.src;
  return {
    title: pageTitle(item.seo.title),
    description: item.seo.description,
    alternates: { canonical: path },
    openGraph: { title: item.seo.title, description: item.seo.description, url: path, ...(image ? { images: [image] } : {}) },
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw JSON; content is our own static data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.href),
    })),
  };
}

export function faqLd(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') },
    })),
  };
}

export function productLd(p: Product, categoryName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.summary,
    category: categoryName,
    brand: { '@type': 'Brand', name: 'VasuPrint' },
    url: absoluteUrl(`/${p.slug}`),
  };
}

export function organizationLd() {
  const sameAs: string[] = [];
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VasuPrint',
    url: business.siteUrl,
    logo: absoluteUrl('/icon.svg'),
    ...(isSet(business.email) ? { email: business.email } : {}),
    ...(isSet(business.phoneE164) ? { telephone: business.phoneE164 } : {}),
    ...(isSet(business.address.line1) ? { address: formatAddress() } : {}),
    sameAs,
  };
}
