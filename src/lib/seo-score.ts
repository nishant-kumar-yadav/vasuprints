/**
 * On-page SEO checks for catalog pages, shared by the admin editor (live checklist) and tests.
 * Pure functions: no server or browser APIs.
 */
export interface SeoInput {
  /** Main search phrase, usually the product or category name. */
  keyword: string;
  slug: string;
  title: string;
  description: string;
  heading: string;
  intro: string[];
  /** Other visible copy (features, FAQs, specs) for the word count. */
  body: string[];
  imageAlts: string[];
  faqCount: number;
}

export interface SeoCheck {
  id: string;
  ok: boolean;
  label: string;
  hint?: string;
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Crude English singular: boxes → box, stickers → sticker, glasses → glass. */
const stem = (w: string) => (w.length > 3 ? w.replace(/(x|ch|sh|ss)es$/, '$1').replace(/([^s])s$/, '$1') : w);
const stems = (s: string) => ` ${norm(s.replace(/-/g, ' ')).split(' ').map(stem).join(' ')} `;

/**
 * "Mono Carton Boxes" also matches "mono carton box", "mono-carton-boxes" and, when every word is
 * present, "DTF transfer stickers" for "DTF Stickers".
 */
export function containsKeyword(text: string, keyword: string): boolean {
  const k = stems(keyword).trim();
  if (!k) return false;
  const t = stems(text);
  return t.includes(` ${k} `) || k.split(' ').every((w) => t.includes(` ${w} `));
}

export function seoChecks(i: SeoInput): SeoCheck[] {
  const intro = i.intro.join(' ');
  const total = words([i.heading, intro, ...i.body].join(' '));
  const links = (intro.match(/\]\(\/[^)]+\)/g) ?? []).length;
  const altsMissing = i.imageAlts.filter((a) => a.trim().length < 5).length;
  const t = i.title.length;
  const d = i.description.length;
  return [
    { id: 'title-length', ok: t >= 30 && t <= 60, label: `Title is ${t} characters`, hint: 'Aim for 30–60 so Google shows it in full.' },
    { id: 'title-keyword', ok: containsKeyword(i.title, i.keyword), label: 'Title contains the main phrase', hint: i.keyword.trim() ? `Include "${i.keyword}" near the start.` : 'Add the name first; it is the main phrase.' },
    { id: 'desc-length', ok: d >= 120 && d <= 160, label: `Description is ${d} characters`, hint: 'Aim for 120–160, and end with a reason to click.' },
    { id: 'desc-keyword', ok: containsKeyword(i.description, i.keyword), label: 'Description mentions the main phrase', hint: 'Google bolds matching words in results.' },
    { id: 'heading-keyword', ok: containsKeyword(i.heading, i.keyword), label: 'Page heading contains the main phrase' },
    { id: 'slug-keyword', ok: containsKeyword(i.slug, i.keyword), label: 'URL contains the main phrase' },
    { id: 'intro-keyword', ok: containsKeyword(i.intro[0] ?? '', i.keyword), label: 'First paragraph mentions the main phrase' },
    { id: 'word-count', ok: total >= 400, label: `${total} words of copy on the page`, hint: 'Aim for 400+ words of useful copy: more detail, uses or FAQs.' },
    { id: 'internal-links', ok: links >= 1, label: `${links} link${links === 1 ? '' : 's'} to other pages in the intro`, hint: 'Link a related product, e.g. [SBS boxes](/sbs-boxes).' },
    { id: 'faqs', ok: i.faqCount >= 3, label: `${i.faqCount} FAQs`, hint: 'Three or more FAQs answer real questions buyers search for.' },
    {
      id: 'alts',
      ok: i.imageAlts.length > 0 && altsMissing === 0,
      label: i.imageAlts.length ? (altsMissing ? `${altsMissing} photo${altsMissing === 1 ? '' : 's'} without a description` : 'Every photo has a description') : 'No photos yet',
      hint: 'Describe what the photo shows; Google Images uses it.',
    },
  ];
}

export function seoScore(checks: SeoCheck[]): number {
  return Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
}
