'use client';

import { useEffect, useState } from 'react';
import type { Errors } from './kit';

/** Form state + dirty tracking + unsaved-changes guard shared by the catalog editors. */
export function useEditor<T>(initial: T) {
  const [value, setValue] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const dirty = JSON.stringify(value) !== saved;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    // In-app link clicks: confirm before leaving with unsaved edits.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download') || e.defaultPrevented) return;
      if (!window.confirm('You have unsaved changes. Leave without saving?')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', warn);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);

  const set = <K extends keyof T>(key: K, v: T[K]) => setValue((prev) => ({ ...prev, [key]: v }));
  const markSaved = (v: T) => setSaved(JSON.stringify(v));
  return { value, setValue, set, errors, setErrors, dirty, markSaved };
}
