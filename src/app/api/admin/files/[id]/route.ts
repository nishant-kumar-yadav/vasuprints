import { Readable } from 'node:stream';
import { adminApiGuard } from '@/lib/auth/session';
import { connectDb } from '@/lib/db/connect';
import { apiError } from '@/lib/http';
import { fileStore } from '@/lib/uploads/store';
import { UploadModel } from '@/models/lead';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Authenticated artwork download. Always an attachment, never rendered in our origin. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await adminApiGuard(req);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return apiError(404, 'NOT_FOUND', 'File not found.');
  await connectDb();
  const up = await UploadModel.findById(id).lean();
  if (!up) return apiError(404, 'NOT_FOUND', 'File not found.');
  const store = fileStore();
  let size: number;
  try {
    size = await store.size(up.storagePath);
  } catch {
    console.error(`[files] missing on disk upload=${id}`);
    return apiError(404, 'NOT_FOUND', 'File is missing from storage.');
  }
  const ascii = up.originalName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  return new Response(Readable.toWeb(store.read(up.storagePath)) as ReadableStream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(size),
      'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(up.originalName)}`,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': 'sandbox',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
