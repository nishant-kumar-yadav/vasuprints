import { describe, expect, it } from 'vitest';
import { staticCatalogData } from '@/lib/catalog/static';
import { CatalogView } from '@/lib/catalog/view';
import { seoData } from '@/content/seo-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

const catalog = new CatalogView(staticCatalogData());

describe('static catalog content', () => {
  it('has 5 categories and 13 products, all valid against the DB schemas', () => {
    expect(catalog.categories).toHaveLength(5);
    expect(catalog.products).toHaveLength(13);
  });
  it('every product belongs to a category and related slugs exist', () => {
    for (const p of catalog.products) {
      expect(catalog.getCategory(p.category)).toBeDefined();
      for (const r of p.related) expect(catalog.getProduct(r), `${p.slug} → ${r}`).toBeDefined();
    }
  });
  it('no slug is both a category and a product', () => {
    const slugs = catalog.allSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it('titles are unique across pages', () => {
    const titles = Object.values(seoData).map((s) => s.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
  it('hides drafts and products in hidden categories', () => {
    const data = staticCatalogData();
    data.products[0]!.status = 'draft';
    data.categories[4]!.status = 'draft';
    const v = new CatalogView(data);
    expect(v.getProduct(data.products[0]!.slug)).toBeUndefined();
    expect(v.productsIn(data.categories[4]!.slug)).toHaveLength(0);
  });
});

describe('buildWhatsAppUrl', () => {
  it('encodes text', () => {
    expect(buildWhatsAppUrl('Hi & bye', '91 98765 43210')).toBe('https://wa.me/919876543210?text=Hi%20%26%20bye');
  });
});
