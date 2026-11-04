import { describe, expect, it } from 'vitest';
import { buildQuoteMessage, checkArtwork, emptyQuote, formatIndianMobile, normalizeIndianMobile, quoteSchema } from '@/lib/quote';

describe('normalizeIndianMobile', () => {
  it.each([
    ['9876543210', '+919876543210'],
    ['+91 98765 43210', '+919876543210'],
    ['09876543210', '+919876543210'],
    ['919876543210', '+919876543210'],
  ])('%s → %s', (input, out) => expect(normalizeIndianMobile(input)).toBe(out));

  it.each(['12345', '5876543210', '98765432101', ''])('rejects %s', (input) => {
    expect(normalizeIndianMobile(input)).toBeNull();
  });

  it('formats for display', () => expect(formatIndianMobile('+919876543210')).toBe('98765 43210'));
});

describe('quoteSchema', () => {
  const valid = {
    ...emptyQuote,
    category: 'packaging-boxes',
    quantity: '5,000 boxes',
    name: 'Ananya Rao',
    phone: '98765 43210',
    email: 'ananya@raonaturals.in',
    city: 'Pune',
    state: 'Maharashtra',
    consent: true as const,
  };
  it('accepts a complete request', () => expect(quoteSchema.safeParse(valid).success).toBe(true));
  it('requires consent', () => expect(quoteSchema.safeParse({ ...valid, consent: false }).success).toBe(false));
  it('rejects a bad phone', () => expect(quoteSchema.safeParse({ ...valid, phone: '12345' }).success).toBe(false));
  it('rejects a bad email', () => expect(quoteSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false));
});

describe('buildQuoteMessage', () => {
  it('matches the UI-UX hand-off format and skips empty lines', () => {
    const msg = buildQuoteMessage({
      values: {
        ...emptyQuote,
        size: '120 × 80 × 40 mm',
        quantity: '5,000 boxes',
        material: '350 GSM SBS',
        finishing: 'Matte lamination, spot UV',
        city: 'Pune',
        state: 'Maharashtra',
        name: 'Ananya Rao',
        company: 'Rao Naturals Pvt Ltd',
        phone: '9876543210',
        email: 'ananya@raonaturals.in',
        notes: 'Need samples before bulk run.',
      },
      productName: 'Mono Carton Boxes',
      categoryName: 'Packaging Boxes',
    });
    expect(msg).toBe(
      [
        "Hi VasuPrint, I'd like a quotation.",
        '• Product: Mono Carton Boxes (Packaging Boxes)',
        '• Size: 120 × 80 × 40 mm',
        '• Quantity: 5,000 boxes',
        '• Material: 350 GSM SBS',
        '• Printing/finishing: Matte lamination, spot UV',
        '• Delivery: Pune, Maharashtra',
        '• Name: Ananya Rao (Rao Naturals Pvt Ltd)',
        '• Phone: +91 98765 43210 · Email: ananya@raonaturals.in',
        '• Notes: Need samples before bulk run.',
      ].join('\n'),
    );
  });
});

describe('checkArtwork', () => {
  it('accepts allowed types', () => expect(checkArtwork({ name: 'dieline.CDR', size: 1000 })).toBeNull());
  it('rejects other types', () => expect(checkArtwork({ name: 'x.exe', size: 10 })).toMatch(/can't be added/));
  it('rejects > 100 MB', () => expect(checkArtwork({ name: 'a.pdf', size: 101 * 1024 * 1024 })).toMatch(/limit is 100 MB/));
});
