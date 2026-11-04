import 'server-only';
import { CounterModel } from '@/models/lead';

/** Year in India time, so references roll over at IST midnight on 1 January. */
export function istYear(date = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-IN', { year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date));
}

export function formatReference(year: number, seq: number) {
  return `VP-${year}-${String(seq).padStart(6, '0')}`;
}

/** Atomic counter → "VP-2026-000042". */
export async function nextLeadReference(date = new Date()): Promise<string> {
  const year = istYear(date);
  const doc = await CounterModel.findOneAndUpdate(
    { _id: `lead-${year}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  ).lean();
  return formatReference(year, doc?.seq ?? 1);
}
