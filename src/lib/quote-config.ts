import 'server-only';
import { env } from '@/config/env';

/** Server-decided form mode. Read at build time for static pages, so rebuild after changing flags. */
export function quoteFormConfig() {
  const e = env();
  return {
    backend: e.QUOTE_BACKEND === 'on',
    turnstileSiteKey: e.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null,
  };
}
