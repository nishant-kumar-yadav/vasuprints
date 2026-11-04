import type { Metadata } from 'next';
import Link from 'next/link';
import { ImageIcon, Package, Plus, Star } from 'lucide-react';
import { ReorderButtons } from '@/components/admin/ReorderButtons';
import { Card, EmptyState, PageHeader, PublishBadge, timeAgo } from '@/components/admin/ui';
import { buttonClasses } from '@/components/ui/Button';
import { listAdminCategories, listAdminProducts } from '@/lib/admin/catalog';
import { moveProduct } from './actions';

export const metadata: Metadata = { title: 'Products' };

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([listAdminProducts(), listAdminCategories()]);
  const groups = categories.map((c) => ({ category: c, items: products.filter((p) => p.category === c.slug) }));
  const orphans = products.filter((p) => !categories.some((c) => c.slug === p.category));

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products in ${categories.length} categories. Order here is the order on the site.`}
        actions={
          <Link href="/admin/products/new" className={buttonClasses('primary', 'md')}>
            <Plus className="size-4" aria-hidden /> New product
          </Link>
        }
      />
      {products.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="size-6" aria-hidden />}
            title="No products in the database"
            body="Run pnpm db:seed to import the launch catalog, or create a product."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {[...groups, ...(orphans.length ? [{ category: { slug: '', name: 'Without a category' } as { slug: string; name: string }, items: orphans }] : [])].map(({ category, items }) => (
            <Card
              key={category.slug || 'orphans'}
              padded={false}
              title={
                <span className="flex items-center gap-2">
                  {category.name}
                  <span className="text-sm font-normal text-text-muted">{items.length}</span>
                </span>
              }
              actions={
                category.slug ? (
                  <Link href={`/admin/products/new?category=${category.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800">
                    <Plus className="size-4" aria-hidden /> Add
                  </Link>
                ) : null
              }
            >
              {items.length ? (
                <ul className="divide-y divide-border">
                  {items.map((p, i) => (
                    <li key={String(p._id)} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                      <ReorderButtons id={String(p._id)} first={i === 0} last={i === items.length - 1} label={p.name} move={moveProduct} />
                      <Link href={`/admin/products/${String(p._id)}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-md py-1 hover:text-teal-700">
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 truncate text-[15px] font-medium">
                            {p.name}
                            {p.featured ? <Star className="size-3.5 fill-foil text-foil" aria-label="Featured" /> : null}
                          </span>
                          <span className="block truncate text-sm text-text-muted">/{p.slug}</span>
                        </span>
                        <span className="hidden items-center gap-1 text-xs text-text-muted sm:inline-flex" title="Photos">
                          <ImageIcon className="size-3.5" aria-hidden /> {p.images?.length ?? 0}
                        </span>
                        <span className="hidden w-20 text-right text-xs text-text-muted md:block">{timeAgo(p.updatedAt)}</span>
                        <PublishBadge status={p.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-4 text-[15px] text-text-muted">No products yet.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
