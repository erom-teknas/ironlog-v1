import React, {useState,useEffect,useRef,useCallback} from 'react';
import ReactDOM from 'react-dom/client';

import { D, L, O, MILESTONES, TIMER_STEPS, MG } from './constants';
import { uid, today, fmtD, lbToKg, haptic } from './utils';
import { openDB, idbSet, idbGet, lsGet, lsSet } from './storage';
import { TABS, ISun, IMoon, ICheck } from './icons';
import { useConfirm } from './hooks.jsx';

import TourOverlay, { TOUR_STEPS } from './components/TourOverlay';
import SkeletonPage from './components/SkeletonPage';
import HomePage from './pages/HomePage';
import LogPage from './pages/LogPage';
import HistoryPage from './pages/HistoryPage';
import ProgressPage from './pages/ProgressPage';
import PRsPage from './pages/PRsPage';
import RoutinesPage from './pages/RoutinesPage';
import HelpPage from './pages/HelpPage';

// ─── Onboarding ───────────────────────────────────────────────────────────────
function OnboardingScreen({onDone}){
  return(
    <div style={{position:"fixed",inset:0,background:"#0c0c12",zIndex:1000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:16}}>🏋️</div>
      <div style={{fontSize:30,fontWeight:900,color:"#eeeeff",letterSpacing:"-0.03em",marginBottom:8}}>IronLog</div>
      <div style={{fontSize:15,color:"#b0a0ff",marginBottom:32,fontWeight:500}}>Track. Lift. Grow.</div>
      <div style={{width:"100%",maxWidth:320,marginBottom:36,display:"flex",flexDirection:"column",gap:14}}>
        {[["💪","Log sets with auto rest timer & plate calculator"],["📈","Track your PRs, volume and strength over time"],["📋","Save routines with automatic progressive overload"],["📴","100% offline — your data never leaves your phone"]].map(([icon,text])=>(
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
const RoutinesPageM=React.memo(RoutinesPage);
const HelpPageM=React.memo(HelpPage);

function App(){
  const TAB_ORDER=["home","log","history","progress","prs","routines","help"];
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
  const startTour=()=>{setTourStep(0);if(TOUR_STEPS[0].tab)setTab(TOUR_STEPS[0].tab);};
  const tourNext=()=>{
    const next=tourStep+1;
    if(next>=TOUR_STEPS.length){setTourStep(null);return;}
    setTourStep(next);
    if(TOUR_STEPS[next].tab)setTab(TOUR_STEPS[next].tab);
  };
  const tourPrev=()=>{
    const prev=tourStep-1;
    if(prev<0)return;
    setTourStep(prev);
    if(TOUR_STEPS[prev].tab)setTab(TOUR_STEPS[prev].tab);
  };
  const [dark,setDark]=useState(()=>lsGet("il_dark",true)); // true | false | "oled" | "auto"
  const [sysDark,setSysDark]=useState(()=>window.matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(()=>{const mq=window.matchMedia("(prefers-color-scheme: dark)");const h=e=>setSysDark(e.matches);mq.addEventListener("change",h);return()=>mq.removeEventListener("change",h);},[]);
  const effectiveDark=dark==="auto"?sysDark:(dark==="oled"?true:dark);
  const [unit,setUnit]=useState(()=>lsGet("il_unit","kg"));
  const [hist,setHist]=useState(()=>lsGet("il_v4",[]));
  const [logInit,setLogInit]=useState(null);
  const [logName,setLogName]=useState("");
  const logFinishRef=useRef(null);
  const [loaded,setLoaded]=useState(false);
  const [splashDone,setSplashDone]=useState(false);
  const c=dark==="oled"?O:effectiveDark?D:L;
  // ── App-level confirm dialog — replaces all window.confirm in App scope ───
  const {confirm:appConfirm,confirmEl:appConfirmEl}=useConfirm(c);
  // ── Draft state lifted to App so switching tabs never loses log data ──────
  const [draftExs,setDraftExs]=useState([]);
  const [draftRating,setDraftRating]=useState(0);
  const [draftNotes,setDraftNotes]=useState("");
  const draftT0=useRef(Date.now());
  const hasDraft=draftExs.length>0;
  // ── Timer state — lifted so it survives tab switches, timestamp-based for screen lock ──
  const [timerSecs,setTimerSecs]=useState(()=>{const t=lsGet("il_timer",null);if(t&&t.secs>0&&t.start>0&&(Date.now()-t.start)<t.secs*1000)return t.secs;return 0;});
  const [timerStart,setTimerStart]=useState(()=>{const t=lsGet("il_timer",null);if(t&&t.secs>0&&t.start>0&&(Date.now()-t.start)<t.secs*1000)return t.start;return 0;});
  const [lastTimerSecs,setLastTimerSecs]=useState(()=>lsGet("il_lastTimer",60));
  useEffect(()=>{lsSet("il_timer",{secs:timerSecs,start:timerStart});},[timerSecs,timerStart]);
  useEffect(()=>{if(lastTimerSecs>0)lsSet("il_lastTimer",lastTimerSecs);},[lastTimerSecs]);
  const cycleTimer=()=>{
    const cur=timerSecs;
    const idx=TIMER_STEPS.indexOf(cur);
    const next=idx===-1?TIMER_STEPS[0]:(idx===TIMER_STEPS.length-1?0:TIMER_STEPS[idx+1]);
    if(next===0){setTimerSecs(0);}else{setTimerSecs(next);setTimerStart(Date.now());setLastTimerSecs(next);}
  };
  const startTimer=(secs)=>{setTimerSecs(secs);setTimerStart(Date.now());};
  const stopTimer=()=>{setTimerSecs(0);swNotif(0);};
  // Auto-save draft to IndexedDB — debounced to avoid writes on every keystroke
  const draftSaveTimer=useRef(null);
  useEffect(()=>{
    if(!loaded) return;
    clearTimeout(draftSaveTimer.current);
    draftSaveTimer.current=setTimeout(()=>{
      idbSet("il_draft",{exs:draftExs,rating:draftRating,notes:draftNotes,name:logName,sec:Math.floor((Date.now()-draftT0.current)/1000),t0:draftT0.current,init:logInit});
    },800);
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
      }
    });
  },[]);

  // On mount: migrate from localStorage → IndexedDB, then load from IndexedDB
  useEffect(()=>{
    var lsData=lsGet("il_v4",[]);
    idbGet("il_v4",[]).then(idbData=>{
      // Use whichever has more data (merge favoring IndexedDB, fallback to ls)
      var merged=idbData.length>=lsData.length?idbData:lsData;
      setHist(merged);
      setLoaded(true);
      // Persist merged into IndexedDB and clear localStorage entry to avoid confusion
      if(merged.length>0){
        idbSet("il_v4",merged).then(()=>{
          try{localStorage.removeItem("il_v4");}catch(e){}
        });
      }
    });
    idbGet("il_unit","kg").then(u=>{setUnit(u);});
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
  const clearDraft=()=>{setDraftExs([]);setDraftRating(0);setDraftNotes("");setLogName("");setLogInit(null);draftT0.current=Date.now();idbSet("il_draft",null);};
  const saveW=w=>{
    setHist(p=>{
      const next=[...p,w];
      const seen=lsGet("il_seen_milestones",[]);
      const hit=MILESTONES.find(m=>next.length===m&&!seen.includes(m));
      if(hit){setMilestone(hit);lsSet("il_seen_milestones",[...seen,hit]);}
      return next;
    });
    clearDraft();setTab("history");
  };
  const delW=id=>setHist(p=>p.filter(w=>w.id!==id));
  const blank=()=>{if(!hasDraft){setLogInit(null);setLogName("");draftT0.current=Date.now();}setTab("log");};
  // ── Repeat workout from history ────────────────────────────────────────────
  const repeatW=w=>{
    const doRepeat=()=>{
      clearDraft();
      setLogInit({...w,exercises:w.exercises.map(ex=>({...ex,id:uid(),sets:ex.sets.map(s=>({...s,id:uid(),done:false}))}))});
      setLogName(w.name+" (repeat)");draftT0.current=Date.now();setTab("log");
    };
    if(hasDraft){appConfirm("You have a workout in progress.\nRepeat this one and discard it?").then(ok=>{if(ok)doRepeat();});}
    else doRepeat();
  };
  // ── Workout reminder notifications ────────────────────────────────────────
  const [reminderDays,setReminderDays]=useState(()=>lsGet("il_reminder_days",0)); // 0=off
  useEffect(()=>{lsSet("il_reminder_days",reminderDays);},[reminderDays]);
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
      reg.active.postMessage({type:'SCHEDULE_REMINDER',delay,label:"You haven't trained in "+daysSince+" day"+(daysSince===1?"":"s")+" — time to get back at it! 💪"});
    }
  },[loaded,hist,reminderDays]);
  // ── Rest presets — per-exercise rest duration ──────────────────────────────
  const [restPresets,setRestPresets]=useState(()=>lsGet("il_rest_presets",{}));
  useEffect(()=>{lsSet("il_rest_presets",restPresets);},[restPresets]);
  const saveRestPreset=(name,secs)=>setRestPresets(p=>({...p,[name]:secs}));
  // ── Custom routines ────────────────────────────────────────────────────────
  const [customRoutines,setCustomRoutines]=useState([]);
  useEffect(()=>{idbGet("il_custom_routines",[]).then(r=>setCustomRoutines(r||[]));;},[]);
  useEffect(()=>{if(loaded)idbSet("il_custom_routines",customRoutines);},[customRoutines,loaded]);
  const saveCustomRoutine=(r)=>{
    setCustomRoutines(p=>{const idx=p.findIndex(x=>x.id===r.id);return idx>=0?p.map(x=>x.id===r.id?r:x):[...p,r];});
  };
  const deleteCustomRoutine=(id)=>setCustomRoutines(p=>p.filter(r=>r.id!==id));
  // ── Body weight tracking — [{date,kg}] stored in IDB ──────────────────────
  const [bwLog,setBwLog]=useState([]);
  useEffect(()=>{idbGet("il_bw",[]).then(r=>setBwLog(r||[]));} ,[]);
  useEffect(()=>{if(loaded)idbSet("il_bw",bwLog);},[bwLog,loaded]);
  const logBW=(kg)=>{
    const d=today();
    setBwLog(p=>{const without=p.filter(x=>x.date!==d);return[...without,{date:d,kg}].sort((a,b)=>a.date.localeCompare(b.date));});
  };
  const deleteBW=(date)=>setBwLog(p=>p.filter(x=>x.date!==date));
  // ── Custom exercises — per muscle group, stored in IDB ─────────────────
  // Shape: {Chest:["My Ex",...], Back:[...], ...}
  const [customExercises,setCustomExercises]=useState({});
  useEffect(()=>{idbGet("il_custom_ex",{}).then(r=>setCustomExercises(r||{}));},[]);
  useEffect(()=>{if(loaded)idbSet("il_custom_ex",customExercises);},[customExercises,loaded]);
  const addCustomExercise=(muscle,name)=>{
    var n=name.trim();
    if(!n)return;
    setCustomExercises(p=>{
      var existing=[...(p[muscle]||[])];
      if(existing.includes(n))return p;
      return{...p,[muscle]:[...existing,n]};
    });
  };
  const deleteCustomExercise=(muscle,name)=>{
    setCustomExercises(p=>({...p,[muscle]:(p[muscle]||[]).filter(x=>x!==name)}));
  };
  const renameCustomExercise=(muscle,oldName,newName)=>{
    var n=newName.trim();
    if(!n||n===oldName)return;
    setCustomExercises(p=>({...p,[muscle]:(p[muscle]||[]).map(x=>x===oldName?n:x)}));
  };
  // ── Body measurements — [{date, chest, waist, hips, biceps, thighs}] ──────
  const [measLog,setMeasLog]=useState([]);
  useEffect(()=>{idbGet("il_meas",[]).then(r=>setMeasLog(r||[]));},[]);
  useEffect(()=>{if(loaded)idbSet("il_meas",measLog);},[measLog,loaded]);
  const logMeas=(entry)=>{
    const d=today();
    setMeasLog(p=>{const without=p.filter(x=>x.date!==d);return[...without,{...entry,date:d}].sort((a,b)=>a.date.localeCompare(b.date));});
  };
  const deleteMeas=(date)=>setMeasLog(p=>p.filter(x=>x.date!==date));
  // ── Gym plates kit — user's owned plates stored as kg values ──────────────
  // Default: standard full set. User can customise in Settings on Home screen.
  const DEFAULT_PLATES_KG=[25,20,15,10,5,2.5,1.25];
  const [gymPlates,setGymPlates]=useState(DEFAULT_PLATES_KG);
  useEffect(()=>{idbGet("il_gym_plates",DEFAULT_PLATES_KG).then(r=>setGymPlates(r&&r.length?r:DEFAULT_PLATES_KG));},[]);
  useEffect(()=>{if(loaded)idbSet("il_gym_plates",gymPlates);},[gymPlates,loaded]);
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
      setLogInit({name:t.name,date:today(),exercises});
      setLogName(t.name);draftT0.current=Date.now();setTab("log");
    };
    if(hasDraft){
      appConfirm("You have a workout in progress.\nStart this routine and discard it?").then(ok=>{if(ok)doStart();});
    }else{
      doStart();
    }
  };
  // ── Backup system ──────────────────────────────────────────────────────────
  // saveBackupFile: triggers a real file download → goes to Files app / Downloads
  const saveBackupFile=(workouts,ts,silent)=>{
    const data={version:3,date:ts,workouts,customRoutines,bwLog,customExercises,createdAt:new Date().toISOString(),auto:!!silent};
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
  const importBackup=e=>{
    const file=e.target.files&&e.target.files[0];
    if(!file)return;
    if(file.size>50*1024*1024){appConfirm("File too large (max 50MB).").then(()=>{});e.target.value="";return;}
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const SAFE_KEYS=/^[a-zA-Z0-9_ -]{1,80}$/; // allowlist for string keys from user data
        const safeStr=(v,max=200)=>typeof v==="string"?v.replace(/[<>]/g,"").slice(0,max):"";
        const safeNum=(v)=>{ var n=parseFloat(v); return isFinite(n)?n:0; };
        const safeInt=(v)=>{ var n=parseInt(v,10); return isFinite(n)?n:0; };
        const safeBool=(v)=>!!v;
        const sanitizeSet=(s)=>({
          id:safeStr(s.id)||uid(),
          reps:safeInt(s.reps),
          weight:safeNum(s.weight),
          done:safeBool(s.done),
          label:["Warm-up","Working","Drop set"].includes(s.label)?s.label:"Working",
          bodyweight:safeBool(s.bodyweight),
        });
        const sanitizeEx=(ex)=>({
          id:safeStr(ex.id)||uid(),
          name:safeStr(ex.name,100),
          muscle:MG.includes(ex.muscle)?ex.muscle:"",
          sets:Array.isArray(ex.sets)?ex.sets.map(sanitizeSet):[],
          bodyweight:safeBool(ex.bodyweight),
          barType:["barbell","ez","dumbbell","none"].includes(ex.barType)?ex.barType:"barbell",
          bwExtra:safeStr(ex.bwExtra,10),
          isSuperset:safeBool(ex.isSuperset),
        });
        const sanitizeWorkout=(w)=>({
          id:safeStr(w.id)||uid(),
          date:typeof w.date==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(w.date)?w.date:today(),
          name:safeStr(w.name,200),
          exercises:Array.isArray(w.exercises)?w.exercises.map(sanitizeEx):[],
          notes:safeStr(w.notes,1000),
          rating:safeInt(w.rating),
          duration:safeInt(w.duration),
        });

        const raw=JSON.parse(ev.target.result);
        const workouts=raw.workouts||raw;
        if(!Array.isArray(workouts)){appConfirm("❌ Invalid backup file — no workout array found.").then(()=>{});return;}
        const valid=workouts.filter(w=>w&&typeof w==="object"&&w.id&&w.date&&Array.isArray(w.exercises));
        const bad=workouts.length-valid.length;

        // Sanitize non-workout data if present
        const importedRoutines=Array.isArray(raw.customRoutines)?raw.customRoutines.filter(r=>r&&typeof r==="object"&&r.id&&r.name):null;
        const importedBw=Array.isArray(raw.bwLog)?raw.bwLog.filter(x=>x&&x.date&&typeof x.kg==="number").map(x=>({date:x.date,kg:safeNum(x.kg)})):null;
        const importedEx=raw.customExercises&&typeof raw.customExercises==="object"&&!Array.isArray(raw.customExercises)?raw.customExercises:null;

        const doImport=(toImport)=>{
          const sanitized=toImport.map(sanitizeWorkout);
          const doReplace=()=>{
            setHist(sanitized);
            if(importedRoutines)setCustomRoutines(importedRoutines);
            if(importedBw)setBwLog(importedBw);
            if(importedEx)setCustomExercises(importedEx);
          };
          if(hist.length===0){
            doReplace();
            appConfirm("✅ Restored "+sanitized.length+" workouts"+(importedRoutines?" + routines":"")+(importedBw?" + body weight":"")+"!").then(()=>{});
            return;
          }
          appConfirm(
            "You have "+hist.length+" workout"+(hist.length!==1?"s":"")+" on this device.\n\n"+
            "OK = Merge (keep all, add "+sanitized.length+" from backup)\n"+
            "Cancel = Replace (overwrite with backup only)"
          ).then(choice=>{
            if(choice){
              const existingIds=new Set(hist.map(w=>w.id));
              const newOnly=sanitized.filter(w=>!existingIds.has(w.id));
              const merged=[...hist,...newOnly].sort((a,b)=>a.date.localeCompare(b.date));
              setHist(merged);
              appConfirm("✅ Merged: "+merged.length+" workouts ("+newOnly.length+" added from backup).").then(()=>{});
            }else{
              doReplace();
              appConfirm("✅ Replaced with "+sanitized.length+" workouts from backup.").then(()=>{});
            }
          });
        };
        if(bad>0){
          appConfirm(bad+" invalid entries found. Import the "+valid.length+" valid ones?").then(ok=>{if(ok)doImport(valid);});
        }else{
          doImport(valid);
        }
      }catch(err){appConfirm("❌ Invalid backup file — could not parse.").then(()=>{});}
    };
    reader.readAsText(file);
    e.target.value="";
  };
  // ── Backup due state — iOS blocks silent downloads, must be user-triggered ──
  const [backupDue,setBackupDue]=useState(false);
  const [updateAvail,setUpdateAvail]=useState(false);
  useEffect(()=>{
    // Check flag immediately — covers case where SW update event fired before React mounted
    if(window._swUpdatePending){setUpdateAvail(true);}
    var handler=function(){setUpdateAvail(true);};
    window.addEventListener('swUpdate',handler);
    return()=>window.removeEventListener('swUpdate',handler);
  },[]);
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
    // Build CSV rows: Date, Workout, Exercise, Set#, Weight(kg), Weight(display), Reps, 1RM, Volume, Notes
    var rows=[["Date","Workout Name","Exercise","Muscle","Set","Weight (kg)","Weight ("+unit+")","Reps","Est 1RM ("+unit+")","Volume (kg)","Workout Notes","Rating"]];
    hist.forEach(w=>{
      (w.exercises||[]).forEach(ex=>{
        (ex.sets||[]).forEach((s,si)=>{
          var wKg=parseFloat(s.weight)||0;
          var wDisp=unit==="lb"?Math.round(wKg*2.2046*4/4):wKg;
          var r=parseInt(s.reps)||0;
          var cappedR=Math.min(r,15);
          var rm=r===1?wKg:(r>0&&wKg>0?Math.round(wKg*(1+cappedR/30)):0);
          var rmDisp=unit==="lb"?Math.round(rm*2.2046*4)/4:rm;
          rows.push([
            w.date,
            (w.name||"").replace(/,/g,""),
            (ex.name||"").replace(/,/g,""),
            ex.muscle||"",
            si+1,
            wKg,
            wDisp,
            r,
            rmDisp||"",
            wKg*r,
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
    const snap={version:3,date:ts,workouts:hist,customRoutines,bwLog,customExercises,createdAt:new Date().toISOString()};
    idbSet("il_snapshot_"+ts,snap);
    idbSet("il_last_snapshot",ts);
    setLastSnapshot(ts);setSnapshotDue(false);
    // Prune snapshots older than 7 days — batched in a single microtask
    setTimeout(()=>{for(let i=7;i<30;i++){const d=new Date();d.setDate(d.getDate()-i);idbSet("il_snapshot_"+d.toISOString().slice(0,10),null);}},2000);
  };
  // Still keep manual file export for real off-device backup
  const doAutoBackup=()=>{
    const ts=today();
    saveBackupFile(hist,ts,true);
    idbSet("il_last_backup",ts);
    setBackupDue(false);
    doSnapshot(); // also do a silent IDB snapshot
  };

  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100svh",background:c.bg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",position:"relative",overflowX:"hidden",color:c.text,transition:"background .3s"}}>
      {!onboarded&&<OnboardingScreen onDone={()=>{lsSet("il_onboarded",true);setOnboarded(true);setTimeout(startTour,600);}}/>}
      {!splashDone&&onboarded&&<div onAnimationEnd={()=>setSplashDone(true)} style={{position:"fixed",inset:0,background:c.bg,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,animation:loaded?"fadeOut .35s ease forwards":"none",pointerEvents:"none"}}>
        <div style={{fontSize:48}}>🏋️</div>
        <div style={{fontSize:18,fontWeight:900,color:c.text,letterSpacing:"-0.02em"}}>IronLog</div>
      </div>}
      {appConfirmEl}
      {milestone&&<div onClick={()=>setMilestone(null)} style={{position:"fixed",inset:0,zIndex:900,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{background:"linear-gradient(135deg,#1a1a2e,#0f3460)",border:"2px solid #7C6EFA88",borderRadius:28,padding:"36px 28px",textAlign:"center",maxWidth:300,animation:"pop .35s cubic-bezier(.34,1.56,.64,1)"}}>
          <div style={{fontSize:56,marginBottom:10}}>{milestone>=100?"🏆":milestone>=25?"🎖️":"🎉"}</div>
          <div style={{fontSize:26,fontWeight:900,color:"#fff",letterSpacing:"-0.02em",marginBottom:6}}>{milestone} Workout{milestone===1?"":"s"}!</div>
          <div style={{fontSize:14,color:"#b0a0ff",marginBottom:20}}>{milestone===1?"Your first workout is logged. The journey begins!":milestone>=100?"You're a legend. "+milestone+" workouts and counting!":"Keep going — you're on fire! 🔥"}</div>
          <button onClick={()=>setMilestone(null)} style={{background:"#7C6EFA",border:"none",borderRadius:13,padding:"11px 28px",fontSize:15,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit"}}>Let's go! 💪</button>
        </div>
      </div>}

      {/* ── Fixed top bar — always visible, always same position ── */}
      <div className="il-topbar" style={{background:c.bg,borderBottom:"1px solid "+c.border,display:"flex",alignItems:"center",justifyContent:"space-between",paddingLeft:16,paddingRight:16,paddingBottom:10}}>
        {/* Left: page title or workout name input */}
        <div style={{flex:1,minWidth:0,marginRight:10}}>
          {tab==="log"
            ? <input value={logName} onChange={e=>setLogName(e.target.value)} placeholder="Workout name…" style={{background:"none",border:"none",fontSize:16,fontWeight:900,color:c.text,outline:"none",fontFamily:"inherit",letterSpacing:"-0.02em",width:"100%"}}/>
            : <span style={{fontSize:16,fontWeight:900,color:c.text,letterSpacing:"-0.02em"}}>🏋️ IronLog</span>
          }
        </div>
        {/* Right: ALWAYS unit toggle + dark toggle (+ Finish on log tab) — identical position every screen */}
        <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0}}>
          <button onClick={()=>setUnit(u=>u==="kg"?"lb":"kg")} style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,width:42,height:32,cursor:"pointer",color:c.accent,fontSize:12,fontWeight:800,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>{unit}</button>
          <button onClick={()=>setDark(d=>d===true?"oled":d==="oled"?"auto":d==="auto"?false:true)} title={dark==="auto"?"Theme: Auto":dark==="oled"?"Theme: OLED Black":dark?"Theme: Dark":"Theme: Light"} style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,width:32,height:32,cursor:"pointer",color:c.sub,display:"flex",alignItems:"center",justifyContent:"center",fontSize:(dark==="auto"||dark==="oled")?11:undefined,fontWeight:700}}>{dark==="auto"?"A":dark==="oled"?"●":effectiveDark?<ISun/>:<IMoon/>}</button>
          {tab==="log"&&<button onClick={()=>{haptic("heavy");logFinishRef.current&&logFinishRef.current();}} style={{border:"none",borderRadius:10,height:32,padding:"0 14px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,background:c.accent,color:"#fff",whiteSpace:"nowrap"}}><ICheck/>Finish</button>}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="il-scroll" style={{overflowX:"hidden"}}>
        {/* Daily backup banner — shown when backup is due (iOS requires user tap to download) */}
        {updateAvail&&<div style={{margin:"12px 16px 0",background:"linear-gradient(135deg,#7C6EFA22,#a78bfa11)",border:"1px solid #7C6EFA55",borderRadius:14,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:"#b0a0ff"}}>🆕 Update available</div>
            <div style={{fontSize:11,color:c.sub,marginTop:1}}>New version of IronLog is ready. Your data is safe.</div>
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <button onClick={doUpdate} style={{background:c.accent,border:"none",borderRadius:10,padding:"7px 13px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit"}}>Update now</button>
            <button onClick={()=>setUpdateAvail(false)} style={{background:"none",border:"none",padding:"4px 6px",cursor:"pointer",color:c.sub,fontSize:16,lineHeight:1}}>×</button>
          </div>
        </div>}
        {backupDue&&hist.length>0&&<div style={{margin:"12px 16px 0",background:c.gs,border:"1px solid "+c.g+"55",borderRadius:14,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:c.g}}>💾 Daily backup ready</div>
            <div style={{fontSize:11,color:c.sub,marginTop:1}}>Tap to save today's backup to Files</div>
          </div>
          <button onClick={doAutoBackup} style={{background:c.g,border:"none",borderRadius:10,padding:"7px 13px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",flexShrink:0}}>Save now</button>
          <button onClick={()=>setBackupDue(false)} style={{background:"none",border:"none",padding:"4px 6px",cursor:"pointer",color:c.sub,fontSize:16,lineHeight:1}}>×</button>
        </div>}
        {/* Resume in-progress workout banner — shown on all tabs except log */}
        {hasDraft&&tab!=="log"&&<div onClick={()=>setTab("log")} style={{margin:"12px 16px 0",background:c.accent+"22",border:"1px solid "+c.accent+"55",borderRadius:14,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontSize:13,fontWeight:700,color:c.at}}>💪 Workout in progress</div><div style={{fontSize:11,color:c.sub,marginTop:2}}>{logName||"Unnamed workout"} · {draftExs.length} exercise{draftExs.length!==1?"s":""} · tap to resume</div></div>
          <div style={{fontSize:11,fontWeight:700,color:c.accent,background:c.card,borderRadius:9,padding:"5px 10px",flexShrink:0,marginLeft:8}}>Resume →</div>
        </div>}
        <div key={tab} className={tabDirRef.current==="r"?"il-enter-r":"il-enter-l"}>
          {!loaded&&<SkeletonPage/>}
          {loaded&&tab==="home"&&<HomePageM hist={hist} dark={dark} c={c} unit={unit} onBlank={blank} onRoutine={()=>setTab("routines")} onBackup={doBackup} onImport={importBackup} onImportData={importBackup} bwLog={bwLog} onLogBW={logBW} gymPlates={gymPlates} onSetGymPlates={setGymPlates} lastSnapshot={lastSnapshot} customRoutines={customRoutines} customExercises={customExercises} reminderDays={reminderDays} onSetReminderDays={setReminderDays}/>}
          {loaded&&tab==="log"&&<LogPageM
            initial={logInit} c={c} unit={unit} logName={logName} finishRef={logFinishRef} onSave={saveW}
            draftExs={draftExs} setDraftExs={setDraftExs}
            draftRating={draftRating} setDraftRating={setDraftRating}
            draftNotes={draftNotes} setDraftNotes={setDraftNotes}
            draftT0={draftT0}
            onDiscard={clearDraft}
            timerSecs={timerSecs} timerStart={timerStart} lastTimerSecs={lastTimerSecs}
            startTimer={startTimer} cycleTimer={cycleTimer} stopTimer={stopTimer}
            customExercises={customExercises} onAddCustomEx={addCustomExercise} onDeleteCustomEx={deleteCustomExercise} onRenameCustomEx={renameCustomExercise}
            hist={hist} gymPlates={gymPlates} bwLog={bwLog}
            restPresets={restPresets} onSaveRestPreset={saveRestPreset}
          />}
          {loaded&&tab==="history"&&<HistoryPageM hist={hist} c={c} unit={unit} onDelete={delW} onExportCSV={exportCSV} onRepeat={repeatW} bwKg={bwLog.length?bwLog[bwLog.length-1].kg:0}/>}
          {loaded&&tab==="progress"&&<ProgressPageM hist={hist} c={c} unit={unit} bwLog={bwLog} onLogBW={logBW} onDeleteBW={deleteBW} customExercises={customExercises} measLog={measLog} onLogMeas={logMeas} onDeleteMeas={deleteMeas} bwKg={bwLog.length?bwLog[bwLog.length-1].kg:0}/>}
          {loaded&&tab==="prs"&&<PRsPageM hist={hist} c={c} unit={unit} bwKg={bwLog.length?bwLog[bwLog.length-1].kg:0}/>}
          {loaded&&tab==="routines"&&<RoutinesPageM c={c} unit={unit} onUse={useTmpl} customRoutines={customRoutines} onSaveCustom={saveCustomRoutine} onDeleteCustom={deleteCustomRoutine} customExercises={customExercises} onAddCustomEx={addCustomExercise} onDeleteCustomEx={deleteCustomExercise} onRenameCustomEx={renameCustomExercise}/>}
          {loaded&&tab==="help"&&<HelpPageM c={c} onStartTour={startTour}/>}
        </div>
      </div>

      {tourStep!==null&&<TourOverlay c={c} step={tourStep} onNext={tourNext} onPrev={tourPrev} onSkip={()=>setTourStep(null)}/>}

      {/* ── Bottom nav ── */}
      <div className="il-nav" style={{background:c.nav,backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderTop:"1px solid "+c.border,display:"flex"}}>
        {TABS.map(({id,label,Icon})=>{const active=tab===id;return(<button key={id} onClick={()=>setTab(id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:active?c.accent:c.sub,fontFamily:"inherit",transition:"color .15s",padding:"4px 0"}}><div style={{transform:active?"scale(1.15)":"scale(1)",transition:"transform .2s"}}><Icon/></div><span style={{fontSize:9,fontWeight:active?800:500,letterSpacing:"0.05em"}}>{label.toUpperCase()}</span>{active&&<div style={{width:4,height:4,borderRadius:"50%",background:c.accent}}/>}</button>);})}
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(p){super(p);this.state={err:null};}
  static getDerivedStateFromError(e){return{err:e};}
  render(){
    if(this.state.err){
      const msg=this.state.err.message||String(this.state.err);
      const stk=(this.state.err.stack||"").split("\n").slice(0,6).join("\n");
      const c=window._ilDark===false?L:D;
      return <div style={{padding:24,background:D.bg,minHeight:"100svh",fontFamily:"-apple-system,sans-serif"}}>
        <div style={{fontSize:32,marginBottom:12}}>💥</div>
        <div style={{fontSize:18,fontWeight:800,color:"#f87171",marginBottom:12}}>Runtime Error</div>
        <div style={{background:"#1a1a28",borderRadius:12,padding:16,fontSize:13,color:"#f87171",fontFamily:"monospace",whiteSpace:"pre-wrap",wordBreak:"break-all",lineHeight:1.5,marginBottom:12}}>{msg}</div>
        <div style={{background:"#1a1a28",borderRadius:12,padding:16,fontSize:11,color:"#8888aa",fontFamily:"monospace",whiteSpace:"pre-wrap",wordBreak:"break-all",lineHeight:1.5}}>{stk}</div>
        <button onClick={()=>this.setState({err:null})} style={{marginTop:16,background:"#7C6EFA",color:"#fff",border:"none",borderRadius:12,padding:"10px 20px",fontSize:14,fontWeight:700,cursor:"pointer"}}>Retry</button>
      </div>;
    }
    return this.props.children;
  }
}

export default App;
