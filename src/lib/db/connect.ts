import 'server-only';
import mongoose from 'mongoose';
import { env } from '@/config/env';

mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

const g = globalThis as unknown as { __vpMongo?: Promise<typeof mongoose> };

/** Cached connection (survives hot reloads in dev). */
export async function connectDb(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!g.__vpMongo) {
    const uri = env().MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');
    g.__vpMongo = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 })
      .catch((err: unknown) => {
        g.__vpMongo = undefined;
        throw err;
      });
  }
  return g.__vpMongo;
}

export async function dbHealthy(): Promise<boolean> {
  try {
    const m = await connectDb();
    await m.connection.db?.admin().ping();
    return true;
  } catch {
    return false;
  }
}

/**
 * `sanitizeFilter` neutralises `$` operators in filters so request data can never inject a
 * query operator. Filters we build ourselves from validated values opt back in with this.
 */
export const trusted = <T extends object>(filter: T): T => mongoose.trusted(filter) as T;
