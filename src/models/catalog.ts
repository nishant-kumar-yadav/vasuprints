import mongoose, { Schema, type Model } from 'mongoose';
import type { Category, Product } from '@/schemas/catalog';

const opts = { timestamps: true, strict: 'throw' as const, versionKey: false as const };

const image = new Schema({ src: String, alt: String, width: Number, height: Number }, { _id: false, strict: 'throw' });
const feature = new Schema({ icon: String, title: String, body: String }, { _id: false, strict: 'throw' });
const faq = new Schema({ q: String, a: String }, { _id: false, strict: 'throw' });
const spec = new Schema({ label: String, value: String }, { _id: false, strict: 'throw' });
const seo = new Schema({ title: String, description: String }, { _id: false, strict: 'throw' });

export type CategoryDoc = Category & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date };
export type ProductDoc = Product & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date };

const categorySchema = new Schema<CategoryDoc>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    heading: String,
    tagline: String,
    intro: [String],
    highlights: [feature],
    faqs: [faq],
    image: { type: image, default: null },
    seo: { type: seo, required: true },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  opts,
);
categorySchema.index({ status: 1, sortOrder: 1 });

const productSchema = new Schema<ProductDoc>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    heading: String,
    summary: String,
    intro: [String],
    features: [feature],
    specs: [spec],
    options: {
      materials: [String],
      printing: [String],
      finishes: [String],
      formats: [String],
    },
    applications: [String],
    faqs: [faq],
    images: [image],
    imageAlts: [String],
    related: [String],
    quoteHints: { size: String, quantity: String, material: String },
    seo: { type: seo, required: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  opts,
);
productSchema.index({ category: 1, status: 1, sortOrder: 1 });
productSchema.index({ featured: 1, status: 1 });

const redirectSchema = new Schema(
  { from: { type: String, required: true, unique: true }, to: { type: String, required: true } },
  opts,
);

export const CategoryModel: Model<CategoryDoc> =
  (mongoose.models.Category as Model<CategoryDoc>) ?? mongoose.model<CategoryDoc>('Category', categorySchema);
export const ProductModel: Model<ProductDoc> =
  (mongoose.models.Product as Model<ProductDoc>) ?? mongoose.model<ProductDoc>('Product', productSchema);
export const RedirectModel =
  (mongoose.models.Redirect as Model<{ from: string; to: string }>) ??
  mongoose.model<{ from: string; to: string }>('Redirect', redirectSchema);
