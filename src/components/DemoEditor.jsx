// ─── DemoEditor ────────────────────────────────────────────────────────────
// Minimal bottom-sheet for adding / editing / clearing a YouTube URL on
// one exercise. Paste URL, see preview, save. No timestamps, no photo —
// photo capture lives on its own button now.

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { parseYouTubeUrl, buildEmbedUrl } from '../demoUtils';
import { IX, ITrash } from '../icons';

export default function DemoEditor({ exerciseName, currentDemo, c, onSave, onClear, onClose }) {
  const [url, setUrl] = useState(currentDemo ? `https://www.youtube.com/watch?v=${currentDemo.videoId}` : '');
  const [error, setError] = useState('');

  // Parse URL live so the preview re-renders as the user pastes.
  const parsed = useMemo(() => parseYouTubeUrl(url), [url]);
  const previewSrc = parsed
    ? buildEmbedUrl({ videoId: parsed.videoId, autoplay: false })
    : '';

  const handleSave = () => {
    if (!parsed) {
      setError('That doesn’t look like a YouTube link. Try a youtube.com/watch, youtu.be, or youtube.com/shorts URL.');
      return;
    }
    onSave({
      videoId: parsed.videoId,
      // Schema fields kept for back-compat with older saved demos that
      // had loop start/end values; new demos play the full video.
      startSec: 0,
      endSec: 0,
      addedAt: currentDemo ? currentDemo.addedAt : new Date().toISOString(),
    });
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  // Lock body scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const fieldStyle = {
    width: '100%', background: c.card2, border: `1px solid ${c.border}`,
    borderRadius: 12, padding: '12px 14px',
    color: c.text, fontFamily: 'inherit', fontSize: 14,
    minHeight: 44, boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700, color: c.sub,
    letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6,
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        // Above the focused-exercise overlay (9200).
        zIndex: 9300,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: c.card, color: c.text,
          borderTopLeftRadius: 22, borderTopRightRadius: 22,
          padding: '14px 16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
          maxHeight: '92vh', overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          boxShadow: '0 -12px 40px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ width: 36, height: 4, background: c.border, borderRadius: 99, margin: '2px auto 14px' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.sub, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Form video
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
              {exerciseName}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: c.card2, border: 'none', borderRadius: 12,
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: c.sub, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            <IX />
          </button>
        </div>

        <label style={labelStyle}>YouTube URL</label>
        <input
          type="url"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          placeholder="https://www.youtube.com/watch?v=…"
          style={fieldStyle}
        />
        <div style={{ fontSize: 11, color: c.sub, marginTop: 6, lineHeight: 1.4 }}>
          Paste any YouTube link — watch, youtu.be, shorts, or embed.
          {parsed && <span style={{ color: c.accent, fontWeight: 700 }}> ✓ Detected: {parsed.videoId}</span>}
        </div>

        {parsed && (
          <div style={{ marginTop: 14, borderRadius: 14, overflow: 'hidden', background: '#000', aspectRatio: '16 / 9' }}>
            <iframe
              key={parsed.videoId}
              src={previewSrc}
              title="Preview"
              allow="encrypted-media; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>
        )}

        {error && (
          <div style={{ marginTop: 12, padding: '10px 12px', background: c.rs, color: c.r, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          {currentDemo && (
            <button
              onClick={handleClear}
              aria-label="Clear video"
              style={{
                background: c.rs, border: `1px solid ${c.r}33`,
                color: c.r, borderRadius: 14,
                padding: '0 16px', minHeight: 48,
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <ITrash /> Clear
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!parsed}
            style={{
              flex: 1,
              background: parsed ? c.accent : c.card2,
              color: parsed ? '#fff' : c.sub,
              border: 'none', borderRadius: 14,
              minHeight: 48,
              fontSize: 15, fontWeight: 800, cursor: parsed ? 'pointer' : 'default',
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
            }}
          >
            {currentDemo ? 'Save changes' : 'Add video'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
