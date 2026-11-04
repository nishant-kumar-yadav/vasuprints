import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** Teach tailwind-merge our custom type-scale utilities so they aren't mistaken for text colours. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'h4', 'lead', 'eyebrow'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Horizontal swipe rail on phones that becomes a grid from `sm` up.
 * Use `rail` on the <ul> (add the sm:/lg: grid columns) and `railItem` on each <li>.
 */
export const rail = 'no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0';
export const railItem = 'w-[82%] max-w-[320px] shrink-0 snap-start sm:w-auto sm:max-w-none';
