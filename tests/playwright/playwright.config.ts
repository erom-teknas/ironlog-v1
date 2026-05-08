import { defineConfig, devices } from '@playwright/test';

/**
 * IronLog Playwright Config
 *
 * Setup:
 *   npm install -D @playwright/test
 *   npx playwright install webkit chromium
 *   npm run build && npm run preview   # starts at http://localhost:4173
 *
 * Run all:         npx playwright test
 * Run headed:      npx playwright test --headed
 * Run one file:    npx playwright test tests/playwright/menu-delete.spec.ts
 * View report:     npx playwright show-report
 */

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 30_000,
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:4173',
    // Treat every test as a touch device — disables hover states
    hasTouch: true,
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    // Record video on failure
    video: 'retain-on-failure',
  },

  projects: [
    // ── iOS Safari (WebKit) ───────────────────────────────────────────────────
    {
      name: 'iPhone SE',
      use: {
        ...devices['iPhone SE'],
        browserName: 'webkit',
      },
    },
    {
      name: 'iPhone 15 Pro Max',
      use: {
        ...devices['iPhone 15 Pro Max'],
        browserName: 'webkit',
      },
    },
    // ── Android Chrome (Chromium) ─────────────────────────────────────────────
    {
      name: 'Pixel 7',
      use: {
        ...devices['Pixel 7'],
        browserName: 'chromium',
      },
    },
    {
      name: 'Galaxy S21',
      use: {
        browserName: 'chromium',
        viewport: { width: 360, height: 800 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
      },
    },
  ],

  // Start the preview server automatically
  webServer: {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: true,
    timeout: 20_000,
  },
});
