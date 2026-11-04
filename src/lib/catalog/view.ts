import type { Category, Product } from '@/schemas/catalog';

export type { Category, Faq, Feature, Product, ProductImage } from '@/schemas/catalog';

/** Serializable catalog contents. */
export interface CatalogData {
  categories: Category[];
  products: Product[];
}

/**
 * Read-only view over published catalog content with the lookups pages need.
 * Built from either the static content files or MongoDB.
 */
export class CatalogView {
  readonly categories: Category[];
  readonly products: Product[];

  constructor(data: CatalogData) {
    this.categories = data.categories.filter((c) => c.status === 'published').sort((a, b) => a.sortOrder - b.sortOrder);
    const live = new Set(this.categories.map((c) => c.slug));
    this.products = data.products
      .filter((p) => p.status === 'published' && live.has(p.category))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }

  getCategory(slug: string) {
    return this.categories.find((c) => c.slug === slug);
  }
  getProduct(slug: string) {
    return this.products.find((p) => p.slug === slug);
  }
  productsIn(categorySlug: string) {
    return this.products.filter((p) => p.category === categorySlug);
  }
  featured() {
    return this.products.filter((p) => p.featured);
  }
  related(p: Product) {
    const picked = p.related.map((s) => this.getProduct(s)).filter((x): x is Product => Boolean(x) && x?.slug !== p.slug);
    if (picked.length >= 2) return picked.slice(0, 4);
    // Fill from the same category so every product has somewhere to go next.
    const extra = this.productsIn(p.category).filter((x) => x.slug !== p.slug && !picked.includes(x));
    return [...picked, ...extra].slice(0, 4);
  }
  categoryOf(p: Product): Category {
    const c = this.getCategory(p.category);
    if (!c) throw new Error(`Unknown category ${p.category} for ${p.slug}`);
    return c;
  }
  categoryName(p: Product) {
    return this.getCategory(p.category)?.name ?? '';
  }
  allSlugs() {
    return [...this.categories.map((c) => c.slug), ...this.products.map((p) => p.slug)];
  }
}
