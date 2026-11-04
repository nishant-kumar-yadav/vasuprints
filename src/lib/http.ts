import 'server-only';

export function apiError(status: number, code: string, message: string, extra: { fields?: Record<string, string>; retryAfter?: number } = {}) {
  const headers: Record<string, string> = { 'Cache-Control': 'no-store' };
  if (extra.retryAfter) headers['Retry-After'] = String(extra.retryAfter);
  return Response.json({ error: { code, message, ...(extra.fields ? { fields: extra.fields } : {}) } }, { status, headers });
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}
