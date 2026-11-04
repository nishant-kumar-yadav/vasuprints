'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { business, isSet } from '@/config/business';
import { DielineFrame } from './motifs/Motifs';

/** Click-to-load map (privacy + performance): no Google request until the visitor asks. */
export function MapEmbed() {
  const [loaded, setLoaded] = useState(false);
  const ready = isSet(business.mapsEmbedUrl);
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface-2 sm:aspect-[21/9]">
      {loaded && ready ? (
        <iframe src={business.mapsEmbedUrl} title="VasuPrint location map" className="size-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-4 p-6 text-center">
          <DielineFrame className="absolute inset-0 m-auto h-[80%] opacity-20" />
          <span className="relative inline-flex size-12 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
            <MapPin className="size-6" aria-hidden />
          </span>
          {ready ? (
            <Button variant="outline" onClick={() => setLoaded(true)} className="relative">
              Load map
            </Button>
          ) : (
            <p className="relative text-[15px] text-text-secondary">Map will appear here once the address is confirmed.</p>
          )}
        </div>
      )}
    </div>
  );
}
