import { z } from 'zod';
import { categoriesData, productsData } from '@/content/catalog-data';

const featureSchema = z.object({ icon: z.string(), title: z.string(), body: z.string() });
const faqSchema = z.object({ q: z.string(), a: z.string() });

export const categorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  tagline: z.string(),
  heading: z.string(),
  intro: z.array(z.string()).min(1),
  highlights: z.array(featureSchema),
  faqs: z.array(faqSchema),
});

export const productSchema = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  featured: z.boolean(),
  sortOrder: z.number(),
  heading: z.string(),
  summary: z.string(),
  intro: z.array(z.string()),
  features: z.array(featureSchema),
  specs: z.array(z.object({ label: z.string(), value: z.string() })),
  options: z.object({
    materials: z.array(z.string()),
    printing: z.array(z.string()),
    finishes: z.array(z.string()),
    formats: z.array(z.string()),
  }),
  applications: z.array(z.string()),
  faqs: z.array(faqSchema),
  related: z.array(z.string()),
  quoteHints: z.object({ size: z.string(), quantity: z.string(), material: z.string() }),
  imageAlts: z.array(z.string()),
});

export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type Feature = z.infer<typeof featureSchema>;
export type Faq = z.infer<typeof faqSchema>;

export const categories: Category[] = z.array(categorySchema).parse(categoriesData);
export const products: Product[] = z
  .array(productSchema)
  .parse(productsData)
  .sort((a, b) => a.sortOrder - b.sortOrder);

/** Short labels used in navigation (brief §7: "Stickers", "Tags"). */
export function navLabel(c: Category): string {
  return c.name;
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productsIn(categorySlug: string): Product[] {
  return products.filter((p) => p.category === categorySlug);
}

export function featuredProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function relatedProducts(p: Product): Product[] {
  return p.related.map(getProduct).filter((x): x is Product => Boolean(x)).slice(0, 4);
}

export function categoryOf(p: Product): Category {
  const c = getCategory(p.category);
  if (!c) throw new Error(`Unknown category ${p.category} for ${p.slug}`);
  return c;
}

export function allSlugs(): string[] {
  return [...categories.map((c) => c.slug), ...products.map((p) => p.slug)];
}
