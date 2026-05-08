/**
 * RESPONSIVE CLIPPING TEST
 *
 * Takes screenshots at each mobile breakpoint and checks for:
 * - Nav bar at screen bottom (not floating mid-screen)
 * - Top bar not hidden behind status bar
 * - No elements cut off at edges
 * - Safe area respected
 *
 * Screenshots saved to: playwright-report/screenshots/
 */

import { test, expect } from '@playwright/test';
import { skipOnboarding } from './helpers';

const BASE = 'http://localhost:4173';

// All pages to screenshot
const PAGES = [
  { name: 'home',     path: '/', tab: null },
  { name: 'log',      path: '/', tab: 'LOG' },
  { name: 'history',  path: '/', tab: 'HISTORY' },
  { name: 'progress', path: '/', tab: 'PROGRESS' },
  { name: 'plans',    path: '/', tab: 'PLAN' },
  { name: 'prs',      path: '/', tab: 'PRs' },
  { name: 'settings', path: '/', tab: 'SETTINGS' },
];

test.beforeEach(async ({ page }) => {
  await page.goto(BASE);
  await skipOnboarding(page);
  await page.waitForTimeout(500); // let splash finish
});

// ─── Nav bar positioning ──────────────────────────────────────────────────────
test('nav bar is at viewport bottom on all pages', async ({ page }) => {
  for (const p of PAGES) {
    if (p.tab) {
      await page.locator('.il-nav').getByText(p.tab).tap();
      await page.waitForTimeout(300);
    }

    const viewport = page.viewportSize()!;
    const navBar = page.locator('.il-nav');
    await expect(navBar).toBeVisible();

    const navBox = await navBar.boundingBox();
    expect(navBox).not.toBeNull();

    // Nav bottom must be at or very close to viewport bottom
    // Allow 2px tolerance for subpixel rendering
    const distFromBottom = viewport.height - (navBox!.y + navBox!.height);
    expect(distFromBottom).toBeLessThanOrEqual(2);

    // Nav must not be floating too high — should be within 90px of bottom
    expect(navBox!.y).toBeGreaterThan(viewport.height - 120);

    await page.screenshot({
      path: `playwright-report/screenshots/${test.info().project.name}-${p.name}.png`,
      fullPage: false,
    });
  }
});

// ─── Top bar not hidden ───────────────────────────────────────────────────────
test('IronLog topbar is visible and not behind status bar', async ({ page }) => {
  const topbar = page.locator('.il-topbar');
  await expect(topbar).toBeVisible();
  const box = await topbar.boundingBox();
  // Top of topbar must not be negative (hidden above viewport)
  expect(box!.y).toBeGreaterThanOrEqual(0);
  // Must be fully within viewport horizontally
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});

// ─── No horizontal overflow ───────────────────────────────────────────────────
test('no horizontal scroll on any page', async ({ page }) => {
  for (const p of PAGES) {
    if (p.tab) {
      await page.locator('.il-nav').getByText(p.tab).tap();
      await page.waitForTimeout(300);
    }
    // scrollWidth should equal clientWidth — no overflow
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1); // 1px tolerance for browser rounding
  }
});

// ─── Z-index: modals always above menus ──────────────────────────────────────
test('confirm dialog z-index is above options sheet', async ({ page }) => {
  // Open workout
  await page.getByText('Start Workout').tap();
  await page.waitForTimeout(200);
  await page.getByText('+ Add').tap();
  await page.waitForTimeout(200);
  await page.getByText('Chest').first().tap();
  await page.getByText('Bench Press', { exact: true }).first().tap();
  await page.waitForTimeout(300);

  // Open ⋯ menu and immediately trigger delete
  await page.getByText('⋯').tap();
  await page.waitForTimeout(200);
  await page.getByText('Remove Exercise').tap();
  await page.waitForTimeout(300);

  // Screenshot to verify confirm is fully on top (manual visual check)
  await page.screenshot({
    path: `playwright-report/screenshots/${test.info().project.name}-confirm-ontop.png`,
  });

  // Verify confirm is visible and OK is in the viewport
  const okBtn = page.getByRole('button', { name: 'OK' });
  await expect(okBtn).toBeVisible();
  const okBox = await okBtn.boundingBox();
  const viewport = page.viewportSize()!;
  expect(okBox!.y).toBeGreaterThan(0);
  expect(okBox!.y + okBox!.height).toBeLessThan(viewport.height);

  await okBtn.tap();
});

// ─── Workout summary safe area ────────────────────────────────────────────────
test('workout summary Done button is not behind home indicator', async ({ page }) => {
  await page.getByText('Start Workout').tap();
  await page.waitForTimeout(200);
  await page.getByText('+ Add').tap();
  await page.waitForTimeout(200);
  await page.getByText('Chest').first().tap();
  await page.getByText('Bench Press', { exact: true }).first().tap();
  await page.waitForTimeout(300);

  // Open focus mode and complete a set
  await page.getByText('Bench Press').tap();
  await page.waitForTimeout(200);
  await page.locator('input[type="number"]').first().fill('8'); // reps
  await page.getByText('Mark Done').tap();
  await page.waitForTimeout(200);
  await page.getByText('← Back').tap();
  await page.waitForTimeout(200);

  // Finish workout
  await page.getByText('Finish').tap();
  await page.waitForTimeout(500);

  // Summary must be visible
  await expect(page.getByText('Workout Complete!')).toBeVisible();

  // Done button must be visible and not clipped by home indicator
  const doneBtn = page.getByRole('button', { name: /Done/i }).last();
  await expect(doneBtn).toBeVisible();
  const box = await doneBtn.boundingBox();
  const viewport = page.viewportSize()!;

  // Button must be fully within viewport (not behind home indicator)
  expect(box!.y + box!.height).toBeLessThan(viewport.height);

  await page.screenshot({
    path: `playwright-report/screenshots/${test.info().project.name}-summary.png`,
  });

  await doneBtn.tap();
  await expect(page.getByText('Start Workout')).toBeVisible();
});
