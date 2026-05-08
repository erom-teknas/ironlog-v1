// ─── utils.test.js ───────────────────────────────────────────────────────────
// Pure-function regression tests. These must all pass before and after any
// architecture refactor. No React, no IDB, no mocks needed.

import { describe, it, expect } from 'vitest';
import {
  calc1RM, bestRM, calcVol, calcPlates,
  kgToLb, lbToKg, dispW, storeW, fmtW, fmtVol,
  getExInputType, isTimedEx, isCardioEx,
  getStreak, weekKey,
} from '../utils.js';

// ─── calc1RM ─────────────────────────────────────────────────────────────────
describe('calc1RM', () => {
  it('returns weight directly for 1 rep', () => {
    expect(calc1RM(100, 1)).toBe(100);
  });

  it('calculates correctly for typical working sets', () => {
    // 100kg × 5 reps: 100 * (1 + 5/30) = 116.6... → rounded = 117
    expect(calc1RM(100, 5)).toBe(117);
  });

  it('caps rep multiplier at 15 to prevent high-rep inflation', () => {
    // 50kg × 20 reps should equal 50kg × 15 reps (capped)
    expect(calc1RM(50, 20)).toBe(calc1RM(50, 15));
  });

  it('caps rep multiplier at exactly 15', () => {
    expect(calc1RM(50, 15)).toBe(calc1RM(50, 16));
    expect(calc1RM(50, 15)).toBe(calc1RM(50, 100));
  });

  it('returns 0 for zero weight', () => {
    expect(calc1RM(0, 5)).toBe(0);
  });

  it('returns 0 for zero reps', () => {
    expect(calc1RM(100, 0)).toBe(0);
  });

  it('returns 0 for negative weight', () => {
    expect(calc1RM(-10, 5)).toBe(0);
  });

  it('handles string inputs via parseFloat/parseInt coercion', () => {
    expect(calc1RM('100', '5')).toBe(calc1RM(100, 5));
  });
});

// ─── bestRM ──────────────────────────────────────────────────────────────────
describe('bestRM', () => {
  it('returns 0 for empty sets', () => {
    expect(bestRM([], 0)).toBe(0);
    expect(bestRM(null, 0)).toBe(0);
  });

  it('picks the set with highest 1RM (not necessarily heaviest weight)', () => {
    const sets = [
      { weight: '100', reps: '1' },  // 1RM = 100
      { weight: '80',  reps: '10' }, // 1RM = 80*(1+10/30) = 107
    ];
    expect(bestRM(sets, 0)).toBe(calc1RM(80, 10));
  });

  it('includes bodyweight for BW exercises', () => {
    const sets = [{ weight: '10', reps: '8', bodyweight: true }];
    const bwKg = 80;
    // raw = 80 + 10 = 90
    expect(bestRM(sets, bwKg)).toBe(calc1RM(90, 8));
  });

  it('skips sets with zero reps', () => {
    const sets = [
      { weight: '100', reps: '0' },
      { weight: '80',  reps: '5' },
    ];
    expect(bestRM(sets, 0)).toBe(calc1RM(80, 5));
  });

  it('skips sets with zero weight (non-BW)', () => {
    const sets = [
      { weight: '0',  reps: '10' },
      { weight: '60', reps: '5' },
    ];
    expect(bestRM(sets, 0)).toBe(calc1RM(60, 5));
  });
});

// ─── calcVol ─────────────────────────────────────────────────────────────────
describe('calcVol', () => {
  it('returns 0 for empty/null sets', () => {
    expect(calcVol([])).toBe(0);
    expect(calcVol(null)).toBe(0);
  });

  it('sums weight × reps across sets', () => {
    const sets = [
      { weight: '100', reps: '5' },
      { weight: '80',  reps: '8' },
    ];
    expect(calcVol(sets)).toBe(100*5 + 80*8);
  });

  it('skips sets with missing values', () => {
    const sets = [
      { weight: '',   reps: '5' },
      { weight: '80', reps: '' },
      { weight: '60', reps: '3' },
    ];
    expect(calcVol(sets)).toBe(60*3);
  });
});

