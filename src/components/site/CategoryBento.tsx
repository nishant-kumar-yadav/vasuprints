import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { categories, productsIn, type Category } from '@/lib/catalog';
import { cn } from '@/lib/cn';
import { Art } from './art/Art';

function ProductChips({ category, inverse }: { category: Category; inverse?: boolean }) {
  const items = productsIn(category.slug);
  const shown = items.slice(0, 3);
  const more = items.length - shown.length;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {shown.map((p) => (
        <li
          key={p.slug}
          className={cn(
            'inline-flex h-7 items-center rounded-sm px-2.5 text-[13px] font-medium',
            inverse ? 'bg-white/15 text-white backdrop-blur-sm' : 'bg-navy-50 text-navy-800',
          )}
        >
          {p.name}
        </li>
      ))}
      {more > 0 ? (
        <li
          className={cn(
            'inline-flex h-7 items-center rounded-sm px-2.5 text-[13px] font-medium',
            inverse ? 'bg-white/15 text-white' : 'bg-navy-50 text-navy-800',
          )}
        >
          +{more}
        </li>
      ) : null}
    </ul>
  );
}

function Arrow({ inverse }: { inverse?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-220 group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
        inverse ? 'bg-white text-navy-900' : 'bg-navy-800 text-white group-hover:bg-teal-500 group-hover:text-navy-900',
      )}
      aria-hidden
    >
      <ArrowUpRight className="size-5" />
    </span>
  );
}

/** Large tile: full-bleed art with navy gradient and white text. */
function FeatureTile({ c, className }: { c: Category; className?: string }) {
  return (
    <Link
      href={`/${c.slug}`}
      className={cn(
        'group relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-lg bg-navy-900 p-6 sm:p-8',
        className,
      )}
    >
      <div className="absolute inset-0 -z-10 transition-transform duration-420 ease-(--ease-out) group-hover:scale-[1.03]">
        <Art k="sbs-boxes" bg="navy" />
      </div>
      <div className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-gradient-to-t from-navy-950/90 via-navy-950/50 to-transparent" aria-hidden />
      <div className="flex items-end justify-between gap-6">
        <div>
          <h3 className="text-h2 text-white">{c.name}</h3>
          <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-white/85">{c.tagline}</p>
          <div className="mt-4">
            <ProductChips category={c} inverse />
          </div>
        </div>
        <Arrow inverse />
      </div>
    </Link>
  );
}

/** Card tile: art on top, text below on white. */
function CardTile({ c, className, wide }: { c: Category; className?: string; wide?: boolean }) {
  return (
    <Link
      href={`/${c.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-border bg-white transition-[transform,box-shadow] duration-220 ease-(--ease-out) hover:-translate-y-0.5 hover:shadow-md',
        wide && 'lg:flex-row-reverse',
        className,
      )}
    >
      <div className={cn('relative aspect-[4/3] overflow-hidden bg-surface-2', wide ? 'lg:aspect-auto lg:min-h-[300px] lg:w-1/2' : 'lg:aspect-[16/9]')}>
        <div className="absolute inset-0 transition-transform duration-420 ease-(--ease-out) group-hover:scale-[1.03]">
          <Art k={c.slug} fit={wide ? 'meet' : 'slice'} />
        </div>
      </div>
      <div className={cn('flex flex-1 flex-col gap-4 p-6', wide && 'lg:justify-center lg:p-10')}>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-h3 text-navy-900">{c.name}</h3>
          <Arrow />
        </div>
        <p className="line-clamp-2 text-[15px] leading-relaxed text-text-secondary">{c.tagline}</p>
        <ProductChips category={c} />
      </div>
    </Link>
  );
}

export function CategoryBento({ className }: { className?: string }) {
  const [boxes, stickers, dtf, uv, tags] = categories;
  if (!boxes || !stickers || !dtf || !uv || !tags) return null;
  return (
    <div className={cn('grid gap-4 sm:gap-6 lg:grid-cols-12', className)}>
      <FeatureTile c={boxes} className="lg:col-span-7 lg:row-span-2 lg:min-h-[640px]" />
      <CardTile c={stickers} className="lg:col-span-5" />
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:col-span-5">
        <CompactTile c={dtf} />
        <CompactTile c={uv} />
      </div>
      <CardTile c={tags} wide className="lg:col-span-12" />
    </div>
  );
}

function CompactTile({ c }: { c: Category }) {
  return (
    <Link
      href={`/${c.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white transition-[transform,box-shadow] duration-220 ease-(--ease-out) hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <div className="absolute inset-0 transition-transform duration-420 ease-(--ease-out) group-hover:scale-[1.03]">
          <Art k={c.slug} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-navy-900">{c.name}</h3>
          <ArrowUpRight className="size-5 text-navy-400 transition-colors group-hover:text-teal-700" aria-hidden />
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">{c.tagline}</p>
      </div>
    </Link>
  );
}
