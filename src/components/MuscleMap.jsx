import React, { useState } from 'react';
import { MZ } from '../constants';

// Hero image + per-muscle highlight overlay for the Home page.
//
// HOW THE OVERLAYS WORK:
//   We render the character image, then absolutely-positioned colored shapes
//   on top of it. Each shape uses mix-blend-mode: screen so it glows on the
//   underlying pixels rather than blocking them. Shapes only render when the
//   corresponding muscle group was trained today.
//
// COORDINATE SYSTEM:
//   left/top/width/height are PERCENTAGES of the image bounds. The values
//   below are tuned for the AI-generated character at /public/goku.png:
//   roughly 1.82:1 landscape, character centered, both arms flexed up.
//   If you swap to a different image (or crop this one), nudge the numbers
//   so each highlight sits on its muscle.
export default function MuscleMap({ c, trained = [] }) {
  const [failed, setFailed] = useState(false);
  const z = { ch: 0, bk: 0, sh: 0, bi: 0, tr: 0, lg: 0, co: 0, gl: 0 };
  trained.forEach(m => { const k = MZ[m]; if (k) z[k]++; });

  // Render a single highlight blob for the given muscle key. Returns null
  // when the muscle wasn't trained — so nothing draws unless it needs to.
  const blob = (key, idx, left, top, width, height, round = '50%') => {
    if (z[key] === 0) return null;
    return (
      <div
        key={`${key}-${idx}`}
        style={{
          position: 'absolute',
          left: `${left}%`, top: `${top}%`,
          width: `${width}%`, height: `${height}%`,
          background: c.accent,
          opacity: z[key] > 1 ? 0.7 : 0.5,
          borderRadius: round,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          boxShadow: `0 0 12px ${c.accent}`,
          filter: 'blur(2px)',
        }}
      />
    );
  };

  if (failed) {
    return (
      <div
        style={{
          width: '100%', aspectRatio: '1456 / 800',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: c.card2, border: `1px dashed ${c.border}`, borderRadius: 12,
          fontSize: 11, color: c.sub, padding: 8, textAlign: 'center', lineHeight: 1.3,
        }}
      >
        Drop&nbsp;<code style={{ color: c.text }}>/public/goku.png</code>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
      <img
        src="/goku.png"
        alt="Lifter"
        onError={() => setFailed(true)}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      {/* Highlights — each muscle group has 1–2 blobs positioned over the
          relevant body part in the image. Stacked muscles (chest+back,
          biceps+triceps) share coordinates and the helper handles opacity. */}
      {blob('ch', 0, 41, 27, 18, 9, '50%')}
      {blob('bk', 0, 41, 27, 18, 9, '50%')}
      {blob('sh', 0, 38, 18, 7, 7, '50%')}
      {blob('sh', 1, 56, 18, 7, 7, '50%')}
      {blob('bi', 0, 28, 10, 9, 9, '50%')}
      {blob('bi', 1, 63, 10, 9, 9, '50%')}
      {blob('tr', 0, 28, 10, 9, 9, '50%')}
      {blob('tr', 1, 63, 10, 9, 9, '50%')}
      {blob('co', 0, 44, 38, 12, 12, '20%')}
      {blob('gl', 0, 44, 55, 12, 6, '50%')}
      {blob('lg', 0, 43, 62, 6, 22, '8px')}
      {blob('lg', 1, 51, 62, 6, 22, '8px')}
      {blob('lg', 2, 43, 84, 6, 14, '8px')}
      {blob('lg', 3, 51, 84, 6, 14, '8px')}
    </div>
  );
}
