import React, { useMemo } from 'react';
import CollapsibleSection from './CollapsibleSection';
import { ICalendarGrid } from '../icons';

export default function StreakCalendar({ hist, c }) {
  const { grid, months, curStreak, bestStreak, totalYear } = useMemo(() => {
    // Build date → count map
    const counts = {};
    hist.forEach(w => { counts[w.date] = (counts[w.date] || 0) + 1; });

    // Build 52-week grid ending today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Align to Sunday
    const endSun = new Date(today);
    endSun.setDate(today.getDate() + (6 - today.getDay()));
    const startSun = new Date(endSun);
    startSun.setDate(endSun.getDate() - 52 * 7 + 1);

    const cols = []; // 52 cols × 7 rows
    const monthLabels = []; // { col, label }
    let lastMonth = -1;

    for (let w = 0; w < 52; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startSun);
        date.setDate(startSun.getDate() + w * 7 + d);
        const ds = date.toISOString().slice(0, 10);
        const isFuture = date > today;
        col.push({ date: ds, count: isFuture ? -1 : (counts[ds] || 0) });
        if (d === 0 && date.getMonth() !== lastMonth) {
          monthLabels.push({ col: w, label: date.toLocaleDateString('en-US', { month: 'short' }) });
          lastMonth = date.getMonth();
        }
      }
      cols.push(col);
    }

    // Streak calculation (consecutive days with workout, up to today)
    const todayStr = today.toISOString().slice(0, 10);
    let cur = 0, best = 0, run = 0;
    const allDates = Object.keys(counts).sort();
    // Count current streak
    const d = new Date(today);
    while (true) {
      const ds = d.toISOString().slice(0, 10);
      if (counts[ds]) { cur++; d.setDate(d.getDate() - 1); }
      else if (ds === todayStr) { d.setDate(d.getDate() - 1); } // skip today if no workout yet
      else break;
    }
    // Count best streak
    allDates.forEach((ds, i) => {
      if (i === 0) { run = 1; best = 1; return; }
      const prev = new Date(allDates[i - 1]);
      prev.setDate(prev.getDate() + 1);
      if (prev.toISOString().slice(0, 10) === ds) { run++; if (run > best) best = run; }
      else run = 1;
    });

    // Total this year
    const yearStart = today.getFullYear() + '-01-01';
    const totalYear = Object.entries(counts).filter(([d]) => d >= yearStart).reduce((s, [, v]) => s + v, 0);

    return { grid: cols, months: monthLabels, curStreak: cur, bestStreak: best, totalYear };
  }, [hist]);

  const cellColor = (count) => {
    if (count < 0) return c.card2 + '44'; // future
    if (count === 0) return c.card2;
    if (count === 1) return c.accent + '55';
    if (count === 2) return c.accent + '99';
    return c.accent;
  };

  const CELL = 13, GAP = 2;
  const totalW = 52 * (CELL + GAP);

  return (
    <CollapsibleSection title="Activity Streak" icon={<ICalendarGrid/>} sub={`${curStreak} day streak · ${totalYear} workouts this year`} c={c} defaultOpen={false}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Current Streak', val: curStreak + ' days', col: c.accent },
          { label: 'Best Streak', val: bestStreak + ' days', col: c.g },
          { label: 'This Year', val: totalYear + ' sessions', col: c.sub },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: c.card2, borderRadius: 12, padding: '9px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: s.col }}>{s.val}</div>
            <div style={{ fontSize: 10, color: c.sub, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: totalW + 24 }}>
          {/* Month labels */}
          <div style={{ display: 'flex', gap: GAP, paddingLeft: 0, marginBottom: 4, position: 'relative', height: 14 }}>
            {months.map((m, i) => (
              <div key={i} style={{ position: 'absolute', left: m.col * (CELL + GAP), fontSize: 9, color: c.sub, fontWeight: 700, whiteSpace: 'nowrap' }}>{m.label}</div>
            ))}
          </div>
          {/* Day rows */}
          {[0, 1, 2, 3, 4, 5, 6].map(row => (
            <div key={row} style={{ display: 'flex', gap: GAP, marginBottom: GAP }}>
              {grid.map((col, wi) => {
                const cell = col[row];
                return (
                  <div key={wi} title={cell.count >= 0 ? cell.date + (cell.count ? ': ' + cell.count + ' workout' + (cell.count > 1 ? 's' : '') : ': rest') : ''}
                    style={{ width: CELL, height: CELL, borderRadius: 3, flexShrink: 0, background: cellColor(cell.count), transition: 'background .2s' }} />
                );
              })}
            </div>
          ))}
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 9, color: c.sub }}>Less</span>
            {[c.card2, c.accent + '55', c.accent + '99', c.accent].map((bg, i) => (
              <div key={i} style={{ width: CELL, height: CELL, borderRadius: 3, background: bg }} />
            ))}
            <span style={{ fontSize: 9, color: c.sub }}>More</span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
