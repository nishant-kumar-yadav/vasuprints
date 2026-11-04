import { cookieJar } from './setup';
import { describe, expect, it } from 'vitest';

const actionModules = {
  leads: () => import('@/app/admin/(panel)/leads/actions'),
  products: () => import('@/app/admin/(panel)/products/actions'),
  categories: () => import('@/app/admin/(panel)/categories/actions'),
};

describe('admin authorisation', () => {
  it('every exported admin action rejects without a session', async () => {
    let count = 0;
    for (const [name, load] of Object.entries(actionModules)) {
      const mod = (await load()) as Record<string, (input: unknown) => Promise<{ ok: boolean; error?: string }>>;
      for (const [fn, action] of Object.entries(mod)) {
        if (typeof action !== 'function') continue;
        const r = await action({ id: '000000000000000000000000', reference: 'VP-2026-000001', status: 'won', body: 'x', confirm: 'x', dir: 'up', intent: 'save', data: {} });
        expect(r.ok, `${name}.${fn}`).toBe(false);
        expect(r.error).toMatch(/session/i);
        count++;
      }
    }
    expect(count).toBe(11); // update when adding actions
  });

  it('admin route handlers return 401 without a cookie', async () => {
    const files = await import('@/app/api/admin/files/[id]/route');
    const exp = await import('@/app/api/admin/leads/export/route');
    const media = await import('@/app/api/admin/media/route');
    const req = (u: string, init?: RequestInit) => new Request(`http://localhost:3000${u}`, init);
    expect((await files.GET(req('/api/admin/files/x'), { params: Promise.resolve({ id: 'x' }) })).status).toBe(401);
    expect((await exp.GET(req('/api/admin/leads/export'))).status).toBe(401);
    expect((await media.POST(req('/api/admin/media', { method: 'POST' }))).status).toBe(401);
  });

  it('rejects a forged or revoked session token', async () => {
    const { signSession, verifySession } = await import('@/lib/auth/session');
    const good = await signSession();
    expect(await verifySession(good)).not.toBeNull();
    expect(await verifySession(good.slice(0, -2) + 'xx')).toBeNull();
    process.env.SESSION_VERSION = '2';
    const { resetEnvCache } = await import('@/config/env');
    resetEnvCache();
    expect(await verifySession(good)).toBeNull();
    process.env.SESSION_VERSION = '1';
    resetEnvCache();
  });
});

describe('login', () => {
  const form = (email: string, password: string) => {
    const f = new FormData();
    f.set('email', email);
    f.set('password', password);
    return f;
  };

  it('signs in with the right password and redirects only within /admin', async () => {
    const { login } = await import('@/app/admin/login/actions');
    const f = form('Owner@Example.com', 'correct-horse-battery-staple');
    f.set('next', '//evil.example/admin');
    await expect(login({}, f)).rejects.toMatchObject({ digest: 'NEXT_REDIRECT;/admin' });
    expect(cookieJar.get('vp_session')).toBeTruthy();
  });

  it('gives the same message for a wrong email and a wrong password', async () => {
    const { login } = await import('@/app/admin/login/actions');
    const a = await login({}, form('nobody@example.com', 'correct-horse-battery-staple'));
    const b = await login({}, form('owner@example.com', 'wrong-password-123'));
    expect(a.error).toBe(b.error);
    expect(cookieJar.has('vp_session')).toBe(false);
  });

  it('locks out the 6th attempt within 15 minutes', async () => {
    const { login } = await import('@/app/admin/login/actions');
    for (let i = 0; i < 5; i++) await login({}, form('owner@example.com', `wrong-${i}-password`));
    const r = await login({}, form('owner@example.com', 'correct-horse-battery-staple'));
    expect(r.error).toMatch(/too many attempts/i);
  });
});

