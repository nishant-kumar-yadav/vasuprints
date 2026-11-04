import type { CatalogView } from '@/lib/catalog/view';
import { allGuides, allIndustries } from '@/lib/resources';

export interface NavCategory {
  slug: string;
  name: string;
  products: { slug: string; name: string; summary: string; keywords: string }[];
}

/** Minimal, serialisable navigation tree for client components (keeps catalog copy out of the JS bundle). */
export function navTree(catalog: CatalogView): NavCategory[] {
  return catalog.categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    products: catalog.productsIn(c.slug).map((p) => ({
      slug: p.slug,
      name: p.name,
      summary: p.summary,
      // Lower-cased search terms for the header product finder.
      keywords: [...p.applications, ...p.options.materials, ...p.options.formats, ...p.options.finishes].join(' ').toLowerCase(),
    })),
  }));
}

export interface NavResource {
  href: string;
  title: string;
  kind: 'Guide' | 'Industry';
  sub: string;
  keywords: string;
}

/** Guides and industry pages for the header search (titles and short keywords only). */
export function resourceIndex(): NavResource[] {
  return [
    ...allIndustries().map((i) => ({
      href: `/industries/${i.slug}`,
      title: i.name,
      kind: 'Industry' as const,
      sub: 'Packaging & labels',
      keywords: `${i.excerpt} ${i.seoTitle}`.toLowerCase(),
    })),
    ...allGuides().map((g) => ({
      href: `/guides/${g.slug}`,
      title: g.title,
      kind: 'Guide' as const,
      sub: g.topic,
      keywords: `${g.seoTitle} ${g.excerpt}`.toLowerCase(),
    })),
  ];
}
