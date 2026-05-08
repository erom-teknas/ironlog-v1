import React from 'react';

// ─── Shared gradient defs ──────────────────────────────────────────────────────
// Each component is self-contained — unique gradient IDs prevent SVG conflicts.

// ─── TrophyGold — All-Time PR / 100+ workouts ─────────────────────────────────
export function TrophyGold({ size = 52 }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 60 72" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tg-cup" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#713f12" />
        </linearGradient>
        <linearGradient id="tg-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".65" />
          <stop offset="55%" stopColor="#fff" stopOpacity=".1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="tg-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id="tg-star" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <filter id="tg-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#eab308" floodOpacity=".55" />
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#92400e" floodOpacity=".4" />
        </filter>
      </defs>
      <g filter="url(#tg-glow)">
        <path d="M10 6 Q8 28 14 38 Q18 45 30 47 Q42 45 46 38 Q52 28 50 6 Z" fill="url(#tg-cup)" />
        <path d="M8 8 Q4 16 6 26 Q8 33 12 37 Q8 33 10 23 Q10 15 12 10 Z" fill="url(#tg-cup)" opacity=".65" />
        <path d="M52 8 Q56 16 54 26 Q52 33 48 37 Q52 33 50 23 Q50 15 48 10 Z" fill="url(#tg-cup)" opacity=".65" />
        <rect x="21" y="47" width="18" height="7" rx="2" fill="url(#tg-base)" />
        <rect x="15" y="54" width="30" height="6" rx="3" fill="url(#tg-base)" />
        <polygon points="30,14 32.5,21 40,21 34,25.5 36.5,32.5 30,28 23.5,32.5 26,25.5 20,21 27.5,21"
          fill="url(#tg-star)" opacity=".92" />
      </g>
      <path d="M12 8 Q11 28 16 37 Q20 43 30 46 Q20 40 18 29 Q16 19 15 8 Z" fill="url(#tg-shine)" />
    </svg>
  );
}

// ─── TrophySilver — Weekly milestone / 25+ workouts ──────────────────────────
export function TrophySilver({ size = 52 }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 60 72" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ts-cup" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="45%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="ts-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".6" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ts-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <filter id="ts-glow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#64748b" floodOpacity=".5" />
        </filter>
      </defs>
      <g filter="url(#ts-glow)">
        <path d="M11 7 Q9 28 15 37 Q19 43 30 45 Q41 43 45 37 Q51 28 49 7 Z" fill="url(#ts-cup)" />
        <path d="M9 9 Q5 16 7 25 Q9 31 13 35 Q9 31 11 22 Q11 15 13 11 Z" fill="url(#ts-cup)" opacity=".7" />
        <path d="M51 9 Q55 16 53 25 Q51 31 47 35 Q51 31 49 22 Q49 15 47 11 Z" fill="url(#ts-cup)" opacity=".7" />
        <rect x="21" y="45" width="18" height="6" rx="2" fill="url(#ts-base)" />
        <rect x="16" y="51" width="28" height="5.5" rx="2.5" fill="url(#ts-base)" />
      </g>
      <path d="M13 9 Q12 27 17 36 Q21 42 30 44 Q20 38 18 27 Q16 18 16 9 Z" fill="url(#ts-shine)" />
    </svg>
  );
}

// ─── TrophyBronze — Daily goal / first workout ────────────────────────────────
export function TrophyBronze({ size = 52 }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 60 72" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tb-cup" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="45%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id="tb-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".5" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="tb-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#431407" />
        </linearGradient>
        <filter id="tb-glow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#c2410c" floodOpacity=".45" />
        </filter>
      </defs>
      <g filter="url(#tb-glow)">
        <path d="M12 8 Q10 28 16 36 Q20 42 30 44 Q40 42 44 36 Q50 28 48 8 Z" fill="url(#tb-cup)" />
        <path d="M10 10 Q6 16 8 24 Q10 30 14 34 Q10 30 12 22 Q12 16 14 12 Z" fill="url(#tb-cup)" opacity=".7" />
        <path d="M50 10 Q54 16 52 24 Q50 30 46 34 Q50 30 48 22 Q48 16 46 12 Z" fill="url(#tb-cup)" opacity=".7" />
        <rect x="22" y="44" width="16" height="6" rx="2" fill="url(#tb-base)" />
        <rect x="17" y="50" width="26" height="5" rx="2.5" fill="url(#tb-base)" />
      </g>
      <path d="M14 10 Q13 26 18 34 Q22 40 30 42 Q20 36 18 26 Q16 18 17 10 Z" fill="url(#tb-shine)" />
    </svg>
  );
}

// ─── PRBadge — inline "PR" star badge ─────────────────────────────────────────
export function PRBadge({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <filter id="pr-f">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#eab308" floodOpacity=".5" />
        </filter>
      </defs>
      <g filter="url(#pr-f)">
        <polygon points="21,3 25,14 37,14 28,21 31,33 21,26 11,33 14,21 5,14 17,14"
          fill="url(#pr-bg)" />
      </g>
      <text x="21" y="23" textAnchor="middle" fontSize="9" fontWeight="700"
        fill="#713f12" fontFamily="-apple-system,system-ui,sans-serif">PR</text>
    </svg>
  );
}

// ─── StreakBadge — replaces 🔥 ─────────────────────────────────────────────────
export function StreakBadge({ days = 0, size = 20 }) {
  const bars = [
    { h: 0.35, x: 0 },
    { h: 0.55, x: 1 },
    { h: 0.75, x: 2 },
    { h: 1.0, x: 3 },
  ];
  const bw = 5, gap = 2, totalW = bars.length * bw + (bars.length - 1) * gap;
  const maxH = 18;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${totalW + 10} ${maxH + 6}`}
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="str-g" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      {bars.map((b, i) => {
        const h = Math.round(b.h * maxH);
        const x = 5 + i * (bw + gap);
        return <rect key={i} x={x} y={maxH - h + 3} width={bw} height={h} rx="1.5" fill="url(#str-g)" />;
      })}
      {days > 0 && (
        <>
          <circle cx={5 + 3 * (bw + gap) + bw / 2} cy="4" r="4" fill="#eab308" />
          <text x={5 + 3 * (bw + gap) + bw / 2} y="6.5" textAnchor="middle" fontSize="4.5"
            fontWeight="700" fill="#451a03" fontFamily="-apple-system,system-ui,sans-serif">
            {days > 99 ? '99+' : days}
          </text>
        </>
      )}
    </svg>
  );
}

// ─── GymIcon — replaces 🏋️ everywhere ────────────────────────────────────────
export function GymIcon({ size = 24, color = '#7C6EFA' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="4" height="4" rx="1" />
      <rect x="18" y="10" width="4" height="4" rx="1" />
      <rect x="6" y="8" width="3" height="8" rx="1" />
      <rect x="15" y="8" width="3" height="8" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  );
}
