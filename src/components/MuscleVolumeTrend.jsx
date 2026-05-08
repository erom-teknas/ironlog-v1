import React, { useState, useMemo } from 'react';
import { MG, CC } from '../constants';
import { weekKey, calcVol, fmtD, kgToLb } from '../utils';
import CollapsibleSection from './CollapsibleSection';
import { IActivity } from '../icons';

const BAR_H = 80;

export default function MuscleVolumeTrend({ hist, c, unit }) {
  // Multi-select — at least 1, max 4
  const [selMgs, setSelMgs] = useState([MG[0]]);

  const toggle = m => {
    setSelMgs(prev => {
      if (prev.includes(m)) return prev.length === 1 ? prev : prev.filter(x => x !== m);
      if (prev.length >= 4) return prev;
      return [...prev, m];
    });
  };

  // Per-week volume for each selected muscle
  const data = useMemo(() => {
    const weeks = {};
    hist.forEach(w => {
      const k = weekKey(w.date);
      w.exercises.forEach(e => {
        if (!selMgs.includes(e.muscle)) return;
        if (!weeks[k]) weeks[k] = {};
        weeks[k][e.muscle] = (weeks[k][e.muscle] || 0) + calcVol(e.sets);
      });
    });
    return Object.entries(weeks)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, byMuscle]) => {
        const conv = v => Math.round(unit === 'lb' ? kgToLb(v) : v);
        const converted = Object.fromEntries(Object.entries(byMuscle).map(([m, v]) => [m, conv(v)]));
        const total = Object.values(converted).reduce((s, v) => s + v, 0);
        return { date, byMuscle: converted, total };
      });
  }, [hist, selMgs, unit]);

  const maxV = Math.max(...data.map(d => d.total), 1);

  return (
    <CollapsibleSection
      title="Muscle Group Volume"
      icon={<IActivity />}
      sub={selMgs.join(' · ') + ' · weekly'}
      c={c}
    >
      {/* Compact wrapping pill selector */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
        {MG.map(m => {
          const active = selMgs.includes(m);
          const si = selMgs.indexOf(m);
          const col = active ? CC[si % CC.length] : null;
          return (
            <button key={m} onClick={() => toggle(m)}
              style={{
                border: active ? '1.5px solid ' + col : '1px solid ' + c.border,
                borderRadius: 20, padding: '3px 10px',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                background: active ? col + '22' : c.card2,
                color: active ? col : c.sub,
                transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 4,
              }}>
              {active && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: col, flexShrink: 0, display: 'inline-block' }} />
              )}
              {m}
            </button>
          );
        })}
      </div>

      {data.length === 0
        ? <div style={{ textAlign: 'center', padding: '18px 0', color: c.sub, fontSize: 13 }}>
            No data for selected muscles in this range
          </div>
        : <>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 3,
                height: BAR_H + 28,
                minWidth: data.length * 26,
              }}>
                {data.map((w, i) => {
                  const isLast = i === data.length - 1;
                  const showLabel = data.length <= 8 || i === 0 || isLast || i % Math.ceil(data.length / 6) === 0;
                  const bw = Math.max(20, Math.min(34, Math.floor(300 / Math.min(data.length, 14))));
                  const barPx = Math.max(w.total / maxV * BAR_H, w.total > 0 ? 3 : 0);
                  const totalLabel = w.total >= 1000 ? (Math.round(w.total / 100) / 10) + 'k' : w.total;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: '0 0 auto', width: bw + 'px' }}>
                      {/* Value label */}
                      <div style={{ fontSize: 7, color: isLast ? c.accent : c.sub, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {w.total > 0 ? totalLabel : ''}
                      </div>
                      {/* Stacked bar */}
                      <div style={{
                        width: '100%', height: barPx + 'px',
                        borderRadius: '3px 3px 0 0', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column-reverse',
                      }}>
                        {selMgs.map((m, si) => {
                          const v = w.byMuscle[m] || 0;
                          if (!v) return null;
                          const col = CC[si % CC.length];
                          const segPct = (v / w.total * 100).toFixed(1) + '%';
                          return (
                            <div key={m}
                              title={m + ': ' + v + unit}
                              style={{
                                width: '100%', height: segPct, flexShrink: 0,
                                background: isLast ? col : col + 'aa',
                              }}
                            />
                          );
                        })}
                      </div>
                      {/* Date label */}
                      <div style={{ fontSize: 7, color: c.sub, whiteSpace: 'nowrap', opacity: showLabel ? 1 : 0 }}>
                        {fmtD(w.date)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend — only when multiple selected */}
            {selMgs.length > 1 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                {selMgs.map((m, si) => (
                  <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: CC[si % CC.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: c.sub, fontWeight: 600 }}>{m}</span>
                  </div>
                ))}
              </div>
            )}
          </>
      }
    </CollapsibleSection>
  );
}
