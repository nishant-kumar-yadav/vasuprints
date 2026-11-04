/**
 * Vector building blocks for the v1 product illustrations. Everything is drawn in a
 * 400 × 300 coordinate space using isometric projection (30°). Colours come from the
 * design tokens via CSS variables so illustrations stay on-brand.
 */
import type { ReactNode } from 'react';

export const C = {
  navy50: 'var(--color-navy-50)',
  navy100: 'var(--color-navy-100)',
  navy200: 'var(--color-navy-200)',
  navy300: 'var(--color-navy-300)',
  navy400: 'var(--color-navy-400)',
  navy500: 'var(--color-navy-500)',
  navy600: 'var(--color-navy-600)',
  navy700: 'var(--color-navy-700)',
  navy800: 'var(--color-navy-800)',
  navy900: 'var(--color-navy-900)',
  teal50: 'var(--color-teal-50)',
  teal100: 'var(--color-teal-100)',
  teal200: 'var(--color-teal-200)',
  teal300: 'var(--color-teal-300)',
  teal400: 'var(--color-teal-400)',
  teal500: 'var(--color-teal-500)',
  teal600: 'var(--color-teal-600)',
  teal700: 'var(--color-teal-700)',
  white: '#fff',
  surface: 'var(--color-surface)',
  surface2: 'var(--color-surface-2)',
  kraft: 'var(--color-kraft)',
  foil: 'var(--color-foil)',
} as const;

const COS = 0.866;

type Pt = readonly [number, number];
const pts = (...p: Pt[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export interface BoxPalette {
  top: string;
  left: string;
  right: string;
  edge?: string;
}

export interface IsoBoxProps {
  /** Front-bottom corner. */
  x: number;
  y: number;
  /** Width runs to the right-back, depth to the left-back, height up. */
  w: number;
  d: number;
  h: number;
  palette: BoxPalette;
  /** Artwork painted on the right face, in local coords (0..w × 0..h). */
  right?: ReactNode;
  /** Artwork painted on the left face, in local coords (0..d × 0..h). */
  left?: ReactNode;
  /** Artwork painted on the top face, in local coords (0..w × 0..d). */
  top?: ReactNode;
  /** Draw a tuck flap line on the top face. */
  tuck?: boolean;
}

export function IsoBox({ x, y, w, d, h, palette, right, left, top, tuck }: IsoBoxProps) {
  const B: Pt = [x, y];
  const R: Pt = [x + w * COS, y - w * 0.5];
  const L: Pt = [x - d * COS, y - d * 0.5];
  const Bk: Pt = [R[0] + L[0] - x, R[1] + L[1] - y];
  const up = (p: Pt): Pt => [p[0], p[1] - h];
  const edge = palette.edge ?? 'rgb(11 31 51 / 0.12)';
  return (
    <g>
      <polygon points={pts(L, B, up(B), up(L))} fill={palette.left} />
      <polygon points={pts(B, R, up(R), up(B))} fill={palette.right} />
      <polygon points={pts(up(B), up(R), up(Bk), up(L))} fill={palette.top} />
      {left ? <g transform={`matrix(${COS},0.5,0,1,${L[0]},${L[1] - h})`}>{left}</g> : null}
      {right ? <g transform={`matrix(${COS},-0.5,0,1,${x},${y - h})`}>{right}</g> : null}
      {top ? <g transform={`matrix(${COS},-0.5,${-COS},-0.5,${x},${y - h})`}>{top}</g> : null}
      {tuck ? (
        <polyline
          points={pts(
            [up(B)[0] - d * 0.12 * COS, up(B)[1] - d * 0.12 * 0.5],
            [up(R)[0] - d * 0.12 * COS, up(R)[1] - d * 0.12 * 0.5],
          )}
          stroke={edge}
          strokeWidth={1}
          fill="none"
        />
      ) : null}
      <polyline points={pts(up(L), up(B), up(R))} stroke="rgb(255 255 255 / 0.35)" strokeWidth={1} fill="none" />
      <line x1={B[0]} y1={B[1]} x2={B[0]} y2={B[1] - h} stroke={edge} strokeWidth={1} />
    </g>
  );
}

/** Soft contact shadow under an object. */
export function Shadow({ cx, cy, rx, ry, opacity = 0.18 }: { cx: number; cy: number; rx: number; ry: number; opacity?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C.navy900} opacity={opacity} filter="url(#vp-blur)" />;
}

/** A simple abstract "Your Brand" mark: circle + two bars. */
export function BrandMark({
  x,
  y,
  s = 1,
  color,
  accent,
}: {
  x: number;
  y: number;
  s?: number;
  color: string;
  accent?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={9} fill="none" stroke={accent ?? color} strokeWidth={2.4} />
      <circle cx={0} cy={0} r={3.2} fill={accent ?? color} />
      <rect x={15} y={-6} width={34} height={5} rx={2.5} fill={color} />
      <rect x={15} y={3} width={22} height={3.5} rx={1.75} fill={color} opacity={0.6} />
    </g>
  );
}

/** Shared <defs>: blur for shadows, subtle grain-free backdrop gradient. */
export function ArtDefs({ id }: { id: string }) {
  return (
    <defs>
      <filter id="vp-blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={6} />
      </filter>
      <radialGradient id={`${id}-bg`} cx="50%" cy="38%" r="75%">
        <stop offset="0%" stopColor={C.white} />
        <stop offset="100%" stopColor={C.surface2} />
      </radialGradient>
      <linearGradient id={`${id}-film`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgb(255 255 255 / 0.9)" />
        <stop offset="100%" stopColor="rgb(227 233 241 / 0.75)" />
      </linearGradient>
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="rgb(194 237 237 / 0.55)" />
        <stop offset="45%" stopColor="rgb(255 255 255 / 0.85)" />
        <stop offset="100%" stopColor="rgb(148 166 188 / 0.45)" />
      </linearGradient>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={C.navy300} />
        <stop offset="35%" stopColor={C.navy50} />
        <stop offset="70%" stopColor={C.navy200} />
        <stop offset="100%" stopColor={C.navy400} />
      </linearGradient>
      <linearGradient id={`${id}-foil`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e9cf8a" />
        <stop offset="50%" stopColor="#c9a14a" />
        <stop offset="100%" stopColor="#f1dea6" />
      </linearGradient>
    </defs>
  );
}
