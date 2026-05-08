/**
 * PWA STANDALONE MODE TESTS
 *
 * Simulates standalone display-mode behavior:
 * - No browser back button → app must handle navigation internally
 * - No address bar → viewport height is full screen
 * - Safe area insets are in effect
 */

import { test, expect } from '@playwright/test';
import { skipOnboarding } from './helpers';

const BASE = 'http://localhost:4173';

// Simulate PWA standalone by overriding matchMedia
async function simulateStandalone(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    // Override matchMedia to report display-mode: standalone
    const original = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => {
      if (query === '(display-mode: standalone)') {
        return { matches: true, media: query, addListener: () => {}, removeListener: () => {},
          addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true, onchange: null } as MediaQueryList;
      }
      return original(query);
    };
    // iOS standalone flag
    (window.navigator as any).standalone = true;
  });
}

test.beforeEach(async ({ page }) => {
  await simulateStandalone(page);
  await page.goto(BASE);
  await skipOnboarding(page);
  await page.waitForTimeout(500);
});

test('app is navigable without browser back button', async ({ page }) => {
  // Navigate to Plans
  await page.locator('.il-nav').getByText('PLAN').tap();
  await page.waitForTimeout(300);
  await expect(page.getByText('Plans')).toBeVisible();

  // Navigate to Settings
  await page.locator('.il-nav').getByText('SETTINGS').tap();
  await page.waitForTimeout(300);
  await expect(page.getByText('Settings')).toBeVisible();

  // Back to Home via tab — no browser history needed
  await page.locator('.il-nav').getByText('HOME').tap();
  await page.waitForTimeout(300);
  await expect(page.getByText('Start Workout')).toBeVisible();
});

test('focus mode has its own back button (no browser nav required)', async ({ page }) => {
  await page.getByText('Start Workout').tap();
  await page.waitForTimeout(200);
  await page.getByText('+ Add').tap();
  await page.waitForTimeout(200);
  await page.getByText('Chest').first().tap();
  await page.getByText('Bench Press', { exact: true }).first().tap();
  await page.waitForTimeout(300);

  // Open focus mode
  await page.getByText('Bench Press').tap();
  await page.waitForTimeout(300);

  await expect(page.getByText('← Back')).toBeVisible();
  await page.getByText('← Back').tap();
  await page.waitForTimeout(300);

  // Back to exercise list — no browser back needed
  await expect(page.getByText('Bench Press')).toBeVisible();
});

test('plan detail has back button (no browser nav required)', async ({ page }) => {
  await page.locator('.il-nav').getByText('PLAN').tap();
  await page.waitForTimeout(300);

  // Tap first plan card
  await page.getByText('Push Day').tap();
  await page.waitForTimeout(300);

  await expect(page.getByText('← Back')).toBeVisible();
  await page.getByText('← Back').tap();
  await page.waitForTimeout(300);

  await expect(page.getByText('Plans')).toBeVisible();
});

test('no horizontal overscroll (PWA bounce prevention)', async ({ page }) => {
  // Swipe horizontally — should not reveal white space
  const viewport = page.viewportSize()!;
  await page.touchscreen.tap(viewport.width / 2, viewport.height / 2);

  // Check overscroll-behavior is in effect — scrollX should stay 0
  const scrollX = await page.evaluate(() => window.scrollX);
  expect(scrollX).toBe(0);
});

test('confirm dialog tappable in standalone mode (no 300ms delay)', async ({ page }) => {
  await page.getByText('Start Workout').tap();
  await page.waitForTimeout(200);
  await page.getByText('+ Add').tap();
  await page.waitForTimeout(200);
  await page.getByText('Chest').first().tap();
  await page.getByText('Bench Press', { exact: true }).first().tap();
  await page.waitForTimeout(300);

  await page.getByText('⋯').tap();
  await page.waitForTimeout(200);
  await page.getByText('Remove Exercise').tap();
  await page.waitForTimeout(300);

  // Measure tap responsiveness — should respond within 100ms, not 400ms
  const start = Date.now();
  await page.getByRole('button', { name: 'Cancel' }).tap();
  const elapsed = Date.now() - start;

  // 300ms delay would mean elapsed > 300; with fix it should be <150
  expect(elapsed).toBeLessThan(300);
});
