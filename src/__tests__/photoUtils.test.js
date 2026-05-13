// ─── photoUtils.test.js ──────────────────────────────────────────────────────
// Pure-function tests for the photoUtils module. The compression path itself
// requires a real Canvas/createImageBitmap, which jsdom does not provide —
// we cover the parts that are testable in isolation: size estimation,
// byte formatting, and data URL header validation.

import { describe, it, expect } from 'vitest';
import { estimatePhotoSize, formatBytes, isValidPhotoDataUrl } from '../photoUtils.js';

// ─── estimatePhotoSize ───────────────────────────────────────────────────────
describe('estimatePhotoSize', () => {
  it('returns 0 for non-string / non-data-url input', () => {
    expect(estimatePhotoSize(null)).toBe(0);
    expect(estimatePhotoSize(undefined)).toBe(0);
    expect(estimatePhotoSize('')).toBe(0);
    expect(estimatePhotoSize('hello')).toBe(0);
    expect(estimatePhotoSize('https://example.com/foo.jpg')).toBe(0);
    expect(estimatePhotoSize(42)).toBe(0);
  });

  it('approximates byte length from base64 payload', () => {
    // "AAAA" base64-decodes to 3 zero bytes.
    expect(estimatePhotoSize('data:image/jpeg;base64,AAAA')).toBe(3);
    // 8 chars no padding → 6 bytes
    expect(estimatePhotoSize('data:image/jpeg;base64,AAAAAAAA')).toBe(6);
  });

  it('subtracts padding "=" chars from the byte total', () => {
    // "QQ==" base64 = 1 byte (0x41 = "A"). length=4, padding=2.
    expect(estimatePhotoSize('data:image/jpeg;base64,QQ==')).toBe(1);
    // "QUI=" base64 = 2 bytes ("AB"). length=4, padding=1.
    expect(estimatePhotoSize('data:image/jpeg;base64,QUI=')).toBe(2);
  });

  it('returns 0 when no comma present', () => {
    expect(estimatePhotoSize('data:image/jpeg;base64')).toBe(0);
  });
});

// ─── formatBytes ─────────────────────────────────────────────────────────────
describe('formatBytes', () => {
  it('handles zero / negative / null', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(null)).toBe('0 B');
    expect(formatBytes(-100)).toBe('0 B');
  });

  it('shows bytes under 1 KB', () => {
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('shows whole KB under 1 MB', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(250 * 1024)).toBe('250 KB');
    expect(formatBytes(1024 * 1024 - 1)).toBe('1024 KB');
  });

  it('shows decimal MB at and above 1 MB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(Math.round(1.4 * 1024 * 1024))).toBe('1.4 MB');
    expect(formatBytes(10 * 1024 * 1024)).toBe('10.0 MB');
  });
});

// ─── isValidPhotoDataUrl ─────────────────────────────────────────────────────
describe('isValidPhotoDataUrl', () => {
  it('accepts jpeg, png, webp base64 data URLs', () => {
    expect(isValidPhotoDataUrl('data:image/jpeg;base64,AAAA')).toBe(true);
    expect(isValidPhotoDataUrl('data:image/png;base64,AAAA')).toBe(true);
    expect(isValidPhotoDataUrl('data:image/webp;base64,AAAA==')).toBe(true);
  });

  it('rejects other mime types', () => {
    expect(isValidPhotoDataUrl('data:image/gif;base64,AAAA')).toBe(false);
    expect(isValidPhotoDataUrl('data:image/svg+xml;base64,AAAA')).toBe(false);
    expect(isValidPhotoDataUrl('data:text/plain;base64,AAAA')).toBe(false);
  });

  it('rejects non-base64 encodings', () => {
    expect(isValidPhotoDataUrl('data:image/jpeg,raw')).toBe(false);
    expect(isValidPhotoDataUrl('data:image/jpeg;utf8,raw')).toBe(false);
  });

  it('rejects non-strings, plain URLs, and empty inputs', () => {
    expect(isValidPhotoDataUrl(null)).toBe(false);
    expect(isValidPhotoDataUrl('')).toBe(false);
    expect(isValidPhotoDataUrl(42)).toBe(false);
    expect(isValidPhotoDataUrl('https://example.com/foo.jpg')).toBe(false);
  });

  it('rejects data URLs containing characters outside the base64 alphabet', () => {
    expect(isValidPhotoDataUrl('data:image/jpeg;base64,AAA!')).toBe(false);
    expect(isValidPhotoDataUrl('data:image/jpeg;base64,AAA AAA')).toBe(false);
  });
});
