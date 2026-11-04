import 'server-only';
import { business } from '@/config/business';
import { env } from '@/config/env';
import { absoluteUrl } from '@/lib/seo';
import { indexable } from '@/lib/seo-env';

/**
 * IndexNow tells Bing, Yandex, Seznam and Naver that a URL changed, so edits made in the admin are recrawled
 * within minutes instead of days. (Google does not use IndexNow; it finds changes through the sitemap's lastmod.)
 * No-op unless INDEXNOW_KEY is set and this is the live, indexable site.
 */
export async function pingIndexNow(paths: string[]): Promise<void> {
  const e = env();
  if (!e.INDEXNOW_KEY || !paths.length || !indexable() || e.LOCAL_PREVIEW === 'true') return;
  if (new URL(e.SITE_URL).hostname !== new URL(business.siteUrl).hostname) return;
  const body = {
    host: new URL(business.siteUrl).hostname,
    key: e.INDEXNOW_KEY,
    keyLocation: absoluteUrl('/indexnow.txt'),
    urlList: [...new Set(paths)].map((p) => absoluteUrl(p)),
  };
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok && res.status !== 202) console.warn(`[indexnow] ${res.status} for ${body.urlList.length} URLs`);
  } catch (err) {
    console.warn('[indexnow] ping failed:', (err as Error).message);
  }
}
