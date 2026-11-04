import { getCatalog } from '@/lib/catalog';
import { OG_SIZE, ogCard } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'VasuPrint';

export async function generateStaticParams() {
  return (await getCatalog()).allSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const category = catalog.getCategory(slug);
  if (category) return ogCard({ eyebrow: 'Product range', title: category.name, text: category.tagline, image: category.image?.src });
  const product = catalog.getProduct(slug);
  if (product) return ogCard({ eyebrow: catalog.categoryName(product), title: product.name, text: product.summary, image: product.images[0]?.src });
  return ogCard({ eyebrow: 'Custom printing & packaging', title: 'VasuPrint' });
}
