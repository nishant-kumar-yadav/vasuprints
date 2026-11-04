import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '@/config/env';

/** Signed "form rendered at" token used for the minimum fill-time bot check (SECURITY §6.3). */
function key() {
  return env().IP_HASH_SALT ?? 'dev-only-salt';
}

export function issueFormToken(now = Date.now()): string {
  const ts = String(now);
  const sig = createHmac('sha256', key()).update(ts).digest('base64url');
  return `${ts}.${sig}`;
}

/** Age of the token in ms, or null when missing/forged/expired (> 1 day). */
export function formTokenAge(token: string | undefined, now = Date.now()): number | null {
  if (!token) return null;
  const [ts, sig] = token.split('.');
  if (!ts || !sig || !/^\d+$/.test(ts)) return null;
  const expected = createHmac('sha256', key()).update(ts).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const age = now - Number(ts);
  if (age < 0 || age > 24 * 60 * 60 * 1000) return null;
  return age;
}
