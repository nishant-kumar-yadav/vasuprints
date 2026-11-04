import { BrandMark, C, IsoBox, Shadow } from './primitives';

/* ---------- Packaging ---------- */

export type BoxStyle = 'mono' | 'sbs' | 'duplex';

const boxPalettes = {
  mono: { top: C.navy700, left: C.navy900, right: C.navy800 },
  sbs: { top: C.white, left: C.navy100, right: C.navy50 },
  duplex: { top: C.teal400, left: C.teal700, right: C.teal500 },
} as const;

function BoxFace({ w, h, style, g }: { w: number; h: number; style: BoxStyle; g: string }) {
  const ink = style === 'sbs' ? C.navy800 : C.white;
  const accent = style === 'mono' ? `url(#${g}-foil)` : style === 'sbs' ? `url(#${g}-metal)` : C.navy900;
  return (
    <g>
      {style === 'duplex' ? (
        <>
          <path d={`M${w * 0.55} 0 L${w} 0 L${w} ${h * 0.45} Z`} fill={C.teal300} opacity={0.7} />
          <rect x={0} y={h * 0.72} width={w} height={h * 0.28} fill={C.navy800} />
        </>
      ) : null}
      {style === 'mono' ? <rect x={0} y={h * 0.62} width={w} height={4} fill={accent} /> : null}
      <BrandMark x={w * 0.2} y={h * 0.36} s={Math.min(w, h) / 90} color={ink} accent={accent} />
      {style === 'sbs' ? <rect x={w * 0.2 - 10} y={h * 0.7} width={w * 0.5} height={2} fill={accent} /> : null}
    </g>
  );
}

export function CartonsScene({ style, g }: { style: BoxStyle; g: string }) {
  const p = boxPalettes[style];
  const tall = { w: 70, d: 70, h: 130 };
  return (
    <g>
      <Shadow cx={205} cy={250} rx={150} ry={16} />
      {/* back tall box */}
      <IsoBox
        x={230}
        y={215}
        {...tall}
        palette={p}
        tuck
        right={<BoxFace w={tall.w} h={tall.h} style={style} g={g} />}
      />
      {/* front low wide box */}
      <IsoBox
        x={150}
        y={262}
        w={110}
        d={80}
        h={60}
        palette={p}
        right={<BoxFace w={110} h={60} style={style} g={g} />}
        top={
          style === 'duplex' ? null : (
            <rect x={30} y={30} width={50} height={20} rx={3} fill={style === 'mono' ? `url(#${g}-foil)` : C.navy200} opacity={0.9} />
          )
        }
      />
      {/* flat-packed blank leaning */}
      <g transform="translate(300 120) rotate(8)">
        <rect x={0} y={0} width={64} height={120} rx={2} fill={style === 'mono' ? C.navy800 : style === 'sbs' ? C.white : C.teal500} stroke={C.navy200} strokeWidth={1} />
        <line x1={0} y1={30} x2={64} y2={30} stroke={C.navy300} strokeDasharray="4 3" strokeWidth={1} />
        <line x1={0} y1={90} x2={64} y2={90} stroke={C.navy300} strokeDasharray="4 3" strokeWidth={1} />
      </g>
    </g>
  );
}

/* ---------- Stickers ---------- */

export type LabelStyle = 'paper' | 'vinyl' | 'pvc';

export function LabelRollScene({ style, g }: { style: LabelStyle; g: string }) {
  const label = style === 'paper' ? C.kraft : style === 'vinyl' ? C.teal500 : `url(#${g}-metal)`;
  const rollFace = C.white;
  return (
    <g>
      <Shadow cx={200} cy={252} rx={150} ry={14} />
      {/* roll (cylinder lying on its side) */}
      <g>
        <ellipse cx={60} cy={185} rx={28} ry={55} fill={C.navy200} />
        <rect x={60} y={130} width={130} height={110} fill={C.navy50} />
        <ellipse cx={190} cy={185} rx={28} ry={55} fill={rollFace} stroke={C.navy200} />
        <ellipse cx={190} cy={185} rx={10} ry={20} fill={C.navy200} />
        <ellipse cx={190} cy={185} rx={6} ry={12} fill={C.navy100} />
        {/* unrolled liner strip */}
        <path d="M190 240 L300 240 L300 222 L190 222 Z" fill={C.white} stroke={C.navy200} />
        {[205, 240, 275].map((cx) => (
          <ellipse key={cx} cx={cx} cy={231} rx={13} ry={7} fill={label} />
        ))}
        {/* labels on roll body */}
        {[150, 185, 220].map((cy) => (
          <rect key={cy} x={86} y={cy - 12} width={78} height={24} rx={6} fill={label} opacity={0.95} />
        ))}
      </g>
      {/* jar with label */}
      <g transform="translate(270 100)">
        <rect x={6} y={0} width={68} height={16} rx={4} fill={C.navy800} />
        <rect x={0} y={14} width={80} height={124} rx={14} fill={style === 'vinyl' ? `url(#${g}-glass)` : C.white} stroke={C.navy200} />
        <rect x={0} y={48} width={80} height={56} fill={label} />
        <BrandMark x={16} y={76} s={0.7} color={style === 'paper' ? C.navy900 : C.white} />
      </g>
    </g>
  );
}

