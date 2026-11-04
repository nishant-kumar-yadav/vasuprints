import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';

/**
 * Real MongoDB (in-memory server) + temp storage dirs. Set MONGOMS_SYSTEM_BINARY to use an installed
 * mongod instead of downloading one.
 */
let mongo: MongoMemoryServer;
let dir: string;

// Next.js request-scoped APIs, replaced for plain-Node tests.
export const cookieJar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (k: string) => (cookieJar.has(k) ? { name: k, value: cookieJar.get(k)! } : undefined),
    set: (k: string, v: string) => void cookieJar.set(k, v),
    delete: (k: string) => void cookieJar.delete(k),
  }),
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.9' }),
}));
vi.mock('next/cache', () => ({
  revalidatePath: () => undefined,
  revalidateTag: () => undefined,
  updateTag: () => undefined,
  unstable_cache: <T extends (...a: never[]) => unknown>(fn: T) => fn,
}));
vi.mock('next/navigation', () => ({
  redirect: (to: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { digest: `NEXT_REDIRECT;${to}` });
  },
  notFound: () => {
    throw Object.assign(new Error('NEXT_NOT_FOUND'), { digest: 'NEXT_NOT_FOUND' });
  },
}));
vi.mock('next/server', async (orig) => ({ ...(await orig<object>()), after: (fn: () => unknown) => void fn() }));

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  dir = mkdtempSync(path.join(tmpdir(), 'vp-test-'));
  Object.assign(process.env, {
    NODE_ENV: 'test',
    SITE_URL: 'http://localhost:3000',
    MONGODB_URI: mongo.getUri('vasuprint'),
    QUOTE_BACKEND: 'on',
    CATALOG_SOURCE: 'static',
    IP_HASH_SALT: 'test-salt-0123456789',
    UPLOAD_DIR: path.join(dir, 'uploads'),
    MEDIA_DIR: path.join(dir, 'media'),
    MAIL_DIR: path.join(dir, 'mail'),
    ADMIN_EMAIL: 'owner@example.com',
    SESSION_SECRET: 'test-session-secret-0123456789abcdefghijkl',
    TRUST_PROXY: 'true',
  });
  // argon2id hash of "correct-horse-battery-staple"
  const { hash } = await import('@node-rs/argon2');
  process.env.ADMIN_PASSWORD_HASH = await hash('correct-horse-battery-staple', { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  const { resetEnvCache } = await import('@/config/env');
  resetEnvCache();
});

beforeEach(async () => {
  cookieJar.clear();
  const { limits } = await import('@/lib/security/rate-limit');
  for (const l of Object.values(limits)) l.reset();
  if (mongoose.connection.readyState === 1) await mongoose.connection.db?.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
  rmSync(dir, { recursive: true, force: true });
});
