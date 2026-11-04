import { useId } from 'react';
import { cn } from '@/lib/cn';
import { ArtDefs, C } from './primitives';
import {
  CartonsScene,
  DieCutScene,
  DtfSheetScene,
  HangTagsScene,
  HeroScene,
  JarScene,
  LabelRollScene,
  PlasticTagsScene,
  TshirtScene,
  TumblerScene,
} from './scenes';

/**
 * Brand-styled illustrations used in place of photography for v1.
 * Drop real images into `public/images/...` later and swap <Art> for <Image>.
 */
export type ArtKey =
  | 'hero'
  | 'packaging-boxes'
  | 'custom-stickers'
  | 'dtf-stickers'
  | 'uv-dtf-stickers'
  | 'custom-tags'
  | 'mono-carton-boxes'
  | 'sbs-boxes'
  | 'duplex-boxes'
  | 'paper-gumming-stickers'
  | 'vinyl-gumming-stickers'
  | 'pvc-gumming-stickers'
  | 'die-cut-stickers'
  | 'dtf-transfer-stickers'
  | 'dtf-heat-transfer-stickers'
  | 'uv-dtf-sticker-printing'
  | 'custom-uv-transfer-stickers'
  | 'custom-hang-tags'
  | 'plastic-tags';

function Scene({ k, g }: { k: string; g: string }) {
  switch (k) {
    case 'hero':
      return <HeroScene g={g} />;
    case 'packaging-boxes':
    case 'mono-carton-boxes':
      return <CartonsScene style="mono" g={g} />;
    case 'sbs-boxes':
      return <CartonsScene style="sbs" g={g} />;
    case 'duplex-boxes':
      return <CartonsScene style="duplex" g={g} />;
    case 'paper-gumming-stickers':
      return <LabelRollScene style="paper" g={g} />;
    case 'custom-stickers':
    case 'vinyl-gumming-stickers':
      return <LabelRollScene style="vinyl" g={g} />;
    case 'pvc-gumming-stickers':
      return <LabelRollScene style="pvc" g={g} />;
    case 'die-cut-stickers':
      return <DieCutScene />;
    case 'dtf-stickers':
    case 'dtf-heat-transfer-stickers':
      return <TshirtScene g={g} />;
    case 'dtf-transfer-stickers':
      return <DtfSheetScene g={g} />;
    case 'uv-dtf-stickers':
    case 'uv-dtf-sticker-printing':
      return <TumblerScene g={g} />;
    case 'custom-uv-transfer-stickers':
      return <JarScene g={g} />;
    case 'custom-tags':
    case 'custom-hang-tags':
      return <HangTagsScene g={g} />;
    case 'plastic-tags':
      return <PlasticTagsScene g={g} />;
    default:
      return <HeroScene g={g} />;
  }
}

/** Gallery "views": the same scene framed differently, like close-ups from one shoot. */
const views = ['0 0 400 300', '70 50 260 195', '0 30 330 248', '130 80 240 180'] as const;

export interface ArtProps {
  k: ArtKey | string;
  /** 0–3 picks a framing for galleries. */
  view?: number;
  /** Accessible description; omit for decorative use. */
  label?: string;
  className?: string;
  /** Background style behind the scene. */
  bg?: 'studio' | 'none' | 'navy';
  /** 'slice' fills and crops (default); 'meet' shows the whole scene. */
  fit?: 'slice' | 'meet';
}

export function Art({ k, view = 0, label, className, bg = 'studio', fit = 'slice' }: ArtProps) {
  const g = useId().replace(/:/g, '');
  const vb = views[view % views.length] ?? views[0];
  return (
    <svg
      viewBox={vb}
      preserveAspectRatio={`xMidYMid ${fit}`}
      className={cn('block h-full w-full overflow-hidden', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <ArtDefs id={g} />
      {bg === 'studio' ? <rect x={-200} y={-200} width={800} height={700} fill={`url(#${g}-bg)`} /> : null}
      {bg === 'navy' ? <rect x={-200} y={-200} width={800} height={700} fill={C.navy800} /> : null}
      <Scene k={k} g={g} />
    </svg>
  );
}
