import 'server-only';
import { z } from 'zod';

const flag = z.enum(['on', 'off']);
const optional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v.trim() : undefined));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SITE_URL: z.url().default('http://localhost:3000'),
  CATALOG_SOURCE: z.enum(['static', 'mongo']).default('static'),
  QUOTE_BACKEND: flag.default('off'),
  MONGODB_URI: optional,
  UPLOAD_DIR: z.string().default('./storage/uploads'),
  MEDIA_DIR: z.string().default('./storage/media'),
  MAIL_DIR: z.string().default('./storage/mail'),
  SMTP_HOST: optional,
  SMTP_PORT: z.coerce.number().int().optional(),
  SMTP_USER: optional,
  SMTP_PASS: optional,
  MAIL_FROM: optional,
  QUOTE_NOTIFY_TO: optional,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optional,
  NEXT_PUBLIC_GA_ID: optional,
  /** Search engine ownership tokens (content of the verification meta tag). */
  GOOGLE_SITE_VERIFICATION: optional,
  BING_SITE_VERIFICATION: optional,
  /** IndexNow key (8–128 letters, digits or dashes). When set, published catalog changes are pinged to Bing and others. */
  INDEXNOW_KEY: z.string().regex(/^[A-Za-z0-9-]{8,128}$/).optional().or(z.literal('').transform(() => undefined)),
  /** Force noindex (e.g. a staging copy on its own domain). Staging hosts are also detected automatically. */
  SEO_NOINDEX: z.enum(['true', 'false']).default('false'),
  TURNSTILE_SECRET_KEY: optional,
  IP_HASH_SALT: optional,
  ADMIN_EMAIL: optional,
  ADMIN_PASSWORD_HASH: optional,
  SESSION_SECRET: optional,
  SESSION_VERSION: z.coerce.number().int().default(1),
  CLOUDINARY_CLOUD_NAME: optional,
  CLOUDINARY_API_KEY: optional,
  CLOUDINARY_API_SECRET: optional,
  TRUST_PROXY: z.enum(['true', 'false']).default('false'),
  /** Run a production build on localhost without SMTP/Turnstile/admin secrets. Refused for non-local SITE_URL. */
  LOCAL_PREVIEW: z.enum(['true', 'false']).default('false'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/** Validated environment. Throws with a readable list of problems. */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment:\n${parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`);
  }
  const e = parsed.data;
  const missing: string[] = [];
  const need = (cond: boolean, ...keys: (keyof Env)[]) => {
    if (cond) for (const k of keys) if (e[k] === undefined) missing.push(k);
  };
  const backend = e.QUOTE_BACKEND === 'on';
  need(backend || e.CATALOG_SOURCE === 'mongo', 'MONGODB_URI');
  need(backend, 'IP_HASH_SALT');
  // In production there are no fallbacks for mail, bot protection or admin secrets.
  const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(e.SITE_URL.replace(/\/$/, ''));
  if (e.LOCAL_PREVIEW === 'true' && !local) missing.push('LOCAL_PREVIEW is only allowed when SITE_URL is localhost');
  const prod = e.NODE_ENV === 'production' && e.LOCAL_PREVIEW !== 'true';
  need(prod && backend, 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'QUOTE_NOTIFY_TO', 'TURNSTILE_SECRET_KEY', 'NEXT_PUBLIC_TURNSTILE_SITE_KEY');
  need(prod && e.CATALOG_SOURCE === 'mongo', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET');
  if (e.ADMIN_PASSWORD_HASH && !e.ADMIN_PASSWORD_HASH.startsWith('$argon2id$')) {
    missing.push('ADMIN_PASSWORD_HASH (not an argon2id hash: in .env files write each $ as \\$, exactly as `pnpm admin:hash` prints it)');
  }
  if (e.SESSION_SECRET && e.SESSION_SECRET.length < 32) missing.push('SESSION_SECRET (must be at least 32 characters)');
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  cached = e;
  return e;
}

/** For tests. */
export function resetEnvCache() {
  cached = null;
}

export function adminConfigured(e: Env = env()) {
  return Boolean(e.ADMIN_EMAIL && e.ADMIN_PASSWORD_HASH && e.SESSION_SECRET && e.MONGODB_URI);
}
