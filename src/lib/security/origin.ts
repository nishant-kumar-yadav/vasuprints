import 'server-only';
import { env } from '@/config/env';

/** State-changing requests must come from our own pages (API.md conventions). */
export function originAllowed(headers: Headers): boolean {
  const origin = headers.get('origin');
  if (!origin) return false;
  const allowed = new Set([new URL(env().SITE_URL).origin]);
  if (env().NODE_ENV !== 'production') {
    allowed.add('http://localhost:3000');
    allowed.add('http://127.0.0.1:3000');
    const host = headers.get('host');
    if (host) allowed.add(`http://${host}`);
  }
  return allowed.has(origin);
}
