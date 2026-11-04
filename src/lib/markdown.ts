import { marked, type Token } from 'marked';

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
  // Tables: every cell carries its column name so phones can show each row as a small card (see .table-stack).
  renderer.table = function (t) {
    const inline = (cell: { tokens: Token[] }) => this.parser.parseInline(cell.tokens);
    const heads = t.header.map((h) => inline(h));
    const label = (i: number) => heads[i]!.replace(/<[^>]+>/g, '').replace(/"/g, '&quot;');
    const thead = `<thead><tr>${heads.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>`;
    const rows = t.rows
      .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row" data-label="${label(i)}">${inline(c)}</th>` : `<td data-label="${label(i)}">${inline(c)}</td>`)).join('')}</tr>`)
      .join('');
    return `<div class="table-scroll table-stack"><table>${thead}<tbody>${rows}</tbody></table></div>`;
  };
  const html = marked.parse(body, { renderer, async: false, breaks: opts.breaks ?? false });
  const words = body.replace(/[#*|`[\]()>-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return { html, toc, words };
}
