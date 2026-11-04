'use client';

import { useEffect, useId, useRef, useState, type Dispatch, type DragEvent, type SetStateAction } from 'react';
import { AlertCircle, FileCheck2, Loader2, RotateCcw, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MAX_FILES, checkArtwork, fileExtension, formatBytes } from '@/lib/quote';
import { UploadFailed, discardUpload, uploadFile } from '@/lib/client/upload';

export type FileStatus = 'local' | 'queued' | 'uploading' | 'done' | 'error';

export interface PickedFile {
  id: string;
  name: string;
  size: number;
  status: FileStatus;
  progress: number;
  uploadId?: string;
  error?: string;
  retryable?: boolean;
}

const MAX_PARALLEL = 2;

/**
 * Artwork picker. In `upload` mode files go to the server straight away (with progress, retry and
 * remove) so the final submit is instant. In `local` mode (no backend) they are only listed, and
 * the hand-off step reminds the buyer to attach them in WhatsApp or email.
 */
export function ArtworkPicker({
  files,
  onChange,
  upload,
}: {
  files: PickedFile[];
  onChange: Dispatch<SetStateAction<PickedFile[]>>;
  upload: boolean;
}) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const blobs = useRef(new Map<string, File>());
  const aborts = useRef(new Map<string, AbortController>());
  const [drag, setDrag] = useState(false);
  const [rejections, setRejections] = useState<string[]>([]);

  const patch = (id: string, p: Partial<PickedFile>) => onChange((list) => list.map((f) => (f.id === id ? { ...f, ...p } : f)));

  // Upload queue: start queued files while fewer than MAX_PARALLEL are in flight.
  useEffect(() => {
    if (!upload) return;
    const active = files.filter((f) => f.status === 'uploading').length;
    const next = files.filter((f) => f.status === 'queued').slice(0, Math.max(0, MAX_PARALLEL - active));
    for (const f of next) {
      const blob = blobs.current.get(f.id);
      if (!blob) continue;
      const ac = new AbortController();
      aborts.current.set(f.id, ac);
      patch(f.id, { status: 'uploading', progress: 0, error: undefined });
      let last = 0;
      uploadFile(
        blob,
        (p) => {
          // Throttle re-renders to whole percents.
          const pct = Math.floor(p * 100);
          if (pct !== last) {
            last = pct;
            patch(f.id, { progress: p });
          }
        },
        ac.signal,
      )
        .then((r) => {
          blobs.current.delete(f.id);
          patch(f.id, { status: 'done', progress: 1, uploadId: r.uploadId });
        })
        .catch((err: unknown) => {
          if (ac.signal.aborted) return;
          const e = err instanceof UploadFailed ? err : new UploadFailed('Upload failed. Please try again.', true);
          patch(f.id, { status: 'error', error: e.message, retryable: e.retryable });
        })
        .finally(() => aborts.current.delete(f.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, upload]);

  // Abort in-flight uploads if the form unmounts.
  useEffect(() => {
    const a = aborts.current;
    return () => a.forEach((c) => c.abort());
  }, []);

  const add = (list: FileList | null) => {
    if (!list) return;
    const rejected: string[] = [];
    const added: PickedFile[] = [];
    let count = files.length;
    for (const f of Array.from(list)) {
      if (count >= MAX_FILES) {
        rejected.push('You can attach up to 3 files. Remove one to add another.');
        break;
      }
      const problem = checkArtwork(f);
      if (problem) {
        rejected.push(problem);
        continue;
      }
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      if (upload) blobs.current.set(id, f);
      added.push({ id, name: f.name, size: f.size, status: upload ? 'queued' : 'local', progress: 0 });
      count++;
    }
    setRejections(rejected);
    if (added.length) onChange((prev) => [...prev, ...added]);
    if (input.current) input.current.value = '';
  };

  const remove = (f: PickedFile) => {
    aborts.current.get(f.id)?.abort();
    blobs.current.delete(f.id);
    if (f.uploadId) discardUpload(f.uploadId);
    onChange((list) => list.filter((x) => x.id !== f.id));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    add(e.dataTransfer.files);
  };

  const full = files.length >= MAX_FILES;

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!full) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn(
          'flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed px-6 py-8 text-center transition-colors duration-150',
          drag ? 'border-teal-500 bg-teal-50' : 'border-navy-200 bg-white hover:border-navy-300 hover:bg-surface',
          full && 'pointer-events-none opacity-60',
          'has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-teal-500',
        )}
      >
        <UploadCloud className="size-8 text-teal-500" strokeWidth={1.5} aria-hidden />
        <span className="text-[15px] text-navy-900">
          <span className="pointer-coarse:hidden">Drag files here or </span><span className="font-semibold text-teal-700 underline underline-offset-4"><span className="pointer-coarse:hidden">browse</span><span className="hidden pointer-coarse:inline">Tap to choose files</span></span>
        </span>
        <span className="text-sm text-text-muted">CDR, AI, EPS, PDF, PSD, SVG, PNG, JPG, TIFF or ZIP · up to 3 files · 100 MB each</span>
        <input
          ref={input}
          id={inputId}
          type="file"
          multiple
          disabled={full}
          accept=".cdr,.ai,.eps,.pdf,.psd,.svg,.png,.jpg,.jpeg,.tif,.tiff,.zip"
          onChange={(e) => add(e.target.files)}
          className="sr-only"
        />
      </label>

      {rejections.length ? (
        <ul className="flex flex-col gap-1" aria-live="polite">
          {rejections.map((r) => (
            <li key={r} className="flex items-start gap-1.5 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      ) : null}

      {files.length ? (
        <ul className="flex flex-col gap-2" aria-label="Selected artwork files">
          {files.map((f) => (
            <li
              key={f.id}
              className={cn(
                'relative flex items-center gap-3 overflow-hidden rounded-md border bg-white py-2 pl-3 pr-1',
                f.status === 'error' ? 'border-danger/40' : 'border-border',
              )}
            >
              <span className="inline-flex h-7 min-w-11 items-center justify-center rounded-sm bg-navy-50 px-1.5 text-xs font-bold uppercase text-navy-800">
                {fileExtension(f.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] text-navy-900">{f.name}</span>
                <FileStatusLine f={f} />
              </span>
              {f.status === 'error' && f.retryable ? (
                <button
                  type="button"
                  onClick={() => patch(f.id, { status: 'queued', error: undefined })}
                  aria-label={`Retry ${f.name}`}
                  className="inline-flex size-11 items-center justify-center rounded-md text-navy-500 hover:bg-navy-50 hover:text-navy-900"
                >
                  <RotateCcw className="size-4" aria-hidden />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => remove(f)}
                aria-label={f.status === 'uploading' ? `Cancel upload of ${f.name}` : `Remove ${f.name}`}
                className="inline-flex size-11 items-center justify-center rounded-md text-navy-400 hover:bg-navy-50 hover:text-navy-900"
              >
                <X className="size-4" aria-hidden />
              </button>
              {f.status === 'uploading' ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-teal-500 transition-transform duration-200"
                  style={{ transform: `scaleX(${f.progress})` }}
                  aria-hidden
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-sm text-text-secondary">
        {upload
          ? 'Files are uploaded securely and shared only with our prepress team. No artwork yet? Skip this step.'
          : "Files stay on your device for now — after you submit, you'll send them with your request on WhatsApp or email. No artwork yet? Skip this step."}
      </p>
    </div>
  );
}

function FileStatusLine({ f }: { f: PickedFile }) {
  const size = formatBytes(f.size);
  switch (f.status) {
    case 'queued':
      return <span className="block text-sm text-text-muted">{size} · Waiting…</span>;
    case 'uploading':
      return (
        <span className="flex items-center gap-1.5 text-sm text-text-muted" aria-live="polite">
          <Loader2 className="size-3.5 animate-spin text-teal-600" aria-hidden />
          Uploading {Math.round(f.progress * 100)}% of {size}
        </span>
      );
    case 'done':
      return (
        <span className="flex items-center gap-1.5 text-sm text-text-muted">
          {size} · <FileCheck2 className="size-3.5 text-success" aria-hidden /> Uploaded
        </span>
      );
    case 'error':
      return (
        <span className="flex items-start gap-1.5 text-sm text-danger" role="alert">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {f.error}
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1.5 text-sm text-text-muted">
          {size} · <FileCheck2 className="size-3.5 text-success" aria-hidden /> Ready to attach
        </span>
      );
  }
}
