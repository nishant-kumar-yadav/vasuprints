import { categories, productsIn } from '@/lib/catalog';

export interface NavCategory {
  slug: string;
  name: string;
  products: { slug: string; name: string }[];
}

/** Minimal, serialisable navigation tree for client components (keeps catalog copy out of the JS bundle). */
export function navTree(): NavCategory[] {
  return categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    products: productsIn(c.slug).map((p) => ({ slug: p.slug, name: p.name })),
  }));
}
