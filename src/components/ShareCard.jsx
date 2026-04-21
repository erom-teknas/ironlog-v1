import React, { useState } from 'react';
import { fmtLong, calcVol, kgToLb, bestRM } from '../utils';
import { IShare, IX } from '../icons';

export default function ShareCard({workout:w,c,unit="kg",onClose,bwKg=0}){
  const [copied,setCopied]=useState(false);
  const v=w.exercises.reduce((s,e)=>s+calcVol(e.sets),0);
  const sets=w.exercises.reduce((s,e)=>s+e.sets.length,0);
  const best=w.exercises.reduce((b,e)=>{const rm=bestRM(e.sets,bwKg);return rm>b.val?{val:rm,name:e.name}:b;},{val:0,name:""});
  const shareText=()=>{
    var lines=["🏋️ "+w.name+" — "+fmtLong(w.date),""];
    w.exercises.forEach(ex=>{lines.push("• "+ex.name+": "+ex.sets.map(s=>(s.bodyweight?"BW":s.weight+unit)+"×"+s.reps).join(", "));});
    lines.push("");
    var volDisp=unit==="lb"?(Math.round(kgToLb(v)/100)/10)+"k lb":(Math.round(v/100)/10)+"k kg";
    lines.push("Volume: "+volDisp+" · Sets: "+sets+" · Exercises: "+w.exercises.length);
    if(best.val>0)lines.push("Best ~1RM: "+(unit==="lb"?kgToLb(best.val):best.val)+unit+" ("+best.name+")");
    lines.push("","📱 IronLog · Track. Lift. Grow.");
    return lines.join("\n");
  };
  const doShare=async()=>{
    const text=shareText();
    if(navigator.share){try{await navigator.share({title:"IronLog — "+w.name,text});return;}catch(e){if(e.name==="AbortError")return;}}
    try{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000);}catch(e){}
  };
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(140deg,#1a1a2e,#16213e,#0f3460)",borderRadius:28,padding:"30px 22px",width:"100%",maxWidth:320,boxShadow:"0 24px 80px rgba(0,0,0,0.8)"}}>
        <div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:36,marginBottom:6}}>🏋️</div><div style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-0.02em"}}>{w.name}</div><div style={{fontSize:12,color:"#8888bb",marginTop:4}}>{fmtLong(w.date)}</div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:14}}>{[
          {l:"Volume",v:unit==="lb"?(kgToLb(v)>=1000?Math.round(kgToLb(v)/100)/10+"k lb":Math.round(kgToLb(v))+" lb"):(v>=1000?Math.round(v/100)/10+"k kg":Math.round(v)+" kg")},
          {l:"Sets",v:sets},
          {l:"Exercises",v:w.exercises.length}
        ].map(s=><div key={s.l} style={{background:"rgba(255,255,255,0.08)",borderRadius:14,padding:"12px 6px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{s.v}</div><div style={{fontSize:9,color:"#8888bb",marginTop:3,fontWeight:700,letterSpacing:"0.05em"}}>{s.l.toUpperCase()}</div></div>)}</div>
        {best.val>0&&<div style={{background:"rgba(124,110,250,0.2)",border:"1px solid rgba(124,110,250,0.4)",borderRadius:14,padding:"12px",marginBottom:14,textAlign:"center"}}><div style={{fontSize:10,color:"#b0a0ff",fontWeight:700,letterSpacing:"0.07em",marginBottom:3}}>BEST ~1RM</div><div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{unit==="lb"?kgToLb(best.val):best.val}{unit} — {best.name}</div></div>}
        {w.rating>0&&<div style={{textAlign:"center",fontSize:22,marginBottom:14}}>{"⭐".repeat(w.rating)}</div>}
        <div style={{textAlign:"center",fontSize:10,color:"#55557a",marginBottom:16,fontWeight:600}}>● IronLog · Track. Lift. Grow.</div>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <button onClick={doShare} style={{flex:1,background:"#7C6EFA",border:"none",borderRadius:13,padding:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{copied?"✓ Copied!":navigator.share?"⬆ Share":"📋 Copy"}</button>
          <button onClick={onClose} style={{flex:1,background:"rgba(255,255,255,0.1)",border:"none",borderRadius:13,padding:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Close</button>
        </div>
      </div>
    </div>
  );
}