export function DieCutScene() {
  return (
    <g>
      <Shadow cx={200} cy={248} rx={140} ry={12} opacity={0.12} />
      {/* star */}
      <g transform="translate(120 120) rotate(-12)">
        <path d="M0 -48 L14 -16 L48 -14 L22 8 L30 42 L0 24 L-30 42 L-22 8 L-48 -14 L-14 -16 Z" fill={C.white} stroke={C.white} strokeWidth={10} strokeLinejoin="round" />
        <path d="M0 -48 L14 -16 L48 -14 L22 8 L30 42 L0 24 L-30 42 L-22 8 L-48 -14 L-14 -16 Z" fill={C.teal500} />
      </g>
      {/* blob */}
      <g transform="translate(250 105) rotate(8)">
        <path d="M-60 -10 C-60 -50 -10 -60 20 -45 C60 -30 70 10 40 35 C10 60 -55 45 -60 -10 Z" fill={C.white} stroke={C.white} strokeWidth={10} />
        <path d="M-60 -10 C-60 -50 -10 -60 20 -45 C60 -30 70 10 40 35 C10 60 -55 45 -60 -10 Z" fill={C.navy800} />
        <BrandMark x={-30} y={-4} s={1} color={C.white} accent={C.teal300} />
      </g>
      {/* circle */}
      <g transform="translate(190 205)">
        <circle r={40} fill={C.white} />
        <circle r={34} fill={C.kraft} />
        <circle r={22} fill="none" stroke={C.navy900} strokeWidth={2} strokeDasharray="3 4" />
        <circle r={6} fill={C.navy900} />
      </g>
      {/* rounded badge */}
      <g transform="translate(305 200) rotate(-6)">
        <rect x={-42} y={-28} width={84} height={56} rx={28} fill={C.white} />
        <rect x={-37} y={-23} width={74} height={46} rx={23} fill={C.teal100} />
        <rect x={-22} y={-5} width={44} height={10} rx={5} fill={C.teal700} />
      </g>
      {/* peeled sticker with crop marks */}
      <g transform="translate(80 215) rotate(10)">
        <rect x={-30} y={-22} width={60} height={44} rx={8} fill={C.white} stroke={C.navy200} />
        <path d="M30 -22 L30 6 L8 -22 Z" fill={C.navy100} />
        <rect x={-20} y={-6} width={30} height={6} rx={3} fill={C.navy700} />
      </g>
    </g>
  );
}

/* ---------- DTF ---------- */

export function DtfSheetScene({ g }: { g: string }) {
  return (
    <g>
      <Shadow cx={200} cy={250} rx={150} ry={12} opacity={0.12} />
      <g transform="translate(200 160) rotate(-6)">
        <rect x={-150} y={-95} width={300} height={190} rx={4} fill={`url(#${g}-film)`} stroke={C.navy200} />
        {/* gang sheet designs */}
        <g transform="translate(-110 -50)">
          <circle r={34} fill={C.teal500} />
          <path d="M-18 4 L0 -18 L18 4 Z" fill={C.white} />
          <rect x={-16} y={8} width={32} height={6} rx={3} fill={C.navy900} />
        </g>
        <g transform="translate(-20 -55)">
          <rect x={-36} y={-28} width={72} height={56} rx={6} fill={C.navy800} />
          <BrandMark x={-22} y={0} s={0.85} color={C.white} accent={C.teal300} />
        </g>
        <g transform="translate(85 -50)">
          <path d="M-36 20 C-36 -30 36 -30 36 20 Z" fill={C.kraft} />
          <rect x={-30} y={22} width={60} height={8} rx={4} fill={C.navy900} />
        </g>
        <g transform="translate(-85 45)">
          <rect x={-48} y={-22} width={96} height={44} rx={22} fill={C.teal300} />
          <rect x={-30} y={-5} width={60} height={10} rx={5} fill={C.navy900} />
        </g>
        <g transform="translate(30 45)">
          <path d="M0 -34 L10 -10 L36 -10 L16 6 L24 32 L0 16 L-24 32 L-16 6 L-36 -10 L-10 -10 Z" fill={C.navy700} />
        </g>
        <g transform="translate(110 45)">
          <circle r={26} fill="none" stroke={C.teal600} strokeWidth={6} />
          <circle r={10} fill={C.teal600} />
        </g>
        {/* peeled corner */}
        <path d="M150 95 L150 45 L100 95 Z" fill={C.navy100} />
        <path d="M150 45 L100 95 L120 60 Z" fill={C.white} opacity={0.9} />
      </g>
    </g>
  );
}

