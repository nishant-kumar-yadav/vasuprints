import type { QuoteCatalog } from '@/components/quote/QuoteForm';
import { categories, products } from '@/lib/catalog';

/** The small slice of catalog the client-side form needs. */
export function quoteCatalog(): QuoteCatalog {
  return {
    categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
    products: products.map((p) => ({ slug: p.slug, name: p.name, category: p.category, hints: p.quoteHints })),
  };
}
