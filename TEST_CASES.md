# IronLog UI Test Cases
**Devices:** iPhone 14 Pro (iOS 17) · Android Pixel 7 (Chrome 124)  
**Modes:** PWA (home screen install) + Browser  
**Themes:** Dark · Light · OLED

---

## 1. LAYOUT & NAVIGATION

### 1.1 Bottom Nav
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 1 | Open app as PWA | Nav bar at screen bottom, no blank space below | ☐ | ☐ |
| 2 | Scroll any page up/down | Nav stays fixed, never moves | ☐ | ☐ |
| 3 | Tap each nav icon | Correct page loads, active icon highlighted | ☐ | ☐ |
| 4 | Open keyboard (any input) | Nav stays at bottom, not pushed up | ☐ | ☐ |
| 5 | Rotate device (landscape) | Nav still visible, no overflow | ☐ | ☐ |

### 1.2 Top Bar
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 6 | Open app | IronLog wordmark visible, no clipping | ☐ | ☐ |
| 7 | Switch to Log tab | Workout name input appears in topbar | ☐ | ☐ |
| 8 | On Log tab: unit toggle (KG/LB) | Switches all weights in current session | ☐ | ☐ |
| 9 | On Log tab: Finish button | Triggers workout save flow | ☐ | ☐ |

---

## 2. HOME PAGE

### 2.1 Dashboard
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 10 | Fresh install (no history) | "Let's get to work" headline, stats show — | ☐ | ☐ |
| 11 | After 1 workout | Streak, week vol, session count update | ☐ | ☐ |
| 12 | Hero section overflow check | No text clipped, radial blobs don't overflow | ☐ | ☐ |
| 13 | Start Workout button | Opens blank log session | ☐ | ☐ |
| 14 | Use Plan button | Navigates to Plans tab | ☐ | ☐ |

### 2.2 Muscle Recovery Heatmap (Feature 6)
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 15 | No history | Heatmap section not shown | ☐ | ☐ |
| 16 | After training Back + Chest today | Both show red dot · "Today" | ☐ | ☐ |
| 17 | After training Legs yesterday | Legs shows orange dot · "1d" | ☐ | ☐ |
| 18 | After training Shoulders 3+ days ago | Shows green dot · "Xd" | ☐ | ☐ |
| 19 | Many muscles trained | Pills wrap cleanly, none cut off | ☐ | ☐ |
| 20 | Cardio muscle group | NOT shown in recovery heatmap | ☐ | ☐ |
| 21 | Light mode | Pills readable, colors appropriate | ☐ | ☐ |

---

## 3. LOG PAGE

### 3.1 Start & Basic Flow
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 22 | Open Log tab blank | Animated barbell, "+ Add" button | ☐ | ☐ |
| 23 | Add exercise | Picker opens, muscle tabs above search | ☐ | ☐ |
| 24 | Add multiple exercises | All appear as cards, draggable | ☐ | ☐ |
| 25 | Exercise list scrolls | Scroll smooth, no nav overlap | ☐ | ☐ |
| 26 | Timer shows 0:00 counting up | Duration ticks every second | ☐ | ☐ |

### 3.2 Rest Timer
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 27 | Mark set done (autoRest ON) | Rest timer starts automatically | ☐ | ☐ |
| 28 | Unmark done immediately | Timer STOPS, arc disappears | ☐ | ☐ |
| 29 | Timer expires | Vibration + flash, moves to next | ☐ | ☐ |
| 30 | Tap REST circle (idle) | Cycles through 1m/2m/3m durations | ☐ | ☐ |
| 31 | REST chips (1m/90s/2m/3m) | Tap starts that duration | ☐ | ☐ |
| 32 | REST circle in same row as chips | No layout overflow, all visible | ☐ | ☐ |

