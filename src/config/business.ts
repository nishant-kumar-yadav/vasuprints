/**
 * Every business and personal detail lives here (AGENTS.md §5.4).
 * Values marked PLACEHOLDER are unknown until the owner supplies them; the UI
 * renders them as "—" and hides actions (call, email, WhatsApp) that need them.
 */
export const PLACEHOLDER = '__PLACEHOLDER__' as const;

export const business = {
  brandName: 'VasuPrint',
  siteUrl: 'https://vasuprint.com',
  legalName: PLACEHOLDER as string,
  ownerNames: [PLACEHOLDER] as string[],
  phoneDisplay: PLACEHOLDER as string, // "+91 98765 43210"
  phoneE164: PLACEHOLDER as string, // "+919876543210"
  whatsappE164: PLACEHOLDER as string, // digits only for wa.me, e.g. "919876543210"
  email: PLACEHOLDER as string,
  address: {
    line1: PLACEHOLDER as string,
    line2: '',
    city: PLACEHOLDER as string,
    state: PLACEHOLDER as string,
    pin: PLACEHOLDER as string,
    country: 'India',
  },
  mapsUrl: PLACEHOLDER as string,
  mapsEmbedUrl: PLACEHOLDER as string,
  gstin: PLACEHOLDER as string,
  businessHours: PLACEHOLDER as string, // "Mon–Sat, 10:00–19:00 IST"
  jurisdictionCity: PLACEHOLDER as string,
};

export function isSet(value: string | undefined | null): value is string {
  return Boolean(value) && value !== PLACEHOLDER;
}

/** Display a business value, or an em dash while it is still a placeholder. */
export function show(value: string | undefined | null): string {
  return isSet(value) ? value : '—';
}

export function formatAddress(): string {
  const a = business.address;
  const parts = [a.line1, a.line2, a.city, a.state && a.pin && isSet(a.state) && isSet(a.pin) ? `${a.state} ${a.pin}` : a.state];
  const set = parts.filter((p): p is string => isSet(p));
  return set.length ? set.join(', ') : '—';
}
