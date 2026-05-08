import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MG, EX, BAR_TYPES, PLATES_LB, PLATES_KG, PCOL_LB, PCOL } from '../constants';
import { uid, today, fmtD, calcVol, bestRM, calc1RM, kgToLb, fmtW, storeW, calcPlates, fmtVol, haptic, isCardioEx, getExInputType, isTimedEx } from '../utils';
import { useConfirm } from '../hooks.jsx';
import { ITrash, ICheck, IX, IChev, IBell, IStar, IActivity, IPencil, IBarbell } from '../icons';
import { Pill } from '../components/Primitives';
import SwipeToDelete from '../components/SwipeToDelete';
import RestTimerCircle from '../components/RestTimerCircle';
import PlateCircle from '../components/PlateCircle';
import DragSortList from '../components/DragSortList';
import WorkoutTimer from '../components/WorkoutTimer';
import VirtualList from '../components/VirtualList';


// ─── PR Confetti ──────────────────────────────────────────────────────────────
const CONFETTI_COLS=["#7C6EFA","#10d9a0","#f6a835","#ff6b6b","#06b6d4","#a78bfa","#fbbf24"];
function PRConfetti({onDone}){
  const pieces=useMemo(()=>Array.from({length:48},(_,i)=>({
    id:i, x:Math.random()*100,
    delay:Math.random()*0.7,
    dur:1.2+Math.random()*0.9,
    col:CONFETTI_COLS[Math.floor(Math.random()*CONFETTI_COLS.length)],
    w:5+Math.random()*7, h:8+Math.random()*10,
    rot:Math.random()*360,
  })),[]);
  useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t);},[onDone]);
  return createPortal(
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:9999,overflow:'hidden'}}>
      {pieces.map(p=>(
        <div key={p.id} style={{
          position:'absolute',top:'-5%',left:p.x+'%',
          width:p.w,height:p.h,background:p.col,
          borderRadius:2,
          animation:`il-confetti ${p.dur}s ${p.delay}s ease-in forwards`,
          transform:`rotate(${p.rot}deg)`,
        }}/>
      ))}
      <div style={{position:'absolute',top:'38%',left:'50%',transform:'translate(-50%,-50%)',
        fontSize:52,animation:'il-spring .5s cubic-bezier(0.34,1.56,0.64,1) both',
        textAlign:'center',lineHeight:1}}>
        🏆<div style={{fontSize:18,fontWeight:900,color:'#f6a835',letterSpacing:'-0.01em',marginTop:6,
          textShadow:'0 2px 12px rgba(0,0,0,0.8)'}}>New PR!</div>
      </div>
    </div>
  ,document.body);
}

// ─── SW Notification helpers ─────────────────────────────────────────────────
function swNotif(delaySecs,label){
  if(!('serviceWorker' in navigator))return;
  var reg=window._swReg;
  if(!reg||!reg.active)return;
  if(delaySecs>0){
    reg.active.postMessage({type:'SCHEDULE_NOTIF',delay:delaySecs*1000,label:label||'Rest done — next set!'});
  } else {
    reg.active.postMessage({type:'CANCEL_NOTIF'});
  }
}
function requestNotifPermission(){
  if(!('Notification' in window))return Promise.resolve('denied');
  if(Notification.permission==='granted')return Promise.resolve('granted');
  return Notification.requestPermission();
}

// ─── SET LABEL CONFIG ────────────────────────────────────────────────────────
const SET_LABELS=["Working","Warm-up","Drop set"];
function nextLabel(cur){const i=SET_LABELS.indexOf(cur||"Working");return SET_LABELS[(i+1)%SET_LABELS.length];}

