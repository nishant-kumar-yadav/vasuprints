import { z } from 'zod';

/** URLs that catalog slugs may never take (ARCHITECTURE §4.1). */
export const RESERVED_SLUGS = [
  'about', 'contact', 'get-a-quote', 'admin', 'api', 'privacy-policy', 'terms-and-conditions', 'shipping-policy',
  'refund-policy', 'sitemap.xml', 'robots.txt', 'images', '_next', 'media', 'icon.svg',
] as const;

export const slugSchema = z
  .string()
  .trim()
  .min(3, 'Use at least 3 characters.')
  .max(80, 'Keep the URL under 80 characters.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens only.')
  .refine((s) => !(RESERVED_SLUGS as readonly string[]).includes(s), 'This URL is reserved.');

export const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().trim().min(5, 'Describe the image in at least 5 characters.').max(160),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const seoSchema = z.object({
  title: z.string().trim().min(10, 'SEO title needs at least 10 characters.').max(60, 'Keep the SEO title within 60 characters.'),
  description: z
    .string()
    .trim()
    .min(70, 'SEO description needs at least 70 characters.')
    .max(170, 'Keep the SEO description within 160 characters.'),
});

export const faqSchema = z.object({
  q: z.string().trim().min(5).max(200),
  a: z.string().trim().min(10).max(800),
});

export const featureSchema = z.object({
  icon: z.string().max(40),
  title: z.string().trim().min(2).max(60),
  body: z.string().trim().min(10).max(240),
});

export const specSchema = z.object({
  label: z.string().trim().min(2).max(40),
  value: z.string().trim().min(1).max(200),
});

export const publishStatus = z.enum(['draft', 'published']);
export type PublishStatus = z.infer<typeof publishStatus>;
