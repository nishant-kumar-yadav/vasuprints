import 'server-only';
import { z } from 'zod';
import { connectDb, trusted } from '@/lib/db/connect';
import { LEAD_STATUSES, LeadModel, UploadModel, type LeadDoc, type LeadStatus, type UploadDoc } from '@/models/lead';

export const PAGE_SIZE = 25;

export const leadQuerySchema = z.object({
  status: z.union([z.enum(LEAD_STATUSES), z.literal('all')]).catch('all'),
  q: z.string().trim().max(80).catch(''),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined),
});
export type LeadQuery = z.infer<typeof leadQuerySchema>;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Build a Mongo filter from validated query values only. */
export function leadFilter(q: Pick<LeadQuery, 'status' | 'q' | 'from' | 'to'>) {
  const filter: Record<string, unknown> = {};
  if (q.status !== 'all') filter.status = q.status;
  if (q.q) {
    const digits = q.q.replace(/\D/g, '');
    const rx = new RegExp(escapeRegex(q.q), 'i');
    const or: Record<string, unknown>[] = [
      { reference: rx },
      { 'customer.name': rx },
      { 'customer.company': rx },
      { 'customer.email': rx },
      { 'request.productName': rx },
      { 'request.deliveryCity': rx },
    ];
    if (digits.length >= 4) or.push({ 'customer.phone': new RegExp(escapeRegex(digits.slice(-10))) });
    filter.$or = or;
  }
  if (q.from || q.to) {
    const range: Record<string, Date> = {};
    // Dates are IST calendar days.
    if (q.from) range.$gte = new Date(`${q.from}T00:00:00+05:30`);
    if (q.to) range.$lte = new Date(`${q.to}T23:59:59.999+05:30`);
    filter.createdAt = trusted(range);
  }
  return filter;
}

export async function leadCounts(): Promise<Record<LeadStatus | 'all', number>> {
  await connectDb();
  const rows = await LeadModel.aggregate<{ _id: LeadStatus; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
  const out = { all: 0, new: 0, contacted: 0, quoted: 0, won: 0, lost: 0 } as Record<LeadStatus | 'all', number>;
  for (const r of rows) {
    out[r._id] = r.n;
    out.all += r.n;
  }
  return out;
}

export async function listLeads(q: LeadQuery) {
  await connectDb();
  const filter = leadFilter(q);
  const [total, rows] = await Promise.all([
    LeadModel.countDocuments(filter),
    LeadModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((q.page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
  ]);
  return { total, rows, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getLead(reference: string): Promise<{ lead: LeadDoc; files: UploadDoc[] } | null> {
  if (!/^VP-\d{4}-\d{6}$/.test(reference)) return null;
  await connectDb();
  const lead = await LeadModel.findOne({ reference }).lean();
  if (!lead) return null;
  const files = lead.files.length ? await UploadModel.find({ _id: trusted({ $in: lead.files }) }).lean() : [];
  const order = new Map(lead.files.map((id, i) => [id, i]));
  files.sort((a, b) => (order.get(a._id) ?? 0) - (order.get(b._id) ?? 0));
  return { lead, files };
}

export async function dashboardStats() {
  await connectDb();
  const now = Date.now();
  const weekAgo = new Date(now - 7 * 864e5);
  const monthAgo = new Date(now - 30 * 864e5);
  const [counts, week, month, latest] = await Promise.all([
    leadCounts(),
    LeadModel.countDocuments({ createdAt: trusted({ $gte: weekAgo }) }),
    LeadModel.countDocuments({ createdAt: trusted({ $gte: monthAgo }) }),
    LeadModel.find().sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  const decided = counts.won + counts.lost;
  return { counts, week, month, latest, winRate: decided ? Math.round((counts.won / decided) * 100) : null };
}
