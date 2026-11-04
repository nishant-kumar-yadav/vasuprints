import { z } from 'zod';
import { faqSchema, featureSchema, imageSchema, publishStatus, seoSchema, slugSchema, specSchema } from './common';

export const categorySchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(2).max(40),
  heading: z.string().trim().min(10).max(90),
  tagline: z.string().trim().min(10).max(140),
  intro: z.array(z.string().trim().min(20).max(600)).min(1).max(4),
  highlights: z.array(featureSchema).max(6),
  faqs: z.array(faqSchema).max(8),
  image: imageSchema.nullable(),
  seo: seoSchema,
  sortOrder: z.number().int().min(0),
  status: publishStatus,
});

const optionList = (max: number) => z.array(z.string().trim().min(1).max(80)).max(max);

export const productSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(2).max(60),
  /** Category slug. */
  category: slugSchema,
  heading: z.string().trim().min(10).max(90),
  summary: z.string().trim().min(40).max(220),
  intro: z.array(z.string().trim().min(20).max(800)).min(1).max(4),
  features: z.array(featureSchema).min(3).max(6),
  specs: z.array(specSchema).min(3).max(12),
  options: z.object({
    materials: optionList(12),
    printing: optionList(10),
    finishes: optionList(14),
    formats: optionList(10),
  }),
  applications: z.array(z.string().trim().min(1).max(80)).min(3).max(12),
  faqs: z.array(faqSchema).min(3).max(8),
  /** Uploaded photos. When empty the site shows the brand illustration for this slug. */
  images: z.array(imageSchema).max(6),
  /** Alt texts for the illustration gallery (used while `images` is empty). */
  imageAlts: z.array(z.string()).max(6),
  related: z.array(slugSchema).max(4),
  quoteHints: z.object({
    size: z.string().max(80),
    quantity: z.string().max(80),
    material: z.string().max(80),
  }),
  seo: seoSchema,
  featured: z.boolean(),
  sortOrder: z.number().int().min(0),
  status: publishStatus,
});

export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type Feature = z.infer<typeof featureSchema>;
export type Faq = z.infer<typeof faqSchema>;
export type ProductImage = z.infer<typeof imageSchema>;
