import { env } from '@/config/env';

/** IndexNow key file (referenced as keyLocation in pings). */
export function GET() {
  const key = env().INDEXNOW_KEY;
  if (!key) return new Response('Not found', { status: 404 });
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
