import React, {useState,useEffect,useRef,useCallback,useMemo,useReducer} from 'react';
import ReactDOM from 'react-dom/client';
import {createPortal} from 'react-dom';

import { D, L, O, THEMES, MILESTONES, TIMER_STEPS, MG } from './constants';
import { uid, today, fmtD, lbToKg, haptic, isCardioEx } from './utils';
import { openDB, idbSet, idbGet, lsGet, lsSet } from './storage';
import { getCloudUser, onAuthChange, cloudBackup, cloudRestore, signOut as cloudSignOut, deleteCloudAccount } from './cloud';
import { ISun, IMoon, ICheck, IHome, ILog, IHist, IChart, IPR, IGrid, ISettings } from './icons';
import { useConfirm, useImportDialog } from './hooks.jsx';

import TourOverlay, { TOUR_STEPS } from './components/TourOverlay';
import WorkoutSummary from './components/WorkoutSummary';
import SkeletonPage from './components/SkeletonPage';
import HomePage from './pages/HomePage';
import LogPage from './pages/LogPage';
import HistoryPage from './pages/HistoryPage';
import ProgressPage from './pages/ProgressPage';
import PRsPage from './pages/PRsPage';
import PlansPage from './pages/PlansPage';
import HelpPage from './pages/HelpPage';
import SettingsPage from './pages/SettingsPage';

