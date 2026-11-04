import type { CatalogView } from '@/lib/catalog/view';

export interface NavCategory {
  slug: string;
  name: string;
  products: { slug: string; name: string }[];
}

/** Minimal, serialisable navigation tree for client components (keeps catalog copy out of the JS bundle). */
export function navTree(catalog: CatalogView): NavCategory[] {
  return catalog.categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    products: catalog.productsIn(c.slug).map((p) => ({ slug: p.slug, name: p.name })),
  }));
}
