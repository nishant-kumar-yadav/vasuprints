import { adminApiGuard } from '@/lib/auth/session';
import { apiError, json } from '@/lib/http';
import { MAX_IMAGE_BYTES, MediaError, storeImage } from '@/lib/media/store';
import { originAllowed } from '@/lib/security/origin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const denied = await adminApiGuard(req);
  if (denied) return denied;
  if (!originAllowed(req.headers)) return apiError(403, 'ORIGIN_MISMATCH', 'Request origin not allowed.');
  if (Number(req.headers.get('content-length') ?? 0) > MAX_IMAGE_BYTES + 64 * 1024) return apiError(413, 'FILE_TOO_LARGE', 'Images must be 8 MB or smaller.');
  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get('image');
  } catch {
    return apiError(400, 'NO_FILE', 'Send the image as multipart/form-data.');
  }
  if (!file || typeof file === 'string') return apiError(400, 'NO_FILE', 'No image was sent.');
  const folder = new URL(req.url).searchParams.get('folder') === 'categories' ? 'categories' : 'products';
  try {
    const img = await storeImage(Buffer.from(await file.arrayBuffer()), folder);
    return json(img, 201);
  } catch (e) {
    if (e instanceof MediaError) return apiError(e.status, e.code, e.message);
    console.error('[media] upload failed', (e as Error).message);
    return apiError(503, 'STORAGE_UNAVAILABLE', 'Upload failed. Please try again.');
  }
}
