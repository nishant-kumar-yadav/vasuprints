'use client';

import { usePathname } from 'next/navigation';
import { WhatsAppIcon } from './icons/WhatsApp';

export function FloatingWhatsApp({ href }: { href: string }) {
  const pathname = usePathname();
  if (pathname.startsWith('/get-a-quote')) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-6 right-6 z-30 hidden size-14 items-center justify-center rounded-full border border-border bg-white shadow-md transition-transform duration-150 hover:-translate-y-0.5 lg:inline-flex"
    >
      <WhatsAppIcon className="size-7" />
      <span
        role="tooltip"
        className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-navy-900 px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        Chat on WhatsApp
      </span>
    </a>
  );
}
