/**
 * SEO audit of a running site: crawls every URL in the sitemap and checks what search engines see.
 *
 *   pnpm seo:audit                         audits http://localhost:3000 (start the production build first)
 *   pnpm seo:audit https://vasuprint.com   audits the live site
 *
 * Checks per page: status 200, one <title> (≤ 60 chars) and meta description (≤ 170), unique titles and
 * descriptions, self-referencing canonical, exactly one <h1>, Open Graph image that loads, valid JSON-LD,
 * images with alt text, no noindex, and no broken internal links. Exits 1 when it finds errors.
 */
const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const canonicalOrigin = 'https://vasuprint.com';

type Issue = { url: string; level: 'error' | 'warn'; msg: string };
const issues: Issue[] = [];
const err = (url: string, msg: string) => issues.push({ url, level: 'error', msg });
const warn = (url: string, msg: string) => issues.push({ url, level: 'warn', msg });

const local = (u: string) => u.replace(canonicalOrigin, base);
const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attr = (tag: string, name: string) => decode(new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? '');
const meta = (html: string, key: string) => {
  const tag = html.match(new RegExp(`<meta[^>]+(?:name|property)="${key}"[^>]*>`))?.[0];
  return tag ? attr(tag, 'content') : null;
};

const statusCache = new Map<string, Promise<number>>();
function check(url: string) {
  if (!statusCache.has(url)) statusCache.set(url, fetch(url, { redirect: 'manual' }).then((r) => r.status).catch(() => 0));
  return statusCache.get(url)!;
}

async function main() {
  const sm = await fetch(`${base}/sitemap.xml`);
  if (!sm.ok) throw new Error(`sitemap.xml returned ${sm.status}`);
  const urls = [...(await sm.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  const robots = await (await fetch(`${base}/robots.txt`)).text();
  if (/Disallow: \/\s*$/m.test(robots)) warn('/robots.txt', 'robots.txt blocks the whole site (staging mode?)');
  if (!/Sitemap:/i.test(robots)) warn('/robots.txt', 'robots.txt does not list the sitemap');

  const titles = new Map<string, string>();
  const descs = new Map<string, string>();
  const links = new Map<string, Set<string>>();
  const rows: string[] = [];

  for (const loc of urls) {
    const url = local(loc);
    const path = new URL(loc).pathname;
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status !== 200) {
      err(path, `status ${res.status}`);
      continue;
    }
    const html = await res.text();
    const head = html.slice(0, html.indexOf('</head>'));

    const title = decode(/<title>([^<]*)<\/title>/.exec(head)?.[1] ?? '');
    if (!title) err(path, 'missing <title>');
    else if (title.length > 60) warn(path, `title is ${title.length} chars: "${title}"`);
    if (titles.has(title)) err(path, `duplicate title with ${titles.get(title)}`);
    titles.set(title, path);

    const desc = meta(head, 'description');
    if (!desc) err(path, 'missing meta description');
    else {
      if (desc.length > 170) warn(path, `description is ${desc.length} chars`);
      if (desc.length < 70) warn(path, `description is only ${desc.length} chars`);
      if (descs.has(desc)) err(path, `duplicate description with ${descs.get(desc)}`);
      descs.set(desc, path);
    }

    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(head)?.[1];
    if (!canonical) err(path, 'missing canonical');
    else if (canonical.replace(/\/$/, '') !== loc.replace(/\/$/, '')) err(path, `canonical points to ${canonical}`);

    const robotsMeta = meta(head, 'robots') ?? '';
    if (/noindex/.test(robotsMeta)) err(path, 'page is noindex but listed in the sitemap');

    const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1 !== 1) err(path, `${h1} <h1> elements`);

    const og = meta(head, 'og:image');
    if (!og) err(path, 'missing og:image');
    else if ((await check(local(og))) !== 200) err(path, `og:image ${og} does not load`);
    for (const k of ['og:title', 'og:description', 'og:url', 'og:site_name', 'og:type']) if (!meta(head, k)) warn(path, `missing ${k}`);

    const types: string[] = [];
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const data = JSON.parse(m[1]!);
        for (const d of Array.isArray(data) ? data : [data]) types.push(...[d['@type']].flat());
      } catch {
        err(path, 'invalid JSON-LD');
      }
    }
    if (!types.includes('Organization') && !types.includes('LocalBusiness')) warn(path, 'no Organization structured data');

    const body = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    for (const img of body.match(/<img [^>]*>/g) ?? []) {
      if (!/\salt="[^"]+"/.test(img) && !/aria-hidden="true"/.test(img)) warn(path, `image without alt: ${attr(img, 'src').slice(0, 60)}`);
    }
    const words = body.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter((w) => /[a-z]/i.test(w)).length;

    for (const [, href] of html.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)) {
      if (!links.has(href!)) links.set(href!, new Set());
      links.get(href!)!.add(path);
    }
    rows.push(`${path.padEnd(48)} ${String(words).padStart(5)} words  ${types.filter((t) => t !== 'Organization' && t !== 'LocalBusiness').join(', ')}`);
  }

  // Broken internal links (each target checked once).
  for (const [href, from] of links) {
    if (href.startsWith('/admin') || href.startsWith('/api')) continue;
    const s = await check(`${base}${href}`);
    if (s >= 400 || s === 0) err(href, `broken link (status ${s}) from ${[...from].slice(0, 3).join(', ')}`);
  }

  console.log(`\nSEO audit of ${base} — ${urls.length} URLs in the sitemap\n`);
  console.log(rows.join('\n'));
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');
  if (warns.length) console.log(`\nWarnings (${warns.length}):\n${warns.map((i) => `  ⚠ ${i.url}: ${i.msg}`).join('\n')}`);
  if (errors.length) console.log(`\nErrors (${errors.length}):\n${errors.map((i) => `  ✗ ${i.url}: ${i.msg}`).join('\n')}`);
  console.log(`\n${errors.length ? '✗' : '✓'} ${errors.length} errors, ${warns.length} warnings, ${links.size} internal links checked.`);
  process.exit(errors.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
export {};
