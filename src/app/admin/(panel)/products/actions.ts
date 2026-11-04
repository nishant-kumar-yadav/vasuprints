'use server';

import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { ActionError, adminAction } from '@/lib/admin/action';
import { recordRedirect, revalidateCatalog, slugTaken } from '@/lib/admin/catalog';
import { connectDb } from '@/lib/db/connect';
import { CategoryModel, ProductModel } from '@/models/catalog';
import { productDraftSchema, productSchema, type Product } from '@/schemas/catalog';

const objectId = z.string().refine((v) => isValidObjectId(v), 'Unknown product.');

/** Explicit field mapping (never spread request data into Mongoose). */
function toDoc(p: Product): Product {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    heading: p.heading,
    summary: p.summary,
    intro: p.intro,
    features: p.features.map((f) => ({ icon: f.icon, title: f.title, body: f.body })),
    specs: p.specs.map((s) => ({ label: s.label, value: s.value })),
    options: { materials: p.options.materials, printing: p.options.printing, finishes: p.options.finishes, formats: p.options.formats },
    applications: p.applications,
    faqs: p.faqs.map((f) => ({ q: f.q, a: f.a })),
    images: p.images.map((i) => ({ src: i.src, alt: i.alt, width: i.width, height: i.height })),
    imageAlts: p.imageAlts,
    related: p.related.filter((s) => s !== p.slug),
    quoteHints: { size: p.quoteHints.size, quantity: p.quoteHints.quantity, material: p.quoteHints.material },
    seo: { title: p.seo.title, description: p.seo.description },
    featured: p.featured,
    sortOrder: p.sortOrder,
    status: p.status,
  };
}

function issuesToFields(issues: z.core.$ZodIssue[]) {
  const fields: Record<string, string> = {};
  for (const i of issues) fields[i.path.join('.') || 'form'] ??= i.message;
  return fields;
}

export const saveProduct = adminAction(
  z.object({ id: objectId.nullable(), intent: z.enum(['save', 'publish', 'unpublish']), data: z.unknown() }),
  async ({ id, intent, data }) => {
    await connectDb();
    const existing = id ? await ProductModel.findById(id).lean() : null;
    if (id && !existing) throw new ActionError('This product no longer exists.');
    const status = intent === 'publish' ? 'published' : intent === 'unpublish' ? 'draft' : (existing?.status ?? 'draft');
    const candidate = { ...(data as object), status };
    const parsed = (status === 'published' ? productSchema : productDraftSchema).safeParse(candidate);
    if (!parsed.success) {
      throw new ActionError(
        status === 'published' ? 'Some fields need attention before this product can be published.' : 'Please fix the highlighted fields.',
        issuesToFields(parsed.error.issues),
      );
    }
    const p = toDoc(parsed.data);
    if (!(await CategoryModel.exists({ slug: p.category }))) throw new ActionError('Choose a category.', { category: 'Choose a category.' });
    if (await slugTaken(p.slug, id ? { kind: 'product', id } : undefined)) {
      throw new ActionError('That URL is already used by another page.', { slug: 'That URL is already used by another page.' });
    }

    if (!existing) {
      const max = await ProductModel.findOne({ category: p.category }, { sortOrder: 1 }).sort({ sortOrder: -1 }).lean();
      const created = await ProductModel.create({ ...p, sortOrder: (max?.sortOrder ?? -1) + 1 });
      revalidateCatalog();
      return { id: String(created._id), slug: p.slug, status: p.status };
    }

    await ProductModel.updateOne({ _id: existing._id }, { $set: p });
    if (existing.slug !== p.slug) {
      // Keep old links working and other products' "related" lists pointing at the new URL.
      if (existing.status === 'published') await recordRedirect(existing.slug, p.slug);
      await ProductModel.updateMany({ related: existing.slug }, { $set: { 'related.$': p.slug } });
    }
    revalidateCatalog();
    return { id: String(existing._id), slug: p.slug, status: p.status };
  },
);

export const duplicateProduct = adminAction(z.object({ id: objectId }), async ({ id }) => {
  await connectDb();
  const src = await ProductModel.findById(id).lean();
  if (!src) throw new ActionError('This product no longer exists.');
  let n = 1;
  let slug = `${src.slug}-copy`;
  while (await slugTaken(slug)) slug = `${src.slug}-copy-${++n}`;
  const { _id, createdAt, updatedAt, ...rest } = src;
  void _id;
  void createdAt;
  void updatedAt;
  const copy = await ProductModel.create({ ...toDoc(rest as Product), slug, name: `${src.name} (copy)`.slice(0, 60), status: 'draft', featured: false, sortOrder: src.sortOrder + 1 });
  revalidateCatalog();
  return { id: String(copy._id) };
});

export const moveProduct = adminAction(z.object({ id: objectId, dir: z.enum(['up', 'down']) }), async ({ id, dir }) => {
  await connectDb();
  const p = await ProductModel.findById(id, { category: 1 }).lean();
  if (!p) throw new ActionError('This product no longer exists.');
  const siblings = await ProductModel.find({ category: p.category }, { _id: 1 }).sort({ sortOrder: 1, name: 1 }).lean();
  const ids = siblings.map((s) => String(s._id));
  const i = ids.indexOf(id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return { moved: false };
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  await ProductModel.bulkWrite(ids.map((pid, k) => ({ updateOne: { filter: { _id: pid }, update: { $set: { sortOrder: k } } } })));
  revalidateCatalog();
  return { moved: true };
});

export const deleteProduct = adminAction(z.object({ id: objectId, confirm: z.string() }), async ({ id, confirm }) => {
  await connectDb();
  const p = await ProductModel.findById(id, { slug: 1, category: 1 }).lean();
  if (!p) throw new ActionError('This product no longer exists.');
  if (confirm !== p.slug) throw new ActionError('Type the product URL exactly to confirm.');
  await ProductModel.deleteOne({ _id: p._id });
  await ProductModel.updateMany({ related: p.slug }, { $pull: { related: p.slug } });
  // The old URL now forwards to its category page instead of 404ing.
  await recordRedirect(p.slug, p.category);
  revalidateCatalog();
  return { category: p.category };
});
