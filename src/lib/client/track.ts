/** Fire a GA4 event when analytics is loaded; a no-op otherwise. */
export function track(event: string, params: Record<string, string | number> = {}) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  w.gtag?.('event', event, params);
}
