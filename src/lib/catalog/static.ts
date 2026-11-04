import { z } from 'zod';
import { categoriesData, productsData } from '@/content/catalog-data';
import { seoData } from '@/content/seo-data';
import { categorySchema, productSchema, type Category, type Product } from '@/schemas/catalog';
import type { CatalogData } from './view';

function seoFor(slug: string) {
  const s = seoData[`/${slug}`];
  if (!s) throw new Error(`Missing SEO entry for /${slug}`);
  return { title: s.title, description: s.description };
}

/** The content transcribed from docs/CONTENT.md, validated with the same schemas the database uses. */
export function staticCatalogData(): CatalogData {
  const categories: Category[] = z.array(categorySchema).parse(
    categoriesData.map((c, i) => ({ ...c, image: null, seo: seoFor(c.slug), sortOrder: i, status: 'published' })),
  );
  const products: Product[] = z.array(productSchema).parse(
    productsData.map((p) => ({ ...p, images: [], seo: seoFor(p.slug), status: 'published' })),
  );
  return { categories, products };
}