describe('admin workflows (signed in)', () => {
  async function signIn() {
    const { signSession, SESSION_COOKIE } = await import('@/lib/auth/session');
    cookieJar.set(SESSION_COOKIE, await signSession());
  }

  it('updates lead status with history, adds notes and deletes with typed confirmation', async () => {
    await signIn();
    const { connectDb } = await import('@/lib/db/connect');
    await connectDb();
    const { createLead } = await import('@/lib/quotes/service');
    const { quoteInputSchema } = await import('@/schemas/quote');
    const input = quoteInputSchema.parse({
      name: 'Ravi Kumar', phone: '9876543210', email: 'r@example.com', categorySlug: 'custom-stickers', quantity: '1000',
      deliveryCity: 'Delhi', deliveryState: 'Delhi', consent: true,
    });
    const lead = await createLead(input, { ipHash: 'h', userAgent: 'test' });
    const a = await import('@/app/admin/(panel)/leads/actions');
    expect((await a.updateLeadStatus({ reference: lead.reference, status: 'quoted' })).ok).toBe(true);
    expect((await a.addLeadNote({ reference: lead.reference, body: 'Sent price' })).ok).toBe(true);
    const { LeadModel } = await import('@/models/lead');
    const after = await LeadModel.findOne({ reference: lead.reference }).lean();
    expect(after?.statusHistory.at(-1)).toMatchObject({ from: 'new', to: 'quoted' });
    expect(after?.notes).toHaveLength(1);
    expect((await a.deleteLead({ reference: lead.reference, confirm: 'VP-wrong' })).ok).toBe(false);
    expect((await a.deleteLead({ reference: lead.reference, confirm: lead.reference })).ok).toBe(true);
    expect(await LeadModel.countDocuments()).toBe(0);
  });

  it('creates drafts loosely, publishes strictly, and redirects renamed published products', async () => {
    await signIn();
    const { connectDb } = await import('@/lib/db/connect');
    await connectDb();
    const { staticCatalogData } = await import('@/lib/catalog/static');
    const { CategoryModel, ProductModel, RedirectModel } = await import('@/models/catalog');
    const data = staticCatalogData();
    await CategoryModel.insertMany(data.categories);
    await ProductModel.insertMany(data.products);
    const p = await import('@/app/admin/(panel)/products/actions');

    const draft = await p.saveProduct({ id: null, intent: 'save', data: { ...emptyProduct(), name: 'Foil Labels', slug: 'foil-labels', category: 'custom-stickers' } });
    expect(draft.ok).toBe(true);
    const publish = await p.saveProduct({ id: draft.ok ? draft.data.id : null, intent: 'publish', data: { ...emptyProduct(), name: 'Foil Labels', slug: 'foil-labels', category: 'custom-stickers' } });
    expect(publish.ok).toBe(false);
    if (!publish.ok) expect(Object.keys(publish.fields ?? {})).toContain('summary');

    const dupSlug = await p.saveProduct({ id: null, intent: 'save', data: { ...emptyProduct(), name: 'X', slug: 'about', category: 'custom-stickers' } });
    expect(dupSlug.ok).toBe(false);

    const mono = await ProductModel.findOne({ slug: 'mono-carton-boxes' }).lean();
    const { _id, createdAt, updatedAt, status, ...rest } = mono as NonNullable<typeof mono>;
    void createdAt; void updatedAt; void status;
    const renamed = await p.saveProduct({ id: String(_id), intent: 'save', data: { ...rest, slug: 'mono-cartons' } });
    expect(renamed.ok).toBe(true);
    expect(await RedirectModel.findOne({ from: 'mono-carton-boxes' }).lean()).toMatchObject({ to: 'mono-cartons' });
    // Related lists follow the rename.
    expect(await ProductModel.countDocuments({ related: 'mono-carton-boxes' })).toBe(0);

    const del = await p.deleteProduct({ id: String(_id), confirm: 'mono-cartons' });
    expect(del.ok).toBe(true);
    expect(await RedirectModel.findOne({ from: 'mono-carton-boxes' }).lean()).toMatchObject({ to: 'packaging-boxes' });
  });
});

function emptyProduct() {
  return {
    heading: '', summary: '', intro: [], features: [], specs: [], options: { materials: [], printing: [], finishes: [], formats: [] },
    applications: [], faqs: [], images: [], imageAlts: [], related: [], quoteHints: { size: '', quantity: '', material: '' },
    seo: { title: '', description: '' }, featured: false, sortOrder: 0,
  };
}
