// ─── DemoPlayer ────────────────────────────────────────────────────────────
// Full-screen modal that plays a YouTube demo for one exercise.
// Renders via portal so it overlays the LogPage without z-index gymnastics.
//
// Implementation notes:
//  - We blank `src` on unmount before removing the iframe. Without this,
//    Safari keeps the YouTube player audio context alive for a few hundred
//    ms after teardown — annoying when the user closes the modal mid-set.
//  - Backdrop tap closes. We do NOT close on iframe-tap because that would
//    eat YouTube's own controls.
//  - The "Open in YouTube" affordance is the fallback for cases where the
//    creator has disabled embedding — the embed iframe just shows a white
//    error pane and there's nothing we can do client-side to detect that.

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildEmbedUrl } from '../demoUtils';
import { IX, IPlay, ICamera } from '../icons';

export default function DemoPlayer({ demo, photo, exerciseName, c, onClose, onEdit }) {
  const iframeRef = useRef(null);

  // If both are set, default to PHOTO first — matches the user's stated use
  // case ("glance to remember which machine"). Video is one tap away.
  const hasVideo = !!(demo && demo.videoId);
  const hasPhoto = !!(photo && photo.dataUrl);
  const [view, setView] = useState(hasPhoto ? 'photo' : 'video');

  // Defensive: if props change (caller swaps which media exists), force a
  // valid view. Otherwise we'd render <iframe> with no demo etc.
  useEffect(() => {
    if (view === 'video' && !hasVideo) setView('photo');
    if (view === 'photo' && !hasPhoto) setView('video');
  }, [view, hasVideo, hasPhoto]);

  const src = hasVideo ? buildEmbedUrl({
    videoId: demo.videoId,
    startSec: demo.startSec,
    endSec: demo.endSec,
    autoplay: true,
  }) : '';
  const watchUrl = hasVideo ? `https://www.youtube.com/watch?v=${demo.videoId}${demo.startSec ? `&t=${demo.startSec}s` : ''}` : '';

  // Lock body scroll while the modal is open — without this iOS lets
  // background scrolls leak through the iframe area.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Blank the iframe src on unmount to stop audio cleanly.
  useEffect(() => {
    return () => {
      try { if (iframeRef.current) iframeRef.current.src = 'about:blank'; } catch (e) { /* noop */ }
    };
  }, []);

  // Esc key closes (useful on iPad with keyboard attached).
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.92)',
        // Must sit above the focused-exercise overlay (zIndex 9200) but
        // below the plate-picker (9400) and the PR-banner toast (9450).
        zIndex: 9300,
        display: 'flex', flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Header — stop propagation so taps don't close the modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px',
          color: '#fff',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close demo"
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
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Form demo</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exerciseName}</div>
        </div>
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            style={{
              background: 'rgba(255,255,255,0.12)', border: 'none',
              borderRadius: 12, color: '#fff',
              padding: '0 14px', minHeight: 44,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Edit
          </button>
        )}
      </div>

      {/* View toggle — only when BOTH photo and video exist */}
      {hasVideo && hasPhoto && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', justifyContent: 'center', padding: '0 14px 8px' }}
        >
          <div style={{
            display: 'inline-flex', gap: 4,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 4,
          }}>
            {[
              { id: 'photo', label: 'Photo', Icon: ICamera },
              { id: 'video', label: 'Video', Icon: IPlay },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                style={{
                  background: view === id ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: 'none', borderRadius: 9,
                  padding: '8px 14px', minHeight: 36,
                  color: '#fff',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6,
                  opacity: view === id ? 1 : 0.7,
                }}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main media area — video iframe or photo, depending on `view` */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 12px',
        }}
      >
        {view === 'video' && hasVideo && (
          <div style={{ width: '100%', maxWidth: 720, aspectRatio: '16 / 9', background: '#000', borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.6)' }}>
            <iframe
              ref={iframeRef}
              src={src}
              title={`${exerciseName} demo`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>
        )}
        {view === 'photo' && hasPhoto && (
          <img
            src={photo.dataUrl}
            alt={`${exerciseName} equipment`}
            style={{
              maxWidth: '100%', maxHeight: '100%',
              borderRadius: 14, objectFit: 'contain',
              boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
            }}
          />
        )}
      </div>

      {/* Footer — video-only. Just the "Open in YouTube" fallback for cases
          where embedding is disabled by the creator. */}
      {view === 'video' && hasVideo && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: '10px 16px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            color: 'rgba(255,255,255,0.7)', fontSize: 12,
          }}
        >
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#fff', background: 'rgba(255,255,255,0.12)',
              padding: '8px 14px', borderRadius: 10, textDecoration: 'none',
              fontSize: 12, fontWeight: 700, minHeight: 36,
              display: 'inline-flex', alignItems: 'center',
            }}
          >
            Open in YouTube ↗
          </a>
        </div>
      )}
    </div>,
    document.body
  );
}
