import { z } from 'zod';
import { env } from '@/config/env';
import { connectDb } from '@/lib/db/connect';
import { apiError } from '@/lib/http';
import { clientIp, hashIp } from '@/lib/security/ip';
import { originAllowed } from '@/lib/security/origin';
import { fileStore } from '@/lib/uploads/store';
import { UploadModel } from '@/models/lead';

export const runtime = 'nodejs';

/** Buyer removes a file they added but haven't submitted yet. */
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (env().QUOTE_BACKEND !== 'on') return apiError(404, 'NOT_FOUND', 'Not found');
  if (!originAllowed(req.headers)) return apiError(403, 'ORIGIN_MISMATCH', 'Request origin not allowed.');
  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success) return apiError(404, 'NOT_FOUND', 'Not found');
  await connectDb();
  const ipHash = hashIp(clientIp(req.headers));
  const up = await UploadModel.findOne({ _id: id, status: 'pending', ipHash }).lean();
  if (!up) return apiError(404, 'NOT_FOUND', 'Not found');
  await fileStore().remove(up.storagePath);
  await UploadModel.deleteOne({ _id: id });
  return new Response(null, { status: 204 });
}
