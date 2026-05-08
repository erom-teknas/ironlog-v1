# IronLog — Playwright E2E Test Setup

## Why Playwright over Maestro for this PWA?

| | Playwright | Maestro |
|---|---|---|
| WebKit (Safari engine) | ✅ Native | ❌ Wraps simulator |
| Chromium (Chrome engine) | ✅ Native | ❌ Wraps emulator |
| Speed | Fast (no emulator boot) | Slow (simulator startup) |
| PWA logic testing | ✅ Perfect | ✅ Good |
| "Add to Home Screen" flow | ❌ Can't test | ✅ Can test |
| CI/CD | ✅ Headless | ⚠️ Needs simulator |

**Use Playwright** for all UI logic, state management, z-index, and safe-area tests.  
**Use Maestro** (`.maestro/` folder) only if you specifically need to test the Add-to-Home-Screen install flow.

## Installation

```bash
cd ironLog_v1

# Install Playwright
npm install -D @playwright/test

# Install browser engines (WebKit = Safari, Chromium = Chrome)
npx playwright install webkit chromium

# Verify
npx playwright --version
```

## Running tests

```bash
# Build and serve first
npm run build
npm run preview   # starts at http://localhost:4173

# In another terminal — run all tests on all devices
npx playwright test --config tests/playwright/playwright.config.ts

# Run a specific file
npx playwright test tests/playwright/menu-delete.spec.ts

# Run on a single device
npx playwright test --project="iPhone SE"
npx playwright test --project="Pixel 7"

# Run headed (see the browser)
npx playwright test --headed --project="iPhone 15 Pro Max"

# View HTML report + screenshots
npx playwright show-report
```

## Test files

| File | What it covers |
|------|----------------|
| `menu-delete.spec.ts` | ⋯ menu → Remove/Delete: sheet closes BEFORE confirm, confirm is instantly tappable |
| `safe-area-clipping.spec.ts` | Nav at viewport bottom, no horizontal overflow, z-index ordering, summary button not clipped |
| `pwa-standalone.spec.ts` | Standalone mode simulation, back-button-free navigation, 300ms delay test |

## Adding to package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test --config tests/playwright/playwright.config.ts",
    "test:e2e:ui": "playwright test --config tests/playwright/playwright.config.ts --ui"
  }
}
```

## CI (GitHub Actions)

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps webkit chromium

- name: Build
  run: npm run build

- name: E2E tests
  run: npm run test:e2e
```
