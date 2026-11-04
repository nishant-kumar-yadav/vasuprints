import type { Metadata } from 'next';
import Link from 'next/link';
import { FolderTree, Plus } from 'lucide-react';
import { ReorderButtons } from '@/components/admin/ReorderButtons';
import { Card, EmptyState, PageHeader, PublishBadge } from '@/components/admin/ui';
import { buttonClasses } from '@/components/ui/Button';
import { listAdminCategories, listAdminProducts } from '@/lib/admin/catalog';
import { moveCategory } from './actions';

export const metadata: Metadata = { title: 'Categories' };

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([listAdminCategories(), listAdminProducts()]);
  return (
    <>
      <PageHeader
        title="Categories"
        description="Order here is the order in the menu, footer and home page."
        actions={
          <Link href="/admin/categories/new" className={buttonClasses('primary', 'md')}>
            <Plus className="size-4" aria-hidden /> New category
          </Link>
        }
      />
      <Card padded={false}>
        {categories.length ? (
          <ul className="divide-y divide-border">
            {categories.map((c, i) => {
              const n = products.filter((p) => p.category === c.slug).length;
              return (
                <li key={String(c._id)} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <ReorderButtons id={String(c._id)} first={i === 0} last={i === categories.length - 1} label={c.name} move={moveCategory} />
                  <Link href={`/admin/categories/${String(c._id)}`} className="flex min-w-0 flex-1 items-center gap-3 hover:text-teal-700">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium">{c.name}</span>
                      <span className="block truncate text-sm text-text-muted">
                        /{c.slug} · {n} product{n === 1 ? '' : 's'}
                      </span>
                    </span>
                    <PublishBadge status={c.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={<FolderTree className="size-6" aria-hidden />} title="No categories in the database" body="Run pnpm db:seed to import the launch catalog." />
        )}
      </Card>
    </>
  );
}
