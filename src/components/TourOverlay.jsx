import React from 'react';

export const TOUR_STEPS = [
  {
    tab: "home",
    emoji: "👋",
    title: "Welcome to IronLog",
    body: "This quick tour walks you through every feature. You can replay it anytime from the Help tab. Tap Next to begin — or Skip to jump straight in.",
  },
  {
    tab: "log",
    emoji: "📝",
    title: "The Log Tab — Start a Workout",
    body: "Tap the Log tab (pencil icon) to start a workout. Type a name at the top, or leave it blank. The elapsed timer starts counting as soon as you open this tab.",
  },
  {
    tab: "log",
    emoji: "➕",
    title: "Adding Exercises",
    body: "Tap '+ Add Exercise' at the bottom of the log. Choose a muscle group, then pick from the built-in list or type a custom name. You can also search across all muscle groups.",
  },
  {
    tab: "log",
    emoji: "🏋️",
    title: "Logging Sets",
    body: "Each exercise shows a grid of sets. Enter weight and reps, then tap the ✓ button to mark a set done. The row fades to show it's complete. Tap the ✓ again to delete a set. Tap '+ Add set' to copy the last set.",
  },
  {
    tab: "log",
    emoji: "⏱️",
    title: "Rest Timer",
    body: "The circular timer in the top bar starts automatically when you complete a set (AUTO mode). Tap it to cycle through 60s / 120s / 180s presets or stop it. The per-exercise rest duration is adjustable with the − / + buttons on each exercise card.",
  },
  {
    tab: "log",
    emoji: "⤢",
    title: "Focus Mode",
    body: "Tap the '⤢ Focus' label on any exercise name to enter full-screen Focus Mode. Big inputs for weight and reps, one set at a time. Great during a heavy lift. Tap '← Back' to return to the full log.",
  },
  {
    tab: "log",
    emoji: "🍽️",
    title: "Plate Calculator",
    body: "Scroll to the bottom of the Log tab to find the built-in plate calculator. Enter a target weight and it shows exactly which plates to load on each side. The inline plate display also appears under each set row as you type.",
  },
  {
    tab: "log",
    emoji: "⚡",
    title: "Supersets & RPE/Tempo",
    body: "Use the '⚡ SS' button on an exercise to mark it as a superset with the next exercise — a visual connector appears between them. The 'RPE/Tempo' button reveals extra fields for rate of perceived exertion and tempo notation (e.g. 3-1-2-0).",
  },
  {
    tab: "log",
    emoji: "🏁",
    title: "Finishing a Workout",
    body: "When all sets are done, tap 'Finish' in the top-right corner. Rate your session with stars, add notes, then confirm. Your workout is saved to History. Completed exercises collapse automatically to keep the screen tidy.",
  },
  {
    tab: "history",
    emoji: "📋",
    title: "History — Your Workout Log",
    body: "Every saved workout appears here, grouped by Today / This Week / Last Week / Month. Tap any card to expand it and see all exercises and sets.",
  },
  {
    tab: "history",
    emoji: "🔍",
    title: "Search & Explore History",
    body: "Use the search bar to filter by workout name, exercise name, muscle group, date, or notes. Expanded workout cards show mini sparklines (weight trend per exercise), a 1RM estimate, and options to Repeat, Share, or Delete.",
  },
  {
    tab: "progress",
    emoji: "📈",
    title: "Progress — Charts & Stats",
    body: "The Progress tab shows your bodyweight trend, weekly volume bars, and workout frequency. Filter by last 4 weeks, 3 months, or all time using the buttons at the top.",
  },
  {
    tab: "progress",
    emoji: "🔥",
    title: "Muscle Heatmap & Duration",
    body: "Scroll down on Progress to see the 8-week muscle frequency heatmap — darker squares mean more sessions targeting that muscle. Below that is the workout duration trend chart.",
  },
  {
    tab: "progress",
    emoji: "🎯",
    title: "Muscle Balance Radar",
    body: "The Muscle Balance section shows a spider chart across 8 muscle groups. A balanced shape means even training. The Push:Pull ratio bar turns green when balanced — aim for roughly 1:1 for long-term shoulder health.",
  },
  {
    tab: "progress",
    emoji: "🏅",
    title: "Strength Standards",
    body: "Strength Standards compares your best estimated 1RM on Bench, Squat, Deadlift, OHP, and Barbell Row against bodyweight multiplier benchmarks — from Untrained to Elite. Log your bodyweight on the Home tab to unlock the level comparisons.",
  },
  {
    tab: "progress",
    emoji: "🔥",
    title: "Activity Streak",
    body: "The Activity Streak section shows a GitHub-style 52-week grid — one cell per day, darker = more workouts. Track your current streak, all-time best streak, and total sessions this year at a glance.",
  },
  {
    tab: "progress",
    emoji: "📏",
    title: "Body Measurements",
    body: "Further down the Progress tab you'll find Body Measurements. Log chest, waist, hips, biceps, and thighs in cm or inches. Each measurement shows a mini sparkline so you can spot trends over time.",
  },
  {
    tab: "prs",
    emoji: "🏆",
    title: "Personal Records",
    body: "The PRs tab shows your all-time best for every exercise. Toggle between Weight PR (estimated 1RM) and Volume PR (best single-session total). Tap any exercise to see its full weight trend chart.",
  },
  {
    tab: "routines",
    emoji: "📅",
    title: "Routines — Saved Workouts",
    body: "The Routines tab has built-in templates (Push/Pull/Legs, Full Body, etc.) and a section to build your own. Tap any routine card to start it as a new workout — your last session's weights are pre-filled automatically.",
  },
  {
    tab: "routines",
    emoji: "📈",
    title: "Progressive Overload",
    body: "When creating or editing a custom routine, enable Auto-Progression on any exercise. Set an increment (e.g. +2.5 kg). Every time you complete all sets, the weight increases next session. Fail twice in a row and IronLog automatically deloads 10%.",
  },
  {
    tab: "routines",
    emoji: "🗓️",
    title: "Weekly Schedule & Periodization",
    body: "In the Routines tab, tap 'Weekly Schedule' to assign routines to specific days. Use the Periodization block selector (Hypertrophy, Strength, Power, Deload…) when building custom routines to organise your training phases.",
  },
  {
    tab: "home",
    emoji: "⚙️",
    title: "Settings — Units, Theme & Plates",
    body: "On the Home tab: toggle kg/lb with the unit button in the top bar, cycle Dark/OLED/Auto/Light themes with the moon/sun button. Scroll down on Home to log bodyweight, customise your gym's plate kit, and set workout reminder notifications.",
  },
  {
    tab: "home",
    emoji: "💾",
    title: "Backup & Restore",
    body: "IronLog saves silently to your device every day. On the Home tab you can export a JSON backup file, import one to restore or merge data, or use QR Code export to transfer your data to another device without a file. All data stays on your phone — nothing goes to a server.",
  },
  {
    tab: "help",
    emoji: "🎉",
    title: "That's IronLog!",
    body: "You've seen every feature. Head to any tab to start training. You can replay this tour anytime from the Help tab. Good luck — and lift heavy! 💪",
  },
];

