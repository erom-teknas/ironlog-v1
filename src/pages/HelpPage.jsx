import React, { useState } from 'react';
import { IChev } from '../icons';

export default function HelpPage({c,onStartTour}){
  const [open,setOpen]=useState(null);
  const [query,setQuery]=useState("");
  const sections=[
    {id:"start",icon:"🏋️",title:"Getting Started",items:[
      {q:"How do I log a workout?",a:"Tap Log in the bottom nav → tap Add Exercise → choose a muscle group and tap any exercise. Enter weight and reps for each set, then tap ✓ to mark a set done. When you're finished, tap Finish Workout."},
      {q:"What is a blank workout vs. a routine?",a:"A blank workout is freestyle — you add whichever exercises you like as you go. A routine is a saved template (like Push Day) that pre-loads your exercises and fills in the weights from your last session automatically."},
      {q:"How do I name my workout?",a:"Tap the name field at the top of the log screen (it shows 'Workout name…') and type whatever you like. The name is saved in your history."},
      {q:"Will my data survive if I update or reinstall the app?",a:"Yes. All your workouts, routines, and body weight entries are stored directly on your device and are completely safe through app updates. If you're reinstalling, use Export File first to save a backup."},
    ]},
    {id:"log",icon:"📝",title:"Logging Sets",items:[
      {q:"What does the ✓ button do?",a:"Marks that set as completed. The row fades to show it's done. If Auto-rest (AUTO button) is on, the rest timer starts automatically. Tap ✓ again on a completed set to remove it."},
      {q:"How do I remove an exercise from my workout?",a:"Tap the red trash icon (🗑) on the exercise card. A confirmation prompt will appear. Tap OK to remove it. This only removes it from the current workout — it stays in the exercise library."},
      {q:"How do I change the order of exercises mid-workout?",a:"Press and hold the ≡ (three-line) handle on the left side of any exercise card, then drag it to the position you want. Release to drop. The order updates immediately."},
      {q:"How do I remove a set?",a:"Tap ✓ on a set that is already marked done — this deletes it. Alternatively, tap ✓ to mark it done first, then tap ✓ again to remove it."},
      {q:"What is the ⤢ Focus button?",a:"Tap the exercise name to open a full-screen view for just that exercise — bigger inputs, bigger buttons, easier to read mid-lift. Tap ← Back when done."},
      {q:"What is the + button next to the weight? How does the plate picker work?",a:"Opens the plate picker. The big number shown is the TOTAL weight on the bar (bar + all plates). Tap a plate circle to add one plate each side — the total updates immediately. The bar weight is already included, so if you see '45lb bar' and tap a 45lb plate, the total becomes 135lb (45 bar + 45 per side × 2). Tap − under a plate to remove it. For cables and machines, switch to × 1 mode so plates add once instead of twice."},
      {q:"The plate chips on the card show wrong plates — how do I fix it?",a:"Make sure the weight field shows the full total including the bar (e.g. 135lb for barbell + two 45lb plates). If you typed the weight manually without the bar, add the bar weight to it. The plate display always works backwards from the total weight — it subtracts the bar first, then splits what's left equally per side."},
      {q:"What is the set copy feature?",a:"Every time you tap '+ Add set', the new set automatically copies the weight and reps from the previous set. No need to re-type the same numbers."},
      {q:"What is the BW toggle?",a:"Marks the exercise as bodyweight (pull-up, dip, push-up). If you've logged your body weight, you can also add extra weight (vest, belt) and IronLog shows the combined total."},
      {q:"What is the bar type dropdown?",a:"Tells the plate calculator which bar you're using. Barbell = 20 kg / 45 lb bar. EZ Bar = 10 kg / 25 lb bar. Dumbbell and No Bar mean the weight you enter is the full weight with no bar subtracted."},
      {q:"What is the AUTO button?",a:"When AUTO is lit up, the rest timer starts on its own every time you complete a set. When off, start it manually by tapping the REST circle. AUTO uses each exercise's saved rest time (see per-exercise rest below)."},
      {q:"How do I change the rest timer duration?",a:"Tap the REST circle to start it, then tap again to cycle through 60s → 120s → 180s → off. Whatever you last set, AUTO will use for the next set."},
      {q:"How do I set a different rest time for each exercise?",a:"On each exercise card you'll see a small timer control showing the current rest duration (e.g. 60s) with − and + buttons. Tap + or − to adjust in 15-second steps. IronLog remembers this per exercise and uses it automatically whenever AUTO-rest fires for that exercise."},
      {q:"What does the BW toggle do to my 1RM calculation?",a:"When BW is on for an exercise (pull-up, dip etc.) IronLog adds your most recently logged body weight to any extra weight you entered. So if you weigh 80 kg and added 10 kg, your 1RM is calculated on 90 kg. This makes pull-up PRs accurate and comparable."},
      {q:"What is the 🔔 bell button?",a:"Enables notifications so IronLog can alert you when your rest is up — even if your phone screen is locked. Tap it once to give permission. You only need to do this once."},
      {q:"What are Warm-up / Working / Drop set labels?",a:"Set type labels you can assign in routines. Warm-up sets show in amber — they don't affect the progression calculation. Drop sets show in red. Working sets are your main lifting sets."},
      {q:"What is the exercise history shown on each card?",a:"The last 3 sessions for that exercise appear just below the exercise name — date, sets, weight × reps. Lets you see at a glance what you did last time without leaving the screen."},
      {q:"How do I add notes or form cues to an exercise?",a:"Tap the '+ Notes' button on any exercise card. A text field appears where you can write form cues, coaching tips, or reminders. The notes stay visible while you log that exercise."},
      {q:"What is a Superset?",a:"Tap '⚡ SS' on an exercise to mark it as part of a superset — exercises performed back-to-back with no rest between them. A visual amber connector banner appears between the paired exercises showing the name of the next exercise as a reminder."},
      {q:"What is RPE and how do I log it?",a:"RPE (Rate of Perceived Exertion) is a 1–10 scale of how hard a set felt — 10 is an all-out max effort, 7–8 is challenging but doable. Tap 'RPE/Tempo' on any exercise card to show the RPE and Tempo fields below each set. Enter a number 1–10 for RPE and a pattern like 3-1-1 for tempo (eccentric-pause-concentric seconds). These are optional and stored with the set."},
      {q:"What is tempo logging?",a:"Tempo describes how many seconds each phase of a rep takes — e.g. 3-0-1 means 3 seconds lowering, 0 second pause at bottom, 1 second lifting. Tap 'RPE/Tempo' on an exercise to show the tempo field for each set. Enter any notation you like (3-1-1, 2-0-2, X-0-1 etc.)."},
    ]},
    {id:"plates",icon:"🔵",title:"Plates & My Plates",items:[
      {q:"Where do I set up my plates?",a:"Home screen → scroll to My Plates. Tap a plate circle to toggle it on (coloured = you have it) or off (dimmed = you don't). Only your owned plates show in the picker during workouts."},
      {q:"How do I add a custom plate size?",a:"In My Plates, type your plate weight in the 'Custom plate' field and tap Add. It appears as a circle with a × to remove it. Useful for 2.5 lb micro-plates, 17.5 kg plates, and so on."},
      {q:"How do I delete a custom exercise I added by mistake?",a:"In the Add Exercise picker (when logging or in Routines), find your custom exercise under 'MY EXERCISES' and swipe it left. A red Delete button appears — tap it to remove. Built-in exercises cannot be deleted."},
      {q:"The plate chips on the card show wrong plates — why?",a:"The plate display works from the total weight in the field (bar included). If you entered the weight manually without including the bar, the chips will be wrong. Always use the + plate picker to build the weight — it automatically includes the bar so the maths is always right."},
      {q:"The plate picker doubled my weight for cables — how do I fix it?",a:"Tap the toggle button inside the plate picker (it says '× 2' or '× 1'). For cables, machines and dumbbells it should show × 1. The app tries to detect this automatically from the exercise name, but you can always override it."},
    ]},
    {id:"history",icon:"🕘",title:"History & Sharing",items:[
      {q:"How do I search workout history?",a:"History tab → search bar at the top. You can search by workout name, exercise name, muscle group (e.g. 'chest', 'legs', 'back'), notes, or date. Matching workouts are shown instantly. Tap × to clear the search."},
      {q:"How do I repeat a past workout?",a:"History tab → tap any workout to expand it → tap 🔁 Repeat. IronLog pre-fills the Log screen with the exact same exercises, sets, weights and reps from that session. You can edit anything before you start."},
      {q:"How do I share a workout summary?",a:"History tab → expand a workout → Share button → the Share card appears. Tap ⬆ Share to open the iOS share sheet (Messages, Instagram, Notes etc.). On desktop, tap 📋 Copy to copy a text summary to the clipboard."},
    ]},
    {id:"calendar",icon:"📅",title:"Workout Calendar",items:[
      {q:"Where is the workout calendar?",a:"Progress tab → top of the screen. A full monthly calendar shows every day you trained, colour-coded by muscle group. Tap the arrows to browse previous months."},
      {q:"What do the coloured dots mean?",a:"Each colour represents a muscle group — purple for Chest, green for Back, yellow for Legs, and so on. The legend is shown below the calendar. Multiple dots on one day means you trained multiple muscle groups."},
    ]},
    {id:"progress",icon:"📈",title:"Progress & Charts",items:[
      {q:"How do I track strength progress for an exercise?",a:"Progress tab → tap '+ Add exercise' → choose an exercise. A chart appears showing your estimated 1RM or max weight over time. Add up to 4 exercises at once to compare."},
      {q:"What is Est. 1RM?",a:"Estimated one-rep max — a way to compare sets of different reps. Calculated from your working sets: weight × (1 + reps ÷ 30), capped at 15 reps to avoid endurance-set inflation. For bodyweight exercises your body weight is included. Higher is better, regardless of rep count."},
      {q:"What is the weekly volume bar chart?",a:"Total weight lifted per calendar week. Scroll left to see older weeks. Useful for spotting trends — are you doing more or less total work over time?"},
      {q:"What is the Muscle Group Volume chart?",a:"Below the weekly volume bars, tap any muscle group (Chest, Back, Legs etc.) to see a bar chart of weekly volume just for that muscle. Great for checking whether you're neglecting a particular group over time."},
      {q:"What is the Workout Duration chart?",a:"Progress tab → Workout Duration section. Shows a line chart of how long each session lasted in minutes, with your average duration in the subtitle. Only workouts with a recorded duration appear. Useful for tracking whether your sessions are getting longer or shorter over time."},
      {q:"What is the Muscle Frequency heatmap?",a:"Progress tab → Muscle Frequency section. Shows a grid of your top muscle groups × the last 8 calendar weeks. Darker cells = more exercises logged for that muscle that week. Numbers inside each cell show the exact count. Great for spotting muscle groups you've been neglecting."},
      {q:"How do I log body measurements?",a:"Progress tab → Body Measurements → enter values for Chest, Waist, Hips, Biceps, and Thighs. Toggle between cm and inches using the buttons at the top of that section. Tap Save Measurements to store the entry. A mini trend line appears for each field once you have 2+ entries. Green = getting smaller (good for waist), red = getting larger."},
      {q:"What unit are body measurements stored in?",a:"Body measurements use cm or inches — completely separate from the kg/lb weight unit toggle. Switch between them inside the Body Measurements section on the Progress tab. The unit you choose is saved and remembered."},
    ]},
    {id:"routines",icon:"📋",title:"Routines & Progression",items:[
      {q:"What is automatic progression?",a:"When you start a routine and completed every set last time, IronLog adds the set increment (e.g. +2.5 kg) automatically. No manual tracking — the app does it for you."},
      {q:"What is the deload badge?",a:"If you fail to complete all sets in two back-to-back sessions, IronLog automatically reduces the weight by 10% on your next session. This prevents you from grinding against the same weight forever."},
      {q:"How do I create my own routine?",a:"Routines tab → New → name it, choose a colour and category → select a Periodization Block → Add Exercise → set target weight and reps per set, with optional Warm-up/Working/Drop labels. Tap Save."},
      {q:"Are last-session weights filled in automatically?",a:"Yes. When you start any routine, IronLog finds your most recent session for each exercise and pre-fills those weights. You can change them at any time before or during the workout."},
      {q:"What is a Periodization Block?",a:"A label on a routine that describes its training phase — Hypertrophy, Strength, Peaking, Maintenance, Cut, Deload, or Custom. It's shown as a badge on the routine card so you can quickly see what phase each program is in. No rules are enforced — it's a reference tag for your own organisation."},
      {q:"What is the Weekly Schedule view?",a:"Routines tab → tap 📅 Schedule. A Mon–Sun grid appears. Tap any day tile to assign a routine to it — the tile shows the routine name and colour. Tap ✕ Rest day to clear a day. This is a visual planner only — IronLog doesn't auto-start sessions, but it shows you the plan at a glance so you always know what's next."},
    ]},
    {id:"reorder",icon:"↕️",title:"Reordering Exercises",items:[
      {q:"How do I reorder exercises in a workout?",a:"Every exercise card has a ≡ (three-line) drag handle on the left. Press and hold it, then drag the card up or down to the new position. Release to drop. Works in both the active Log screen and the Routines editor."},
      {q:"Can I reorder exercises in a saved routine?",a:"Yes. Open the routine in the editor (Routines tab → tap a routine → Edit) and drag the ≡ handles. Save the routine when done — the new order is preserved."},
    ]},
    {id:"newfeatures",icon:"✨",title:"Activity, Balance & Standards",items:[
      {q:"What is the Activity Streak calendar?",a:"Progress tab → Activity Streak. A GitHub-style 52-week grid where each cell is one day — darker cells mean more workouts. Shows your current streak (consecutive days trained), all-time best streak, and total sessions this year. Great for spotting rest day patterns and keeping your streak alive."},
      {q:"What is the Muscle Balance radar chart?",a:"Progress tab → Muscle Balance. A spider/radar chart with 8 axes — Chest, Back, Shoulders, Legs, Biceps, Triceps, Core, Cardio. The filled area shows your volume distribution across muscle groups for the selected time range. A balanced shape means even training; a lopsided shape highlights gaps."},
      {q:"What is the Push:Pull ratio?",a:"Inside the Muscle Balance section, a bar shows the ratio of push volume (Chest + Shoulders + Triceps) to pull volume (Back + Biceps). A 1:1 ratio is ideal for shoulder health and balanced development. Green = balanced, amber = slightly off, red = significantly imbalanced with a tip to fix it."},
      {q:"What are Strength Standards?",a:"Progress tab → Strength Standards. Compares your best estimated 1RM for Bench Press, Squat, Deadlift, Overhead Press, and Barbell Row against bodyweight multiplier benchmarks. Five levels: Untrained → Novice → Intermediate → Advanced → Elite. Also shows exactly how many kg/lb you need to reach the next level."},
      {q:"Why do Strength Standards show no comparisons?",a:"You need to log your bodyweight on the Home tab first. Without it, IronLog can't calculate the bodyweight multiplier ratios. Once logged, all five lifts update immediately. Your best 1RM is estimated from your entire history — not just the selected time range."},
      {q:"How do I switch between male and female strength standards?",a:"Inside the Strength Standards section on the Progress tab, tap ♂ Male or ♀ Female at the top. The levels and thresholds update instantly to use the correct bodyweight multipliers for your gender. Your choice is saved and remembered across sessions."},
      {q:"Why are female standards lower than male?",a:"Strength standards are based on bodyweight multipliers derived from large population data. On average, female athletes produce less absolute force relative to bodyweight on barbell lifts — this is normal physiology, not a value judgement. The levels (Untrained → Elite) are equally challenging relative to each group."},
      {q:"How does the History 'Load more' button work?",a:"History shows 20 workouts at a time to keep scrolling fast even with hundreds of entries. Tap 'Load more' at the bottom to show the next 20. Searching resets back to the first 20 results automatically."},
    ]},
    {id:"prs",icon:"🏆",title:"Personal Records",items:[
      {q:"What is Best Weight PR?",a:"The highest single weight lifted for each exercise across all logged sessions. Ranked gold/silver/bronze for your top 3. Tap any exercise to see its estimated 1RM trend over time."},
      {q:"What is Best Volume PR?",a:"The highest single-session total volume (weight × reps across all sets) for each exercise. Switch between Best Weight and Best Volume using the toggle at the top of the PRs tab. Tap any exercise to see its volume trend over time."},
    ]},
    {id:"milestones",icon:"🏆",title:"Milestones & Theme",items:[
      {q:"What are workout milestones?",a:"IronLog celebrates when you hit 1, 5, 10, 25, 50, 100, 200 and 365 total workouts. A pop-up appears as soon as you save the milestone workout. Each milestone is shown only once — it won't nag you again."},
      {q:"How do I change the theme?",a:"Tap the ●/🌙/☀️/A icon in the top-right corner. It cycles through four modes: Dark (🌙) → OLED Black (●) → Auto (A) → Light (☀️) → back to Dark. OLED mode uses pure black — ideal for OLED iPhone screens to save battery. Auto follows your iOS system appearance automatically."},
    ]},
    {id:"data",icon:"💾",title:"Data & Backup",items:[
      {q:"Is my data safe? What happens if the app updates?",a:"Your workouts, routines, body weight log, and custom exercises are stored in IndexedDB — a persistent local database on your device that survives app updates, cache clears, and PWA reinstalls. Data is only lost if you manually clear all website data in Settings."},
      {q:"Does IronLog auto-save?",a:"Yes — every time you open the app, a silent daily snapshot is saved to your device (IndexedDB) automatically, covering your workouts, routines, body weight, and custom exercises. The last 7 daily snapshots are kept as a rolling safety net. The Home screen shows the date of the last snapshot."},
      {q:"What is Export File for?",a:"Creates a full backup file (JSON) containing all your workouts, routines, body weight entries and custom exercises. The file downloads to your Files app. Use it to move data to a new phone, save to iCloud, or email it to yourself. Always export before uninstalling the app."},
      {q:"How do I restore from a backup?",a:"Home → Backup & Restore → Restore File → pick your IronLog backup file. Choose Merge to add its records to your existing data, or Replace to swap completely. Both your workouts and routines are restored."},
      {q:"What is Export CSV for?",a:"Downloads a spreadsheet-compatible file of all your workout data. Useful for analysis in Excel, Google Sheets, or any fitness tracking tool. CSV is export-only — it cannot be imported back."},
      {q:"How often should I export a file backup?",a:"Once a week is a good habit if you train regularly. The auto-snapshot protects you on the same device, but a file export is your off-device insurance. The Home screen shows a daily backup reminder banner."},
      {q:"How does QR Transfer work?",a:"Home → Backup & Restore → 📱 QR Export. IronLog compresses your full backup into one or more QR codes. On your other device, open IronLog → Backup & Restore → 📷 QR Import, then paste the QR code text (or scan with your camera and copy the text). If your data is large, multiple QR codes are generated — scan them in order (1 of N, 2 of N…). All your workouts, routines, and body weight are transferred without any cloud or account."},
    ]},
    {id:"reminders",icon:"🔔",title:"Workout Reminders",items:[
      {q:"How do I set a workout reminder?",a:"Home → Workout Reminder section → tap a day option (1d, 2d, 3d etc.). If you haven't logged a workout within that many days, IronLog fires a push notification at 9am reminding you to train. Tap Off to disable."},
      {q:"When does the reminder fire?",a:"At 9am on the day you're overdue. For example, if you set 2d and your last workout was Monday, you'll get a notification Wednesday morning at 9am. If you're already overdue when you open the app, the reminder is scheduled for 9am the next morning."},
      {q:"Why isn't my reminder working?",a:"Two things are required: (1) notification permission must be granted — tap any day option and IronLog will ask for permission if needed, and (2) your phone must receive the notification while the browser or PWA is running in the background. iOS requires the app to be added to your Home Screen for background notifications to work."},
    ]},
    {id:"body",icon:"⚖️",title:"Body Weight",items:[
      {q:"How do I log my body weight?",a:"Home screen → Body Weight card → type your weight → tap Log. Supports both kg and lb — follows whichever unit you've selected. Multiple entries build a trend chart in Progress."},
      {q:"How does body weight show in exercises?",a:"When you toggle BW on an exercise (e.g. pull-up), the base shows your most recently logged body weight. Add extra weight in the Extra field if you're wearing a vest or holding a dumbbell."},
    ]},
  ];
  // Search across all items
  const q2=query.trim().toLowerCase();
  const filtered=q2?sections.map(sec=>({...sec,items:sec.items.filter(it=>it.q.toLowerCase().includes(q2)||it.a.toLowerCase().includes(q2))})).filter(sec=>sec.items.length):sections;
  return(
    <div style={{padding:"20px 16px 100px"}}>
      <h2 style={{fontSize:23,fontWeight:900,margin:"0 0 4px",color:c.text,letterSpacing:"-0.02em"}}>Help & Guide</h2>
      <p style={{fontSize:13,color:c.sub,marginBottom:12}}>Tap any question to expand. Tap the <strong style={{color:c.accent}}>?</strong> badges in the app for instant tips.</p>
      {onStartTour&&<button onClick={onStartTour} style={{width:"100%",background:"linear-gradient(135deg,"+c.accent+"33,"+c.accent+"11)",border:"1.5px solid "+c.accent+"55",borderRadius:16,padding:"14px 16px",marginBottom:16,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
        <span style={{fontSize:24,flexShrink:0}}>🗺️</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:800,fontSize:14,color:c.accent,marginBottom:2}}>Replay App Tour</div>
          <div style={{fontSize:12,color:c.sub}}>20-step walkthrough of every feature — tap to start</div>
        </div>
        <span style={{fontSize:16,color:c.accent,flexShrink:0}}>→</span>
      </button>}
      {/* Search */}
      <div style={{position:"relative",marginBottom:16}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search help…"
          style={{width:"100%",background:c.card,border:"1.5px solid "+c.border,borderRadius:13,padding:"10px 36px 10px 14px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        {query&&<button onClick={()=>setQuery("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:c.sub,fontSize:16,lineHeight:1,padding:4}}>×</button>}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:c.sub,fontSize:14}}>No results for "{query}"</div>}
      {filtered.map(sec=>(
        <div key={sec.id} style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,marginBottom:14,overflow:"hidden"}}>
          <div style={{padding:"13px 16px",borderBottom:"1px solid "+c.border,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>{sec.icon}</span>
            <span style={{fontWeight:900,fontSize:15,color:c.text}}>{sec.title}</span>
            <span style={{marginLeft:"auto",fontSize:11,color:c.sub}}>{sec.items.length} topic{sec.items.length!==1?"s":""}</span>
          </div>
          {sec.items.map((item,i)=>{
            const key=sec.id+"_"+i;
            const isOpen=open===key;
            return(
              <div key={i} style={{borderBottom:i<sec.items.length-1?"1px solid "+c.border:"none"}}>
                <button onClick={()=>setOpen(isOpen?null:key)}
                  style={{width:"100%",background:"none",border:"none",padding:"13px 16px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                  <span style={{fontSize:13,fontWeight:700,color:c.text,flex:1,lineHeight:1.4}}>{item.q}</span>
                  <span style={{color:c.sub,flexShrink:0,transition:"transform .2s",transform:isOpen?"rotate(90deg)":"rotate(0deg)",display:"inline-block",opacity:0.6}}><IChev/></span>
                </button>
                {isOpen&&<div style={{padding:"0 16px 14px",fontSize:13,color:c.sub,lineHeight:1.7,background:c.card2}}>{item.a}</div>}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:"16px",marginBottom:14,textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:8}}>💪</div>
        <div style={{fontWeight:800,fontSize:15,color:c.text,marginBottom:6}}>IronLog</div>
        <div style={{fontSize:12,color:c.sub,lineHeight:1.7}}>Track. Lift. Grow.<br/>Your data never leaves your phone.<br/>No account. No subscription. No ads.</div>
      </div>
    </div>
  );
}
