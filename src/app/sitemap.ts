import type { MetadataRoute } from 'next';
import { allSlugs } from '@/lib/catalog';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['/', '/about', '/contact', '/get-a-quote', '/privacy-policy', '/terms-and-conditions', '/shipping-policy', '/refund-policy'];
  return [...pages, ...allSlugs().map((s) => `/${s}`)].map((p) => ({ url: absoluteUrl(p), lastModified: new Date('2026-11-01') }));
}
