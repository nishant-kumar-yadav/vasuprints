import { cn } from '@/lib/cn';

/** Printer's crop marks in all four corners of the parent (parent must be relative). */
export function CropMarks({ className, inset = 12, size = 22 }: { className?: string; inset?: number; size?: number }) {
  const corner = (rot: number, pos: string) => (
    <svg
      viewBox="0 0 22 22"
      width={size}
      height={size}
      className={cn('absolute', pos)}
      style={{ transform: `rotate(${rot}deg)`, margin: inset }}
      aria-hidden
    >
      <path d="M0 8 H14 M8 0 V14" stroke="currentColor" strokeWidth={1.25} fill="none" />
    </svg>
  );
  return (
    <div className={cn('pointer-events-none absolute inset-0 text-teal-500', className)} aria-hidden>
      {corner(0, 'left-0 top-0')}
      {corner(90, 'right-0 top-0')}
      {corner(180, 'right-0 bottom-0')}
      {corner(270, 'left-0 bottom-0')}
    </div>
  );
}

export function RegistrationMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-6 text-teal-500', className)} aria-hidden>
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth={1.25} fill="none" />
      <path d="M12 1v22M1 12h22" stroke="currentColor" strokeWidth={1.25} />
    </svg>
  );
}

/** Dashed fold line, horizontal by default. */
export function FoldLine({ className, vertical }: { className?: string; vertical?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        vertical ? 'w-0 border-l-[1.5px]' : 'h-0 border-t-[1.5px]',
        'border-dashed border-teal-500/60',
        className,
      )}
    />
  );
}

/** An unfolded tuck-end box dieline, drawn in teal lines (404 + decorative use). */
export function DielineFrame({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={cn('text-teal-500', className)} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round">
        {/* cut lines */}
        <path d="M40 80 H80 V40 Q80 28 92 28 H148 Q160 28 160 40 V80 H200 L210 70 H250 L260 80 H290 V160 H260 L250 170 H210 L200 160 H160 V200 Q160 212 148 212 H92 Q80 212 80 200 V160 H40 L30 150 V90 Z" />
      </g>
      <g stroke="currentColor" strokeWidth={1.2} strokeDasharray="5 4" opacity={0.8}>
        {/* fold lines */}
        <path d="M80 80 V160 M160 80 V160 M200 80 V160 M80 80 H160 M80 160 H160 M260 80 V160" />
      </g>
      <g stroke="currentColor" strokeWidth={1} opacity={0.6}>
        <path d="M12 14 H24 M18 8 V20 M296 220 H308 M302 214 V226" />
      </g>
    </svg>
  );
}
