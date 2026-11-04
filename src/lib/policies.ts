import { business, formatAddress, show } from '@/config/business';
import { policiesData } from '@/content/policies-data';
import { renderMarkdown } from '@/lib/markdown';

const tokens: Record<string, () => string> = {
  'business.legalName': () => show(business.legalName),
  'business.address': () => formatAddress(),
  'business.email': () => show(business.email),
  'business.phoneDisplay': () => show(business.phoneDisplay),
  'business.gstin': () => show(business.gstin),
  'business.jurisdictionCity': () => show(business.jurisdictionCity),
};

export interface Policy {
  slug: string;
  title: string;
  intro: string;
  updated: string;
  whatsappCta: string;
  html: string;
  toc: { id: string; text: string }[];
}

export function getPolicy(slug: string): Policy {
  const p = policiesData.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown policy ${slug}`);
  const body = p.body.replace(/\{\{([\w.]+)\}\}/g, (_, k: string) => tokens[k]?.() ?? '—');
  const { html, toc } = renderMarkdown(body, { breaks: true });
  return { ...p, html, toc };
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(iso));
}
