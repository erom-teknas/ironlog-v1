import React, { useState } from 'react';
import { getStreak, calcVol, today, fmtD, kgToLb, lbToKg } from '../utils';
import CollapsibleSection from '../components/CollapsibleSection';
import MuscleMap from '../components/MuscleMap';
import { IPlus, IGrid, ILog, IScale } from '../icons';

export default function HomePage({ hist, dark, c, unit = 'kg', onBlank, onPlan, onUsePlan, bwLog = [], onLogBW, bwUnit, onSetBwUnit, customPlans = [], customExercises = {}, streakDays = 1 }) {
  const effectiveBwUnit = bwUnit || unit;
  const [bwInput, setBwInput] = useState('');

  const streak = getStreak(hist, streakDays), now = new Date();
  const weekVol = hist.filter(w => (now - new Date(w.date)) / 86400000 <= 7).reduce((s, w) => s + w.exercises.reduce((a, e) => a + calcVol(e.sets), 0), 0);
  const last = hist.length ? hist[hist.length - 1] : null;
  const todayM = [...new Set(hist.filter(w => w.date === today()).flatMap(w => w.exercises.map(e => e.muscle)))];
  const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  // ── Today's scheduled plan ─────────────────────────────────────────────────
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const todayDayName = DAY_NAMES[now.getDay()];
  const weekPlan = (() => { try { return JSON.parse(localStorage.getItem('il_week_plan') || '{}'); } catch { return {}; } })();
  const scheduledPlanId = weekPlan[todayDayName] || null;
  const scheduledPlan = scheduledPlanId ? customPlans.find(p => p.id === scheduledPlanId) : null;
  const alreadyLoggedToday = hist.some(w => w.date === today());

  const insights = [];
  // Muscle recovery: days since each muscle was last trained
  const muscleRecovery = {};
  if (hist.length) {
    [...hist].reverse().forEach(w => {
      const daysAgo = Math.floor((now - new Date(w.date)) / 86400000);
      w.exercises.forEach(e => { if (e.muscle && !(e.muscle in muscleRecovery)) muscleRecovery[e.muscle] = daysAgo; });
    });
  }
  const recoveryEntries = Object.entries(muscleRecovery)
    .filter(([m]) => m !== 'Cardio')
    .sort((a, b) => a[1] - b[1]);

  if (hist.length) {
    const ds = {};
    [...hist].reverse().forEach(w => w.exercises.forEach(e => { if (!ds[e.muscle]) ds[e.muscle] = Math.floor((now - new Date(w.date)) / 86400000); }));
    Object.entries(ds).forEach(([m, d]) => { if (d >= 5) insights.push({ msg: m + ' not trained in ' + d + ' days', col: 'am' }); });
    if (weekVol > 4000) insights.push({ msg: 'Strong week — ' + (unit === 'lb' ? Math.round(kgToLb(weekVol) / 1000) + 'k lb' : Math.round(weekVol / 1000) + 'k kg') + ' lifted', col: 'g' });
    if (streak >= 3) insights.push({ msg: streak + '-day streak! Keep going!', col: 'ac' });
  }

  return (
    <>
      <div style={{ paddingBottom: 32 }}>

        {/* ── Hero card — same style as CollapsibleSection ── */}
        <div style={{
          background: c.card,
          border: '1px solid ' + c.border,
          borderRadius: '0 0 36px 36px',
          padding: '22px 20px 24px',
          marginBottom: 18,
        }}>
          {/* Greeting + headline */}
          <p style={{ margin: '0 0 4px', fontSize: 10, color: c.sub, fontWeight: 700, letterSpacing: '0.12em' }}>
            {greet.toUpperCase()}
          </p>
          <h1 style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, color: c.text }}>
            {hist.length === 0 ? "Let's get to work." : 'Ready to lift!'}
          </h1>

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { l: 'STREAK',   v: streak > 0  ? streak + 'd'   : '—', e: '🔥', c2: streak > 0  ? '#f6a835' : c.muted },
              { l: 'WEEK VOL', v: weekVol > 0 ? (unit === 'lb' ? Math.round(kgToLb(weekVol) / 1000) + 'k' : Math.round(weekVol / 1000) + 'k') : '—', e: '💪', c2: weekVol > 0 ? c.g : c.muted },
              { l: 'SESSIONS', v: hist.length || '—', e: '🏅', c2: hist.length > 0 ? c.accent : c.muted },
            ].map(s => (
              <div key={s.l} style={{
                flex: 1,
                background: c.card2,
                borderRadius: 16,
                padding: '12px 6px',
                textAlign: 'center',
                border: '1px solid ' + c.border,
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.e}</div>
                <div style={{ fontSize: 19, fontWeight: 900, lineHeight: 1, color: s.c2 }}>{s.v}</div>
                <div style={{ fontSize: 8.5, color: c.sub, marginTop: 4, fontWeight: 700, letterSpacing: '0.08em' }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* ── Muscle recovery heatmap ── */}
          {recoveryEntries.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid ' + c.border }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: c.sub, marginBottom: 8 }}>
                MUSCLE RECOVERY
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {recoveryEntries.map(([muscle, days]) => {
                  const col = days === 0 ? '#f87171' : days === 1 ? '#f6a835' : days === 2 ? '#fbbf24' : '#10d9a0';
                  const label = days === 0 ? 'Today' : days === 1 ? '1d' : days + 'd';
                  return (
                    <div key={muscle} style={{
                      background: col + '22', border: '1px solid ' + col + '55',
                      borderRadius: 10, padding: '4px 9px',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: col, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: col }}>{muscle}</span>
                      <span style={{ fontSize: 10, color: col, opacity: 0.75 }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '0 16px' }}>
          {/* ── Insights ── */}
          {insights.slice(0, 2).map((ins, i) => (
            <div key={i} style={{ background: ins.col === 'g' ? c.gs : ins.col === 'am' ? c.ams : c.as, borderRadius: 'var(--r-lg,22px)', padding: '11px 14px', marginBottom: 8, fontSize: 12, color: ins.col === 'g' ? c.g : ins.col === 'am' ? c.am : c.at, fontWeight: 600, lineHeight: 1.4 }}>
              {ins.msg}
            </div>
          ))}

          {/* ── Today's Scheduled Plan ── */}
          {scheduledPlan && (
            <div style={{ borderRadius: 'var(--r-xl,28px)', marginBottom: 14, overflow: 'hidden', border: '2px solid ' + (alreadyLoggedToday ? c.g + '55' : scheduledPlan.col + '66') }}>
              {/* Header strip */}
              <div style={{ background: alreadyLoggedToday ? c.gs : scheduledPlan.col + '22', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: alreadyLoggedToday ? c.g : scheduledPlan.col }}>
                  📅 TODAY · {todayDayName.toUpperCase()}
                </div>
                {alreadyLoggedToday && <div style={{ fontSize: 10, fontWeight: 800, color: c.g, letterSpacing: '0.05em' }}>✓ DONE</div>}
              </div>
              {/* Body */}
              <div style={{ background: c.card, padding: '14px 16px' }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: c.text, letterSpacing: '-0.02em', marginBottom: 4 }}>{scheduledPlan.name}</div>
                <div style={{ fontSize: 12, color: c.sub, marginBottom: 14 }}>
                  {scheduledPlan.exercises.length} exercise{scheduledPlan.exercises.length !== 1 ? 's' : ''}
                  {scheduledPlan.exercises.length > 0 && ' · ' + [...new Set(scheduledPlan.exercises.map(e => e.muscle).filter(Boolean))].slice(0, 3).join(', ')}
                </div>
                <button
                  onClick={() => onUsePlan && onUsePlan(scheduledPlan)}
                  style={{ width: '100%', background: alreadyLoggedToday ? c.card2 : 'linear-gradient(135deg,' + scheduledPlan.col + ',' + scheduledPlan.col + 'cc)', border: alreadyLoggedToday ? '1.5px solid ' + c.border : 'none', borderRadius: 14, padding: '13px', fontSize: 14, fontWeight: 800, cursor: 'pointer', color: alreadyLoggedToday ? c.sub : '#fff', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
                  {alreadyLoggedToday ? 'Start Again' : '▶ Start ' + scheduledPlan.name}
                </button>
              </div>
            </div>
          )}

          {/* ── Primary CTAs ── */}
          <div data-tour="home-ctas" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={onBlank} style={{ flex: 1, background: c.accent, color: '#fff', border: 'none', borderRadius: 'var(--r-xl,28px)', padding: '18px 12px', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5, fontFamily: 'inherit', boxShadow: '0 8px 28px ' + c.accent + '44', letterSpacing: '-0.01em' }}>
              <IPlus />
              <span>Start Workout</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>Blank session</span>
            </button>
            <button onClick={onPlan} style={{ flex: 1, background: c.card, color: c.text, border: '1px solid ' + c.border, borderRadius: 'var(--r-xl,28px)', padding: '18px 12px', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5, fontFamily: 'inherit' }}>
              <IGrid />
              <span>Use Plan</span>
              <span style={{ fontSize: 11, color: c.sub, fontWeight: 400 }}>Pick a template</span>
            </button>
          </div>

          {/* ── Today's Muscles ── */}
          <CollapsibleSection title="Today's Muscles" icon={<ILog/>} sub={todayM.length ? todayM.join(' · ') : 'Nothing logged yet'} c={c}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, fontSize: 13, color: c.sub, lineHeight: 1.6 }}>{todayM.length ? todayM.join(' · ') : 'Nothing yet — start a workout!'}</div>
              <div style={{ width: 76, flexShrink: 0 }}><MuscleMap trained={todayM} c={c} /></div>
            </div>
          </CollapsibleSection>

          {/* ── Last Workout ── */}
          {last && (
            <CollapsibleSection title="Last Workout" icon={<ILog/>} sub={last.name ? last.name + ' · ' + fmtD(last.date) : fmtD(last.date)} c={c}>
              {last.exercises.slice(0, 3).map((ex, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderTop: '1px solid ' + c.border, color: c.sub }}>
                  <span style={{ color: c.text, fontWeight: 600 }}>{ex.name}</span>
                  <span>{ex.sets.length} sets · {unit === 'lb' ? Math.round(kgToLb(Math.max(...ex.sets.map(s => parseFloat(s.weight) || 0))) * 4) / 4 : Math.max(...ex.sets.map(s => parseFloat(s.weight) || 0))}{unit}</span>
                </div>
              ))}
              {last.exercises.length > 3 && <div style={{ fontSize: 12, color: c.sub, marginTop: 5 }}>+{last.exercises.length - 3} more</div>}
            </CollapsibleSection>
          )}

          {/* ── Body Weight ── */}
          <CollapsibleSection title="Body Weight" icon={<IScale/>}
            sub={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{bwLog.length > 0 ? 'Latest: ' + (effectiveBwUnit === 'lb' ? Math.round(kgToLb(bwLog[bwLog.length - 1].kg) * 10) / 10 : bwLog[bwLog.length - 1].kg) + ' ' + effectiveBwUnit.toUpperCase() : 'Log your weight'}</span>
                {onSetBwUnit && (
                  <button onClick={e => { e.stopPropagation(); onSetBwUnit(effectiveBwUnit === 'kg' ? 'lb' : 'kg'); }}
                    style={{ background: c.as, border: '1px solid ' + c.accent + '44', borderRadius: 6, padding: '1px 7px', fontSize: 10, fontWeight: 800, cursor: 'pointer', color: c.at, fontFamily: 'inherit', lineHeight: 1.5 }}>
                    {effectiveBwUnit === 'kg' ? '→ LB' : '→ KG'}
                  </button>
                )}
              </span>
            } c={c}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" inputMode="decimal" value={bwInput} onChange={e => setBwInput(e.target.value)}
                placeholder={'Weight in ' + effectiveBwUnit.toUpperCase() + '…'}
                style={{ flex: 1, background: c.card2, border: '1.5px solid ' + c.border, borderRadius: 11, padding: '9px 12px', fontSize: 14, color: c.text, outline: 'none', fontFamily: 'inherit' }} />
              <button onClick={() => {
                const n = parseFloat(bwInput);
                const maxW = effectiveBwUnit === 'lb' ? 700 : 320, minW = effectiveBwUnit === 'lb' ? 45 : 20;
                if (!n || n < minW || n > maxW) { setBwInput(''); return; }
                onLogBW(effectiveBwUnit === 'lb' ? Math.round(lbToKg(n) * 100) / 100 : n);
                setBwInput('');
              }} style={{ background: c.accent, border: 'none', borderRadius: 11, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: 'inherit', flexShrink: 0, minHeight: 44 }}>
                Log
              </button>
            </div>
            {bwInput && (parseFloat(bwInput) < (effectiveBwUnit === 'lb' ? 44 : 20) || parseFloat(bwInput) > (effectiveBwUnit === 'lb' ? 700 : 320)) && (
              <div style={{ fontSize: 11, color: c.r, marginTop: 5 }}>Enter a valid weight ({effectiveBwUnit === 'lb' ? '44–700 LB' : '20–320 KG'})</div>
            )}
          </CollapsibleSection>
        </div>
      </div>
    </>
  );
}
