'use client';

import { useEffect } from 'react';
import { captureSource } from '@/lib/client/source';

export function SourceCapture() {
  useEffect(() => captureSource(), []);
  return null;
}
