import React, { useState, useEffect, useRef, memo } from 'react';
import { hapticBeep, scheduleBeepsAt, cancelScheduledBeeps, resumeACtx } from '../hooks.jsx';

// memo prevents timer ticks (setNow every 250ms) from re-rendering the whole app
const RestTimerCircle=memo(function RestTimerCircle({c,timerSecs,timerStart,onCycle,onDone}){
  const [now,setNow]=useState(()=>Date.now());
  const rafRef=useRef(null);
  // ALL hooks must be at the top — no hooks after conditional returns
  useEffect(()=>{
    if(!timerSecs)return;
    scheduleBeepsAt(timerStart+timerSecs*1000);
    const start=()=>{if(!rafRef.current)rafRef.current=setInterval(()=>setNow(Date.now()),250);};
    const stop=()=>{if(rafRef.current){clearInterval(rafRef.current);rafRef.current=null;}};
    const onVis=()=>document.visibilityState==="visible"?start():stop();
    document.addEventListener("visibilitychange",onVis);
    start();
    return()=>{stop();document.removeEventListener("visibilitychange",onVis);};
  },[timerSecs,timerStart]);
  const elapsed=timerSecs?Math.min((now-timerStart)/1000,timerSecs):0;
  const remain=timerSecs?Math.max(timerSecs-elapsed,0):0;
  const pct=timerSecs?Math.min(elapsed/timerSecs,1):0;
  const done=timerSecs>0&&remain<=0;
  useEffect(()=>{
    if(!done)return;
    cancelScheduledBeeps(); // already fired via scheduled audio
    hapticBeep();            // also do immediate vibrate+beep for visible feedback
    // Visual flash — helps when phone is on silent
    const fl=document.createElement("div");
    fl.style.cssText="position:fixed;inset:0;background:#7C6EFA;opacity:0.35;z-index:9999;pointer-events:none;animation:flashFade .6s ease forwards";
    document.body.appendChild(fl);
    setTimeout(()=>fl.remove(),700);
    const t=setTimeout(onDone,1200);
    return()=>clearTimeout(t);
  },[done,onDone]);
  const R=19,circ=2*Math.PI*R;
  const mm=Math.floor(remain/60),ss=Math.floor(remain%60);
  const label=done?"✓":(mm>0?mm+":"+(ss<10?"0":"")+ss:ss+"s");
  const handleCycle=()=>{cancelScheduledBeeps();resumeACtx();onCycle();};
  if(!timerSecs){
    return(
      <button onClick={handleCycle} title="Tap to start rest timer" style={{position:"relative",width:44,height:44,borderRadius:"50%",background:"none",border:"none",cursor:"pointer",padding:0,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="44" height="44" style={{position:"absolute",top:0,left:0}}>
          <circle cx="22" cy="22" r={R} fill="none" stroke={c.muted} strokeWidth="3"/>
        </svg>
        <span style={{position:"relative",fontSize:9,fontWeight:700,color:c.sub,lineHeight:1,letterSpacing:"0.02em"}}>REST</span>
      </button>
    );
  }
  return(
    <button onClick={handleCycle} title="Tap to change duration or stop" style={{position:"relative",width:44,height:44,borderRadius:"50%",background:"none",border:"none",cursor:"pointer",padding:0,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg width="44" height="44" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
        <circle cx="22" cy="22" r={R} fill="none" stroke={c.muted} strokeWidth="3"/>
        <circle cx="22" cy="22" r={R} fill="none"
          stroke={done?c.g:c.accent} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}/>
      </svg>
      <span style={{position:"relative",fontSize:done?13:10,fontWeight:800,color:done?c.g:c.accent,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{label}</span>
    </button>
  );
},(prev,next)=>prev.timerSecs===next.timerSecs&&prev.timerStart===next.timerStart&&prev.c===next.c);

export default RestTimerCircle;
