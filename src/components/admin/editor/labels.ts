const names: Record<string, string> = {
  name: 'Name',
  slug: 'URL',
  category: 'Category',
  heading: 'Page heading',
  summary: 'Summary',
  tagline: 'Tagline',
  intro: 'Content paragraphs',
  features: 'Features',
  highlights: 'Highlights',
  specs: 'Specifications',
  applications: 'Applications',
  faqs: 'FAQs',
  images: 'Images',
  image: 'Cover image',
  related: 'Related products',
  seo: 'SEO',
  title: 'title',
  description: 'description',
  body: 'description',
  label: 'label',
  value: 'value',
  q: 'question',
  a: 'answer',
  alt: 'alt text',
};

/** "features.2.title" → "Features 3 title" */
export function fieldLabel(path: string) {
  return path
    .split('.')
    .map((part, i) => (/^\d+$/.test(part) ? String(Number(part) + 1) : i === 0 ? (names[part] ?? part) : (names[part] ?? part)))
    .join(' ');
}
