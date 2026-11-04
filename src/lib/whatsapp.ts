import { business, isSet } from '@/config/business';

export const whatsappTexts = {
  global: "Hi VasuPrint, I'd like to discuss a printing requirement.",
  interest: (name: string, url?: string) =>
    `Hi VasuPrint, I'm interested in ${name}. Please share details and a quotation.${url ? `\n${url}` : ''}`,
};

/**
 * wa.me link with pre-filled text. While the business number is a placeholder,
 * the link opens WhatsApp's contact picker with the text filled in, so the UI
 * still works end to end in the showcase build.
 */
export function buildWhatsAppUrl(text: string, number: string = business.whatsappE164): string {
  const digits = isSet(number) ? number.replace(/\D/g, '') : '';
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function buildMailtoUrl(subject: string, body: string, to: string = business.email): string {
  const addr = isSet(to) ? to : '';
  return `mailto:${addr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** tel: link, or null while the phone number is a placeholder (a call link can't work without it). */
export function telUrl(): string | null {
  return isSet(business.phoneE164) ? `tel:${business.phoneE164}` : null;
}
