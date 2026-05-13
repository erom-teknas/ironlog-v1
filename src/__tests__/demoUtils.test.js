// ─── demoUtils.test.js ───────────────────────────────────────────────────────
// Tests for the YouTube URL parser, timestamp parser, and embed URL builder.
// All pure functions — no DOM, no network.

import { describe, it, expect } from 'vitest';
import {
  parseYouTubeUrl, parseTimestamp, formatTimestamp,
  buildEmbedUrl, getYouTubeThumbnail, urlToDemoRecord,
} from '../demoUtils.js';

// ─── parseYouTubeUrl ─────────────────────────────────────────────────────────
describe('parseYouTubeUrl', () => {
  it('parses standard watch URLs', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))
      .toEqual({ videoId: 'dQw4w9WgXcQ', suggestedStartSec: null });
  });

  it('parses youtu.be short links', () => {
    expect(parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ'))
      .toEqual({ videoId: 'dQw4w9WgXcQ', suggestedStartSec: null });
  });

  it('parses /shorts/ URLs', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/shorts/abc123XYZ_-'))
      .toEqual({ videoId: 'abc123XYZ_-', suggestedStartSec: null });
  });

  it('parses /embed/ URLs', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ'))
      .toEqual({ videoId: 'dQw4w9WgXcQ', suggestedStartSec: null });
  });

  it('parses m.youtube.com URLs', () => {
    expect(parseYouTubeUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ'))
      .toEqual({ videoId: 'dQw4w9WgXcQ', suggestedStartSec: null });
  });

  it('captures ?t=83s as suggestedStartSec', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=83s'))
      .toEqual({ videoId: 'dQw4w9WgXcQ', suggestedStartSec: 83 });
  });

  it('captures ?t=1m23s as suggestedStartSec', () => {
    expect(parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ?t=1m23s'))
      .toEqual({ videoId: 'dQw4w9WgXcQ', suggestedStartSec: 83 });
  });

  it('captures bare ?t=83', () => {
    expect(parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ?t=83'))
      .toEqual({ videoId: 'dQw4w9WgXcQ', suggestedStartSec: 83 });
  });

  it('captures ?start=83 from embed URLs', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ?start=83'))
      .toEqual({ videoId: 'dQw4w9WgXcQ', suggestedStartSec: 83 });
  });

  it('handles extra params alongside v=', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ&list=foo'))
      .toEqual({ videoId: 'dQw4w9WgXcQ', suggestedStartSec: null });
  });

  it('trims surrounding whitespace', () => {
    expect(parseYouTubeUrl('  https://youtu.be/dQw4w9WgXcQ  '))
      .toEqual({ videoId: 'dQw4w9WgXcQ', suggestedStartSec: null });
  });

  it('returns null for non-YouTube URLs', () => {
    expect(parseYouTubeUrl('https://vimeo.com/123456')).toBeNull();
    expect(parseYouTubeUrl('https://example.com')).toBeNull();
  });

  it('returns null for empty / non-string input', () => {
    expect(parseYouTubeUrl('')).toBeNull();
    expect(parseYouTubeUrl(null)).toBeNull();
    expect(parseYouTubeUrl(undefined)).toBeNull();
    expect(parseYouTubeUrl(42)).toBeNull();
  });

  it('returns null for bare 11-char strings (must be a URL)', () => {
    // Bare IDs without a URL host are rejected to keep typos out of the store.
    expect(parseYouTubeUrl('dQw4w9WgXcQ')).toBeNull();
  });
});

// ─── parseTimestamp ──────────────────────────────────────────────────────────
describe('parseTimestamp', () => {
  it('parses plain integer seconds', () => {
    expect(parseTimestamp('83')).toBe(83);
    expect(parseTimestamp('0')).toBe(0);
  });

  it('parses h/m/s suffix forms', () => {
    expect(parseTimestamp('83s')).toBe(83);
    expect(parseTimestamp('1m23s')).toBe(83);
    expect(parseTimestamp('1h2m3s')).toBe(3723);
    expect(parseTimestamp('2m')).toBe(120);
    expect(parseTimestamp('30S')).toBe(30); // case-insensitive
  });

  it('parses colon forms', () => {
    expect(parseTimestamp('1:23')).toBe(83);
    expect(parseTimestamp('1:02:03')).toBe(3723);
    expect(parseTimestamp('0:00')).toBe(0);
  });

  it('returns null for garbage input', () => {
    expect(parseTimestamp('abc')).toBeNull();
    expect(parseTimestamp('')).toBeNull();
    expect(parseTimestamp(null)).toBeNull();
    expect(parseTimestamp('1:2:3:4')).toBeNull();
  });
});

