import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/catalog';
import { CONTENT_UPDATED } from '@/lib/catalog/view';
import { allGuides, allIndustries } from '@/lib/resources';
import { absoluteUrl } from '@/lib/seo';
import { policiesData } from '@/content/policies-data';

/**
 * One sitemap for the whole site (well under the 50,000-URL limit). lastmod comes from the data, so search
 * engines recrawl what actually changed; product photos are listed as image sitemap entries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const guides = allGuides();
  const latestGuide = guides.reduce((d, g) => (g.updated > d ? g.updated : d), CONTENT_UPDATED);
  const entry = (path: string, lastModified: string, priority: number, images?: string[]): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified: new Date(lastModified),
    priority,
    ...(images?.length ? { images: images.map((i) => (i.startsWith('http') ? i : absoluteUrl(i))) } : {}),
  });
  return [
    entry('/', CONTENT_UPDATED, 1),
    ...catalog.categories.map((c) => entry(`/${c.slug}`, catalog.lastModified(c.slug), 0.9, c.image ? [c.image.src] : undefined)),
    ...catalog.products.map((p) => entry(`/${p.slug}`, catalog.lastModified(p.slug), 0.8, p.images.map((i) => i.src))),
    entry('/industries', CONTENT_UPDATED, 0.7),
    ...allIndustries().map((i) => entry(`/industries/${i.slug}`, CONTENT_UPDATED, 0.7)),
    entry('/guides', latestGuide, 0.7),
    ...guides.map((g) => entry(`/guides/${g.slug}`, g.updated, 0.6)),
    entry('/about', CONTENT_UPDATED, 0.5),
    entry('/contact', CONTENT_UPDATED, 0.5),
    entry('/get-a-quote', CONTENT_UPDATED, 0.6),
    ...policiesData.map((p) => entry(`/${p.slug}`, p.updated, 0.2)),
  ];
}
