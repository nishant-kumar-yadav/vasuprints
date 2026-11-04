import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Section({
  children,
  tone = 'white',
  className,
  id,
  labelledBy,
}: {
  children: ReactNode;
  tone?: 'white' | 'surface' | 'navy';
  className?: string;
  id?: string;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'section-y relative',
        tone === 'surface' && 'bg-surface',
        tone === 'navy' && 'bg-navy-800 text-white',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = 'left',
  inverse,
  id,
  className,
  as: H = 'h2',
  action,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  align?: 'left' | 'center';
  inverse?: boolean;
  id?: string;
  className?: string;
  as?: 'h1' | 'h2';
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8',
        align === 'center' && 'items-center text-center md:flex-col md:items-center',
        className,
      )}
      data-reveal
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        {eyebrow ? (
          <p className={cn('text-eyebrow mb-3', inverse ? 'text-teal-300' : 'text-teal-700')}>{eyebrow}</p>
        ) : null}
        <H id={id} className={cn(H === 'h1' ? 'text-h1' : 'text-h2', inverse ? 'text-white' : 'text-navy-900')}>
          {title}
        </H>
        {lead ? (
          <p
            className={cn(
              'text-lead mt-4 max-w-[60ch]',
              align === 'center' && 'mx-auto',
              inverse ? 'text-navy-100' : 'text-text-secondary',
            )}
          >
            {lead}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
