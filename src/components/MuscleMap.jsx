import React from 'react';
import { MZ } from '../constants';

// Buff anime-style silhouette of a lifter. Same separable muscle zones as
// before — chest, back, shoulders, biceps, triceps, core, glutes, legs —
// each lights up in the accent color when the user trains a corresponding
// muscle group today. Just stylized harder: spiky hair, exaggerated V-taper,
// flexed arms, big quads. No copyrighted characters.
export default function MuscleMap({ c, trained = [] }) {
  const z = { ch: 0, bk: 0, sh: 0, bi: 0, tr: 0, lg: 0, co: 0, gl: 0 };
  trained.forEach(m => { const k = MZ[m]; if (k) z[k]++; });
  // Two-tier fill: light tint for one trained group, darker for stacked
  // (e.g. chest + back both hit, shoulder pressed today, etc).
  const h = k => z[k] > 0 ? (c.accent + (z[k] > 1 ? 'cc' : '77')) : 'none';
  const st = k => z[k] > 0 ? c.accent : c.border;

  return (
    <svg viewBox="0 0 120 242" width="100%" style={{ maxWidth: 110, display: 'block', margin: '0 auto' }}>
      {/* Spiky hair — anime power-stance signature, three main peaks */}
      <path
        d="M48,20 L46,8 L52,4 L56,10 L60,1 L64,10 L68,4 L74,8 L72,20 Z"
        fill={c.card2} stroke={c.border} strokeWidth="1.5" strokeLinejoin="miter"
      />
      {/* Head */}
      <ellipse cx="60" cy="22" rx="11" ry="12" fill={c.card2} stroke={c.border} strokeWidth="1.5" />
      {/* Neck (thick) */}
      <rect x="55" y="33" width="10" height="6" rx="2" fill={c.card2} stroke={c.border} strokeWidth="1" />
      {/* Traps yoke — rises up to the neck */}
      <path
        d="M30,52 Q40,38 60,38 Q80,38 90,52 L82,58 L38,58 Z"
        fill={h('sh')} stroke={st('sh')} strokeWidth="1.5"
      />
      {/* Chest — wide pec block, V-tapered to the waist */}
      <path
        d="M28,52 Q60,44 92,52 L88,90 Q60,96 32,90 Z"
        fill={h('ch')} stroke={st('ch')} strokeWidth="1.5"
      />
      {/* Pec center line for definition */}
      <line x1="60" y1="50" x2="60" y2="90" stroke={c.border} strokeWidth="0.8" opacity="0.45" />
      {/* Back overlay (drawn on top of chest area when trained) */}
      {z.bk > 0 && (
        <path d="M28,52 Q60,44 92,52 L88,90 Q60,96 32,90 Z" fill={h('bk')} stroke="none" />
      )}
      {/* Delts — big round caps on the shoulders */}
      <ellipse cx="22" cy="58" rx="12" ry="13" fill={h('sh')} stroke={st('sh')} strokeWidth="1.5" />
      <ellipse cx="98" cy="58" rx="12" ry="13" fill={h('sh')} stroke={st('sh')} strokeWidth="1.5" />
      {/* Biceps — bulky flexed shape, peaked at midpoint */}
      <path
        d="M8,66 Q2,82 9,98 Q16,103 22,98 Q24,82 19,66 Q14,63 8,66 Z"
        fill={h('bi')} stroke={st('bi')} strokeWidth="1.5"
      />
      <path
        d="M112,66 Q118,82 111,98 Q104,103 98,98 Q96,82 101,66 Q106,63 112,66 Z"
        fill={h('bi')} stroke={st('bi')} strokeWidth="1.5"
      />
      {/* Triceps overlay (same arm shape, drawn on top when trained) */}
      {z.tr > 0 && (
        <>
          <path d="M8,66 Q2,82 9,98 Q16,103 22,98 Q24,82 19,66 Q14,63 8,66 Z" fill={h('tr')} stroke="none" />
          <path d="M112,66 Q118,82 111,98 Q104,103 98,98 Q96,82 101,66 Q106,63 112,66 Z" fill={h('tr')} stroke="none" />
        </>
      )}
      {/* Forearms — tapering down */}
      <path d="M10,100 L8,124 L18,126 L20,100 Z" fill={c.card2} stroke={c.border} strokeWidth="1.2" />
      <path d="M110,100 L112,124 L102,126 L100,100 Z" fill={c.card2} stroke={c.border} strokeWidth="1.2" />
      {/* Core — V-taper torso, narrower at the waist */}
      <path
        d="M32,90 Q60,92 88,90 L80,132 Q60,136 40,132 Z"
        fill={h('co')} stroke={st('co')} strokeWidth="1.5"
      />
      {/* Ab definition — hints at a 6-pack via cross-hatches */}
      <g stroke={c.border} strokeWidth="0.8" opacity="0.5" fill="none">
        <line x1="60" y1="94" x2="60" y2="130" />
        <line x1="44" y1="104" x2="76" y2="104" />
        <line x1="44" y1="116" x2="76" y2="116" />
      </g>
      {/* Glutes — visible only when trained today */}
      <ellipse cx="48" cy="140" rx="13" ry="10" fill={h('gl')} stroke={st('gl')} strokeWidth="1.5" />
      <ellipse cx="72" cy="140" rx="13" ry="10" fill={h('gl')} stroke={st('gl')} strokeWidth="1.5" />
      {/* Quads — big flexed thighs */}
      <path
        d="M36,132 Q34,164 42,194 L58,194 Q60,164 58,132 Z"
        fill={h('lg')} stroke={st('lg')} strokeWidth="1.5"
      />
      <path
        d="M84,132 Q86,164 78,194 L62,194 Q60,164 62,132 Z"
        fill={h('lg')} stroke={st('lg')} strokeWidth="1.5"
      />
      {/* Calves */}
      <path
        d="M42,194 Q40,214 46,230 L56,230 Q57,214 55,194 Z"
        fill={h('lg')} stroke={st('lg')} strokeWidth="1.5"
      />
      <path
        d="M78,194 Q80,214 74,230 L64,230 Q63,214 65,194 Z"
        fill={h('lg')} stroke={st('lg')} strokeWidth="1.5"
      />
    </svg>
  );
}
