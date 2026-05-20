# IronLog

A fast, private, offline-first weightlifting tracker. Built as a Progressive Web App with React + Vite, stores all data locally in IndexedDB, optional encrypted cloud backup via Supabase.

No accounts required. No ads. No telemetry. Your training data stays on your phone.

```
[ screenshot 1 ]   [ screenshot 2 ]   [ screenshot 3 ]
   Log a set        PRs & charts      Workout plans
```

> Replace these with real screenshots from `public/screenshots/` once you have them.

## Why

Most workout trackers want an account, push data to their server, and bury features behind subscriptions. IronLog is the opposite: install it, open it, lift. All the standard features (sets/reps/weight, PRs, body weight tracking, plate calculator, plans with progressive overload) work fully offline. Cloud backup is opt-in and uses Supabase free tier; you can also export to JSON and keep the file yourself.

## Features

- **Workout logging** — sets, reps, weight, RPE, tempo, rest timer with notifications, drag-to-reorder, swipe-to-delete
- **Plate calculator** — configurable per gym, smart increment math, supports kg / lb
- **PR detection** — weight, volume, estimated 1RM (Brzycki, capped at 15 reps to prevent inflation)
- **Plans / routines** — built-in templates plus custom plans with linear progression and automatic 10% deload after two failures
- **Body tracking** — weight log with trend chart, body measurements (chest / waist / hips / biceps / thighs)
- **Strength standards** — lookup based on bodyweight × lift
- **Muscle volume heatmap** — weekly volume by muscle group
- **Form video + equipment photo per exercise** — paste a YouTube link (opens in YouTube app on tap), snap a quick photo of the machine you used to remember setup next session
- **Streak counter** with configurable rest days (1–3)
- **14 themes** — dark default plus light and OLED variants
- **Export / import** — JSON file backup with merge or replace, CSV export for analysis
- **Cloud backup (optional)** — Supabase OTP login, one-row-per-user snapshot, manual push / restore
- **QR data transfer** — share your workouts to another device via QR code without any server
- **Offline-first** — all reads/writes go through IndexedDB, works in airplane mode at the gym
- **PWA** — installable to iOS / Android home screen, with iOS safe-area handling, rest-timer notifications, wake lock during sets

## Tech stack

