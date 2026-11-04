import { z } from 'zod';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

/** Indian mobile: 10 digits starting 6–9, optional +91 / 91 / 0 prefix. Returns E.164 or null. */
export function normalizeIndianMobile(input: string): string | null {
  let d = input.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (!/^[6-9]\d{9}$/.test(d)) return null;
  return `+91${d}`;
}

/** "+919876543210" or raw input → "98765 43210" for display. */
export function formatIndianMobile(input: string): string {
  const e164 = normalizeIndianMobile(input);
  if (!e164) return input;
  const d = e164.slice(3);
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);

export const quoteSchema = z.object({
  category: z.string().min(1, 'Choose a product category.'),
  product: z.string(),
  size: text(120),
  quantity: text(40).min(1, 'Enter the quantity you need, e.g. 5,000 pcs.'),
  material: text(120),
  finishing: text(1000),
  name: text(80).min(2, 'Enter your full name.'),
  company: text(120),
  phone: z.string().refine((v) => normalizeIndianMobile(v) !== null, 'Enter a 10-digit Indian mobile number.'),
  email: text(120).min(1, 'Enter your email address.').pipe(z.email('Enter a valid email address, like name@company.com.')),
  city: text(80).min(1, 'Enter the delivery city.'),
  state: z.string().min(1, 'Choose the delivery state.'),
  notes: text(2000),
  consent: z.literal(true, 'Please agree so we can contact you about this enquiry.'),
});

/** Contact page uses a shorter version of the same form. */
export const compactQuoteSchema = quoteSchema.pick({
  name: true,
  phone: true,
  email: true,
  category: true,
  quantity: true,
  notes: true,
  consent: true,
});

export type QuoteValues = z.input<typeof quoteSchema>;

export const emptyQuote: QuoteValues = {
  category: '',
  product: '',
  size: '',
  quantity: '',
  material: '',
  finishing: '',
  name: '',
  company: '',
  phone: '',
  email: '',
  city: '',
  state: '',
  notes: '',
  consent: false as unknown as true,
};

export interface QuoteMessageInput {
  values: QuoteValues;
  productName?: string;
  categoryName?: string;
  fileNames?: string[];
}

/** The hand-off message (UI-UX §4.5). Empty optional lines are left out. */
export function buildQuoteMessage({ values: v, productName, categoryName, fileNames = [] }: QuoteMessageInput): string {
  const product = productName
    ? `${productName}${categoryName ? ` (${categoryName})` : ''}`
    : categoryName ?? 'Not sure yet';
  const phone = normalizeIndianMobile(v.phone);
  const lines: (string | false)[] = [
    "Hi VasuPrint, I'd like a quotation.",
    `• Product: ${product}`,
    !!v.size?.trim() && `• Size: ${v.size.trim()}`,
    !!v.quantity?.trim() && `• Quantity: ${v.quantity.trim()}`,
    !!v.material?.trim() && `• Material: ${v.material.trim()}`,
    !!v.finishing?.trim() && `• Printing/finishing: ${v.finishing.trim()}`,
    !!(v.city?.trim() || v.state) && `• Delivery: ${[v.city?.trim(), v.state].filter(Boolean).join(', ')}`,
    `• Name: ${v.name.trim()}${v.company?.trim() ? ` (${v.company.trim()})` : ''}`,
    `• Phone: ${phone ? `+91 ${formatIndianMobile(phone)}` : v.phone} · Email: ${v.email.trim()}`,
    fileNames.length > 0 && `• Artwork: ${fileNames.join(', ')} (attaching separately)`,
    !!v.notes?.trim() && `• Notes: ${v.notes.trim()}`,
  ];
  return lines.filter(Boolean).join('\n');
}

export function quoteSubject(productName?: string, categoryName?: string): string {
  return `Quote request — ${productName ?? categoryName ?? 'Custom printing'}`;
}

/* Artwork picker (files stay on the device in v1; FR-10 limits still apply). */
export const ARTWORK_EXTENSIONS = ['cdr', 'ai', 'eps', 'pdf', 'psd', 'svg', 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'zip'] as const;
export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 100 * 1024 * 1024;

export function fileExtension(name: string): string {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i + 1).toLowerCase();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

export function checkArtwork(file: { name: string; size: number }): string | null {
  if (!(ARTWORK_EXTENSIONS as readonly string[]).includes(fileExtension(file.name))) {
    return `${file.name} can't be added. Use CDR, AI, EPS, PDF, PSD, SVG, PNG, JPG, TIFF or ZIP.`;
  }
  if (file.size > MAX_FILE_BYTES) {
    return `${file.name} is ${formatBytes(file.size)}. The limit is 100 MB per file — send larger files on WhatsApp or email.`;
  }
  return null;
}
