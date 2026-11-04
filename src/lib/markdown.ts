import { marked } from 'marked';

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/^\d+\.\s*/, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface Rendered {
  html: string;
  toc: { id: string; text: string }[];
  words: number;
}

/** Markdown → HTML with anchored h2/h3 and a table of contents of the h2s. Content is our own. */
export function renderMarkdown(body: string, opts: { breaks?: boolean } = {}): Rendered {
  const toc: Rendered['toc'] = [];
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens: t, depth }) => {
    const text = t.map((x) => ('text' in x ? x.text : '')).join('');
    const id = slugify(text);
    if (depth === 2) toc.push({ id, text });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };
  // Tables scroll on small screens instead of stretching the page.
  const table = renderer.table.bind(renderer);
  renderer.table = (t) => `<div class="table-scroll">${table(t)}</div>`;
  const html = marked.parse(body, { renderer, async: false, breaks: opts.breaks ?? false });
  const words = body.replace(/[#*|`[\]()>-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return { html, toc, words };
}