// ─── formatTimestamp ─────────────────────────────────────────────────────────
describe('formatTimestamp', () => {
  it('formats short durations as m:ss', () => {
    expect(formatTimestamp(83)).toBe('1:23');
    expect(formatTimestamp(5)).toBe('0:05');
    expect(formatTimestamp(60)).toBe('1:00');
  });

  it('formats long durations as h:mm:ss', () => {
    expect(formatTimestamp(3723)).toBe('1:02:03');
    expect(formatTimestamp(3600)).toBe('1:00:00');
  });

  it('returns empty string for null / 0 / negative', () => {
    expect(formatTimestamp(0)).toBe('');
    expect(formatTimestamp(null)).toBe('');
    expect(formatTimestamp(-5)).toBe('');
  });
});

// ─── buildEmbedUrl ───────────────────────────────────────────────────────────
describe('buildEmbedUrl', () => {
  it('returns "" for missing videoId', () => {
    expect(buildEmbedUrl({})).toBe('');
    expect(buildEmbedUrl({ videoId: '' })).toBe('');
  });

  it('builds a basic autoplay-muted embed on the nocookie domain', () => {
    const url = buildEmbedUrl({ videoId: 'dQw4w9WgXcQ' });
    // nocookie domain is required for reliable embedding inside iOS PWA WKWebView
    expect(url).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(url).toContain('autoplay=1');
    expect(url).toContain('mute=1');
    expect(url).toContain('playsinline=1');
  });

  it('omits autoplay when autoplay=false', () => {
    const url = buildEmbedUrl({ videoId: 'dQw4w9WgXcQ', autoplay: false });
    expect(url).not.toContain('autoplay=1');
  });

  it('sets start when startSec > 0', () => {
    const url = buildEmbedUrl({ videoId: 'dQw4w9WgXcQ', startSec: 83 });
    expect(url).toContain('start=83');
  });

  it('sets both start and end when end > start', () => {
    const url = buildEmbedUrl({ videoId: 'dQw4w9WgXcQ', startSec: 83, endSec: 110 });
    expect(url).toContain('start=83');
    expect(url).toContain('end=110');
  });

  it('always sets loop=1 AND playlist=<videoId> (YouTube single-video loop quirk)', () => {
    // Loop is the default for every demo — without playlist=<id>, loop=1
    // silently does nothing for single videos.
    const url = buildEmbedUrl({ videoId: 'dQw4w9WgXcQ' });
    expect(url).toContain('loop=1');
    expect(url).toContain('playlist=dQw4w9WgXcQ');
  });

  it('loops with a segment when both start and end are set', () => {
    const url = buildEmbedUrl({ videoId: 'dQw4w9WgXcQ', startSec: 83, endSec: 110 });
    expect(url).toContain('start=83');
    expect(url).toContain('end=110');
    expect(url).toContain('loop=1');
  });

  it('loops the whole video when only startSec is set', () => {
    const url = buildEmbedUrl({ videoId: 'dQw4w9WgXcQ', startSec: 83 });
    expect(url).toContain('start=83');
    expect(url).toContain('loop=1');
  });

  it('ignores endSec when it is <= startSec but still loops', () => {
    const url = buildEmbedUrl({ videoId: 'dQw4w9WgXcQ', startSec: 110, endSec: 83 });
    expect(url).not.toContain('end=83');
    expect(url).toContain('loop=1');
  });
});

// ─── getYouTubeThumbnail ─────────────────────────────────────────────────────
describe('getYouTubeThumbnail', () => {
  it('returns hqdefault URL by default', () => {
    expect(getYouTubeThumbnail('dQw4w9WgXcQ'))
      .toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });

  it('honors quality argument', () => {
    expect(getYouTubeThumbnail('dQw4w9WgXcQ', 'maxresdefault'))
      .toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
  });

  it('returns "" for missing id', () => {
    expect(getYouTubeThumbnail('')).toBe('');
    expect(getYouTubeThumbnail(null)).toBe('');
  });
});

// ─── urlToDemoRecord ─────────────────────────────────────────────────────────
describe('urlToDemoRecord', () => {
  it('returns a normalized record from a watch URL', () => {
    const r = urlToDemoRecord('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=83s');
    expect(r.videoId).toBe('dQw4w9WgXcQ');
    expect(r.startSec).toBe(83);
    expect(r.endSec).toBe(0);
    expect(typeof r.addedAt).toBe('string');
  });

  it('returns null for non-YouTube URLs', () => {
    expect(urlToDemoRecord('https://vimeo.com/1')).toBeNull();
  });
});