// ─── Onboarding ───────────────────────────────────────────────────────────────
function OnboardingScreen({onDone}){
  return(
    <div style={{position:"fixed",inset:0,background:"#0c0c12",zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:16}}>🏋️</div>
      <div style={{fontSize:30,fontWeight:900,color:"#eeeeff",letterSpacing:"-0.03em",marginBottom:8}}>IronLog</div>
      <div style={{fontSize:15,color:"#b0a0ff",marginBottom:32,fontWeight:500}}>Track. Lift. Grow.</div>
      <div style={{width:"100%",maxWidth:320,marginBottom:36,display:"flex",flexDirection:"column",gap:14}}>
        {[["💪","Log sets with auto rest timer & plate calculator"],["📈","Track your PRs, volume and strength over time"],["📋","Save plans with automatic progressive overload"],["📴","100% offline — your data never leaves your phone"]].map(([icon,text])=>(
          <div key={text} style={{display:"flex",alignItems:"center",gap:14,background:"rgba(124,110,250,0.1)",border:"1px solid rgba(124,110,250,0.2)",borderRadius:16,padding:"13px 16px",textAlign:"left"}}>
            <span style={{fontSize:22,flexShrink:0}}>{icon}</span>
            <span style={{fontSize:14,color:"#ccccee",lineHeight:1.4}}>{text}</span>
          </div>
        ))}
      </div>
      <button onClick={onDone} style={{background:"#7C6EFA",color:"#fff",border:"none",borderRadius:18,padding:"16px 48px",fontSize:17,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 32px rgba(124,110,250,0.4)",letterSpacing:"-0.01em"}}>Start Lifting 💪</button>
    </div>
  );
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

// ─── React.memo wrapped page components ───────────────────────────────────────
const HomePageM=React.memo(HomePage);
const LogPageM=React.memo(LogPage);
const HistoryPageM=React.memo(HistoryPage);
const ProgressPageM=React.memo(ProgressPage);
const PRsPageM=React.memo(PRsPage);
const PlansPageM=React.memo(PlansPage);
const HelpPageM=React.memo(HelpPage);
const SettingsPageM=React.memo(SettingsPage);

// ─── Domain data reducer ──────────────────────────────────────────────────────
const DEFAULT_PLATES_KG=[25,20,15,10,5,2.5,1.25];

function dataReducer(state,action){
  switch(action.type){
    case 'INIT': return{...state,...action.payload};
    case 'SET_ALL': return{...state,...action.payload};

    case 'SAVE_WORKOUT':
      return{...state,hist:[...state.hist,action.workout]};
    case 'DELETE_WORKOUT':
      return{...state,hist:state.hist.filter(w=>w.id!==action.id)};
    case 'SET_HIST':
      return{...state,hist:action.hist};

    case 'ADD_CUSTOM_EX':{
      const{muscle,name,inputType}=action;
      const existing=state.customExercises[muscle]||[];
      if(existing.includes(name))return state;
      const customExercises={...state.customExercises,[muscle]:[...existing,name]};
      const customExTypes=(inputType&&inputType!=='weighted')
        ?{...state.customExTypes,[name]:inputType}:state.customExTypes;
      return{...state,customExercises,customExTypes};
    }
    case 'DELETE_CUSTOM_EX':{
      const{muscle,name}=action;
      const customExercises={...state.customExercises,[muscle]:(state.customExercises[muscle]||[]).filter(x=>x!==name)};
      const customExTypes={...state.customExTypes};delete customExTypes[name];
      return{...state,customExercises,customExTypes};
    }
    case 'RENAME_CUSTOM_EX':{
      const{muscle,oldName,newName}=action;
      const customExercises={...state.customExercises,[muscle]:(state.customExercises[muscle]||[]).map(x=>x===oldName?newName:x)};
      const customExTypes={...state.customExTypes};
      if(customExTypes[oldName]){customExTypes[newName]=customExTypes[oldName];delete customExTypes[oldName];}
      return{...state,customExercises,customExTypes};
    }

    case 'SAVE_CUSTOM_PLAN':{
      const plan=action.plan;
      const idx=state.customPlans.findIndex(x=>x.id===plan.id);
      const customPlans=idx>=0?state.customPlans.map(x=>x.id===plan.id?plan:x):[...state.customPlans,plan];
      return{...state,customPlans};
    }
    case 'DELETE_CUSTOM_PLAN':
      return{...state,customPlans:state.customPlans.filter(r=>r.id!==action.id)};

    case 'LOG_BW':{
      const bwLog=[...state.bwLog.filter(x=>x.date!==action.date),{date:action.date,kg:action.kg}].sort((a,b)=>a.date.localeCompare(b.date));
      return{...state,bwLog};
    }
    case 'DELETE_BW':
      return{...state,bwLog:state.bwLog.filter(x=>x.date!==action.date)};

    case 'LOG_MEAS':{
      const measLog=[...state.measLog.filter(x=>x.date!==action.date),{...action.entry,date:action.date}].sort((a,b)=>a.date.localeCompare(b.date));
      return{...state,measLog};
    }
    case 'DELETE_MEAS':
      return{...state,measLog:state.measLog.filter(x=>x.date!==action.date)};

    case 'SET_GYM_PLATES':
      return{...state,gymPlates:action.plates};
    case 'SET_REST_PRESET':
      return{...state,restPresets:{...state.restPresets,[action.name]:action.secs}};

    default: return state;
  }
}

function App(){
  const TAB_ORDER=["home","log","history","progress","prs","plans","settings"];
  const [tab,setTabRaw]=useState("home");
  const tabDirRef=useRef("r"); // "r" or "l"
  const setTab=useCallback((next)=>{
    setTabRaw(prev=>{
      const pi=TAB_ORDER.indexOf(prev),ni=TAB_ORDER.indexOf(next);
      tabDirRef.current=ni>=pi?"r":"l";
      return next;
    });
    haptic("light");
  },[]);
  const [onboarded,setOnboarded]=useState(()=>lsGet("il_onboarded",false));
  const [tourStep,setTourStep]=useState(null); // null = not running, 0-N = active step
  const startTour=()=>{
    // Reset .il-scroll to top BEFORE switching tabs so the incoming tab's
    // content isn't offset by the previous tab's scroll position.
    // Without this, starting the tour from a scrolled Settings page would
    // render home-ctas with a negative getBoundingClientRect().top.
    const scroller=document.querySelector('.il-scroll');
    if(scroller) scroller.scrollTop=0;
    setTourStep(0);
    if(TOUR_STEPS[0].tab)setTab(TOUR_STEPS[0].tab);
  };
  const tourScrollReset=()=>{const s=document.querySelector('.il-scroll');if(s)s.scrollTop=0;};
  const tourNext=()=>{
    const next=tourStep+1;
    if(next>=TOUR_STEPS.length){setTourStep(null);return;}
    // Reset scroll whenever the tab changes so incoming content starts at top
    if(TOUR_STEPS[next].tab!==TOUR_STEPS[tourStep]?.tab) tourScrollReset();
    setTourStep(next);
    if(TOUR_STEPS[next].tab)setTab(TOUR_STEPS[next].tab);
  };
  const tourPrev=()=>{
    const prev=tourStep-1;
    if(prev<0)return;
    if(TOUR_STEPS[prev].tab!==TOUR_STEPS[tourStep]?.tab) tourScrollReset();
    setTourStep(prev);
    if(TOUR_STEPS[prev].tab)setTab(TOUR_STEPS[prev].tab);
  };
  const [dark,setDark]=useState(()=>lsGet("il_dark",true)); // true | false | "oled" | "auto"
  const [sysDark,setSysDark]=useState(()=>window.matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(()=>{const mq=window.matchMedia("(prefers-color-scheme: dark)");const h=e=>setSysDark(e.matches);mq.addEventListener("change",h);return()=>mq.removeEventListener("change",h);},[]);
  const effectiveDark=dark==="auto"?sysDark:(dark==="oled"?true:dark);
  // ── Color theme (14 options, dark-mode only) ───────────────────────────────
  const [colorTheme,setColorTheme]=useState(()=>lsGet("il_color_theme","midnight"));
  const setAndSaveColorTheme=(key)=>{setColorTheme(key);lsSet("il_color_theme",key);};
  const [unit,setUnit]=useState(()=>lsGet("il_unit","kg"));
  // ── Body weight unit — independent of lifting unit ────────────────────────
  const [bwUnit,setBwUnit]=useState(()=>lsGet("il_bw_unit",null)); // null = follow global unit
  const effectiveBwUnit=bwUnit||unit; // falls back to global unit if not set
  useEffect(()=>{if(bwUnit)lsSet("il_bw_unit",bwUnit);},[bwUnit]);
  const [data,dispatch]=useReducer(dataReducer,null,()=>({
    hist:[],customExercises:{},customExTypes:{},
    gymPlates:DEFAULT_PLATES_KG,bwLog:[],measLog:[],customPlans:[],
    restPresets:lsGet("il_rest_presets",{}),
  }));
  const{hist,customExercises,customExTypes,gymPlates,bwLog,measLog,customPlans,restPresets}=data;
  const [logInit,setLogInit]=useState(null);
  const [logName,setLogName]=useState("");
  const [deloadNotice,setDeloadNotice]=useState(false);
  const [cloudUser,setCloudUser]=useState(null);
  const [lastCloudBackup,setLastCloudBackup]=useState(()=>lsGet("il_last_cloud_backup",null));
  const logFinishRef=useRef(null);
  const [loaded,setLoaded]=useState(false);
  const [splashDone,setSplashDone]=useState(false);
  // Resolve active color theme — useMemo gives a stable object reference so
  // React.memo on all child pages keeps working (no phantom re-renders on timer ticks).
  const c=useMemo(()=>{
    if(!effectiveDark)return L;
    const base=THEMES[colorTheme]??THEMES.midnight;
    if(dark==="oled")return{...base,bg:"#000000",card:"#0a0a0a",card2:"#0f0f10",muted:"#050505",nav:"rgba(0,0,0,0.98)"};
    return base;
  },[effectiveDark,colorTheme,dark]);
  // ── Sync html/body background to active theme so no dark bleed-through ────
  useEffect(()=>{
    document.documentElement.style.background=c.bg;
    document.body.style.background=c.bg;
  },[c.bg]);
  // ── Ghost placeholder CSS variable — updates per theme ────────────────────
  useEffect(()=>{
    document.documentElement.style.setProperty('--il-ghost-color', c.ghost||c.at+'77');
  },[c.ghost,c.at]);
  // ── App-level confirm dialog — replaces all window.confirm in App scope ───
  const {confirm:appConfirm,confirmEl:appConfirmEl}=useConfirm(c);
  const {show:showImportDialog,importDialogEl}=useImportDialog(c);
  // ── Draft state lifted to App so switching tabs never loses log data ──────
  const [draftExs,setDraftExs]=useState([]);
  const [draftRating,setDraftRating]=useState(0);
  const [draftNotes,setDraftNotes]=useState("");
  const draftT0=useRef(Date.now());
  // workoutT0: null until the user marks their FIRST set done.
  // This prevents idle browsing time (opening the app pre-gym) from inflating duration.
  const draftWorkoutT0=useRef(null);
  const hasDraft=draftExs.length>0;
  // ── Collapsed exercises state lifted so it persists across tab switches ───
  const [collapsedExs,setCollapsedExs]=useState(new Set());
  // ── Timer state — lifted so it survives tab switches, timestamp-based for screen lock ──
  const [timerSecs,setTimerSecs]=useState(()=>{const t=lsGet("il_timer",null);if(t&&t.secs>0&&t.start>0&&(Date.now()-t.start)<t.secs*1000)return t.secs;return 0;});
  const [timerStart,setTimerStart]=useState(()=>{const t=lsGet("il_timer",null);if(t&&t.secs>0&&t.start>0&&(Date.now()-t.start)<t.secs*1000)return t.start;return 0;});
  const [lastTimerSecs,setLastTimerSecs]=useState(()=>lsGet("il_lastTimer",60));
  useEffect(()=>{lsSet("il_timer",{secs:timerSecs,start:timerStart});},[timerSecs,timerStart]);
  useEffect(()=>{if(lastTimerSecs>0)lsSet("il_lastTimer",lastTimerSecs);},[lastTimerSecs]);
  const cycleTimer=useCallback(()=>{
    setTimerSecs(cur=>{
      const idx=TIMER_STEPS.indexOf(cur);
      const next=idx===-1?TIMER_STEPS[0]:(idx===TIMER_STEPS.length-1?0:TIMER_STEPS[idx+1]);
      if(next===0){return 0;}
      setTimerStart(Date.now());setLastTimerSecs(next);return next;
    });
  },[]);
  // startTimer: also persists the chosen duration as the new default (Task 3)
  const startTimer=useCallback((secs)=>{setTimerSecs(secs);setTimerStart(Date.now());setLastTimerSecs(secs);},[]);
  const stopTimer=useCallback(()=>{setTimerSecs(0);swNotif(0);},[]);
  // Auto-save draft to IndexedDB — debounced to avoid writes on every keystroke
  const draftSaveTimer=useRef(null);
  useEffect(()=>{
    if(!loaded) return;
    clearTimeout(draftSaveTimer.current);
    draftSaveTimer.current=setTimeout(()=>{
      idbSet("il_draft",{exs:draftExs,rating:draftRating,notes:draftNotes,name:logName,sec:Math.floor((Date.now()-draftT0.current)/1000),t0:draftT0.current,wt0:draftWorkoutT0.current,init:logInit});
    },1500);
    return()=>clearTimeout(draftSaveTimer.current);
  },[draftExs,draftRating,draftNotes,logName,logInit,loaded]);
  // Restore draft on mount
  useEffect(()=>{
    idbGet("il_draft",null).then(d=>{
      if(d&&d.exs&&d.exs.length>0){
        setDraftExs(d.exs);
        setDraftRating(d.rating||0);
        setDraftNotes(d.notes||"");
        setLogName(d.name||"");
        setLogInit(d.init||null);
        if(d.t0){draftT0.current=d.t0;}
        draftWorkoutT0.current=d.wt0||null;
      }
    });
  },[]);

  // On mount: load all domain data from IndexedDB in one shot
  useEffect(()=>{
    var lsData=lsGet("il_v4",[]);
    Promise.all([
      idbGet("il_v4",[]),
      idbGet("il_custom_routines",[]),
      idbGet("il_bw",[]),
      idbGet("il_custom_ex",{}),
      idbGet("il_custom_ex_types",{}),
      idbGet("il_meas",[]),
      idbGet("il_gym_plates",DEFAULT_PLATES_KG),
      idbGet("il_unit","kg"),
    ]).then(([idbData,plans,bw,customEx,customExT,meas,plates,savedUnit])=>{
      // Migrate from localStorage → IndexedDB for hist (use whichever has more data)
      var merged=idbData.length>=lsData.length?idbData:lsData;
      dispatch({type:'INIT',payload:{
        hist:merged,
        customPlans:plans||[],
        bwLog:bw||[],
        customExercises:customEx||{},
        customExTypes:customExT||{},
        measLog:meas||[],
        gymPlates:plates&&plates.length?plates:DEFAULT_PLATES_KG,
      }});
      setUnit(savedUnit);
      setLoaded(true);
      if(merged.length>0){
        idbSet("il_v4",merged).then(()=>{
          try{localStorage.removeItem("il_v4");}catch(e){}
        });
      }
    });
  },[]);

  // Persist hist changes to IndexedDB — debounced to avoid writes mid-sequence
  const histSaveTimer=useRef(null);
  useEffect(()=>{
    if(!loaded)return;
    clearTimeout(histSaveTimer.current);
    histSaveTimer.current=setTimeout(()=>idbSet("il_v4",hist),600);
    return()=>clearTimeout(histSaveTimer.current);
  },[hist,loaded]);

  // Persist dark mode preference
  useEffect(()=>{idbSet("il_dark",dark);lsSet("il_dark",dark);},[dark]);
  useEffect(()=>{idbSet("il_unit",unit);try{localStorage.setItem("il_unit",JSON.stringify(unit));}catch(e){};},[unit]);
  const [milestone,setMilestone]=useState(null);
  const clearDraft=()=>{setDraftExs([]);setDraftRating(0);setDraftNotes("");setLogName("");setLogInit(null);setCollapsedExs(new Set());draftT0.current=Date.now();draftWorkoutT0.current=null;idbSet("il_draft",null);};
  const [summaryWorkout,setSummaryWorkout]=useState(null); // shown after finish
  const saveW=w=>{
    dispatch({type:'SAVE_WORKOUT',workout:w});
    // Null the draft in IDB immediately so a force-kill during the summary screen
    // doesn't restore a ghost draft on next launch (workout is already in hist).
    // React state draft remains for the summary to read; clearDraft() cleans state on Done.
    idbSet("il_draft",null).catch(()=>{});
    setSummaryWorkout(w);
    // Silent cloud backup after every workout — fire and forget
    setTimeout(()=>doCloudBackup().catch(()=>{}),2000);
  };
  // Milestone detection — fires whenever hist grows
  const milestoneLoadedRef=useRef(false);
  useEffect(()=>{
    if(!loaded||!hist.length)return;
    if(!milestoneLoadedRef.current){milestoneLoadedRef.current=true;return;} // skip initial load
    const seen=lsGet("il_seen_milestones",[]);
    const hit=MILESTONES.find(m=>hist.length===m&&!seen.includes(m));
    if(hit){setMilestone(hit);lsSet("il_seen_milestones",[...seen,hit]);}
  },[hist.length,loaded]);
  const closeSummary=()=>{setSummaryWorkout(null);clearDraft();setTab("home");};
  const delW=id=>dispatch({type:'DELETE_WORKOUT',id});
  const blank=()=>{if(!hasDraft){setLogInit(null);setLogName("");draftT0.current=Date.now();draftWorkoutT0.current=null;}setTab("log");};
  // ── Repeat workout from history ────────────────────────────────────────────
  const repeatW=w=>{
    const doRepeat=()=>{
      clearDraft();
      setLogInit({...w,exercises:w.exercises.map(ex=>({...ex,id:uid(),sets:ex.sets.map(s=>({...s,id:uid(),done:false}))}))});
      setLogName(w.name.replace(/(\s*\(repeat\))+$/i,"")+" (repeat)");draftT0.current=Date.now();draftWorkoutT0.current=null;setTab("log");
    };
    if(hasDraft){appConfirm("You have a workout in progress.\nRepeat this one and discard it?").then(ok=>{if(ok)doRepeat();});}
    else doRepeat();
  };
  // ── Workout reminder notifications ────────────────────────────────────────
  const [reminderDays,setReminderDays]=useState(()=>lsGet("il_reminder_days",0)); // 0=off
  useEffect(()=>{lsSet("il_reminder_days",reminderDays);},[reminderDays]);
  const [streakDays,setStreakDays]=useState(()=>lsGet("il_streak_days",1)); // rest days before streak breaks
  useEffect(()=>{lsSet("il_streak_days",streakDays);},[streakDays]);
  useEffect(()=>{
    if(!loaded||!reminderDays||!('serviceWorker' in navigator)||!('Notification' in window)||Notification.permission!=='granted')return;
    const reg=window._swReg;if(!reg||!reg.active)return;
    const lastDate=hist.length?hist[hist.length-1].date:null;
    if(!lastDate)return;
    const daysSince=Math.floor((Date.now()-new Date(lastDate+"T00:00:00"))/86400000);
    if(daysSince>=reminderDays){
      // Already overdue — fire reminder tomorrow morning (next 9am)
      const now=new Date();
      const next9am=new Date(now);next9am.setHours(9,0,0,0);
      if(next9am<=now)next9am.setDate(next9am.getDate()+1);
      const delay=next9am-now;
      reg.active.postMessage({type:'SCHEDULE_REMINDER',delay,label:"You haven't trained in "+daysSince+" day"+(daysSince===1?"":"s")+" — time to get back at it!"});
    }
  },[loaded,hist,reminderDays]);
  // ── Domain mutation helpers (all backed by dataReducer) ───────────────────
  // setGymPlates: accepts both direct value and functional updater, matching useState API
  const setGymPlates=(fn)=>dispatch({type:'SET_GYM_PLATES',plates:typeof fn==='function'?fn(gymPlates):fn});
  const saveRestPreset=(name,secs)=>dispatch({type:'SET_REST_PRESET',name,secs});
  const saveCustomPlan=(r)=>dispatch({type:'SAVE_CUSTOM_PLAN',plan:r});
  const deleteCustomPlan=(id)=>dispatch({type:'DELETE_CUSTOM_PLAN',id});
  const logBW=(kg)=>dispatch({type:'LOG_BW',date:today(),kg});
  const deleteBW=(date)=>dispatch({type:'DELETE_BW',date});
  const addCustomExercise=(muscle,name,inputType)=>{var n=name.trim();if(!n)return;dispatch({type:'ADD_CUSTOM_EX',muscle,name:n,inputType});};
  const deleteCustomExercise=(muscle,name)=>dispatch({type:'DELETE_CUSTOM_EX',muscle,name});
  const renameCustomExercise=(muscle,oldName,newName)=>{var n=newName.trim();if(!n||n===oldName)return;dispatch({type:'RENAME_CUSTOM_EX',muscle,oldName,newName:n});};
  const logMeas=(entry)=>dispatch({type:'LOG_MEAS',date:today(),entry});
  const deleteMeas=(date)=>dispatch({type:'DELETE_MEAS',date});
  // ── Persist data slices to IndexedDB ──────────────────────────────────────
  useEffect(()=>{lsSet("il_rest_presets",restPresets);},[restPresets]);
  useEffect(()=>{if(loaded)idbSet("il_custom_routines",customPlans);},[customPlans,loaded]);
  useEffect(()=>{if(loaded)idbSet("il_bw",bwLog);},[bwLog,loaded]);
  useEffect(()=>{if(loaded)idbSet("il_custom_ex",customExercises);},[customExercises,loaded]);
  useEffect(()=>{if(loaded)idbSet("il_custom_ex_types",customExTypes);},[customExTypes,loaded]);
  useEffect(()=>{if(loaded)idbSet("il_meas",measLog);},[measLog,loaded]);
  useEffect(()=>{if(loaded)idbSet("il_gym_plates",gymPlates);},[gymPlates,loaded]);

  // ── Cloud auth subscription ───────────────────────────────────────────────
  useEffect(()=>{
    getCloudUser().then(u=>setCloudUser(u));
    const unsub=onAuthChange(u=>setCloudUser(u));
    return unsub;
  },[]);

  // ── Cloud backup helpers ──────────────────────────────────────────────────
  const doCloudBackup=useCallback(async()=>{
    if(!cloudUser)return{error:'Not signed in.'};
    const payload={workouts:hist,customPlans,bwLog,measLog,customExercises,customExTypes,version:3};
    const{updatedAt,error}=await cloudBackup(payload);
    if(updatedAt){lsSet("il_last_cloud_backup",updatedAt);setLastCloudBackup(updatedAt);}
    return{error};
  },[cloudUser,hist,customPlans,bwLog,customExercises,customExTypes]);

  const useTmpl=t=>{
    const doStart=()=>{
      clearDraft();
      const exercises=t.exercises.map(ex=>{
        // Find last 2 sessions for this exercise
        var sessions=[];
        for(var i=hist.length-1;i>=0&&sessions.length<2;i--){
          var found=hist[i].exercises.find(e=>e.name===ex.name);
          if(found&&found.sets&&found.sets.length)sessions.push(found);
        }
        var lastSession=sessions[0]||null;
        if(!lastSession)return ex;
        var sets=lastSession.sets.map(s=>({...s,id:uid(),done:false}));
        const prog=ex.progression;
        var progressionApplied=null;
        var deloadApplied=null;
        if(prog&&prog.increment){
          const allDoneLast=lastSession.sets.every(s=>s.done!==false);
          const allDonePrev=sessions[1]?sessions[1].sets.every(s=>s.done!==false):true;
          const incKg=prog.unit==="lb"?lbToKg(prog.increment):prog.increment;
          if(allDoneLast){
            // Linear progression — completed last session
            sets=sets.map(s=>{const w=parseFloat(s.weight)||0;return{...s,weight:w?String(Math.round((w+incKg)*100)/100):s.weight};});
            progressionApplied=prog.increment;
          } else if(!allDoneLast&&sessions[1]&&!allDonePrev){
            // Failed 2 sessions in a row → deload 10%
            sets=sets.map(s=>{const w=parseFloat(s.weight)||0;return{...s,weight:w?String(Math.round(w*0.9*100)/100):s.weight};});
            deloadApplied=true;
          }
          // else: failed once — keep same weight, no increment
        }
        return{...ex,sets,progressionApplied,deloadApplied};
      });
      if(exercises.some(e=>e.deloadApplied))setDeloadNotice(true);
      setLogInit({name:t.name,date:today(),exercises});
      setLogName(t.name);draftT0.current=Date.now();draftWorkoutT0.current=null;setTab("log");
    };
    if(hasDraft){
      appConfirm("You have a workout in progress.\nStart this plan and discard it?").then(ok=>{if(ok)doStart();});
    }else{
      doStart();
    }
  };
  // ── Backup system ──────────────────────────────────────────────────────────
  // saveBackupFile: triggers a real file download → goes to Files app / Downloads
  const saveBackupFile=(workouts,ts,silent)=>{
    const data={version:3,date:ts,workouts,customPlans,bwLog,measLog,customExercises,customExTypes,createdAt:new Date().toISOString(),auto:!!silent};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="IronLog-"+ts+".json";
    document.body.appendChild(a);a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  };
  const doBackup=()=>{
    if(!hist.length)return;
    const ts=new Date().toISOString().slice(0,10);
    saveBackupFile(hist,ts,false);
    idbSet("il_last_backup",ts);
  };
  // doShareBackup: uses native share sheet (AirDrop / WhatsApp / email etc.)
  // Falls back to plain file download on desktop or unsupported browsers.
  const doShareBackup=async()=>{
    if(!hist.length)return;
    const ts=new Date().toISOString().slice(0,10);
    const data={version:3,date:ts,workouts:hist,customPlans,bwLog,measLog,customExercises,customExTypes,createdAt:new Date().toISOString()};
    const filename="IronLog-"+ts+".json";
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const file=new File([blob],filename,{type:"application/json"});
    // Use Web Share API with file if available (iOS 15+, Android Chrome)
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      try{
        await navigator.share({files:[file],title:"IronLog Backup",text:"My IronLog workout data — "+hist.length+" workouts"});
        idbSet("il_last_backup",ts);
        return;
      }catch(e){
        if(e.name==="AbortError")return; // user cancelled — don't fall through to download
      }
    }
    // Fallback: plain download
    doBackup();
  };
  // ── Shared sanitise + apply logic (used by file import AND cloud restore) ──
  const applyRawBackup=useCallback((raw)=>{
    const safeStr=(v,max=200)=>typeof v==="string"?v.replace(/[<>]/g,"").replace(/[\r\n\t]/g," ").slice(0,max).trim():"";
    const safeNum=(v,min=-1e9,max=1e9)=>{ var n=parseFloat(v); return isFinite(n)?Math.min(max,Math.max(min,n)):0; };
    const safeInt=(v,min=0,max=1e6)=>{ var n=parseInt(v,10); return isFinite(n)?Math.min(max,Math.max(min,n)):0; };
    const safeBool=(v)=>!!v;
    const sanitizeSet=(s)=>({
      id:safeStr(s.id)||uid(),reps:safeInt(s.reps),weight:safeNum(s.weight),done:safeBool(s.done),
      label:["Warm-up","Working","Drop set","Steady","Intervals","Sprint"].includes(s.label)?s.label:"",
      bodyweight:safeBool(s.bodyweight),mins:safeStr(s.mins,20),dist:safeStr(s.dist,20),
      rpe:safeStr(s.rpe,10),tempo:safeStr(s.tempo,20),bwExtra:safeNum(s.bwExtra),
    });
    const sanitizeEx=(ex)=>({
      id:safeStr(ex.id)||uid(),name:safeStr(ex.name,100),muscle:MG.includes(ex.muscle)?ex.muscle:"",
      sets:Array.isArray(ex.sets)?ex.sets.map(sanitizeSet):[],bodyweight:safeBool(ex.bodyweight),
      barType:["barbell","smith","ez","dumbbell","cable","machine","plateloaded","none"].includes(ex.barType)?ex.barType:"dumbbell",
      bwExtra:safeStr(ex.bwExtra,10),isSuperset:safeBool(ex.isSuperset),
      isCardio:ex.isCardio!=null?safeBool(ex.isCardio):isCardioEx(ex.name,ex.muscle),
    });
    const sanitizeWorkout=(w)=>({
      id:safeStr(w.id)||uid(),
      date:typeof w.date==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(w.date)&&!isNaN(new Date(w.date).getTime())?w.date:today(),
      name:safeStr(w.name,200),exercises:Array.isArray(w.exercises)?w.exercises.map(sanitizeEx):[],
      notes:safeStr(w.notes,1000),rating:safeInt(w.rating,0,5),duration:safeInt(w.duration,0,86400),
    });
    const workouts=raw.workouts||raw;
    if(!Array.isArray(workouts))return false;
    const valid=workouts.filter(w=>w&&typeof w==="object"&&w.id&&w.date&&Array.isArray(w.exercises));
    const rawPlans=raw.customPlans||raw.customRoutines;
    const importedPlans=Array.isArray(rawPlans)?rawPlans.filter(r=>r&&typeof r==="object"&&r.id&&r.name):null;
    const importedBw=Array.isArray(raw.bwLog)?raw.bwLog.filter(x=>x&&x.date&&typeof x.kg==="number").map(x=>({date:x.date,kg:safeNum(x.kg)})):null;
    const importedEx=raw.customExercises&&typeof raw.customExercises==="object"&&!Array.isArray(raw.customExercises)?raw.customExercises:null;
    const importedExTypes=raw.customExTypes&&typeof raw.customExTypes==="object"&&!Array.isArray(raw.customExTypes)?raw.customExTypes:null;
    const importedMeas=Array.isArray(raw.measLog)?raw.measLog.filter(x=>x&&x.date):null;
    const sanitized=valid.map(sanitizeWorkout);
    const doReplace=()=>{
      dispatch({type:'SET_HIST',hist:sanitized});
      if(importedPlans)dispatch({type:'SET_ALL',payload:{customPlans:importedPlans}});
      if(importedBw)dispatch({type:'SET_ALL',payload:{bwLog:importedBw}});
      if(importedEx)dispatch({type:'SET_ALL',payload:{customExercises:importedEx}});
      if(importedExTypes)dispatch({type:'SET_ALL',payload:{customExTypes:importedExTypes}});
      if(importedMeas)dispatch({type:'SET_ALL',payload:{measLog:importedMeas}});
    };
    if(hist.length===0){
      doReplace();
      appConfirm("Restored "+sanitized.length+" workouts"+(importedPlans?" + plans":"")+(importedBw?" + body weight":"")+"!").then(()=>{});
      return true;
    }
    showImportDialog(
      "You have "+hist.length+" workout"+(hist.length!==1?"s":"")+" on this device and "+sanitized.length+" in your backup."
    ).then(choice=>{
      if(choice==="merge"){
        const existingIds=new Set(hist.map(w=>w.id));
        const newOnly=sanitized.filter(w=>!existingIds.has(w.id));
        const merged=[...hist,...newOnly].sort((a,b)=>a.date.localeCompare(b.date));
        dispatch({type:'SET_HIST',hist:merged});
        if(importedPlans)dispatch({type:'SET_ALL',payload:{customPlans:importedPlans}});
        if(importedBw)dispatch({type:'SET_ALL',payload:{bwLog:importedBw}});
        if(importedEx)dispatch({type:'SET_ALL',payload:{customExercises:importedEx}});
        if(importedExTypes)dispatch({type:'SET_ALL',payload:{customExTypes:importedExTypes}});
        if(importedMeas)dispatch({type:'SET_ALL',payload:{measLog:importedMeas}});
        appConfirm("Merged — "+newOnly.length+" new workout"+(newOnly.length!==1?"s":"")+" added ("+merged.length+" total).").then(()=>{});
      }else if(choice==="replace"){
        doReplace();
        appConfirm("Replaced with "+sanitized.length+" workouts from backup.").then(()=>{});
      }
      // cancel: do nothing
    });
    return true;
  },[hist,showImportDialog]);

  const importBackup=e=>{
    const file=e.target.files&&e.target.files[0];
    if(!file)return;
    if(file.size>50*1024*1024){appConfirm("File too large (max 50MB).").then(()=>{});e.target.value="";return;}
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const raw=JSON.parse(ev.target.result);
        if(!applyRawBackup(raw)){appConfirm("Invalid backup file — no workout array found.").then(()=>{});}
      }catch(err){appConfirm("Invalid backup file — could not parse.").then(()=>{});}
    };
    reader.readAsText(file);
    e.target.value="";
  };

  // Defined after applyRawBackup to avoid TDZ reference error
  const doCloudRestore=useCallback(async()=>{
    const{backup,updatedAt,error}=await cloudRestore();
    if(error)return{error};
    if(backup)applyRawBackup(backup);
    return{error:null,updatedAt};
  },[applyRawBackup]);

  const doCloudSignOut=useCallback(async()=>{
    await cloudSignOut();
    setCloudUser(null);
  },[]);

  const doDeleteCloudAccount=useCallback(async()=>{
    const {error}=await deleteCloudAccount();
    if(!error) setCloudUser(null);
    return {error};
  },[]);

  // ── Offline indicator ──
  const [isOnline,setIsOnline]=useState(()=>navigator.onLine);
  useEffect(()=>{
    const goOnline=()=>setIsOnline(true);
    const goOffline=()=>setIsOnline(false);
    window.addEventListener("online",goOnline);
    window.addEventListener("offline",goOffline);
    return()=>{window.removeEventListener("online",goOnline);window.removeEventListener("offline",goOffline);};
  },[]);

  // ── Backup due state — checked silently; manual export available in Settings ──
  const [backupDue,setBackupDue]=useState(false);
  const [updateAvail,setUpdateAvail]=useState(false);
  const [updateToast,setUpdateToast]=useState(false);
  const updateToastTimer=useRef(null);
  useEffect(()=>{
    // Check flag immediately — covers case where SW update event fired before React mounted
    if(window._swUpdatePending){setUpdateAvail(true);}
    var handler=function(){setUpdateAvail(true);};
    window.addEventListener('swUpdate',handler);
    return()=>window.removeEventListener('swUpdate',handler);
  },[]);
  useEffect(()=>{
    if(updateAvail){
      setUpdateToast(true);
      clearTimeout(updateToastTimer.current);
      updateToastTimer.current=setTimeout(()=>setUpdateToast(false),7000);
    }
    return()=>clearTimeout(updateToastTimer.current);
  },[updateAvail]);
  // ── Lock body scroll on log tab — overflow:hidden on html+body (no position:fixed
  //    which would break iOS position:fixed children like modals/pickers) ──────
  useEffect(()=>{
    if(tab==='log'){
      document.documentElement.style.overflow='hidden';
      document.body.style.overflow='hidden';
      return()=>{document.documentElement.style.overflow='';document.body.style.overflow='';};
    }
  },[tab]);
  const doUpdate=()=>{
    var reg=window._swReg;
    if(reg&&reg.waiting){
      reg.waiting.postMessage({type:'SKIP_WAITING'});
      navigator.serviceWorker.addEventListener('controllerchange',function(){
        window.location.reload();
      },{once:true});
    } else {
      window.location.reload();
    }
  };
  useEffect(()=>{
    if(!loaded||!hist.length)return;
    idbGet("il_last_backup","").then(last=>{
      if(last!==today())setBackupDue(true);
    });
    // Auto-snapshot to IDB happens silently every time app loads with new data
    idbGet("il_last_snapshot","").then(last=>{
      setLastSnapshot(last||"");
      if(last!==today()){doSnapshot();}// silent, no download, no prompt
    });
  },[loaded,hist]);
  const exportCSV=()=>{
    if(!hist.length)return;
    // Build CSV: Date, Workout, Exercise, Muscle, Set, Type, Duration(min), Distance(km), Weight(kg), Weight(display), Reps, Est1RM, Volume, Label, Notes, Rating
    var rows=[["Date","Workout Name","Exercise","Muscle","Set","Type","Duration (min)","Distance (km)","Weight (kg)","Weight ("+unit+")","Reps","Est 1RM ("+unit+")","Volume (kg×reps)","Label","Workout Notes","Rating"]];
    hist.forEach(w=>{
      (w.exercises||[]).forEach(ex=>{
        var isC=ex.isCardio!=null?!!ex.isCardio:isCardioEx(ex.name,ex.muscle);
        (ex.sets||[]).forEach((s,si)=>{
          var wKg=isC?0:parseFloat(s.weight)||0;
          var wDisp=unit==="lb"?Math.round(wKg*2.2046*4)/4:wKg;
          var r=isC?0:parseInt(s.reps)||0;
          var cappedR=Math.min(r,15);
          var rm=!isC&&r===1?wKg:(!isC&&r>0&&wKg>0?Math.round(wKg*(1+cappedR/30)):0);
          var rmDisp=unit==="lb"?Math.round(rm*2.2046*4)/4:rm;
          var mins=isC?parseFloat(s.mins)||"":"";
          var dist=isC?parseFloat(s.dist)||"":"";
          rows.push([
            w.date,
            (w.name||"").replace(/,/g,""),
            (ex.name||"").replace(/,/g,""),
            ex.muscle||"",
            si+1,
            isC?"Cardio":"Strength",
            mins,
            dist,
            isC?"":wKg,
            isC?"":wDisp,
            isC?"":r,
            isC?"":rmDisp||"",
            isC?"":wKg*r,
            s.label||"",
            (w.notes||"").replace(/[\n,]/g," "),
            w.rating||""
          ]);
        });
      });
    });
    var csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n");
    var blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");
    a.href=url;a.download="IronLog-export-"+today()+".csv";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  };
  // ── Silent auto-snapshot to IDB — no file download required ──────────────
  // Saves a JSON snapshot to IDB key 'il_snapshot_YYYY-MM-DD'. Keeps last 7.
  // User can restore from snapshot anytime via Home screen.
  const [lastSnapshot,setLastSnapshot]=useState("");
  const [snapshotDue,setSnapshotDue]=useState(false);
  useEffect(()=>{
    if(!loaded||!hist.length)return;
    idbGet("il_last_snapshot","").then(last=>{
      setLastSnapshot(last||"");
      if(last!==today())setSnapshotDue(true);
    });
  },[loaded,hist]);
  const doSnapshot=()=>{
    if(!hist.length)return;
    const ts=today();
    const snap={version:3,date:ts,workouts:hist,customPlans,bwLog,customExercises,customExTypes,createdAt:new Date().toISOString()};
    idbSet("il_snapshot_"+ts,snap);
    idbSet("il_last_snapshot",ts);
    setLastSnapshot(ts);setSnapshotDue(false);
    // Prune snapshots older than 7 days — batched in a single microtask
    setTimeout(()=>{for(let i=7;i<30;i++){const d=new Date();d.setDate(d.getDate()-i);idbSet("il_snapshot_"+d.toISOString().slice(0,10),null);}},2000);
  };
  // List available auto-snapshots from IDB (last 7 days that actually have data)
  const listSnapshots=useCallback(async()=>{
    const results=[];
    for(let i=0;i<7;i++){
      const d=new Date();d.setDate(d.getDate()-i);
      const key=d.toISOString().slice(0,10);
      const snap=await idbGet("il_snapshot_"+key,null);
      if(snap&&snap.workouts&&snap.workouts.length>0){
        results.push({date:key,count:snap.workouts.length,snap});
      }
    }
    return results;
  },[]);
  // Restore from a specific snapshot
  const restoreFromSnapshot=useCallback((snap)=>{
    if(!snap||!snap.workouts)return;
    const payload={hist:snap.workouts};
    if(snap.customPlans&&snap.customPlans.length)payload.customPlans=snap.customPlans;
    if(snap.bwLog&&snap.bwLog.length)payload.bwLog=snap.bwLog;
    if(snap.customExercises&&Object.keys(snap.customExercises).length)payload.customExercises=snap.customExercises;
    if(snap.customExTypes&&Object.keys(snap.customExTypes).length)payload.customExTypes=snap.customExTypes;
    dispatch({type:'SET_ALL',payload});
  },[]);

  // Still keep manual file export for real off-device backup
  const doAutoBackup=()=>{
    const ts=today();
    saveBackupFile(hist,ts,true);
    idbSet("il_last_backup",ts);
    setBackupDue(false);
    doSnapshot(); // also do a silent IDB snapshot
  };

  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100dvh",background:c.bg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",position:"relative",color:c.text,transition:"background .3s"}}>
      {!onboarded&&<OnboardingScreen onDone={()=>{lsSet("il_onboarded",true);setOnboarded(true);setTimeout(startTour,600);}}/>}
      {/* ── Update toast ── outer div owns fixed+centering; inner div owns animation so transform doesn't clobber left:50% ── */}
      {updateToast&&createPortal(
        <div style={{position:"fixed",bottom:"calc(80px + env(safe-area-inset-bottom,0px))",left:0,right:0,display:"flex",justifyContent:"center",zIndex:8500,pointerEvents:"none",padding:"0 16px"}}>
          <div className="il-slide-up" style={{pointerEvents:"all",width:"fit-content",maxWidth:"calc(100vw - 32px)",background:"linear-gradient(135deg,#7C6EFA,#9b8ffc)",color:"#fff",borderRadius:18,padding:"11px 18px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 32px rgba(124,110,250,0.5)",whiteSpace:"nowrap",boxSizing:"border-box"}}>
            <span>🆕 Update ready</span>
            <button onClick={()=>{setUpdateToast(false);setTab("settings");}} style={{background:"rgba(255,255,255,0.25)",border:"none",borderRadius:9,padding:"5px 11px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",minHeight:30}}>View</button>
            <button onClick={()=>setUpdateToast(false)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.7)",fontSize:18,lineHeight:1,padding:"0 2px",fontFamily:"inherit"}}>×</button>
          </div>
        </div>
      ,document.body)}
      {!isOnline&&createPortal(
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9900,display:"flex",justifyContent:"center",pointerEvents:"none",padding:"env(safe-area-inset-top,0px) 0 0"}}>
          <div style={{background:"#1a1a2e",border:"1px solid #f6a83566",borderRadius:"0 0 14px 14px",padding:"6px 18px",fontSize:12,fontWeight:700,color:"#f6a835",display:"flex",alignItems:"center",gap:6,letterSpacing:"0.03em"}}>
            <span>📡</span> Offline — all data saved locally
          </div>
        </div>
      ,document.body)}
      {!splashDone&&onboarded&&<div onAnimationEnd={()=>setSplashDone(true)} style={{position:"fixed",inset:0,background:c.bg,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,animation:loaded?"fadeOut .35s ease forwards":"none",pointerEvents:"none"}}>
        <div style={{fontSize:48}}>🏋️</div>
        <div style={{fontSize:18,fontWeight:900,color:c.text,letterSpacing:"-0.02em"}}>IronLog</div>
      </div>}
      {appConfirmEl}
      {importDialogEl}
      {milestone&&<div onClick={()=>setMilestone(null)} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{background:"linear-gradient(135deg,#1a1a2e,#0f3460)",border:"2px solid #7C6EFA88",borderRadius:28,padding:"36px 28px",textAlign:"center",maxWidth:300,animation:"pop .35s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{fontSize:56,marginBottom:10}}>{milestone>=100?"🏆":milestone>=25?"🎖️":"🎉"}</div>
          <div style={{fontSize:26,fontWeight:900,color:"#fff",letterSpacing:"-0.02em",marginBottom:6}}>{milestone} Workout{milestone===1?"":"s"}!</div>
          <div style={{fontSize:14,color:"#b0a0ff",marginBottom:20}}>{milestone===1?"Your first workout is logged. The journey begins!":milestone>=100?"You're a legend. "+milestone+" workouts and counting!":"Keep going — you're on fire! 🔥"}</div>
          <button onClick={()=>setMilestone(null)} style={{background:"#7C6EFA",border:"none",borderRadius:13,padding:"11px 28px",fontSize:15,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit"}}>Let's go! 💪</button>
        </div>
      </div>}

      {/* ── Fixed top bar ── */}
      <div className="il-topbar" style={{background:c.bg+"f5",backdropFilter:"saturate(180%) blur(20px)",WebkitBackdropFilter:"saturate(180%) blur(20px)",borderBottom:"1px solid "+c.border,display:"flex",alignItems:"center",justifyContent:"space-between",paddingLeft:16,paddingRight:16,paddingBottom:10}}>
        {/* Left: wordmark or workout name input */}
        <div style={{flex:1,minWidth:0,marginRight:10}}>
          {tab==="log"
            ? <input value={logName} onChange={e=>setLogName(e.target.value)} placeholder="Workout name…"
                style={{background:"none",border:"none",fontSize:17,fontWeight:800,color:c.text,outline:"none",fontFamily:"inherit",letterSpacing:"-0.025em",width:"100%"}}/>
            : <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:26,height:26,borderRadius:8,background:"linear-gradient(135deg,#7C6EFA,#a89dff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🏋️</div>
                <span style={{fontSize:17,fontWeight:800,color:c.text,letterSpacing:"-0.025em"}}>IronLog</span>
              </div>
          }
        </div>
        {/* Right: unit toggle + theme + Finish */}
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
          <button onClick={()=>setUnit(u=>u==="kg"?"lb":"kg")}
            style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,width:40,height:30,cursor:"pointer",color:c.accent,fontSize:11,fontWeight:800,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",letterSpacing:"0.02em"}}>{unit.toUpperCase()}</button>
          {tab==="log"&&<button onClick={()=>{haptic("heavy");logFinishRef.current&&logFinishRef.current();}}
            style={{border:"none",borderRadius:10,height:30,padding:"0 13px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4,background:"linear-gradient(135deg,#7C6EFA,#9b8ffc)",color:"#fff",whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(124,110,250,0.35)",letterSpacing:"-0.01em"}}>
            <ICheck/>Finish
          </button>}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="il-scroll" style={{overflowY:tab==="log"?"hidden":undefined}}>
        <div key={tab} className={tabDirRef.current==="r"?"il-enter-r":"il-enter-l"}>
          {!loaded&&<SkeletonPage/>}
          {loaded&&tab==="home"&&<ErrorBoundary name="Home" c={c}><HomePageM hist={hist} dark={dark} c={c} unit={unit} onBlank={blank} onPlan={()=>setTab("plans")} onUsePlan={useTmpl} bwLog={bwLog} onLogBW={logBW} customPlans={customPlans} customExercises={customExercises} bwUnit={effectiveBwUnit} onSetBwUnit={setBwUnit} streakDays={streakDays}/></ErrorBoundary>}
          {loaded&&tab==="log"&&<ErrorBoundary name="Log" c={c}><LogPageM
            initial={logInit} c={c} unit={unit} logName={logName} finishRef={logFinishRef} onSave={saveW}
            draftExs={draftExs} setDraftExs={setDraftExs}
            draftRating={draftRating} setDraftRating={setDraftRating}
            draftNotes={draftNotes} setDraftNotes={setDraftNotes}
            draftT0={draftT0}
            draftWorkoutT0={draftWorkoutT0}
            onDiscard={clearDraft}
            timerSecs={timerSecs} timerStart={timerStart} lastTimerSecs={lastTimerSecs}
            startTimer={startTimer} cycleTimer={cycleTimer} stopTimer={stopTimer}
            customExercises={customExercises} customExTypes={customExTypes} onAddCustomEx={addCustomExercise} onDeleteCustomEx={deleteCustomExercise} onRenameCustomEx={renameCustomExercise}
            hist={hist} gymPlates={gymPlates} bwLog={bwLog}
            restPresets={restPresets} onSaveRestPreset={saveRestPreset}
            collapsedExs={collapsedExs} setCollapsedExs={setCollapsedExs}
            deloadNotice={deloadNotice} onDismissDeload={()=>setDeloadNotice(false)}
          /></ErrorBoundary>}
          {loaded&&tab==="history"&&<ErrorBoundary name="History" c={c}><HistoryPageM hist={hist} c={c} unit={unit} onDelete={delW} onExportCSV={exportCSV} onRepeat={repeatW} onSaveAsPlan={saveCustomPlan} customPlans={customPlans} bwKg={bwLog.length?bwLog[bwLog.length-1].kg:0}/></ErrorBoundary>}
          {loaded&&tab==="progress"&&<ErrorBoundary name="Progress" c={c}><ProgressPageM hist={hist} c={c} unit={unit} bwLog={bwLog} onLogBW={logBW} onDeleteBW={deleteBW} customExercises={customExercises} measLog={measLog} onLogMeas={logMeas} onDeleteMeas={deleteMeas} bwKg={bwLog.length?bwLog[bwLog.length-1].kg:0} bwUnit={effectiveBwUnit} onSetBwUnit={setBwUnit} streakDays={streakDays}/></ErrorBoundary>}
          {loaded&&tab==="prs"&&<ErrorBoundary name="PRs" c={c}><PRsPageM hist={hist} c={c} unit={unit} bwKg={bwLog.length?bwLog[bwLog.length-1].kg:0}/></ErrorBoundary>}
          {loaded&&tab==="plans"&&<ErrorBoundary name="Plans" c={c}><PlansPageM c={c} unit={unit} onUse={useTmpl} customPlans={customPlans} onSaveCustom={saveCustomPlan} onDeleteCustom={deleteCustomPlan} customExercises={customExercises} customExTypes={customExTypes} onAddCustomEx={addCustomExercise} onDeleteCustomEx={deleteCustomExercise} onRenameCustomEx={renameCustomExercise}/></ErrorBoundary>}
          {loaded&&tab==="help"&&<ErrorBoundary name="Help" c={c}><HelpPageM c={c} onStartTour={startTour} updateAvail={updateAvail} onUpdate={doUpdate}/></ErrorBoundary>}
          {loaded&&tab==="settings"&&<ErrorBoundary name="Settings" c={c}><SettingsPageM c={c} dark={dark} onSetDark={setDark} colorTheme={colorTheme} onSetColorTheme={setAndSaveColorTheme} unit={unit} onSetUnit={setUnit} bwUnit={effectiveBwUnit} onSetBwUnit={setBwUnit} gymPlates={gymPlates} onSetGymPlates={setGymPlates} reminderDays={reminderDays} onSetReminderDays={setReminderDays} streakDays={streakDays} onSetStreakDays={setStreakDays} hist={hist} customPlans={customPlans} bwLog={bwLog} customExercises={customExercises} onBackup={doBackup} onShare={doShareBackup} onImport={importBackup}
            cloudUser={cloudUser} lastCloudBackup={lastCloudBackup}
            onCloudBackup={doCloudBackup} onCloudRestore={doCloudRestore} onCloudSignOut={doCloudSignOut} onDeleteCloudAccount={doDeleteCloudAccount} lastSnapshot={lastSnapshot} onListSnapshots={listSnapshots} onRestoreSnapshot={restoreFromSnapshot} updateAvail={updateAvail} onUpdate={doUpdate} onStartTour={startTour}/></ErrorBoundary>}
        </div>
      </div>

      {tourStep!==null&&<TourOverlay c={c} step={tourStep} onNext={tourNext} onPrev={tourPrev} onSkip={()=>setTourStep(null)}/>}
      {summaryWorkout&&<WorkoutSummary workout={summaryWorkout} hist={hist} unit={unit} c={c} onDone={closeSummary}/>}

      {/* ── Bottom nav ── */}
      <div className="il-nav" style={{background:c.nav,backdropFilter:"saturate(180%) blur(24px)",WebkitBackdropFilter:"saturate(180%) blur(24px)",borderTop:"1px solid "+c.border,overflow:"visible"}}>
        <div style={{display:"flex",alignItems:"center",padding:"4px 4px 0"}}>
          {/* Left: Home · PRs · Plan */}
          {[{id:"home",label:"Home",Icon:IHome},{id:"prs",label:"PRs",Icon:IPR},{id:"plans",label:"Plan",Icon:IGrid}].map(({id,label,Icon})=>{
            const active=tab===id;
            return(
              <button key={id} data-tour={id==="prs"?"nav-prs":id==="plans"?"nav-plans":undefined} onClick={()=>setTab(id)} style={{flex:1,background:active?c.as:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,color:active?c.accent:c.sub,fontFamily:"inherit",padding:"6px 0 5px",borderRadius:12,position:"relative",zIndex:1,transition:"color 0.18s,background 0.18s"}}>
                <div style={{transform:active?"scale(1.12)":"scale(1)",transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}><Icon/></div>
                <span style={{fontSize:8.5,fontWeight:active?800:500,letterSpacing:"0.04em"}}>{label.toUpperCase()}</span>
              </button>
            );
          })}

          {/* Center: Log — inline circle at same level as other tabs */}
          <div style={{width:76,flexShrink:0,display:"flex",justifyContent:"center",alignItems:"center",paddingBottom:1}}>
            <button data-tour="nav-log" onClick={()=>setTab("log")} style={{
              width:50,height:50,borderRadius:"50%",
              background:tab==="log"?"linear-gradient(135deg,#7C6EFA,#a89dff)":"linear-gradient(135deg,#7C6EFA99,#a89dff88)",
              border:"none",
              color:"#fff",cursor:"pointer",fontFamily:"inherit",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
              boxShadow:tab==="log"?"0 0 0 3px "+c.as+",0 4px 20px rgba(124,110,250,0.55)":"0 2px 12px rgba(124,110,250,0.35)",
              transform:tab==="log"?"scale(1.08)":"scale(1)",
              transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.2s",
            }}>
              <ILog/>
              <span style={{fontSize:7,fontWeight:900,letterSpacing:"0.06em"}}>LOG</span>
            </button>
          </div>

          {/* Right: Progress · History · Settings */}
          {[{id:"progress",label:"Progress",Icon:IChart},{id:"history",label:"History",Icon:IHist},{id:"settings",label:"Settings",Icon:ISettings}].map(({id,label,Icon})=>{
            const active=tab===id;
            return(
              <button key={id} data-tour={id==="progress"?"nav-progress":id==="history"?"nav-history":undefined} onClick={()=>setTab(id)} style={{flex:1,background:active?c.as:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,color:active?c.accent:c.sub,fontFamily:"inherit",padding:"6px 0 5px",borderRadius:12,position:"relative",zIndex:1,transition:"color 0.18s,background 0.18s"}}>
                <div style={{transform:active?"scale(1.12)":"scale(1)",transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}><Icon/></div>
                <span style={{fontSize:8.5,fontWeight:active?800:500,letterSpacing:"0.04em"}}>{label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(p){super(p);this.state={err:null};}
  static getDerivedStateFromError(e){return{err:e};}
  componentDidCatch(error,info){console.error('[IronLog] Error in',this.props.name||'page',error,info);}
  render(){
    if(this.state.err){
      const msg=this.state.err.message||String(this.state.err);
      const stk=(this.state.err.stack||"").split("\n").slice(0,6).join("\n");
      const c=this.props.c||(window._ilDark===false?L:D);
      const isPage=!!this.props.name; // per-page boundary vs root boundary
      return <div style={{padding:24,background:isPage?c.bg:D.bg,minHeight:isPage?"60vh":"100svh",fontFamily:"-apple-system,sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:12}}>
        <div style={{fontSize:36}}>⚠️</div>
        <div style={{fontSize:17,fontWeight:800,color:c.r||"#f87171"}}>{isPage?`${this.props.name} tab crashed`:"Runtime Error"}</div>
        {isPage&&<div style={{fontSize:13,color:c.sub,maxWidth:280,lineHeight:1.6}}>Your workout data is safe. Tap retry to reload this tab.</div>}
        <button onClick={()=>this.setState({err:null})} style={{background:c.accent||"#7C6EFA",color:"#fff",border:"none",borderRadius:12,padding:"10px 24px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>Retry</button>
        <details style={{fontSize:11,color:c.sub,maxWidth:320,textAlign:"left",marginTop:4}}>
          <summary style={{cursor:"pointer",marginBottom:6}}>Error details</summary>
          <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-all",background:c.card2||"#141422",padding:12,borderRadius:8,marginTop:4}}>{msg}{"\n\n"}{stk}</pre>
        </details>
      </div>;
    }
    return this.props.children;
  }
}

export default App;
