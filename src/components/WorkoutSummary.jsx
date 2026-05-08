import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { calcVol, bestRM, kgToLb, fmtD } from '../utils';

// ─── Muscle colour mapping ────────────────────────────────────────────────────
const MG_COL={Chest:"#ef4444",Back:"#3b82f6",Shoulders:"#f59e0b",Biceps:"#8b5cf6",
  Triceps:"#ec4899",Legs:"#22c55e",Core:"#06b6d4",Glutes:"#f97316",Cardio:"#10d9a0"};

function fmt(sec){
  const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
  if(h>0)return h+"h "+m+"m";
  if(m>0)return m+"m "+(s>0?s+"s":"");
  return s+"s";
}

export default function WorkoutSummary({workout,hist=[],unit="kg",c,onDone}){
  useEffect(()=>{
    document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow="";};
  },[]);

  const {exercises=[],duration=0,name="",date=""}=workout;

  const totalVol=useMemo(()=>exercises.reduce((s,e)=>s+calcVol(e.sets.filter(x=>!x.bodyweight&&!e.isCardio)),0),[exercises]);
  const totalSets=useMemo(()=>exercises.reduce((s,e)=>s+e.sets.filter(x=>x.done!==false).length,0),[exercises]);
  const muscles=[...new Set(exercises.map(e=>e.muscle).filter(Boolean))];

  const prs=useMemo(()=>{
    const prevHist=hist.filter(w=>w.id!==workout.id);
    const bwKg=0;
    return exercises.filter(ex=>{
      if(ex.isCardio)return false;
      let histBest=0;
      prevHist.forEach(w=>{const f=w.exercises.find(e=>e.name===ex.name);if(f)histBest=Math.max(histBest,bestRM(f.sets,bwKg));});
      return histBest>0&&bestRM(ex.sets,bwKg)>histBest;
    });
  },[exercises,hist,workout.id]);

  const dispVol=unit==="lb"?Math.round(kgToLb(totalVol)):Math.round(totalVol);
  const volLabel=dispVol>=1000?(dispVol/1000).toFixed(1)+"k":String(dispVol);

  const stats=[
    {label:"Duration",value:fmt(duration),icon:"⏱"},
    {label:"Volume",value:volLabel+" "+unit,icon:"💪"},
    {label:"Sets done",value:String(totalSets),icon:"✅"},
    {label:"Exercises",value:String(exercises.length),icon:"🏋️"},
  ];

  return createPortal(
    <div style={{
      position:"fixed",inset:0,zIndex:9800,
      background:"rgba(0,0,0,0.75)",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"flex-end",
      paddingBottom:"env(safe-area-inset-bottom,16px)",
    }}
    onClick={e=>{if(e.target===e.currentTarget)onDone();}}>
      <div style={{
        width:"100%",maxWidth:430,
        background:c.card,
        borderRadius:"28px 28px 0 0",
        overflow:"hidden",
        animation:"slideUpSpring .42s cubic-bezier(0.34,1.56,0.64,1) both",
        maxHeight:"88dvh",
        display:"flex",flexDirection:"column",
      }}>
        {/* ── Header ── */}
        <div style={{
          background:`linear-gradient(135deg,${c.accent},${c.accent}cc)`,
          padding:"24px 24px 18px",
          textAlign:"center",
          flexShrink:0,
        }}>
          <div style={{fontSize:52,marginBottom:8,animation:"il-spring .5s cubic-bezier(0.34,1.56,0.64,1) both"}}>
            {prs.length>0?"🏆":"💪"}
          </div>
          <div style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-0.03em",marginBottom:4}}>
            {prs.length>0?"PR Session!":"Workout Complete!"}
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",fontWeight:500}}>
            {name||"Workout"} · {date?fmtD(date):""}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"20px 20px 8px",flex:1}}>
          {/* Stats grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            {stats.map(st=>(
              <div key={st.label} style={{
                background:c.card2,borderRadius:16,padding:"14px 12px",
                border:"1px solid "+c.border,textAlign:"center",
              }}>
                <div style={{fontSize:22,marginBottom:4}}>{st.icon}</div>
                <div style={{fontSize:18,fontWeight:900,color:c.text,letterSpacing:"-0.02em"}}>{st.value}</div>
                <div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.06em",marginTop:2}}>{st.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* PRs */}
          {prs.length>0&&(
            <div style={{background:c.gs,border:"1px solid "+c.g+"44",borderRadius:16,padding:"12px 14px",marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:c.g,letterSpacing:"0.08em",marginBottom:8}}>🏆 PERSONAL RECORDS</div>
              {prs.map(ex=>(
                <div key={ex.id||ex.name} style={{fontSize:13,color:c.g,fontWeight:700,padding:"3px 0"}}>
                  {ex.name}
                </div>
              ))}
            </div>
          )}

          {/* Muscles */}
          {muscles.length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,color:c.sub,letterSpacing:"0.08em",marginBottom:8}}>MUSCLES TRAINED</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {muscles.map(m=>(
                  <span key={m} style={{
                    background:(MG_COL[m]||c.accent)+"22",
                    color:MG_COL[m]||c.accent,
                    border:"1px solid "+(MG_COL[m]||c.accent)+"44",
                    borderRadius:20,padding:"4px 12px",
                    fontSize:12,fontWeight:700,
                  }}>{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* Exercise breakdown */}
          <div style={{marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:800,color:c.sub,letterSpacing:"0.08em",marginBottom:8}}>EXERCISES</div>
            {exercises.map((ex,i)=>{
              const doneSets=ex.sets.filter(s=>s.done!==false).length;
              const vol=ex.isCardio?null:calcVol(ex.sets.filter(s=>!s.bodyweight));
              const dispVol2=vol!=null?(unit==="lb"?Math.round(kgToLb(vol)):Math.round(vol)):null;
              const isPR=prs.some(p=>p.name===ex.name);
              return(
                <div key={i} style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"8px 0",borderTop:"1px solid "+c.border,fontSize:13,
                }}>
                  <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontWeight:700,color:c.text}}>{ex.name}</span>
                    {isPR&&<span style={{fontSize:11,color:c.g,fontWeight:800,marginLeft:6}}>🏆 PR</span>}
                  </div>
                  <div style={{color:c.sub,flexShrink:0,marginLeft:8}}>
                    {doneSets} set{doneSets!==1?"s":""}
                    {dispVol2!=null&&dispVol2>0?<span style={{marginLeft:6,color:c.accent,fontWeight:700}}>{dispVol2>=1000?(dispVol2/1000).toFixed(1)+"k":dispVol2}{unit}</span>:null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Done button ── */}
        <div style={{padding:"12px 20px",borderTop:"1px solid "+c.border,flexShrink:0}}>
          <button onClick={onDone} style={{
            width:"100%",background:"linear-gradient(135deg,"+c.accent+","+c.accent+"cc)",
            border:"none",borderRadius:16,padding:"16px",
            fontSize:16,fontWeight:900,cursor:"pointer",
            color:"#fff",fontFamily:"inherit",
            boxShadow:"0 4px 20px "+c.accent+"44",
            letterSpacing:"-0.01em",
          }}>
            Done 💪
          </button>
        </div>
      </div>
    </div>
  ,document.body);
}
