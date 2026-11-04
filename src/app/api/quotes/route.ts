import { after } from 'next/server';
import { env } from '@/config/env';
import { apiError, json } from '@/lib/http';
import { QuoteError, createLead, notifyLead } from '@/lib/quotes/service';
import { formTokenAge } from '@/lib/security/form-token';
import { clientIp, hashIp } from '@/lib/security/ip';
import { originAllowed } from '@/lib/security/origin';
import { limits } from '@/lib/security/rate-limit';
import { verifyTurnstile } from '@/lib/security/turnstile';
import { quoteInputSchema } from '@/schemas/quote';
import { istYear, formatReference } from '@/lib/quotes/reference';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY = 64 * 1024;
const MIN_FILL_MS = 3000;

function fakeReference() {
  return formatReference(istYear(), Math.floor(100000 + Math.random() * 800000));
}

export async function POST(req: Request) {
  if (env().QUOTE_BACKEND !== 'on') return apiError(404, 'NOT_FOUND', 'Not found');
  if (!originAllowed(req.headers)) return apiError(403, 'ORIGIN_MISMATCH', 'Request origin not allowed.');

  const ip = clientIp(req.headers);
  const ipHash = hashIp(ip);
  const hourly = limits.quotesHourly.blocked(ipHash) ?? limits.quotesDaily.blocked(ipHash);
  if (hourly) {
    return apiError(429, 'RATE_LIMITED', "You've sent several requests recently. Please try again in a few minutes or message us on WhatsApp.", { retryAfter: hourly });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY) return apiError(413, 'BODY_TOO_LARGE', 'Request too large.');
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return apiError(400, 'VALIDATION_FAILED', 'Invalid request.');
  }

  const parsed = quoteInputSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const k = String(i.path[0] ?? 'form');
      fields[k] ??= i.message;
    }
    return apiError(400, 'VALIDATION_FAILED', 'Please check the highlighted fields.', { fields });
  }
  const input = parsed.data;

  // Bots: honeypot filled or form submitted implausibly fast → pretend success, store nothing.
  const age = formTokenAge(input.formToken);
  if (input.website || (age !== null && age < MIN_FILL_MS)) {
    console.warn('[quotes] bot heuristics triggered');
    return json({ reference: fakeReference() }, 201);
  }
  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    console.warn('[quotes] turnstile failed');
    return apiError(403, 'BOT_CHECK_FAILED', "We couldn't verify your request. Please refresh the page and try again.");
  }

  limits.quotesHourly.hit(ipHash);
  limits.quotesDaily.hit(ipHash);

  try {
    const lead = await createLead(input, { ipHash, userAgent: req.headers.get('user-agent') ?? '' });
    console.info(`[quotes] lead created ${lead.reference}`);
    after(() => notifyLead(lead.reference));
    return json({ reference: lead.reference }, 201);
  } catch (err) {
    if (err instanceof QuoteError) {
      return apiError(400, err.code, err.message, err.fields ? { fields: err.fields } : {});
    }
    console.error('[quotes] failed', (err as Error).message);
    return apiError(503, 'QUOTES_UNAVAILABLE', 'We could not save your request right now.');
  }
}
