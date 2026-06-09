import React from 'react';
import { MZ } from '../constants';

const C = {
  active: '#FF6B35',
  body: '#3d4554',
  stroke: '#252c3a',
};

// Draws one figure centered at cx. mirrored=true flips horizontally for back view.
function Figure({ cx, z, showBack }) {
  const f = (key) => z[key] ? C.active : C.body;
  const o = (key) => z[key] ? 1 : 0.75;
  const s = C.stroke;
  const sw = 1;

  // All x coords relative to center (cx=0). We draw right side, mirror for left.
  // Body center line = x:0
  return (
    <g transform={`translate(${cx},0)`}>

      {/* HEAD */}
      <ellipse cx={0} cy={22} rx={16} ry={19} fill={C.body} opacity={0.85} stroke={s} strokeWidth={sw}/>

      {/* NECK */}
      <rect x={-6} y={39} width={12} height={10} rx={3} fill={C.body} opacity={0.8} stroke={s} strokeWidth={sw}/>

      {/* TRAPS (back only) */}
      {showBack && <>
        <rect x={-22} y={48} width={44} height={10} rx={4} fill={f('bk')} opacity={o('bk')} stroke={s} strokeWidth={sw}/>
      </>}

      {/* CHEST / UPPER TORSO (front only) */}
      {!showBack && <>
        <rect x={-20} y={48} width={40} height={22} rx={5} fill={f('ch')} opacity={o('ch')} stroke={s} strokeWidth={sw}/>
      </>}

      {/* LATS / BACK (back view upper torso) */}
      {showBack && <>
        <rect x={-20} y={58} width={40} height={24} rx={5} fill={f('bk')} opacity={o('bk')} stroke={s} strokeWidth={sw}/>
      </>}

      {/* CORE / ABS (front only) */}
      {!showBack && <>
        <rect x={-14} y={70} width={28} height={30} rx={4} fill={f('co')} opacity={o('co')} stroke={s} strokeWidth={sw}/>
        {!z['co'] && <>
          <line x1={0} y1={70} x2={0} y2={100} stroke={s} strokeWidth={0.7}/>
          <line x1={-14} y1={80} x2={14} y2={80} stroke={s} strokeWidth={0.7}/>
          <line x1={-14} y1={90} x2={14} y2={90} stroke={s} strokeWidth={0.7}/>
        </>}
      </>}

      {/* LOWER BACK (back only) */}
      {showBack && <>
        <rect x={-14} y={82} width={28} height={18} rx={4} fill={f('bk')} opacity={o('bk')} stroke={s} strokeWidth={sw}/>
      </>}

      {/* SHOULDERS — mirrored left+right */}
      {[-1,1].map(side => (
        <g key={side} transform={`scale(${side},1)`}>
          <ellipse cx={26} cy={56} rx={11} ry={10} fill={f('sh')} opacity={o('sh')} stroke={s} strokeWidth={sw}/>
        </g>
      ))}

      {/* UPPER ARMS (bicep front / tricep back) — mirrored */}
      {[-1,1].map(side => (
        <g key={side} transform={`scale(${side},1)`}>
          <rect x={21} y={65} width={14} height={26} rx={7} fill={f(showBack ? 'tr' : 'bi')} opacity={o(showBack ? 'tr' : 'bi')} stroke={s} strokeWidth={sw}/>
        </g>
      ))}

      {/* FOREARMS — mirrored */}
      {[-1,1].map(side => (
        <g key={side} transform={`scale(${side},1)`}>
          <rect x={22} y={92} width={12} height={22} rx={6} fill={C.body} opacity={0.65} stroke={s} strokeWidth={sw}/>
        </g>
      ))}

      {/* GLUTES (back only) */}
      {showBack && <>
        <rect x={-18} y={100} width={36} height={20} rx={8} fill={f('gl')} opacity={o('gl')} stroke={s} strokeWidth={sw}/>
      </>}

      {/* HIP / PELVIS connector */}
      {!showBack && <rect x={-18} y={100} width={36} height={12} rx={5} fill={C.body} opacity={0.6} stroke={s} strokeWidth={sw}/>}

      {/* UPPER LEGS (quads front / hamstrings back) — mirrored */}
      {[-1,1].map(side => (
        <g key={side} transform={`scale(${side},1)`}>
          <rect x={3} y={112} width={14} height={42} rx={7} fill={f('lg')} opacity={o('lg')} stroke={s} strokeWidth={sw}/>
        </g>
      ))}

      {/* LOWER LEGS (calves) — mirrored */}
      {[-1,1].map(side => (
        <g key={side} transform={`scale(${side},1)`}>
          <rect x={4} y={155} width={12} height={32} rx={6} fill={f('lg')} opacity={o('lg')} stroke={s} strokeWidth={sw}/>
        </g>
      ))}

      {/* FEET — mirrored */}
      {[-1,1].map(side => (
        <g key={side} transform={`scale(${side},1)`}>
          <ellipse cx={10} cy={191} rx={9} ry={5} fill={C.body} opacity={0.6} stroke={s} strokeWidth={sw}/>
        </g>
      ))}

    </g>
  );
}

export default function MuscleMap({ c, trained = [] }) {
  const z = { ch:0, bk:0, sh:0, bi:0, tr:0, lg:0, co:0, gl:0 };
  trained.forEach(m => { const k = MZ[m]; if (k) z[k]++; });

  return (
    <div style={{width:'100%',lineHeight:0}}>
      <svg viewBox="0 0 400 210" xmlns="http://www.w3.org/2000/svg"
        style={{width:'100%',height:'auto',display:'block'}}>

        <Figure cx={100} z={z} showBack={false}/>

        {/* Divider */}
        <line x1={200} y1={10} x2={200} y2={200} stroke="#2d3748" strokeWidth={1} strokeDasharray="5,4"/>

        <Figure cx={300} z={z} showBack={true}/>

        {/* Labels */}
        <text x={100} y={206} textAnchor="middle" fontSize={9} fill="#6b7280" fontFamily="system-ui,sans-serif">FRONT</text>
        <text x={300} y={206} textAnchor="middle" fontSize={9} fill="#6b7280" fontFamily="system-ui,sans-serif">BACK</text>

      </svg>
    </div>
  );
}
