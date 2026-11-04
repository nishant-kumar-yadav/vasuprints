'use client';

import { useEffect, useState } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { WhatsAppIcon } from './icons/WhatsApp';

/** Fixed bottom bar (< 1024 px) that appears once the hero ([data-hero]) scrolls out of view. */
export function MobileActionBar({ quoteHref, whatsappHref }: { quoteHref: string; whatsappHref: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.querySelector('[data-hero]');
    if (!hero || !('IntersectionObserver' in window)) {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setShow(!e?.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  return (
    <>
      {/* Reserve space so the footer is never covered. */}
      <div className="h-[calc(72px+env(safe-area-inset-bottom))] lg:hidden" aria-hidden />
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-4 pt-3 shadow-up backdrop-blur-md transition-transform duration-220 lg:hidden',
          'pb-[max(12px,env(safe-area-inset-bottom))]',
          show ? 'translate-y-0' : 'translate-y-full',
        )}
        inert={!show}
      >
        <div className="mx-auto grid max-w-xl grid-cols-[1fr_2fr] gap-3">
          <LinkButton href={whatsappHref} variant="whatsapp" icon={<WhatsAppIcon />} className="px-3">
            WhatsApp
          </LinkButton>
          <LinkButton href={quoteHref} arrow>
            Get a Quote
          </LinkButton>
        </div>
      </div>
    </>
  );
}
