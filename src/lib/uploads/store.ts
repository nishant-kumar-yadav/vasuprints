import 'server-only';
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rename, rm, stat, statfs } from 'node:fs/promises';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { env } from '@/config/env';

/** Swappable storage for artwork (ARCHITECTURE §7). Files live outside public/ and are never served directly. */
export interface FileStore {
  writeTemp(id: string, ext: string, stream: Readable, maxBytes: number): Promise<{ relPath: string; bytes: number; sha256: string; head: Buffer }>;
  promote(relPath: string, id: string, ext: string, leadReference: string): Promise<string>;
  read(relPath: string): Readable;
  size(relPath: string): Promise<number>;
  remove(relPath: string): Promise<void>;
  diskUsage(): Promise<number>;
}

export class FileTooLargeError extends Error {}

export class LocalFileStore implements FileStore {
  constructor(private readonly root: string) {}

  private abs(rel: string) {
    const p = path.resolve(/*turbopackIgnore: true*/ this.root, rel);
    if (!p.startsWith(path.resolve(this.root) + path.sep)) throw new Error('Path escapes upload root');
    return p;
  }

  async writeTemp(id: string, ext: string, stream: Readable, maxBytes: number) {
    const rel = path.join('tmp', `${id}.${ext}`);
    const dest = this.abs(rel);
    await mkdir(path.dirname(dest), { recursive: true, mode: 0o700 });
    const hash = createHash('sha256');
    let bytes = 0;
    const headParts: Buffer[] = [];
    let headLen = 0;
    const meter = new Transform({
      transform(chunk: Buffer, _enc, cb) {
        bytes += chunk.length;
        if (bytes > maxBytes) return cb(new FileTooLargeError('File too large'));
        if (headLen < 4096) {
          headParts.push(chunk.subarray(0, 4096 - headLen));
          headLen += Math.min(chunk.length, 4096 - headLen);
        }
        hash.update(chunk);
        cb(null, chunk);
      },
    });
    try {
      await pipeline(stream, meter, createWriteStream(dest, { mode: 0o600 }));
    } catch (err) {
      await rm(dest, { force: true });
      throw err;
    }
    return { relPath: rel, bytes, sha256: hash.digest('hex'), head: Buffer.concat(headParts) };
  }

  async promote(relPath: string, id: string, ext: string, leadReference: string) {
    const rel = path.join('leads', leadReference, `${id}.${ext}`);
    const dest = this.abs(rel);
    await mkdir(path.dirname(dest), { recursive: true, mode: 0o700 });
    await rename(this.abs(relPath), dest);
    return rel;
  }

  read(relPath: string) {
    return createReadStream(this.abs(relPath));
  }

  async size(relPath: string) {
    return (await stat(this.abs(relPath))).size;
  }

  async remove(relPath: string) {
    await rm(this.abs(relPath), { force: true });
  }

  async diskUsage() {
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    const s = await statfs(this.root);
    return s.blocks ? 1 - s.bavail / s.blocks : 0;
  }
}

let store: FileStore | null = null;
export function fileStore(): FileStore {
  return (store ??= new LocalFileStore(path.resolve(/*turbopackIgnore: true*/ env().UPLOAD_DIR)));
}