export default function LogPage({initial:init,c,unit="kg",logName,finishRef,onSave,
  draftExs,setDraftExs,draftRating,setDraftRating,draftNotes,setDraftNotes,
  draftT0,draftWorkoutT0,onDiscard,timerSecs,timerStart,lastTimerSecs=60,startTimer,cycleTimer,stopTimer,
  customExercises={},customExTypes={},onAddCustomEx,onDeleteCustomEx,onRenameCustomEx,hist=[],gymPlates=[],bwLog=[],
  restPresets={},onSaveRestPreset,
  collapsedExs,setCollapsedExs,
  deloadNotice=false,onDismissDeload}){
  // ALL hooks at top — no hooks after conditional returns (React rule)
  const exs=draftExs, setExs=setDraftExs;
  const rating=draftRating, setRating=setDraftRating;
  const notes=draftNotes, setNotes=setDraftNotes;
  const {confirm:dlgConfirm,confirmEl}=useConfirm(c);
  const [platePickerFor,setPlatePickerFor]=useState(null);
  const [plateConfirmed,setPlateConfirmed]=useState({});
  const seeded=useRef(false);
  // Refs so tog() can read current timer values without being recreated every tick
  const timerSecsRef=useRef(timerSecs);
  const timerStartRef=useRef(timerStart);
  useEffect(()=>{timerSecsRef.current=timerSecs;},[timerSecs]);
  useEffect(()=>{timerStartRef.current=timerStart;},[timerStart]);
  useEffect(()=>{seeded.current=false;},[init]);
  useEffect(()=>{
    if(!seeded.current&&init&&exs.length===0){
      const seededExs=init.exercises.map(e=>({...e,id:uid(),sets:e.sets.map(s=>({...s,id:uid(),done:false}))}));
      setExs(seededExs);
      // Pre-populate exNotes from stored notes on each exercise (repeat / plan load)
      const initNotes={};
      seededExs.forEach(e=>{if(e.notes)initNotes[e.id]=e.notes;});
      if(Object.keys(initNotes).length)setExNotes(initNotes);
      seeded.current=true;
    }
  },[init,exs.length]);
  // Collapse already-completed exercises whenever exs changes (covers load + manual mark-done)
  useEffect(()=>{
    if(!exs.length)return;
    const toCollapse=exs.filter(e=>e.sets.length>0&&e.sets.every(s=>s.done)).map(e=>e.id);
    if(!toCollapse.length)return;
    setCollapsedExs(prev=>{
      const next=new Set(prev);
      let changed=false;
      toCollapse.forEach(id=>{if(!next.has(id)){next.add(id);changed=true;}});
      return changed?next:prev;
    });
  },[exs]);
  // elapsedSec is now managed by <WorkoutTimer> — isolated to prevent
  // per-second re-renders of the entire LogPage.

  // Screen Wake Lock — keep screen on during workout, release when hidden to save battery
  useEffect(()=>{
    if(!('wakeLock' in navigator))return;
    let lock=null;
    const acquire=()=>{if(document.visibilityState==='visible')navigator.wakeLock.request('screen').then(l=>{lock=l;}).catch(()=>{});};
    const release=()=>{if(lock){lock.release().catch(()=>{});lock=null;}};
    const onVis=()=>{document.visibilityState==='visible'?acquire():release();};
    document.addEventListener('visibilitychange',onVis);
    acquire();
    return()=>{document.removeEventListener('visibilitychange',onVis);release();};
  },[]);
  // collapsedExs is now a PROP (lifted to App) so it persists across tab switches
  const [exOptionsFor,setExOptionsFor]=useState(null); // exId | null — ⋯ options sheet
  const [picker,setPicker]=useState(false);
  const [pickerScreen,setPickerScreen]=useState("grid"); // "grid" | "list"
  const [pm,setPm]=useState(MG[0]);
  // Auto-guess inputType for new custom exercises based on muscle group
  const guessExType=(muscle)=>muscle==="Cardio"?"cardio":(muscle==="Core"||muscle==="Glutes")?"bodyweight":"weighted";
  const [search,setSearch]=useState("");
  // Muscle group visual config — emoji + accent color per group
  const MG_ICONS={
    Chest:    {e:"🏋️",c:"#ef4444"},
    Back:     {e:"🤸",c:"#3b82f6"},
    Shoulders:{e:"🔺",c:"#f59e0b"},
    Biceps:   {e:"💪",c:"#8b5cf6"},
    Triceps:  {e:"🤜",c:"#ec4899"},
    Legs:     {e:"🦵",c:"#22c55e"},
    Core:     {e:"🎯",c:"#06b6d4"},
    Glutes:   {e:"🏃",c:"#f97316"},
    Cardio:   {e:"❤️",c:"#10d9a0"},
  };
  const closePicker=()=>{setPicker(false);setPickerScreen("grid");setSearch("");setNewExName("");setEditingEx(null);};
  const openMuscle=(m)=>{setPm(m);setPickerScreen("list");setSearch("");setNewExName("");setNewExType(guessExType(m));setEditingEx(null);};
  const [newExName,setNewExName]=useState("");
  const [newExType,setNewExType]=useState("weighted");
  const [editingEx,setEditingEx]=useState(null);
  const [editExVal,setEditExVal]=useState("");
  const [saved,setSaved]=useState(false);
  const [focusedExId,setFocusedExId]=useState(null);
  const [showConfetti,setShowConfetti]=useState(false);
  const [exNotes,setExNotes]=useState({}); // {exId: string} — per-exercise cues
  const [notifGranted,setNotifGranted]=useState(typeof Notification!=='undefined'&&Notification.permission==='granted');
  const swipeTouchX=useRef(null); // for swipe-between-exercises in focus mode

  // ── Visual viewport tracking (keyboard-aware height) ──────────────────────
  // When the soft keyboard opens on iOS, window.visualViewport.height shrinks.
  // We use this to squeeze the deck container so the card never flies off-screen.
  const [vvHeight,setVvHeight]=useState(()=>window.visualViewport?.height||window.innerHeight);
  const prevVvHeightRef=useRef(window.visualViewport?.height||window.innerHeight);
  useEffect(()=>{
    const vv=window.visualViewport;
    if(!vv)return;
    let raf=null;
    const fn=()=>{
      if(raf)cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        const h=vv.height;
        prevVvHeightRef.current=h;
        setVvHeight(h);
        raf=null;
      });
    };
    vv.addEventListener('resize',fn);
    vv.addEventListener('scroll',fn);
    return()=>{vv.removeEventListener('resize',fn);vv.removeEventListener('scroll',fn);if(raf)cancelAnimationFrame(raf);};
  },[]);

  // ── Feature 1: last session lookup ────────────────────────────────────────
  const lastSessionSets=useCallback((name)=>{
    for(var i=hist.length-1;i>=0;i--){
      var ex=hist[i].exercises.find(e=>e.name===name);
      if(ex&&ex.sets&&ex.sets.length)return ex.sets;
    }
    return null;
  },[hist]);

  // ── Feature 4: last N sessions for mini-history ───────────────────────────
  const lastNSessions=useCallback((name,n=3)=>{
    var results=[];
    for(var i=hist.length-1;i>=0&&results.length<n;i--){
      var ex=hist[i].exercises.find(e=>e.name===name);
      if(ex&&ex.sets&&ex.sets.length)results.push({date:hist[i].date,sets:ex.sets});
    }
    return results;
  },[hist]);

  // ── Feature 5: mid-workout PR flash banner ───────────────────────────────
  const [prBanner,setPrBanner]=useState(null); // {exName, rm, unit}
  const prBannerTimer=useRef(null);
  const firePrBanner=useCallback((exName,rm,u)=>{
    clearTimeout(prBannerTimer.current);
    setPrBanner({exName,rm,u});
    prBannerTimer.current=setTimeout(()=>setPrBanner(null),3000);
  },[]);

  // ── Feature 3: overload indicator ─────────────────────────────────────────
  const overloadBadge=(ex)=>{
    var last=lastSessionSets(ex.name);
    if(!last)return null;
    var lastVol=last.reduce((s,x)=>(parseFloat(x.weight)||0)*(parseInt(x.reps)||0)+s,0);
    var curVol=ex.sets.filter(s=>s.done).reduce((s,x)=>(parseFloat(x.weight)||0)*(parseInt(x.reps)||0)+s,0);
    var lastMaxW=Math.max(...last.map(s=>parseFloat(s.weight)||0));
    var curMaxW=Math.max(...ex.sets.filter(s=>s.done).map(s=>parseFloat(s.weight)||0),0);
    if(curVol===0&&curMaxW===0)return{icon:"📋",text:"Last: "+last[0].reps+"×"+(unit==="lb"?Math.round(kgToLb(parseFloat(last[0].weight)||0)):parseFloat(last[0].weight)||0)+unit,col:c.sub};
    if(curMaxW>lastMaxW)return{icon:"↑",text:"Weight PR!",col:c.g};
    if(curVol>lastVol)return{icon:"↑",text:"Vol up",col:c.g};
    if(curVol===lastVol)return{icon:"→",text:"Same",col:c.am};
    return{icon:"↓",text:"Vol down",col:c.r};
  };

  const inferBarType=(name,muscle)=>{
    var n=(name||"").toLowerCase();
    var m=(muscle||"").toLowerCase();
    // Cardio / core bodyweight-only groups — no equipment
    if(m.includes("cardio")||m.includes("stretch")||m.includes("mobility")||m.includes("yoga")||m.includes("hiit")||m.includes("plyom"))return"none";
    // Bodyweight-only exercise names
    if(n.includes("run")||n.includes("bike")||n.includes("cycl")||n.includes("treadmill")||n.includes("elliptic")||n.includes("stair")||n.includes("swim")||n.includes("sprint")||n.includes("hiit")||n.includes("burpee")||n.includes("mountain climb")||n.includes("plank")||n.includes("stretch")||n.includes("yoga")||n.includes("foam roll")||n.includes("pull-up")||n.includes("pullup")||n.includes("chin-up")||n.includes("push-up")||n.includes("pushup"))return"none";
    // Explicit equipment in name — always wins
    if(n.includes("smith machine")||n.includes("smith"))return"smith";
    if(n.includes("ez-bar")||n.includes("ez bar"))return"ez";
    if(n.includes("skull crusher"))return"ez";
    if(n.includes("barbell")||n.includes(" bar "))return"barbell";
    if(n.includes("dumbbell")||n.includes(" db ")||n.startsWith("db "))return"dumbbell";
    if(n.includes("cable")||n.includes("pulley"))return"cable";
    if(n.includes("machine")||n.includes("pec deck")||n.includes("leg press")||n.includes("leg curl")||n.includes("leg extension")||n.includes("pulldown")||n.includes("seated row")||n.includes("hack squat machine"))return"machine";
    if(n.includes("kettlebell"))return"dumbbell";
    if(n.includes("trx")||n.includes("ring")||n.includes("band")||n.includes("resistance band")||n.includes("banded"))return"none";
    if(n.includes("landmine"))return"barbell";
    // ── Named-exercise lookup — best default for each well-known movement ────
    const DEFAULTS={
      // ── BARBELL ──
      "Bench Press":"barbell","Incline Bench Press":"barbell","Decline Bench Press":"barbell",
      "Wide-Grip Bench Press":"barbell","Spoto Press":"barbell","Floor Press":"barbell",
      "Paused Bench Press":"barbell","Guillotine Press":"barbell","Close-Grip Bench Press":"barbell",
      "Back Squat":"barbell","Front Squat":"barbell","Pause Squat":"barbell",
      "Safety Bar Squat":"barbell","Box Squat":"barbell","Anderson Squat":"barbell",
      "Overhead Squat":"barbell","Zercher Squat":"barbell","Jefferson Squat":"barbell",
      "Pin Squat":"barbell","Belt Squat":"barbell","Hack Squat":"barbell","Cyclist Squat":"barbell",
      "Deadlift":"barbell","Romanian Deadlift":"barbell","Stiff-Leg Deadlift":"barbell",
      "Rack Pull":"barbell","Deficit Deadlift":"barbell","Snatch-Grip Deadlift":"barbell",
      "Single-Leg Deadlift":"barbell","Trap Bar Deadlift":"barbell","Hex Bar Deadlift":"barbell",
      "Overhead Press":"barbell","Push Press":"barbell","Behind-the-Neck Press":"barbell",
      "Z-Press":"barbell","Bradford Press":"barbell","High Pull":"barbell",
      "Bent-Over Row":"barbell","Underhand Bent-Over Row":"barbell","Pendlay Row":"barbell",
      "T-Bar Row":"barbell","Seal Row":"barbell",
      "Walking Lunge":"barbell","Barbell Lunge":"barbell","Deficit Lunge":"barbell",
      "Good Morning":"barbell","Hyperextension":"barbell","Back Extension":"barbell",
      "Barbell Hip Thrust":"barbell","Smith Machine Hip Thrust":"smith",
      "Weighted Glute Bridge":"barbell",
      "Power Clean":"barbell","Power Snatch":"barbell","Hang Clean":"barbell",
      "JM Press":"barbell","Board Press":"barbell","Upright Row":"barbell",
      "Hip Thrust Feet-Elevated":"barbell",
      // ── EZ BAR ──
      "EZ-Bar Curl":"ez","EZ-Bar Skull Crusher":"ez","EZ-Bar Overhead Extension":"ez","21s":"ez",
      // ── DUMBBELL ──
      "Goblet Squat":"dumbbell","DB Lunge":"dumbbell","Step-Up":"dumbbell",
      "Reverse Lunge":"dumbbell","Lateral Lunge":"dumbbell","Curtsy Lunge":"dumbbell",
      "Split Squat":"dumbbell","Rear-Foot Elevated Split Squat":"dumbbell","Bulgarian Split Squat":"dumbbell",
      "Step-Up with Knee Drive":"dumbbell","Box Step-Up":"dumbbell",
      "Arnold Press":"dumbbell","Seated DB Press":"dumbbell","Dumbbell Shoulder Press":"dumbbell",
      "Lateral Raise":"dumbbell","Front Raise":"dumbbell","Alternating Front Raise":"dumbbell",
      "Kettlebell Front Raise":"dumbbell","Leaning Lateral Raise":"dumbbell",
      "Incline Lateral Raise":"dumbbell","Seated Lateral Raise":"dumbbell",
      "Rear Delt Fly":"dumbbell","Bent-Over Rear Delt Fly":"dumbbell",
      "Prone Y-Raise":"dumbbell","Prone T-Raise":"dumbbell","Prone W-Raise":"dumbbell",
      "Dumbbell Curl":"dumbbell","Hammer Curl":"dumbbell","Incline Curl":"dumbbell",
      "Concentration Curl":"dumbbell","Zottman Curl":"dumbbell","Cross-Body Curl":"dumbbell",
      "Alternating Curl":"dumbbell","Waiter Curl":"dumbbell","Drag Curl":"dumbbell",
      "Seated Alternating Curl":"dumbbell","Twisting DB Curl":"dumbbell","Spider Curl":"dumbbell",
      "Prone Incline Curl":"dumbbell","Isometric Curl":"dumbbell","Kettlebell Curl":"dumbbell",
      "Overhead Extension":"dumbbell","DB Overhead Extension":"dumbbell","Tate Press":"dumbbell",
      "Rolling Tricep Extension":"dumbbell","One-Arm Skull Crusher":"dumbbell",
      "Kickback":"dumbbell","DB Kickback":"dumbbell",
      "Single-Arm DB Row":"dumbbell","Incline DB Row":"dumbbell","Gorilla Row":"dumbbell",
      "Kroc Row":"dumbbell","Meadows Row":"dumbbell",
      "DB Hip Thrust":"dumbbell","Single-Leg Hip Thrust":"dumbbell","Frog Pump":"dumbbell",
      "Glute Bridge":"dumbbell","Single-Leg Glute Bridge":"dumbbell","Elevated Glute Bridge":"dumbbell",
      "Hip Raise":"dumbbell","Bridge March":"dumbbell","Weighted Sit-Up":"dumbbell",
      "Weighted Crunch":"dumbbell","Decline Crunch":"dumbbell","Medicine Ball Slam":"dumbbell",
      "Russian Twist":"dumbbell","Wood Chop":"dumbbell","Suitcase Carry":"dumbbell",
      "Farmer's Carry":"dumbbell","Farmer's Walk":"dumbbell",
      // ── CABLE ──
      "Face Pull":"cable","Pallof Press":"cable","Cable Wood Chop":"cable","Cable Rotation":"cable",
      "Kneeling Cable Crunch":"cable","Cable Crunch":"cable","Cable Curl":"cable",
      "Rope Hammer Curl":"cable","Single-Arm Cable Curl":"cable","Overhead Cable Curl":"cable",
      "Reverse Cable Curl":"cable","Cable Hammer Curl":"cable","Low Cable Curl":"cable",
      "High Cable Curl":"cable","Cable Cross Curl":"cable","Lying Cable Curl":"cable",
      "Seated Cable Curl":"cable","Straight-Arm Pulldown":"cable","Kneeling Pulldown":"cable",
      "Tricep Pushdown":"cable","Rope Pushdown":"cable","Reverse Grip Pushdown":"cable",
      "V-Bar Pushdown":"cable","Single-Arm Pushdown":"cable","Bar Pushdown":"cable",
      "Single-Arm Reverse Pushdown":"cable","Rope Tricep Extension":"cable",
      "Cable Overhead Extension":"cable","Overhead Rope Extension":"cable",
      "Lying Cable Extension":"cable","Cable Kickback":"cable","Cable Pull-Through":"cable",
      "Cable Hip Abduction":"cable","Standing Cable Abduction":"cable","Cable Hip Extension":"cable",
      "Reverse Cable Kickback":"cable","Hip Adduction":"cable","Hip Abductor Cable":"cable",
      "Rear Delt Cable Row":"cable","High Cable Row":"cable","Low Cable Row":"cable",
      "Wide-Grip Seated Row":"cable","Close-Grip Seated Row":"cable","Seated Cable Row":"cable",
      "Cable Upright Row":"cable","Cable Lateral Raise":"cable","Cable Front Raise":"cable",
      "Cable Rear Delt Fly":"cable","Cable Y-Raise":"cable","Cable Shrug":"cable",
      "Lat Pulldown":"cable","Wide-Grip Lat Pulldown":"cable","Close-Grip Lat Pulldown":"cable",
      "Reverse-Grip Lat Pulldown":"cable","Single-Arm Lat Pulldown":"cable","V-Bar Lat Pulldown":"cable",
      "Straight-Arm Lat Pulldown":"cable","Cable Pullover":"cable","Cable Crossover":"cable",
      "Cable Fly":"cable","Low-to-High Cable Fly":"cable","High-to-Low Cable Fly":"cable",
      "Single-Arm Cable Fly":"cable","Incline Cable Fly":"cable","Decline Cable Fly":"cable",
      "Hip Adduction Cable":"cable","Hip Abduction Cable":"cable",
      // ── MACHINE ──
      "Pec Deck":"machine","Machine Chest Press":"machine","Machine Fly":"machine",
      "Chest Dip Machine":"machine","Hammer Strength Chest Press":"machine",
      "Incline Hammer Strength Press":"machine","Pullover Machine":"machine",
      "Machine Row":"machine","Chest-Supported Row":"machine","Seated Rear Delt Machine":"machine",
      "Reverse Pec Deck":"machine","Machine Shoulder Press":"machine",
      "Machine Curl":"machine","Machine Preacher Curl":"machine","Preacher Curl":"machine",
      "Scott Curl":"machine","Reverse Preacher Curl":"machine",
      "Machine Dip":"machine","Machine Tricep Extension":"machine",
      "Leg Press":"machine","Hack Squat Machine":"machine","Leg Curl":"machine",
      "Seated Leg Curl":"machine","Lying Leg Curl":"machine","Leg Extension":"machine",
      "Inner Thigh Machine":"machine","Outer Thigh Machine":"machine",
      "Pendulum Squat":"machine","V-Squat Machine":"machine",
      "Single-Leg Leg Press":"machine","Close-Stance Leg Press":"machine","Wide-Stance Leg Press":"machine",
      "Abductor Machine":"machine","Adductor Machine":"machine","Glute Kickback Machine":"machine",
      "Hip Thrust Machine":"machine","Seated Hip Abduction":"machine","Seated Hip Adduction":"machine",
      "Machine Hip Thrust":"machine","Standing Calf Raise":"machine","Seated Calf Raise":"machine",
      "Donkey Calf Raise":"machine","Leg Press Calf Raise":"machine",
    };
    if(DEFAULTS[name])return DEFAULTS[name];
    // Final fallback — if name suggests a compound movement, assume barbell; otherwise dumbbell
    if(n.includes("press")||n.includes("squat")||n.includes("deadlift")||n.includes("row")||n.includes("clean")||n.includes("snatch"))return"barbell";
    return"dumbbell";
  };
  // isCardioEx is imported from utils.js (shared across pages)

  // muscle param: explicit muscle group — avoids stale-closure bug when pm hasn't
  // updated yet (e.g. cross-group search calls setPm then addEx in same handler)
  const addEx=(name,muscle)=>{
    var m=muscle||pm; // prefer explicit, fall back to current pm
    var last=lastSessionSets(name);
    var defaultBar=inferBarType(name,m);
    var inputType=getExInputType(name,m,customExTypes);
    var isCardio=inputType==="cardio";
    var isTimed=inputType==="timed";
    var isDefaultBW=inputType==="bodyweight";
    // Default sets logic:
    // - Has history → mirror last session (progressive overload context)
    // - No history, cardio → 1 interval; timed → 1 timed set; strength → 3 working sets
    var blankStrengthSet=()=>({id:uid(),reps:"",weight:"",done:false,bodyweight:isDefaultBW,label:"Working"});
    var blankTimedSet=()=>({id:uid(),secs:"",done:false,label:"Working"});
    var sets=last
      ? last.map(s=>({id:uid(),reps:s.reps,weight:s.weight,mins:s.mins||"",dist:s.dist||"",secs:s.secs||"",done:false,bodyweight:s.bodyweight||isDefaultBW,label:s.label||"Working"}))
      : isCardio
        ? [{id:uid(),mins:"",dist:"",done:false,label:"Steady"}]
        : isTimed
          ? [blankTimedSet()]
          : [blankStrengthSet(),blankStrengthSet(),blankStrengthSet()];
    setExs(p=>[...p,{id:uid(),name,muscle:m,sets,bodyweight:isDefaultBW,barType:last?last[0].barType||defaultBar:defaultBar,isCardio,isTimed,inputType}]);
    haptic("medium");
    closePicker();
  };
  const submitNewEx=()=>{
    var n=newExName.trim().slice(0,50); // cap at 50 chars, strip leading/trailing whitespace
    if(!n)return;
    if((customExercises[pm]||[]).includes(n)||(EX[pm]||[]).includes(n)){
      dlgConfirm('"'+n+'" already exists in '+pm+'. Choose a different name.').then(()=>{});return;
    }
    onAddCustomEx(pm,n,newExType);setNewExName("");
  };
  const [autoRest,setAutoRest]=useState(true); // auto-start rest timer on set completion
  const [zeroRepWarnSid,setZeroRepWarnSid]=useState(null); // flash red on reps input when 0 reps
  const [focusDoneErr,setFocusDoneErr]=useState(null); // brief validation message on Done tap
  // upd: sanitise numeric fields before storing to prevent absurd values
  const upd=useCallback((eid,sid,f,v)=>{
    let safe=v;
    if(f==="reps"){const n=parseInt(v);safe=isNaN(n)?"":String(Math.min(999,Math.max(0,n)));}
    if(f==="weight"||f==="bwExtra"){const n=parseFloat(v);safe=isNaN(n)?"":String(Math.min(9999,Math.max(0,n)));}
    if(f==="mins"){const n=parseFloat(v);safe=isNaN(n)?"":String(Math.min(999,Math.max(0,n)));}
    if(f==="dist"){const n=parseFloat(v);safe=isNaN(n)?"":String(Math.min(999,Math.max(0,n)));}
    if(f==="secs"){const n=parseFloat(v);safe=isNaN(n)?"":String(Math.min(9999,Math.max(0,n)));}
    if(f==="rpe"){safe=v;} // rpe is 0-10, handled by button not freetext
    setExs(p=>p.map(e=>e.id!==eid?e:{...e,sets:e.sets.map(s=>s.id!==sid?s:{...s,[f]:safe})}));
  },[]);
  const tog=useCallback((eid,sid)=>{
    setExs(p=>{
      const prevEx=p.find(e=>e.id===eid);
      const prevSet=prevEx&&prevEx.sets.find(s=>s.id===sid);
      const justCompleted=prevSet&&!prevSet.done;
      // Guard: prevent marking done when reps=0 on a strength set
      if(justCompleted&&!prevEx?.isCardio&&!prevEx?.isTimed&&!(parseInt(prevSet.reps)>=1)){
        setTimeout(()=>{setZeroRepWarnSid(sid);setTimeout(()=>setZeroRepWarnSid(null),1600);},0);
        haptic("light");
        return p; // noop — don't mark done
      }
      const next=p.map(e=>e.id!==eid?e:{...e,sets:e.sets.map(s=>s.id!==sid?s:{...s,done:!s.done})});
      if(justCompleted){
        // Start the workout clock on first ever set completion
        if(draftWorkoutT0&&!draftWorkoutT0.current){
          draftWorkoutT0.current=Date.now();
        }
        haptic("medium");
        if(autoRest&&!prevEx?.isCardio&&!prevEx?.isTimed){
          // If the user manually selected a duration that's still counting down,
          // honour it instead of overriding with the exercise preset.
          const nowMs=Date.now();
          const stillRunning=timerSecsRef.current>0&&timerStartRef.current>0&&(nowMs-timerStartRef.current)<timerSecsRef.current*1000;
          const preset=stillRunning?timerSecsRef.current:(restPresets[prevEx?.name||""]||lastTimerSecs);
          startTimer(preset);
          if(notifGranted)swNotif(preset,'Rest done — '+preset+'s. Next set!');
        }
        // ── PR banner: compute once here in the toggle handler, never in render ──
        if(!prevEx?.isCardio){
          const bwKg=bwLog.length?bwLog[bwLog.length-1].kg:0;
          let histBest=0;
          hist.forEach(w=>{const f=w.exercises.find(e=>e.name===prevEx?.name);if(f)histBest=Math.max(histBest,bestRM(f.sets,bwKg));});
          if(histBest>0){
            const nowBest=bestRM(next.find(e=>e.id===eid)?.sets||[],bwKg);
            if(nowBest>histBest){
              const dispRM=unit==="lb"?Math.round(kgToLb(nowBest)*4)/4:nowBest;
              setTimeout(()=>firePrBanner(prevEx.name,dispRM,unit),0);
            }
          }
        }
        // Auto-collapse exercise when all its sets are done
        const updEx=next.find(e=>e.id===eid);
        if(updEx&&updEx.sets.length>0&&updEx.sets.every(s=>s.done)){
          setCollapsedExs(prev=>{const s=new Set(prev);s.add(eid);return s;});
        }
      } else {
        // Set was un-marked — cancel any running rest timer and SW notification
        stopTimer();
      }
      return next;
    });
  },[autoRest,lastTimerSecs,startTimer,stopTimer,notifGranted,setCollapsedExs,hist,bwLog,unit,firePrBanner]);
  // addS: new set starts empty so ghost placeholder (prev set) is visible.
  // The ↩ Copy prev button still lets user 1-tap fill the previous values.
  const addS=eid=>setExs(p=>p.map(e=>{
    if(e.id!==eid)return e;
    const l=e.sets[e.sets.length-1];
    if(e.isCardio)return{...e,sets:[...e.sets,{id:uid(),mins:"",dist:"",done:false,label:l?l.label:"Steady"}]};
    if(e.isTimed||e.inputType==="timed")return{...e,sets:[...e.sets,{id:uid(),secs:"",done:false,label:"Working"}]};
    return{...e,sets:[...e.sets,{id:uid(),reps:"",weight:"",done:false,bodyweight:l?!!l.bodyweight:false,label:"Working"}]};
  }));
  const reorderSets=(eid,newSets)=>setExs(p=>p.map(e=>e.id!==eid?e:{...e,sets:newSets}));
  const remS=(eid,sid)=>setExs(p=>p.map(e=>e.id!==eid?e:{...e,sets:e.sets.filter(s=>s.id!==sid)}));
  const remE=eid=>setExs(p=>p.filter(e=>e.id!==eid));
  // Feature 4: bodyweight toggle per exercise
  const toggleBW=(eid)=>setExs(p=>p.map(e=>e.id!==eid?e:{...e,bodyweight:!e.bodyweight,sets:e.sets.map(s=>({...s,bodyweight:!e.bodyweight,weight:!e.bodyweight?"BW":""}))}));
  const finish=()=>{
    if(!exs.length)return;
    // Merge per-exercise notes into exs before saving
    const exsWithNotes=exs.map(e=>exNotes[e.id]!==undefined?{...e,notes:exNotes[e.id]}:e);
    // Detect PR: any exercise with a new best 1RM vs historical
    const latestBwKgF=bwLog.length?bwLog[bwLog.length-1].kg:0;
    const hasPR=exsWithNotes.some(ex=>{
      if(isCardioEx(ex.name,ex.muscle))return false;
      let histBest=0;
      hist.forEach(w=>{const found=w.exercises.find(e=>e.name===ex.name);if(found)histBest=Math.max(histBest,bestRM(found.sets,latestBwKgF));});
      return histBest>0&&bestRM(ex.sets,latestBwKgF)>histBest;
    });
    if(hasPR)setShowConfetti(true);
    // elapsedSec no longer lives here — duration is always derived from the ref directly.
    // draftWorkoutT0.current is set on first set completion so it's always present at save time.
    const duration=draftWorkoutT0?.current?Math.floor((Date.now()-draftWorkoutT0.current)/1000):0;
    onSave({id:uid(),name:(logName||"").trim()||"Workout "+fmtD(today()),date:today(),exercises:exsWithNotes,rating,notes,duration});
    setSaved(true);
  };
  useEffect(()=>{if(finishRef)finishRef.current=finish;},[exs,rating,notes,logName,saved]);
  const tv=exs.reduce((s,e)=>s+calcVol(e.sets.filter(x=>!x.bodyweight)),0);
  const doneCount=exs.reduce((s,e)=>s+e.sets.filter(x=>x.done).length,0);
  const total=exs.reduce((s,e)=>s+e.sets.length,0);

  // Feature 2: search filter
  const searchLower=search.toLowerCase().trim();
  // Single-muscle results (used in list screen)
  const filteredCustom=(customExercises[pm]||[]).filter(n=>!searchLower||n.toLowerCase().includes(searchLower));
  const filteredBuiltin=(EX[pm]||[]).filter(n=>!searchLower||n.toLowerCase().includes(searchLower));
  // Cross-group search — used when search is active to show global results
  const crossResults=searchLower?[
    ...Object.entries(customExercises).flatMap(([m,names])=>names.filter(n=>n.toLowerCase().includes(searchLower)).map(n=>({name:n,muscle:m,custom:true}))),
    ...Object.entries(EX).flatMap(([m,names])=>names.filter(n=>n.toLowerCase().includes(searchLower)).map(n=>({name:n,muscle:m,custom:false}))),
  ].filter((r,i,a)=>a.findIndex(x=>x.name===r.name)===i):[];


  return(
    <div style={{overflowX:"hidden",overflowY:"hidden",display:"flex",flexDirection:"column",height:"calc(100dvh - 124px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px))"}}>
      {confirmEl}
      {/* ── Sticky workout header ── */}
      <div style={{background:c.bg+"f5",backdropFilter:"saturate(180%) blur(16px)",WebkitBackdropFilter:"saturate(180%) blur(16px)",padding:"5px 16px 6px",borderBottom:"1px solid "+c.border,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <WorkoutTimer draftWorkoutT0={draftWorkoutT0} c={c}/>
            <span style={{fontSize:12,color:c.sub}}>{doneCount}/{total} sets</span>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <RestTimerCircle c={c} timerSecs={timerSecs} timerStart={timerStart} onCycle={cycleTimer} onDone={()=>{if(navigator.vibrate)navigator.vibrate([300,100,300,100,300]);stopTimer();}}/>
            <button onClick={()=>setAutoRest(a=>!a)} title={autoRest?"Auto-rest ON — tap to disable":"Auto-rest OFF — tap to enable"}
              style={{background:autoRest?c.accent+"22":c.card2,border:"1.5px solid "+(autoRest?c.accent:c.border),borderRadius:10,padding:"5px 10px",fontSize:11,fontWeight:800,cursor:"pointer",color:autoRest?c.accent:c.sub,fontFamily:"inherit",flexShrink:0,letterSpacing:"0.05em",minHeight:44,display:"flex",alignItems:"center",gap:3}}>
              AUTO
            </button>
            {!notifGranted&&'Notification' in window&&<button onClick={()=>requestNotifPermission().then(p=>{if(p==='granted')setNotifGranted(true);})}
              style={{background:c.card2,border:"1px solid "+c.border,borderRadius:8,padding:"4px 8px",fontSize:11,cursor:"pointer",color:c.sub,fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center"}} title="Enable push notifications"><IBell/></button>}
            <span style={{fontSize:11,color:c.sub,fontWeight:600}}>{fmtVol(unit==="lb"?Math.round(kgToLb(tv)):tv)} {unit}</span>
            {exs.length>0&&!saved&&<button onClick={()=>dlgConfirm("Discard this workout?\nAll sets will be lost.").then(ok=>{if(ok)onDiscard();})}
              style={{background:c.rs,border:"none",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",color:c.r,fontFamily:"inherit"}}>Discard</button>}
          </div>
        </div>
        <div style={{height:2.5,background:c.muted,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",background:"linear-gradient(to right,"+c.accent+","+c.at+")",borderRadius:99,width:total?(doneCount/total*100)+"%":"0%",transition:"width .5s cubic-bezier(.4,0,.2,1)"}}/>
        </div>
      </div>

      {showConfetti&&<PRConfetti onDone={()=>setShowConfetti(false)}/>}
      {prBanner&&createPortal(
        <div style={{position:"fixed",top:"calc(env(safe-area-inset-top,0px) + 64px)",left:0,right:0,display:"flex",justifyContent:"center",zIndex:9450,pointerEvents:"none",padding:"0 20px"}}>
          <div className="il-slide-up" style={{background:"linear-gradient(135deg,#10d9a0,#06b6d4)",color:"#fff",borderRadius:16,padding:"11px 20px",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",gap:8,boxShadow:"0 8px 32px rgba(16,217,160,0.45)",maxWidth:360}}>
            <span style={{fontSize:20}}>🏆</span>
            <div>
              <div style={{fontSize:12,fontWeight:900,letterSpacing:"-0.01em"}}>NEW PR — {prBanner.exName}</div>
              <div style={{fontSize:11,opacity:0.85,fontWeight:600}}>~1RM {prBanner.rm}{prBanner.u}</div>
            </div>
          </div>
        </div>
      ,document.body)}
      {/* ── Exercise List ── */}
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"none",padding:"8px 12px",paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 16px)"}}>
        {/* Meta row */}
        <div style={{display:"flex",gap:8,paddingBottom:8,alignItems:"center"}}>
          <div style={{fontSize:12,color:c.sub,fontWeight:600,flex:1}}>{exs.length} exercise{exs.length!==1?"s":""} · {fmtD(today())}</div>
          <button onClick={()=>setPicker(true)}
            style={{background:c.accent,border:"none",borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit",minHeight:44}}>
            + Add
          </button>
        </div>

        {/* ── Deload notice banner ── */}
        {deloadNotice&&(
          <div style={{display:"flex",alignItems:"flex-start",gap:10,background:c.ams,border:"1px solid "+c.am+"55",borderRadius:16,padding:"12px 14px",marginBottom:10}}>
            <span style={{fontSize:20,flexShrink:0,lineHeight:1.2}}>⚖️</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:800,color:c.am,marginBottom:2}}>Weights adjusted for recovery</div>
              <div style={{fontSize:12,color:c.am,opacity:0.85,lineHeight:1.45}}>You missed your target 2 sessions in a row, so all working weights have been reduced by 10%. Hit these sets and they'll start climbing again.</div>
            </div>
            <button onClick={onDismissDeload}
              style={{background:"none",border:"none",cursor:"pointer",color:c.am,fontSize:18,padding:"0 2px",lineHeight:1,flexShrink:0,minHeight:36,minWidth:28,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",opacity:0.7}}>
              ×
            </button>
          </div>
        )}

        {exs.length===0?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 24px",gap:16}}>
            <div style={{fontSize:56,lineHeight:1,animation:"il-barbell-bounce 2s ease-in-out infinite"}}>🏋️</div>
            <div style={{fontSize:17,fontWeight:800,color:c.text,textAlign:"center"}}>No exercises yet</div>
            <div style={{fontSize:13,color:c.sub,textAlign:"center"}}>Tap "+ Add" to start building your workout</div>
          </div>
        ):(
          <>
            <DragSortList items={exs} onReorder={arr=>setExs(arr)} keyFn={ex=>ex.id} c={c} renderItem={(ex,_,dragHandle)=>{
              const inputType=ex.inputType||(ex.isTimed?"timed":ex.isCardio!=null?(ex.isCardio?"cardio":"weighted"):getExInputType(ex.name,ex.muscle,customExTypes));
              const isCardio=inputType==="cardio";
              const latestBwKg=bwLog.length?(bwLog[bwLog.length-1].kg):0;
              const doneSets=ex.sets.filter(s=>s.done).length;
              const totalSets=ex.sets.length;
              const done=totalSets>0&&doneSets===totalSets;
              const inProg=doneSets>0&&!done;
              const badge=isCardio?null:overloadBadge(ex);
              const rm=!isCardio&&!ex.bodyweight?bestRM(ex.sets,latestBwKg):0;
              return(
                <div
                  style={{width:"100%",display:"flex",alignItems:"center",gap:12,
                    background:done?c.gs:inProg?c.accent+"0d":c.card,
                    border:"1.5px solid "+(done?c.g+"55":inProg?c.accent+"44":c.border),
                    borderRadius:18,padding:"14px 14px",marginBottom:8,
                    cursor:"pointer",textAlign:"left",minHeight:68,
                    boxSizing:"border-box",transition:"background .2s,border-color .2s"}}
                  onClick={()=>setFocusedExId(ex.id)}>
                  <span style={{flexShrink:0,lineHeight:1,display:"flex",alignItems:"center",color:done?c.g:inProg?c.accent:c.border,width:24,justifyContent:"center"}}>
                    {done?<ICheck/>:inProg?<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"/></svg>:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/></svg>}
                  </span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,fontSize:15,color:done?c.g:inProg?c.accent:c.text,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                      letterSpacing:"-0.01em",display:"flex",alignItems:"center",gap:6}}>
                      {isCardio&&<span style={{display:"flex",color:c.g}}><IActivity/></span>}
                      {ex.name}
                    </div>
                    <div style={{fontSize:12,color:c.sub,marginTop:3,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                      <span>{ex.muscle}</span>
                      <span style={{opacity:0.4}}>·</span>
                      <span style={{fontWeight:600}}>{doneSets}/{totalSets} sets</span>
                      {!isCardio&&!ex.bodyweight&&rm>0&&<span style={{color:c.sub}}>· ~{unit==="lb"?Math.round(kgToLb(rm)*4)/4:rm}{unit}</span>}
                      {badge&&<span style={{fontWeight:700,color:badge.col}}>{badge.icon} {badge.text}</span>}
                    </div>
                    {ex.isSuperset&&<div style={{fontSize:10,fontWeight:700,color:c.am,marginTop:4}}>Superset</div>}
                  </div>
                  <button
                    onClick={e=>{e.stopPropagation();setExOptionsFor(ex.id);}}
                    style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,
                      padding:"8px 12px",fontSize:18,cursor:"pointer",color:c.sub,
                      fontFamily:"inherit",flexShrink:0,minHeight:44,minWidth:44,
                      display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>
                    ⋯
                  </button>
                  {dragHandle}
                </div>
              );
            }}/>
            {/* ── Session rating (always visible at bottom of list) ── */}
            {exs.length>0&&<div style={{marginTop:8,marginBottom:4,background:c.card,borderRadius:18,padding:"14px 16px",border:"1px solid "+c.border}}>
              <div style={{fontSize:11,color:c.sub,fontWeight:700,letterSpacing:"0.05em",marginBottom:10}}>SESSION RATING</div>
              <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>setRating(rating===n?0:n)}
                    style={{background:"none",border:"none",fontSize:30,cursor:"pointer",padding:"2px 6px",lineHeight:1,
                      color:n<=rating?c.at:c.muted,transition:"color .15s,transform .1s",
                      transform:n<=rating?"scale(1.2)":"scale(1)",fontFamily:"inherit",minHeight:44,minWidth:44,
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <IStar size={24}/>
                  </button>
                ))}
              </div>
              {rating>0&&<div style={{textAlign:"center",fontSize:12,color:c.sub,marginTop:4,fontWeight:600}}>
                {["","Rough","Okay","Good","Great","Legendary!"][rating]}
              </div>}
            </div>}

            {/* ── Global Workout Journal ── */}
            {exs.length>0&&<div style={{marginTop:8,marginBottom:4,background:c.card,borderRadius:18,padding:"14px 16px",border:"1px solid "+c.border}}>
              <div style={{fontSize:11,color:c.sub,fontWeight:700,letterSpacing:"0.05em",marginBottom:10}}>WORKOUT JOURNAL</div>
              <textarea
                className="il-journal-area"
                value={notes}
                onChange={e=>{
                  const el=e.target;
                  setNotes(el.value.slice(0,1000));
                  el.style.height="auto";
                  el.style.height=el.scrollHeight+"px";
                }}
                placeholder="How was the session? Recovery notes, PRs hit, anything to remember…"
                style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:14,padding:"12px 14px",fontSize:15,color:c.text,fontFamily:"inherit",outline:"none",boxSizing:"border-box",lineHeight:1.6,display:"block"}}
              />
            </div>}
          </>
        )}
      </div>

      {/* ── Exercise Options Sheet ── */}
      {exOptionsFor&&createPortal(
        <div onClick={()=>setExOptionsFor(null)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9250,
            display:"flex",alignItems:"flex-end",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
            cursor:"pointer",touchAction:"manipulation"}}>
          <div onClick={e=>e.stopPropagation()} className="il-slide-up"
            style={{background:c.card,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:430,
              margin:"0 auto",boxSizing:"border-box",
              maxHeight:"calc(80dvh - env(safe-area-inset-top,0px))",overflowY:"auto",
              WebkitOverflowScrolling:"touch",overscrollBehavior:"none",
              paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 20px)"}}>
            {(()=>{
              const ex=exs.find(e=>e.id===exOptionsFor);
              if(!ex)return null;
              const exInputType=ex.inputType||(ex.isTimed?"timed":ex.isCardio!=null?(ex.isCardio?"cardio":"weighted"):getExInputType(ex.name,ex.muscle,customExTypes));
              const isCardio=exInputType==="cardio";
              const isBW=!!ex.bodyweight;
              const resolvedBarId=ex.barType||inferBarType(ex.name,ex.muscle);
              const exBarTypeOpt=BAR_TYPES.find(b=>b.id===resolvedBarId)||BAR_TYPES[0];
              const rowStyle={display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid "+c.border+"66",gap:12};
              const labelStyle={fontSize:13,color:c.sub,fontWeight:600,flex:1};
              return(
                <div style={{padding:"20px 16px 0"}}>
                  <div style={{width:36,height:4,background:c.border,borderRadius:99,margin:"0 auto 16px"}}/>
                  <div style={{fontWeight:900,fontSize:17,color:c.text,marginBottom:4,letterSpacing:"-0.02em"}}>{ex.name}</div>
                  <div style={{fontSize:12,color:c.sub,marginBottom:16}}>{ex.muscle}</div>

                  {!isBW&&!isCardio&&<div style={rowStyle}>
                    <span style={labelStyle}>Equipment</span>
                    <select value={resolvedBarId} onChange={ev=>{
                      const newBarId=ev.target.value;
                      const newBarType=BAR_TYPES.find(b=>b.id===newBarId)||BAR_TYPES[0];
                      const newBarDisp=unit==="lb"?newBarType.lbEquiv:newBarType.kg;
                      setExs(p=>p.map(x=>{
                        if(x.id!==ex.id)return x;
                        const oldBarDisp=unit==="lb"?exBarTypeOpt.lbEquiv:exBarTypeOpt.kg;
                        const allEmpty=x.sets.every(s=>!parseFloat(s.weight)||parseFloat(unit==="lb"?fmtW(s.weight,unit):s.weight)===oldBarDisp);
                        const newSets=allEmpty&&newBarDisp>0?x.sets.map(s=>({...s,weight:unit==="lb"?String(storeW(newBarDisp,"lb")):String(newBarDisp)})):x.sets;
                        return{...x,barType:newBarId,sets:newSets};
                      }));
                    }}
                      style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,
                        padding:"8px 12px",fontSize:13,color:c.text,fontFamily:"inherit",
                        cursor:"pointer",maxWidth:180}}>
                      {BAR_TYPES.map(b=><option key={b.id} value={b.id}>{b.label}{b.kg>0?" ("+(unit==="lb"?b.lbEquiv:b.kg)+unit+")":""}</option>)}
                    </select>
                  </div>}

                  {!isCardio&&<div style={rowStyle}>
                    <span style={labelStyle}>Bodyweight exercise</span>
                    <button onClick={()=>toggleBW(ex.id)}
                      style={{background:isBW?c.accent+"22":c.card2,border:"1px solid "+(isBW?c.accent:c.border),
                        borderRadius:9,padding:"7px 16px",fontSize:12,fontWeight:700,cursor:"pointer",
                        color:isBW?c.accent:c.sub,fontFamily:"inherit",minHeight:36}}>
                      {isBW?"On":"Off"}
                    </button>
                  </div>}

                  <div style={rowStyle}>
                    <span style={labelStyle}>Superset (no rest after)</span>
                    <button onClick={()=>setExs(p=>p.map(x=>x.id!==ex.id?x:{...x,isSuperset:!x.isSuperset}))}
                      style={{background:ex.isSuperset?c.am+"22":c.card2,border:"1px solid "+(ex.isSuperset?c.am:c.border),
                        borderRadius:9,padding:"7px 16px",fontSize:12,fontWeight:700,cursor:"pointer",
                        color:ex.isSuperset?c.am:c.sub,fontFamily:"inherit",minHeight:36}}>
                      {ex.isSuperset?"On":"Off"}
                    </button>
                  </div>

                  {onSaveRestPreset&&<div style={rowStyle}>
                    <span style={labelStyle}>Rest timer</span>
                    <div style={{display:"flex",alignItems:"center",gap:4,background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"4px 8px"}}>
                      <button onClick={()=>{const cur=restPresets[ex.name]||lastTimerSecs;onSaveRestPreset(ex.name,Math.max(15,cur-15));}}
                        style={{background:"none",border:"none",cursor:"pointer",color:c.sub,fontSize:18,fontWeight:700,padding:"0 8px",lineHeight:1,fontFamily:"inherit",minHeight:36}}>−</button>
                      <span style={{fontSize:13,fontWeight:700,color:c.accent,minWidth:36,textAlign:"center"}}>{restPresets[ex.name]||lastTimerSecs}s</span>
                      <button onClick={()=>{const cur=restPresets[ex.name]||lastTimerSecs;onSaveRestPreset(ex.name,Math.min(600,cur+15));}}
                        style={{background:"none",border:"none",cursor:"pointer",color:c.sub,fontSize:18,fontWeight:700,padding:"0 8px",lineHeight:1,fontFamily:"inherit",minHeight:36}}>+</button>
                    </div>
                  </div>}

                  <div style={{marginTop:16,paddingBottom:4}}>
                    <button onClick={()=>{
                        const eid=ex.id,ename=ex.name;
                        setExOptionsFor(null); // close sheet first so confirm isn't buried under it
                        setTimeout(()=>dlgConfirm("Remove "+ename+"?").then(ok=>{if(ok)remE(eid);}),80);
                      }}
                      style={{width:"100%",background:c.rs,border:"1px solid "+c.r+"33",borderRadius:14,
                        padding:"14px",fontSize:14,fontWeight:700,cursor:"pointer",color:c.r,
                        fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      <ITrash/> Remove Exercise
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ,document.body)}



      {/* ── Focus Mode Modal ── */}
      {focusedExId&&(()=>{
        const ex=exs.find(e=>e.id===focusedExId);if(!ex)return null;
        const focusInputType=ex.inputType||(ex.isTimed?"timed":ex.isCardio!=null?(ex.isCardio?"cardio":"weighted"):getExInputType(ex.name,ex.muscle,customExTypes));
        const isCardioFocus=focusInputType==="cardio";
        const isTimedFocus=focusInputType==="timed";
        const isBW=!!ex.bodyweight;
        const exBarType=BAR_TYPES.find(b=>b.id===(ex.barType||inferBarType(ex.name,ex.muscle)))||BAR_TYPES[0];
        const barKgF=exBarType.kg,barDispF=unit==="lb"?exBarType.lbEquiv:barKgF;
        const PCOL_USE2=unit==="lb"?PCOL_LB:PCOL;
        const allSetsDone=ex.sets.length>0&&ex.sets.every(s=>s.done);
        // A set is valid if it has at least one meaningful value entered
        const setIsValid=(s)=>{
          if(isTimedFocus) return parseFloat(s.secs)>0;
          if(isCardioFocus) return parseFloat(s.mins)>0||parseFloat(s.dist)>0;
          if(isBW) return parseInt(s.reps)>0;
          return parseFloat(s.weight)>0&&parseInt(s.reps)>0;
        };
        const hasAnyValidSet=ex.sets.length>0&&ex.sets.some(setIsValid);
        const showDoneErr=(msg)=>{
          setFocusDoneErr(msg);
          setTimeout(()=>setFocusDoneErr(null),2500);
        };
        const validateAndClose=()=>{
          if(ex.sets.length===0){showDoneErr("Add at least one set first.");return;}
          if(!hasAnyValidSet){
            if(isTimedFocus) showDoneErr("Enter seconds for at least one set.");
            else if(isCardioFocus) showDoneErr("Enter duration or distance for at least one interval.");
            else if(isBW) showDoneErr("Enter reps for at least one set.");
            else showDoneErr("Enter weight and reps for at least one set.");
            return;
          }
          setFocusedExId(null);
        };
        const markAllDoneAndClose=()=>{
          if(ex.sets.length===0){showDoneErr("Add at least one set first.");return;}
          if(!hasAnyValidSet){
            if(isTimedFocus) showDoneErr("Enter seconds for at least one set.");
            else if(isCardioFocus) showDoneErr("Enter duration or distance for at least one interval.");
            else if(isBW) showDoneErr("Enter reps for at least one set.");
            else showDoneErr("Enter weight and reps for at least one set.");
            return;
          }
          setExs(p=>p.map(e=>e.id!==ex.id?e:{...e,sets:e.sets.map(s=>s.done?s:{...s,done:true})}));
          setFocusedExId(null);
        };
        // ── Data for focus-mode features ──────────────────────────────────────
        const focusIdx=exs.findIndex(e=>e.id===focusedExId);
        const latestBwKgFocus=bwLog.length?bwLog[bwLog.length-1].kg:0;
        // Previous session best for this exercise
        let prevBestEx=null;
        for(let i=hist.length-1;i>=0;i--){const found=hist[i].exercises.find(e=>e.name===ex.name);if(found&&found.sets&&found.sets.length){prevBestEx=found;break;}}
        // Historical best 1RM for PR live badge
        let histBest1RM=0;
        hist.forEach(w=>{const found=w.exercises.find(e=>e.name===ex.name);if(found)histBest1RM=Math.max(histBest1RM,bestRM(found.sets,latestBwKgFocus));});
        // Feature 4: last 3 sessions for mini-history
        const miniHistory=lastNSessions(ex.name,3);
        // Feature 3: warm-up ramp — show only when NO warm-up sets exist yet
        const alreadyHasWarmup=ex.sets.some(s=>s.label==="Warm-up");
        const firstWorkingSet=ex.sets.find(s=>!s.done&&(s.label||"Working")==="Working");
        const warmupBaseW=(!alreadyHasWarmup&&firstWorkingSet)?(parseFloat(unit==="lb"?fmtW(firstWorkingSet.weight,unit):firstWorkingSet.weight)||0):0;
        const warmupRamp=warmupBaseW>0?[
          {pct:0.4,reps:8,label:"40%"},
          {pct:0.6,reps:5,label:"60%"},
          {pct:0.8,reps:3,label:"80%"},
        ].map(r=>({
          ...r,
          dispW:unit==="lb"?Math.round(warmupBaseW*r.pct/2.5)*2.5:Math.round(warmupBaseW*r.pct/1.25)*1.25,
        })):[];
        return createPortal(
          <div
            style={{position:"fixed",inset:0,background:c.bg,zIndex:9200,display:"flex",flexDirection:"column",alignItems:"center"}}
            onTouchStart={e=>{swipeTouchX.current=[e.touches[0].clientX,e.touches[0].clientY];}}
            onTouchEnd={e=>{
              if(!swipeTouchX.current)return;
              const dx=e.changedTouches[0].clientX-swipeTouchX.current[0];
              const dy=e.changedTouches[0].clientY-swipeTouchX.current[1];
              swipeTouchX.current=null;
              // Only treat as horizontal swipe if dx dominates and is large enough
              if(Math.abs(dx)<60||Math.abs(dy)>Math.abs(dx)*0.6)return;
              if(dx<0&&focusIdx<exs.length-1)setFocusedExId(exs[focusIdx+1].id);
              else if(dx>0&&focusIdx>0)setFocusedExId(exs[focusIdx-1].id);
            }}>

            <div style={{width:"100%",maxWidth:430,height:"100%",display:"flex",flexDirection:"column",overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"none",paddingBottom:"env(safe-area-inset-bottom,20px)"}}>
            <div style={{background:c.card+"ee",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid "+c.border,position:"sticky",top:0,zIndex:2,display:"flex",alignItems:"center",gap:10,flexShrink:0,paddingTop:"calc(env(safe-area-inset-top,0px) + 14px)",paddingLeft:16,paddingRight:16,paddingBottom:14}}>
              <button onClick={()=>setFocusedExId(null)} style={{background:c.card2,border:"none",borderRadius:10,padding:"10px 14px",fontSize:14,fontWeight:700,cursor:"pointer",color:c.text,fontFamily:"inherit",flexShrink:0,minHeight:44}}>← Back</button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:900,fontSize:17,color:c.text,letterSpacing:"-0.02em",lineHeight:1.2,wordBreak:"break-word"}}>{ex.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                  <Pill label={ex.muscle} col={c.at} bg={c.as}/>
                  {exs.length>1&&<span style={{fontSize:10,color:c.sub,fontWeight:700}}>{focusIdx+1}/{exs.length}</span>}
                </div>
              </div>
              {/* Task 2: + Set always visible — never hide the ability to add volume */}
              <div style={{display:"flex",gap:7,flexShrink:0}}>
                <button onClick={()=>addS(ex.id)} style={{background:c.accent+"22",border:"1px solid "+c.accent+"55",borderRadius:10,padding:"10px 14px",fontSize:13,fontWeight:700,cursor:"pointer",color:c.accent,fontFamily:"inherit",flexShrink:0,minHeight:44}}>{isCardioFocus?"+ Interval":"+ Set"}</button>
                {allSetsDone
                  ?<button onClick={validateAndClose} style={{background:c.g,border:"none",borderRadius:10,padding:"10px 16px",fontSize:14,fontWeight:800,cursor:"pointer",color:"#fff",fontFamily:"inherit",flexShrink:0,minHeight:44}}>Done</button>
                  :<button onClick={markAllDoneAndClose} style={{background:c.g+"22",border:"1px solid "+c.g+"55",borderRadius:10,padding:"10px 14px",fontSize:13,fontWeight:700,cursor:"pointer",color:c.g,fontFamily:"inherit",flexShrink:0,minHeight:44}}>Done</button>
                }
              </div>
            </div>
            {/* Validation error banner */}
            {focusDoneErr&&<div style={{
              background:"#ff3b3022",border:"1px solid #ff3b3055",borderRadius:10,
              margin:"8px 16px 0",padding:"10px 14px",fontSize:13,fontWeight:600,
              color:"#ff6b6b",textAlign:"center",animation:"fadeInUp .18s ease both"
            }}>{focusDoneErr}</div>}
            {/* Exercise swipe nav arrows */}
            {exs.length>1&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 12px 0",gap:8}}>
              <button onClick={()=>focusIdx>0&&setFocusedExId(exs[focusIdx-1].id)} disabled={focusIdx===0}
                style={{background:focusIdx===0?c.card2:c.accent+"22",border:"1px solid "+(focusIdx===0?c.border:c.accent+"44"),borderRadius:10,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:focusIdx===0?"default":"pointer",color:focusIdx===0?c.sub:c.accent,fontFamily:"inherit",opacity:focusIdx===0?0.35:1}}>
                ← Prev
              </button>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                {exs.map((e,i)=>(
                  <div key={e.id} onClick={()=>setFocusedExId(e.id)}
                    style={{width:i===focusIdx?18:6,height:6,borderRadius:99,background:i===focusIdx?c.accent:c.border,transition:"all .2s",cursor:"pointer"}}/>
                ))}
              </div>
              <button onClick={()=>focusIdx<exs.length-1&&setFocusedExId(exs[focusIdx+1].id)} disabled={focusIdx===exs.length-1}
                style={{background:focusIdx===exs.length-1?c.card2:c.accent+"22",border:"1px solid "+(focusIdx===exs.length-1?c.border:c.accent+"44"),borderRadius:10,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:focusIdx===exs.length-1?"default":"pointer",color:focusIdx===exs.length-1?c.sub:c.accent,fontFamily:"inherit",opacity:focusIdx===exs.length-1?0.35:1}}>
                Next →
              </button>
            </div>}
            <div style={{padding:"12px 16px 0",flex:1}}>
              {/* Controls */}
              <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
                {!isBW&&!isCardioFocus&&!isTimedFocus&&<select value={ex.barType||inferBarType(ex.name,ex.muscle)} onChange={e=>{
                  const newBarId=e.target.value;
                  const newBarType2=BAR_TYPES.find(b=>b.id===newBarId)||BAR_TYPES[0];
                  const newBarDisp2=unit==="lb"?newBarType2.lbEquiv:newBarType2.kg;
                  setExs(p=>p.map(x=>{
                    if(x.id!==ex.id)return x;
                    const oldBarDisp2=unit==="lb"?exBarType.lbEquiv:barKgF;
                    const allEmpty2=x.sets.every(s=>!parseFloat(s.weight)||parseFloat(unit==="lb"?fmtW(s.weight,unit):s.weight)===oldBarDisp2);
                    const newSets2=allEmpty2&&newBarDisp2>0
                      ?x.sets.map(s=>({...s,weight:unit==="lb"?String(storeW(newBarDisp2,"lb")):String(newBarDisp2)}))
                      :x.sets;
                    return{...x,barType:newBarId,sets:newSets2};
                  }));
                }}
                  style={{flex:1,minWidth:120,background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"10px 10px",fontSize:13,color:c.sub,fontFamily:"inherit",cursor:"pointer"}}>
                  {BAR_TYPES.map(b=><option key={b.id} value={b.id}>{b.label}{b.kg>0?" ("+(unit==="lb"?b.lbEquiv:b.kg)+unit+")":""}</option>)}
                </select>}
                {!isCardioFocus&&!isTimedFocus&&<button onClick={()=>toggleBW(ex.id)} style={{background:isBW?c.accent+"22":c.card2,border:"1px solid "+(isBW?c.accent:c.border),borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer",color:isBW?c.accent:c.sub,fontFamily:"inherit",flexShrink:0,minHeight:44}}>{isBW?"BW":"BW"}</button>}
              </div>
              {isBW&&bwLog.length>0&&<div style={{background:c.card2,borderRadius:12,padding:"8px 14px",marginBottom:14,fontSize:12,color:c.sub}}>
                Base bodyweight: <strong style={{color:c.text}}>{unit==="lb"?Math.round(kgToLb(bwLog[bwLog.length-1].kg)*10)/10:bwLog[bwLog.length-1].kg}{unit}</strong> — add extra weight per set below
              </div>}
              {/* ── Quick rest preset chips + live timer circle ── */}
              {!isCardioFocus&&!isTimedFocus&&<div style={{display:"flex",gap:6,marginBottom:14,alignItems:"center",flexWrap:"nowrap"}}>
                <span style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.05em",flexShrink:0}}>REST</span>
                {[[60,"1m"],[90,"90s"],[120,"2m"],[180,"3m"]].map(([s,l])=>{
                  const isActive=timerStart&&timerSecs===s;
                  return(
                    <button key={s} onClick={()=>{startTimer(s);if(notifGranted)swNotif(s,"Rest done — next set!");}}
                      style={{background:isActive?c.accent+"33":c.card2,border:"1.5px solid "+(isActive?c.accent:c.border),borderRadius:20,padding:"5px 10px",fontSize:12,fontWeight:700,cursor:"pointer",color:isActive?c.accent:c.sub,fontFamily:"inherit",minHeight:44,flexShrink:0}}>
                      {l}
                    </button>
                  );
                })}
                <RestTimerCircle c={c} timerSecs={timerSecs} timerStart={timerStart} onCycle={cycleTimer} onDone={()=>{if(navigator.vibrate)navigator.vibrate([300,100,300,100,300]);stopTimer();}}/>
              </div>}
              {/* ── Feature 4: Mini session history (last 3) ── */}
              {miniHistory.length>0&&!isCardioFocus&&!isTimedFocus&&(
                <div style={{background:c.card2,border:"1px solid "+c.border,borderRadius:14,padding:"10px 14px",marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:800,color:c.sub,letterSpacing:"0.07em",marginBottom:7}}>LAST {miniHistory.length} SESSION{miniHistory.length>1?"S":""}</div>
                  {miniHistory.map((sess,si)=>{
                    const topSet=sess.sets.reduce((b,s)=>{
                      const w=parseFloat(s.weight)||0,r=parseInt(s.reps)||0;
                      return w>parseFloat(b.weight||0)?s:b;
                    },sess.sets[0]);
                    const tw=unit==="lb"?Math.round(kgToLb(parseFloat(topSet.weight)||0)*4)/4:parseFloat(topSet.weight)||0;
                    return(
                      <div key={si} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0",borderTop:si>0?"1px solid "+c.border:"none"}}>
                        <span style={{fontSize:11,color:c.sub}}>{fmtD(sess.date)}</span>
                        <span style={{fontSize:12,fontWeight:700,color:c.text}}>{tw}{unit} × {topSet.reps} <span style={{color:c.sub,fontWeight:500}}>({sess.sets.length} sets)</span></span>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* ── Feature 3: Warm-up ramp suggestion ── */}
              {warmupRamp.length>0&&!isCardioFocus&&!isTimedFocus&&!alreadyHasWarmup&&ex.sets.every(s=>!s.done)&&(
                <div style={{background:c.ams,border:"1px solid "+c.am+"44",borderRadius:14,padding:"10px 14px",marginBottom:12}}>
                  <div style={{fontSize:10,fontWeight:800,color:c.am,letterSpacing:"0.07em",marginBottom:7}}>WARM-UP RAMP</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {warmupRamp.map((r,ri)=>(
                      <button key={ri} onClick={()=>{
                        const newSets=warmupRamp.map(wr=>({
                          id:uid(),
                          reps:String(wr.reps),
                          weight:unit==="lb"?String(storeW(wr.dispW,"lb")):String(wr.dispW),
                          done:false,bodyweight:false,label:"Warm-up"
                        }));
                        setExs(p=>p.map(e=>e.id!==ex.id?e:{...e,sets:[...newSets,...e.sets]}));
                      }} style={{background:c.am+"22",border:"1px solid "+c.am+"55",borderRadius:10,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",color:c.am,fontFamily:"inherit"}}>
                        {r.label}: {r.dispW}{unit}×{r.reps}
                      </button>
                    ))}
                    <span style={{fontSize:11,color:c.am,opacity:0.7,alignSelf:"center"}}>Tap to add</span>
                  </div>
                </div>
              )}
              {/* Big set rows */}
              <DragSortList items={ex.sets} onReorder={newSets=>reorderSets(ex.id,newSets)} keyFn={s=>s.id} c={c} renderItem={(s,idx,setDragHandle)=>{
                const wDisp2=!isBW?(parseFloat(unit==="lb"?fmtW(s.weight,unit):s.weight)||0):0;
                const plates2=(!isBW&&wDisp2>barDispF)?calcPlates(wDisp2,unit,unit==="lb"?barDispF:barKgF,gymPlates&&gymPlates.length?gymPlates:undefined):[];
                const lbl2=s.label||(isCardioFocus?"Steady":"Working");
                const lblCol2=lbl2==="Warm-up"?c.am:lbl2==="Drop set"?c.r:c.sub;
                return(
                  <div style={{background:s.done?c.gs:c.card,border:"2px solid "+(s.done?c.g:c.border),borderRadius:20,padding:"16px",marginBottom:14,transition:"all .2s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        {/* ── Drag handle for set reorder ── */}
                        {ex.sets.length>1&&setDragHandle}
                        {/* ── Delete set — only if >1 set remains ── */}
                        {ex.sets.length>1&&(
                          <button
                            onClick={()=>{
                              if(s.done===true){
                                // Confirm before removing completed work
                                dlgConfirm("Remove completed Set "+(idx+1)+"?").then(ok=>{if(ok)remS(ex.id,s.id);});
                              } else {
                                remS(ex.id,s.id);
                              }
                            }}
                            style={{background:"none",border:"none",borderRadius:10,
                              padding:0,width:44,height:44,cursor:"pointer",
                              color:s.done?c.r:c.sub,flexShrink:0,
                              display:"flex",alignItems:"center",justifyContent:"center",
                              transition:"color .15s,background .15s",touchAction:"manipulation"}}
                            title={"Remove Set "+(idx+1)}>
                            <ITrash/>
                          </button>
                        )}
                        <span style={{fontSize:13,fontWeight:700,color:s.done?c.g:c.sub,flexShrink:0}}>SET {idx+1}</span>
                        {/* Label cycle button */}
                        <button onClick={()=>upd(ex.id,s.id,"label",isCardioFocus?(["Steady","Intervals","Sprint"][(["Steady","Intervals","Sprint"].indexOf(lbl2||"Steady")+1)%3]):nextLabel(lbl2))}
                          style={{background:lbl2==="Warm-up"?c.ams:lbl2==="Drop set"?c.rs:c.card2,border:"1px solid "+(lbl2==="Warm-up"?c.am:lbl2==="Drop set"?c.r:c.border)+"55",borderRadius:8,padding:"3px 8px",fontSize:10,fontWeight:700,cursor:"pointer",color:lblCol2,fontFamily:"inherit",minHeight:44}}>
                          {lbl2}
                        </button>
                      </div>
                      <button onClick={()=>tog(ex.id,s.id)}
                        style={{background:s.done?c.g:zeroRepWarnSid===s.id?c.r:c.accent,border:"none",borderRadius:12,padding:"12px 18px",fontSize:14,fontWeight:900,cursor:"pointer",color:"#fff",fontFamily:"inherit",minHeight:44,flexShrink:0,transition:"background 0.2s"}}>
                        {s.done?"Done":zeroRepWarnSid===s.id?"Enter reps!":"Mark Done"}
                      </button>
                    </div>
                    {isTimedFocus&&<div style={{marginBottom:10}}>
                      <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>SECONDS</div>
                      <input type="number" inputMode="numeric" value={s.secs||""} onChange={v=>upd(ex.id,s.id,"secs",v.target.value)} placeholder="0" style={{width:"100%",background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                    </div>}
                    {isCardioFocus&&<div style={{display:"flex",gap:10,marginBottom:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>MINUTES</div>
                        <input type="number" inputMode="decimal" value={s.mins||""} onChange={v=>upd(ex.id,s.id,"mins",v.target.value)} placeholder="0" style={{width:"100%",background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>DISTANCE (km)</div>
                        <input type="number" inputMode="decimal" value={s.dist||""} onChange={v=>upd(ex.id,s.id,"dist",v.target.value)} placeholder="0" style={{width:"100%",background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                      </div>
                    </div>}
                    {!isCardioFocus&&!isTimedFocus&&!isBW&&<div style={{marginBottom:10}}>
                      {/* One-tap autofill from previous set */}
                      {idx>0&&ex.sets[idx-1]&&(()=>{
                        const prev=ex.sets[idx-1];
                        const prevW=prev.weight&&parseFloat(prev.weight)?fmtW(prev.weight,unit):null;
                        const prevR=prev.reps;
                        if(!prevW&&!prevR)return null;
                        return(
                          <button onClick={()=>{
                            if(prevW!==null)upd(ex.id,s.id,"weight",prev.weight);
                            if(prevR)upd(ex.id,s.id,"reps",prevR);
                          }} style={{width:"100%",background:c.card2,border:"1.5px dashed "+c.border,borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",color:c.accent,fontFamily:"inherit",marginBottom:8,letterSpacing:"0.01em"}}>
                            ↩ Copy prev: {prevW?prevW+unit:""}{ prevW&&prevR?" × ":""}{prevR?""+prevR+" reps":""}
                          </button>
                        );
                      })()}
                      {/* Weight + Reps — identical size, ghost placeholder shows prev set */}
                      {(()=>{
                        const prev=idx>0?ex.sets[idx-1]:null;
                        const ghostW=prev&&prev.weight&&parseFloat(prev.weight)?fmtW(prev.weight,unit):"";
                        const ghostR=prev&&prev.reps?prev.reps:"";
                        return(
                        <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:6}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>WEIGHT ({unit})</div>
                            <input type="number" inputMode="decimal"
                              className="il-ghost-input"
                              value={s.weight&&parseFloat(s.weight)?fmtW(s.weight,unit):s.weight}
                              placeholder={ghostW||"0"}
                              onChange={v=>upd(ex.id,s.id,"weight",unit==="lb"&&v.target.value?String(storeW(v.target.value,"lb")):v.target.value)}
                              autoFocus={idx===0&&!s.done&&!s.weight}
                              style={{width:"100%",background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>REPS</div>
                            <input type="number" inputMode="numeric"
                              className="il-ghost-input"
                              value={s.reps}
                              placeholder={ghostR||"0"}
                              onChange={v=>upd(ex.id,s.id,"reps",v.target.value)}
                              style={{width:"100%",background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                          </div>
                        </div>
                        );
                      })()}
                      {/* Live 1RM badge — PR banner fires in tog(), not here */}
                      {(()=>{
                        const w=parseFloat(unit==="lb"?fmtW(s.weight,unit):s.weight)||0;
                        const r=parseInt(s.reps)||0;
                        const liveRM=calc1RM(w,r);
                        if(!liveRM)return null;
                        const isPR=histBest1RM>0&&liveRM>histBest1RM;
                        const dispRM=unit==="lb"?Math.round(kgToLb(liveRM)*4)/4:liveRM;
                        return(
                          <div style={{textAlign:"center",fontSize:12,fontWeight:700,marginBottom:8,
                            color:isPR?c.g:c.sub}}>
                            {isPR?"🏆 PR! ":""}{isPR?"":""}~1RM {dispRM}{unit}
                          </div>
                        );
                      })()}
                      {/* Feature 7: RPE per set */}
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <span style={{fontSize:10,color:c.sub,fontWeight:700,flexShrink:0}}>RPE</span>
                        <div style={{display:"flex",gap:3,flex:1,flexWrap:"nowrap",overflow:"hidden"}}>
                          {[6,7,8,9,10].map(r=>{
                            const active=(s.rpe||0)===r;
                            const col=r<=7?c.g:r<=8?c.am:c.r;
                            return(
                              <button key={r} onClick={()=>upd(ex.id,s.id,"rpe",active?0:r)}
                                style={{flex:1,background:active?col+"33":c.card2,border:"1px solid "+(active?col:c.border),borderRadius:8,padding:"4px 0",fontSize:11,fontWeight:800,cursor:"pointer",color:active?col:c.sub,fontFamily:"inherit",minHeight:44,transition:"all .15s"}}>
                                {r}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Barbell diagram — only for barbell / smith / ez-bar / plate-loaded (perSide equipment) */}
                      {exBarType.perSide&&(()=>{
                        // A+C: scale plate size by count, collapse to text summary at 7+ per side
                        const perSideCount=plates2.length;
                        const useTextSummary=perSideCount>=7;
                        const plateSize=perSideCount<=4?34:perSideCount<=6?26:20;
                        // Build text summary: group consecutive same-weight plates → "25×4 · 10×2"
                        const summaryGroups=plates2.reduce((acc,p)=>{
                          if(acc.length>0&&acc[acc.length-1].w===p) acc[acc.length-1].n++;
                          else acc.push({w:p,n:1});
                          return acc;
                        },[]);
                        const summaryStr=summaryGroups.map(g=>g.w+(g.n>1?"×"+g.n:"")).join(" · ");
                        return(
                          <div>
                            {/* Visual diagram — shown when ≤6 plates per side */}
                            {!useTextSummary&&<div style={{
                              display:"flex",alignItems:"center",justifyContent:"center",gap:2,
                              flexWrap:"nowrap",paddingBottom:plates2.length>0?4:0
                            }}>
                              {plates2.length>0&&[...plates2].reverse().map((p,pi)=>(
                                <PlateCircle key={"L"+pi} weight={p} unit={unit} size={plateSize}/>
                              ))}
                              <div style={{display:"flex",alignItems:"center",flexShrink:0}}>
                                {plates2.length>0&&<div style={{width:10,height:5,background:c.sub,opacity:0.3,borderRadius:"3px 0 0 3px"}}/>}
                                <button
                                  onClick={()=>setPlatePickerFor({eid:ex.id,sid:s.id,cur:wDisp2||0,barType:ex.barType||inferBarType(ex.name,ex.muscle)})}
                                  style={{
                                    background:plates2.length>0?c.as:c.accent,
                                    border:plates2.length>0?"2px solid "+c.accent+"66":"none",
                                    borderRadius:12,padding:"10px 14px",
                                    fontSize:plates2.length>0?12:14,fontWeight:900,
                                    cursor:"pointer",
                                    color:plates2.length>0?c.accent:"#fff",
                                    fontFamily:"inherit",flexShrink:0,minHeight:44,minWidth:44,
                                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
                                    whiteSpace:"nowrap",letterSpacing:"-0.02em"
                                  }}>
                                  <span
                                    key={plateConfirmed[s.id]||0}
                                    style={{
                                      fontSize:18,lineHeight:1,
                                      display:"inline-block",
                                      transformOrigin:"bottom center",
                                      animation:(plateConfirmed[s.id]||0)>0
                                        ?"il-lifter-press 0.7s cubic-bezier(0.34,1.56,0.64,1) 5 forwards"
                                        :"none",
                                    }}>🏋️</span>
                                  {plates2.length===0&&<span style={{fontSize:9,fontWeight:800}}>Load</span>}
                                </button>
                                {plates2.length>0&&<div style={{width:10,height:5,background:c.sub,opacity:0.3,borderRadius:"0 3px 3px 0"}}/>}
                              </div>
                              {plates2.length>0&&plates2.map((p,pi)=>(
                                <PlateCircle key={"R"+pi} weight={p} unit={unit} size={plateSize}/>
                              ))}
                            </div>}
                            {/* Text summary — shown at 7+ plates per side */}
                            {useTextSummary&&<div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>
                              <div style={{
                                flex:1,background:c.card2,border:"1.5px solid "+c.border,
                                borderRadius:12,padding:"10px 14px",fontSize:13,fontWeight:700,
                                color:c.sub,textAlign:"center",letterSpacing:"0.01em",lineHeight:1.4
                              }}>
                                {barDispF>0&&<span style={{color:c.accent,marginRight:6}}>{barDispF}{unit}</span>}
                                {summaryStr&&<span>{summaryStr} per side</span>}
                              </div>
                              <button
                                onClick={()=>setPlatePickerFor({eid:ex.id,sid:s.id,cur:wDisp2||0,barType:ex.barType||inferBarType(ex.name,ex.muscle)})}
                                style={{
                                  background:c.accent,border:"none",borderRadius:12,
                                  padding:"10px 16px",fontSize:20,fontWeight:900,
                                  cursor:"pointer",color:"#fff",fontFamily:"inherit",
                                  flexShrink:0,minHeight:44,minWidth:44,
                                  display:"flex",alignItems:"center",justifyContent:"center"
                                }}><IBarbell/></button>
                            </div>}
                            {/* Hint: only shown when no plates loaded yet */}
                            {plates2.length===0&&<div style={{textAlign:"center",fontSize:10,color:c.sub,marginTop:4,letterSpacing:"0.04em"}}>Tap bar to load plates</div>}
                            {/* Compact color swatches in text-summary mode so color cue is never lost */}
                            {useTextSummary&&plates2.length>0&&<div style={{
                              display:"flex",gap:4,justifyContent:"center",marginTop:6,flexWrap:"wrap"
                            }}>
                              {summaryGroups.map((g,gi)=>(
                                <span key={gi} style={{
                                  background:PCOL_USE2[g.w]||"#555",color:"#fff",
                                  borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:800
                                }}>{g.w}{g.n>1?"×"+g.n:""}</span>
                              ))}
                              <span style={{fontSize:11,color:c.sub,alignSelf:"center"}}>per side</span>
                            </div>}
                          </div>
                        );
                      })()}
                    </div>}
                    {!isCardioFocus&&!isTimedFocus&&isBW&&<div style={{marginBottom:10}}>
                      <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>REPS</div>
                      <input type="number" inputMode="numeric" value={s.reps} onChange={v=>upd(ex.id,s.id,"reps",v.target.value)}
                        style={{width:"100%",background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                      <div style={{fontSize:11,color:c.sub,fontWeight:700,marginTop:12,marginBottom:6}}>EXTRA WEIGHT ({unit})</div>
                      <input type="number" inputMode="decimal" value={s.bwExtra||""} placeholder="0" onChange={v=>upd(ex.id,s.id,"bwExtra",v.target.value)}
                        style={{width:"100%",background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                      {bwLog.length>0&&(parseFloat(s.bwExtra)||0)>0&&(()=>{
                        const total=unit==="lb"
                          ?Math.round((kgToLb(bwLog[bwLog.length-1].kg)+(parseFloat(s.bwExtra)||0))*10)/10
                          :Math.round(((bwLog[bwLog.length-1]?.kg||0)+(parseFloat(s.bwExtra)||0))*10)/10;
                        return(
                          <div style={{textAlign:"center",fontSize:12,color:c.accent,fontWeight:700,marginTop:6,letterSpacing:"0.01em"}}>
                            = {total}{unit} total bodyweight
                          </div>
                        );
                      })()}
                    </div>}
                  </div>
                );
              }}/>

              {/* ── Exercise Journal ── */}
              <div style={{marginTop:20,paddingBottom:8}}>
                <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:8,letterSpacing:"0.05em"}}>JOURNAL</div>
                <textarea
                  className="il-journal-area"
                  value={exNotes[ex.id]||""}
                  onChange={e=>{
                    const el=e.target;
                    setExNotes(p=>({...p,[ex.id]:el.value.slice(0,500)}));
                    // Auto-expand: reset then grow to scrollHeight
                    el.style.height="auto";
                    el.style.height=el.scrollHeight+"px";
                  }}
                  placeholder="Cues, RPE, how it felt…"
                  style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:14,padding:"12px 14px",fontSize:15,color:c.text,fontFamily:"inherit",outline:"none",boxSizing:"border-box",lineHeight:1.6,display:"block"}}
                />
              </div>
            </div>
            </div>
          </div>
        , document.body);
      })()}

      {/* ── Plate Picker Modal (+ button) ── */}
      {platePickerFor&&(()=>{
        const PCOL_USE2=unit==="lb"?PCOL_LB:PCOL;
        const barType=BAR_TYPES.find(b=>b.id===platePickerFor.barType)||BAR_TYPES[0];
        const barDisp=unit==="lb"?barType.lbEquiv:barType.kg;
        // perSide: barbell/smith/ez load plates on both sides (×2).
        // Dumbbell, Cable, Machine/Stack, Other → weight entered directly, no doubling (×1).
        const perSide=!!(barType.perSide);
        const [customPlateInput,setCustomPlateInput]=platePickerFor._cpi!==undefined
          ?[platePickerFor._cpi,(v)=>setPlatePickerFor(prev=>({...prev,_cpi:v}))]
          :["",(v)=>setPlatePickerFor(prev=>({...prev,_cpi:v}))];
        const plateList=gymPlates.length>0
          ?gymPlates.map(p=>unit==="lb"?Math.round(kgToLb(p)*4)/4:p)
          :(unit==="lb"?PLATES_LB:PLATES_KG);
        const rawCur=platePickerFor.cur;
        const cur=rawCur<=0&&barDisp>0?barDisp:rawCur;
        const multiplier=perSide?2:1;
        const addPlate=(p)=>{
          const newVal=Math.round((cur+p*multiplier)*1000)/1000;
          const stored=unit==="lb"?String(storeW(newVal,"lb")):String(newVal);
          upd(platePickerFor.eid,platePickerFor.sid,"weight",stored);
          setPlatePickerFor(prev=>({...prev,cur:newVal}));
        };
        const removePlate=(p)=>{
          const floor=barDisp>0?barDisp:0;
          const newVal=Math.max(floor,Math.round((cur-p*multiplier)*1000)/1000);
          const stored=unit==="lb"?String(storeW(newVal,"lb")):String(newVal);
          upd(platePickerFor.eid,platePickerFor.sid,"weight",stored);
          setPlatePickerFor(prev=>({...prev,cur:newVal}));
        };
        const addCustom=()=>{
          const v=parseFloat(customPlateInput);
          if(!v||v<=0||v>500)return;
          addPlate(v);
          setPlatePickerFor(prev=>({...prev,_cpi:""}));
        };
        // Build the plate breakdown for the current total weight.
        // calcPlates divides by 2 (per-side). For dumbbell (single) we skip the ÷2.
        // Guard: only show when there's actually weight loaded (cur > 0).
        const platesSoFar=(()=>{
          if(cur<=0)return[];
          if(perSide){
            // Per-side: calcPlates subtracts bar then divides by 2 → plates for one side.
            // Works correctly even when barDisp=0 (plate-loaded machine).
            return calcPlates(cur,unit,unit==="lb"?barType.lbEquiv:barType.kg,gymPlates&&gymPlates.length?gymPlates:undefined);
          }else{
            // Dumbbell: total weight on one side, no ÷2.
            const PLATES_LIST=gymPlates&&gymPlates.length
              ?(unit==="lb"?gymPlates.map(p=>Math.round(kgToLb(p)*4)/4):gymPlates).slice().sort((a,b)=>b-a)
              :(unit==="lb"?PLATES_LB:PLATES_KG);
            let rem=Math.round((cur-barDisp)*1000)/1000,out=[];
            PLATES_LIST.forEach(p=>{while(rem>=p-0.001){out.push(p);rem=Math.round((rem-p)*1000)/1000;}});
            return out;
          }
        })();
        const FALLBACK_COLS=["#ef4444","#3b82f6","#f59e0b","#22c55e","#8b5cf6","#ec4899","#94a3b8","#f97316","#06b6d4","#84cc16","#a78bfa","#fb7185","#34d399","#fbbf24","#60a5fa"];
        return createPortal(
          <div onClick={()=>setPlatePickerFor(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9400,display:"flex",alignItems:"flex-end",justifyContent:"center",cursor:"pointer",touchAction:"manipulation"}}>
            <div onClick={e=>e.stopPropagation()} style={{background:c.card,borderRadius:"26px 26px 0 0",padding:"20px 18px 0",width:"100%",maxWidth:430,margin:"0 auto",boxSizing:"border-box",maxHeight:"calc(92dvh - env(safe-area-inset-top,0px))",overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"none",paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 24px)"}}>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontWeight:900,fontSize:17,color:c.text}}>Add Weight</div>
                <button onClick={()=>{
                  const sid=platePickerFor?.sid;
                  setPlatePickerFor(null);
                  if(sid) setPlateConfirmed(prev=>({...prev,[sid]:(prev[sid]||0)+1}));
                }} style={{background:c.card2,border:"none",borderRadius:9,padding:"8px 16px",cursor:"pointer",color:c.sub,fontFamily:"inherit",fontSize:13,fontWeight:700,minHeight:44}}>Done</button>
              </div>
              {/* Total display */}
              <div style={{background:c.card2,borderRadius:14,padding:"12px 16px",marginBottom:14}}>
                <div style={{fontSize:12,color:c.sub,marginBottom:2}}>Total weight on bar</div>
                <div style={{fontSize:28,fontWeight:900,color:c.text,lineHeight:1}}>{cur}<span style={{fontSize:14,fontWeight:600,color:c.sub,marginLeft:4}}>{unit}</span></div>
                {(barDisp>0||platesSoFar.length>0)&&<div style={{fontSize:11,color:c.sub,marginTop:4,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  {barDisp>0&&<span>{barDisp}{unit} bar</span>}
                  {platesSoFar.length>0&&<>
                    {barDisp>0&&<span>+</span>}
                    {platesSoFar.map((p,i)=><span key={i} style={{background:PCOL_USE2[p]||FALLBACK_COLS[i%FALLBACK_COLS.length],color:"#fff",borderRadius:5,padding:"1px 6px",fontSize:10,fontWeight:800}}>{p}</span>)}
                    <span style={{fontSize:10,color:c.sub}}>{perSide?"per side":"total"}</span>
                  </>}
                </div>}
              </div>
              {/* Mode label — automatic, no toggle needed */}
              <div style={{background:c.card2,borderRadius:10,padding:"7px 12px",marginBottom:12,fontSize:11,color:c.sub}}>
                {perSide
                  ? barDisp>0
                    ? "Tap a plate to add it to both sides (×2)"
                    : "Machine: tap a plate to load both sides (×2)"
                  : "Tap a plate to add that weight once"}
              </div>
              {/* Plate icons — same style as My Plates on Home */}
              <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginBottom:16}}>
                {plateList.map((p,i)=>(
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                    <button onClick={()=>addPlate(p)}
                      style={{padding:0,background:"none",border:"none",cursor:"pointer",flexShrink:0,borderRadius:"50%"}}>
                      <PlateCircle weight={p} unit={unit} size={72}/>
                    </button>
                    <button onClick={()=>removePlate(p)}
                      style={{background:c.card2,border:"1px solid "+c.border,borderRadius:8,padding:"4px 12px",fontSize:12,cursor:"pointer",color:c.sub,fontFamily:"inherit",minHeight:44,minWidth:44}}>−</button>
                  </div>
                ))}
              </div>
              {/* Custom plate input */}
              <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
                <input type="number" inputMode="decimal" value={customPlateInput} onChange={e=>setCustomPlateInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")addCustom();}}
                  placeholder={"Custom weight ("+unit+")…"}
                  style={{flex:1,background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"10px 12px",fontSize:13,color:c.text,outline:"none",fontFamily:"inherit"}}/>
                <button onClick={addCustom} disabled={!parseFloat(customPlateInput)}
                  style={{background:c.accent,border:"none",borderRadius:11,padding:"10px 18px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",flexShrink:0,opacity:parseFloat(customPlateInput)?1:0.4,minHeight:44}}>Add</button>
              </div>
              <button onClick={()=>{
                const clearVal=barDisp>0?barDisp:0;
                const stored=unit==="lb"?String(storeW(clearVal,"lb")):String(clearVal);
                upd(platePickerFor.eid,platePickerFor.sid,"weight",stored);
                setPlatePickerFor(prev=>({...prev,cur:clearVal}));
              }} style={{width:"100%",background:c.rs,border:"none",borderRadius:12,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer",color:c.r,fontFamily:"inherit",marginBottom:4}}>{barDisp>0?"Clear plates (keep bar)":"Clear all"}</button>
            </div>
          </div>
        , document.body);
      })()}

      {/* ── Add Exercise Picker — two-screen: grid → list ── */}
      {picker&&createPortal(
        <div onClick={closePicker}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9300,display:"flex",alignItems:"flex-end",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",cursor:"pointer",touchAction:"manipulation"}}>
          <div onClick={e=>e.stopPropagation()} className="il-slide-up"
            style={{background:c.card,borderRadius:"28px 28px 0 0",width:"100%",maxWidth:430,margin:"0 auto",
              maxHeight:"calc(92dvh - env(safe-area-inset-top,0px))",display:"flex",flexDirection:"column",
              boxSizing:"border-box",overflow:"hidden",cursor:"default",touchAction:"auto"}}>

            {/* ── Shared sticky header ── */}
            <div style={{flexShrink:0,padding:"14px 16px 0",background:c.card}}>
              <div style={{width:36,height:4,background:c.border,borderRadius:99,margin:"0 auto 12px"}}/>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                {pickerScreen==="list"&&!searchLower&&(
                  <button onClick={()=>setPickerScreen("grid")}
                    style={{background:c.card2,border:"none",borderRadius:10,padding:"8px 12px",fontSize:13,fontWeight:700,cursor:"pointer",color:c.text,fontFamily:"inherit",flexShrink:0,minHeight:44,display:"flex",alignItems:"center",gap:4,touchAction:"manipulation"}}>
                    ← {pm}
                  </button>
                )}
                <h3 style={{margin:0,fontSize:17,fontWeight:800,color:c.text,letterSpacing:"-0.02em",flex:1}}>
                  {searchLower?"Results for \""+search+"\"":(pickerScreen==="grid"?"Add Exercise":pm)}
                </h3>
                <button onClick={closePicker}
                  style={{background:c.card2,border:"none",borderRadius:10,padding:10,cursor:"pointer",color:c.sub,display:"flex",minHeight:44,minWidth:44,alignItems:"center",justifyContent:"center",touchAction:"manipulation"}}>
                  <IX/>
                </button>
              </div>
              {/* Global search — always visible, bypasses grid when active */}
              <div style={{position:"relative",marginBottom:12}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none",opacity:0.45}}></span>
                <input value={search} onChange={e=>{setSearch(e.target.value);if(e.target.value)setPickerScreen("list");}}
                  placeholder="Quick search any exercise…"
                  style={{width:"100%",background:c.card2,border:"1.5px solid "+(searchLower?c.accent:c.border),
                    borderRadius:12,padding:"10px 12px 10px 36px",fontSize:16,color:c.text,
                    outline:"none",fontFamily:"inherit",boxSizing:"border-box",
                    transition:"border-color .15s"}}/>
                {searchLower&&<button onClick={()=>setSearch("")}
                  style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:c.sub,fontSize:16,padding:4,minHeight:36,minWidth:36,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>}
              </div>
            </div>

            {/* ── SCREEN 1: Muscle Group Grid ── */}
            {pickerScreen==="grid"&&!searchLower&&(
              <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"none",
                padding:"4px 16px",paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 24px)"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {MG.map(m=>{
                    const meta=MG_ICONS[m]||{e:"💪",c:c.accent};
                    const exCount=(EX[m]||[]).length+(customExercises[m]||[]).length;
                    return(
                      <button key={m} onClick={()=>openMuscle(m)}
                        style={{background:c.card2,border:"1.5px solid "+c.border,borderRadius:18,
                          padding:"18px 8px 14px",cursor:"pointer",fontFamily:"inherit",
                          display:"flex",flexDirection:"column",alignItems:"center",gap:8,
                          touchAction:"manipulation",transition:"transform .12s,border-color .12s,background .12s",
                          WebkitTapHighlightColor:"transparent",minHeight:100}}>
                        {/* Colored accent circle with emoji */}
                        <div style={{width:48,height:48,borderRadius:"50%",
                          background:meta.c+"22",border:"2px solid "+meta.c+"55",
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                          {meta.e}
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontSize:13,fontWeight:800,color:c.text,letterSpacing:"-0.01em",
                            whiteSpace:"nowrap"}}>{m}</div>
                          <div style={{fontSize:10,color:c.sub,marginTop:1,fontWeight:500}}>{exCount} exercises</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SCREEN 2: Exercise List (single muscle or cross-search) ── */}
            {(pickerScreen==="list"||searchLower)&&(
              <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"none",
                padding:"0 16px",paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 48px)"}}>

                {/* Cross-group search results */}
                {searchLower&&crossResults.length>0&&(
                  <div>
                    {crossResults.map(r=>(
                      <button key={r.name+r.muscle} onClick={()=>addEx(r.name,r.muscle)}
                        style={{width:"100%",textAlign:"left",background:"none",border:"none",
                          borderBottom:"1px solid "+c.border,padding:"13px 4px",
                          fontSize:15,color:r.custom?c.accent:c.text,cursor:"pointer",
                          fontFamily:"inherit",display:"flex",justifyContent:"space-between",
                          alignItems:"center",fontWeight:r.custom?700:500,touchAction:"manipulation"}}>
                        <span style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.custom?"★ ":""}{r.name}</span>
                        <span style={{fontSize:10,color:c.sub,fontWeight:600,flexShrink:0,marginLeft:8,
                          background:c.card2,borderRadius:8,padding:"2px 6px"}}>{r.muscle}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchLower&&crossResults.length===0&&(
                  <div style={{textAlign:"center",padding:"32px 0",color:c.sub,fontSize:14}}>
                    No exercises matching "{search}"
                  </div>
                )}

                {/* Single-muscle list */}
                {!searchLower&&<>
                  {/* Custom exercises */}
                  {filteredCustom.length>0&&(
                    <div style={{marginBottom:8,marginTop:4}}>
                      <div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.08em",marginBottom:6,paddingLeft:2}}>
                        MY EXERCISES · swipe left to delete
                      </div>
                      {filteredCustom.map(name=>(
                        <SwipeToDelete key={name} onDelete={()=>onDeleteCustomEx(pm,name)} c={c}>
                          {editingEx===name
                            ?<div style={{flex:1,display:"flex",alignItems:"center",gap:6,padding:"8px 4px"}}>
                              <input autoFocus value={editExVal} onChange={e=>setEditExVal(e.target.value)}
                                onKeyDown={e=>{if(e.key==="Enter"){onRenameCustomEx(pm,name,editExVal);setEditingEx(null);}if(e.key==="Escape")setEditingEx(null);}}
                                style={{flex:1,background:c.card2,border:"1.5px solid "+c.accent,borderRadius:9,padding:"6px 10px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit"}}/>
                              <button onClick={()=>{onRenameCustomEx(pm,name,editExVal);setEditingEx(null);}} style={{background:c.accent,border:"none",borderRadius:8,padding:"6px 11px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit"}}>Save</button>
                              <button onClick={()=>setEditingEx(null)} style={{background:c.card2,border:"none",borderRadius:8,padding:"6px 10px",fontSize:12,cursor:"pointer",color:c.sub,fontFamily:"inherit"}}><IX/></button>
                            </div>
                            :<>
                              <button onClick={()=>addEx(name)} style={{flex:1,textAlign:"left",background:"none",border:"none",padding:"13px 4px",fontSize:15,color:c.accent,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}><IStar size={12} style={{marginRight:4}}/>{name}</button>
                              <button onClick={()=>{setEditingEx(name);setEditExVal(name);}} style={{background:"none",border:"none",padding:"8px 10px",cursor:"pointer",color:c.sub,fontSize:12,fontFamily:"inherit"}}>Edit</button>
                            </>
                          }
                        </SwipeToDelete>
                      ))}
                    </div>
                  )}
                  {/* Add custom exercise */}
                  <div style={{marginBottom:14,marginTop:filteredCustom.length?0:8}}>
                    <div style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
                      <input value={newExName} onChange={e=>setNewExName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submitNewEx();}}
                        placeholder={"Add custom "+pm+" exercise…"}
                        style={{flex:1,background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"9px 12px",fontSize:16,color:c.text,outline:"none",fontFamily:"inherit"}}/>
                      <button onClick={submitNewEx} disabled={!newExName.trim()}
                        style={{background:newExName.trim()?c.accent:c.muted,border:"none",borderRadius:11,padding:"9px 14px",fontSize:13,fontWeight:700,cursor:newExName.trim()?"pointer":"default",color:newExName.trim()?"#fff":c.sub,fontFamily:"inherit",flexShrink:0}}>Add</button>
                    </div>
                    {/* Input type picker — auto-guessed, user can override */}
                    <div style={{display:"flex",gap:5}}>
                      {[["weighted","Weighted"],["bodyweight","Bodyweight"],["cardio","Cardio"],["timed","Timed"]].map(([t,label])=>(
                        <button key={t} onClick={()=>setNewExType(t)}
                          style={{flex:1,background:newExType===t?c.accent+"22":c.card2,border:"1px solid "+(newExType===t?c.accent:c.border),borderRadius:8,padding:"5px 2px",fontSize:10,fontWeight:700,cursor:"pointer",color:newExType===t?c.accent:c.sub,fontFamily:"inherit",touchAction:"manipulation"}}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Built-in exercises */}
                  {filteredCustom.length>0&&<div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.08em",marginBottom:6,paddingLeft:2}}>BUILT-IN</div>}
                  {filteredBuiltin.map(name=>(
                    <button key={name} onClick={()=>addEx(name)}
                      style={{width:"100%",textAlign:"left",background:"none",border:"none",
                        borderBottom:"1px solid "+c.border,padding:"14px 4px",
                        fontSize:15,color:c.text,cursor:"pointer",fontFamily:"inherit",
                        display:"flex",justifyContent:"space-between",alignItems:"center",
                        gap:6,fontWeight:500,touchAction:"manipulation",
                        // Skip off-screen render — browser paints only visible items
                        contentVisibility:"auto",containIntrinsicBlockSize:"50px"}}>
                      <span style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</span><IChev style={{flexShrink:0}}/>
                    </button>
                  ))}
                  {filteredCustom.length===0&&filteredBuiltin.length===0&&(
                    <div style={{textAlign:"center",padding:"28px 0",color:c.sub,fontSize:14}}>No exercises in {pm} yet</div>
                  )}
                </>}
              </div>
            )}
          </div>
        </div>
      ,document.body)}
    </div>
  );
}
