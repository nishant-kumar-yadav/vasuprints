'use client';

import { useId, useRef, useState, type DragEvent } from 'react';
import { AlertCircle, FileCheck2, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MAX_FILES, checkArtwork, fileExtension, formatBytes } from '@/lib/quote';

export interface PickedFile {
  id: string;
  name: string;
  size: number;
}

/**
 * v1 artwork picker: files are listed and validated on the device but not uploaded
 * (no backend yet). The hand-off step reminds the buyer to attach them in WhatsApp or email.
 */
export function ArtworkPicker({ files, onChange }: { files: PickedFile[]; onChange: (f: PickedFile[]) => void }) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [rejections, setRejections] = useState<string[]>([]);

  const add = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    const rejected: string[] = [];
    for (const f of Array.from(list)) {
      if (next.length >= MAX_FILES) {
        rejected.push('You can attach up to 3 files. Remove one to add another.');
        break;
      }
      const problem = checkArtwork(f);
      if (problem) rejected.push(problem);
      else next.push({ id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`, name: f.name, size: f.size });
    }
    setRejections(rejected);
    onChange(next);
    if (input.current) input.current.value = '';
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
          Drag files here or <span className="font-semibold text-teal-700 underline underline-offset-4">browse</span>
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
            <li key={f.id} className="flex items-center gap-3 rounded-md border border-border bg-white py-2 pl-3 pr-1">
              <span className="inline-flex h-7 min-w-11 items-center justify-center rounded-sm bg-navy-50 px-1.5 text-xs font-bold uppercase text-navy-800">
                {fileExtension(f.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] text-navy-900">{f.name}</span>
                <span className="flex items-center gap-1.5 text-sm text-text-muted">
                  {formatBytes(f.size)} · <FileCheck2 className="size-3.5 text-success" aria-hidden /> Ready to attach
                </span>
              </span>
              <button
                type="button"
                onClick={() => onChange(files.filter((x) => x.id !== f.id))}
                aria-label={`Remove ${f.name}`}
                className="inline-flex size-11 items-center justify-center rounded-md text-navy-400 hover:bg-navy-50 hover:text-navy-900"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-sm text-text-secondary">
        Files stay on your device for now — after you submit, you&apos;ll send them with your request on WhatsApp or email. No artwork yet? Skip this step.
      </p>
    </div>
  );
}
