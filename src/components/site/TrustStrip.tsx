import { Check } from 'lucide-react';
import { trustStrip } from '@/content/pages/global';
import { cn } from '@/lib/cn';

export function TrustStrip({ className }: { className?: string }) {
  return (
    <ul className={cn('grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-8', className)}>
      {trustStrip.map((t) => (
        <li key={t} className="flex items-center gap-2 text-[15px] font-medium text-navy-800">
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}
