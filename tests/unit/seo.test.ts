import { describe, expect, it } from 'vitest';
import { seoData } from '@/content/seo-data';
import { guidesData } from '@/content/guides';
import { industriesData } from '@/content/industries';
import { staticCatalogData } from '@/lib/catalog/static';
import { CatalogView } from '@/lib/catalog/view';
import { renderMarkdown } from '@/lib/markdown';
import { guidesFor } from '@/lib/resources';
import { containsKeyword, seoChecks, seoScore } from '@/lib/seo-score';
import { articleLd, organizationLd, productLd } from '@/lib/seo';

const catalog = new CatalogView(staticCatalogData());
const pages = ['/', '/about', '/contact', '/get-a-quote', '/guides', '/industries', '/privacy-policy', '/terms-and-conditions', '/shipping-policy', '/refund-policy'];
const routes = new Set([
  ...pages,
  ...catalog.allSlugs().map((s) => `/${s}`),
  ...guidesData.map((g) => `/guides/${g.slug}`),
  ...industriesData.map((i) => `/industries/${i.slug}`),
]);

describe('guides and industry pages', () => {
  const metas = [
    ...Object.entries(seoData).map(([k, v]) => ({ k, ...v })),
    ...guidesData.map((g) => ({ k: g.slug, title: g.seoTitle, description: g.description })),
    ...industriesData.map((i) => ({ k: i.slug, title: i.seoTitle, description: i.description })),
  ];

  it('every title and description is unique across the site', () => {
    const t = metas.map((m) => m.title.toLowerCase());
    const d = metas.map((m) => m.description.toLowerCase());
    expect(new Set(t).size).toBe(t.length);
    expect(new Set(d).size).toBe(d.length);
  });

  it('new pages keep titles ≤ 60 and descriptions 120–160 characters', () => {
    for (const x of [...guidesData, ...industriesData]) {
      expect(x.seoTitle.length, x.slug).toBeLessThanOrEqual(60);
      expect(x.description.length, x.slug).toBeGreaterThanOrEqual(120);
      expect(x.description.length, x.slug).toBeLessThanOrEqual(160);
    }
  });

  it('every internal link in guides points at a real page', () => {
    for (const g of guidesData) {
      for (const [, href] of g.body.matchAll(/\]\((\/[^)#?]*)/g)) expect(routes.has(href!), `${g.slug} → ${href}`).toBe(true);
    }
  });

  it('guides are substantial and link to products', () => {
    for (const g of guidesData) {
      const r = renderMarkdown(g.body);
      expect(r.words, g.slug).toBeGreaterThanOrEqual(550);
      expect(r.toc.length, g.slug).toBeGreaterThanOrEqual(4);
      for (const s of g.products) expect(catalog.getProduct(s), `${g.slug} → ${s}`).toBeDefined();
    }
  });

  it('industry pages reference real products and guides', () => {
    for (const i of industriesData) {
      for (const p of i.products) expect(catalog.getProduct(p.slug), `${i.slug} → ${p.slug}`).toBeDefined();
      for (const g of i.guides) expect(guidesData.some((x) => x.slug === g), `${i.slug} → ${g}`).toBe(true);
    }
  });

  it('every product has at least one guide to read next', () => {
    for (const p of catalog.products) expect(guidesFor([p.slug]).length, p.slug).toBeGreaterThan(0);
  });

  it('renders tables in policies (regression: malformed separator rows)', () => {
    expect(renderMarkdown('| a | b |\n|---|---|\n| 1 | 2 |').html).toContain('<table>');
  });
});

describe('seo checklist', () => {
  it('matches singular/plural and hyphenated forms', () => {
    expect(containsKeyword('Mono Carton Box Manufacturer', 'Mono Carton Boxes')).toBe(true);
    expect(containsKeyword('mono-carton-boxes', 'Mono Carton Boxes')).toBe(true);
    expect(containsKeyword('Duplex boxes', 'Mono Carton Boxes')).toBe(false);
  });
  it('scores the launch catalog well', () => {
    for (const p of catalog.products) {
      const checks = seoChecks({
        keyword: p.name,
        slug: p.slug,
        title: p.seo.title,
        description: p.seo.description,
        heading: p.heading,
        intro: p.intro,
        body: [p.summary, ...p.features.flatMap((f) => [f.title, f.body]), ...p.faqs.flatMap((f) => [f.q, f.a]), ...p.specs.map((s) => `${s.label} ${s.value}`), ...p.applications, ...Object.values(p.options).flat()],
        imageAlts: p.imageAlts,
        faqCount: p.faqs.length,
      });
      const failing = checks.filter((c) => !c.ok).map((c) => c.id);
      expect(seoScore(checks), `${p.slug}: ${failing.join(', ')}`).toBeGreaterThanOrEqual(80);
    }
  });
});

describe('structured data', () => {
  it('never emits placeholder values', () => {
    const json = JSON.stringify([organizationLd(), productLd(catalog.products[0]!, 'Packaging Boxes')]);
    expect(json).not.toContain('__PLACEHOLDER__');
    expect(json).not.toContain('"—"');
  });
  it('articles carry dates with an IST offset and link to the organisation', () => {
    const g = guidesData[0]!;
    const ld = articleLd({ ...g, words: 900 });
    expect(ld.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}T09:00:00\+05:30$/);
    expect(ld.publisher['@id']).toContain('#organization');
  });
});
