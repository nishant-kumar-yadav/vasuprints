import 'server-only';
import { revalidatePath, updateTag } from 'next/cache';
import { CATALOG_TAG } from '@/lib/catalog';
import { connectDb } from '@/lib/db/connect';
import { CategoryModel, ProductModel, RedirectModel } from '@/models/catalog';

/** Admin edits must show on the public site immediately. */
export function revalidateCatalog() {
  updateTag(CATALOG_TAG);
  revalidatePath('/', 'layout');
}

export async function listAdminProducts() {
  await connectDb();
  return ProductModel.find({}, { name: 1, slug: 1, category: 1, status: 1, sortOrder: 1, featured: 1, images: 1, updatedAt: 1 })
    .sort({ category: 1, sortOrder: 1, name: 1 })
    .lean();
}

export async function listAdminCategories() {
  await connectDb();
  return CategoryModel.find().sort({ sortOrder: 1 }).lean();
}

/**
 * Record a permanent redirect old → new. Existing redirects that pointed at `from` are re-pointed
 * so chains never form, and any redirect *from* the new slug is removed (the slug is live again).
 */
export async function recordRedirect(from: string, to: string) {
  if (from === to) return;
  await RedirectModel.updateMany({ to: from }, { $set: { to } });
  await RedirectModel.deleteOne({ from: to });
  await RedirectModel.updateOne({ from }, { $set: { to } }, { upsert: true });
}

export async function slugTaken(slug: string, except?: { kind: 'product' | 'category'; id: string }) {
  await connectDb();
  const [p, c] = await Promise.all([ProductModel.findOne({ slug }, { _id: 1 }).lean(), CategoryModel.findOne({ slug }, { _id: 1 }).lean()]);
  if (p && !(except?.kind === 'product' && String(p._id) === except.id)) return true;
  if (c && !(except?.kind === 'category' && String(c._id) === except.id)) return true;
  return false;
}
