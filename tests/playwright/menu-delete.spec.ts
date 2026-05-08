/**
 * THE MENU-STICK TEST
 *
 * Reproduces and verifies the fix for:
 * "Clicking Delete in a menu opens a confirmation modal,
 *  but the menu stays visible and blocks the modal."
 *
 * Runs on: iPhone SE, iPhone 15 Pro Max, Pixel 7, Galaxy S21
 */

import { test, expect } from '@playwright/test';
import { skipOnboarding, startBlankWorkout, addExercise } from './helpers';

const BASE = 'http://localhost:4173';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE);
  await skipOnboarding(page);
});

// ─────────────────────────────────────────────────────────────────────────────
test('exercise ⋯ menu: Remove opens confirm without menu staying visible', async ({ page }) => {
  await startBlankWorkout(page);
  await addExercise(page, 'Chest', 'Bench Press');

  // Open the ⋯ options sheet
  await page.getByText('⋯').tap();
  await expect(page.getByText('Remove Exercise')).toBeVisible();
  await expect(page.getByText('Equipment')).toBeVisible(); // sheet content visible

  // Tap Remove
  await page.getByText('Remove Exercise').tap();

  // CRITICAL: sheet must be gone BEFORE confirm is checked
  // Allow max 200ms for the 80ms timeout + React render
  await expect(page.getByText('Equipment')).toBeHidden({ timeout: 500 });
  await expect(page.getByText('Remove Exercise')).toBeHidden({ timeout: 500 });

  // Confirm dialog must now be visible
  await expect(page.getByText('Remove Bench Press?')).toBeVisible({ timeout: 1000 });

  // OK button must be tappable WITHOUT extra taps (the bug: it required a tap-to-dismiss-menu first)
  await page.getByRole('button', { name: 'OK' }).tap();

  // Exercise must be gone
  await expect(page.getByText('Bench Press')).toBeHidden({ timeout: 1000 });
});

test('exercise ⋯ menu: Cancel leaves exercise intact', async ({ page }) => {
  await startBlankWorkout(page);
  await addExercise(page, 'Back', 'Pull-Up');

  await page.getByText('⋯').tap();
  await page.getByText('Remove Exercise').tap();

  await expect(page.getByText('Equipment')).toBeHidden({ timeout: 500 });
  await expect(page.getByText('Remove Pull-Up?')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).tap();

  // Exercise must still be there
  await expect(page.getByText('Pull-Up')).toBeVisible();
  // Sheet must NOT reopen
  await expect(page.getByText('Equipment')).toBeHidden();
});

test('exercise ⋯ menu: backdrop tap dismisses sheet without confirm', async ({ page }) => {
  await startBlankWorkout(page);
  await addExercise(page, 'Legs', 'Squat');

  await page.getByText('⋯').tap();
  await expect(page.getByText('Remove Exercise')).toBeVisible();

  // Tap the backdrop (top-left corner, outside the sheet)
  await page.tap('body', { position: { x: 20, y: 100 } });
  await page.waitForTimeout(300);

  await expect(page.getByText('Remove Exercise')).toBeHidden();
  // No confirm dialog should appear
  await expect(page.getByText('Remove Squat?')).toBeHidden();
  // Exercise still exists
  await expect(page.getByText('Squat')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
test('plans ⋯ menu: Delete plan opens confirm immediately', async ({ page }) => {
  // Navigate to Plans tab
  await page.locator('.il-nav').getByText('PLAN').tap();
  await page.waitForTimeout(300);

  // Check if any custom plans exist — if MY PLANS section has items
  const myPlansSection = page.getByText('MY PLANS');
  const hasPlan = await myPlansSection.isVisible({ timeout: 1000 }).catch(() => false);

  if (!hasPlan) {
    // Create a plan first
    await page.getByText('+ New').tap();
    await page.waitForTimeout(200);
    await page.getByPlaceholder(/plan name/i).fill('Test Plan');
    // Add an exercise to make it valid
    await page.getByText('Add Exercise').tap().catch(() => {});
    await page.getByText('Save').tap();
    await page.waitForTimeout(300);
  }

  // Find the ··· button next to a custom plan
  const optionsBtn = page.locator('button').filter({ hasText: '···' }).first();
  await optionsBtn.tap();

  const deleteBtn = page.getByText('Delete Plan');
  await expect(deleteBtn).toBeVisible({ timeout: 1000 });

  await deleteBtn.tap();

  // Sheet must close immediately
  await expect(page.getByText('Delete Plan')).toBeHidden({ timeout: 500 });

  // Confirm must be visible and interactive
  await expect(page.getByText(/Delete.*\?/)).toBeVisible({ timeout: 1000 });
  await page.getByRole('button', { name: 'Cancel' }).tap();
});
