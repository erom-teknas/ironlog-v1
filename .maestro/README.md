# IronLog — Maestro E2E Test Suite

## Setup

```bash
# 1. Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$PATH:$HOME/.maestro/bin"
maestro --version   # should print 1.37+

# 2. Build and serve the app locally
cd ironLog_v1
npm run build
npm run preview     # starts at http://localhost:4173

# 3. iOS Simulator
xcrun simctl boot "iPhone 14 Pro"
open -a Simulator
# Open Safari in sim → navigate to http://localhost:4173
# Share → Add to Home Screen → install as PWA

# 4. Android Emulator
emulator -avd Pixel_7_API_34 &
adb wait-for-device
# Open Chrome → navigate to http://localhost:4173
# Menu → Add to Home Screen → install as PWA
```

## Run tests

```bash
# Run a single flow
maestro test .maestro/02_exercise_menu_delete.yaml

# Run all flows
maestro test .maestro/

# Run on specific device
maestro --device <ios-sim-udid> test .maestro/
maestro --device emulator-5554 test .maestro/

# Get simulator UDID
xcrun simctl list | grep "iPhone 14 Pro"
```

## Flow Index

| File | What it tests |
|------|--------------|
| 01_nav_and_tabs.yaml | Tab switching, nav bar persistence |
| 02_exercise_menu_delete.yaml | ⋯ menu → Remove — sheet dismisses BEFORE confirm |
| 03_plan_delete.yaml | Plan ⋯ → Delete — same layering check |
| 04_focus_mode_flow.yaml | Set completion, rest timer, unmark, RPE |
| 05_workout_summary.yaml | Finish → summary sheet → history saved |
| 06_scroll_stress.yaml | All list pages scroll without crash |
| 07_safe_area_and_overlays.yaml | Z-index layering, backdrop dismissal, safe area |

## Known appId values

- iOS Safari: `com.apple.mobilesafari`
- iOS PWA (added to home screen): check with `xcrun simctl list apps`
- Android Chrome: `com.android.chrome`
- Android PWA: `com.google.android.apps.chrome`
