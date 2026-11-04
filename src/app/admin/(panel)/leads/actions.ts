'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ActionError, adminAction } from '@/lib/admin/action';
import { connectDb, trusted } from '@/lib/db/connect';
import { notifyLead } from '@/lib/quotes/service';
import { fileStore } from '@/lib/uploads/store';
import { LEAD_STATUSES, LeadModel, UploadModel } from '@/models/lead';

const reference = z.string().regex(/^VP-\d{4}-\d{6}$/, 'Unknown reference.');

const touch = (ref: string) => {
  revalidatePath('/admin', 'layout');
  revalidatePath(`/admin/leads/${ref}`);
};

export const updateLeadStatus = adminAction(z.object({ reference, status: z.enum(LEAD_STATUSES) }), async ({ reference, status }) => {
  await connectDb();
  const lead = await LeadModel.findOne({ reference }, { status: 1 }).lean();
  if (!lead) throw new ActionError('Lead not found.');
  if (lead.status === status) return { status };
  await LeadModel.updateOne(
    { reference },
    { $set: { status }, $push: { statusHistory: { from: lead.status, to: status, at: new Date() } } },
  );
  touch(reference);
  return { status };
});

export const addLeadNote = adminAction(
  z.object({ reference, body: z.string().trim().min(1, 'Write a note first.').max(2000, 'Keep notes under 2,000 characters.') }),
  async ({ reference, body }) => {
    await connectDb();
    const note = { body, at: new Date() };
    const r = await LeadModel.updateOne({ reference }, { $push: { notes: note } });
    if (!r.matchedCount) throw new ActionError('Lead not found.');
    touch(reference);
    return { body, at: note.at.toISOString() };
  },
);

export const resendLeadEmail = adminAction(
  z.object({ reference, which: z.enum(['admin', 'customer']) }),
  async ({ reference, which }) => {
    await connectDb();
    if (!(await LeadModel.exists({ reference }))) throw new ActionError('Lead not found.');
    await notifyLead(reference, [which]);
    const lead = await LeadModel.findOne({ reference }, { email: 1 }).lean();
    touch(reference);
    const st = lead?.email[which];
    if (st?.status !== 'sent') throw new ActionError(`Email could not be sent${st?.error ? `: ${st.error}` : '.'}`);
    return { status: st.status };
  },
);

export const deleteLead = adminAction(z.object({ reference, confirm: z.string() }), async ({ reference, confirm }) => {
  if (confirm !== reference) throw new ActionError('Type the reference exactly to confirm.');
  await connectDb();
  const lead = await LeadModel.findOne({ reference }).lean();
  if (!lead) throw new ActionError('Lead not found.');
  const uploads = lead.files.length ? await UploadModel.find({ _id: trusted({ $in: lead.files }) }).lean() : [];
  const store = fileStore();
  for (const u of uploads) await store.remove(u.storagePath).catch(() => undefined);
  await UploadModel.deleteMany({ _id: trusted({ $in: lead.files }) });
  await LeadModel.deleteOne({ reference });
  console.info(`[admin] lead deleted ${reference}`);
  revalidatePath('/admin', 'layout');
  return { reference };
});
