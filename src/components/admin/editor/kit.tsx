'use client';

import { useRef, useState, type ReactNode } from 'react';
import { AlertCircle, ArrowDown, ArrowUp, CircleAlert, CircleCheck, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { ICON_NAMES, DynamicIcon } from '@/components/site/DynamicIcon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { seoChecks, seoScore, type SeoInput } from '@/lib/seo-score';

export type Errors = Record<string, string>;

const control =
  'w-full rounded-md border bg-white px-3 text-[15px] text-navy-900 transition-[border-color,box-shadow] placeholder:text-text-muted focus:outline-none focus:ring-[3px]';
const tone = (err?: string) => (err ? 'border-danger focus:ring-danger/15' : 'border-border hover:border-navy-200 focus:border-teal-500 focus:ring-teal-100');

export function Section({ id, title, description, children }: { id: string; title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-border bg-white">
      <header className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="font-display text-lg font-bold text-navy-900">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-text-secondary">{description}</p> : null}
      </header>
      <div className="flex flex-col gap-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Counter({ n, max, soft }: { n: number; max?: number; soft?: number }) {
  if (!max) return null;
  const limit = soft ?? max;
  return <span className={cn('text-xs tabular-nums', n > limit ? 'font-semibold text-warning' : 'text-text-muted')}>{n}/{limit}</span>;
}

export function Field({
  id,
  label,
  value,
  onChange,
  error,
  help,
  max,
  soft,
  multiline,
  rows = 3,
  placeholder,
  prefix,
  optional,
  disabled,
  trailing,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  help?: ReactNode;
  max?: number;
  soft?: number;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  prefix?: string;
  optional?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
}) {
  const desc = error ? `${id}-err` : help ? `${id}-help` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-navy-900">
          {label}
          {optional ? <span className="font-normal text-text-muted"> (optional)</span> : null}
        </label>
        <Counter n={value.length} max={max} soft={soft} />
      </div>
      <div className="relative flex">
        {prefix ? (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-border bg-surface px-3 text-sm text-text-secondary">{prefix}</span>
        ) : null}
        {multiline ? (
          <textarea
            id={id}
            value={value}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={desc}
            onChange={(e) => onChange(e.target.value)}
            className={cn(control, tone(error), 'resize-y py-2.5 leading-relaxed max-sm:min-h-24 max-sm:max-h-[70vh] max-sm:field-sizing-content')}
          />
        ) : (
          <input
            id={id}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={desc}
            onChange={(e) => onChange(e.target.value)}
            className={cn(control, tone(error), 'h-11', prefix && 'rounded-l-none', trailing && 'pr-11', disabled && 'bg-surface text-text-secondary')}
          />
        )}
        {trailing ? <span className="absolute inset-y-0 right-1 flex items-center">{trailing}</span> : null}
      </div>
      {error ? (
        <p id={`${id}-err`} className="flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : help ? (
        <p id={`${id}-help`} className="text-sm text-text-secondary">
          {help}
        </p>
      ) : null}
    </div>
  );
}

export function Select({ id, label, value, onChange, options, error }: { id: string; label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-navy-900">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} className={cn(control, tone(error), 'h-11')}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

export function Toggle({ id, label, checked, onChange, help }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void; help?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-10 rounded-full bg-navy-200 transition-colors peer-checked:bg-teal-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-500" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
      </span>
      <span>
        <span className="block text-[15px] font-medium text-navy-900">{label}</span>
        {help ? <span className="block text-sm text-text-secondary">{help}</span> : null}
      </span>
    </label>
  );
}

/** Generic repeatable list with add / remove / move. */
export function Repeat<T>({
  items,
  onChange,
  make,
  render,
  addLabel,
  max,
  error,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  make: () => T;
  render: (item: T, set: (v: T) => void, i: number) => ReactNode;
  addLabel: string;
  max: number;
  error?: string;
}) {
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    const j = i + d;
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="flex flex-wrap gap-2 rounded-lg border border-border bg-surface/60 p-3 sm:flex-nowrap sm:p-4">
          <span className="mt-2 inline-flex size-6 shrink-0 sm:mt-1 items-center justify-center rounded-full bg-white text-xs font-bold tabular-nums text-navy-500 ring-1 ring-border">{i + 1}</span>
          <div className="order-last min-w-0 basis-full sm:order-none sm:basis-auto sm:flex-1">{render(item, (v) => onChange(items.map((x, k) => (k === i ? v : x))), i)}</div>
          <div className="ml-auto flex shrink-0 gap-1 sm:ml-0 sm:flex-col">
            <IconBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp className="size-4" aria-hidden />
            </IconBtn>
            <IconBtn label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
              <ArrowDown className="size-4" aria-hidden />
            </IconBtn>
            <IconBtn label="Remove" onClick={() => onChange(items.filter((_, k) => k !== i))} danger>
              <Trash2 className="size-4" aria-hidden />
            </IconBtn>
          </div>
        </div>
      ))}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {items.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...items, make()])}
          className="inline-flex h-10 items-center gap-2 self-start rounded-md border border-dashed border-navy-200 px-3.5 text-sm font-medium text-navy-700 hover:border-teal-500 hover:bg-teal-50"
        >
          <Plus className="size-4" aria-hidden /> {addLabel}
        </button>
      ) : (
        <p className="text-sm text-text-muted">Maximum of {max} reached.</p>
      )}
    </div>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-md text-navy-400 transition-colors disabled:opacity-30 sm:size-8',
        danger ? 'hover:bg-danger/10 hover:text-danger' : 'hover:bg-white hover:text-navy-900',
      )}
    >
      {children}
    </button>
  );
}