- **React 18** + **Vite 5** for the UI and build pipeline
- **IndexedDB** (vanilla, no Dexie / RxDB) for local persistence with localStorage fallback
- **vite-plugin-pwa** for service worker and manifest
- **Supabase** (`@supabase/supabase-js`) for optional cloud backup (email OTP auth)
- **lucide-react** for icons, **qrcode** for QR transfer, **lz-string** for compact share strings
- **Vitest** + **@testing-library/react** for tests (currently 148 passing)
- **Vercel** for hosting (any static host works — it's just a built bundle)

## Getting started (developers)

### Prerequisites

- Node.js 18+
- npm (or pnpm / yarn — package-lock is npm but should convert cleanly)

### Run locally

```bash
git clone https://github.com/your-username/ironlog.git
cd ironlog
npm install
npm run dev
```

Open `http://localhost:5173`. Hot reload, no service worker in dev (it only registers in production builds).

### Run tests

```bash
npm test          # one-shot
npm run test:watch
```

### Build for production

```bash
npm run build
```

Output goes to `dist/`. The `prebuild` script auto-bumps the service worker cache version (`CACHE = 'ironlog-vN'` in `src/sw.js`) so installed PWAs detect the new build and show an "Update available" prompt.

### Preview production build

```bash
npm run preview
```

### Deploy to Vercel

The repo is Vercel-ready. Either:

- Push to GitHub, import the repo in the Vercel dashboard, and accept the defaults (framework: Vite).
- Or use the CLI: `npm i -g vercel && vercel`.

Any other static host (Netlify, Cloudflare Pages, GitHub Pages, your own nginx) works fine — there's no server, just a built bundle.

## Optional: Supabase cloud backup

Cloud backup is entirely optional. The app works offline forever without it. If you want it:

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, create the backups table and grant Data API access:

   ```sql
   create table backups (
     user_id uuid primary key references auth.users(id) on delete cascade,
     data jsonb not null,
     workout_count integer not null default 0,
     updated_at timestamptz not null default now()
   );

   -- Explicit grants are REQUIRED for the Data API (supabase-js, PostgREST,
   -- GraphQL) to see this table. New Supabase projects from May 30, 2026
   -- onward have this enforced by default; existing projects get enforced
   -- October 30, 2026. Without these grants, the client gets a 42501 error.
   -- Note we do NOT grant anything to `anon` — the app requires email-OTP
   -- login before any backup operation, so all access is as `authenticated`.
   grant select, insert, update, delete on public.backups to authenticated;
   grant select, insert, update, delete on public.backups to service_role;

   alter table backups enable row level security;

   create policy "users can read their own backup"
     on backups for select to authenticated using (auth.uid() = user_id);

   create policy "users can upsert their own backup"
     on backups for insert to authenticated with check (auth.uid() = user_id);

   create policy "users can update their own backup"
     on backups for update to authenticated using (auth.uid() = user_id);

   create policy "users can delete their own backup"
     on backups for delete to authenticated using (auth.uid() = user_id);
   ```

   **Migrating an existing project (created before May 30, 2026):** the table
   and policies already work today, but Supabase will enforce the grants on
   all projects from October 30, 2026. Run this one-time migration before
   that date to keep cloud backup working:

   ```sql
   grant select, insert, update, delete on public.backups to authenticated;
   grant select, insert, update, delete on public.backups to service_role;
   ```

3. In Supabase Auth settings, enable Email OTP (it's on by default).
4. Copy your project URL and anon public key from Project Settings → API.
5. Create a `.env.local` in the repo root:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ…your-anon-key…
   ```

6. Restart the dev server. The Settings page will now show a "Cloud backup" section with sign-in.

Without these env vars, the cloud-backup UI gracefully hides and the app stays fully local.

> **Note:** photos (equipment reference) are deliberately excluded from cloud backups to keep the payload small. Photos do go in the local JSON export/import, so a full backup is still possible.

## How to install on your phone (end users)

### iOS (Safari)

1. Open the deployed URL in Safari.
2. Tap the Share button (square with arrow).
3. Tap **Add to Home Screen**.
4. Tap **Add**.

The icon appears on your home screen. Open it from there for the full-screen, offline-capable experience (separate from Safari's 7-day eviction policy).

### Android (Chrome)

1. Open the deployed URL in Chrome.
2. Tap the three-dot menu → **Install app** (or **Add to Home screen**).
3. Confirm.

### Desktop (Chrome / Edge / Brave)

Look for the install icon in the address bar, or browser menu → Install IronLog.

## Project structure

```
ironLog_v1/
├── src/
│   ├── App.jsx                  Root component, state reducer, IDB persistence, cloud sync glue
│   ├── main.jsx                 Bootstrap + service worker registration
│   ├── constants.js             Themes, milestones, timer steps, muscle group list
│   ├── utils.js                 Pure helpers: 1RM calc, volume, plate math, formatting
│   ├── storage.js               Vanilla IndexedDB wrapper with localStorage fallback
│   ├── cloud.js                 Supabase auth + backup helpers
│   ├── supabase.js              Supabase client init from env vars
│   ├── demoUtils.js             YouTube URL parser + embed URL builder
│   ├── photoUtils.js            Image compression (createImageBitmap + EXIF rotation)
│   ├── exercises.js             Built-in exercise library, ~300 lifts by muscle group
│   ├── sw.js                    Service worker — cache-first, rest-timer notifications
│   ├── icons.jsx                Centralized lucide-react icon exports
│   ├── hooks.jsx                Shared dialog hooks (confirm, import dialog)
│   ├── pages/                   Top-level tab pages (Home, Log, History, Progress, PRs, Plans, Settings, Help)
│   ├── components/              Reusable UI primitives and feature components
│   └── __tests__/               Vitest tests (utils, app state, log page state, demo/photo utils)
├── scripts/
│   └── bump-sw.js               prebuild script — increments the SW cache version
├── public/                      Icons, manifest, robots.txt
├── index.html
├── vite.config.js
└── vercel.json
```

## Architecture notes

A few decisions worth knowing if you're forking or contributing:

**Strict state isolation.** High-frequency state updates (rest timer ticking each second, workout duration counter) are pushed down to dedicated components (`<WorkoutTimer />`, `<RestTimerCircle />`), never the root `App.jsx`. Putting them in `App.jsx` would cause every page in the tree to re-render every second, draining battery on mobile. If you add a new ticking thing, follow the same pattern.

**IndexedDB through JSON.stringify, no schema.** The storage layer (`src/storage.js`) treats IDB as a simple key/value store and serializes everything through `JSON.stringify`. This was a deliberate trade-off for simplicity over rich querying. It's why photos are stored as base64 data URLs rather than Blobs (Blobs don't survive JSON serialization).

**Cloud backup is last-write-wins per user.** One row per user, full snapshot upsert. Good enough for "I lost my phone, restore data," not good enough for "I edited on two devices and expect a merge." If you want real multi-device sync, you'd want CRDTs and per-record timestamps — not in scope for v1.

**Service worker is cache-first with same-origin filter.** `sw.js` intercepts only same-origin GETs (added after a bug where cross-origin YouTube iframes were silently broken in iOS PWA). Anything else passes through to the network.

**No CSS frameworks.** Inline styles + theme objects from `constants.js`. Keeps the bundle small and avoids the Tailwind / styled-components debate. Trade-off: harder to extract design tokens, no atomic-CSS warm fuzzies.

## Testing & data conventions

- **1RM math:** rep multiplier capped at 15–20 reps to prevent estimated-1RM inflation on high-rep sets (a common bug in beginner trackers).
- **Plate math:** assumes a standard barbell + user-configurable plate inventory per gym. Supports fractional plates (1.25 kg, 0.5 lb micro plates).
- **Touch targets:** all interactive elements at least 44×44 px per iOS Human Interface Guidelines.
- **Safe areas:** every screen respects `env(safe-area-inset-top)` and `-bottom` for notched / dynamic-island iPhones.

## Roadmap (loose)

Stuff that's intentionally not in v1 but would be welcome PRs:

- Per-set RPE (1–10) and Reps in Reserve inputs (data model already has placeholder fields)
- Real supersets in the UI — the `isSuperset` flag exists in the data but the player doesn't yet group rest timers
- Import from Strong / Hevy CSV exports
- Apple Health / Google Fit write-out for completed workouts
- Capacitor wrapper for App Store / Play Store distribution
- Per-record timestamps + conflict resolution for multi-device cloud sync

## Contributing

Issues and PRs welcome. Please:

- Run `npm test` before submitting; all 148+ tests should pass.
- Match the existing code style (functional React, hooks, no class components, inline styles).
- Keep new dependencies to a minimum — bundle size is a feature.
- If you're adding a new top-level feature, add at least one regression test for the pure-function parts.

## License

[MIT](./LICENSE) — do what you want, just keep the copyright notice. No warranty, but issues filed in good faith will get a response.

## Credits

Built solo as a personal training tool that grew into a real app. Thanks to the React, Vite, Supabase, and lucide-react teams for the foundations.