### 3.3 Focus Mode
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 33 | Tap exercise card | Focus mode opens full-screen | ☐ | ☐ |
| 34 | Exercise name in header | Never clipped, no overflow with buttons | ☐ | ☐ |
| 35 | ← Back button | Returns to exercise list | ☐ | ☐ |
| 36 | Prev/Next navigation | Swipe or tap switches exercise | ☐ | ☐ |
| 37 | Weight/Reps inputs | Large, easy to tap, no auto-zoom on iOS | ☐ | ☐ |
| 38 | Mark set Done | Button turns green, rest timer starts | ☐ | ☐ |
| 39 | Mark done → Unmark | Timer stops, button returns to "Mark Done" | ☐ | ☐ |
| 40 | All sets done | "✓ Done" button appears, exercise collapses | ☐ | ☐ |

### 3.4 Feature 4 — Mini History (last 3 sessions)
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 41 | No prior history for exercise | Mini history section NOT shown | ☐ | ☐ |
| 42 | 1 prior session | Shows 1 row: date, weight×reps, set count | ☐ | ☐ |
| 43 | 3+ prior sessions | Shows exactly 3 rows (most recent first) | ☐ | ☐ |
| 44 | Cardio exercise | Mini history not shown | ☐ | ☐ |
| 45 | Long exercise name + history | No overflow/clipping | ☐ | ☐ |

### 3.5 Feature 3 — Warm-up Ramp
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 46 | First working set has no weight | Warm-up ramp NOT shown | ☐ | ☐ |
| 47 | Enter 100kg working weight | Ramp shows: 40kg×8, 60kg×5, 80kg×3 | ☐ | ☐ |
| 48 | Enter 225lb working weight | Ramp shows lb values, rounded to 2.5lb | ☐ | ☐ |
| 49 | Tap ramp button | 3 warm-up sets prepended above working sets | ☐ | ☐ |
| 50 | After tapping | Ramp banner disappears (sets exist now) | ☐ | ☐ |
| 51 | Any set already done | Ramp banner NOT shown | ☐ | ☐ |
| 52 | Cardio exercise | Ramp NOT shown | ☐ | ☐ |

### 3.6 Feature 5 — PR Banner (mid-workout)
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 53 | No prior history | No PR banner ever shown | ☐ | ☐ |
| 54 | Enter weight beating prev 1RM | Badge shows "🏆 PR! ~1RM Xkg" (green) | ☐ | ☐ |
| 55 | Mark that set done | Green toast banner appears at top: "NEW PR — [exercise]" | ☐ | ☐ |
| 56 | Banner timing | Disappears after ~3 seconds | ☐ | ☐ |
| 57 | Banner not blocking input | Pointer-events:none, can still tap behind | ☐ | ☐ |
| 58 | Multiple PRs in session | Each fires banner when set marked done | ☐ | ☐ |

### 3.7 Feature 7 — RPE per Set
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 59 | RPE row visible | Shows "RPE" label + buttons 6,7,8,9,10 | ☐ | ☐ |
| 60 | Tap RPE 8 | Button highlights amber | ☐ | ☐ |
| 61 | Tap same RPE again | Deselects (back to no RPE) | ☐ | ☐ |
| 62 | RPE 6,7 color | Green | ☐ | ☐ |
| 63 | RPE 8 color | Amber | ☐ | ☐ |
| 64 | RPE 9,10 color | Red | ☐ | ☐ |
| 65 | RPE saved | After finishing workout, check history — RPE stored | ☐ | ☐ |
| 66 | Cardio set | RPE row not shown for cardio sets | ☐ | ☐ |

---

## 4. FEATURE 1 — POST-WORKOUT SUMMARY

| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 67 | Tap Finish with 0 exercises | Nothing happens (guard) | ☐ | ☐ |
| 68 | Finish workout with exercises | Summary bottom sheet slides up | ☐ | ☐ |
| 69 | Summary header | Shows 💪 or 🏆 emoji, workout name, date | ☐ | ☐ |
| 70 | Stats grid | Duration, Volume, Sets done, Exercises — all correct | ☐ | ☐ |
| 71 | No PRs in session | 🏆 section not shown | ☐ | ☐ |
| 72 | Session with PR | PR section shows exercise names with "🏆 PR" | ☐ | ☐ |
| 73 | Muscles trained | All trained muscles shown as colored pills | ☐ | ☐ |
| 74 | Exercise breakdown | Each exercise: name, sets, volume | ☐ | ☐ |
| 75 | Summary scrollable | Long workouts (10+ exercises) can scroll | ☐ | ☐ |
| 76 | Tap Done button | Summary closes, navigates to Home | ☐ | ☐ |
| 77 | Workout saved | After Done, workout appears in History | ☐ | ☐ |
| 78 | Tap outside sheet | Summary closes (same as Done) | ☐ | ☐ |
| 79 | Safe area respected | Sheet doesn't go behind home indicator | ☐ | ☐ |
| 80 | Light mode | Summary readable, colors correct | ☐ | ☐ |

---

## 5. PLANS PAGE

| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 81 | Plans list scrollable | All plans visible, no cut-off | ☐ | ☐ |
| 82 | Tap plan card | Detail view opens, exercise list scrollable | ☐ | ☐ |
| 83 | Detail view header | Back + plan name + Start — no clipping | ☐ | ☐ |
| 84 | Exercise list in detail | All exercises visible, can scroll | ☐ | ☐ |
| 85 | New Plan editor | Exercise cards expand/collapse correctly | ☐ | ☐ |
| 86 | Set type cycling | Working → Warm-up → Drop set → Working | ☐ | ☐ |

---

## 6. HISTORY PAGE

| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 87 | After saving workout | Appears at top of history list | ☐ | ☐ |
| 88 | Workout card shows | Name, date, volume, muscles | ☐ | ☐ |
| 89 | Repeat workout | Opens log with previous weights pre-filled | ☐ | ☐ |
| 90 | Delete workout | Swipe-to-delete, confirm prompt | ☐ | ☐ |

---

## 7. CROSS-CUTTING CONCERNS

### 7.1 Theme Switching
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 91 | Switch Dark → Light | All pages update, no black bleed | ☐ | ☐ |
| 92 | Switch Light → Dark | Correct background, no flash | ☐ | ☐ |
| 93 | OLED mode | True black background | ☐ | ☐ |

### 7.2 Offline / PWA
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 94 | Install to home screen | App installs, icon appears | ☐ | ☐ |
| 95 | Open as PWA | No browser chrome, nav at exact bottom | ☐ | ☐ |
| 96 | Turn on airplane mode | App still fully functional | ☐ | ☐ |
| 97 | Log workout offline | Saves to IndexedDB, appears in history | ☐ | ☐ |
| 98 | Update available | Toast notification appears | ☐ | ☐ |

### 7.3 Safe Area / Notch
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 99  | Dynamic Island (iPhone 14 Pro) | Content not hidden behind it | ☐ | ☐ |
| 100 | Home indicator area | Nav padding accounts for it | ☐ | ☐ |
| 101 | Android notch | Top bar padding correct | ☐ | ☐ |

### 7.4 Inputs & Keyboard
| # | Step | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 102 | Tap number input | Native numeric keyboard, no auto-zoom | ☐ | ☐ |
| 103 | Enter weight in LB mode | Stored internally as kg, displays correctly | ☐ | ☐ |
| 104 | Keyboard opens in focus mode | Content scrolls/adjusts, Mark Done visible | ☐ | ☐ |

---

## 8. REGRESSION TESTS (previously fixed bugs)

| # | Test | Expected | iOS | Android |
|---|------|----------|-----|---------|
| 105 | Mark set done → unmark → timer | Timer stops on unmark | ☐ | ☐ |
| 106 | Plan detail exercise list | Scrollable, not cut off at bottom | ☐ | ☐ |
| 107 | Long exercise name in focus mode | Name wraps/ellipsis, buttons not squished | ☐ | ☐ |
| 108 | REST row in focus mode | REST + 1m + 90s + 2m + 3m + circle, no overflow | ☐ | ☐ |
| 109 | 5-minute timer chip | NOT present (removed) | ☐ | ☐ |
| 110 | PR banner pointer-events | Can tap set inputs while banner shows | ☐ | ☐ |
