'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { Expand, X } from 'lucide-react';
import { Art } from '@/components/site/art/Art';
import { cn } from '@/lib/cn';

/**
 * Product gallery (UI-UX §4.3). Desktop: main image + thumbnail buttons (arrow keys move),
 * click main image for a lightbox. Mobile: edge-to-edge scroll-snap with a counter chip.
 */
export function Gallery({ artKey, alts }: { artKey: string; alts: string[] }) {
  const [active, setActive] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = alts.length;

  const onThumbKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + n) % n;
    setActive(next);
    thumbs.current[next]?.focus();
  };

  return (
    <div>
      {/* Mobile swipe gallery */}
      <div className="relative -mx-4 sm:-mx-6 lg:hidden">
        <ul
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setMobileIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          aria-label="Product images"
        >
          {alts.map((alt, i) => (
            <li key={i} className="aspect-[4/3] w-full shrink-0 snap-center bg-surface-2">
              <Art k={artKey} view={i} label={alt} />
            </li>
          ))}
        </ul>
        <span className="absolute bottom-3 right-4 rounded-full bg-navy-900/80 px-2.5 py-1 text-xs font-semibold tabular-nums text-white" aria-live="polite">
          {mobileIndex + 1} / {n}
        </span>
      </div>

      {/* Desktop gallery */}
      <div className="hidden lg:block">
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border"
          aria-label={`Enlarge image: ${alts[active] ?? ''}`}
        >
          <Art k={artKey} view={active} label={alts[active]} />
          <span className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-navy-800 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Expand className="size-4" aria-hidden />
          </span>
        </button>
        <div className="mt-4 grid grid-cols-4 gap-3" role="group" aria-label="Choose image">
          {alts.map((alt, i) => (
            <button
              key={i}
              ref={(el) => {
                thumbs.current[i] = el;
              }}
              type="button"
              aria-pressed={active === i}
              aria-label={`Show image ${i + 1}: ${alt}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onThumbKey(e, i)}
              className={cn(
                'aspect-[4/3] overflow-hidden rounded-md bg-surface-2 ring-1 transition-[box-shadow,opacity] duration-150',
                active === i ? 'ring-2 ring-teal-500' : 'opacity-75 ring-border hover:opacity-100',
              )}
            >
              <Art k={artKey} view={i} />
            </button>
          ))}
        </div>
      </div>

      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto w-[min(92vw,1100px)] overflow-hidden rounded-xl bg-white p-0 shadow-lg backdrop:bg-navy-950/70"
        aria-label="Image viewer"
      >
        <div className="relative aspect-[4/3] bg-surface-2">
          <Art k={artKey} view={active} label={alts[active]} />
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-white text-navy-900 shadow-md"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <p className="px-6 py-4 text-sm text-text-secondary">{alts[active]}</p>
      </dialog>
    </div>
  );
}
