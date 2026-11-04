import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { indexable } from '@/lib/seo-env';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  if (!indexable()) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/get-a-quote/thank-you'] }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
