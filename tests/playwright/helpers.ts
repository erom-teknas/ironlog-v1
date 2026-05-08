import { Page } from '@playwright/test';

/** Complete onboarding if the splash screen is present */
export async function skipOnboarding(page: Page) {
  // If onboarding screen is visible, click through it
  const startBtn = page.getByText("Let's get to work", { exact: false });
  if (await startBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.getByRole('button').last().click(); // "Get Started" or similar
    await page.waitForTimeout(400);
  }
}

/** Navigate to the Log tab and start a blank workout */
export async function startBlankWorkout(page: Page) {
  await page.getByText('Start Workout').tap();
  await page.waitForTimeout(200);
}

/** Add a specific exercise to the current workout */
export async function addExercise(page: Page, muscle: string, name: string) {
  await page.getByText('+ Add').tap();
  await page.waitForTimeout(200);
  // Select muscle group tab
  await page.getByText(muscle, { exact: true }).first().tap();
  await page.waitForTimeout(100);
  // Tap the exercise name
  await page.getByText(name, { exact: true }).first().tap();
  await page.waitForTimeout(300);
}

/** Tap a nav tab by label */
export async function goToTab(page: Page, label: string) {
  await page.locator('.il-nav').getByText(label.toUpperCase()).tap();
  await page.waitForTimeout(300);
}
