import Link from 'next/link';
import { cn } from '@/lib/cn';

export function LogoMark({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('size-9 shrink-0', className)} aria-hidden focusable="false">
      <path d="M9 0 H28 L40 12 V31 Q40 40 31 40 H9 Q0 40 0 31 V9 Q0 0 9 0 Z" className={inverse ? 'fill-white/10' : 'fill-navy-800'} />
      <path d="M28 0 L40 12 H31 Q28 12 28 9 Z" className="fill-teal-500" />
      <path d="M11 12 L20 29 L29 12" fill="none" stroke="white" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ inverse, className }: { inverse?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn('inline-flex shrink-0 items-center gap-2 rounded-md min-[400px]:gap-2.5', className)} aria-label="VasuPrint home">
      <LogoMark inverse={inverse} className="max-[399px]:size-8" />
      <span className="font-display text-[1.15rem] font-extrabold min-[360px]:text-[1.3rem] min-[400px]:text-[1.5rem] leading-none tracking-[-0.03em]" aria-hidden>
        <span className={inverse ? 'text-white' : 'text-navy-800'}>Vasu</span>
        <span className={inverse ? 'text-teal-300' : 'text-teal-600'}>Print</span>
      </span>
    </Link>
  );
}
