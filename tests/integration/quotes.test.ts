import './setup';
import mongoose from 'mongoose';
import { describe, expect, it } from 'vitest';

const ORIGIN = 'http://localhost:3000';

function quoteBody(over: Record<string, unknown> = {}) {
  return {
    kind: 'quote',
    name: 'Asha Rao',
    company: 'Rao Foods',
    phone: '98765 43210',
    email: 'asha@example.com',
    categorySlug: 'packaging-boxes',
    productSlug: 'mono-carton-boxes',
    size: '100 × 50 × 30 mm',
    quantity: '5,000',
    material: '',
    finishing: '',
    deliveryCity: 'Pune',
    deliveryState: 'Maharashtra',
    additional: '',
    uploadIds: [],
    consent: true,
    website: '',
    ...over,
  };
}

async function postQuote(body: unknown, headers: Record<string, string> = {}) {
  const { POST } = await import('@/app/api/quotes/route');
  return POST(
    new Request('http://localhost:3000/api/quotes', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN, 'x-forwarded-for': '198.51.100.1', ...headers },
      body: JSON.stringify(body),
    }),
  );
}

async function upload(name: string, bytes: Buffer, ip = '198.51.100.1') {
  const { POST } = await import('@/app/api/uploads/route');
  const fd = new FormData();
  fd.set('file', new Blob([new Uint8Array(bytes)]), name);
  const req = new Request('http://localhost:3000/api/uploads', { method: 'POST', headers: { origin: ORIGIN, 'x-forwarded-for': ip }, body: fd });
  return POST(req);
}

const PDF = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n');

describe('POST /api/quotes', () => {
  it('stores a lead with a sequential reference and records email delivery', async () => {
    const r1 = await postQuote(quoteBody());
    expect(r1.status).toBe(201);
    const { reference } = (await r1.json()) as { reference: string };
    expect(reference).toMatch(/^VP-\d{4}-000001$/);
    const r2 = await postQuote(quoteBody({ email: 'b@example.com' }));
    expect(((await r2.json()) as { reference: string }).reference).toMatch(/-000002$/);

    const { LeadModel } = await import('@/models/lead');
    await new Promise((r) => setTimeout(r, 300)); // after() email work
    const lead = await LeadModel.findOne({ reference }).lean();
    expect(lead?.customer.phone).toBe('+919876543210');
    expect(lead?.request.productName).toBe('Mono Carton Boxes');
    expect(lead?.consent.noticeVersion).toBeTruthy();
    expect(lead?.meta.ipHash).not.toContain('198.51');
    expect(lead?.email.admin.status).toBe('sent');
  });

  it('rejects a foreign Origin with 403', async () => {
    const r = await postQuote(quoteBody(), { origin: 'https://evil.example' });
    expect(r.status).toBe(403);
  });

  it('returns a fake reference for a filled honeypot and stores nothing', async () => {
    const r = await postQuote(quoteBody({ website: 'http://spam.example' }));
    expect(r.status).toBe(201);
    expect(((await r.json()) as { reference: string }).reference).toMatch(/^VP-/);
    const { LeadModel } = await import('@/models/lead');
    expect(await LeadModel.countDocuments()).toBe(0);
  });

  it('rejects operator injection in fields with 400', async () => {
    const r = await postQuote(quoteBody({ categorySlug: { $gt: '' } }));
    expect(r.status).toBe(400);
    const r2 = await postQuote({ ...quoteBody(), $where: '1' });
    expect(r2.status).toBe(400);
  });

  it('rejects an unknown category or a product from another category', async () => {
    const r = await postQuote(quoteBody({ productSlug: 'die-cut-stickers' }));
    expect(r.status).toBe(400);
    const body = (await r.json()) as { error: { fields: Record<string, string> } };
    expect(body.error.fields.productSlug).toBeTruthy();
  });

  it('rate limits after 5 quotes an hour', async () => {
    for (let i = 0; i < 5; i++) expect((await postQuote(quoteBody({ email: `x${i}@example.com` }))).status).toBe(201);
    const r = await postQuote(quoteBody());
    expect(r.status).toBe(429);
    expect(r.headers.get('retry-after')).toBeTruthy();
  });

  it("refuses another visitor's upload id", async () => {
    const up = await upload('art.pdf', PDF, '192.0.2.50');
    expect(up.status).toBe(201);
    const { uploadId } = (await up.json()) as { uploadId: string };
    const r = await postQuote(quoteBody({ uploadIds: [uploadId] }));
    expect(r.status).toBe(400);
    expect(((await r.json()) as { error: { code: string } }).error.code).toBe('INVALID_UPLOADS');
  });

  it('attaches own uploads and moves them under the lead', async () => {
    const up = await upload('art.pdf', PDF);
    const { uploadId } = (await up.json()) as { uploadId: string };
    const r = await postQuote(quoteBody({ uploadIds: [uploadId] }));
    expect(r.status).toBe(201);
    const { UploadModel } = await import('@/models/lead');
    const u = await UploadModel.findById(uploadId).lean();
    expect(u?.status).toBe('attached');
    expect(u?.storagePath).toMatch(/^leads\/VP-/);
  });
});

describe('POST /api/uploads', () => {
  it('rejects a .png that contains PDF bytes', async () => {
    expect((await upload('logo.png', PDF)).status).toBe(415);
  });
  it('rejects an executable renamed to .pdf', async () => {
    expect((await upload('invoice.pdf', Buffer.from('MZ\x90\x00\x03\x00\x00\x00', 'binary'))).status).toBe(415);
  });
  it('rejects disallowed extensions', async () => {
    expect((await upload('run.exe', Buffer.from('MZ'))).status).toBe(415);
  });
  it('accepts a real PDF', async () => {
    const r = await upload('brief.pdf', PDF);
    expect(r.status).toBe(201);
  });
});

describe('database hygiene', () => {
  it('neutralises query operators in filters (sanitizeFilter)', async () => {
    const { connectDb } = await import('@/lib/db/connect');
    await connectDb();
    const { LeadModel } = await import('@/models/lead');
    await LeadModel.create({ reference: 'VP-2026-000009', customer: { name: 'a', company: '', phone: '', email: '' } });
    // {$ne: 'x'} would match every lead; sanitizeFilter turns it into {$eq: {...}}, which can never match.
    await expect(LeadModel.findOne({ reference: { $ne: 'x' } as unknown as string }).lean()).rejects.toThrow(/Cast to string/);
    expect(mongoose.get('sanitizeFilter')).toBe(true);
  });
});
