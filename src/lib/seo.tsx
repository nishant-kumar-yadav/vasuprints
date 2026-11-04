import type { Metadata } from 'next';
import { business, formatAddress, isSet } from '@/config/business';
import { seoData } from '@/content/seo-data';
import type { Faq, Product } from '@/lib/catalog/view';

/**
 * SEO helpers: metadata builders and JSON-LD.
 * Structured data is a single connected graph: every page points at the same Organization and WebSite by @id,
 * so Google can tie products, guides and the business together. Placeholder values are never emitted.
 */

export function absoluteUrl(path: string): string {
  return new URL(path, business.siteUrl).toString();
}

export const ORG_ID = absoluteUrl('/#organization');
export const WEBSITE_ID = absoluteUrl('/#website');

/** Stable share-card URL from the /og route. kind: page | c (category/product) | guides | industries. */
export function ogImagePath(kind: 'page' | 'c' | 'guides' | 'industries', slug: string) {
  return `/og/${kind}/${slug}.png`;
}

/**
 * Next merges metadata shallowly, so a page that sets `openGraph` replaces the layout's.
 * Every builder below therefore emits the complete Open Graph block.
 */
function og(o: { title: string; description?: string; url: string; image: string; alt: string; type?: 'website' | 'article' }): NonNullable<Metadata['openGraph']> & { type: 'website' | 'article' } {
  return {
    type: o.type ?? 'website',
    siteName: 'VasuPrint',
    locale: 'en_IN',
    title: o.title,
    description: o.description,
    url: o.url,
    images: [{ url: o.image, width: 1200, height: 630, alt: o.alt }],
  };
}

/** "{title} | VasuPrint" when it fits in 60 chars, otherwise the title alone. */
export function pageTitle(title: string): Metadata['title'] {
  return `${title} | VasuPrint`.length <= 60 ? title : { absolute: title };
}

export function metaFor(path: string, opts: { noindex?: boolean; ogKey?: string } = {}): Metadata {
  const s = seoData[path];
  const title = s?.title ?? 'VasuPrint';
  const description = s && s.description !== '—' ? s.description : undefined;
  const image = ogImagePath('page', opts.ogKey ?? (path === '/' ? 'home' : path.slice(1)));
  return {
    title: path === '/' ? { absolute: title } : pageTitle(title),
    description,
    alternates: { canonical: path },
    openGraph: og({ title, description, url: path, image, alt: title }),
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
  };
}

/** Metadata for any page with its own title/description (guides, industries, catalog). */
export function pageMeta(o: {
  path: string;
  title: string;
  description: string;
  image: string;
  article?: { published: string; modified: string; section?: string };
}): Metadata {
  const base = og({ title: o.title, description: o.description, url: o.path, image: o.image, alt: o.title, type: o.article ? 'article' : 'website' });
  return {
    title: pageTitle(o.title),
    description: o.description,
    alternates: { canonical: o.path },
    openGraph: o.article
      ? { ...base, type: 'article', publishedTime: o.article.published, modifiedTime: o.article.modified, section: o.article.section, authors: ['VasuPrint'] }
      : base,
    twitter: { card: 'summary_large_image', title: o.title, description: o.description, images: [o.image] },
  };
}

/** Metadata for a category or product page from its own SEO fields (editable in admin). */
export function catalogMeta(item: { slug: string; seo: { title: string; description: string } }): Metadata {
  return pageMeta({ path: `/${item.slug}`, title: item.seo.title, description: item.seo.description, image: ogImagePath('c', item.slug) });
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

const ctx = { '@context': 'https://schema.org' } as const;
const plain = (md: string) => md.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');
const img = (src: string | undefined) => (src ? (src.startsWith('http') ? src : absoluteUrl(src)) : undefined);

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    ...ctx,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absoluteUrl(c.href) })),
  };
}

export function faqLd(faqs: Faq[]) {
  return {
    ...ctx,
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
  };
}