export function TshirtScene({ g }: { g: string }) {
  return (
    <g>
      <Shadow cx={200} cy={262} rx={130} ry={12} opacity={0.14} />
      <path
        d="M140 50 L105 62 L60 100 L82 140 L112 122 L112 255 L288 255 L288 122 L318 140 L340 100 L295 62 L260 50 C250 72 228 82 200 82 C172 82 150 72 140 50 Z"
        fill={C.navy800}
      />
      <path d="M140 50 C150 72 172 82 200 82 C228 82 250 72 260 50" fill="none" stroke={C.navy600} strokeWidth={6} />
      {/* chest print */}
      <g transform="translate(200 150)">
        <circle r={36} fill={C.teal500} />
        <circle r={24} fill="none" stroke={C.white} strokeWidth={3} />
        <path d="M-12 6 L0 -12 L12 6 Z" fill={C.white} />
        <rect x={-48} y={46} width={96} height={9} rx={4.5} fill={C.white} />
        <rect x={-30} y={62} width={60} height={6} rx={3} fill={C.teal300} />
      </g>
      {/* transfer film being peeled */}
      <g transform="translate(286 175) rotate(14)">
        <rect x={0} y={0} width={70} height={56} rx={3} fill={`url(#${g}-film)`} stroke={C.navy200} />
        <circle cx={35} cy={28} r={14} fill={C.teal500} opacity={0.25} />
      </g>
    </g>
  );
}

/* ---------- UV DTF ---------- */

export function TumblerScene({ g }: { g: string }) {
  return (
    <g>
      <Shadow cx={200} cy={262} rx={120} ry={12} />
      {/* tumbler */}
      <g transform="translate(150 40)">
        <rect x={-6} y={0} width={112} height={22} rx={8} fill={C.navy700} />
        <path d="M0 22 L100 22 L90 220 C90 226 86 228 80 228 L20 228 C14 228 10 226 10 220 Z" fill={`url(#${g}-metal)`} />
        {/* UV wrap */}
        <path d="M4 80 L96 80 L92 160 L8 160 Z" fill={C.navy800} />
        <path d="M4 80 L96 80 L95.4 92 L4.6 92 Z" fill={C.teal500} />
        <BrandMark x={26} y={124} s={0.9} color={C.white} accent={C.teal300} />
        <path d="M20 30 L14 210" stroke="rgb(255 255 255 / 0.6)" strokeWidth={5} strokeLinecap="round" />
      </g>
      {/* decal sheet */}
      <g transform="translate(270 150) rotate(10)">
        <rect x={0} y={0} width={90} height={100} rx={6} fill={`url(#${g}-film)`} stroke={C.navy200} />
        <circle cx={28} cy={30} r={14} fill={C.teal500} />
        <rect x={50} y={20} width={30} height={20} rx={4} fill={C.navy800} />
        <path d="M20 70 L30 54 L40 70 Z" fill={C.navy700} />
        <rect x={50} y={60} width={30} height={12} rx={6} fill={C.kraft} />
      </g>
    </g>
  );
}

export function JarScene({ g }: { g: string }) {
  return (
    <g>
      <Shadow cx={200} cy={258} rx={140} ry={12} />
      {/* glass jar */}
      <g transform="translate(110 70)">
        <rect x={10} y={0} width={110} height={26} rx={6} fill={C.navy800} />
        <rect x={0} y={24} width={130} height={160} rx={22} fill={`url(#${g}-glass)`} stroke={C.navy200} />
        <g transform="translate(65 104)">
          <circle r={32} fill={C.white} opacity={0.9} />
          <circle r={26} fill={C.teal500} />
          <path d="M-12 8 L0 -12 L12 8 Z" fill={C.white} />
        </g>
        <path d="M18 44 L18 160" stroke="rgb(255 255 255 / 0.8)" strokeWidth={6} strokeLinecap="round" />
      </g>
      {/* acrylic block with decal */}
      <g transform="translate(270 140)">
        <rect x={0} y={0} width={70} height={110} rx={6} fill={`url(#${g}-glass)`} stroke={C.navy200} />
        <rect x={12} y={30} width={46} height={46} rx={23} fill={C.navy800} />
        <rect x={22} y={48} width={26} height={8} rx={4} fill={C.teal300} />
      </g>
    </g>
  );
}

/* ---------- Tags ---------- */

