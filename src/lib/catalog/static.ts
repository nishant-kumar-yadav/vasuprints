import { z } from 'zod';
import { categoriesData, productsData } from '@/content/catalog-data';
import { imagesManifest } from '@/content/images-manifest';
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
    categoriesData.map((c, i) => {
      const img = imagesManifest.categories[c.slug];
      return { ...c, image: img ? { ...img, alt: `${c.name} made by VasuPrint` } : null, seo: seoFor(c.slug), sortOrder: i, status: 'published' };
    }),
  );
  const products: Product[] = z.array(productSchema).parse(
    productsData.map((p) => ({
      ...p,
      // Photos dropped into public/images/products/<slug>/ (see `pnpm images`); alt texts come from the content.
      images: (imagesManifest.products[p.slug] ?? []).slice(0, 6).map((img, i) => ({ ...img, alt: p.imageAlts[i] ?? `${p.name}, photo ${i + 1}` })),
      seo: seoFor(p.slug),
      status: 'published',
    })),
  );
  return { categories, products };
}
