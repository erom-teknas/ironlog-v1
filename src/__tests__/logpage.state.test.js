// ─── logpage.state.test.js ───────────────────────────────────────────────────
// Tests for the pure state-transition logic that lives in LogPage.
// We extract and test the logic functions directly — no React render needed.
// After the architecture refactor these same functions must produce identical results.

import { describe, it, expect } from 'vitest';
import { calc1RM, bestRM, calcVol, getExInputType } from '../utils.js';

// ─── addEx default sets logic ─────────────────────────────────────────────────
// Mirrors the logic in addEx() in LogPage.jsx
function buildDefaultSets(inputType, lastSets) {
  const isCardio = inputType === 'cardio';
  const isTimed  = inputType === 'timed';
  const isDefaultBW = inputType === 'bodyweight';
  const blankStrength = () => ({ reps: '', weight: '', done: false, bodyweight: isDefaultBW, label: 'Working' });
  const blankTimed    = () => ({ secs: '', done: false, label: 'Working' });

  if (lastSets && lastSets.length) {
    return lastSets.map(s => ({
      reps: s.reps, weight: s.weight,
      mins: s.mins || '', dist: s.dist || '', secs: s.secs || '',
      done: false, bodyweight: s.bodyweight || isDefaultBW, label: s.label || 'Working',
    }));
  }
  if (isCardio)  return [{ mins: '', dist: '', done: false, label: 'Steady' }];
  if (isTimed)   return [blankTimed()];
  return [blankStrength(), blankStrength(), blankStrength()];
}

describe('addEx — default sets', () => {
  it('creates 3 working sets for a weighted exercise with no history', () => {
    const sets = buildDefaultSets('weighted', null);
    expect(sets).toHaveLength(3);
    sets.forEach(s => {
      expect(s.label).toBe('Working');
      expect(s.done).toBe(false);
      expect(s.bodyweight).toBe(false);
    });
  });

  it('creates 1 interval for a cardio exercise with no history', () => {
    const sets = buildDefaultSets('cardio', null);
    expect(sets).toHaveLength(1);
    expect(sets[0].label).toBe('Steady');
    expect(sets[0]).toHaveProperty('mins');
    expect(sets[0]).toHaveProperty('dist');
  });

  it('creates 1 timed set for a timed exercise with no history', () => {
    const sets = buildDefaultSets('timed', null);
    expect(sets).toHaveLength(1);
    expect(sets[0]).toHaveProperty('secs');
    expect(sets[0].done).toBe(false);
  });

  it('creates bodyweight sets for a bodyweight exercise', () => {
    const sets = buildDefaultSets('bodyweight', null);
    expect(sets).toHaveLength(3);
    sets.forEach(s => expect(s.bodyweight).toBe(true));
  });

  it('mirrors last session sets when history exists', () => {
    const last = [
      { reps: '8', weight: '100', done: true, label: 'Working' },
      { reps: '6', weight: '100', done: true, label: 'Working' },
    ];
    const sets = buildDefaultSets('weighted', last);
    expect(sets).toHaveLength(2);
    expect(sets[0].reps).toBe('8');
    expect(sets[0].weight).toBe('100');
    expect(sets[0].done).toBe(false); // always reset done flag
  });
});

// ─── upd — field sanitisation ─────────────────────────────────────────────────
// Mirrors the sanitisation logic in upd() in LogPage.jsx
function sanitiseField(f, v) {
  if (f === 'reps')   { const n = parseInt(v);   return isNaN(n) ? '' : String(Math.min(999, Math.max(0, n))); }
  if (f === 'weight') { const n = parseFloat(v); return isNaN(n) ? '' : String(Math.min(9999, Math.max(0, n))); }
  if (f === 'mins')   { const n = parseFloat(v); return isNaN(n) ? '' : String(Math.min(999, Math.max(0, n))); }
  if (f === 'dist')   { const n = parseFloat(v); return isNaN(n) ? '' : String(Math.min(999, Math.max(0, n))); }
  if (f === 'secs')   { const n = parseFloat(v); return isNaN(n) ? '' : String(Math.min(9999, Math.max(0, n))); }
  return v;
}

describe('upd — field sanitisation', () => {
  it('clamps reps to [0, 999]', () => {
    expect(sanitiseField('reps', '5')).toBe('5');
    expect(sanitiseField('reps', '-1')).toBe('0');
    expect(sanitiseField('reps', '1000')).toBe('999');
  });

  it('clamps weight to [0, 9999]', () => {
    expect(sanitiseField('weight', '100')).toBe('100');
    expect(sanitiseField('weight', '-5')).toBe('0');
    expect(sanitiseField('weight', '10000')).toBe('9999');
  });

  it('clamps secs to [0, 9999]', () => {
    expect(sanitiseField('secs', '60')).toBe('60');
    expect(sanitiseField('secs', '10000')).toBe('9999');
    expect(sanitiseField('secs', '-1')).toBe('0');
  });

  it('returns empty string for non-numeric input on numeric fields', () => {
    expect(sanitiseField('reps', 'abc')).toBe('');
    expect(sanitiseField('weight', '')).toBe('');
  });
});

