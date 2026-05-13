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
import { buildEmbedUrl, getYouTubeThumbnail } from '../demoUtils';
import { IX, IPlay, ICamera } from '../icons';

export default function DemoPlayer({ demo, photo, exerciseName, c, onClose, onEdit }) {
  const iframeRef = useRef(null);

  // If both are set, default to PHOTO first — matches the user's stated use
  // case ("glance to remember which machine"). Video is one tap away.
  const hasVideo = !!(demo && demo.videoId);
  const hasPhoto = !!(photo && photo.dataUrl);
  const [view, setView] = useState(hasPhoto ? 'photo' : 'video');
  // Facade pattern: we render a thumbnail until the user taps play, THEN
  // mount the iframe. Reason: iOS PWA WKWebView silently refuses to autoplay
  // cross-origin iframes even when they're muted + playsinline. Creating the
  // iframe inside the tap handler gives it fresh user-gesture context, which
  // WKWebView accepts. Side benefit: way faster modal open (no YouTube
  // player loaded until needed).
  const [playing, setPlaying] = useState(false);

  // Defensive: if props change (caller swaps which media exists), force a
  // valid view. Otherwise we'd render <iframe> with no demo etc.
  useEffect(() => {
    if (view === 'video' && !hasVideo) setView('photo');
    if (view === 'photo' && !hasPhoto) setView('video');
  }, [view, hasVideo, hasPhoto]);

  // When the user toggles to a different view (or closes), stop the iframe.
  useEffect(() => { if (view !== 'video') setPlaying(false); }, [view]);

  const src = hasVideo ? buildEmbedUrl({
    videoId: demo.videoId,
    startSec: demo.startSec,
    endSec: demo.endSec,
    autoplay: true,
  }) : '';
  const watchUrl = hasVideo ? `https://www.youtube.com/watch?v=${demo.videoId}${demo.startSec ? `&t=${demo.startSec}s` : ''}` : '';
  const thumbUrl = hasVideo ? getYouTubeThumbnail(demo.videoId, 'hqdefault') : '';

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
          <div style={{
            position: 'relative',
            width: '100%', maxWidth: 720, aspectRatio: '16 / 9',
            background: '#000', borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
          }}>
            {playing ? (
              <iframe
                ref={iframeRef}
                src={src}
                title={`${exerciseName} demo`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            ) : (
              // Thumbnail facade — tapping this creates the iframe IN the
              // gesture handler, which is what WKWebView needs to allow
              // autoplay on the cross-origin YouTube embed.
              <button
                onClick={() => setPlaying(true)}
                aria-label="Play demo"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  background: '#000', border: 'none', padding: 0,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <img
                  src={thumbUrl}
                  alt=""
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', display: 'block',
                    opacity: 0.75,
                  }}
                  // YouTube thumbnails sometimes 404 on hqdefault; if so we
                  // fall back to mqdefault which always exists. No state
                  // needed — just rewrite the src attribute once.
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallback) {
                      e.currentTarget.dataset.fallback = '1';
                      e.currentTarget.src = `https://i.ytimg.com/vi/${demo.videoId}/mqdefault.jpg`;
                    }
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 8,
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 99,
                    background: 'rgba(255,0,0,0.92)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    color: '#fff',
                  }}>
                    <div style={{ transform: 'scale(2.5) translateX(2px)' }}>
                      <IPlay />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: '0.02em' }}>
                    Tap to play
                  </div>
                </div>
              </button>
            )}
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
