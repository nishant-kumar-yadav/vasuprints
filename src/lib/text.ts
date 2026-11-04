/** Lower-case a name for use mid-sentence, keeping acronyms: "SBS Boxes" → "SBS boxes", "FMCG & Retail" → "FMCG & retail". */
export function lc(name: string): string {
  return name
    .split(' ')
    .map((w) => (/[A-Z].*[A-Z]/.test(w) ? w : w.toLowerCase()))
    .join(' ');
}
