import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { CategoryView } from '@/components/catalog/CategoryView';
import { ProductView } from '@/components/catalog/ProductView';
import { getCatalog, getRedirect } from '@/lib/catalog';
import { catalogMeta } from '@/lib/seo';

// New slugs created in the admin render on first request, then are cached until the next edit.
export const dynamicParams = true;

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.allSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const item = catalog.getCategory(slug) ?? catalog.getProduct(slug);
  return item ? catalogMeta(item) : {};
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const category = catalog.getCategory(slug);
  if (category) return <CategoryView category={category} catalog={catalog} />;
  const product = catalog.getProduct(slug);
  if (product) return <ProductView product={product} catalog={catalog} />;
  const to = await getRedirect(slug);
  if (to) permanentRedirect(`/${to}`);
  notFound();
}
