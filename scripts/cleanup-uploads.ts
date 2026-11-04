/** Delete pending (never attached) uploads older than 24 h. Run hourly from cron (see DEPLOYMENT). */
import mongoose from 'mongoose';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { UploadModel } from '../src/models/lead';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set.');
  process.exit(1);
}
const root = path.resolve(process.env.UPLOAD_DIR ?? './storage/uploads');
await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
const stale = await UploadModel.find({ status: 'pending', createdAt: mongoose.trusted({ $lt: cutoff }) }).lean();
let removed = 0;
for (const u of stale) {
  const abs = path.resolve(root, u.storagePath);
  if (abs.startsWith(root + path.sep)) await rm(abs, { force: true });
  await UploadModel.deleteOne({ _id: u._id, status: 'pending' });
  removed++;
}
console.log(`Removed ${removed} orphaned upload${removed === 1 ? '' : 's'}.`);
await mongoose.disconnect();
