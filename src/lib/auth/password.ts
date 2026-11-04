import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import { env } from '@/config/env';

/** argon2id parameters from SECURITY §2 (m=19456 KiB, t=2, p=1). */
export const ARGON_OPTS = { memoryCost: 19456, timeCost: 2, parallelism: 1, algorithm: 2 } as const;

let dummy: Promise<string> | null = null;
const dummyHash = () => (dummy ??= hash('not-the-password-' + Math.random(), ARGON_OPTS));

function sameText(a: string, b: string) {
  const ab = Buffer.from(a.trim().toLowerCase());
  const bb = Buffer.from(b.trim().toLowerCase());
  // Compare equal-length buffers so timing doesn't reveal the length match either.
  const len = Math.max(ab.length, bb.length, 1);
  const pa = Buffer.alloc(len);
  const pb = Buffer.alloc(len);
  ab.copy(pa);
  bb.copy(pb);
  return timingSafeEqual(pa, pb) && ab.length === bb.length;
}

/** Always runs one argon2 verify so a wrong email and a wrong password take the same time. */
export async function checkAdminCredentials(email: string, password: string): Promise<boolean> {
  const e = env();
  if (!e.ADMIN_EMAIL || !e.ADMIN_PASSWORD_HASH) {
    await verify(await dummyHash(), password).catch(() => false);
    return false;
  }
  const emailOk = sameText(email, e.ADMIN_EMAIL);
  const target = emailOk ? e.ADMIN_PASSWORD_HASH : await dummyHash();
  const passOk = await verify(target, password).catch(() => false);
  return emailOk && passOk;
}