/** Chips with free-text entry (Enter or comma adds). */
export function TagInput({ id, label, values, onChange, max, placeholder, suggestions, error, help }: { id: string; label: string; values: string[]; onChange: (v: string[]) => void; max: number; placeholder?: string; suggestions?: string[]; error?: string; help?: ReactNode }) {
  const [draft, setDraft] = useState('');
  const add = (raw: string) => {
    const v = raw.trim().replace(/,$/, '').trim();
    if (!v || values.includes(v) || values.length >= max) return;
    onChange([...values, v.slice(0, 80)]);
    setDraft('');
  };
  const listId = suggestions ? `${id}-list` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-navy-900">
          {label}
        </label>
        <span className="text-xs tabular-nums text-text-muted">
          {values.length}/{max}
        </span>
      </div>
      <div className={cn('flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border bg-white p-1.5 focus-within:ring-[3px]', tone(error))}>
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-md bg-navy-50 py-1 pl-2.5 pr-1 text-sm text-navy-800">
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))} className="inline-flex size-5 items-center justify-center rounded text-navy-400 hover:bg-white hover:text-navy-900">
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          list={listId}
          value={draft}
          disabled={values.length >= max}
          placeholder={values.length ? '' : placeholder}
          onChange={(e) => {
            const v = e.target.value;
            if (v.endsWith(',')) add(v);
            else setDraft(v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && values.length) onChange(values.slice(0, -1));
          }}
          onBlur={() => add(draft)}
          className="h-8 min-w-32 flex-1 border-0 bg-transparent px-1.5 text-[15px] focus:outline-none"
        />
        {suggestions ? (
          <datalist id={listId}>
            {suggestions.filter((s) => !values.includes(s)).map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        ) : null}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : help ? <p className="text-sm text-text-secondary">{help}</p> : null}
    </div>
  );
}

