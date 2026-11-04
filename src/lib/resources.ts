import { guidesData, type GuideData } from '@/content/guides';
import { industriesData, type IndustryData } from '@/content/industries';
import { renderMarkdown } from '@/lib/markdown';

export type { GuideData, IndustryData };

export interface Guide extends GuideData {
  html: string;
  toc: { id: string; text: string }[];
  readMinutes: number;
  words: number;
}

const cache = new Map<string, Guide>();

export function allGuides(): GuideData[] {
  return [...guidesData].sort((a, b) => b.published.localeCompare(a.published) || guidesData.indexOf(a) - guidesData.indexOf(b));
}

export function getGuide(slug: string): Guide | undefined {
  const hit = cache.get(slug);
  if (hit) return hit;
  const g = guidesData.find((x) => x.slug === slug);
  if (!g) return undefined;
  const { html, toc, words } = renderMarkdown(g.body);
  const guide = { ...g, html, toc, words, readMinutes: Math.max(1, Math.round(words / 220)) };
  cache.set(slug, guide);
  return guide;
}

/** Guides that mention any of these product slugs, most relevant first. */
export function guidesFor(productSlugs: string[], limit = 3): GuideData[] {
  const want = new Set(productSlugs);
  return guidesData
    .map((g) => ({ g, score: g.products.reduce((n, s, i) => n + (want.has(s) ? 10 - i : 0), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.g);
}

export function allIndustries(): IndustryData[] {
  return industriesData;
}

export function getIndustry(slug: string): IndustryData | undefined {
  return industriesData.find((x) => x.slug === slug);
}

export function industriesFor(productSlug: string): IndustryData[] {
  return industriesData.filter((i) => i.products.some((p) => p.slug === productSlug));
}
