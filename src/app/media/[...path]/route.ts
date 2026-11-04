import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '@/config/env';
import { MEDIA_MIME } from '@/lib/media/store';

export const runtime = 'nodejs';

/** Public product/category images uploaded in the admin when Cloudinary isn't configured. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  if (parts.length !== 2 || !['products', 'categories'].includes(parts[0]!) || !/^[0-9a-f-]{36}\.(jpg|png|webp|avif)$/.test(parts[1]!)) {
    return new Response('Not found', { status: 404 });
  }
  const ext = parts[1]!.split('.').pop() as keyof typeof MEDIA_MIME;
  try {
    const buf = await readFile(path.join(path.resolve(env().MEDIA_DIR), parts[0]!, parts[1]!));
    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type': MEDIA_MIME[ext],
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