export default function TourOverlay({ c, step, onNext, onPrev, onSkip }) {
  const s = TOUR_STEPS[step];
  const total = TOUR_STEPS.length;
  const isLast = step === total - 1;
  const isFirst = step === 0;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 800,
      background: "rgba(0,0,0,0.55)",
      display: "flex", flexDirection: "column",
      justifyContent: "flex-end",
      pointerEvents: "none",
    }}>
      {/* Card */}
      <div style={{
        pointerEvents: "all",
        background: c.card,
        borderTop: "1px solid " + c.border,
        borderRadius: "24px 24px 0 0",
        padding: "20px 20px calc(env(safe-area-inset-bottom, 0px) + 20px)",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
        maxWidth: 430,
        width: "100%",
        margin: "0 auto",
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: c.muted, borderRadius: 99, marginBottom: 16, overflow: "hidden" }}>
          <div style={{ height: "100%", background: c.accent, borderRadius: 99, width: ((step + 1) / total * 100) + "%", transition: "width .3s" }} />
        </div>

        {/* Step counter */}
        <div style={{ fontSize: 11, fontWeight: 700, color: c.sub, letterSpacing: "0.06em", marginBottom: 8 }}>
          STEP {step + 1} OF {total}
        </div>

        {/* Content */}
        <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: c.text, letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2 }}>
          {s.title}
        </div>
        <div style={{ fontSize: 14, color: c.sub, lineHeight: 1.6, marginBottom: 20 }}>
          {s.body}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!isFirst && (
            <button onClick={onPrev} style={{
              background: c.card2, border: "1px solid " + c.border, borderRadius: 12,
              padding: "11px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer",
              color: c.sub, fontFamily: "inherit", flexShrink: 0,
            }}>← Back</button>
          )}
          <button onClick={onSkip} style={{
            background: "none", border: "none", padding: "11px 12px", fontSize: 13,
            fontWeight: 600, cursor: "pointer", color: c.sub, fontFamily: "inherit",
            flexShrink: 0,
          }}>Skip tour</button>
          <button onClick={onNext} style={{
            flex: 1, background: c.accent, border: "none", borderRadius: 12,
            padding: "12px", fontSize: 15, fontWeight: 800, cursor: "pointer",
            color: "#fff", fontFamily: "inherit",
          }}>{isLast ? "Done 🎉" : "Next →"}</button>
        </div>
      </div>
    </div>
  );
}
