import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '@/config/env';
import { imageInfo } from './image-info';

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export class MediaError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export interface StoredImage {
  src: string;
  width: number;
  height: number;
}

const mime = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' } as const;

/**
 * Product/category images. Cloudinary when configured (API §2.3); otherwise files are written to
 * MEDIA_DIR and served by the /media route — fine for a single VPS.
 */
export async function storeImage(buf: Buffer, folder: 'products' | 'categories'): Promise<StoredImage> {
  if (buf.length > MAX_IMAGE_BYTES) throw new MediaError(413, 'FILE_TOO_LARGE', 'Images must be 8 MB or smaller.');
  const info = imageInfo(buf);
  if (!info || !info.width || !info.height) throw new MediaError(415, 'UNSUPPORTED_TYPE', 'Use a JPEG, PNG, WebP or AVIF image.');
  const e = env();
  if (e.CLOUDINARY_CLOUD_NAME && e.CLOUDINARY_API_KEY && e.CLOUDINARY_API_SECRET) {
    return uploadToCloudinary(buf, info.kind, folder, e.CLOUDINARY_CLOUD_NAME, e.CLOUDINARY_API_KEY, e.CLOUDINARY_API_SECRET);
  }
  const name = `${randomUUID()}.${info.kind}`;
  const dir = path.resolve(/*turbopackIgnore: true*/ e.MEDIA_DIR, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), buf, { flag: 'wx' });
  return { src: `/media/${folder}/${name}`, width: info.width, height: info.height };
}

async function uploadToCloudinary(buf: Buffer, kind: keyof typeof mime, folder: string, cloud: string, key: string, secret: string): Promise<StoredImage> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string> = {
    folder: `vasuprint/${folder}`,
    timestamp: String(timestamp),
    transformation: 'c_limit,h_2000,w_2000',
  };
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const signature = createHash('sha1').update(toSign + secret).digest('hex');
  const fd = new FormData();
  fd.set('file', new Blob([new Uint8Array(buf)], { type: mime[kind] }));
  for (const [k, v] of Object.entries(params)) fd.set(k, v);
  fd.set('api_key', key);
  fd.set('signature', signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: fd, signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new MediaError(502, 'UPLOAD_FAILED', 'Image hosting rejected the upload. Try again.');
  const j = (await res.json()) as { secure_url: string; width: number; height: number };
  return { src: j.secure_url, width: j.width, height: j.height };
}

export const MEDIA_MIME = mime;
