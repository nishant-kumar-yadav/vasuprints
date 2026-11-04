/**
 * Import the launch catalog (src/content) into MongoDB.
 *   pnpm db:seed            insert missing categories/products, leave edited ones alone
 *   pnpm db:seed --force    overwrite existing documents with the content files
 */
import mongoose from 'mongoose';
import { staticCatalogData } from '../src/lib/catalog/static';
import { CategoryModel, ProductModel } from '../src/models/catalog';

const force = process.argv.includes('--force');
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set (add it to .env.local or the environment).');
  process.exit(1);
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
await Promise.all([CategoryModel.syncIndexes(), ProductModel.syncIndexes()]);
const data = staticCatalogData();
let inserted = 0;
let updated = 0;
let skipped = 0;
let photos = 0;
for (const [Model, docs] of [
  [CategoryModel, data.categories],
  [ProductModel, data.products],
] as const) {
  for (const doc of docs) {
    const exists = await (Model as typeof CategoryModel).exists({ slug: doc.slug });
    if (exists && !force) {
      // Photos added with `pnpm images` are copied into documents that don't have any yet.
      if ('images' in doc && doc.images.length) {
        const r = await ProductModel.updateOne({ slug: doc.slug, images: { $size: 0 } }, { $set: { images: doc.images } });
        if (r.modifiedCount) photos++;
      } else if ('image' in doc && doc.image) {
        const r = await CategoryModel.updateOne({ slug: doc.slug, image: null }, { $set: { image: doc.image } });
        if (r.modifiedCount) photos++;
      }
      skipped++;
      continue;
    }
    await (Model as typeof CategoryModel).updateOne({ slug: doc.slug }, { $set: doc }, { upsert: true });
    if (exists) updated++;
    else inserted++;
  }
}
console.log(`Catalog seeded: ${inserted} inserted, ${updated} overwritten, ${skipped} left unchanged${skipped && !force ? ' (use --force to overwrite)' : ''}${photos ? `; photos added to ${photos}` : ''}.`);
await mongoose.disconnect();
