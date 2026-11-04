import 'server-only';
import { business, isSet } from '@/config/business';
import { env } from '@/config/env';
import { connectDb, trusted } from '@/lib/db/connect';
import { sendEmail } from '@/lib/email/send';
import { adminQuoteEmail, customerAckEmail } from '@/lib/email/templates';
import { fileStore } from '@/lib/uploads/store';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { CategoryModel, ProductModel } from '@/models/catalog';
import { LeadModel, UploadModel, type LeadDoc } from '@/models/lead';
import { staticCatalogData } from '@/lib/catalog/static';
import type { QuoteInput } from '@/schemas/quote';
import { nextLeadReference } from './reference';

export const PRIVACY_NOTICE_VERSION = '2026-11-01';

export class QuoteError extends Error {
  constructor(
    readonly code: 'VALIDATION_FAILED' | 'INVALID_UPLOADS',
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

/** Resolve category/product names from whichever catalog is live. */
async function resolveCatalog(categorySlug: string, productSlug: string | null) {
  if (env().CATALOG_SOURCE === 'mongo') {
    const [cat, prod] = await Promise.all([
      CategoryModel.findOne({ slug: categorySlug, status: 'published' }).lean(),
      productSlug ? ProductModel.findOne({ slug: productSlug, status: 'published' }).lean() : null,
    ]);
    return { cat: cat ? { name: cat.name } : null, prod: prod ? { name: prod.name, category: prod.category } : null };
  }
  const data = staticCatalogData();
  const cat = data.categories.find((c) => c.slug === categorySlug) ?? null;
  const prod = productSlug ? (data.products.find((p) => p.slug === productSlug) ?? null) : null;
  return { cat, prod };
}

export async function createLead(input: QuoteInput, ctx: { ipHash: string; userAgent: string }): Promise<LeadDoc> {
  await connectDb();
  const productSlug = input.productSlug && input.productSlug !== 'not-sure' ? input.productSlug : null;
  const { cat, prod } = await resolveCatalog(input.categorySlug, productSlug);
  if (!cat) throw new QuoteError('VALIDATION_FAILED', 'Unknown category', { categorySlug: 'Choose a product category.' });
  if (productSlug && (!prod || prod.category !== input.categorySlug)) {
    throw new QuoteError('VALIDATION_FAILED', 'Unknown product', { productSlug: 'Choose a product from this category.' });
  }

  const ids = [...new Set(input.uploadIds)];
  const uploads = ids.length ? await UploadModel.find({ _id: trusted({ $in: ids }) }).lean() : [];
  if (uploads.length !== ids.length || uploads.some((u) => u.status !== 'pending' || u.ipHash !== ctx.ipHash)) {
    throw new QuoteError('INVALID_UPLOADS', 'Some files could not be attached. Please add them again.');
  }

  const reference = await nextLeadReference();
  const now = new Date();
  const lead = await LeadModel.create({
    reference,
    kind: input.kind,
    status: 'new',
    customer: { name: input.name, company: input.company, phone: input.phone, email: input.email },
    request: {
      categorySlug: input.categorySlug,
      categoryName: cat.name,
      productSlug: prod ? productSlug : null,
      productName: prod?.name ?? null,
      size: input.size,
      quantity: input.quantity,
      material: input.material,
      finishing: input.finishing,
      deliveryCity: input.deliveryCity,
      deliveryState: input.deliveryState,
      additional: input.additional,
    },
    files: ids,
    source: {
      landingPage: input.source.landingPage,
      submitPage: input.source.submitPage,
      utmSource: input.source.utmSource,
      utmMedium: input.source.utmMedium,
      utmCampaign: input.source.utmCampaign,
    },
    consent: { accepted: true, noticeVersion: PRIVACY_NOTICE_VERSION, at: now },
    email: { admin: { status: 'pending' }, customer: { status: 'pending' } },
    notes: [],
    statusHistory: [],
    meta: { ipHash: ctx.ipHash, userAgent: ctx.userAgent.slice(0, 300) },
  });

  const store = fileStore();
  for (const u of uploads) {
    const finalPath = await store.promote(u.storagePath, u._id, u.ext, reference);
    await UploadModel.updateOne({ _id: u._id }, { $set: { status: 'attached', leadId: lead._id, storagePath: finalPath } });
  }
  return lead.toObject();
}

/** Admin + customer emails. Never throws: results are recorded on the lead. */
export async function notifyLead(reference: string, which: ('admin' | 'customer')[] = ['admin', 'customer']) {
  await connectDb();
  const lead = await LeadModel.findOne({ reference }).lean();
  if (!lead) return;
  const e = env();
  const files = lead.files.length ? await UploadModel.find({ _id: trusted({ $in: lead.files }) }).lean() : [];

  const record = async (key: 'admin' | 'customer', fn: () => Promise<unknown>) => {
    try {
      await fn();
      await LeadModel.updateOne({ reference }, { $set: { [`email.${key}`]: { status: 'sent', at: new Date() } } });
    } catch (err) {
      console.warn(`[email] ${key} email failed for ${reference}: ${(err as Error).message}`);
      await LeadModel.updateOne(
        { reference },
        { $set: { [`email.${key}`]: { status: 'failed', at: new Date(), error: (err as Error).message.slice(0, 300) } } },
      );
    }
  };

  if (which.includes('admin')) {
    const to = e.QUOTE_NOTIFY_TO ?? (isSet(business.email) ? business.email : 'admin@localhost');
    await record('admin', () =>
      sendEmail(to, adminQuoteEmail(lead, files.map((f) => ({ name: f.originalName, bytes: f.bytes })), e.SITE_URL), {
        replyTo: lead.customer.email,
      }),
    );
  }
  if (which.includes('customer')) {
    const wa = buildWhatsAppUrl(`Hi VasuPrint, this is about my quote request ${lead.reference}.`);
    await record('customer', () =>
      sendEmail(lead.customer.email, customerAckEmail(lead, wa), { replyTo: isSet(business.email) ? business.email : undefined }),
    );
  }
}
