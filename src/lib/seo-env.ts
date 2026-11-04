import 'server-only';
import { business } from '@/config/business';
import { env } from '@/config/env';

/**
 * Whether this deployment should be indexed. False when SEO_NOINDEX=true, or when SITE_URL is a public
 * host other than the canonical one (a staging copy). Localhost previews stay indexable so audits see real tags.
 */
export function indexable(): boolean {
  const e = env();
  if (e.SEO_NOINDEX === 'true') return false;
  const host = new URL(e.SITE_URL).hostname;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  const canonical = new URL(business.siteUrl).hostname;
  return host === canonical || host === `www.${canonical}`;
}
