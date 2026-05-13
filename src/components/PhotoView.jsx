// ─── PhotoView ──────────────────────────────────────────────────────────────
// Fullscreen image viewer with Replace and Remove buttons inline.
// No video, no toggle — just the photo and two actions.
//
// Replace works by triggering a hidden file input; the parent supplies the
// compressed-photo callback so all the compression logic stays in one place
// (LogPage owns the file input ref).

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IX, ITrash, ICamera } from '../icons';

export default function PhotoView({ photo, exerciseName, c, onClose, onReplace, onRemove }) {
  // Lock body scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Esc key closes.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!photo || !photo.dataUrl) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.92)',
        // Above focused-exercise overlay (9200), below plate picker (9400).
        zIndex: 9300,
        display: 'flex', flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Header */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', color: '#fff' }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: 'rgba(255,255,255,0.12)', border: 'none',
            borderRadius: 12, color: '#fff',
            width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <IX />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Equipment</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exerciseName}</div>
        </div>
      </div>

      {/* Photo — fills available space, contains aspect */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 12px',
        }}
      >
        <img
          src={photo.dataUrl}
          alt={`${exerciseName} equipment`}
          style={{
            maxWidth: '100%', maxHeight: '100%',
            borderRadius: 14, objectFit: 'contain',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
          }}
        />
      </div>

      {/* Footer actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '10px 16px 14px',
          display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <button
          onClick={onRemove}
          aria-label="Remove photo"
          style={{
            background: 'rgba(255,80,80,0.18)', border: '1px solid rgba(255,80,80,0.4)',
            color: '#ff8a8a', borderRadius: 12,
            padding: '0 14px', minHeight: 44,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <ITrash /> Remove
        </button>
        <button
          onClick={onReplace}
          aria-label="Replace photo"
          style={{
            background: 'rgba(255,255,255,0.18)', border: 'none',
            color: '#fff', borderRadius: 12,
            padding: '0 16px', minHeight: 44,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <ICamera /> Replace
        </button>
      </div>
    </div>,
    document.body
  );
}
