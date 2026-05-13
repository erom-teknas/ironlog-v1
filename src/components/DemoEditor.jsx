// ─── DemoEditor ────────────────────────────────────────────────────────────
// Modal for adding / editing / clearing a YouTube demo for one exercise.
//
// Flow: user pastes a URL, we parse it on blur or "Use this video" tap, then
// they can optionally set a loop segment (start + end timestamps). A live
// iframe preview renders below the URL field once the URL is valid so the
// user can verify they pasted the right link before saving.
//
// Timestamps accept loose input — "1:23", "83", "1m23s" all parse to 83s.
// We re-render the parsed seconds in mm:ss next to each field so the user
// can see what we understood.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { parseYouTubeUrl, buildEmbedUrl } from '../demoUtils';
import { compressPhotoToDataURL, estimatePhotoSize, formatBytes } from '../photoUtils';
import { IX, ITrash, ICamera } from '../icons';

export default function DemoEditor({
  exerciseName, currentDemo, currentPhoto, c,
  onSave, onClear, onSavePhoto, onClearPhoto, onClose,
}) {
  const [url, setUrl] = useState(currentDemo ? `https://www.youtube.com/watch?v=${currentDemo.videoId}` : '');
  const [error, setError] = useState('');
  // Photo state — separate from video so they're managed independently.
  // localPhoto holds either the existing data URL (on open) or a freshly
  // captured/compressed one (after picking a file).
  const [localPhoto, setLocalPhoto] = useState(currentPhoto ? currentPhoto.dataUrl : null);
  const [photoDirty, setPhotoDirty] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);

  // Parse URL live so the preview re-renders as the user pastes.
  const parsed = useMemo(() => parseYouTubeUrl(url), [url]);

  const previewSrc = parsed
    ? buildEmbedUrl({ videoId: parsed.videoId, autoplay: false })
    : '';

  // Commit any photo change first — separate concern from video save, but we
  // batch both into one Save tap so the user has a single "done" gesture.
  const commitPhoto = () => {
    if (!photoDirty) return;
    if (localPhoto) {
      onSavePhoto && onSavePhoto({
        dataUrl: localPhoto,
        addedAt: currentPhoto ? currentPhoto.addedAt : new Date().toISOString(),
      });
    } else if (currentPhoto) {
      onClearPhoto && onClearPhoto();
    }
  };

  const handleSave = () => {
    // Pure-photo edits should be allowed without requiring a video URL.
    if (!url.trim()) {
      commitPhoto();
      onClose();
      return;
    }
    if (!parsed) {
      setError('That doesn’t look like a YouTube link. Try a youtube.com/watch, youtu.be, or youtube.com/shorts URL.');
      return;
    }
    onSave({
      videoId: parsed.videoId,
      // Keep the schema fields so older saved demos with start/end still
      // play correctly, but new ones don't set them — full-video loop.
      startSec: 0,
      endSec: 0,
      addedAt: currentDemo ? currentDemo.addedAt : new Date().toISOString(),
    });
    commitPhoto();
    onClose();
  };

  const handleClear = () => {
    onClear();
    // Don't clear photo here — separate concern, separate button.
    onClose();
  };

  // Photo handlers ───────────────────────────────────────────────────────────
  const onPickPhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // reset so picking the same file again still fires onChange
    if (!file) return;
    setPhotoBusy(true);
    setPhotoError('');
    try {
      const dataUrl = await compressPhotoToDataURL(file);
      setLocalPhoto(dataUrl);
      setPhotoDirty(true);
    } catch (err) {
      setPhotoError(err && err.message ? err.message : 'Could not load that photo.');
    } finally {
      setPhotoBusy(false);
    }
  };
  const removePhoto = () => {
    setLocalPhoto(null);
    setPhotoDirty(true);
    setPhotoError('');
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
        // Must sit above the focused-exercise overlay (zIndex 9200).
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
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, background: c.border, borderRadius: 99, margin: '2px auto 14px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.sub, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Form demo
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

        {/* URL field */}
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

        {/* Live preview */}
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

        {/* No loop-start/end inputs anymore — the whole video loops by default,
            which is what you want for Shorts (the primary use case). Saved
            demos that already have start/end will keep honoring them. */}
        {parsed && (
          <div style={{ fontSize: 11, color: c.sub, marginTop: 10, lineHeight: 1.4 }}>
            Video will autoplay muted and loop.
          </div>
        )}

        {error && (
          <div style={{ marginTop: 12, padding: '10px 12px', background: c.rs, color: c.r, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* ── Equipment photo section ─────────────────────────────────── */}
        <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
          <label style={labelStyle}>Equipment photo</label>
          <div style={{ fontSize: 11, color: c.sub, marginBottom: 10, lineHeight: 1.4 }}>
            Snap the machine, the pin setting, the bench angle — anything that
            helps you remember the setup next session.
          </div>

          {/* Hidden file input — capture="environment" lets iOS show
              "Take Photo / Choose from Library" sheet directly. */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPickPhoto}
            style={{ display: 'none' }}
          />

          {localPhoto ? (
            <div style={{
              position: 'relative',
              borderRadius: 14, overflow: 'hidden',
              background: '#000',
              border: `1px solid ${c.border}`,
            }}>
              <img
                src={localPhoto}
                alt={`${exerciseName} equipment`}
                style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'contain', background: '#000' }}
              />
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                padding: '8px 10px',
                display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                  ≈ {formatBytes(estimatePhotoSize(localPhoto))}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={photoBusy}
                    style={{
                      background: 'rgba(255,255,255,0.18)', border: 'none',
                      color: '#fff', borderRadius: 10,
                      padding: '0 12px', minHeight: 36,
                      fontSize: 12, fontWeight: 700, cursor: photoBusy ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Replace
                  </button>
                  <button
                    onClick={removePhoto}
                    disabled={photoBusy}
                    style={{
                      background: 'rgba(255,80,80,0.7)', border: 'none',
                      color: '#fff', borderRadius: 10,
                      padding: '0 12px', minHeight: 36,
                      fontSize: 12, fontWeight: 700, cursor: photoBusy ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={photoBusy}
              style={{
                width: '100%', minHeight: 80,
                background: c.card2, border: `1.5px dashed ${c.border}`,
                borderRadius: 14, color: c.sub,
                fontSize: 13, fontWeight: 700, cursor: photoBusy ? 'default' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <ICamera /> {photoBusy ? 'Processing…' : 'Take or choose photo'}
            </button>
          )}

          {photoError && (
            <div style={{ marginTop: 10, padding: '8px 10px', background: c.rs, color: c.r, borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
              {photoError}
            </div>
          )}
        </div>

        {/* Action buttons */}
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
              <ITrash /> Video
            </button>
          )}
          {(() => {
            // Save is enabled when either: a valid video URL is parsed, the
            // photo has been changed, or the URL field is empty AND something
            // existed before (i.e. the user is intentionally not editing video).
            const canSave = !!parsed || photoDirty || (!url.trim() && (currentDemo || currentPhoto));
            const label = currentDemo || currentPhoto ? 'Save changes' : 'Add';
            return (
              <button
                onClick={handleSave}
                disabled={!canSave}
                style={{
                  flex: 1,
                  background: canSave ? c.accent : c.card2,
                  color: canSave ? '#fff' : c.sub,
                  border: 'none', borderRadius: 14,
                  minHeight: 48,
                  fontSize: 15, fontWeight: 800, cursor: canSave ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                }}
              >
                {label}
              </button>
            );
          })()}
        </div>
      </div>
    </div>,
    document.body
  );
}
