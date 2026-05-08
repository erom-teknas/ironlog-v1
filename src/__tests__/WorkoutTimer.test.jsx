// ─── WorkoutTimer.test.jsx ───────────────────────────────────────────────────
// Tests for the isolated WorkoutTimer component.
// These verify the component manages its own tick without leaking into LogPage.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React, { useRef } from 'react';
import WorkoutTimer from '../components/WorkoutTimer.jsx';

const C = { text: '#f0f0ff', sub: '#48486e' };

function Wrapper({ t0Value }) {
  const ref = useRef({ current: t0Value });
  return <WorkoutTimer draftWorkoutT0={ref.current} c={C} />;
}

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('WorkoutTimer', () => {
  it('renders 00:00 when workout has not started (t0 = null)', () => {
    const ref = { current: null };
    render(<WorkoutTimer draftWorkoutT0={ref} c={C} />);
    expect(screen.getByText('00:00')).toBeTruthy();
  });

  it('renders 00:00 when t0 ref object is null inside', () => {
    render(<WorkoutTimer draftWorkoutT0={{ current: null }} c={C} />);
    expect(screen.getByText('00:00')).toBeTruthy();
  });

  it('counts up after t0 is set', async () => {
    const t0 = Date.now() - 65000; // started 65 seconds ago
    render(<WorkoutTimer draftWorkoutT0={{ current: t0 }} c={C} />);

    // The initial useState reads the elapsed time immediately
    // Expected: 01:05 (65 seconds = 1 min 5 sec)
    expect(screen.getByText('01:05')).toBeTruthy();
  });

  it('ticks forward every second via setInterval', async () => {
    const t0 = Date.now(); // just started
    render(<WorkoutTimer draftWorkoutT0={{ current: t0 }} c={C} />);

    expect(screen.getByText('00:00')).toBeTruthy();

    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(screen.getByText('00:03')).toBeTruthy();
  });

  it('pads minutes and seconds with leading zeros', async () => {
    const t0 = Date.now() - 9000; // 9 seconds ago
    render(<WorkoutTimer draftWorkoutT0={{ current: t0 }} c={C} />);
    expect(screen.getByText('00:09')).toBeTruthy();
  });

  it('formats values above 60 seconds correctly', () => {
    const t0 = Date.now() - 3661000; // 1 hour 1 min 1 sec
    render(<WorkoutTimer draftWorkoutT0={{ current: t0 }} c={C} />);
    // 3661 sec = 61 min 1 sec → "61:01"
    expect(screen.getByText('61:01')).toBeTruthy();
  });
});
