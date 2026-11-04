import { business, formatAddress, isSet } from '@/config/business';
import type { LeadDoc } from '@/models/lead';

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

export function istDateTime(d: Date) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(d) + ' IST';
}

export function formatBytes(n: number) {
  return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const NAVY = '#102B46';
const TEAL = '#00A6A6';

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#F6F8FA;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0B1F33">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden">
<tr><td style="background:${NAVY};padding:20px 28px;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#fff">Vasu<span style="color:#4FCACA">Print</span></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">${esc(title)}</h1>
${body}
</td></tr></table>
<p style="font-size:12px;color:#64748B;margin:16px 0 0">VasuPrint · Custom printing &amp; packaging</p>
</td></tr></table></body></html>`;
}

function rows(pairs: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin:8px 0 20px">${pairs
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #E2E8F0;color:#475569;width:38%;vertical-align:top">${esc(k)}</td><td style="padding:8px 0;border-bottom:1px solid #E2E8F0;vertical-align:top">${esc(v).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')}</table>`;
}

const button = (href: string, label: string, color = TEAL, text = '#0B1F33') =>
  `<a href="${esc(href)}" style="display:inline-block;background:${color};color:${text};font-weight:600;text-decoration:none;padding:12px 20px;border-radius:10px;margin:4px 8px 4px 0">${esc(label)}</a>`;

function requestPairs(lead: LeadDoc): [string, string][] {
  const r = lead.request;
  return [
    ['Category', r.categoryName],
    ['Product', r.productName ?? 'Not sure / Other'],
    ['Size', r.size],
    ['Quantity', r.quantity],
    ['Material', r.material],
    ['Printing & finishing', r.finishing],
    ['Delivery', [r.deliveryCity, r.deliveryState].filter(Boolean).join(', ')],
    ['Additional', r.additional],
  ];
}

const requestText = (lead: LeadDoc) =>
  requestPairs(lead)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

export function adminQuoteEmail(lead: LeadDoc, files: { name: string; bytes: number }[], siteUrl: string): EmailContent {
  const r = lead.request;
  const c = lead.customer;
  const what = r.productName ?? r.categoryName;
  const subject = `New ${lead.kind === 'message' ? 'message' : 'quote'} ${lead.reference} — ${what} — ${r.quantity}${r.deliveryCity ? ` — ${r.deliveryCity}` : ''}`;
  const adminUrl = `${siteUrl}/admin/leads/${lead.reference}`;
  const wa = `https://wa.me/${c.phone.replace(/\D/g, '')}`;
  const fileList = files.length
    ? `<p style="margin:0 0 8px;font-weight:600">Artwork (${files.length})</p><ul style="margin:0 0 20px;padding-left:18px;font-size:14px">${files
        .map((f) => `<li>${esc(f.name)} · ${formatBytes(f.bytes)}</li>`)
        .join('')}</ul><p style="font-size:13px;color:#475569;margin:-8px 0 20px">Files are not attached for security — download them in the admin.</p>`
    : '';
  const src = lead.source;
  const html = layout(
    `New ${lead.kind === 'message' ? 'message' : 'quote request'} ${lead.reference}`,
    `<p style="margin:0 0 16px;color:#475569;font-size:14px">Received ${esc(istDateTime(lead.createdAt))}</p>
${rows([
  ['Name', c.name],
  ['Company', c.company],
  ['Phone', c.phone],
  ['Email', c.email],
])}
<p style="margin:0 0 20px">${button(`tel:${c.phone}`, 'Call', '#fff', NAVY)}${button(wa, 'WhatsApp', '#fff', NAVY)}${button(`mailto:${c.email}`, 'Email', '#fff', NAVY)}</p>
${rows(requestPairs(lead))}
${fileList}
${rows([
  ['Landing page', src.landingPage],
  ['Submitted from', src.submitPage],
  ['UTM', [src.utmSource, src.utmMedium, src.utmCampaign].filter(Boolean).join(' / ')],
])}
<p>${button(adminUrl, 'Open in admin')}</p>`,
  );
  const text = [
    `New ${lead.kind === 'message' ? 'message' : 'quote request'} ${lead.reference}`,
    `Received ${istDateTime(lead.createdAt)}`,
    '',
    `Name: ${c.name}${c.company ? ` (${c.company})` : ''}`,
    `Phone: ${c.phone}  WhatsApp: ${wa}`,
    `Email: ${c.email}`,
    '',
    requestText(lead),
    files.length ? `\nArtwork: ${files.map((f) => `${f.name} (${formatBytes(f.bytes)})`).join(', ')}` : '',
    '',
    `Open in admin: ${adminUrl}`,
  ].join('\n');
  return { subject, html, text };
}

export function customerAckEmail(lead: LeadDoc, whatsappUrl: string): EmailContent {
  const first = lead.customer.name.split(/\s+/)[0] ?? lead.customer.name;
  const subject = `We've received your quote request — ${lead.reference}`;
  const contact = [
    isSet(business.phoneDisplay) ? `Phone / WhatsApp: ${business.phoneDisplay}` : '',
    isSet(business.email) ? `Email: ${business.email}` : '',
    formatAddress() !== '—' ? `Address: ${formatAddress()}` : '',
  ].filter(Boolean);
  const steps = ['Our team reviews your specifications', 'We share a quotation on WhatsApp or email', 'You approve an artwork proof', 'Production and dispatch'];
  const html = layout(
    `Thank you, ${first} — we've received your request`,
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569">Your reference is <strong style="color:#0B1F33">${esc(lead.reference)}</strong>. Please mention it if you contact us about this request.</p>
${rows(requestPairs(lead))}
<p style="margin:0 0 8px;font-weight:600">What happens next</p>
<ol style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.8;color:#475569">${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
<p>${button(whatsappUrl, 'Chat on WhatsApp')}</p>
${contact.length ? `<p style="font-size:13px;color:#475569;line-height:1.7;margin:20px 0 0">${contact.map(esc).join('<br>')}</p>` : ''}`,
  );
  const text = [
    `Hi ${first},`,
    '',
    `We've received your quote request. Your reference is ${lead.reference}.`,
    '',
    requestText(lead),
    '',
    'What happens next:',
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    '',
    `Chat on WhatsApp: ${whatsappUrl}`,
    ...contact,
    '',
    '— VasuPrint',
  ].join('\n');
  return { subject, html, text };
}
