import { describe, expect, it } from 'vitest';
import { csvCell, csvRow } from '@/lib/admin/csv';
import { imageInfo } from '@/lib/media/image-info';
import { RateLimiter } from '@/lib/security/rate-limit';
import { sanitizeFileName, signatureMatches } from '@/lib/uploads/sniff';

describe('CSV export', () => {
  it('neutralises spreadsheet formulas', () => {
    expect(csvCell('=HYPERLINK("http://evil","x")')).toBe(`"'=HYPERLINK(""http://evil"",""x"")"`);
    expect(csvCell('+91 98765')).toBe("'+91 98765");
    expect(csvCell('-5')).toBe("'-5");
    expect(csvCell('@SUM(A1)')).toBe("'@SUM(A1)");
  });
  it('quotes commas, quotes and newlines per RFC 4180', () => {
    expect(csvRow(['a,b', 'say "hi"', 'line\nbreak', 3])).toBe('"a,b","say ""hi""","line\nbreak",3');
  });
});

describe('rate limiter', () => {
  it('blocks after the limit and resets after the window', () => {
    const rl = new RateLimiter(2, 1000);
    expect(rl.hit('k', 0).ok).toBe(true);
    expect(rl.hit('k', 10).ok).toBe(true);
    const third = rl.hit('k', 20);
    expect(third.ok).toBe(false);
    expect(rl.hit('k', 1001).ok).toBe(true);
  });
});

describe('upload sniffing', () => {
  it('matches signatures to extensions', () => {
    expect(signatureMatches('pdf', Buffer.from('%PDF-1.7'))).toBe(true);
    expect(signatureMatches('png', Buffer.from('%PDF-1.7'))).toBe(false);
    expect(signatureMatches('png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
  });
  it('strips paths and control characters from names', () => {
    expect(sanitizeFileName('../../etc/passwd')).not.toContain('/');
    expect(sanitizeFileName('a\u0000b.pdf')).toBe('ab.pdf');
  });
});

describe('image header parsing', () => {
  it('reads PNG dimensions', () => {
    const png = Buffer.alloc(33);
    png.writeUInt32BE(0x89504e47, 0);
    png.write('IHDR', 12, 'ascii');
    png.writeUInt32BE(1600, 16);
    png.writeUInt32BE(1200, 20);
    expect(imageInfo(png)).toEqual({ kind: 'png', width: 1600, height: 1200 });
  });
  it('rejects non-images', () => {
    expect(imageInfo(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull();
  });
});
