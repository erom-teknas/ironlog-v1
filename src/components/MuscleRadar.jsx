import React, { useMemo } from 'react';
import { calcVol, kgToLb } from '../utils';
import CollapsibleSection from './CollapsibleSection';
import { ITarget } from '../icons';

const AXES = [
  { label: 'Chest',     muscles: ['Chest'] },
  { label: 'Back',      muscles: ['Back'] },
  { label: 'Shoulders', muscles: ['Shoulders'] },
  { label: 'Legs',      muscles: ['Legs', 'Glutes'] },
  { label: 'Biceps',    muscles: ['Biceps'] },
  { label: 'Triceps',   muscles: ['Triceps'] },
  { label: 'Core',      muscles: ['Core'] },
  { label: 'Cardio',    muscles: ['Cardio'] },
];

const toXY = (angle, r, cx, cy) => ({
  x: cx + r * Math.cos(angle - Math.PI / 2),
  y: cy + r * Math.sin(angle - Math.PI / 2),
});

export default function MuscleRadar({ hist, c, unit }) {
  const volumes = useMemo(() => {
    const vol = {};
    AXES.forEach(a => { vol[a.label] = 0; });
    hist.forEach(w => {
      w.exercises.forEach(ex => {
        const axis = AXES.find(a => a.muscles.includes(ex.muscle));
        if (axis) vol[axis.label] += calcVol(ex.sets.filter(s => !s.bodyweight));
      });
    });
    return vol;
  }, [hist]);

  const maxVol = Math.max(...Object.values(volumes), 1);
  const normalized = AXES.map(a => ({ ...a, ratio: volumes[a.label] / maxVol }));

  const N = AXES.length;
  const CX = 120, CY = 120, R = 90;
  const rings = [0.25, 0.5, 0.75, 1];

  const polyPoints = normalized.map((a, i) => {
    const angle = (i / N) * 2 * Math.PI;
    return toXY(angle, a.ratio * R, CX, CY);
  });
  const polyStr = polyPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Push = Chest + Shoulders + Triceps, Pull = Back + Biceps
  const pushVol = (volumes['Chest'] || 0) + (volumes['Shoulders'] || 0) + (volumes['Triceps'] || 0);
  const pullVol = (volumes['Back'] || 0) + (volumes['Biceps'] || 0);
  const pushPullRatio = pullVol > 0 ? Math.round((pushVol / pullVol) * 100) / 100 : null;

  return (
    <CollapsibleSection title="Muscle Balance" icon={<ITarget/>} sub="Volume distribution across muscle groups" c={c} defaultOpen={false}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={CX * 2} height={CY * 2 + 10} viewBox={`0 0 ${CX * 2} ${CY * 2 + 10}`}>
          {/* Background rings */}
          {rings.map(r => {
            const pts = AXES.map((_, i) => {
              const angle = (i / N) * 2 * Math.PI;
              return toXY(angle, r * R, CX, CY);
            });
            return <polygon key={r} points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={c.border} strokeWidth="1" opacity="0.5" />;
          })}
          {/* Axis lines */}
          {AXES.map((_, i) => {
            const angle = (i / N) * 2 * Math.PI;
            const end = toXY(angle, R, CX, CY);
            return <line key={i} x1={CX} y1={CY} x2={end.x} y2={end.y} stroke={c.border} strokeWidth="1" opacity="0.5" />;
          })}
          {/* Data polygon */}
          <polygon points={polyStr} fill={c.accent + '33'} stroke={c.accent} strokeWidth="2" strokeLinejoin="round" />
          {/* Data points */}
          {polyPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={c.accent} stroke={c.card} strokeWidth="1.5" />
          ))}
          {/* Labels */}
          {AXES.map((a, i) => {
            const angle = (i / N) * 2 * Math.PI;
            const lp = toXY(angle, R + 16, CX, CY);
            const volDisplay = unit === 'lb' ? Math.round(kgToLb(volumes[a.label])) : Math.round(volumes[a.label]);
            return (
              <g key={i}>
                <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize="10" fontWeight="700" fill={normalized[i].ratio > 0.1 ? c.text : c.sub}
                  fontFamily="-apple-system,sans-serif">
                  {a.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Push/Pull ratio */}
      {pushPullRatio !== null && (
        <div style={{ background: c.card2, borderRadius: 12, padding: '10px 14px', marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 4 }}>Push : Pull ratio</div>
            <div style={{ height: 6, background: c.muted, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: Math.min(100, (pushVol / (pushVol + pullVol)) * 100) + '%', background: pushPullRatio > 1.2 ? c.r : pushPullRatio < 0.8 ? c.am : c.g, borderRadius: 99 }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: pushPullRatio > 1.2 ? c.r : pushPullRatio < 0.8 ? c.am : c.g }}>{pushPullRatio}:1</div>
            <div style={{ fontSize: 10, color: c.sub }}>{pushPullRatio > 1.2 ? 'More pull needed' : pushPullRatio < 0.8 ? 'More push needed' : 'Balanced'}</div>
          </div>
        </div>
      )}

      {/* Volume breakdown */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {AXES.filter(a => volumes[a.label] > 0).sort((a, b) => volumes[b.label] - volumes[a.label]).map(a => {
          const v = unit === 'lb' ? Math.round(kgToLb(volumes[a.label])) : Math.round(volumes[a.label]);
          const pct = Math.round((volumes[a.label] / Object.values(volumes).reduce((s, x) => s + x, 0)) * 100);
          return (
            <div key={a.label} style={{ background: c.card2, borderRadius: 8, padding: '4px 9px', fontSize: 11 }}>
              <span style={{ fontWeight: 700, color: c.text }}>{a.label}</span>
              <span style={{ color: c.sub, marginLeft: 4 }}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
