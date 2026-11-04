import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryView } from '@/components/catalog/CategoryView';
import { ProductView } from '@/components/catalog/ProductView';
import { allSlugs, getCategory, getProduct } from '@/lib/catalog';
import { metaFor } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metaFor(`/${slug}`);
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (category) return <CategoryView category={category} />;
  const product = getProduct(slug);
  if (product) return <ProductView product={product} />;
  notFound();
}
