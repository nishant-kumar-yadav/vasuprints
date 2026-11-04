import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { env } from '@/config/env';
import { mongoCatalogData, mongoRedirect } from './mongo';
import { staticCatalogData } from './static';
import { CatalogView, type CatalogData } from './view';

export { CatalogView } from './view';
export type { Category, CatalogData, Faq, Feature, Product, ProductImage } from './view';

export const CATALOG_TAG = 'catalog';

const cachedMongo = unstable_cache(() => mongoCatalogData(), ['catalog-data'], { tags: [CATALOG_TAG] });

async function loadData(): Promise<CatalogData> {
  if (env().CATALOG_SOURCE !== 'mongo') return staticCatalogData();
  try {
    return await cachedMongo();
  } catch (err) {
    // Never take the public site down because the database is unreachable.
    console.error('[catalog] MongoDB unavailable, serving static catalog:', (err as Error).message);
    return staticCatalogData();
  }
}

/** Published catalog for public pages (deduplicated per request). */
export const getCatalog = cache(async (): Promise<CatalogView> => new CatalogView(await loadData()));

export async function getRedirect(slug: string): Promise<string | null> {
  if (env().CATALOG_SOURCE !== 'mongo') return null;
  try {
    return await unstable_cache(() => mongoRedirect(slug), ['redirect', slug], { tags: [CATALOG_TAG] })();
  } catch {
    return null;
  }
}
