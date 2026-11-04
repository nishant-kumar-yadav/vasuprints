import { describe, expect, it } from 'vitest';
import { categories, getProduct, products } from '@/lib/catalog';
import { seoData } from '@/content/seo-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

describe('catalog content', () => {
  it('has 5 categories and 13 products', () => {
    expect(categories).toHaveLength(5);
    expect(products).toHaveLength(13);
  });
  it('every product belongs to a category and related slugs exist', () => {
    for (const p of products) {
      expect(categories.some((c) => c.slug === p.category)).toBe(true);
      for (const r of p.related) expect(getProduct(r), `${p.slug} → ${r}`).toBeDefined();
    }
  });
  it('every catalog page has unique SEO title and description', () => {
    const paths = [...categories.map((c) => `/${c.slug}`), ...products.map((p) => `/${p.slug}`)];
    for (const path of paths) expect(seoData[path], path).toBeDefined();
    const titles = Object.values(seoData).map((s) => s.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe('buildWhatsAppUrl', () => {
  it('encodes text', () => {
    expect(buildWhatsAppUrl('Hi & bye', '91 98765 43210')).toBe('https://wa.me/919876543210?text=Hi%20%26%20bye');
  });
});
