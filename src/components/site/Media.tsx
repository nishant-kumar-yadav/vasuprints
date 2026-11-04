import Image from 'next/image';
import type { ProductImage } from '@/lib/catalog/view';
import { cn } from '@/lib/cn';
import { Art, type ArtProps } from './art/Art';

/**
 * A photo when one has been uploaded in the admin, otherwise the brand illustration for `k`.
 * Always fills its (relatively positioned, sized) parent.
 */
export function Media({
  image,
  k,
  view,
  sizes,
  priority,
  className,
  label,
  fit,
  bg,
}: {
  image?: ProductImage | null;
  k: string;
  view?: number;
  sizes: string;
  priority?: boolean;
  className?: string;
  label?: string;
  fit?: ArtProps['fit'];
  bg?: ArtProps['bg'];
}) {
  if (image) {
    return (
      <Image
        src={image.src}
        alt={label === undefined ? '' : image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(fit === 'meet' ? 'object-contain' : 'object-cover', className)}
      />
    );
  }
  return <Art k={k} view={view} label={label} fit={fit} bg={bg} className={className} />;
}
