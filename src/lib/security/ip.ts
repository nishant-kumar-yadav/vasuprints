import 'server-only';
import { createHash } from 'node:crypto';
import { env } from '@/config/env';

/**
 * Client IP. Only trusts X-Forwarded-For when TRUST_PROXY=true (i.e. behind our own Nginx),
 * and then only its first hop (Nginx overwrites the header). Otherwise a constant, so rate limits still apply.
 */
export function clientIp(headers: Headers): string {
  if (env().TRUST_PROXY === 'true') {
    const xff = headers.get('x-forwarded-for');
    const first = xff?.split(',')[0]?.trim();
    if (first) return first;
    const real = headers.get('x-real-ip');
    if (real) return real.trim();
  }
  // Not behind our proxy: forwarding headers are client-controlled, so never use them (they would let
  // anyone dodge rate limits). Everyone shares one bucket; production runs with TRUST_PROXY=true.
  return 'local';
}

/** sha256(ip + salt): we never store raw IP addresses (DPDP data minimisation). */
export function hashIp(ip: string): string {
  const salt = env().IP_HASH_SALT ?? 'dev-only-salt';
  return createHash('sha256').update(`${ip}|${salt}`).digest('hex');
}
