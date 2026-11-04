/**
 * Small in-memory fixed-window rate limiter. One Node process serves the site (PM2 fork mode),
 * so memory is the right store; swap for Redis if the app is ever scaled horizontally.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private buckets = new Map<string, Bucket>();
  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** Records a hit. Returns `retryAfter` seconds when the key is over the limit. */
  hit(key: string, now = Date.now()): { ok: true } | { ok: false; retryAfter: number } {
    const b = this.buckets.get(key);
    if (!b || b.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      this.sweep(now);
      return { ok: true };
    }
    if (b.count >= this.limit) return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
    b.count += 1;
    return { ok: true };
  }

  /** Peek without recording. */
  blocked(key: string, now = Date.now()): number | null {
    const b = this.buckets.get(key);
    if (!b || b.resetAt <= now || b.count < this.limit) return null;
    return Math.ceil((b.resetAt - now) / 1000);
  }

  reset(key?: string) {
    if (key) this.buckets.delete(key);
    else this.buckets.clear();
  }

  private sweep(now: number) {
    if (this.buckets.size < 5000) return;
    for (const [k, b] of this.buckets) if (b.resetAt <= now) this.buckets.delete(k);
  }
}

const HOUR = 60 * 60 * 1000;
const g = globalThis as unknown as { __vpLimits?: ReturnType<typeof create> };
function create() {
  return {
    uploadsHourly: new RateLimiter(10, HOUR),
    quotesHourly: new RateLimiter(5, HOUR),
    quotesDaily: new RateLimiter(20, 24 * HOUR),
    loginPerIp: new RateLimiter(5, 15 * 60 * 1000),
    loginGlobalFailures: new RateLimiter(20, 24 * HOUR),
  };
}
/** Shared limiter instances (kept on globalThis so dev hot reloads don't reset them). */
export const limits = (g.__vpLimits ??= create());
