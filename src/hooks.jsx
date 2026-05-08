import React, { useState, useRef, useCallback } from 'react';
import { haptic } from './utils';

// ─── Inline Confirm Dialog — replaces window.confirm (blocked in iframes) ─────
// Usage: const {confirmEl,confirm} = useConfirm(c);
//   confirm("Message?").then(ok => { if(ok) doThing(); })
//   Render {confirmEl} anywhere in the JSX tree.
export function useConfirm(c){
  const [state,setState]=useState(null); // {msg, resolve}
  const confirm=(msg)=>new Promise(resolve=>{setState({msg,resolve});});
  const respond=(ok)=>{if(state){state.resolve(ok);setState(null);}};
  const confirmEl=state?(
    // Backdrop: tap outside = Cancel. cursor:pointer + touchAction:manipulation = no iOS 300ms delay
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",
      padding:"24px 24px calc(24px + env(safe-area-inset-bottom,0px))",cursor:"pointer",touchAction:"manipulation"}}
      onClick={()=>respond(false)}>
      <div style={{background:c.card,borderRadius:22,padding:"24px 20px",width:"100%",maxWidth:320,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",cursor:"default"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:15,fontWeight:700,color:c.text,marginBottom:20,lineHeight:1.5,textAlign:"center"}}>{state.msg}</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>{haptic("light");respond(false);}} style={{flex:1,background:c.card2,border:"1px solid "+c.border,borderRadius:13,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",color:c.sub,fontFamily:"inherit",minHeight:44}}>Cancel</button>
          <button onClick={()=>{haptic("medium");respond(true);}} style={{flex:1,background:c.r,border:"none",borderRadius:13,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",minHeight:44}}>OK</button>
        </div>
      </div>
    </div>
  ):null;
  return{confirm,confirmEl};
}

// ─── Three-way dialog: Merge / Replace / Cancel ────────────────────────────────
// resolve("merge") | resolve("replace") | resolve("cancel")
export function useImportDialog(c){
  const [state,setState]=useState(null);
  const show=(msg)=>new Promise(resolve=>setState({msg,resolve}));
  const respond=(v)=>{if(state){state.resolve(v);setState(null);}};
  const el=state?(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center",
      padding:"0 16px calc(24px + env(safe-area-inset-bottom,0px))",touchAction:"manipulation"}}
      onClick={()=>respond("cancel")}>
      <div style={{background:c.card,borderRadius:22,padding:"20px",width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",cursor:"default"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:15,fontWeight:700,color:c.text,marginBottom:6,textAlign:"center"}}>Restore Cloud Backup</div>
        <div style={{fontSize:13,color:c.sub,marginBottom:20,textAlign:"center",lineHeight:1.5}}>{state.msg}</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <button onClick={()=>{haptic("medium");respond("merge");}}
            style={{background:c.accent,border:"none",borderRadius:13,padding:"14px",fontSize:14,fontWeight:800,cursor:"pointer",color:"#fff",fontFamily:"inherit",minHeight:44}}>
            Merge — keep everything, add new from backup
          </button>
          <button onClick={()=>{haptic("medium");respond("replace");}}
            style={{background:c.rs,border:"1.5px solid "+c.r+"66",borderRadius:13,padding:"14px",fontSize:14,fontWeight:800,cursor:"pointer",color:c.r,fontFamily:"inherit",minHeight:44}}>
            Replace — overwrite with backup only
          </button>
          <button onClick={()=>{haptic("light");respond("cancel");}}
            style={{background:c.card2,border:"1px solid "+c.border,borderRadius:13,padding:"13px",fontSize:13,fontWeight:700,cursor:"pointer",color:c.sub,fontFamily:"inherit",minHeight:44}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  ):null;
  return{show,importDialogEl:el};
}

// ─── Audio helpers ─────────────────────────────────────────────────────────────
// The Web Audio clock runs independently of the JS event loop and screen lock.
// We hold one shared AudioContext, resumed on first user gesture.
// When a rest timer starts, we schedule 3 beeps at the exact future timestamp.
var _actx=null;
var _scheduledBeeps=[];
export function getACtx(){
  if(!_actx){try{_actx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}
  return _actx;
}
export function resumeACtx(){
  var ctx=getACtx();
  if(ctx&&ctx.state==="suspended"){ctx.resume().catch(()=>{});}
  return ctx;
}
export function cancelScheduledBeeps(){
  _scheduledBeeps.forEach(function(n){try{n.stop();}catch(e){}});
  _scheduledBeeps=[];
}
export function scheduleBeepsAt(fireAtMs){
  var ctx=resumeACtx();
  if(!ctx)return;
  cancelScheduledBeeps();
  var delayS=(fireAtMs-Date.now())/1000;
  if(delayS<0)delayS=0;
  var lastEndS=delayS+0.5+0.36; // last beep end time relative to now
  [[880,0],[880,0.25],[1046,0.5]].forEach(function(pair){
    var freq=pair[0],off=pair[1];
    var t=ctx.currentTime+delayS+off;
    var o=ctx.createOscillator();
    var g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.frequency.value=freq;o.type="sine";
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(0.5,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
    o.start(t);o.stop(t+0.36);
    _scheduledBeeps.push(o);
  });
  // Suspend context after last beep to release audio hardware
  setTimeout(function(){
    _scheduledBeeps=[];
    if(_actx&&_actx.state==="running")_actx.suspend().catch(function(){});
  },Math.ceil(lastEndS*1000)+200);
}
export function hapticBeep(){
  try{if(navigator.vibrate)navigator.vibrate([80,60,80,60,120]);}catch(e){}
  var ctx=resumeACtx();
  if(!ctx)return;
  cancelScheduledBeeps();
  var endAt=ctx.currentTime+0.4+0.36;
  [[880,0],[880,0.2],[1046,0.4]].forEach(function(pair){
    var freq=pair[0],off=pair[1];
    var t=ctx.currentTime+off;
    var o=ctx.createOscillator();var g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.frequency.value=freq;o.type="sine";
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(0.5,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
    o.start(t);o.stop(t+0.36);
  });
  // Suspend context after beeps complete to free audio hardware
  setTimeout(function(){if(_actx&&_actx.state==="running")_actx.suspend().catch(function(){});},Math.ceil((endAt-ctx.currentTime)*1000)+100);
}

// Suspend AudioContext when page goes to background — registered once at module level
if(typeof document!=="undefined"&&!window._ilAudioVisRegistered){
  window._ilAudioVisRegistered=true;
  document.addEventListener("visibilitychange",function(){
    if(document.visibilityState==="hidden"&&_actx&&_actx.state==="running"&&_scheduledBeeps.length===0){
      _actx.suspend().catch(function(){});
    }
  });
}
