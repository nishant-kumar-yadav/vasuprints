/** Content-signature check for artwork uploads (SCHEMA.md §6). Pure, so it is unit-tested directly. */
export const ALLOWED_UPLOAD_TYPES = {
  pdf: 'application/pdf',
  ai: 'application/postscript',
  eps: 'application/postscript',
  cdr: 'application/vnd.corel-draw',
  psd: 'image/vnd.adobe.photoshop',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  zip: 'application/zip',
} as const;

export type UploadExt = keyof typeof ALLOWED_UPLOAD_TYPES;

export function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i + 1).toLowerCase();
}

export function isAllowedExt(ext: string): ext is UploadExt {
  return Object.prototype.hasOwnProperty.call(ALLOWED_UPLOAD_TYPES, ext);
}

const startsWith = (buf: Uint8Array, bytes: number[], offset = 0) =>
  buf.length >= offset + bytes.length && bytes.every((b, i) => buf[offset + i] === b);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

const PDF = ascii('%PDF-');
const PS = ascii('%!PS-Adobe');
const EPS_BIN = [0xc5, 0xd0, 0xd3, 0xc6];
const ZIP = [0x50, 0x4b, 0x03, 0x04];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPG = [0xff, 0xd8, 0xff];

function looksLikeSvg(head: Uint8Array): boolean {
  const text = new TextDecoder('utf-8', { fatal: false }).decode(head).replace(/^﻿/, '');
  if (/<!ENTITY/i.test(text)) return false;
  // Skip XML declaration, comments and doctype, then require the root element to be <svg.
  const stripped = text
    .replace(/^\s*<\?xml[\s\S]*?\?>/i, '')
    .replace(/^\s*(<!--[\s\S]*?-->\s*)*/g, '')
    .replace(/^\s*<!DOCTYPE[^>]*>/i, '')
    .replace(/^\s*(<!--[\s\S]*?-->\s*)*/g, '');
  return /^\s*<svg[\s>]/i.test(stripped);
}

/** True when the file's first bytes match its extension. */
export function signatureMatches(ext: UploadExt, head: Uint8Array): boolean {
  switch (ext) {
    case 'pdf':
      return startsWith(head, PDF);
    case 'ai':
      return startsWith(head, PDF) || startsWith(head, PS) || startsWith(head, EPS_BIN);
    case 'eps':
      return startsWith(head, PS) || startsWith(head, EPS_BIN);
    case 'cdr':
      return (startsWith(head, ascii('RIFF')) && startsWith(head, ascii('CDR'), 8)) || startsWith(head, ZIP);
    case 'psd':
      return startsWith(head, ascii('8BPS'));
    case 'png':
      return startsWith(head, PNG);
    case 'jpg':
    case 'jpeg':
      return startsWith(head, JPG);
    case 'tif':
    case 'tiff':
      return startsWith(head, [0x49, 0x49, 0x2a, 0x00]) || startsWith(head, [0x4d, 0x4d, 0x00, 0x2a]);
    case 'zip':
      return startsWith(head, ZIP);
    case 'svg':
      return looksLikeSvg(head);
  }
}

/** Display-safe original name: strips paths and control characters. */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'file';
   
  return base.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 200) || 'file';
}
