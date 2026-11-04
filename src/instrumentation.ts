/** Fail fast at boot when the environment is incomplete (SECURITY §2: no secret fallbacks). */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { env } = await import('@/config/env');
  const e = env();
  console.info(`[boot] catalog=${e.CATALOG_SOURCE} quotes=${e.QUOTE_BACKEND}${e.LOCAL_PREVIEW === 'true' ? ' (local preview)' : ''}`);
}
