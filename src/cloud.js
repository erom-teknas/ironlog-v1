// ─── IronLog Cloud Backup via Supabase ───────────────────────────────────────
// IndexedDB is always the source of truth.
// Supabase is a silent safety net — one row per user in the backups table.

import { supabase } from './supabase';

// ── Auth ─────────────────────────────────────────────────────────────────────

/** Send a 6-digit OTP to the user's email. */
export async function sendOTP(email) {
  if (!supabase) return { error: 'Cloud backup not configured.' };
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    return { error: error?.message || null };
  } catch (e) {
    return { error: e?.message || 'Failed to send code. Check your connection and try again.' };
  }
}

/** Verify the OTP code the user typed in. Returns { user, error }. */
export async function verifyOTP(email, token) {
  if (!supabase) return { user: null, error: 'Cloud backup not configured.' };
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });
    return { user: data?.user || null, error: error?.message || null };
  } catch (e) {
    return { user: null, error: e?.message || 'Verification failed. Try requesting a new code.' };
  }
}

/** Get the current logged-in user (null if not logged in). */
export async function getCloudUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
}

/** Sign out. */
export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Delete the user's cloud backup row, then sign them out.
 * Does NOT delete local IndexedDB data — that stays on device.
 */
export async function deleteCloudAccount() {
  if (!supabase) return { error: 'Cloud backup not configured.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in.' };

  // Delete backup row (RLS ensures only their own row is deleted)
  const { error: delErr } = await supabase
    .from('backups')
    .delete()
    .eq('user_id', user.id);

  if (delErr) return { error: delErr.message };

  // Sign out
  await supabase.auth.signOut();
  return { error: null };
}

/** Subscribe to auth state changes. Returns unsubscribe fn. */
export function onAuthChange(callback) {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => subscription.unsubscribe();
}

// ── Backup / Restore ─────────────────────────────────────────────────────────

/**
 * Push a full backup to Supabase (upsert — one row per user).
 * @param {object} payload — { workouts, customPlans, bwLog, customExercises }
 * @returns {{ updatedAt: string|null, error: string|null }}
 */
export async function cloudBackup(payload) {
  if (!supabase) return { updatedAt: null, error: 'Cloud backup not configured.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { updatedAt: null, error: 'Not signed in.' };

  const now = new Date().toISOString();
  const { error } = await supabase.from('backups').upsert({
    user_id: user.id,
    data: payload,
    workout_count: payload.workouts?.length || 0,
    updated_at: now,
  }, { onConflict: 'user_id' });

  return { updatedAt: error ? null : now, error: error?.message || null };
}

/**
 * Fetch the latest backup from Supabase.
 * @returns {{ backup: object|null, updatedAt: string|null, error: string|null }}
 */
export async function cloudRestore() {
  if (!supabase) return { backup: null, updatedAt: null, error: 'Cloud backup not configured.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { backup: null, updatedAt: null, error: 'Not signed in.' };

  const { data, error } = await supabase
    .from('backups')
    .select('data, workout_count, updated_at')
    .eq('user_id', user.id)
    .single();

  if (error) return { backup: null, updatedAt: null, error: error.code === 'PGRST116' ? 'No cloud backup found.' : error.message };
  return { backup: data.data, updatedAt: data.updated_at, error: null };
}
