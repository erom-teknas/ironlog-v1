import React, { useMemo, useState } from 'react';
import { bestRM, kgToLb } from '../utils';
import CollapsibleSection from './CollapsibleSection';
import { IMedal } from '../icons';

// BW multiplier standards [untrained, novice, intermediate, advanced, elite]
const STANDARDS_M = [
  { name: 'Bench Press',    keys: ['bench press', 'barbell bench', 'flat bench'],                mults: [0.50, 0.75, 1.00, 1.25, 1.50] },
  { name: 'Squat',          keys: ['squat', 'back squat', 'barbell squat'],                       mults: [0.75, 1.00, 1.25, 1.50, 2.00] },
  { name: 'Deadlift',       keys: ['deadlift', 'conventional deadlift', 'sumo deadlift'],         mults: [1.00, 1.25, 1.50, 2.00, 2.50] },
  { name: 'Overhead Press', keys: ['overhead press', 'ohp', 'shoulder press', 'military press'], mults: [0.35, 0.50, 0.65, 0.80, 1.00] },
  { name: 'Barbell Row',    keys: ['barbell row', 'bent over row', 'pendlay row'],                mults: [0.50, 0.65, 0.85, 1.00, 1.20] },
];
const STANDARDS_F = [
  { name: 'Bench Press',    keys: ['bench press', 'barbell bench', 'flat bench'],                mults: [0.25, 0.40, 0.60, 0.75, 1.00] },
  { name: 'Squat',          keys: ['squat', 'back squat', 'barbell squat'],                       mults: [0.50, 0.75, 1.00, 1.25, 1.50] },
  { name: 'Deadlift',       keys: ['deadlift', 'conventional deadlift', 'sumo deadlift'],         mults: [0.60, 0.85, 1.10, 1.40, 1.75] },
  { name: 'Overhead Press', keys: ['overhead press', 'ohp', 'shoulder press', 'military press'], mults: [0.20, 0.30, 0.45, 0.55, 0.70] },
  { name: 'Barbell Row',    keys: ['barbell row', 'bent over row', 'pendlay row'],                mults: [0.30, 0.45, 0.60, 0.75, 0.90] },
];
const LEVELS = ['Untrained', 'Novice', 'Intermediate', 'Advanced', 'Elite'];
const LEVEL_COLS = ['#6b7280', '#34d399', '#60a5fa', '#a78bfa', '#fbbf24'];

function findBest1RM(hist, keys) {
  let best = 0;
  hist.forEach(w => {
    w.exercises.forEach(ex => {
      const n = ex.name.toLowerCase();
      if (keys.some(k => n.includes(k))) {
        const rm = bestRM(ex.sets, 0);
        if (rm > best) best = rm;
      }
    });
  });
  return best;
}

function getLevel(rm, bwKg, mults) {
  if (!bwKg || !rm) return -1;
  const ratio = rm / bwKg;
  for (let i = mults.length - 1; i >= 0; i--) {
    if (ratio >= mults[i]) return i;
  }
  return -1;
}

