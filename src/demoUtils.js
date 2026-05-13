// ─── YouTube demo URL helpers ────────────────────────────────────────────────
// Pure functions for parsing YouTube URLs, building embed URLs that loop a
// specific segment (start/end seconds), and resolving thumbnails. No network
// calls here — thumbnail fetching happens at the call site so this module
// stays fully testable.

// 11-char video-ID matcher used everywhere YouTube exposes IDs.
const ID_RE = /([A-Za-z0-9_-]{11})/;

// Match the URL hosts we actually care about. Anything else returns null.
const HOSTS = [
  // youtu.be/<id>
  /^https?:\/\/youtu\.be\/([A-Za-z0-9_-]{11})/i,
  // youtube.com/watch?v=<id>  (handles m.youtube.com, music.youtube.com too)
  /^https?:\/\/(?:www\.|m\.|music\.)?youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})/i,
  // youtube.com/shorts/<id>
  /^https?:\/\/(?:www\.|m\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/i,
  // youtube.com/embed/<id>
  /^https?:\/\/(?:www\.|m\.)?youtube\.com\/embed\/([A-Za-z0-9_-]{11})/i,
  // youtube.com/live/<id>
  /^https?:\/\/(?:www\.|m\.)?youtube\.com\/live\/([A-Za-z0-9_-]{11})/i,
];

/**
 * Parse a timestamp like "83", "83s", "1m23s", "2h5m7s", "01:23", "1:02:03"
 * into integer seconds. Returns null on garbage input.
 */
export function parseTimestamp(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;

  // Plain integer seconds: "83"
  if (/^\d+$/.test(s)) return parseInt(s, 10);

  // "1h2m3s" / "2m5s" / "30s" forms
  const hms = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i.exec(s);
  if (hms && (hms[1] || hms[2] || hms[3])) {
    const h = parseInt(hms[1] || '0', 10);
    const m = parseInt(hms[2] || '0', 10);
    const sec = parseInt(hms[3] || '0', 10);
    return h * 3600 + m * 60 + sec;
  }

  // Colon forms: "1:23", "1:02:03"
  const colon = s.split(':');
  if (colon.length >= 2 && colon.length <= 3 && colon.every(p => /^\d+$/.test(p))) {
    if (colon.length === 2) {
      return parseInt(colon[0], 10) * 60 + parseInt(colon[1], 10);
    }
    return parseInt(colon[0], 10) * 3600 + parseInt(colon[1], 10) * 60 + parseInt(colon[2], 10);
  }

  return null;
}

/**
 * Format integer seconds back into a "1:23" / "1:02:03" string for display.
 * Returns "" for null / 0 / negative.
 */
export function formatTimestamp(secs) {
  const n = parseInt(secs, 10);
  if (!n || n < 0) return '';
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const s = n % 60;
  const pad = (x) => String(x).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Parse a YouTube URL and return { videoId, suggestedStartSec } or null.
 * suggestedStartSec is filled if the URL includes a ?t=... or #t=... param.
 *
 * Accepts: youtu.be, youtube.com/watch, /shorts/, /embed/, /live/, m.* and
 * music.* subdomains. Returns null for anything else (including bare IDs —
 * we want explicit URLs to keep typo-pasted garbage out of the data model).
 */
export function parseYouTubeUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  let videoId = null;
  for (const re of HOSTS) {
    const m = re.exec(trimmed);
    if (m) { videoId = m[1]; break; }
  }
  if (!videoId) return null;

  // Pull start time from ?t=... | &t=... | #t=...
  let suggestedStartSec = null;
  const tMatch = /[?&#]t=([^&#]+)/.exec(trimmed);
  if (tMatch) suggestedStartSec = parseTimestamp(decodeURIComponent(tMatch[1]));
  // Also support ?start=83 (used in embed URLs)
  if (suggestedStartSec == null) {
    const sMatch = /[?&]start=(\d+)/.exec(trimmed);
    if (sMatch) suggestedStartSec = parseInt(sMatch[1], 10);
  }

  return { videoId, suggestedStartSec: suggestedStartSec || null };
}

/**
 * Build the YouTube iframe `src` URL for a demo.
 *
 *  - mute=1 and playsinline=1 are required for autoplay to work in modern
 *    mobile browsers without a user gesture.
 *  - loop=1 + playlist=<videoId> is YouTube's documented quirk: loop=1 only
 *    works for a single video if you ALSO set playlist to that video's ID.
 *    We always loop now — the primary use case is YouTube Shorts, which
 *    are short enough that endless loop is the desired behavior.
 *  - startSec / endSec are still honored if present in older saved demos,
 *    so previously-trimmed segments keep working after this change.
 *  - modestbranding and rel=0 reduce the "watch more" suggestion overlay.
 */
export function buildEmbedUrl({ videoId, startSec, endSec, autoplay = true }) {
  if (!videoId) return '';
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  params.set('mute', '1');
  params.set('playsinline', '1');
  params.set('rel', '0');
  params.set('modestbranding', '1');

  const start = parseInt(startSec, 10);
  const end = parseInt(endSec, 10);
  if (start > 0) params.set('start', String(start));
  if (end > 0 && end > start) params.set('end', String(end));

  // Always loop. The playlist=<videoId> param is required for loop=1 to
  // actually work on a single video — without it, the player stops at
  // the end (or at endSec) and just shows the "Watch again" overlay.
  params.set('loop', '1');
  params.set('playlist', videoId);

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * YouTube serves a public, hotlink-friendly thumbnail per video at a few
 * resolutions. hqdefault is the safest bet — it exists for every video,
 * including very old uploads where maxresdefault may 404.
 */
export function getYouTubeThumbnail(videoId, quality = 'hqdefault') {
  if (!videoId) return '';
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Convenience: take whatever the user pasted and return a normalized demo
 * record (or null). startSec is taken from the URL's ?t= param if present.
 */
export function urlToDemoRecord(url) {
  const parsed = parseYouTubeUrl(url);
  if (!parsed) return null;
  return {
    videoId: parsed.videoId,
    startSec: parsed.suggestedStartSec || 0,
    endSec: 0,
    addedAt: new Date().toISOString(),
  };
}
