import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/catalog';
import { absoluteUrl } from '@/lib/seo';


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const pages = ['/', '/about', '/contact', '/get-a-quote', '/privacy-policy', '/terms-and-conditions', '/shipping-policy', '/refund-policy'];
  return [...pages, ...catalog.allSlugs().map((s) => `/${s}`)].map((p) => ({ url: absoluteUrl(p), lastModified: new Date('2026-11-01') }));
}
