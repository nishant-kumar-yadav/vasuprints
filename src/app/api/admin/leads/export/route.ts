import { adminApiGuard } from '@/lib/auth/session';
import { csvRow } from '@/lib/admin/csv';
import { leadFilter, leadQuerySchema } from '@/lib/admin/leads';
import { connectDb } from '@/lib/db/connect';
import { LeadModel } from '@/models/lead';
import { statusLabel } from '@/components/admin/ui';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HEAD = [
  'Reference', 'Date (IST)', 'Status', 'Type', 'Name', 'Company', 'Phone (+91)', 'Email', 'Category', 'Product', 'Size', 'Quantity',
  'Material', 'Finishing', 'City', 'State', 'Additional', 'Files', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Landing Page',
];

const istStamp = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
    .format(d)
    .replace(',', '');

export async function GET(req: Request) {
  const denied = await adminApiGuard(req);
  if (denied) return denied;
  const url = new URL(req.url);
  const q = leadQuerySchema.parse(Object.fromEntries(url.searchParams));
  await connectDb();
  const rows = await LeadModel.find(leadFilter(q)).sort({ createdAt: -1 }).limit(20000).lean();
  const lines = [csvRow(HEAD)];
  for (const l of rows) {
    lines.push(
      csvRow([
        l.reference, istStamp(l.createdAt), statusLabel[l.status], l.kind === 'message' ? 'Message' : 'Quote', l.customer.name,
        l.customer.company, l.customer.phone.replace(/^\+91(\d{5})(\d{5})$/, '$1 $2'), l.customer.email, l.request.categoryName, l.request.productName ?? '', l.request.size,
        l.request.quantity, l.request.material, l.request.finishing, l.request.deliveryCity, l.request.deliveryState,
        l.request.additional, l.files.length, l.source.utmSource, l.source.utmMedium, l.source.utmCampaign, l.source.landingPage,
      ]),
    );
  }
  const now = new Date();
  const stamp = istStamp(now).replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/, '$3$2$1-$4$5');
  return new Response('\uFEFF' + lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vasuprint-leads-${stamp}.csv"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
