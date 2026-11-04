import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BellRing, FilePen, Inbox } from "lucide-react";
import {
  Card,
  EmptyState,
  Notice,
  PageHeader,
  StatusBadge,
  timeAgo,
} from "@/components/admin/ui";
import { env } from "@/config/env";
import { dashboardStats } from "@/lib/admin/leads";
import { connectDb } from "@/lib/db/connect";
import { ProductModel } from "@/models/catalog";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard() {
  await connectDb();
  const [stats, drafts, productCount] = await Promise.all([
    dashboardStats(),
    ProductModel.find({ status: "draft" }, { name: 1, slug: 1, updatedAt: 1 })
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean(),
    ProductModel.countDocuments(),
  ]);
  const e = env();
  const cards = [
    {
      label: "New leads",
      value: stats.counts.new,
      hint: "Waiting for first contact",
      href: "/admin/leads?status=new",
      accent: true,
    },
    { label: "Last 7 days", value: stats.week, hint: "Requests received" },
    { label: "Last 30 days", value: stats.month, hint: "Requests received" },
    {
      label: "Win rate",
      value: stats.winRate === null ? "—" : `${stats.winRate}%`,
      hint: "Won ÷ (won + lost)",
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="What needs your attention today."
      />

      <div className="mb-6 flex flex-col gap-3">
        {e.CATALOG_SOURCE !== "mongo" ? (
          <Notice tone="warning">
            The public site is reading the built-in catalog (
            <code>CATALOG_SOURCE=static</code>). Product and category edits are
            saved, but go live only after switching to{" "}
            <code>CATALOG_SOURCE=mongo</code>.
          </Notice>
        ) : null}
        {productCount === 0 ? (
          <Notice tone="warning">
            The product database is empty. Run <code>pnpm db:seed</code> to
            import the launch catalog.
          </Notice>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {cards.map((c) => {
          const body = (
            <>
              <p className="text-sm font-medium text-text-secondary">
                {c.label}
              </p>
              <p
                className={`mt-2 font-display text-[2rem] font-extrabold leading-none tabular-nums ${c.accent ? "text-teal-700" : "text-navy-900"}`}
              >
                {c.value}
              </p>
              <p className="mt-2 text-xs text-text-muted">{c.hint}</p>
            </>
          );
          return c.href ? (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-xl border border-border bg-white p-5 transition-colors hover:border-teal-300"
            >
              {body}
            </Link>
          ) : (
            <div
              key={c.label}
              className="rounded-xl border border-border bg-white p-5"
            >
              {body}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card
          title="Latest leads"
          padded={false}
          actions={
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              View all <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        >
          {stats.latest.length ? (
            <ul className="divide-y divide-border">
              {stats.latest.map((l) => (
                <li key={l.reference}>
                  <Link
                    href={`/admin/leads/${l.reference}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-surface"
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[15px] ${l.status === "new" ? "font-semibold" : "font-medium"}`}
                      >
                        {l.customer.name}
                        {l.customer.company ? (
                          <span className="font-normal text-text-muted">
                            {" "}
                            · {l.customer.company}
                          </span>
                        ) : null}
                      </span>
                      <span className="block truncate text-sm text-text-secondary">
                        {l.request.productName ?? l.request.categoryName} ·{" "}
                        {l.request.quantity}
                      </span>
                    </span>
                    <span className="hidden text-sm text-text-muted sm:block">
                      {timeAgo(l.createdAt)}
                    </span>
                    <StatusBadge status={l.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Inbox className="size-6" aria-hidden />}
              title="No leads yet"
              body="Share your site link — new quote requests will appear here."
            />
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card
            title={
              <span className="flex items-center gap-2">
                <BellRing className="size-4 text-teal-700" aria-hidden />{" "}
                Follow-ups due
              </span>
            }
            padded={stats.followUps.length === 0}
          >
            {stats.followUps.length ? (
              <ul className="divide-y divide-border">
                {stats.followUps.map((l) => {
                  const overdue = l.overdue;
                  return (
                    <li key={l.reference}>
                      <Link
                        href={`/admin/leads/${l.reference}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-surface"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium">
                            {l.customer.name}
                          </span>
                          <span className="block truncate text-xs text-text-muted">
                            {l.reference}
                          </span>
                        </span>
                        <span
                          className={`text-xs font-semibold ${overdue ? "text-danger" : "text-warning"}`}
                        >
                          {overdue ? "Overdue" : "Today"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-[15px] text-text-muted">
                Nothing due. Set reminders from a lead&apos;s page.
              </p>
            )}
          </Card>
          <Card title="Drafts" padded={drafts.length === 0}>
            {drafts.length ? (
              <ul className="divide-y divide-border">
                {drafts.map((d) => (
                  <li key={String(d._id)}>
                    <Link
                      href={`/admin/products/${String(d._id)}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-surface"
                    >
                      <FilePen className="size-4 text-navy-400" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                        {d.name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {timeAgo(d.updatedAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[15px] text-text-muted">
                No draft products. Everything is published.
              </p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
