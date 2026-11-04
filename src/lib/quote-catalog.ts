import type { QuoteCatalog } from '@/components/quote/QuoteForm';
import type { CatalogView } from '@/lib/catalog/view';

/** The small slice of catalog the client-side form needs. */
export function quoteCatalog(catalog: CatalogView): QuoteCatalog {
  return {
    categories: catalog.categories.map((c) => ({ slug: c.slug, name: c.name })),
    products: catalog.products.map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      hints: p.quoteHints,
      image: p.images[0]?.src ?? null,
    })),
  };
}
