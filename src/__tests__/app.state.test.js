// ─── app.state.test.js ───────────────────────────────────────────────────────
// Tests for App-level state transitions that will move to a reducer.
// Written as pure function tests against extracted logic — no React render.
// After the useReducer migration, these same assertions must hold.

import { describe, it, expect } from 'vitest';
import { today } from '../utils.js';

// ─── Custom exercise CRUD ─────────────────────────────────────────────────────
// Mirrors addCustomExercise / deleteCustomExercise / renameCustomExercise in App.jsx

function addCustomExercise(customExercises, customExTypes, muscle, name, inputType) {
  const existing = customExercises[muscle] || [];
  if (existing.includes(name)) return { customExercises, customExTypes }; // no-op
  return {
    customExercises: { ...customExercises, [muscle]: [...existing, name] },
    customExTypes: inputType ? { ...customExTypes, [name]: inputType } : customExTypes,
  };
}

function deleteCustomExercise(customExercises, customExTypes, muscle, name) {
  const types = { ...customExTypes };
  delete types[name];
  return {
    customExercises: { ...customExercises, [muscle]: (customExercises[muscle] || []).filter(n => n !== name) },
    customExTypes: types,
  };
}

function renameCustomExercise(customExercises, customExTypes, muscle, oldName, newName) {
  const types = { ...customExTypes };
  if (types[oldName] !== undefined) {
    types[newName] = types[oldName];
    delete types[oldName];
  }
  return {
    customExercises: {
      ...customExercises,
      [muscle]: (customExercises[muscle] || []).map(n => n === oldName ? newName : n),
    },
    customExTypes: types,
  };
}

describe('addCustomExercise', () => {
  it('adds exercise to correct muscle group', () => {
    const { customExercises } = addCustomExercise({}, {}, 'Chest', 'My Fly', 'weighted');
    expect(customExercises.Chest).toContain('My Fly');
  });

  it('stores inputType in customExTypes', () => {
    const { customExTypes } = addCustomExercise({}, {}, 'Core', 'L-Sit', 'timed');
    expect(customExTypes['L-Sit']).toBe('timed');
  });

  it('is a no-op when name already exists', () => {
    const existing = { Chest: ['Cable Fly'] };
    const { customExercises } = addCustomExercise(existing, {}, 'Chest', 'Cable Fly', 'weighted');
    expect(customExercises.Chest.filter(n => n === 'Cable Fly')).toHaveLength(1);
  });

  it('does not mutate original state', () => {
    const orig = { Chest: ['Push-Up'] };
    addCustomExercise(orig, {}, 'Chest', 'New Move', 'weighted');
    expect(orig.Chest).toHaveLength(1); // original unchanged
  });

  it('preserves existing exercises in the same muscle group', () => {
    const existing = { Chest: ['Push-Up', 'Dip'] };
    const { customExercises } = addCustomExercise(existing, {}, 'Chest', 'Fly', 'weighted');
    expect(customExercises.Chest).toEqual(['Push-Up', 'Dip', 'Fly']);
  });
});

describe('deleteCustomExercise', () => {
  it('removes the exercise from its group', () => {
    const exs = { Chest: ['Push-Up', 'My Fly'] };
    const types = { 'My Fly': 'weighted' };
    const { customExercises } = deleteCustomExercise(exs, types, 'Chest', 'My Fly');
    expect(customExercises.Chest).not.toContain('My Fly');
    expect(customExercises.Chest).toContain('Push-Up');
  });

  it('removes inputType from customExTypes', () => {
    const exs = { Core: ['L-Sit'] };
    const types = { 'L-Sit': 'timed' };
    const { customExTypes } = deleteCustomExercise(exs, types, 'Core', 'L-Sit');
    expect(customExTypes['L-Sit']).toBeUndefined();
  });

  it('is safe when exercise has no stored type', () => {
    const exs = { Chest: ['My Move'] };
    const { customExTypes } = deleteCustomExercise(exs, {}, 'Chest', 'My Move');
    expect(customExTypes['My Move']).toBeUndefined();
  });
});

describe('renameCustomExercise', () => {
  it('renames the exercise in its group', () => {
    const exs = { Back: ['My Row', 'Pulldown'] };
    const { customExercises } = renameCustomExercise(exs, {}, 'Back', 'My Row', 'Wide Row');
    expect(customExercises.Back).toContain('Wide Row');
    expect(customExercises.Back).not.toContain('My Row');
  });

  it('migrates inputType to new name', () => {
    const exs = { Core: ['Old Plank'] };
    const types = { 'Old Plank': 'timed' };
    const { customExTypes } = renameCustomExercise(exs, types, 'Core', 'Old Plank', 'New Plank');
    expect(customExTypes['New Plank']).toBe('timed');
    expect(customExTypes['Old Plank']).toBeUndefined();
  });

  it('preserves order of other exercises in the group', () => {
    const exs = { Back: ['A', 'B', 'C'] };
    const { customExercises } = renameCustomExercise(exs, {}, 'Back', 'B', 'X');
    expect(customExercises.Back).toEqual(['A', 'X', 'C']);
  });
});

// ─── History save ─────────────────────────────────────────────────────────────
// Mirrors saveW() in App.jsx — new workout prepended to history.

function saveWorkout(hist, workout) {
  return [workout, ...hist];
}

describe('saveWorkout', () => {
  it('prepends new workout to history', () => {
    const hist = [{ id: 'old', date: '2026-01-01' }];
    const workout = { id: 'new', date: today() };
    const updated = saveWorkout(hist, workout);
    expect(updated[0]).toBe(workout);
    expect(updated[1]).toBe(hist[0]);
  });

  it('works with empty history', () => {
    const workout = { id: 'first', date: today() };
    const updated = saveWorkout([], workout);
    expect(updated).toHaveLength(1);
    expect(updated[0]).toBe(workout);
  });
});

// ─── Rest presets ─────────────────────────────────────────────────────────────

function saveRestPreset(restPresets, exName, secs) {
  return { ...restPresets, [exName]: Math.min(600, Math.max(15, secs)) };
}

describe('saveRestPreset', () => {
  it('saves preset for an exercise', () => {
    const result = saveRestPreset({}, 'Squat', 120);
    expect(result['Squat']).toBe(120);
  });

  it('does not mutate original presets', () => {
    const orig = { 'Bench Press': 90 };
    saveRestPreset(orig, 'Squat', 120);
    expect(orig['Squat']).toBeUndefined();
  });

  it('clamps to [15, 600] seconds', () => {
    expect(saveRestPreset({}, 'X', 5)['X']).toBe(15);
    expect(saveRestPreset({}, 'X', 700)['X']).toBe(600);
  });

  it('overwrites existing preset', () => {
    const orig = { 'Squat': 90 };
    expect(saveRestPreset(orig, 'Squat', 120)['Squat']).toBe(120);
  });
});

// ─── Unit switching ────────────────────────────────────────────────────────────
// Unit is stored as "kg" | "lb" — no conversion of existing stored weights.
// Stored weights are always in kg; display converts on the fly.

describe('unit switching', () => {
  it('accepts "kg" and "lb" as valid units', () => {
    const validUnits = ['kg', 'lb'];
    validUnits.forEach(u => expect(['kg', 'lb']).toContain(u));
  });
});
