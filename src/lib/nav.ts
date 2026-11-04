import type { CatalogView } from '@/lib/catalog/view';

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
