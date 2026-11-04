import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

const C = { navy: '#102B46', navyDeep: '#0B1F33', teal: '#00A6A6', tealLight: '#4FCACA', mute: '#94A6BC', white: '#FFFFFF' };

/** Manrope ExtraBold for the headline; falls back to the built-in font when offline. */
type Font = { name: string; data: ArrayBuffer; weight: 500 | 800; style: 'normal' };
let fontsP: Promise<Font[] | undefined> | null = null;
function manrope() {
  fontsP ??= (async () => {
    try {
      const load = async (w: 500 | 800): Promise<Font> => {
        const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Manrope:wght@${w}&display=swap`, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30' } })).text();
        const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
        if (!url) throw new Error('font');
        return { name: 'Manrope', data: await (await fetch(url)).arrayBuffer(), weight: w, style: 'normal' };
      };
      return await Promise.all([load(500), load(800)]);
    } catch {
      return undefined;
    }
  })();
  return fontsP;
}

/** A local photo from public/ as a data URL (OG renderer can't fetch relative paths). */
async function photo(src: string | undefined) {
  if (!src || !src.startsWith('/images/')) return null;
  try {
    const sharp = (await import('sharp')).default;
    const buf = await sharp(await readFile(path.join(process.cwd(), 'public', src))).resize(520, 520, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

function Mark() {
  return (
    <svg width="56" height="56" viewBox="0 0 40 40">
      <path d="M9 0 H28 L40 12 V31 Q40 40 31 40 H9 Q0 40 0 31 V9 Q0 0 9 0 Z" fill="rgba(255,255,255,0.1)" />
      <path d="M28 0 L40 12 H31 Q28 12 28 9 Z" fill={C.teal} />
      <path d="M11 12 L20 29 L29 12" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Crop({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 28, height: 28, display: 'flex' }}>
      <div style={{ position: 'absolute', left: 13, top: 0, width: 2, height: 28, background: C.teal, opacity: 0.5 }} />
      <div style={{ position: 'absolute', left: 0, top: 13, width: 28, height: 2, background: C.teal, opacity: 0.5 }} />
    </div>
  );
}

/** Branded share card used for WhatsApp, LinkedIn and search previews. */
export async function ogCard({ eyebrow, title, text, image }: { eyebrow: string; title: string; text?: string; image?: string }) {
  const [fonts, pic] = await Promise.all([manrope(), photo(image)]);
  const f = Boolean(fonts);
  const long = title.length > 34;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: C.navy, position: 'relative', fontFamily: f ? 'Manrope' : undefined }}>
        {/* dieline motif */}
        <div style={{ position: 'absolute', right: -60, bottom: -60, width: 420, height: 420, border: `2px dashed rgba(0,166,166,0.25)`, borderRadius: 24, display: 'flex' }} />
        <div style={{ position: 'absolute', right: 40, bottom: 40, width: 220, height: 220, border: `2px solid rgba(255,255,255,0.06)`, borderRadius: 999, display: 'flex' }} />
        <Crop x={36} y={36} />
        <Crop x={1136} y={36} />
        <Crop x={36} y={566} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', width: pic ? 700 : 1100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Mark />
            <div style={{ display: 'flex', fontSize: 36, fontWeight: 800, letterSpacing: -1, color: C.white }}>
              Vasu<span style={{ color: C.tealLight }}>Print</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, color: C.tealLight, fontWeight: 800, textTransform: 'uppercase', marginBottom: 18 }}>{eyebrow}</div>
            <div style={{ display: 'flex', fontSize: long ? 58 : 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: C.white }}>{title}</div>
            {text ? <div style={{ display: 'flex', marginTop: 22, fontSize: 26, lineHeight: 1.4, color: '#C3CFDD', maxWidth: 940, fontWeight: 500 }}>{text.length > 120 ? `${text.slice(0, 117)}…` : text}</div> : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, color: C.white }}>
            <div style={{ display: 'flex', background: C.teal, color: C.navyDeep, padding: '12px 22px', borderRadius: 10, fontWeight: 800 }}>Get a quote</div>
            <div style={{ display: 'flex', color: C.mute, fontWeight: 500 }}>Custom sizes · Bulk orders · Pan-India dispatch</div>
          </div>
        </div>
        {pic ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 500 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pic} width={400} height={400} alt="" style={{ borderRadius: 24, objectFit: 'cover', border: '6px solid rgba(255,255,255,0.08)' }} />
          </div>
        ) : null}
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
