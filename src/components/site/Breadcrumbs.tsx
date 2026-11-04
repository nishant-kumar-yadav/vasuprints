import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd, breadcrumbLd } from '@/lib/seo';

export interface Crumb {
  name: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: 'Home', href: '/' }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
      <JsonLd data={breadcrumbLd(all)} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="font-medium text-navy-900">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.href} className="rounded-sm transition-colors hover:text-teal-700">
                    {c.name}
                  </Link>
                  <ChevronRight className="size-3.5" aria-hidden />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
