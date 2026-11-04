import type { Product } from '@/lib/catalog';
import { cn } from '@/lib/cn';

export function SpecTable({ specs, compact, className }: { specs: Product['specs']; compact?: boolean; className?: string }) {
  return (
    <dl className={cn('divide-y divide-border tabular-nums', className)}>
      {specs.map((s) => (
        <div
          key={s.label}
          className={cn('grid gap-1 sm:grid-cols-[40%_1fr] sm:gap-6', compact ? 'py-3' : 'py-4')}
        >
          <dt className="text-sm font-medium text-text-secondary">{s.label}</dt>
          <dd className={cn('text-navy-900', compact ? 'text-sm' : 'text-[15px]')}>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Chip({ children, tone = 'navy' }: { children: React.ReactNode; tone?: 'navy' | 'white' | 'glass' }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-sm px-2.5 text-[13px] font-medium',
        tone === 'navy' && 'bg-navy-50 text-navy-800',
        tone === 'white' && 'border border-border bg-white text-navy-800',
        tone === 'glass' && 'bg-white/15 text-white backdrop-blur-sm',
      )}
    >
      {children}
    </span>
  );
}
