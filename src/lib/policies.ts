import { marked } from 'marked';
import { business, formatAddress, show } from '@/config/business';
import { policiesData } from '@/content/policies-data';

const tokens: Record<string, () => string> = {
  'business.legalName': () => show(business.legalName),
  'business.address': () => formatAddress(),
  'business.email': () => show(business.email),
  'business.phoneDisplay': () => show(business.phoneDisplay),
  'business.gstin': () => show(business.gstin),
  'business.jurisdictionCity': () => show(business.jurisdictionCity),
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/^\d+\.\s*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

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
  const toc: Policy['toc'] = [];
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens: t, depth }) => {
    const text = t.map((x) => ('text' in x ? x.text : '')).join('');
    const id = slugify(text);
    if (depth === 2) toc.push({ id, text });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };
  const html = marked.parse(body, { renderer, async: false, breaks: true });
  return { ...p, html, toc };
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(iso));
}
