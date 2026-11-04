import { env } from '@/config/env';
import { dbHealthy } from '@/lib/db/connect';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const e = env();
  const needsDb = e.QUOTE_BACKEND === 'on' || e.CATALOG_SOURCE === 'mongo';
  const db = needsDb ? ((await dbHealthy()) ? 'ok' : 'down') : 'disabled';
  const body = { status: db === 'down' ? 'degraded' : 'ok', db, version: process.env.APP_VERSION ?? 'dev' };
  return Response.json(body, { status: db === 'down' ? 503 : 200, headers: { 'Cache-Control': 'no-store' } });
}