export default function StrengthStandards({ hist, c, unit, bwKg = 0 }) {
  const [gender, setGender] = useState(() => { try { return localStorage.getItem('il_std_gender') || 'male'; } catch { return 'male'; } });
  const setGenderSave = g => { setGender(g); try { localStorage.setItem('il_std_gender', g); } catch {} };
  const STANDARDS = gender === 'female' ? STANDARDS_F : STANDARDS_M;

  const data = useMemo(() => STANDARDS.map(s => {
    const rm1kg = findBest1RM(hist, s.keys);
    const rm1 = unit === 'lb' ? Math.round(kgToLb(rm1kg) * 4) / 4 : rm1kg;
    const bwDisplay = unit === 'lb' ? Math.round(kgToLb(bwKg) * 10) / 10 : bwKg;
    const level = getLevel(rm1kg, bwKg, s.mults);
    const nextLevel = level < LEVELS.length - 1 ? level + 1 : null;
    const curThresh = bwKg ? (unit === 'lb' ? Math.round(kgToLb(bwKg * s.mults[Math.max(level, 0)]) * 4) / 4 : Math.round(bwKg * s.mults[Math.max(level, 0)] * 10) / 10) : 0;
    const nextThresh = nextLevel !== null && bwKg ? (unit === 'lb' ? Math.round(kgToLb(bwKg * s.mults[nextLevel]) * 4) / 4 : Math.round(bwKg * s.mults[nextLevel] * 10) / 10) : null;
    const pct = nextLevel !== null && curThresh && nextThresh ? Math.min(1, Math.max(0, (rm1 - curThresh) / (nextThresh - curThresh))) : (level === LEVELS.length - 1 ? 1 : 0);
    return { ...s, rm1, level, nextLevel, curThresh, nextThresh, pct, bwDisplay };
  }), [hist, unit, bwKg, gender]);

  const found = data.filter(d => d.rm1 > 0);
  const noBw = !bwKg;

  return (
    <CollapsibleSection title="Strength Standards" icon={<IMedal/>} sub={found.length ? `${found.length} lift${found.length > 1 ? 's' : ''} tracked` : 'Log bench, squat, deadlift to compare'} c={c} defaultOpen={false}>
      {/* Gender toggle */}
      <div style={{ display: 'flex', gap: 4, background: c.card2, borderRadius: 10, padding: 3, marginBottom: 14, width: 'fit-content' }}>
        {[{k:'male',l:'♂ Male'},{k:'female',l:'♀ Female'}].map(g => (
          <button key={g.k} onClick={() => setGenderSave(g.k)} style={{ border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: gender === g.k ? c.accent : 'none', color: gender === g.k ? '#fff' : c.sub }}>{g.l}</button>
        ))}
      </div>
      {noBw && <div style={{ background: c.ams, borderRadius: 10, padding: '8px 12px', fontSize: 12, color: c.am, marginBottom: 12 }}>⚠️ Log your bodyweight on the Home tab to see level comparisons.</div>}
      {data.map(d => (
        <div key={d.name} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{d.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {d.rm1 > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: c.sub }}>{d.rm1}{unit}</span>}
              {d.level >= 0 && <span style={{ fontSize: 11, fontWeight: 800, color: LEVEL_COLS[d.level], background: LEVEL_COLS[d.level] + '22', borderRadius: 8, padding: '2px 8px' }}>{LEVELS[d.level]}</span>}
              {d.rm1 === 0 && <span style={{ fontSize: 11, color: c.sub, fontStyle: 'italic' }}>no data</span>}
            </div>
          </div>
          {/* Level dots */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
            {LEVELS.map((lv, i) => (
              <div key={lv} style={{ flex: 1, height: 5, borderRadius: 99, background: i <= d.level ? LEVEL_COLS[i] : c.muted, transition: 'background .3s' }} title={lv + (bwKg ? ': ' + (unit === 'lb' ? Math.round(kgToLb(bwKg * d.mults[i]) * 4) / 4 : Math.round(bwKg * d.mults[i] * 10) / 10) + unit : '')} />
            ))}
          </div>
          {/* Progress to next level */}
          {d.nextLevel !== null && d.rm1 > 0 && bwKg > 0 && (
            <div style={{ fontSize: 10, color: c.sub }}>
              {Math.round((d.nextThresh - d.rm1) * 10) / 10}{unit} to <span style={{ color: LEVEL_COLS[d.nextLevel], fontWeight: 700 }}>{LEVELS[d.nextLevel]}</span>
            </div>
          )}
          {d.level === LEVELS.length - 1 && <div style={{ fontSize: 10, color: LEVEL_COLS[4], fontWeight: 700 }}>🏆 Elite level reached!</div>}
        </div>
      ))}
      <div style={{ fontSize: 10, color: c.sub, marginTop: 4, lineHeight: 1.5 }}>
        Standards based on bodyweight multipliers. Uses your best estimated 1RM across all history.
      </div>
    </CollapsibleSection>
  );
}
