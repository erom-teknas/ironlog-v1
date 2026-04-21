import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MG, EX, BAR_TYPES, PLATES_LB, PLATES_KG, PCOL_LB, PCOL } from '../constants';
import { uid, today, fmtD, calcVol, bestRM, kgToLb, fmtW, storeW, calcPlates, fmtVol, haptic } from '../utils';
import { useConfirm } from '../hooks.jsx';
import { IPlus, ITrash, ICheck, IX, IChev } from '../icons';
import { NIn, Pill, Tip } from '../components/Primitives';
import DragSortList from '../components/DragSortList';
import SwipeToDelete from '../components/SwipeToDelete';
import RestTimerCircle from '../components/RestTimerCircle';
import ExHistoryCard from '../components/ExHistoryCard';
import PlateCalc from '../components/PlateCalc';

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
  draftT0,onDiscard,timerSecs,timerStart,lastTimerSecs=60,startTimer,cycleTimer,stopTimer,
  customExercises={},onAddCustomEx,onDeleteCustomEx,onRenameCustomEx,hist=[],gymPlates=[],bwLog=[],
  restPresets={},onSaveRestPreset,
  collapsedExs,setCollapsedExs}){
  // ALL hooks at top — no hooks after conditional returns (React rule)
  const exs=draftExs, setExs=setDraftExs;
  const rating=draftRating, setRating=setDraftRating;
  const notes=draftNotes, setNotes=setDraftNotes;
  const {confirm:dlgConfirm,confirmEl}=useConfirm(c);
  const [platePickerFor,setPlatePickerFor]=useState(null);
  const seeded=useRef(false);
  useEffect(()=>{seeded.current=false;},[init]);
  useEffect(()=>{
    if(!seeded.current&&init&&exs.length===0){
      setExs(init.exercises.map(e=>({...e,id:uid(),sets:e.sets.map(s=>({...s,id:uid(),done:false}))})));
      seeded.current=true;
    }
  },[init,exs.length]);
  const [elapsedSec,setElapsedSec]=useState(()=>Math.floor((Date.now()-draftT0.current)/1000));
  useEffect(()=>{
    let t=null;
    function start(){t=setInterval(()=>setElapsedSec(Math.floor((Date.now()-draftT0.current)/1000)),1000);}
    function stop(){clearInterval(t);t=null;}
    function onVis(){document.visibilityState==="visible"?start():stop();}
    document.addEventListener("visibilitychange",onVis);
    start();
    return()=>{stop();document.removeEventListener("visibilitychange",onVis);};
  },[]);
  const el=String(Math.floor(elapsedSec/60)).padStart(2,"0")+":"+String(elapsedSec%60).padStart(2,"0");

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
  const [exAdvanced,setExAdvanced]=useState(new Set()); // ⋯ expanded per exercise
  const [picker,setPicker]=useState(false);
  const [pm,setPm]=useState(MG[0]);
  const [search,setSearch]=useState("");
  const [newExName,setNewExName]=useState("");
  const [editingEx,setEditingEx]=useState(null);
  const [editExVal,setEditExVal]=useState("");
  const [saved,setSaved]=useState(false);
  const [focusedExId,setFocusedExId]=useState(null);
  const [exNotes,setExNotes]=useState({}); // {exId: string} — per-exercise cues
  const [notifGranted,setNotifGranted]=useState(typeof Notification!=='undefined'&&Notification.permission==='granted');

  // ── Feature 1: last session lookup ────────────────────────────────────────
  const lastSessionSets=useCallback((name)=>{
    for(var i=hist.length-1;i>=0;i--){
      var ex=hist[i].exercises.find(e=>e.name===name);
      if(ex&&ex.sets&&ex.sets.length)return ex.sets;
    }
    return null;
  },[hist]);

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

  const inferBarType=(name)=>{
    var n=(name||"").toLowerCase();
    if(n.includes("pull-up")||n.includes("pullup")||n.includes("chin")||n.includes("push-up")||n.includes("pushup")||n.includes("plank")||n.includes("dip"))return"none";
    if(n.includes("smith"))return"smith";
    if(n.includes("ez")||n.includes("skull"))return"ez";
    if(n.includes("dumbbell")||n.includes("db ")||n.includes(" db")||n.includes("cable")||n.includes("machine")||n.includes("lateral raise")||n.includes("fly")||(n.includes("curl")&&!n.includes("barbell")&&!n.includes("ez")))return"dumbbell";
    return"barbell";
  };
  const addEx=(name)=>{
    var last=lastSessionSets(name);
    var defaultBar=inferBarType(name);
    var sets=last
      ? last.map(s=>({id:uid(),reps:s.reps,weight:s.weight,done:false,bodyweight:s.bodyweight||false}))
      : [{id:uid(),reps:"",weight:"",done:false,bodyweight:false,label:"Working"}];
    setExs(p=>[...p,{id:uid(),name,muscle:pm,sets,bodyweight:false,barType:last?last[0].barType||defaultBar:defaultBar}]);
    haptic("medium");
    setPicker(false);setSearch("");
  };
  const submitNewEx=()=>{
    var n=newExName.trim();if(!n)return;
    if((customExercises[pm]||[]).includes(n)||(EX[pm]||[]).includes(n)){
      dlgConfirm('"'+n+'" already exists in '+pm+'. Choose a different name.').then(()=>{});return;
    }
    onAddCustomEx(pm,n);setNewExName("");
  };
  const [autoRest,setAutoRest]=useState(true); // auto-start rest timer on set completion
  const upd=useCallback((eid,sid,f,v)=>setExs(p=>p.map(e=>e.id!==eid?e:{...e,sets:e.sets.map(s=>s.id!==sid?s:{...s,[f]:v})})),[]);
  const tog=useCallback((eid,sid)=>{
    setExs(p=>{
      const next=p.map(e=>e.id!==eid?e:{...e,sets:e.sets.map(s=>s.id!==sid?s:{...s,done:!s.done})});
      const prevEx=p.find(e=>e.id===eid);
      const prevSet=prevEx&&prevEx.sets.find(s=>s.id===sid);
      const justCompleted=prevSet&&!prevSet.done;
      if(justCompleted){haptic("medium");}
      if(justCompleted&&autoRest){
        const exName=prevEx?prevEx.name:"";
        const preset=restPresets[exName]||lastTimerSecs;
        startTimer(preset);
        if(notifGranted)swNotif(preset,'Rest done — '+preset+'s. Next set!');
      }
      // Auto-collapse exercise when all its sets are done
      if(justCompleted){
        const updEx=next.find(e=>e.id===eid);
        if(updEx&&updEx.sets.length>0&&updEx.sets.every(s=>s.done)){
          setCollapsedExs(prev=>{const s=new Set(prev);s.add(eid);return s;});
        }
      }
      return next;
    });
  },[autoRest,timerSecs,lastTimerSecs,startTimer,notifGranted,setCollapsedExs]);
  // addS copies last set's weight+reps (set copy feature)
  const addS=eid=>setExs(p=>p.map(e=>{
    if(e.id!==eid)return e;
    const l=e.sets[e.sets.length-1];
    return{...e,sets:[...e.sets,{id:uid(),reps:l?l.reps:"",weight:l?l.weight:"",done:false,bodyweight:l?!!l.bodyweight:false,label:"Working"}]};
  }));
  const remS=(eid,sid)=>setExs(p=>p.map(e=>e.id!==eid?e:{...e,sets:e.sets.filter(s=>s.id!==sid)}));
  const remE=eid=>setExs(p=>p.filter(e=>e.id!==eid));
  // Feature 4: bodyweight toggle per exercise
  const toggleBW=(eid)=>setExs(p=>p.map(e=>e.id!==eid?e:{...e,bodyweight:!e.bodyweight,sets:e.sets.map(s=>({...s,bodyweight:!e.bodyweight,weight:!e.bodyweight?"BW":""}))}));
  const finish=()=>{if(!exs.length)return;onSave({id:uid(),name:(logName||"").trim()||"Workout "+fmtD(today()),date:today(),exercises:exs,rating,notes,duration:elapsedSec});setSaved(true);};
  useEffect(()=>{if(finishRef)finishRef.current=finish;},[exs,rating,notes,logName,saved]);
  const tv=exs.reduce((s,e)=>s+calcVol(e.sets.filter(x=>!x.bodyweight)),0);
  const doneCount=exs.reduce((s,e)=>s+e.sets.filter(x=>x.done).length,0);
  const total=exs.reduce((s,e)=>s+e.sets.length,0);

  // Feature 2: search filter
  const searchLower=search.toLowerCase().trim();
  const filteredCustom=(customExercises[pm]||[]).filter(n=>!searchLower||n.toLowerCase().includes(searchLower));
  const filteredBuiltin=(EX[pm]||[]).filter(n=>!searchLower||n.toLowerCase().includes(searchLower));
  // When searching, also search across all muscle groups
  const searchResults=searchLower?MG.flatMap(m=>[...(customExercises[m]||[]),...(EX[m]||[])].filter(n=>n.toLowerCase().includes(searchLower)).map(n=>({name:n,muscle:m}))):[];

  return(
    <div style={{paddingBottom:120}}>
      {confirmEl}
      {/* ── Sticky workout header ── */}
      <div style={{background:c.bg,padding:"8px 16px 10px",borderBottom:"1px solid "+c.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontSize:11,color:c.sub,display:"flex",alignItems:"center",gap:5,fontVariantNumeric:"tabular-nums"}}>
            <span style={{fontWeight:700,color:c.text,fontFamily:"monospace"}}>{el}</span>
            <span>·</span>
            <span>{doneCount}/{total} sets</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <RestTimerCircle c={c} timerSecs={timerSecs} timerStart={timerStart} onCycle={cycleTimer} onDone={stopTimer}/>
            <button onClick={()=>setAutoRest(a=>!a)} title={autoRest?"Auto-rest ON":"Auto-rest OFF"}
              style={{background:autoRest?c.accent+"22":c.card2,border:"1px solid "+(autoRest?c.accent:c.border),borderRadius:8,padding:"3px 7px",fontSize:9,fontWeight:700,cursor:"pointer",color:autoRest?c.accent:c.sub,fontFamily:"inherit",flexShrink:0,lineHeight:1.3}}>
              AUTO
            </button>
            {!notifGranted&&'Notification' in window&&<button onClick={()=>requestNotifPermission().then(p=>{if(p==='granted')setNotifGranted(true);})}
              style={{background:c.card2,border:"1px solid "+c.border,borderRadius:8,padding:"3px 7px",fontSize:9,fontWeight:700,cursor:"pointer",color:c.sub,fontFamily:"inherit",flexShrink:0,lineHeight:1.3}} title="Enable notifications">🔔</button>}
            <span style={{fontSize:11,color:c.sub,fontWeight:600}}>{fmtVol(unit==="lb"?Math.round(kgToLb(tv)):tv)} {unit}</span>
            {exs.length>0&&!saved&&<button onClick={()=>dlgConfirm("Discard this workout?\nAll sets will be lost.").then(ok=>{if(ok)onDiscard();})}
              style={{background:c.rs,border:"none",borderRadius:8,padding:"3px 9px",fontSize:11,fontWeight:700,cursor:"pointer",color:c.r,fontFamily:"inherit"}}>Discard</button>}
          </div>
        </div>
        <div style={{height:3,background:c.muted,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",background:c.accent,borderRadius:99,width:total?(doneCount/total*100)+"%":"0%",transition:"width .4s"}}/>
        </div>
      </div>

      <div style={{padding:"14px 16px 0"}}>
        {/* ── Workout meta chips ── */}
        <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"5px 12px",fontSize:12,color:c.sub,fontWeight:600}}>{fmtD(today())}</div>
          <div style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"5px 12px",fontSize:12,color:c.sub,fontWeight:600}}>{exs.length} exercise{exs.length!==1?"s":""}</div>
          <div style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"5px 12px",fontSize:12,color:c.sub,fontWeight:600}}>{fmtVol(unit==="lb"?Math.round(kgToLb(tv)):tv)} {unit}</div>
        </div>

        <DragSortList items={exs} onReorder={setExs} keyFn={ex=>ex.id} c={c} renderItem={(ex,_idx,dragHandle)=>{
          const latestBwKg=bwLog.length?(bwLog[bwLog.length-1].kg):0;
          const rm=bestRM(ex.sets,latestBwKg);
          const badge=overloadBadge(ex);
          const isBW=!!ex.bodyweight;
          const PCOL_USE=unit==="lb"?PCOL_LB:PCOL;
          const resolvedBarId=ex.barType||inferBarType(ex.name);
          const exBarType=BAR_TYPES.find(b=>b.id===resolvedBarId)||BAR_TYPES[0];
          const barKgForEx=exBarType.kg;
          const barDispForEx=unit==="lb"?exBarType.lbEquiv:barKgForEx;
          // Exercise state for visual differentiation
          const doneSets=ex.sets.filter(s=>s.done).length;
          const totalSets=ex.sets.length;
          const exDone=totalSets>0&&doneSets===totalSets;
          const exInProgress=doneSets>0&&!exDone;
          const isCollapsed=collapsedExs.has(ex.id);
          const showAdvanced=exAdvanced.has(ex.id); // ⋯ expanded

          // ── Collapsed view for completed exercises ───────────────────────
          if(isCollapsed){return(<>
            <div onClick={()=>setCollapsedExs(prev=>{const s=new Set(prev);s.delete(ex.id);return s;})}
              style={{background:c.gs,border:"1.5px solid "+c.g,borderRadius:20,padding:"12px 15px",marginBottom:13,display:"flex",alignItems:"center",gap:10,cursor:"pointer",opacity:0.85}}>
              <span style={{fontSize:16,flexShrink:0}}>✅</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:14,color:c.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.name}</div>
                <div style={{fontSize:11,color:c.g,fontWeight:700}}>{doneSets}/{totalSets} sets done</div>
              </div>
              <span style={{fontSize:11,color:c.sub,flexShrink:0}}>tap to expand</span>
            </div>
            {ex.isSuperset&&exs[_idx+1]&&<div style={{display:"flex",alignItems:"center",gap:8,margin:"-6px 16px 4px",position:"relative",zIndex:1}}>
              <div style={{flex:1,height:2,background:"linear-gradient(to right,transparent,"+c.am+"88)"}}/>
              <div style={{background:c.ams,border:"1px solid "+c.am+"55",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:800,color:c.am,flexShrink:0}}>⚡ SUPERSET</div>
              <div style={{flex:1,height:2,background:"linear-gradient(to left,transparent,"+c.am+"88)"}}/>
            </div>}
          </>);}

          const cardBorder=exDone?"1.5px solid "+c.g:exInProgress?"1.5px solid "+c.accent+"88":"1px solid "+c.border;
          const cardBg=exDone?c.gs:c.card;
          return(<>
            <div style={{background:cardBg,border:cardBorder,borderRadius:20,padding:15,marginBottom:13}}>
              {/* ── Exercise header ── */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                {dragHandle}
                <div style={{flex:1,minWidth:0,paddingRight:8}}>
                  <button onClick={()=>setFocusedExId(ex.id)} style={{background:"none",border:"none",padding:0,cursor:"pointer",textAlign:"left",width:"100%",fontFamily:"inherit"}}>
                    <div style={{fontWeight:800,fontSize:15,color:c.text,wordBreak:"break-word",display:"flex",alignItems:"center",gap:6}}>
                      {ex.name}
                      <span style={{fontSize:13,color:c.accent,flexShrink:0}} title="Focus mode">⤢</span>
                    </div>
                  </button>
                  <div style={{display:"flex",gap:7,marginTop:3,alignItems:"center",flexWrap:"wrap"}}>
                    <Pill label={ex.muscle} col={c.at} bg={c.as}/>
                    {!isBW&&rm>0&&<span style={{fontSize:11,color:c.sub}}>~1RM: <strong style={{color:c.text}}>{unit==="lb"?kgToLb(rm):rm}{unit}</strong></span>}
                    {badge&&<span style={{fontSize:11,fontWeight:700,color:badge.col}}>{badge.icon} {badge.text}</span>}
                    {ex.progressionApplied&&<span style={{fontSize:10,fontWeight:700,color:c.g,background:c.gs,borderRadius:8,padding:"2px 7px"}}>📈 +{ex.progressionApplied}{unit}</span>}
                    {ex.deloadApplied&&<span style={{fontSize:10,fontWeight:700,color:c.am,background:c.ams,borderRadius:8,padding:"2px 7px"}}>🔄 Deload -10%</span>}
                  </div>
                </div>
                <button onClick={()=>dlgConfirm("Remove "+ex.name+"?").then(ok=>{if(ok)remE(ex.id);})}
                  style={{background:c.rs,border:"none",borderRadius:10,padding:"10px 12px",cursor:"pointer",color:c.r,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,minWidth:44,minHeight:44}}>
                  <ITrash/>
                </button>
              </div>

              {/* Exercise history (last 3 sessions) */}
              <ExHistoryCard name={ex.name} hist={hist} unit={unit} c={c}/>

              {/* ── Per-exercise notes (only when ⋯ expanded) ── */}
              {showAdvanced&&(exNotes[ex.id]!==undefined)&&<div style={{marginBottom:8}}>
                <textarea value={exNotes[ex.id]||""} onChange={e2=>setExNotes(p=>({...p,[ex.id]:e2.target.value}))}
                  placeholder="Form cues, notes for this exercise…" rows={2}
                  style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:10,padding:"7px 10px",fontSize:12,color:c.text,fontFamily:"inherit",resize:"none",outline:"none",boxSizing:"border-box"}}/>
              </div>}

              {/* ── Controls row: essential controls always visible ── */}
              <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center",flexWrap:"wrap"}}>
                {/* Bar type selector (hidden for BW exercises) */}
                {!isBW&&<select value={ex.barType||inferBarType(ex.name)} onChange={e=>setExs(p=>p.map(x=>x.id!==ex.id?x:{...x,barType:e.target.value}))}
                  style={{background:c.card2,border:"1px solid "+c.border,borderRadius:8,padding:"6px 8px",fontSize:11,color:c.sub,fontFamily:"inherit",cursor:"pointer",flex:1,minWidth:0}}>
                  {BAR_TYPES.map(b=><option key={b.id} value={b.id}>{b.label}{b.kg>0?" ("+(unit==="lb"?b.lbEquiv:b.kg)+unit+")":""}</option>)}
                </select>}
                {/* BW toggle */}
                <button onClick={()=>toggleBW(ex.id)}
                  style={{background:isBW?c.accent+"22":c.card2,border:"1px solid "+(isBW?c.accent:c.border),borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",color:isBW?c.accent:c.sub,fontFamily:"inherit",flexShrink:0,minHeight:36}}>
                  {isBW?"✓ BW":"BW"}
                </button>
                {/* Superset toggle */}
                <button onClick={()=>setExs(p=>p.map(x=>x.id!==ex.id?x:{...x,isSuperset:!x.isSuperset}))}
                  style={{background:ex.isSuperset?c.am+"22":c.card2,border:"1px solid "+(ex.isSuperset?c.am:c.border),borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:700,cursor:"pointer",color:ex.isSuperset?c.am:c.sub,fontFamily:"inherit",flexShrink:0,minHeight:36}}>
                  ⚡
                </button>
                {/* ⋯ More options toggle */}
                <button onClick={()=>setExAdvanced(p=>{const s=new Set(p);s.has(ex.id)?s.delete(ex.id):s.add(ex.id);return s;})}
                  style={{background:showAdvanced?c.accent+"22":c.card2,border:"1px solid "+(showAdvanced?c.accent:c.border),borderRadius:8,padding:"6px 10px",fontSize:13,fontWeight:700,cursor:"pointer",color:showAdvanced?c.accent:c.sub,fontFamily:"inherit",flexShrink:0,minHeight:36}}
                  title="More options">
                  ⋯
                </button>
              </div>

              {/* ── Expanded options (⋯) ── */}
              {showAdvanced&&<div style={{background:c.card2,borderRadius:12,padding:"10px 12px",marginBottom:8,display:"flex",flexDirection:"column",gap:8}}>
                {/* Notes */}
                <button onClick={()=>setExNotes(p=>({...p,[ex.id]:p[ex.id]!==undefined?undefined:""}))}
                  style={{background:exNotes[ex.id]!==undefined?c.accent+"22":c.card,border:"1px solid "+(exNotes[ex.id]!==undefined?c.accent:c.border),borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:700,cursor:"pointer",color:exNotes[ex.id]!==undefined?c.accent:c.sub,fontFamily:"inherit",textAlign:"left"}}>
                  {exNotes[ex.id]!==undefined?"✎ Notes on":"+ Notes"}
                </button>
                {/* Rest timer adjust */}
                {onSaveRestPreset&&<div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,color:c.sub,flex:1}}>Rest timer</span>
                  <div style={{display:"flex",alignItems:"center",gap:4,background:c.card,border:"1px solid "+c.border,borderRadius:8,padding:"2px 6px"}}>
                    <button onClick={()=>{const cur=restPresets[ex.name]||lastTimerSecs;onSaveRestPreset(ex.name,Math.max(15,cur-15));}} style={{background:"none",border:"none",cursor:"pointer",color:c.sub,fontSize:15,fontWeight:700,padding:"0 4px",lineHeight:1,fontFamily:"inherit",minHeight:28}}>−</button>
                    <span style={{fontSize:11,fontWeight:700,color:c.accent,minWidth:30,textAlign:"center"}}>{restPresets[ex.name]||lastTimerSecs}s</span>
                    <button onClick={()=>{const cur=restPresets[ex.name]||lastTimerSecs;onSaveRestPreset(ex.name,Math.min(600,cur+15));}} style={{background:"none",border:"none",cursor:"pointer",color:c.sub,fontSize:15,fontWeight:700,padding:"0 4px",lineHeight:1,fontFamily:"inherit",minHeight:28}}>+</button>
                  </div>
                </div>}
                {/* RPE/Tempo toggle */}
                <div style={{fontSize:11,color:c.sub}}>Tap the set number to cycle label: Working → Warm-up → Drop set</div>
              </div>}

              {ex.isSuperset&&<div style={{fontSize:11,color:c.am,background:c.ams,borderRadius:8,padding:"5px 10px",marginBottom:8}}>⚡ Superset — no rest between this and the next exercise</div>}

              {/* BW extra weight field */}
              {isBW&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9,background:c.card2,borderRadius:10,padding:"8px 12px",flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:c.sub,flexShrink:0}}>Base: <strong style={{color:c.text}}>{bwLog.length>0?(unit==="lb"?Math.round(kgToLb(bwLog[bwLog.length-1].kg)*10)/10:bwLog[bwLog.length-1].kg):"??"}{unit}</strong></span>
                <span style={{fontSize:12,color:c.sub,flexShrink:0}}>+ Extra:</span>
                <input type="number" inputMode="decimal" value={ex.bwExtra||""} placeholder="0" onChange={e=>setExs(p=>p.map(x=>x.id!==ex.id?x:{...x,bwExtra:e.target.value}))}
                  style={{background:c.card,border:"1.5px solid "+c.border,borderRadius:8,padding:"5px 8px",fontSize:13,color:c.text,outline:"none",width:64,textAlign:"center",fontFamily:"inherit"}}/>
                <span style={{fontSize:12,color:c.sub,flexShrink:0}}>{unit}</span>
                {bwLog.length>0&&(parseFloat(ex.bwExtra)||0)>0&&<span style={{fontSize:11,color:c.accent,fontWeight:700,flexShrink:0}}>= {unit==="lb"?Math.round((kgToLb(bwLog[bwLog.length-1].kg)+(parseFloat(ex.bwExtra)||0))*10)/10:Math.round(((bwLog[bwLog.length-1]?.kg||0)+(parseFloat(ex.bwExtra)||0))*10)/10}{unit}</span>}
              </div>}

              {/* ── Column headers ── */}
              <div style={{display:"grid",gridTemplateColumns:isBW?"36px 1fr 38px":"36px 1fr 1fr 38px",gap:5,marginBottom:7}}>
                {(isBW?["","Reps","✓"]:["",unit,"Reps","✓"]).map((h,i)=><div key={i} style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.06em",textAlign:"center"}}>{h}</div>)}
              </div>

              {/* ── Set rows ── */}
              {ex.sets.map((s,idx)=>{
                const wDisp=!isBW?(parseFloat(unit==="lb"?fmtW(s.weight,"lb"):s.weight)||0):0;
                const plates=(!isBW&&barKgForEx>0&&wDisp>(unit==="lb"?barDispForEx:barKgForEx))?calcPlates(wDisp,unit,unit==="lb"?barDispForEx:barKgForEx):[];
                const lbl=s.label||"Working";
                const lblCol=lbl==="Warm-up"?c.am:lbl==="Drop set"?c.r:c.sub;
                const lblBg=lbl==="Warm-up"?c.ams:lbl==="Drop set"?c.rs:"transparent";
                return(
                  <div key={s.id}>
                    <div style={{display:"grid",gridTemplateColumns:isBW?"36px 1fr 38px":"36px 1fr 1fr 38px",gap:5,marginBottom:plates.length?2:5,alignItems:"center",opacity:s.done?0.55:1,transition:"opacity .2s"}}>
                      {/* # cell — tap to cycle label when not done, tap to delete when done */}
                      <button
                        onClick={()=>s.done?remS(ex.id,s.id):upd(ex.id,s.id,"label",nextLabel(lbl))}
                        title={s.done?"Tap to remove this set":"Tap to change set type: "+lbl}
                        style={{background:s.done?c.rs:lblBg,border:"1px solid "+(s.done?c.r+"55":lbl!=="Working"?lblCol+"55":c.border+"55"),borderRadius:7,padding:"4px 2px",fontSize:s.done?12:10,fontWeight:700,color:s.done?c.r:lbl!=="Working"?lblCol:c.sub,cursor:"pointer",fontFamily:"inherit",textAlign:"center",lineHeight:1.2,minHeight:36,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {s.done?"×":(lbl==="Warm-up"?"W":lbl==="Drop set"?"D":(idx+1))}
                      </button>
                      {/* Weight cell */}
                      {!isBW&&<div style={{display:"flex",gap:3,alignItems:"center"}}>
                        <NIn value={s.weight&&parseFloat(s.weight)?fmtW(s.weight,unit):s.weight} onChange={v=>upd(ex.id,s.id,"weight",unit==="lb"&&v?String(storeW(v,"lb")):v)} c={c}/>
                        {/* + plate picker button — minimum 44px touch target */}
                        <button onClick={()=>setPlatePickerFor({eid:ex.id,sid:s.id,cur:parseFloat(unit==="lb"?fmtW(s.weight,unit):s.weight)||0,barType:ex.barType||inferBarType(ex.name)})}
                          style={{background:c.accent+"22",border:"1px solid "+c.accent+"55",borderRadius:8,padding:"0",cursor:"pointer",color:c.accent,fontSize:16,fontWeight:900,lineHeight:1,flexShrink:0,minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          +
                        </button>
                      </div>}
                      {/* Reps cell */}
                      <NIn value={s.reps} onChange={v=>upd(ex.id,s.id,"reps",v)} c={c}/>
                      {/* Done toggle — ALWAYS toggles, never deletes */}
                      <button onClick={()=>tog(ex.id,s.id)}
                        style={{background:s.done?c.gs:c.card2,border:"1.5px solid "+(s.done?c.g:c.border),borderRadius:9,padding:8,cursor:"pointer",color:s.done?c.g:c.sub,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",minWidth:38,minHeight:44}}>
                        {s.done?<ICheck/>:<IX/>}
                      </button>
                    </div>
                    {/* RPE/Tempo row (in expanded mode) */}
                    {showAdvanced&&<div style={{display:"flex",gap:6,paddingLeft:41,paddingBottom:4,alignItems:"center"}}>
                      <input type="number" inputMode="decimal" min="1" max="10" value={s.rpe||""} onChange={e=>upd(ex.id,s.id,"rpe",e.target.value)}
                        placeholder="RPE" style={{width:52,background:c.card2,border:"1px solid "+c.border,borderRadius:7,padding:"4px 6px",fontSize:11,color:c.text,outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
                      <input type="text" value={s.tempo||""} onChange={e=>upd(ex.id,s.id,"tempo",e.target.value)}
                        placeholder="Tempo" style={{width:66,background:c.card2,border:"1px solid "+c.border,borderRadius:7,padding:"4px 6px",fontSize:11,color:c.text,outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
                      {(s.rpe||s.tempo)&&<span style={{fontSize:9,color:c.sub}}>{s.rpe?"RPE "+s.rpe:""}{s.rpe&&s.tempo?" · ":""}{s.tempo?s.tempo:""}</span>}
                    </div>}
                    {/* Plate visualization */}
                    {plates.length>0&&!s.done&&<div style={{display:"flex",alignItems:"center",gap:3,paddingLeft:41,paddingBottom:6,flexWrap:"wrap"}}>
                      {plates.map((p,pi)=><span key={"L"+pi} style={{background:PCOL_USE[p]||"#555",color:"#fff",borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:800}}>{p}</span>)}
                      {barDispForEx>0&&<span style={{fontSize:10,color:c.sub,margin:"0 2px"}}>|{barDispForEx}{unit}|</span>}
                      {[...plates].reverse().map((p,pi)=><span key={"R"+pi} style={{background:PCOL_USE[p]||"#555",color:"#fff",borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:800}}>{p}</span>)}
                    </div>}
                  </div>
                );
              })}
              <button onClick={()=>addS(ex.id)} style={{width:"100%",marginTop:5,background:"none",border:"1.5px dashed "+c.border,borderRadius:11,padding:"9px",fontSize:12,color:c.sub,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>+ Add set</button>
            </div>
            {ex.isSuperset&&exs[_idx+1]&&<div style={{display:"flex",alignItems:"center",gap:8,margin:"-6px 16px 4px",position:"relative",zIndex:1}}>
              <div style={{flex:1,height:2,background:"linear-gradient(to right,transparent,"+c.am+"88)"}}/>
              <div style={{background:c.ams,border:"1px solid "+c.am+"55",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:800,color:c.am,flexShrink:0,display:"flex",alignItems:"center",gap:4}}>⚡ SUPERSET ↓ {exs[_idx+1].name}</div>
              <div style={{flex:1,height:2,background:"linear-gradient(to left,transparent,"+c.am+"88)"}}/>
            </div>}
          </>);
        }}/>

        <button onClick={()=>setPicker(true)} style={{width:"100%",background:"none",border:"2px dashed "+c.border,borderRadius:20,padding:17,fontSize:14,color:c.sub,cursor:"pointer",fontFamily:"inherit",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginBottom:16}}><IPlus/> Add Exercise</button>
        <PlateCalc c={c} unit={unit}/>
        {exs.length>0&&<div style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:16,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,color:c.text,marginBottom:10}}>How did it feel?</div>
          <div style={{display:"flex",gap:7,marginBottom:12}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setRating(n)} style={{flex:1,background:"none",border:"none",cursor:"pointer",fontSize:24,opacity:n<=rating?1:0.2,transition:"opacity .15s",fontFamily:"inherit"}}>⭐</button>)}</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes, PRs, how you felt…" rows={2} style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"9px 12px",fontSize:13,color:c.text,fontFamily:"inherit",resize:"none",outline:"none",boxSizing:"border-box"}}/>
        </div>}
      </div>

      {/* ── Focus Mode Modal ── */}
      {focusedExId&&(()=>{
        const ex=exs.find(e=>e.id===focusedExId);if(!ex)return null;
        const isBW=!!ex.bodyweight;
        const exBarType=BAR_TYPES.find(b=>b.id===(ex.barType||inferBarType(ex.name)))||BAR_TYPES[0];
        const barKgF=exBarType.kg,barDispF=unit==="lb"?exBarType.lbEquiv:barKgF;
        const PCOL_USE2=unit==="lb"?PCOL_LB:PCOL;
        return(
          <div style={{position:"fixed",inset:0,background:c.bg,zIndex:300,display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{width:"100%",maxWidth:430,height:"100%",display:"flex",flexDirection:"column",overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:"env(safe-area-inset-bottom,20px)"}}>
            <div style={{background:c.card,padding:"env(safe-area-inset-top,0px) 16px 14px",borderBottom:"1px solid "+c.border,position:"sticky",top:0,zIndex:1,display:"flex",alignItems:"center",gap:12,flexShrink:0,paddingTop:"calc(env(safe-area-inset-top,0px) + 14px)"}}>
              <button onClick={()=>setFocusedExId(null)} style={{background:c.card2,border:"none",borderRadius:10,padding:"10px 16px",fontSize:14,fontWeight:700,cursor:"pointer",color:c.text,fontFamily:"inherit",flexShrink:0,minHeight:44}}>← Back</button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:900,fontSize:17,color:c.text,letterSpacing:"-0.02em",lineHeight:1.2,wordBreak:"break-word"}}>{ex.name}</div>
                <Pill label={ex.muscle} col={c.at} bg={c.as}/>
              </div>
              <button onClick={()=>addS(ex.id)} style={{background:c.accent,border:"none",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",flexShrink:0,minHeight:44}}>+ Set</button>
            </div>
            <div style={{padding:"16px 16px 0",flex:1}}>
              {/* Controls */}
              <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
                {!isBW&&<select value={ex.barType||inferBarType(ex.name)} onChange={e=>setExs(p=>p.map(x=>x.id!==ex.id?x:{...x,barType:e.target.value}))}
                  style={{flex:1,minWidth:120,background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"10px 10px",fontSize:13,color:c.sub,fontFamily:"inherit",cursor:"pointer"}}>
                  {BAR_TYPES.map(b=><option key={b.id} value={b.id}>{b.label}{b.kg>0?" ("+(unit==="lb"?b.lbEquiv:b.kg)+unit+")":""}</option>)}
                </select>}
                <button onClick={()=>toggleBW(ex.id)} style={{background:isBW?c.accent+"22":c.card2,border:"1px solid "+(isBW?c.accent:c.border),borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer",color:isBW?c.accent:c.sub,fontFamily:"inherit",flexShrink:0,minHeight:44}}>{isBW?"✓ BW":"BW"}</button>
              </div>
              {isBW&&bwLog.length>0&&<div style={{background:c.card2,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:13,color:c.sub,flexShrink:0}}>Base: <strong style={{color:c.text}}>{unit==="lb"?Math.round(kgToLb(bwLog[bwLog.length-1].kg)*10)/10:bwLog[bwLog.length-1].kg}{unit}</strong></span>
                <span style={{fontSize:13,color:c.sub,flexShrink:0}}>+ Extra:</span>
                <input type="number" inputMode="decimal" value={ex.bwExtra||""}  placeholder="0"
                  onChange={e=>setExs(p=>p.map(x=>x.id!==ex.id?x:{...x,bwExtra:e.target.value}))}
                  style={{background:c.card,border:"1.5px solid "+c.border,borderRadius:9,padding:"8px 10px",fontSize:15,color:c.text,outline:"none",width:80,textAlign:"center",fontFamily:"inherit"}}/>
                <span style={{fontSize:13,color:c.sub,flexShrink:0}}>{unit}</span>
              </div>}
              {/* Big set rows */}
              {ex.sets.map((s,idx)=>{
                const wDisp2=!isBW?(parseFloat(unit==="lb"?fmtW(s.weight,unit):s.weight)||0):0;
                const plates2=(!isBW&&barKgF>0&&wDisp2>barDispF)?calcPlates(wDisp2,unit,unit==="lb"?barDispF:barKgF):[];
                const lbl2=s.label||"Working";
                const lblCol2=lbl2==="Warm-up"?c.am:lbl2==="Drop set"?c.r:c.sub;
                return(
                  <div key={s.id} style={{background:s.done?c.gs:c.card,border:"2px solid "+(s.done?c.g:c.border),borderRadius:20,padding:"16px",marginBottom:14,transition:"all .2s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:13,fontWeight:700,color:s.done?c.g:c.sub,flexShrink:0}}>SET {idx+1}</span>
                        {/* Label cycle button */}
                        <button onClick={()=>upd(ex.id,s.id,"label",nextLabel(lbl2))}
                          style={{background:lbl2==="Warm-up"?c.ams:lbl2==="Drop set"?c.rs:c.card2,border:"1px solid "+(lbl2==="Warm-up"?c.am:lbl2==="Drop set"?c.r:c.border)+"55",borderRadius:8,padding:"3px 8px",fontSize:10,fontWeight:700,cursor:"pointer",color:lblCol2,fontFamily:"inherit",minHeight:28}}>
                          {lbl2}
                        </button>
                      </div>
                      <button onClick={()=>tog(ex.id,s.id)}
                        style={{background:s.done?c.g:c.accent,border:"none",borderRadius:12,padding:"12px 18px",fontSize:14,fontWeight:900,cursor:"pointer",color:"#fff",fontFamily:"inherit",minHeight:44,flexShrink:0}}>
                        {s.done?"✓ Done":"Mark Done"}
                      </button>
                    </div>
                    {!isBW&&<div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>WEIGHT ({unit})</div>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <input type="number" inputMode="decimal"
                            value={s.weight&&parseFloat(s.weight)?fmtW(s.weight,unit):s.weight}
                            onChange={v=>upd(ex.id,s.id,"weight",unit==="lb"&&v.target.value?String(storeW(v.target.value,"lb")):v.target.value)}
                            style={{flex:1,minWidth:0,background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                          <button onClick={()=>setPlatePickerFor({eid:ex.id,sid:s.id,cur:parseFloat(unit==="lb"?fmtW(s.weight,unit):s.weight)||0,barType:ex.barType||"barbell"})}
                            style={{background:c.accent,border:"none",borderRadius:12,padding:"14px 14px",fontSize:20,fontWeight:900,cursor:"pointer",color:"#fff",flexShrink:0,minHeight:44,minWidth:44}}>+</button>
                        </div>
                        {plates2.length>0&&<div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
                          {plates2.map((p,pi)=><div key={"L"+pi} style={{width:32,height:32,borderRadius:"50%",background:(unit==="lb"?PCOL_LB:PCOL)[p]||"#555",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:900,flexShrink:0}}>{p}</div>)}
                          {barKgF>0&&<span style={{fontSize:10,color:c.sub,margin:"0 2px",fontWeight:700}}>|{barDispF}{unit}|</span>}
                          {[...plates2].reverse().map((p,pi)=><div key={"R"+pi} style={{width:32,height:32,borderRadius:"50%",background:(unit==="lb"?PCOL_LB:PCOL)[p]||"#555",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:900,flexShrink:0}}>{p}</div>)}
                        </div>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>REPS</div>
                        <input type="number" inputMode="numeric" value={s.reps} onChange={v=>upd(ex.id,s.id,"reps",v.target.value)}
                          style={{width:"100%",background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                      </div>
                    </div>}
                    {isBW&&<div style={{marginBottom:10}}>
                      <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>REPS</div>
                      <input type="number" inputMode="numeric" value={s.reps} onChange={v=>upd(ex.id,s.id,"reps",v.target.value)}
                        style={{width:"100%",background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                    </div>}
                    {/* Delete done set button */}
                    {s.done&&<button onClick={()=>remS(ex.id,s.id)} style={{width:"100%",background:"none",border:"1px solid "+c.border,borderRadius:10,padding:"6px",fontSize:11,color:c.sub,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>Remove this set</button>}
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        );
      })()}

      {/* ── Plate Picker Modal (+ button) ── */}
      {platePickerFor&&(()=>{
        const PCOL_USE2=unit==="lb"?PCOL_LB:PCOL;
        const barType=BAR_TYPES.find(b=>b.id===platePickerFor.barType)||BAR_TYPES[0];
        const barDisp=unit==="lb"?barType.lbEquiv:barType.kg;
        // Default perSide = true only for barbell/EZ/smith
        const defaultPerSide=barType.id==="barbell"||barType.id==="ez"||barType.id==="smith";
        const [perSide,setPerSide]=platePickerFor._perSide!==undefined
          ?[platePickerFor._perSide,(v)=>setPlatePickerFor(prev=>({...prev,_perSide:v}))]
          :[defaultPerSide,(v)=>setPlatePickerFor(prev=>({...prev,_perSide:v}))];
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
        const platesSoFar=barDisp>0&&cur>barDisp?calcPlates(cur,unit,unit==="lb"?barType.lbEquiv:barType.kg):[];
        const FALLBACK_COLS=["#ef4444","#3b82f6","#f59e0b","#22c55e","#8b5cf6","#ec4899","#94a3b8","#f97316","#06b6d4","#84cc16","#a78bfa","#fb7185","#34d399","#fbbf24","#60a5fa"];
        return(
          <div onClick={()=>setPlatePickerFor(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
            <div onClick={e=>e.stopPropagation()} style={{background:c.card,borderRadius:"26px 26px 0 0",padding:"20px 18px 0",width:"100%",maxWidth:430,boxSizing:"border-box",maxHeight:"80vh",overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 24px)"}}>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontWeight:900,fontSize:17,color:c.text}}>Add Weight</div>
                <button onClick={()=>setPlatePickerFor(null)} style={{background:c.card2,border:"none",borderRadius:9,padding:"8px 16px",cursor:"pointer",color:c.sub,fontFamily:"inherit",fontSize:13,fontWeight:700,minHeight:44}}>Done</button>
              </div>
              {/* Total display */}
              <div style={{background:c.card2,borderRadius:14,padding:"12px 16px",marginBottom:14}}>
                <div style={{fontSize:12,color:c.sub,marginBottom:2}}>Total weight on bar</div>
                <div style={{fontSize:28,fontWeight:900,color:c.text,lineHeight:1}}>{cur}<span style={{fontSize:14,fontWeight:600,color:c.sub,marginLeft:4}}>{unit}</span></div>
                {barDisp>0&&<div style={{fontSize:11,color:c.sub,marginTop:4,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span>{barDisp}{unit} bar</span>
                  {platesSoFar.length>0&&<>
                    <span>+</span>
                    {platesSoFar.map((p,i)=><span key={i} style={{background:PCOL_USE2[p]||FALLBACK_COLS[i%FALLBACK_COLS.length],color:"#fff",borderRadius:5,padding:"1px 6px",fontSize:10,fontWeight:800}}>{p}</span>)}
                    <span style={{fontSize:10,color:c.sub}}>per side</span>
                  </>}
                </div>}
              </div>
              {/* Per-side toggle */}
              <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",background:c.card2,borderRadius:12,padding:"8px 12px"}}>
                <span style={{fontSize:12,color:c.sub,flex:1}}>
                  {perSide?"Each plate added × 2 (one per side)":"Each plate added × 1 (single side)"}
                </span>
                <button onClick={()=>setPerSide(!perSide)} style={{background:perSide?c.accent:c.card,border:"1px solid "+c.border,borderRadius:9,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer",color:perSide?"#fff":c.sub,fontFamily:"inherit",flexShrink:0,minHeight:44}}>
                  {perSide?"Per side":"Single"}
                </button>
              </div>
              {/* Plate circles — larger for easier tapping */}
              <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginBottom:16}}>
                {plateList.map((p,i)=>(
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                    <button onClick={()=>addPlate(p)}
                      style={{width:62,height:62,borderRadius:"50%",background:PCOL_USE2[p]||FALLBACK_COLS[i%FALLBACK_COLS.length],border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:900,boxShadow:"0 4px 12px rgba(0,0,0,0.3)",flexShrink:0}}>
                      {p}
                    </button>
                    <button onClick={()=>removePlate(p)}
                      style={{background:c.card2,border:"1px solid "+c.border,borderRadius:8,padding:"4px 12px",fontSize:12,cursor:"pointer",color:c.sub,fontFamily:"inherit",minHeight:32,minWidth:44}}>−</button>
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
              }} style={{width:"100%",background:c.rs,border:"none",borderRadius:12,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer",color:c.r,fontFamily:"inherit",marginBottom:4}}>Clear plates (keep bar)</button>
            </div>
          </div>
        );
      })()}

      {/* ── Add Exercise Picker ── */}
      {picker&&<div onClick={()=>{setPicker(false);setSearch("");setNewExName("");setEditingEx(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:c.card,borderRadius:"26px 26px 0 0",padding:"22px 16px",paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 48px)",width:"100%",maxHeight:"82vh",overflowY:"auto",WebkitOverflowScrolling:"touch",boxSizing:"border-box"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{margin:0,fontSize:19,fontWeight:900,color:c.text}}>Add Exercise</h3>
            <button onClick={()=>{setPicker(false);setSearch("");setNewExName("");setEditingEx(null);}} style={{background:c.card2,border:"none",borderRadius:9,padding:8,cursor:"pointer",color:c.sub,display:"flex"}}><IX/></button>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search all exercises…"
            style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:12,padding:"10px 14px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>
          {searchLower
            ? <div>
                {searchResults.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:c.sub,fontSize:14}}>No exercises found</div>}
                {searchResults.map(({name,muscle})=>(
                  <button key={muscle+name} onClick={()=>{setPm(muscle);addEx(name);}} style={{width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:"1px solid "+c.border,padding:"13px 4px",fontSize:15,color:c.text,cursor:"pointer",fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:500}}>
                    <span>{name}</span><span style={{fontSize:11,color:c.sub,flexShrink:0,marginLeft:8}}>{muscle}</span>
                  </button>
                ))}
              </div>
            : <div>
                <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:10,marginBottom:12}}>
                  {MG.map(m=><button key={m} onClick={()=>{setPm(m);setNewExName("");setEditingEx(null);}} style={{flexShrink:0,border:"none",borderRadius:20,padding:"7px 13px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:pm===m?c.accent:c.card2,color:pm===m?"#fff":c.sub}}>{m}</button>)}
                </div>
                {filteredCustom.length>0&&<div style={{marginBottom:8}}>
                  <div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.08em",marginBottom:6,paddingLeft:4}}>MY EXERCISES — swipe left to delete</div>
                  {filteredCustom.map(name=>(
                    <SwipeToDelete key={name} onDelete={()=>onDeleteCustomEx(pm,name)} c={c}>
                      {editingEx===name
                        ?<div style={{flex:1,display:"flex",alignItems:"center",gap:6,padding:"8px 4px"}}>
                          <input autoFocus value={editExVal} onChange={e=>setEditExVal(e.target.value)}
                            onKeyDown={e=>{if(e.key==="Enter"){onRenameCustomEx(pm,name,editExVal);setEditingEx(null);}if(e.key==="Escape")setEditingEx(null);}}
                            style={{flex:1,background:c.card2,border:"1.5px solid "+c.accent,borderRadius:9,padding:"6px 10px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit"}}/>
                          <button onClick={()=>{onRenameCustomEx(pm,name,editExVal);setEditingEx(null);}} style={{background:c.accent,border:"none",borderRadius:8,padding:"6px 11px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit"}}>Save</button>
                          <button onClick={()=>setEditingEx(null)} style={{background:c.card2,border:"none",borderRadius:8,padding:"6px 10px",fontSize:12,cursor:"pointer",color:c.sub,fontFamily:"inherit"}}>✕</button>
                        </div>
                        :<>
                          <button onClick={()=>addEx(name)} style={{flex:1,textAlign:"left",background:"none",border:"none",padding:"13px 4px",fontSize:15,color:c.accent,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>★ {name}</button>
                          <button onClick={()=>{setEditingEx(name);setEditExVal(name);}} style={{background:"none",border:"none",padding:"8px 10px",cursor:"pointer",color:c.sub,fontSize:12,fontFamily:"inherit"}}>Edit</button>
                        </>
                      }
                    </SwipeToDelete>
                  ))}
                </div>}
                <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
                  <input value={newExName} onChange={e=>setNewExName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submitNewEx();}}
                    placeholder={"Add custom "+pm+" exercise…"}
                    style={{flex:1,background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"9px 12px",fontSize:13,color:c.text,outline:"none",fontFamily:"inherit"}}/>
                  <button onClick={submitNewEx} disabled={!newExName.trim()} style={{background:newExName.trim()?c.accent:c.muted,border:"none",borderRadius:11,padding:"9px 14px",fontSize:13,fontWeight:700,cursor:newExName.trim()?"pointer":"default",color:newExName.trim()?"#fff":c.sub,fontFamily:"inherit",flexShrink:0}}>Add</button>
                </div>
                {filteredCustom.length>0&&<div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.08em",marginBottom:6,paddingLeft:4}}>BUILT-IN</div>}
                {filteredBuiltin.map(name=><button key={name} onClick={()=>addEx(name)} style={{width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:"1px solid "+c.border,padding:"14px 4px",fontSize:15,color:c.text,cursor:"pointer",fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:500}}>{name}<IChev/></button>)}
              </div>
          }
        </div>
      </div>}
    </div>
  );
}
