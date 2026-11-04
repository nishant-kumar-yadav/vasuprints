'use client';

import { useEffect, useState } from 'react';
import { LinkButton } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

/** Desktop sticky section nav for product pages; highlights the section in view. */
export function SubNav({ sections, quoteHref }: { sections: { id: string; label: string }[]; quoteHref: string }) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const hero = document.querySelector('[data-hero]');
    const ioHero = new IntersectionObserver(([e]) => setVisible(!e?.isIntersecting), { rootMargin: '-64px 0px 0px 0px' });
    if (hero) ioHero.observe(hero);
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: '-140px 0px -55% 0px' },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => {
      ioHero.disconnect();
      io.disconnect();
    };
  }, [sections]);

  return (
    <div
      className={cn(
        'sticky top-16 z-30 hidden border-b border-border bg-white/95 backdrop-blur-md transition-[opacity,transform] duration-220 lg:block',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
      )}
      inert={!visible}
    >
      <div className="container-site flex h-14 items-center justify-between gap-6">
        <nav aria-label="On this page">
          <ul className="flex items-center gap-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={cn(
                    'relative inline-flex h-14 items-center px-3 text-sm font-medium transition-colors',
                    active === s.id ? 'text-navy-900' : 'text-text-secondary hover:text-navy-900',
                  )}
                  aria-current={active === s.id ? 'location' : undefined}
                >
                  {s.label}
                  {active === s.id ? <span className="absolute inset-x-3 bottom-0 h-0.5 bg-teal-500" aria-hidden /> : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <LinkButton href={quoteHref} size="sm" variant="secondary" arrow>
          Get a Quote
        </LinkButton>
      </div>
    </div>
  );
}
