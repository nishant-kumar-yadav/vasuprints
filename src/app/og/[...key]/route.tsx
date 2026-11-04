import { notFound } from 'next/navigation';
import { seoData } from '@/content/seo-data';
import { getCatalog } from '@/lib/catalog';
import { ogCard } from '@/lib/og';
import { allGuides, allIndustries, getGuide, getIndustry } from '@/lib/resources';

/**
 * Social share cards at stable URLs (/og/<kind>/<slug>.png), so metadata and structured data can
 * reference them directly. Rendered once at build time; catalog cards for new slugs render on first request.
 */
export const dynamicParams = true;

const pages: Record<string, { eyebrow: string; title: string; text?: string }> = {
  home: { eyebrow: 'Custom printing & packaging', title: 'Packaging, stickers, DTF transfers and tags for your brand', text: 'Made to your size, material and quantity.' },
  about: { eyebrow: 'About VasuPrint', title: 'Your printing and packaging partner', text: seoData['/about']?.description },
  contact: { eyebrow: 'Contact', title: 'Talk to VasuPrint', text: 'Call, WhatsApp or email us your requirements for a quotation.' },
  'get-a-quote': { eyebrow: 'Get a quote', title: 'Tell us what you need printed', text: 'Share size, quantity, material and artwork. We reply with pricing.' },
  guides: { eyebrow: 'Buyer guides', title: 'Printing & packaging guides', text: 'Plain-English answers before you order.' },
  industries: { eyebrow: 'Industries', title: 'Packaging and labels for your industry', text: 'Cosmetics, pharma, food, apparel, FMCG and gifting.' },
  legal: { eyebrow: 'VasuPrint', title: 'Policies', text: 'Clear terms for custom printing and packaging orders.' },
};

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return [
    ...Object.keys(pages).map((k) => ({ key: ['page', `${k}.png`] })),
    ...catalog.allSlugs().map((s) => ({ key: ['c', `${s}.png`] })),
    ...allGuides().map((g) => ({ key: ['guides', `${g.slug}.png`] })),
    ...allIndustries().map((i) => ({ key: ['industries', `${i.slug}.png`] })),
  ];
}

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const [kind, file] = key;
  const slug = file?.replace(/\.png$/, '');
  if (key.length !== 2 || !slug || file === slug) notFound();
  if (kind === 'page' && pages[slug]) return ogCard(pages[slug]);
  if (kind === 'guides') {
    const g = getGuide(slug);
    if (g) return ogCard({ eyebrow: `Guide · ${g.topic}`, title: g.title, text: `${g.readMinutes} min read` });
  }
  if (kind === 'industries') {
    const i = getIndustry(slug);
    if (i) return ogCard({ eyebrow: 'Industries', title: i.name, text: i.excerpt });
  }
  if (kind === 'c') {
    const catalog = await getCatalog();
    const category = catalog.getCategory(slug);
    if (category) return ogCard({ eyebrow: 'Product range', title: category.name, text: category.tagline, image: category.image?.src });
    const product = catalog.getProduct(slug);
    if (product) return ogCard({ eyebrow: catalog.categoryName(product), title: product.name, text: product.summary, image: product.images[0]?.src });
  }
  notFound();
}
