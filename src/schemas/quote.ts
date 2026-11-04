import { z } from 'zod';
import { INDIAN_STATES, normalizeIndianMobile } from '@/lib/quote';

const text = (max: number) => z.string().trim().max(max);
const short = (max: number) => z.string().max(max).default('');

/** Server-side body for POST /api/quotes. Mirrors the client form schema plus transport fields. */
export const quoteInputSchema = z
  .object({
    kind: z.enum(['quote', 'message']).default('quote'),
    name: text(80).min(2, 'Enter your full name.'),
    company: text(120).default(''),
    phone: z
      .string()
      .max(30)
      .transform((v, ctx) => {
        const e164 = normalizeIndianMobile(v);
        if (!e164) {
          ctx.addIssue({ code: 'custom', message: 'Enter a 10-digit Indian mobile number.' });
          return z.NEVER;
        }
        return e164;
      }),
    email: text(120).pipe(z.email('Enter a valid email address.')),
    categorySlug: z.string().min(1, 'Choose a product category.').max(80),
    productSlug: z.string().max(80).nullable().default(null),
    size: text(120).default(''),
    quantity: text(40).min(1, 'Enter the quantity you need.'),
    material: text(120).default(''),
    finishing: text(1000).default(''),
    deliveryCity: text(80).default(''),
    deliveryState: z.union([z.enum(INDIAN_STATES), z.literal('')]).default(''),
    additional: text(2000).default(''),
    uploadIds: z.array(z.uuid()).max(3, 'You can attach up to 3 files.').default([]),
    consent: z.literal(true, 'Please agree so we can contact you about this enquiry.'),
    turnstileToken: z.string().max(4096).optional(),
    formToken: z.string().max(200).optional(),
    website: z.string().max(200).default(''),
    source: z
      .object({
        landingPage: short(300),
        submitPage: short(300),
        utmSource: short(100),
        utmMedium: short(100),
        utmCampaign: short(100),
      })
      .default({ landingPage: '', submitPage: '', utmSource: '', utmMedium: '', utmCampaign: '' }),
  })
  .strict()
  .superRefine((v, ctx) => {
    // The full quote form needs a delivery location; the short contact form does not.
    if (v.kind === 'quote') {
      if (v.deliveryCity.length < 2) ctx.addIssue({ code: 'custom', path: ['deliveryCity'], message: 'Enter the delivery city.' });
      if (!v.deliveryState) ctx.addIssue({ code: 'custom', path: ['deliveryState'], message: 'Choose the delivery state.' });
    }
  });

export type QuoteInput = z.output<typeof quoteInputSchema>;
