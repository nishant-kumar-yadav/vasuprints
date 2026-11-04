import { OG_SIZE, ogCard } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'VasuPrint: custom printing and packaging';

export default function Image() {
  return ogCard({
    eyebrow: 'Custom printing & packaging',
    title: 'Packaging, stickers, DTF transfers and tags for your brand',
    text: 'Made to your size, material and quantity.',
  });
}
