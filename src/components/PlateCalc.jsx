import React, { useState } from 'react';
import { BAR_TYPES } from '../constants';
import { calcPlates } from '../utils';
import { NIn } from './Primitives';
import CollapsibleSection from './CollapsibleSection';
import PlateCircle from './PlateCircle';

export default function PlateCalc({ c, unit = 'kg' }) {
  const [tgt, setTgt] = useState('');
  const [barId, setBarId] = useState('barbell');
  const barType = BAR_TYPES.find(b => b.id === barId) || BAR_TYPES[0];
  const barKg   = barType.kg;
  const barDisp = unit === 'lb' ? barType.lbEquiv : barKg;
  const n    = parseFloat(tgt) || 0;
  const nKg  = unit === 'lb' ? n / 2.2046 : n;
  const plates = n > 0 && nKg > barKg
    ? calcPlates(unit === 'lb' ? n : nKg, unit, unit === 'lb' ? barType.lbEquiv : barKg)
    : [];
  const showBarOnly = n > 0 && nKg <= barKg && barKg > 0;

  return (
    <CollapsibleSection title="Plate Calculator" icon="🏋️" sub="Enter a target weight to see plates" c={c} defaultOpen={false}>
      {/* Bar type selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 2 }}>
        {BAR_TYPES.map(b => (
          <button key={b.id} onClick={() => setBarId(b.id)}
            style={{ flexShrink: 0, border: 'none', borderRadius: 10, padding: '5px 11px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: barId === b.id ? c.accent : c.card2, color: barId === b.id ? '#fff' : c.sub }}>
            {b.label}{b.kg > 0 ? ` (${unit === 'lb' ? b.lbEquiv : b.kg}${unit})` : ''}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: c.sub, marginBottom: 10 }}>
        {barKg > 0 ? `Bar = ${barDisp}${unit} · ` : ''}Enter total target weight
      </div>
      <NIn value={tgt} onChange={setTgt} c={c} />

      {/* Plate visualisation */}
      {plates.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, color: c.sub, marginBottom: 10, fontWeight: 700, letterSpacing: '0.06em' }}>
            PLATES PER SIDE
          </div>
          {/* Bar view: L plates … bar … R plates */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', paddingBottom: 6, WebkitOverflowScrolling: 'touch' }}>
            {/* Left plates (outermost first — reversed so smallest is closest to bar) */}
            {[...plates].reverse().map((p, i) => (
              <PlateCircle key={'L' + i} weight={p} unit={unit} size={46} />
            ))}
            {/* Bar sleeve */}
            {barKg > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <div style={{ width: 8, height: 56, background: 'linear-gradient(180deg,#9a9aa2,#c8c8d0,#9a9aa2)', borderRadius: 4, boxShadow: '0 0 6px rgba(0,0,0,0.4)' }} />
                <span style={{ fontSize: 9, color: c.sub, fontWeight: 700 }}>{barDisp}{unit}</span>
              </div>
            )}
            {/* Right plates */}
            {plates.map((p, i) => (
              <PlateCircle key={'R' + i} weight={p} unit={unit} size={46} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: c.sub, marginTop: 6 }}>
            {plates.length} plate{plates.length !== 1 ? 's' : ''} per side
          </div>
          <div style={{ fontSize: 13, color: c.g, fontWeight: 700, marginTop: 4 }}>Total: {n}{unit}</div>
        </div>
      )}
      {showBarOnly && <div style={{ marginTop: 8, fontSize: 13, color: c.am }}>Bar only ({barDisp}{unit})</div>}
      {n > 0 && barKg === 0 && <div style={{ marginTop: 8, fontSize: 13, color: c.g }}>No plates needed — dumbbell / cable weight</div>}
    </CollapsibleSection>
  );
}