// ─── tog — set validation guard ───────────────────────────────────────────────
// The tog function blocks marking done when reps = 0 on strength sets.
// This mirrors the guard in tog() in LogPage.jsx

function canMarkDone(set, ex) {
  const isCardio = ex.inputType === 'cardio' || ex.isCardio;
  const isTimed  = ex.inputType === 'timed'  || ex.isTimed;
  if (isCardio || isTimed) return true; // no reps required
  return parseInt(set.reps) >= 1;
}

describe('tog — mark-done guard', () => {
  it('allows marking done when reps >= 1', () => {
    expect(canMarkDone({ reps: '5' }, { inputType: 'weighted' })).toBe(true);
    expect(canMarkDone({ reps: '1' }, { inputType: 'weighted' })).toBe(true);
  });

  it('blocks marking done when reps = 0', () => {
    expect(canMarkDone({ reps: '0' }, { inputType: 'weighted' })).toBe(false);
  });

  it('blocks marking done when reps is empty', () => {
    expect(canMarkDone({ reps: '' }, { inputType: 'weighted' })).toBe(false);
  });

  it('always allows marking done for cardio sets (no reps required)', () => {
    expect(canMarkDone({ reps: '' }, { inputType: 'cardio' })).toBe(true);
    expect(canMarkDone({ reps: '0' }, { inputType: 'cardio' })).toBe(true);
  });

  it('always allows marking done for timed sets', () => {
    expect(canMarkDone({ secs: '30' }, { inputType: 'timed' })).toBe(true);
    expect(canMarkDone({ reps: '' },   { inputType: 'timed' })).toBe(true);
  });

  it('respects legacy isCardio flag for backward compat', () => {
    expect(canMarkDone({ reps: '' }, { isCardio: true })).toBe(true);
  });

  it('respects legacy isTimed flag', () => {
    expect(canMarkDone({ reps: '' }, { isTimed: true })).toBe(true);
  });
});

// ─── rest timer — preserve user-selected duration ────────────────────────────
// Mirrors the fix in tog() — when a timer is already running, keep its duration.

function resolveRestPreset(timerSecs, timerStart, restPresets, exName, lastTimerSecs) {
  const nowMs = Date.now();
  const stillRunning = timerSecs > 0 && timerStart > 0 && (nowMs - timerStart) < timerSecs * 1000;
  return stillRunning ? timerSecs : (restPresets[exName] || lastTimerSecs);
}

describe('rest timer — resolveRestPreset', () => {
  it('uses exercise preset when no timer is running', () => {
    const result = resolveRestPreset(0, 0, { 'Squat': 120 }, 'Squat', 60);
    expect(result).toBe(120);
  });

  it('falls back to lastTimerSecs when no preset and no running timer', () => {
    const result = resolveRestPreset(0, 0, {}, 'Bench Press', 60);
    expect(result).toBe(60);
  });

  it('honours a manually-selected running timer over the exercise preset', () => {
    const start = Date.now() - 5000; // started 5 seconds ago
    // User set 60s manually; exercise has preset of 90s
    const result = resolveRestPreset(60, start, { 'Bench Press': 90 }, 'Bench Press', 90);
    expect(result).toBe(60); // must keep the user's 60s, not override with 90s
  });

  it('uses exercise preset once manual timer has expired', () => {
    const start = Date.now() - 70000; // started 70 seconds ago — 60s timer is expired
    const result = resolveRestPreset(60, start, { 'Bench Press': 90 }, 'Bench Press', 90);
    expect(result).toBe(90); // timer expired, fall back to preset
  });

  it('uses lastTimerSecs when no preset and manual timer expired', () => {
    const start = Date.now() - 120000;
    const result = resolveRestPreset(60, start, {}, 'Bench Press', 90);
    expect(result).toBe(90);
  });
});

// ─── finish — workout save shape ──────────────────────────────────────────────
// Mirrors the data shape produced by finish() in LogPage.jsx

