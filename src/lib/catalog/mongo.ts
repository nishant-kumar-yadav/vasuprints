import 'server-only';
import { connectDb } from '@/lib/db/connect';
import { CategoryModel, ProductModel, RedirectModel } from '@/models/catalog';
import type { Category, Product } from '@/schemas/catalog';
import type { CatalogData } from './view';

function strip<T extends object>(doc: T): Omit<T, '_id' | 'createdAt' | 'updatedAt'> {
  const { _id, createdAt, updatedAt, ...rest } = doc as T & { _id?: unknown; createdAt?: unknown; updatedAt?: unknown };
  void _id;
  void createdAt;
  void updatedAt;
  return rest;
}

export async function mongoCatalogData(opts: { includeDrafts?: boolean } = {}): Promise<CatalogData> {
  await connectDb();
  const filter = opts.includeDrafts ? {} : { status: 'published' as const };
  const [categories, products] = await Promise.all([
    CategoryModel.find(filter).sort({ sortOrder: 1 }).lean(),
    ProductModel.find(filter).sort({ sortOrder: 1 }).lean(),
  ]);
  return {
    categories: categories.map((c) => strip(c) as Category),
    products: products.map((p) => strip(p) as Product),
  };
}

export async function mongoRedirect(from: string): Promise<string | null> {
  await connectDb();
  const r = await RedirectModel.findOne({ from }).lean();
  return r?.to ?? null;
}
