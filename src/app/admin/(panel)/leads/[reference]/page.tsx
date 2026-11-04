import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Mail, Phone, ShieldAlert } from "lucide-react";
import {
  DeleteLead,
  EmailDelivery,
  FollowUp,
  LeadNotes,
  LeadStatusSelect,
  WhatsAppTemplates,
} from "@/components/admin/LeadControls";
import {
  Card,
  PageHeader,
  StatusBadge,
  formatDateTime,
  statusLabel,
} from "@/components/admin/ui";
import { CopyButton } from "@/components/site/CopyButton";
import { WhatsAppIcon } from "@/components/site/icons/WhatsApp";
import { buttonClasses } from "@/components/ui/Button";
import { getLead } from "@/lib/admin/leads";
import { formatBytes } from "@/lib/quote";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Params = Promise<{ reference: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  return { title: (await params).reference };
}

export default async function LeadPage({ params }: { params: Params }) {
  const { reference } = await params;
  const data = await getLead(reference);
  if (!data) notFound();
  const { lead, files } = data;
  const c = lead.customer;
  const r = lead.request;
  const firstName = c.name.split(/\s+/)[0] ?? c.name;
  const wa = buildWhatsAppUrl(
    `Hello ${firstName}, this is VasuPrint regarding your quote request ${lead.reference}.`,
    c.phone.replace(/\D/g, ""),
  );
  const phoneDisplay = c.phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2");

  const spec: [string, string | null | undefined][] = [
    ["Category", r.categoryName],
    [
      "Product",
      r.productName ?? (lead.kind === "quote" ? "Not sure / Other" : null),
    ],
    ["Size", r.size],
    ["Quantity", r.quantity],
    ["Material", r.material],
    ["Printing & finishing", r.finishing],
    ["Delivery", [r.deliveryCity, r.deliveryState].filter(Boolean).join(", ")],
  ];
  const src = lead.source;
  const sourceRows: [string, string][] = (
    [
      ["Landing page", src.landingPage],
      ["Submitted from", src.submitPage],
      ["UTM source", src.utmSource],
      ["UTM medium", src.utmMedium],
      ["UTM campaign", src.utmCampaign],
    ] as [string, string][]
  ).filter(([, v]) => v);

  return (
    <>
      <PageHeader
        back={
          <Link
            href="/admin/leads"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-navy-900"
          >
            <ArrowLeft className="size-4" aria-hidden /> All leads
          </Link>
        }
        title={lead.reference}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={lead.status} />
            <span>
              {lead.kind === "message" ? "Contact message" : "Quote request"} ·
              received {formatDateTime(lead.createdAt)} IST
            </span>
          </span>
        }
        actions={<CopyButton text={lead.reference} label="Copy reference" />}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6 max-lg:contents">
          <Card title="Request" padded={false} className="max-lg:order-2">
            <dl className="divide-y divide-border">
              {spec
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div
                    key={k}
                    className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr] sm:gap-4"
                  >
                    <dt className="text-sm text-text-muted">{k}</dt>
                    <dd className="min-w-0 whitespace-pre-wrap break-words text-[15px] text-navy-900">
                      {v}
                    </dd>
                  </div>
                ))}
            </dl>
          </Card>

          {r.additional ? (
            <Card
              className="max-lg:order-3"
              title={
                lead.kind === "message" ? "Message" : "Additional requirements"
              }
            >
              <p className="whitespace-pre-wrap text-[15px] text-navy-900">
                {r.additional}
              </p>
            </Card>
          ) : null}

          <Card
            className="max-lg:order-4"
            title={`Artwork files (${files.length})`}
            padded={files.length === 0}
          >
            {files.length ? (
              <>
                <ul className="divide-y divide-border">
                  {files.map((f) => (
                    <li
                      key={f._id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <span className="inline-flex h-7 min-w-11 items-center justify-center rounded-sm bg-navy-50 px-1.5 text-xs font-bold uppercase text-navy-800">
                        {f.ext}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] text-navy-900">
                          {f.originalName}
                        </span>
                        <span className="text-sm text-text-muted">
                          {formatBytes(f.bytes)}
                        </span>
                      </span>
                      <a
                        href={`/api/admin/files/${f._id}`}
                        className={buttonClasses("outline", "sm")}
                        download
                      >
                        <Download className="size-4" aria-hidden /> Download
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="flex items-start gap-2 border-t border-border px-5 py-3 text-sm text-text-secondary">
                  <ShieldAlert
                    className="mt-0.5 size-4 shrink-0 text-warning"
                    aria-hidden
                  />
                  Open files only from expected customers; scan ZIPs before
                  extracting.
                </p>
              </>
            ) : (
              <p className="text-[15px] text-text-muted">
                No files attached. The customer may send artwork on WhatsApp or
                email.
              </p>
            )}
          </Card>

          {sourceRows.length ? (
            <Card title="Source" padded={false} className="max-lg:order-7">
              <dl className="divide-y divide-border">
                {sourceRows.map(([k, v]) => (
                  <div
                    key={k}
                    className="grid gap-1 px-5 py-2.5 sm:grid-cols-[180px_1fr] sm:gap-4"
                  >
                    <dt className="text-sm text-text-muted">{k}</dt>
                    <dd className="break-all text-[15px] text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 max-lg:contents lg:sticky lg:top-8 lg:self-start">
          <Card className="max-lg:order-1">
            <p className="font-display text-lg font-bold text-navy-900">
              {c.name}
            </p>
            {c.company ? (
              <p className="text-[15px] text-text-secondary">{c.company}</p>
            ) : null}
            <dl className="mt-4 flex flex-col gap-2 text-[15px]">
              <div className="flex items-center gap-2">
                <dt className="sr-only">Phone</dt>
                <Phone className="size-4 text-navy-400" aria-hidden />
                <dd className="tabular-nums">{phoneDisplay}</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="sr-only">Email</dt>
                <Mail className="size-4 text-navy-400" aria-hidden />
                <dd className="truncate">{c.email}</dd>
              </div>
            </dl>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <a
                href={`tel:${c.phone}`}
                className={buttonClasses("outline", "sm", "px-2")}
              >
                <Phone className="size-4" aria-hidden /> Call
              </a>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className={buttonClasses("outline", "sm", "px-2")}
              >
                <WhatsAppIcon className="size-4" /> Chat
              </a>
              <a
                href={`mailto:${c.email}?subject=${encodeURIComponent(`Your VasuPrint quote ${lead.reference}`)}`}
                className={buttonClasses("outline", "sm", "px-2")}
              >
                <Mail className="size-4" aria-hidden /> Email
              </a>
            </div>
            <div className="mt-3">
              <WhatsAppTemplates
                phone={c.phone}
                firstName={firstName}
                reference={lead.reference}
                product={r.productName ?? r.categoryName}
              />
            </div>
            <div className="mt-5 flex flex-col gap-5 border-t border-border pt-5">
              <FollowUp
                reference={lead.reference}
                date={
                  lead.followUpAt
                    ? new Intl.DateTimeFormat("en-CA", {
                        timeZone: "Asia/Kolkata",
                      }).format(new Date(lead.followUpAt))
                    : null
                }
              />
              <div>
                <LeadStatusSelect
                  reference={lead.reference}
                  status={lead.status}
                />
                {lead.statusHistory.length ? (
                  <p className="mt-2 text-xs text-text-muted">
                    Last change: {statusLabel[lead.statusHistory.at(-1)!.from]}{" "}
                    → {statusLabel[lead.statusHistory.at(-1)!.to]},{" "}
                    {formatDateTime(lead.statusHistory.at(-1)!.at)}
                  </p>
                ) : null}
              </div>
            </div>
          </Card>

          <Card title="Notes" className="max-lg:order-5">
            <LeadNotes
              reference={lead.reference}
              notes={lead.notes.map((n) => ({
                body: n.body,
                at: new Date(n.at).toISOString(),
              }))}
            />
          </Card>

          <Card title="Emails" padded={false} className="max-lg:order-6">
            <div className="divide-y divide-border px-5 py-1">
              <EmailDelivery
                reference={lead.reference}
                which="admin"
                label="Team notification"
                status={lead.email.admin.status}
                error={lead.email.admin.error}
              />
              <EmailDelivery
                reference={lead.reference}
                which="customer"
                label="Customer acknowledgement"
                status={lead.email.customer.status}
                error={lead.email.customer.error}
              />
            </div>
          </Card>

          <Card title="Danger zone" className="max-lg:order-8">
            <p className="mb-3 text-sm text-text-secondary">
              Consent recorded {formatDateTime(lead.consent.at)} (notice{" "}
              {lead.consent.noticeVersion}).
            </p>
            <DeleteLead reference={lead.reference} />
          </Card>
        </div>
      </div>
    </>
  );
}