function HangTag({
  x,
  y,
  rot,
  fill,
  ink,
  accent,
  w = 70,
  h = 120,
}: {
  x: number;
  y: number;
  rot: number;
  fill: string;
  ink: string;
  accent: string;
  w?: number;
  h?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M${-w / 2} ${-h / 2 + 18} L${-w / 2 + 18} ${-h / 2} L${w / 2 - 18} ${-h / 2} L${w / 2} ${-h / 2 + 18} L${w / 2} ${h / 2 - 6} Q${w / 2} ${h / 2} ${w / 2 - 6} ${h / 2} L${-w / 2 + 6} ${h / 2} Q${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - 6} Z`} fill={fill} stroke="rgb(11 31 51 / 0.1)" />
      <circle cx={0} cy={-h / 2 + 16} r={6} fill={C.surface2} stroke={accent} strokeWidth={2.5} />
      <BrandMark x={-w / 2 + 16} y={-4} s={w / 110} color={ink} accent={accent} />
      <rect x={-w / 2 + 12} y={h / 2 - 26} width={w * 0.5} height={4} rx={2} fill={ink} opacity={0.5} />
    </g>
  );
}

export function HangTagsScene({ g }: { g: string }) {
  return (
    <g>
      <Shadow cx={200} cy={258} rx={140} ry={12} opacity={0.14} />
      <path d="M120 40 C150 70 175 75 205 92" stroke={C.navy400} strokeWidth={1.6} fill="none" />
      <path d="M205 30 C230 60 250 70 268 84" stroke={C.navy400} strokeWidth={1.6} fill="none" />
      <HangTag x={150} y={160} rot={-10} fill={C.kraft} ink={C.navy900} accent={C.navy900} w={86} h={150} />
      <HangTag x={250} y={150} rot={8} fill={C.navy900} ink={C.white} accent={`url(#${g}-foil)`} w={86} h={150} />
      <HangTag x={325} y={200} rot={18} fill={C.white} ink={C.navy800} accent={C.teal500} w={56} h={96} />
    </g>
  );
}

export function PlasticTagsScene({ g }: { g: string }) {
  return (
    <g>
      <Shadow cx={200} cy={258} rx={140} ry={12} opacity={0.12} />
      {[
        { x: 130, rot: -16, fill: `url(#${g}-film)` },
        { x: 200, rot: -2, fill: C.white },
        { x: 270, rot: 12, fill: `url(#${g}-glass)` },
      ].map((t, i) => (
        <g key={i} transform={`translate(${t.x} 160) rotate(${t.rot})`}>
          <rect x={-42} y={-80} width={84} height={160} rx={14} fill={t.fill} stroke={C.navy200} />
          <rect x={-10} y={-68} width={20} height={8} rx={4} fill={C.surface2} stroke={C.navy300} />
          <BrandMark x={-26} y={-20} s={0.8} color={C.navy800} accent={C.teal500} />
          <rect x={-26} y={20} width={52} height={22} rx={3} fill="none" stroke={C.navy300} strokeDasharray="2 3" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
            <rect key={b} x={-24 + b * 6} y={50} width={b % 2 ? 2 : 3} height={16} fill={C.navy800} />
          ))}
        </g>
      ))}
    </g>
  );
}

/* ---------- Home hero composite ---------- */

export function HeroScene({ g }: { g: string }) {
  return (
    <g>
      <Shadow cx={205} cy={262} rx={170} ry={14} />
      {/* DTF sheet behind */}
      <g transform="translate(250 85) rotate(6)">
        <rect x={-80} y={-55} width={160} height={110} rx={3} fill={`url(#${g}-film)`} stroke={C.navy200} />
        <circle cx={-40} cy={-15} r={22} fill={C.teal500} />
        <rect x={0} y={-35} width={56} height={40} rx={5} fill={C.navy800} />
        <rect x={-55} y={20} width={60} height={20} rx={10} fill={C.kraft} />
        <path d="M30 12 L38 28 L56 30 L42 40 L46 56 L30 46 L14 56 L18 40 L4 30 L22 28 Z" fill={C.navy600} transform="translate(0 -14) scale(0.8)" />
      </g>
      {/* carton */}
      <IsoBox
        x={150}
        y={255}
        w={95}
        d={70}
        h={110}
        palette={boxPalettes.mono}
        tuck
        right={<BoxFace w={95} h={110} style="mono" g={g} />}
      />
      {/* label roll */}
      <g transform="translate(270 215)">
        <ellipse cx={0} cy={0} rx={44} ry={44} fill={C.white} stroke={C.navy200} />
        <circle r={36} fill="none" stroke={C.teal500} strokeWidth={10} strokeDasharray="20 6" />
        <circle r={16} fill={C.navy100} />
        <circle r={10} fill={C.surface2} />
      </g>
      {/* hang tag */}
      <path d="M335 120 C350 140 352 150 345 168" stroke={C.navy400} strokeWidth={1.5} fill="none" />
      <HangTag x={345} y={205} rot={12} fill={C.kraft} ink={C.navy900} accent={C.navy900} w={54} h={92} />
    </g>
  );
}