export function IconPicker({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-navy-900">
        Icon
      </label>
      <div className="flex items-center gap-2">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
          <DynamicIcon name={value} className="size-5" />
        </span>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(control, tone(), 'h-11')}>
          {ICON_NAMES.map((n) => (
            <option key={n} value={n}>
              {n.replace(/([a-z])([A-Z])/g, '$1 $2')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export interface EditorImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** Upload, order (first = cover) and describe images. */
export function ImageManager({ images, onChange, max, folder, errors, errorPrefix }: { images: EditorImage[]; onChange: (v: EditorImage[]) => void; max: number; folder: 'products' | 'categories'; errors: Errors; errorPrefix: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files) return;
    setProblem(null);
    const list = Array.from(files).slice(0, max - images.length);
    setBusy(list.length);
    const added: EditorImage[] = [];
    for (const f of list) {
      const fd = new FormData();
      fd.set('image', f);
      try {
        const res = await fetch(`/api/admin/media?folder=${folder}`, { method: 'POST', body: fd });
        const body = (await res.json()) as { src?: string; width?: number; height?: number; error?: { message: string } };
        if (res.ok && body.src) added.push({ src: body.src, width: body.width!, height: body.height!, alt: '' });
        else setProblem(`${f.name}: ${body.error?.message ?? 'Upload failed.'}`);
      } catch {
        setProblem(`${f.name}: Upload failed. Check your connection.`);
      }
      setBusy((b) => b - 1);
    }
    if (added.length) onChange([...images, ...added]);
    if (input.current) input.current.value = '';
  };

  const move = (i: number, d: -1 | 1) => {
    const next = [...images];
    [next[i], next[i + d]] = [next[i + d]!, next[i]!];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {images.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {images.map((img, i) => (
            <li key={img.src} className="overflow-hidden rounded-lg border border-border bg-white">
              <div className="relative aspect-[4/3] bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt="" className="absolute inset-0 size-full object-cover" />
                {i === 0 ? <span className="absolute left-2 top-2 rounded-full bg-navy-900/85 px-2 py-0.5 text-xs font-semibold text-white">Cover</span> : null}
                <span className="absolute right-2 top-2 flex gap-1 rounded-md bg-white/90 p-0.5 shadow-sm">
                  <IconBtn label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="size-4 -rotate-90" aria-hidden />
                  </IconBtn>
                  <IconBtn label="Move later" disabled={i === images.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown className="size-4 -rotate-90" aria-hidden />
                  </IconBtn>
                  <IconBtn label="Remove image" danger onClick={() => onChange(images.filter((_, k) => k !== i))}>
                    <Trash2 className="size-4" aria-hidden />
                  </IconBtn>
                </span>
              </div>
              <div className="p-3">
                <Field
                  id={`${errorPrefix}-${i}-alt`}
                  label="Alt text"
                  value={img.alt}
                  max={160}
                  placeholder="What the photo shows, e.g. matte black mono carton with gold foil logo"
                  error={errors[`${errorPrefix}.${i}.alt`]}
                  onChange={(alt) => onChange(images.map((x, k) => (k === i ? { ...x, alt } : x)))}
                />
                <p className="mt-1.5 text-xs text-text-muted">
                  {img.width} × {img.height}px
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {images.length < max ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-navy-200 px-6 py-8 text-center hover:border-teal-500 hover:bg-teal-50 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-teal-500">
          {busy > 0 ? <Loader2 className="size-7 animate-spin text-teal-600" aria-hidden /> : <ImagePlus className="size-7 text-teal-600" strokeWidth={1.5} aria-hidden />}
          <span className="text-[15px] font-medium text-navy-900">{busy > 0 ? `Uploading ${busy}…` : 'Add photos'}</span>
          <span className="text-sm text-text-muted">JPEG, PNG, WebP or AVIF · up to 8 MB · at least 1600 px wide looks best</span>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={max > 1} className="sr-only" onChange={(e) => void upload(e.target.files)} />
        </label>
      ) : null}
      {problem ? (
        <p role="alert" className="flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {problem}
        </p>
      ) : null}
    </div>
  );
}

/** Google-style snippet preview. */
export function SeoPreview({ title, description, path }: { title: string; description: string; path: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-xs text-text-muted">Search preview</p>
      <p className="mt-2 truncate text-sm text-[#202124]">vasuprint.com › {path.replace(/^\//, '') || ''}</p>
      <p className="truncate text-lg leading-snug text-[#1a0dab]">{title || 'Page title'}</p>
      <p className="line-clamp-2 text-sm text-[#4d5156]">{description || 'Add a description that tells buyers what this page offers.'}</p>
    </div>
  );
}

/** Lowercase-hyphen slug from a name. */
export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Live on-page SEO checklist under the search preview. */
export function SeoChecklist({ input }: { input: SeoInput }) {
  const checks = seoChecks(input);
  const score = seoScore(checks);
  const tone = score >= 85 ? 'text-[#166534] bg-[#DCFCE7]' : score >= 60 ? 'text-[#92400E] bg-[#FEF3C7]' : 'text-[#991B1B] bg-[#FEE2E2]';
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-900">SEO checklist</p>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums', tone)}>{score}/100</span>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2.5 text-sm">
            {c.ok ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-[#166534]" aria-label="Done" />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#B45309]" aria-label="To improve" />
            )}
            <span>
              <span className="text-navy-900">{c.label}</span>
              {!c.ok && c.hint ? <span className="block text-text-secondary">{c.hint}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Phones and tablets: the publishing panel sits at the very end of a long form, so unsaved changes get a save bar pinned to the bottom. */
export function MobileSaveBar({ dirty, pending, draft, onSave }: { dirty: boolean; pending: boolean; draft: boolean; onSave: () => void }) {
  if (!dirty) return null;
  return (
    <>
      <div className="h-20 xl:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgb(0_0_0/0.06)] backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <span className="text-sm font-medium text-warning">Unsaved changes</span>
          <Button onClick={onSave} loading={pending} size="sm" className="h-11 px-5">
            {draft ? 'Save draft' : 'Save changes'}
          </Button>
        </div>
      </div>
    </>
  );
}
