import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Category, Feature, Product } from '@/lib/catalog/view';
import { cn } from '@/lib/cn';
import { Media } from './Media';
import { DynamicIcon } from './DynamicIcon';

export function IconTile({ name, className, inverse }: { name: string; className?: string; inverse?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-md',
        inverse ? 'bg-white/10 text-teal-300' : 'bg-teal-50 text-teal-700',
        className,
      )}
    >
      <DynamicIcon name={name} className="size-[22px]" />
    </span>
  );
}

export function FeatureCard({ feature, bordered, className }: { feature: Feature; bordered?: boolean; className?: string }) {
  return (
    <div
      className={cn('flex flex-col gap-4', bordered && 'rounded-lg border border-border bg-white p-6', className)}
      data-reveal
    >
      <IconTile name={feature.icon} />
      <div>
        <h3 className="text-h4 text-navy-900">{feature.title}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-text-secondary">{feature.body}</p>
      </div>
    </div>
  );
}

export function ProductCard({ product, categoryName, className }: { product: Product; categoryName?: string; className?: string }) {
  const href = `/${product.slug}`;
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white transition-[transform,box-shadow] duration-220 ease-(--ease-out) hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        <div className="absolute inset-0 transition-transform duration-420 ease-(--ease-out) group-hover:scale-[1.03]">
          <Media image={product.images[0]} k={product.slug} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {categoryName ? <p className="text-eyebrow mb-2 text-teal-700">{categoryName}</p> : null}
        <h3 className="font-display text-lg font-bold leading-snug tracking-[-0.015em] text-navy-900 sm:text-xl">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-text-secondary">{product.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-teal-700">
            View details
            <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
          </span>
          <Link
            href={`/get-a-quote?product=${product.slug}`}
            className="relative z-10 inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-md border border-navy-200 px-3.5 text-sm font-semibold text-navy-800 transition-colors hover:border-navy-800 hover:bg-navy-50"
          >
            Get a Quote
          </Link>
        </div>
      </div>
      {/* Visible focus for the stretched link */}
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-teal-500 group-has-[a:focus-visible]:ring-2" aria-hidden />
    </article>
  );
}

export function CategoryMiniCard({ category, count }: { category: Category; count: number }) {
  return (
    <Link
      href={`/${category.slug}`}
      className="group flex items-center gap-4 rounded-lg border border-border bg-white p-3 pr-5 transition-[transform,box-shadow] duration-220 ease-(--ease-out) hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="relative block size-20 shrink-0 overflow-hidden rounded-md bg-surface-2">
        <Media image={category.image} k={category.slug} view={1} sizes="80px" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[17px] font-bold text-navy-900">{category.name}</span>
        <span className="mt-0.5 block text-sm text-text-muted">
          {count} {count === 1 ? 'product' : 'products'}
        </span>
      </span>
      <ArrowUpRight className="size-5 text-navy-400 transition-colors group-hover:text-teal-700" aria-hidden />
    </Link>
  );
}
