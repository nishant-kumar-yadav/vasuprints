'use server';

import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { ActionError, adminAction } from '@/lib/admin/action';
import { recordRedirect, revalidateCatalog, slugTaken } from '@/lib/admin/catalog';
import { connectDb } from '@/lib/db/connect';
import { CategoryModel, ProductModel } from '@/models/catalog';
import { categoryDraftSchema, categorySchema, type Category } from '@/schemas/catalog';

const objectId = z.string().refine((v) => isValidObjectId(v), 'Unknown category.');

function toDoc(c: Category): Category {
  return {
    slug: c.slug,
    name: c.name,
    heading: c.heading,
    tagline: c.tagline,
    intro: c.intro,
    highlights: c.highlights.map((f) => ({ icon: f.icon, title: f.title, body: f.body })),
    faqs: c.faqs.map((f) => ({ q: f.q, a: f.a })),
    image: c.image ? { src: c.image.src, alt: c.image.alt, width: c.image.width, height: c.image.height } : null,
    seo: { title: c.seo.title, description: c.seo.description },
    sortOrder: c.sortOrder,
    status: c.status,
  };
}

export const saveCategory = adminAction(
  z.object({ id: objectId.nullable(), intent: z.enum(['save', 'publish', 'unpublish']), data: z.unknown() }),
  async ({ id, intent, data }) => {
    await connectDb();
    const existing = id ? await CategoryModel.findById(id).lean() : null;
    if (id && !existing) throw new ActionError('This category no longer exists.');
    const status = intent === 'publish' ? 'published' : intent === 'unpublish' ? 'draft' : (existing?.status ?? 'draft');
    const parsed = (status === 'published' ? categorySchema : categoryDraftSchema).safeParse({ ...(data as object), status });
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const i of parsed.error.issues) fields[i.path.join('.') || 'form'] ??= i.message;
      throw new ActionError('Please fix the highlighted fields.', fields);
    }
    const c = toDoc(parsed.data);
    if (await slugTaken(c.slug, id ? { kind: 'category', id } : undefined)) {
      throw new ActionError('That URL is already used by another page.', { slug: 'That URL is already used by another page.' });
    }
    if (!existing) {
      const max = await CategoryModel.findOne({}, { sortOrder: 1 }).sort({ sortOrder: -1 }).lean();
      const created = await CategoryModel.create({ ...c, sortOrder: (max?.sortOrder ?? -1) + 1 });
      revalidateCatalog();
      return { id: String(created._id), slug: c.slug };
    }
    await CategoryModel.updateOne({ _id: existing._id }, { $set: { ...c, sortOrder: existing.sortOrder } });
    if (existing.slug !== c.slug) {
      await ProductModel.updateMany({ category: existing.slug }, { $set: { category: c.slug } });
      if (existing.status === 'published') await recordRedirect(existing.slug, c.slug);
    }
    revalidateCatalog();
    return { id: String(existing._id), slug: c.slug };
  },
);

export const moveCategory = adminAction(z.object({ id: objectId, dir: z.enum(['up', 'down']) }), async ({ id, dir }) => {
  await connectDb();
  const all = await CategoryModel.find({}, { _id: 1 }).sort({ sortOrder: 1 }).lean();
  const ids = all.map((c) => String(c._id));
  const i = ids.indexOf(id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return { moved: false };
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  await CategoryModel.bulkWrite(ids.map((cid, k) => ({ updateOne: { filter: { _id: cid }, update: { $set: { sortOrder: k } } } })));
  revalidateCatalog();
  return { moved: true };
});

export const deleteCategory = adminAction(z.object({ id: objectId, confirm: z.string() }), async ({ id, confirm }) => {
  await connectDb();
  const c = await CategoryModel.findById(id, { slug: 1 }).lean();
  if (!c) throw new ActionError('This category no longer exists.');
  if (confirm !== c.slug) throw new ActionError('Type the category URL exactly to confirm.');
  const n = await ProductModel.countDocuments({ category: c.slug });
  if (n > 0) throw new ActionError(`Move or delete its ${n} product${n === 1 ? '' : 's'} first.`);
  await CategoryModel.deleteOne({ _id: c._id });
  revalidateCatalog();
  return { slug: c.slug };
});
