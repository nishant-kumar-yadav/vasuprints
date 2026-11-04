import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import Busboy from 'busboy';
import { env } from '@/config/env';
import { connectDb } from '@/lib/db/connect';
import { apiError, json } from '@/lib/http';
import { clientIp, hashIp } from '@/lib/security/ip';
import { originAllowed } from '@/lib/security/origin';
import { limits } from '@/lib/security/rate-limit';
import { ALLOWED_UPLOAD_TYPES, extOf, isAllowedExt, sanitizeFileName, signatureMatches } from '@/lib/uploads/sniff';
import { FileTooLargeError, fileStore } from '@/lib/uploads/store';
import { UploadModel } from '@/models/lead';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX = 100 * 1024 * 1024;

type Parsed =
  | { kind: 'file'; name: string; stream: Readable }
  | { kind: 'error'; status: number; code: string; message: string };

/** Resolves as soon as the single file part starts streaming. */
function firstFile(req: Request): Promise<Parsed> {
  return new Promise((resolve) => {
    let bb: Busboy.Busboy;
    try {
      bb = Busboy({ headers: Object.fromEntries(req.headers), limits: { files: 1, fields: 0, parts: 1, fileSize: MAX } });
    } catch {
      resolve({ kind: 'error', status: 400, code: 'NO_FILE', message: 'Send the file as multipart/form-data.' });
      return;
    }
    let settled = false;
    const done = (p: Parsed) => {
      if (!settled) {
        settled = true;
        resolve(p);
      }
    };
    bb.on('file', (field, stream, info) => {
      if (field !== 'file') {
        stream.resume();
        return done({ kind: 'error', status: 400, code: 'NO_FILE', message: 'Expected a part named "file".' });
      }
      stream.on('limit', () => stream.destroy(new FileTooLargeError('File too large')));
      done({ kind: 'file', name: info.filename ?? '', stream });
    });
    bb.on('field', () => done({ kind: 'error', status: 400, code: 'TOO_MANY_PARTS', message: 'Send one file only.' }));
    bb.on('filesLimit', () => done({ kind: 'error', status: 400, code: 'TOO_MANY_PARTS', message: 'Send one file only.' }));
    bb.on('error', () => done({ kind: 'error', status: 400, code: 'NO_FILE', message: 'The upload could not be read.' }));
    bb.on('close', () => done({ kind: 'error', status: 400, code: 'NO_FILE', message: 'No file was sent.' }));
    if (!req.body) return done({ kind: 'error', status: 400, code: 'NO_FILE', message: 'No file was sent.' });
    Readable.fromWeb(req.body as import('node:stream/web').ReadableStream).pipe(bb);
  });
}

const inFlight = new Map<string, number>();

export async function POST(req: Request) {
  if (env().QUOTE_BACKEND !== 'on') return apiError(404, 'NOT_FOUND', 'Not found');
  if (!originAllowed(req.headers)) return apiError(403, 'ORIGIN_MISMATCH', 'Request origin not allowed.');
  const ip = clientIp(req.headers);
  const ipHash = hashIp(ip);
  if ((inFlight.get(ipHash) ?? 0) >= 2) return apiError(429, 'RATE_LIMITED', 'Please wait for your other uploads to finish.', { retryAfter: 5 });
  const rl = limits.uploadsHourly.hit(ipHash);
  if (!rl.ok) return apiError(429, 'RATE_LIMITED', "You've uploaded several files recently. Please try again later or send them on WhatsApp.", { retryAfter: rl.retryAfter });
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > MAX + 1024 * 1024) return apiError(413, 'FILE_TOO_LARGE', 'The limit is 100 MB per file.');

  const store = fileStore();
  if ((await store.diskUsage()) > 0.95) return apiError(503, 'STORAGE_UNAVAILABLE', 'Uploads are unavailable right now. Please send files on WhatsApp or email.');

  inFlight.set(ipHash, (inFlight.get(ipHash) ?? 0) + 1);
  try {
    const parsed = await firstFile(req);
    if (parsed.kind === 'error') return apiError(parsed.status, parsed.code, parsed.message);
    const name = sanitizeFileName(parsed.name);
    const ext = extOf(name);
    if (!isAllowedExt(ext)) {
      parsed.stream.resume();
      return apiError(415, 'UNSUPPORTED_TYPE', `${name} can't be uploaded. Use CDR, AI, EPS, PDF, PSD, SVG, PNG, JPG, TIFF or ZIP.`);
    }
    const id = randomUUID();
    let written;
    try {
      written = await store.writeTemp(id, ext, parsed.stream, MAX);
    } catch (err) {
      if (err instanceof FileTooLargeError) return apiError(413, 'FILE_TOO_LARGE', `${name} is larger than 100 MB.`);
      console.error('[uploads] write failed', (err as Error).message);
      return apiError(503, 'STORAGE_UNAVAILABLE', 'Upload failed. Please try again.');
    }
    if (written.bytes === 0 || !signatureMatches(ext, written.head)) {
      await store.remove(written.relPath);
      console.warn(`[uploads] signature mismatch id=${id} ext=${ext}`);
      return apiError(415, 'UNSUPPORTED_TYPE', `${name} doesn't look like a valid .${ext} file.`);
    }
    try {
      await connectDb();
      await UploadModel.create({
        _id: id,
        originalName: name,
        ext,
        detectedMime: ALLOWED_UPLOAD_TYPES[ext],
        bytes: written.bytes,
        sha256: written.sha256,
        storagePath: written.relPath,
        status: 'pending',
        leadId: null,
        ipHash,
      });
    } catch (err) {
      await store.remove(written.relPath);
      console.error('[uploads] db failed', (err as Error).message);
      return apiError(503, 'STORAGE_UNAVAILABLE', 'Upload failed. Please try again.');
    }
    return json({ uploadId: id, name, bytes: written.bytes, ext }, 201);
  } finally {
    const n = (inFlight.get(ipHash) ?? 1) - 1;
    if (n <= 0) inFlight.delete(ipHash);
    else inFlight.set(ipHash, n);
  }
}