/** Public profiles (Google Business Profile, social, directories) that are filled in. */
export function sameAs(): string[] {
  return Object.values(business.profiles).filter((u) => /^https:\/\//.test(u));
}

function postalAddress() {
  const a = business.address;
  if (!isSet(a.line1) || !isSet(a.city)) return undefined;
  return {
    '@type': 'PostalAddress',
    streetAddress: [a.line1, a.line2].filter(Boolean).join(', '),
    addressLocality: a.city,
    ...(isSet(a.state) ? { addressRegion: a.state } : {}),
    ...(isSet(a.pin) ? { postalCode: a.pin } : {}),
    addressCountry: 'IN',
  };
}

/**
 * The business. Once the address is known it is also a LocalBusiness, which is what Google uses for
 * map results and "near me" searches. Kept in sync with the Google Business Profile (same name, address, phone).
 */
export function organizationLd() {
  const address = postalAddress();
  const phone = isSet(business.phoneE164) ? business.phoneE164 : undefined;
  const email = isSet(business.email) ? business.email : undefined;
  const hours = business.openingHours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days.map(dayName), opens: h.opens, closes: h.closes }));
  return {
    ...ctx,
    '@type': address ? ['Organization', 'LocalBusiness'] : 'Organization',
    '@id': ORG_ID,
    name: 'VasuPrint',
    ...(isSet(business.legalName) ? { legalName: business.legalName } : {}),
    url: absoluteUrl('/'),
    logo: { '@type': 'ImageObject', url: absoluteUrl('/icon.svg') },
    image: absoluteUrl(ogImagePath('page', 'home')),
    description:
      'Manufacturer of custom printed packaging boxes, stickers and labels, DTF and UV DTF transfers, and hang tags for businesses across India.',
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(address ? { address } : {}),
    ...(business.geo ? { geo: { '@type': 'GeoCoordinates', latitude: business.geo.lat, longitude: business.geo.lng } } : {}),
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
    ...(isSet(business.mapsUrl) ? { hasMap: business.mapsUrl } : {}),
    ...(isSet(business.foundingYear) ? { foundingDate: business.foundingYear } : {}),
    ...(isSet(business.gstin) ? { taxID: business.gstin } : {}),
    areaServed: { '@type': 'Country', name: 'India' },
    knowsAbout: [
      'Mono carton boxes', 'SBS boxes', 'Duplex boxes', 'Custom packaging', 'Gumming stickers', 'Product labels',
      'Die-cut stickers', 'DTF transfers', 'UV DTF stickers', 'Hang tags', 'Plastic tags',
    ],
    ...(phone || email
      ? {
          contactPoint: [
            {
              '@type': 'ContactPoint',
              contactType: 'sales',
              areaServed: 'IN',
              availableLanguage: ['English', 'Hindi'],
              ...(phone ? { telephone: phone } : {}),
              ...(email ? { email } : {}),
            },
          ],
        }
      : {}),
    sameAs: sameAs(),
  };
}

function dayName(d: string) {
  return { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' }[d] ?? d;
}

export function websiteLd() {
  return {
    ...ctx,
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absoluteUrl('/'),
    name: 'VasuPrint',
    alternateName: ['Vasu Print', 'VasuPrint India'],
    inLanguage: 'en-IN',
    publisher: { '@id': ORG_ID },
  };
}

export function productLd(p: Product, categoryName: string) {
  const url = absoluteUrl(`/${p.slug}`);
  const images = p.images.map((i) => img(i.src)).filter(Boolean);
  return {
    ...ctx,
    '@type': 'Product',
    '@id': `${url}#product`,
    name: p.name,
    description: p.summary,
    category: categoryName,
    url,
    image: images.length ? images : [absoluteUrl(ogImagePath('c', p.slug))],
    brand: { '@type': 'Brand', name: 'VasuPrint' },
    manufacturer: { '@id': ORG_ID },
    ...(p.options.materials.length ? { material: p.options.materials.join(', ') } : {}),
    additionalProperty: p.specs.map((s) => ({ '@type': 'PropertyValue', name: s.label, value: s.value })),
    audience: { '@type': 'BusinessAudience', audienceType: p.applications.slice(0, 6).join(', ') },
  };
}

export function collectionLd(o: { path: string; name: string; description: string; items: { name: string; path: string }[] }) {
  const url = absoluteUrl(o.path);
  return {
    ...ctx,
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url,
    name: o.name,
    description: o.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en-IN',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: o.items.length,
      itemListElement: o.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absoluteUrl(it.path) })),
    },
  };
}

export function articleLd(g: { slug: string; title: string; description: string; published: string; updated: string; topic: string; words: number }) {
  const url = absoluteUrl(`/guides/${g.slug}`);
  return {
    ...ctx,
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: g.title,
    description: g.description,
    url,
    mainEntityOfPage: url,
    image: [absoluteUrl(ogImagePath('guides', g.slug))],
    datePublished: `${g.published}T09:00:00+05:30`,
    dateModified: `${g.updated}T09:00:00+05:30`,
    author: { '@type': 'Organization', '@id': ORG_ID, name: 'VasuPrint', url: absoluteUrl('/about') },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    articleSection: g.topic,
    wordCount: g.words,
    inLanguage: 'en-IN',
  };
}

export function serviceLd(o: { path: string; name: string; description: string; audience: string; products: { name: string; path: string }[] }) {
  const url = absoluteUrl(o.path);
  return {
    ...ctx,
    '@type': 'Service',
    '@id': `${url}#service`,
    name: o.name,
    description: o.description,
    url,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'India' },
    audience: { '@type': 'BusinessAudience', audienceType: o.audience },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: o.name,
      itemListElement: o.products.map((p) => ({ '@type': 'Offer', itemOffered: { '@type': 'Product', name: p.name, url: absoluteUrl(p.path) } })),
    },
  };
}
