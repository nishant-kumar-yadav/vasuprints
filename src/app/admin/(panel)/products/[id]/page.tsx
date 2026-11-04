import type { Metadata } from 'next';
import { isValidObjectId } from 'mongoose';
import { notFound } from 'next/navigation';
import { ProductEditor, type ProductForm } from '@/components/admin/editor/ProductEditor';
import { listAdminCategories } from '@/lib/admin/catalog';
import { connectDb } from '@/lib/db/connect';
import { ProductModel } from '@/models/catalog';

export const metadata: Metadata = { title: 'Edit product' };

const blank = (category: string): ProductForm => ({
  slug: '',
  name: '',
  category,
  heading: '',
  summary: '',
  intro: [''],
  features: [],
  specs: [],
  options: { materials: [], printing: [], finishes: [], formats: [] },
  applications: [],
  faqs: [],
  images: [],
  imageAlts: [],
  related: [],
  quoteHints: { size: '', quantity: '', material: '' },
  seo: { title: '', description: '' },
  featured: false,
  sortOrder: 0,
});

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ category?: string }> }) {
  const { id } = await params;
  await connectDb();
  const [categories, slugs] = await Promise.all([listAdminCategories(), ProductModel.find({}, { slug: 1 }).lean()]);
  const cats = categories.map((c) => ({ slug: c.slug, name: c.name }));
  const productSlugs = slugs.map((s) => s.slug);

  if (id === 'new') {
    const sp = await searchParams;
    const cat = cats.find((c) => c.slug === sp.category)?.slug ?? '';
    return <ProductEditor key="new" id={null} initial={blank(cat)} status="draft" categories={cats} productSlugs={productSlugs} />;
  }
  if (!isValidObjectId(id)) notFound();
  const doc = await ProductModel.findById(id).lean();
  if (!doc) notFound();
  const initial: ProductForm = {
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    heading: doc.heading ?? '',
    summary: doc.summary ?? '',
    intro: doc.intro?.length ? [...doc.intro] : [''],
    features: (doc.features ?? []).map((f) => ({ icon: f.icon, title: f.title, body: f.body })),
    specs: (doc.specs ?? []).map((s) => ({ label: s.label, value: s.value })),
    options: {
      materials: [...(doc.options?.materials ?? [])],
      printing: [...(doc.options?.printing ?? [])],
      finishes: [...(doc.options?.finishes ?? [])],
      formats: [...(doc.options?.formats ?? [])],
    },
    applications: [...(doc.applications ?? [])],
    faqs: (doc.faqs ?? []).map((f) => ({ q: f.q, a: f.a })),
    images: (doc.images ?? []).map((i) => ({ src: i.src, alt: i.alt, width: i.width, height: i.height })),
    imageAlts: [...(doc.imageAlts ?? [])],
    related: [...(doc.related ?? [])],
    quoteHints: { size: doc.quoteHints?.size ?? '', quantity: doc.quoteHints?.quantity ?? '', material: doc.quoteHints?.material ?? '' },
    seo: { title: doc.seo?.title ?? '', description: doc.seo?.description ?? '' },
    featured: Boolean(doc.featured),
    sortOrder: doc.sortOrder ?? 0,
  };
  return <ProductEditor key={id} id={id} initial={initial} status={doc.status} categories={cats} productSlugs={productSlugs} />;
}