// ─── calcPlates ───────────────────────────────────────────────────────────────
describe('calcPlates', () => {
  const plates = [20, 10, 5, 2.5, 1.25]; // kg

  it('returns [] when no custom plates configured', () => {
    expect(calcPlates(100, 'kg', 20, [])).toEqual([]);
    expect(calcPlates(100, 'kg', 20, null)).toEqual([]);
  });

  it('returns [] when target <= bar weight', () => {
    expect(calcPlates(20, 'kg', 20, plates)).toEqual([]);
    expect(calcPlates(15, 'kg', 20, plates)).toEqual([]);
  });

  it('calculates per-side plates for 100kg total (20kg bar)', () => {
    // (100 - 20) / 2 = 40 per side → [20, 20]
    expect(calcPlates(100, 'kg', 20, plates)).toEqual([20, 20]);
  });

  it('calculates per-side plates for 142.5kg total', () => {
    // (142.5 - 20) / 2 = 61.25 per side → [20, 20, 20, 1.25]
    expect(calcPlates(142.5, 'kg', 20, plates)).toEqual([20, 20, 20, 1.25]);
  });

  it('works in lb mode with converted plates', () => {
    // lb plates are the kg plates converted to lb
    const result = calcPlates(225, 'lb', 45, plates); // 225lb total, 45lb bar
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── unit conversions ─────────────────────────────────────────────────────────
describe('kgToLb / lbToKg', () => {
  it('converts 100kg to nearest 0.25lb', () => {
    expect(kgToLb(100)).toBe(220.5); // 100 * 2.2046 = 220.46 → round to nearest 0.25 = 220.5
  });

  it('round-trips within 0.15kg tolerance (0.25lb rounding is ~0.11kg)', () => {
    // kgToLb rounds to nearest 0.25lb, so the round-trip loses up to ~0.11kg precision.
    const kg = 82.5;
    expect(Math.abs(lbToKg(kgToLb(kg)) - kg)).toBeLessThan(0.15);
  });

  it('storeW converts lb input back to kg for storage', () => {
    expect(storeW(220.5, 'lb')).toBeCloseTo(100, 1);
  });

  it('dispW returns lb value when unit is lb', () => {
    expect(dispW(100, 'lb')).toBe(kgToLb(100));
  });

  it('dispW returns kg value unchanged when unit is kg', () => {
    expect(dispW(82.5, 'kg')).toBe(82.5);
  });
});

// ─── fmtVol ───────────────────────────────────────────────────────────────────
describe('fmtVol', () => {
  it('formats small numbers as plain integers', () => {
    expect(fmtVol(500)).toBe('500');
    expect(fmtVol(0)).toBe('0');
  });

  it('formats thousands with k suffix', () => {
    expect(fmtVol(1234)).toBe('1.2k');
    expect(fmtVol(12345)).toBe('12.3k');
  });

  it('handles null/NaN gracefully', () => {
    expect(fmtVol(null)).toBe('0');
    expect(fmtVol(NaN)).toBe('0');
  });
});

// ─── getExInputType ───────────────────────────────────────────────────────────
describe('getExInputType', () => {
  it('returns "weighted" for standard barbell exercises', () => {
    expect(getExInputType('Bench Press', 'Chest', {})).toBe('weighted');
    expect(getExInputType('Deadlift', 'Back', {})).toBe('weighted');
  });

  it('returns "timed" for plank and wall sit', () => {
    expect(getExInputType('Plank', 'Core', {})).toBe('timed');
    expect(getExInputType('Wall Sit', 'Legs', {})).toBe('timed');
  });

  it('returns "bodyweight" for pull-up and push-up', () => {
    expect(getExInputType('Pull-Up', 'Back', {})).toBe('bodyweight');
    expect(getExInputType('Push-Up', 'Chest', {})).toBe('bodyweight');
  });

  it('returns "cardio" for running and treadmill', () => {
    expect(getExInputType('Running', 'Cardio', {})).toBe('cardio');
    expect(getExInputType('Treadmill', 'Cardio', {})).toBe('cardio');
  });

  it('returns "cardio" for any exercise in Cardio muscle group (heuristic)', () => {
    expect(getExInputType('Some Unknown Cardio Move', 'Cardio', {})).toBe('cardio');
  });

  it('respects customExTypes override over EX_TYPES lookup', () => {
    const custom = { 'Bench Press': 'bodyweight' };
    expect(getExInputType('Bench Press', 'Chest', custom)).toBe('bodyweight');
  });

  it('respects customExTypes for unknown exercises', () => {
    const custom = { 'My Special Move': 'timed' };
    expect(getExInputType('My Special Move', 'Core', custom)).toBe('timed');
  });

  it('defaults to "weighted" for unknown exercises in non-cardio groups', () => {
    expect(getExInputType('Totally Unknown Exercise XYZ', 'Chest', {})).toBe('weighted');
  });
});

// ─── isTimedEx ────────────────────────────────────────────────────────────────
describe('isTimedEx', () => {
  it('returns true for Plank', () => {
    expect(isTimedEx('Plank', {})).toBe(true);
  });

  it('returns false for Bench Press', () => {
    expect(isTimedEx('Bench Press', {})).toBe(false);
  });

  it('respects customExTypes', () => {
    expect(isTimedEx('My Exercise', { 'My Exercise': 'timed' })).toBe(true);
    expect(isTimedEx('My Exercise', { 'My Exercise': 'weighted' })).toBe(false);
  });
});

// ─── isCardioEx ───────────────────────────────────────────────────────────────
describe('isCardioEx', () => {
  it('returns true for Running', () => {
    expect(isCardioEx('Running', 'Cardio', {})).toBe(true);
  });

  it('returns false for Bench Press', () => {
    expect(isCardioEx('Bench Press', 'Chest', {})).toBe(false);
  });

  it('returns false for Plank (timed, not cardio)', () => {
    expect(isCardioEx('Plank', 'Core', {})).toBe(false);
  });
});

// ─── getStreak ────────────────────────────────────────────────────────────────
describe('getStreak', () => {
  it('returns 0 for empty history', () => {
    expect(getStreak([], 1)).toBe(0);
  });

  it('counts consecutive days', () => {
    const today = new Date();
    const fmt = d => d.toISOString().slice(0, 10);
    const d0 = fmt(today);
    const d1 = fmt(new Date(today - 86400000));
    const d2 = fmt(new Date(today - 86400000 * 2));
    const hist = [{ date: d0 }, { date: d1 }, { date: d2 }];
    expect(getStreak(hist, 1)).toBe(3);
  });

  it('breaks streak if gap exceeds restDays + 1', () => {
    const today = new Date();
    const fmt = d => d.toISOString().slice(0, 10);
    const d0 = fmt(today);
    const d3 = fmt(new Date(today - 86400000 * 3)); // 3 days ago — breaks 1-rest-day streak
    const hist = [{ date: d0 }, { date: d3 }];
    expect(getStreak(hist, 1)).toBe(1);
  });

  it('allows streak with 2 rest days gap', () => {
    const today = new Date();
    const fmt = d => d.toISOString().slice(0, 10);
    const d0 = fmt(today);
    const d3 = fmt(new Date(today - 86400000 * 3));
    const hist = [{ date: d0 }, { date: d3 }];
    expect(getStreak(hist, 2)).toBe(2);
  });
});