function buildSavePayload(exs, rating, notes, logName, draftWorkoutT0, bwLog, hist) {
  const exsWithNotes = exs; // simplified — notes merge omitted here
  const latestBwKg = bwLog.length ? bwLog[bwLog.length - 1].kg : 0;
  const hasPR = exsWithNotes.some(ex => {
    if (ex.inputType === 'cardio' || ex.isCardio) return false;
    let histBest = 0;
    hist.forEach(w => {
      const f = w.exercises.find(e => e.name === ex.name);
      if (f) histBest = Math.max(histBest, bestRM(f.sets, latestBwKg));
    });
    return histBest > 0 && bestRM(ex.sets, latestBwKg) > histBest;
  });
  const duration = draftWorkoutT0 ? Math.floor((Date.now() - draftWorkoutT0) / 1000) : 0;
  return { name: logName || 'Workout', exercises: exsWithNotes, rating, notes, duration, hasPR };
}

describe('finish — workout save payload', () => {
  it('produces payload with correct shape', () => {
    const exs = [{ name: 'Bench Press', muscle: 'Chest', inputType: 'weighted', sets: [{ weight: '100', reps: '5', done: true }] }];
    const payload = buildSavePayload(exs, 4, 'Good session', 'Push Day', Date.now() - 3600000, [], []);
    expect(payload).toHaveProperty('name', 'Push Day');
    expect(payload).toHaveProperty('exercises');
    expect(payload).toHaveProperty('rating', 4);
    expect(payload).toHaveProperty('notes', 'Good session');
    expect(payload).toHaveProperty('duration');
    expect(payload.duration).toBeGreaterThan(0);
  });

  it('detects PR correctly', () => {
    const hist = [{
      exercises: [{ name: 'Bench Press', sets: [{ weight: '90', reps: '5', done: true }] }],
    }];
    const exs = [{ name: 'Bench Press', inputType: 'weighted', muscle: 'Chest', sets: [{ weight: '100', reps: '5', done: true }] }];
    const payload = buildSavePayload(exs, 5, '', '', Date.now(), [], hist);
    expect(payload.hasPR).toBe(true);
  });

  it('does not detect PR if new best is not greater', () => {
    const hist = [{
      exercises: [{ name: 'Bench Press', sets: [{ weight: '100', reps: '5', done: true }] }],
    }];
    const exs = [{ name: 'Bench Press', inputType: 'weighted', muscle: 'Chest', sets: [{ weight: '100', reps: '5', done: true }] }];
    const payload = buildSavePayload(exs, 5, '', '', Date.now(), [], hist);
    expect(payload.hasPR).toBe(false);
  });

  it('never detects PR for cardio exercises', () => {
    const hist = [{ exercises: [{ name: 'Running', sets: [{ mins: '30', dist: '5' }] }] }];
    const exs = [{ name: 'Running', inputType: 'cardio', isCardio: true, muscle: 'Cardio', sets: [{ mins: '25', dist: '6' }] }];
    const payload = buildSavePayload(exs, 3, '', '', Date.now(), [], hist);
    expect(payload.hasPR).toBe(false);
  });

  it('uses 0 duration when workout clock never started', () => {
    const exs = [{ name: 'Bench Press', inputType: 'weighted', muscle: 'Chest', sets: [] }];
    const payload = buildSavePayload(exs, 0, '', '', null, [], []);
    expect(payload.duration).toBe(0);
  });
});

// ─── setIsValid — completion check ───────────────────────────────────────────
// Mirrors the setIsValid() function in LogPage.jsx used to validate before Done tap.

function setIsValid(s, focusInputType) {
  if (focusInputType === 'timed')  return parseFloat(s.secs) > 0;
  if (focusInputType === 'cardio') return parseFloat(s.mins) > 0 || parseFloat(s.dist) > 0;
  // weighted / bodyweight
  return parseInt(s.reps) >= 1;
}

describe('setIsValid', () => {
  it('validates weighted set: reps >= 1', () => {
    expect(setIsValid({ reps: '5', weight: '100' }, 'weighted')).toBe(true);
    expect(setIsValid({ reps: '0', weight: '100' }, 'weighted')).toBe(false);
    expect(setIsValid({ reps: '',  weight: '100' }, 'weighted')).toBe(false);
  });

  it('validates timed set: secs > 0', () => {
    expect(setIsValid({ secs: '30' }, 'timed')).toBe(true);
    expect(setIsValid({ secs: '0'  }, 'timed')).toBe(false);
    expect(setIsValid({ secs: ''   }, 'timed')).toBe(false);
  });

  it('validates cardio set: either mins or dist > 0', () => {
    expect(setIsValid({ mins: '30', dist: ''   }, 'cardio')).toBe(true);
    expect(setIsValid({ mins: '',   dist: '5'  }, 'cardio')).toBe(true);
    expect(setIsValid({ mins: '',   dist: ''   }, 'cardio')).toBe(false);
    expect(setIsValid({ mins: '0',  dist: '0'  }, 'cardio')).toBe(false);
  });
});
