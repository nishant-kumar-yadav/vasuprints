import type { Metadata } from 'next';
import { isValidObjectId } from 'mongoose';
import { notFound } from 'next/navigation';
import { CategoryEditor, type CategoryForm } from '@/components/admin/editor/CategoryEditor';
import { connectDb } from '@/lib/db/connect';
import { CategoryModel, ProductModel } from '@/models/catalog';

export const metadata: Metadata = { title: 'Edit category' };

export default async function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === 'new') {
    const blank: CategoryForm = { slug: '', name: '', heading: '', tagline: '', intro: [''], highlights: [], faqs: [], image: null, seo: { title: '', description: '' }, sortOrder: 0 };
    return <CategoryEditor key="new" id={null} initial={blank} status="draft" productCount={0} />;
  }
  if (!isValidObjectId(id)) notFound();
  await connectDb();
  const doc = await CategoryModel.findById(id).lean();
  if (!doc) notFound();
  const productCount = await ProductModel.countDocuments({ category: doc.slug });
  const initial: CategoryForm = {
    slug: doc.slug,
    name: doc.name,
    heading: doc.heading ?? '',
    tagline: doc.tagline ?? '',
    intro: doc.intro?.length ? [...doc.intro] : [''],
    highlights: (doc.highlights ?? []).map((f) => ({ icon: f.icon, title: f.title, body: f.body })),
    faqs: (doc.faqs ?? []).map((f) => ({ q: f.q, a: f.a })),
    image: doc.image ? { src: doc.image.src, alt: doc.image.alt, width: doc.image.width, height: doc.image.height } : null,
    seo: { title: doc.seo?.title ?? '', description: doc.seo?.description ?? '' },
    sortOrder: doc.sortOrder ?? 0,
  };
  return <CategoryEditor key={id} id={id} initial={initial} status={doc.status} productCount={productCount} />;
}
