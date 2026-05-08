import React, { useState } from 'react';
import { MG, CC } from '../constants';
import { calcVol, bestRM, kgToLb, weekKey, fmtD, getStreak, isCardioEx } from '../utils';
import { ITrash, IScale, ITrendUp, IBarChart, IClock, IFlame, IRuler, IActivity } from '../icons';
import { Empty } from '../components/Primitives';
import CollapsibleSection from '../components/CollapsibleSection';
import WeightChart from '../components/WeightChart';
import MuscleVolumeTrend from '../components/MuscleVolumeTrend';
import CalendarCard from '../components/CalendarCard';
import StrengthStandards from '../components/StrengthStandards';
import MuscleRadar from '../components/MuscleRadar';

const MEAS_FIELDS=[{k:"chest",l:"Chest"},{k:"waist",l:"Waist"},{k:"hips",l:"Hips"},{k:"biceps",l:"Biceps"},{k:"thighs",l:"Thighs"}];

export default function ProgressPage({hist,c,unit="kg",bwLog=[],onLogBW,onDeleteBW,customExercises={},measLog=[],onLogMeas,onDeleteMeas,measUnit="cm",bwKg=0,bwUnit,onSetBwUnit,streakDays=1}){
  // Effective body weight display unit — independent of lifting unit
  const effectiveBwUnit=bwUnit||unit;
  const [measUnitLocal,setMeasUnitLocal]=React.useState(()=>{try{return localStorage.getItem("il_meas_unit")||"cm";}catch{return"cm";}});
  const saveMeasUnit=u=>{setMeasUnitLocal(u);try{localStorage.setItem("il_meas_unit",u);}catch{}};
  const mUnit=measUnitLocal; // "cm" or "in"
  const [mode,setMode]=useState("weight");
  const [selExs,setSelExs]=useState([]);
  const [addingEx,setAddingEx]=useState(false);
  const [exMuscle,setExMuscle]=useState(MG[0]);
  const [range,setRange]=useState("3m");
  const [measInputs,setMeasInputs]=useState({});
  const [pgTab,setPgTab]=useState("strength"); // "strength" | "body" | "activity"

  const now=new Date();
  const rangeMs={"1m":30*864e5,"3m":90*864e5,"6m":180*864e5,"1y":365*864e5,"all":Infinity};
  const filteredHist=React.useMemo(()=>{
    const cutoff=rangeMs[range];
    if(cutoff===Infinity)return hist;
    return hist.filter(w=>(now-new Date(w.date))<=cutoff);
  },[hist,range]);

  if(!hist.length&&!bwLog.length&&!measLog.length)return <Empty icon={<ITrendUp/>} title="No data yet" sub="Log workouts to see progress charts." c={c}/>;

  const allLoggedByMuscle=React.useMemo(()=>{
    const byMuscle={};
    hist.forEach(w=>w.exercises.forEach(ex=>{
      var m=ex.muscle||"";
      if(!byMuscle[m])byMuscle[m]=new Set();
      byMuscle[m].add(ex.name);
    }));
    return byMuscle;
  },[hist]);
  const exPickerList=React.useMemo(()=>{
    var logged=[...(allLoggedByMuscle[exMuscle]||new Set())];
    var custom=customExercises[exMuscle]||[];
    // Filter out cardio exercises — they don't have weight/1RM data
    return [...new Set([...logged,...custom])].filter(n=>!isCardioEx(n,exMuscle)).sort();
  },[allLoggedByMuscle,customExercises,exMuscle]);
  const allEx=React.useMemo(()=>[...new Set(hist.flatMap(w=>w.exercises.filter(e=>!isCardioEx(e.name,e.muscle)).map(e=>e.name)))].sort(),[hist]);
  const toggleEx=name=>{setSelExs(p=>{if(p.includes(name))return p.filter(x=>x!==name);if(p.length>=4)return p;return[...p,name];});setAddingEx(false);};

  const series=React.useMemo(()=>selExs.map((name,si)=>{
    const points=[];
    filteredHist.forEach(w=>{
      const ex=w.exercises.find(e=>e.name===name);if(!ex)return;
      var rawVal=mode==="volume"?calcVol(ex.sets):mode==="1rm"?bestRM(ex.sets):Math.max(...ex.sets.map(s=>parseFloat(s.weight)||0));
      var val=unit==="lb"?(mode==="volume"?Math.round(kgToLb(rawVal)):kgToLb(rawVal)):rawVal;
      if(val>0)points.push({date:w.date,y:val});
    });
    points.sort((a,b)=>new Date(a.date)-new Date(b.date));
    return{label:name,data:points,color:CC[si%CC.length]};
  }),[selExs,filteredHist,mode,unit]);

  const weekBars=React.useMemo(()=>{
    const weeks={};
    filteredHist.forEach(w=>{const k=weekKey(w.date);weeks[k]=(weeks[k]||0)+w.exercises.reduce((s,e)=>s+calcVol(e.sets),0);});
    return Object.entries(weeks).sort((a,b)=>a[0].localeCompare(b[0])).map(([d,v])=>({date:d,vol:Math.round(unit==="lb"?kgToLb(v):v)}));
  },[filteredHist,unit]);

  const maxVol=Math.max(...weekBars.map(w=>w.vol),1);
  const modeLabel=mode==="weight"?"Max Weight ("+unit+")":mode==="1rm"?"Est. 1RM ("+unit+")":"Volume ("+unit+"×reps)";

  // Body weight chart — uses effectiveBwUnit (independent from lifting unit)
  const bwDisplay=bwLog.map(e=>({date:e.date,y:effectiveBwUnit==="lb"?Math.round(kgToLb(e.kg)*10)/10:e.kg}));
  const bwMax=bwDisplay.length?Math.max(...bwDisplay.map(p=>p.y)):100;
  const bwMin=bwDisplay.length?Math.min(...bwDisplay.map(p=>p.y)):50;
  const BW=320,BH=100;
  const bpx=i=>bwDisplay.length<2?BW/2:(i/(bwDisplay.length-1))*BW;
  const bpy=v=>BH-((v-bwMin+2)/(Math.max(bwMax-bwMin+4,5)))*(BH*0.85);
  const bwPath=bwDisplay.length>1?bwDisplay.reduce((d,p,i)=>{
    if(i===0)return"M"+bpx(i)+","+bpy(p.y);
    const x0=bpx(i-1),y0=bpy(bwDisplay[i-1].y),x1=bpx(i),y1=bpy(p.y),cpx=(x0+x1)/2;
    return d+" C"+cpx+","+y0+" "+cpx+","+y1+" "+x1+","+y1;
  },""):"";

  // Workout duration trend
  const durationData=React.useMemo(()=>
    filteredHist.filter(w=>w.duration>0).map(w=>({date:w.date,y:Math.round(w.duration/60)}))
      .sort((a,b)=>a.date.localeCompare(b.date))
  ,[filteredHist]);
  const dMax=durationData.length?Math.max(...durationData.map(p=>p.y)):60;
  const dMin=durationData.length?Math.min(...durationData.map(p=>p.y)):0;
  const DW=320,DH=90;
  const dpx=i=>durationData.length<2?DW/2:(i/(durationData.length-1))*DW;
  const dpy=v=>DH-((v-dMin+2)/(Math.max(dMax-dMin+4,10)))*(DH*0.85);
  const dPath=durationData.length>1?durationData.reduce((d,p,i)=>{
    if(i===0)return"M"+dpx(i)+","+dpy(p.y);
    const x0=dpx(i-1),y0=dpy(durationData[i-1].y),x1=dpx(i),y1=dpy(p.y),cpx=(x0+x1)/2;
    return d+" C"+cpx+","+y0+" "+cpx+","+y1+" "+x1+","+y1;
  },""):"";
  const avgDur=durationData.length?Math.round(durationData.reduce((s,p)=>s+p.y,0)/durationData.length):0;

  // Cardio summary — per-week total minutes and distance
  const cardioWeekly=React.useMemo(()=>{
    const weeks={};
    filteredHist.forEach(w=>{
      const k=weekKey(w.date);
      w.exercises.forEach(ex=>{
        const isC=ex.isCardio!=null?!!ex.isCardio:isCardioEx(ex.name,ex.muscle);
        if(!isC)return;
        if(!weeks[k])weeks[k]={mins:0,dist:0};
        ex.sets.forEach(s=>{
          weeks[k].mins+=parseFloat(s.mins)||0;
          weeks[k].dist+=parseFloat(s.dist)||0;
        });
      });
    });
    return Object.entries(weeks).sort((a,b)=>a[0].localeCompare(b[0])).map(([d,v])=>({date:d,...v})).filter(w=>w.mins>0||w.dist>0);
  },[filteredHist]);
  const cardioSessions=React.useMemo(()=>{
    const out=[];
    filteredHist.forEach(w=>{
      let mins=0,dist=0,names=[];
      w.exercises.forEach(ex=>{
        const isC=ex.isCardio!=null?!!ex.isCardio:isCardioEx(ex.name,ex.muscle);
        if(!isC)return;
        names.push(ex.name);
        ex.sets.forEach(s=>{mins+=parseFloat(s.mins)||0;dist+=parseFloat(s.dist)||0;});
      });
      if(mins>0||dist>0)out.push({date:w.date,mins,dist,names:[...new Set(names)]});
    });
    return out.sort((a,b)=>b.date.localeCompare(a.date));
  },[filteredHist]);
  const totalCardioMins=cardioSessions.reduce((s,x)=>s+x.mins,0);
  const totalCardioDist=cardioSessions.reduce((s,x)=>s+x.dist,0);
  const maxCardioMins=cardioWeekly.length?Math.max(...cardioWeekly.map(w=>w.mins),1):1;

  // Muscle frequency heatmap — last 8 weeks × muscle groups
  const muscleFreq=React.useMemo(()=>{
    const weeks=[];
    for(let i=7;i>=0;i--){
      const d=new Date();d.setDate(d.getDate()-i*7);
      const k=weekKey(d.toISOString().slice(0,10));
      weeks.push(k);
    }
    const freq={};
    weeks.forEach(wk=>{freq[wk]={};});
    hist.forEach(w=>{
      const k=weekKey(w.date);
      if(!freq[k])return;
      w.exercises.forEach(ex=>{
        const m=ex.muscle||"Other";
        freq[k][m]=(freq[k][m]||0)+1;
      });
    });
    return{weeks,freq};
  },[hist]);

  const RANGES=[{k:"1m",l:"1M"},{k:"3m",l:"3M"},{k:"6m",l:"6M"},{k:"1y",l:"1Y"},{k:"all",l:"All"}];
  const topMuscles=React.useMemo(()=>{
    const cnt={};
    hist.forEach(w=>w.exercises.forEach(ex=>{const m=ex.muscle||"Other";cnt[m]=(cnt[m]||0)+1;}));
    return Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([m])=>m);
  },[hist]);

  // Streak stats (used in Activity tab)
  const curStreak=getStreak(hist,streakDays);
  const allDates=[...new Set(hist.map(w=>w.date))].sort();
  let bestStreak=allDates.length?1:0,streakRun=1;
  for(let i=1;i<allDates.length;i++){
    const prev=new Date(allDates[i-1]);prev.setDate(prev.getDate()+1);
    if(prev.toISOString().slice(0,10)===allDates[i]){streakRun++;if(streakRun>bestStreak)bestStreak=streakRun;}
    else streakRun=1;
  }
  const yearStart=new Date().getFullYear()+'-01-01';
  const thisYear=hist.filter(w=>w.date>=yearStart).length;

  const PG_TABS=[{id:"strength",label:"Strength",icon:"💪"},{id:"body",label:"Body",icon:"⚖️"},{id:"activity",label:"Activity",icon:"📅"}];

  // Top 3 lifetime PRs — always visible above tabs
  const topPRs=React.useMemo(()=>{
    const best={};
    hist.forEach(w=>w.exercises.forEach(ex=>{
      if(isCardioEx(ex.name,ex.muscle))return;
      const rm=bestRM(ex.sets,bwKg);
      if(rm>0&&(!best[ex.name]||rm>best[ex.name].rm))
        best[ex.name]={rm,name:ex.name,muscle:ex.muscle||""};
    }));
    return Object.values(best)
      .sort((a,b)=>b.rm-a.rm)
      .slice(0,3);
  },[hist,bwKg]);

  return(
    <div style={{padding:"16px 16px 100px"}}>
      <h2 style={{fontSize:23,fontWeight:900,margin:"0 0 14px",color:c.text,letterSpacing:"-0.02em"}}>Progress</h2>

      {/* ── Top PRs hero strip — most important data, always at top ── */}
      {topPRs.length>0&&(
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {topPRs.map((pr,i)=>{
            const medals=["🥇","🥈","🥉"];
            const dispRM=unit==="lb"?Math.round(kgToLb(pr.rm)*4)/4:pr.rm;
            return(
              <div key={pr.name} style={{flex:1,background:c.card,border:"1px solid "+c.border,borderRadius:16,padding:"10px 8px",textAlign:"center",minWidth:0}}>
                <div style={{fontSize:18,marginBottom:2}}>{medals[i]}</div>
                <div style={{fontSize:15,fontWeight:900,color:c.accent,letterSpacing:"-0.02em",lineHeight:1}}>{dispRM}<span style={{fontSize:9,fontWeight:700,color:c.sub,marginLeft:1}}>{unit}</span></div>
                <div style={{fontSize:9,fontWeight:700,color:c.sub,marginTop:2,letterSpacing:"0.03em"}}>~1RM</div>
                <div style={{fontSize:10,fontWeight:700,color:c.text,marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pr.name}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab switcher ── */}
      <div style={{display:"flex",gap:0,marginBottom:16,background:c.card2,borderRadius:14,padding:4}}>
        {PG_TABS.map(t=>(
          <button key={t.id} onClick={()=>setPgTab(t.id)}
            style={{flex:1,border:"none",borderRadius:11,padding:"8px 4px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
              background:pgTab===t.id?c.accent:"transparent",
              color:pgTab===t.id?"#fff":c.sub,
              transition:"background 0.18s,color 0.18s",
              display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <span style={{fontSize:14}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Time range — global, shown for all tabs ── */}
      <div style={{display:"flex",gap:6,marginBottom:18,background:c.card,borderRadius:12,padding:4,border:"1px solid "+c.border}}>
        {RANGES.map(r=><button key={r.k} onClick={()=>setRange(r.k)} style={{flex:1,border:"none",borderRadius:9,padding:"6px 4px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:range===r.k?c.accent+"22":"none",color:range===r.k?c.accent:c.sub,transition:"all .2s"}}>{r.l}</button>)}
      </div>

      {/* ══ STRENGTH TAB ══════════════════════════════════════════════════════ */}
      {pgTab==="strength"&&<>
        {/* Weight progression */}
        <CollapsibleSection title="Weight Progression" icon={<ITrendUp/>} sub={modeLabel} c={c}>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <div style={{display:"flex",gap:4,background:c.card2,borderRadius:10,padding:3}}>
              {[{k:"weight",l:"Wt"},{k:"1rm",l:"1RM"},{k:"volume",l:"Vol"}].map(m=><button key={m.k} onClick={()=>setMode(m.k)} style={{border:"none",borderRadius:8,padding:"4px 9px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:mode===m.k?c.accent:"none",color:mode===m.k?"#fff":c.sub}}>{m.l}</button>)}
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
            {selExs.map((name,si)=><div key={name} style={{display:"flex",alignItems:"center",gap:4,background:CC[si%CC.length]+"22",border:"1px solid "+CC[si%CC.length]+"55",borderRadius:20,padding:"4px 10px"}}><div style={{width:8,height:8,borderRadius:"50%",background:CC[si%CC.length],flexShrink:0}}/><span style={{fontSize:11,fontWeight:700,color:CC[si%CC.length]}}>{name}</span><button onClick={()=>toggleEx(name)} style={{background:"none",border:"none",cursor:"pointer",color:CC[si%CC.length],fontSize:13,lineHeight:1,padding:"0 0 0 2px"}}>×</button></div>)}
            {selExs.length<4&&<button onClick={()=>setAddingEx(p=>!p)} style={{border:"1.5px dashed "+c.border,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",color:c.sub,background:"none",fontFamily:"inherit"}}>{addingEx?"Cancel":"+ Add exercise"}</button>}
          </div>
          {addingEx&&<div style={{marginBottom:12}}>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:8}}>{MG.filter(m=>m!=="Cardio").map(m=><button key={m} onClick={()=>setExMuscle(m)} style={{flexShrink:0,border:"none",borderRadius:20,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:exMuscle===m?c.accent:c.card2,color:exMuscle===m?"#fff":c.sub}}>{m}</button>)}</div>
            <div style={{background:c.card2,borderRadius:12,maxHeight:200,overflowY:"auto"}}>{exPickerList.filter(n=>!selExs.includes(n)).length===0&&<div style={{textAlign:"center",padding:"16px",color:c.sub,fontSize:13}}>No exercises in {exMuscle} yet</div>}{exPickerList.filter(n=>!selExs.includes(n)).map(name=>{var hasData=allEx.includes(name);return(<button key={name} onClick={()=>toggleEx(name)} style={{width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:"1px solid "+c.border,padding:"10px 12px",fontSize:13,color:hasData?c.text:c.sub,cursor:"pointer",fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:hasData?600:400}}><span>{name}</span>{!hasData&&<span style={{fontSize:10,color:c.sub,fontStyle:"italic"}}>no data yet</span>}</button>);})}</div>
          </div>}
          {selExs.length>0&&series.some(s=>s.data.length>0)
            ?<WeightChart series={series} c={c} unit={unit} W={340} H={160}/>
            :<div style={{textAlign:"center",padding:"28px 0 12px",color:c.sub,fontSize:13}}>{selExs.length===0?"Tap \"+ Add exercise\" to plot your progress over time.":"No data in this range."}</div>
          }
          {filteredHist.length===0&&hist.length>0&&<div style={{textAlign:"center",fontSize:12,color:c.am,marginTop:6}}>No workouts in range — try a wider range</div>}
        </CollapsibleSection>

        {/* Weekly Volume */}
        <CollapsibleSection title="Weekly Volume" icon={<IBarChart/>} sub={"Total "+unit+" lifted per week · "+weekBars.length+" week"+(weekBars.length!==1?"s":"")} c={c}>
          {/* Y-axis scale labels — 3 reference lines give instant context */}
          {weekBars.length>0&&(
            <div style={{display:"flex",alignItems:"stretch",gap:0,marginBottom:0}}>
              {/* Y-axis labels */}
              <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between",paddingBottom:18,paddingRight:4,flexShrink:0}}>
                <span style={{fontSize:8,color:c.sub,fontWeight:700,whiteSpace:"nowrap"}}>{maxVol>=1000?(Math.round(maxVol/100)/10)+"k":maxVol}</span>
                <span style={{fontSize:8,color:c.sub,fontWeight:700,whiteSpace:"nowrap"}}>{maxVol>=2000?(Math.round(maxVol/200)/10)+"k":Math.round(maxVol/2)}</span>
                <span style={{fontSize:8,color:c.sub,fontWeight:700}}>0</span>
              </div>
              <div style={{flex:1,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4,position:"relative"}}>
                {/* Horizontal reference lines */}
                <div style={{position:"absolute",left:0,right:0,top:0,height:90,pointerEvents:"none"}}>
                  {[0,0.5,1].map(pct=>(
                    <div key={pct} style={{position:"absolute",left:0,right:0,top:(1-pct)*90+"px",borderTop:"1px dashed "+c.border,opacity:0.5}}/>
                  ))}
                </div>
                <div style={{display:"flex",alignItems:"flex-end",gap:3,height:110,minWidth:weekBars.length*28}}>
                  {weekBars.map((w,i)=>{
                    const h=Math.max(w.vol/maxVol*90,3);
                    const isLast=i===weekBars.length-1;
                    const showLabel=weekBars.length<=16||(i===0||isLast||i%Math.ceil(weekBars.length/8)===0);
                    return(
                      <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flex:"0 0 auto",width:Math.max(20,Math.min(36,Math.floor(320/Math.min(weekBars.length,16))))+"px"}}>
                        <div style={{width:"100%",background:isLast?c.accent:c.accent+"66",borderRadius:"3px 3px 0 0",height:h+"px",transition:"height .4s"}} title={fmtD(w.date)+": "+w.vol+unit}/>
                        <div style={{fontSize:7,color:c.sub,whiteSpace:"nowrap",opacity:showLabel?1:0}}>{fmtD(w.date)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {weekBars.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:c.sub,fontSize:13}}>No data in this range</div>}
        </CollapsibleSection>

        {/* Muscle Frequency Heatmap */}
        {topMuscles.length>0&&<CollapsibleSection title="Muscle Frequency" icon={<IFlame/>} sub="Training frequency per muscle · last 8 weeks" c={c} defaultOpen={false}>
          <div style={{overflowX:"auto"}}>
            <div style={{minWidth:280}}>
              <div style={{display:"grid",gridTemplateColumns:"80px repeat(8,1fr)",gap:3,marginBottom:4}}>
                <div/>
                {muscleFreq.weeks.map((wk,i)=>(
                  <div key={wk} style={{fontSize:8,color:c.sub,textAlign:"center",fontWeight:700}}>{i===7?"Now":wk.slice(5)}</div>
                ))}
              </div>
              {topMuscles.map(m=>(
                <div key={m} style={{display:"grid",gridTemplateColumns:"80px repeat(8,1fr)",gap:3,marginBottom:3,alignItems:"center"}}>
                  <div style={{fontSize:10,color:c.sub,fontWeight:600,whiteSpace:"nowrap"}}>{m}</div>
                  {muscleFreq.weeks.map(wk=>{
                    const v=muscleFreq.freq[wk]?.[m]||0;
                    const intensity=v===0?0:Math.min(1,v/4);
                    return(
                      <div key={wk} title={m+" · "+wk+": "+v+" exercise"+(v!==1?"s":"")}
                        style={{height:22,borderRadius:4,background:v===0?c.card2:c.accent,opacity:v===0?0.3:0.2+intensity*0.8,transition:"opacity .2s",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {v>0&&<span style={{fontSize:8,fontWeight:800,color:"#fff"}}>{v}</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div style={{fontSize:10,color:c.sub,marginTop:6,textAlign:"right"}}>darker = more sessions</div>
            </div>
          </div>
        </CollapsibleSection>}

        {/* Muscle Volume Trend */}
        {hist.length>0&&<MuscleVolumeTrend hist={filteredHist} c={c} unit={unit}/>}

        {/* Muscle Balance Radar */}
        {hist.length>0&&<MuscleRadar hist={filteredHist} c={c} unit={unit}/>}

        {/* Strength Standards */}
        {hist.length>0&&<StrengthStandards hist={hist} c={c} unit={unit} bwKg={bwKg}/>}
      </>}

      {/* ══ BODY TAB ══════════════════════════════════════════════════════════ */}
      {pgTab==="body"&&<>
        {/* Body Weight Chart */}
        {bwLog.length>0?(
          <CollapsibleSection title="Body Weight" icon={<IScale/>}
            sub={<span style={{display:"flex",alignItems:"center",gap:6}}>
              <span>{effectiveBwUnit} · {bwLog.length} entr{bwLog.length===1?"y":"ies"}</span>
              {onSetBwUnit&&<button onClick={e=>{e.stopPropagation();onSetBwUnit(effectiveBwUnit==="kg"?"lb":"kg");}}
                style={{background:"rgba(124,110,250,0.18)",border:"1px solid rgba(124,110,250,0.35)",borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:800,cursor:"pointer",color:"#b0a0ff",fontFamily:"inherit",lineHeight:1.5}}>
                {effectiveBwUnit==="kg"?"→ lb":"→ kg"}
              </button>}
            </span>}
            badge={bwDisplay.length>=2?((bwDisplay[bwDisplay.length-1].y<=bwDisplay[0].y?"↓ ":"↑ ")+Math.abs(Math.round((bwDisplay[bwDisplay.length-1].y-bwDisplay[0].y)*10)/10)+effectiveBwUnit):undefined} c={c}>
            {bwDisplay.length>1&&<svg width="100%" viewBox={"0 0 "+BW+" "+(BH+24)} style={{display:"block",overflow:"visible",marginBottom:8}}>
              <defs><linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.g} stopOpacity="0.3"/><stop offset="100%" stopColor={c.g} stopOpacity="0"/></linearGradient></defs>
              <path d={bwPath+" L"+bpx(bwDisplay.length-1)+","+BH+" L0,"+BH+" Z"} fill="url(#bwGrad)"/>
              <path d={bwPath} fill="none" stroke={c.g} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {bwDisplay.map((p,i)=>{
                const show=bwDisplay.length<=8||(i===0||i===bwDisplay.length-1||i%Math.ceil(bwDisplay.length/5)===0);
                return(<g key={i}>
                  <circle cx={bpx(i)} cy={bpy(p.y)} r="3.5" fill={c.g}/>
                  {show&&<><text x={bpx(i)} y={bpy(p.y)-7} textAnchor="middle" fontSize="9" fill={c.sub}>{p.y}</text>
                  <text x={bpx(i)} y={BH+18} textAnchor="middle" fontSize="8" fill={c.sub}>{fmtD(p.date)}</text></>}
                </g>);
              })}
            </svg>}
            {bwDisplay.length===1&&<div style={{fontSize:13,color:c.sub,textAlign:"center",padding:"8px 0"}}>Log more entries to see your trend</div>}
            {/* Weight list — most recent 5, with delta vs previous entry */}
            <div style={{marginTop:4}}>
              {[...bwLog].reverse().slice(0,5).map((e,i,arr)=>{
                const disp=effectiveBwUnit==="lb"?Math.round(kgToLb(e.kg)*10)/10:e.kg;
                const prevKg=arr[i+1]?.kg;
                const delta=prevKg!=null?(effectiveBwUnit==="lb"?Math.round((kgToLb(e.kg)-kgToLb(prevKg))*10)/10:Math.round((e.kg-prevKg)*10)/10):null;
                const up=delta!=null&&delta>0,dn=delta!=null&&delta<0;
                return(
                  <div key={e.date} style={{display:"flex",alignItems:"center",padding:"7px 0",borderTop:"1px solid "+c.border,gap:8}}>
                    <span style={{fontSize:12,color:c.sub,flex:1}}>{fmtD(e.date)}</span>
                    {delta!=null&&<span style={{fontSize:11,fontWeight:700,color:dn?c.g:up?c.r:c.sub,minWidth:40,textAlign:"right"}}>{up?"+":""}{delta}{effectiveBwUnit}</span>}
                    <span style={{fontSize:14,fontWeight:800,color:c.text,minWidth:64,textAlign:"right"}}>{disp} <span style={{fontSize:10,color:c.sub,fontWeight:500}}>{effectiveBwUnit}</span></span>
                    <button onClick={()=>onDeleteBW(e.date)} style={{background:"none",border:"none",cursor:"pointer",color:c.r,padding:"4px",display:"flex",alignItems:"center",minHeight:44,minWidth:44,justifyContent:"center"}}><ITrash/></button>
                  </div>
                );
              })}
              {bwLog.length>5&&<div style={{fontSize:11,color:c.sub,textAlign:"center",padding:"6px 0"}}>+ {bwLog.length-5} more entries</div>}
            </div>
          </CollapsibleSection>
        ):(
          <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:18,padding:"28px 20px",textAlign:"center",marginBottom:16}}>
            
            <div style={{fontSize:15,fontWeight:700,color:c.text,marginBottom:6}}>No body weight logged</div>
            <div style={{fontSize:13,color:c.sub}}>Log your weight on the Home screen to see your trend here.</div>
          </div>
        )}

        {/* Body Measurements */}
        <CollapsibleSection title="Body Measurements" icon={<IRuler/>} sub={measLog.length>0?"Last: "+fmtD(measLog[measLog.length-1].date)+" · "+mUnit:"Log chest, waist, arms & more"} c={c} defaultOpen={measLog.length>0}>
          <div style={{display:"flex",gap:4,background:c.card2,borderRadius:10,padding:3,marginBottom:12,width:"fit-content"}}>
            {["cm","in"].map(u=><button key={u} onClick={()=>saveMeasUnit(u)} style={{border:"none",borderRadius:7,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:mUnit===u?c.accent:"none",color:mUnit===u?"#fff":c.sub}}>{u}</button>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            {MEAS_FIELDS.map(f=>(
              <div key={f.k}>
                <div style={{fontSize:10,color:c.sub,fontWeight:700,marginBottom:3}}>{f.l.toUpperCase()} ({mUnit})</div>
                <input type="number" inputMode="decimal" value={measInputs[f.k]||""} onChange={e=>setMeasInputs(p=>({...p,[f.k]:e.target.value}))}
                  placeholder="—"
                  style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:10,padding:"8px 10px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
          <button onClick={()=>{
            const entry={};let any=false;
            MEAS_FIELDS.forEach(f=>{if(measInputs[f.k]&&parseFloat(measInputs[f.k])>0){entry[f.k]=parseFloat(measInputs[f.k]);any=true;}});
            if(!any)return;
            onLogMeas(entry);setMeasInputs({});
          }} style={{width:"100%",background:c.accent,border:"none",borderRadius:12,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",marginBottom:12,minHeight:44}}>Save Measurements</button>
          {MEAS_FIELDS.map(f=>{
            const pts=measLog.filter(e=>e[f.k]!=null).map(e=>({date:e.date,y:e[f.k]}));
            if(pts.length<2)return null;
            const delta=Math.round((pts[pts.length-1].y-pts[0].y)*10)/10;
            return(
              <div key={f.k} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:700,color:c.text}}>{f.l}</span>
                  <span style={{fontSize:12,color:delta<=0?c.g:c.r,fontWeight:700}}>{delta>0?"+":""}{delta} {mUnit}</span>
                </div>
                {(()=>{
                  const W2=300,H2=40;
                  const mn=Math.min(...pts.map(p=>p.y)),mx=Math.max(...pts.map(p=>p.y)),rng=mx-mn||1;
                  const px2=i=>(i/(pts.length-1))*W2;
                  const py2=v=>H2-((v-mn)/rng)*(H2*0.8)-H2*0.1;
                  let d2="M"+px2(0)+","+py2(pts[0].y);
                  for(let i=1;i<pts.length;i++){const cx=(px2(i-1)+px2(i))/2;d2+=" C"+cx+","+py2(pts[i-1].y)+" "+cx+","+py2(pts[i].y)+" "+px2(i)+","+py2(pts[i].y);}
                  return<svg width="100%" viewBox={"0 0 "+W2+" "+H2} style={{display:"block"}}>
                    <path d={d2} fill="none" stroke={delta<=0?c.g:c.r} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx={px2(pts.length-1)} cy={py2(pts[pts.length-1].y)} r="3" fill={delta<=0?c.g:c.r}/>
                  </svg>;
                })()}
              </div>
            );
          })}
          {measLog.length>0&&<div style={{maxHeight:120,overflowY:"auto",marginTop:8}}>
            {[...measLog].reverse().slice(0,5).map(e=>(
              <div key={e.date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderTop:"1px solid "+c.border}}>
                <span style={{fontSize:11,color:c.sub}}>{fmtD(e.date)}</span>
                <span style={{fontSize:11,color:c.text,flex:1,marginLeft:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{MEAS_FIELDS.filter(f=>e[f.k]!=null).map(f=>f.l+": "+e[f.k]+mUnit).join(" · ")}</span>
                {onDeleteMeas&&<button onClick={()=>onDeleteMeas(e.date)} style={{background:"none",border:"none",cursor:"pointer",color:c.r,padding:"0 4px",display:"flex",alignItems:"center",flexShrink:0}}><ITrash/></button>}
              </div>
            ))}
          </div>}
        </CollapsibleSection>
      </>}

      {/* ══ ACTIVITY TAB ══════════════════════════════════════════════════════ */}
      {pgTab==="activity"&&<>
        {/* Streak stats */}
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[
            {label:"Streak",val:curStreak+"d",col:c.accent},
            {label:"Best",val:bestStreak+"d",col:c.g},
            {label:"This Year",val:thisYear,col:c.sub},
          ].map(s=>(
            <div key={s.label} style={{flex:1,background:c.card,border:"1px solid "+c.border,borderRadius:16,padding:"12px 8px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:900,color:s.col,lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:9,color:c.sub,marginTop:4,fontWeight:700,letterSpacing:"0.04em"}}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Workout Calendar */}
        {hist.length>0&&<CalendarCard hist={hist} c={c} unit={unit}/>}

        {/* Workout Duration */}
        {durationData.length>=2&&<CollapsibleSection title="Session Duration" icon={<IClock/>} sub={"Avg "+avgDur+" min · "+durationData.length+" session"+(durationData.length!==1?"s":"")} c={c}>
          <svg width="100%" viewBox={"0 0 "+DW+" "+(DH+24)} style={{display:"block",overflow:"visible",marginBottom:4}}>
            <defs><linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.accent} stopOpacity="0.25"/><stop offset="100%" stopColor={c.accent} stopOpacity="0"/></linearGradient></defs>
            {dPath&&<path d={dPath+" L"+dpx(durationData.length-1)+","+DH+" L0,"+DH+" Z"} fill="url(#dGrad)"/>}
            {dPath&&<path d={dPath} fill="none" stroke={c.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
            {durationData.map((p,i)=>{
              const show=durationData.length<=8||(i===0||i===durationData.length-1||i%Math.ceil(durationData.length/5)===0);
              return(<g key={i}>
                <circle cx={dpx(i)} cy={dpy(p.y)} r="3" fill={c.accent}/>
                {show&&<><text x={dpx(i)} y={dpy(p.y)-7} textAnchor="middle" fontSize="9" fill={c.sub}>{p.y}m</text>
                <text x={dpx(i)} y={DH+18} textAnchor="middle" fontSize="8" fill={c.sub}>{fmtD(p.date)}</text></>}
              </g>);
            })}
          </svg>
        </CollapsibleSection>}

        {/* Cardio Summary */}
        {cardioSessions.length>0&&<CollapsibleSection title="Cardio Summary" icon={<IActivity/>}
          sub={cardioSessions.length+" session"+(cardioSessions.length!==1?"s":"")+" · "+Math.round(totalCardioMins)+"min"+(totalCardioDist>0?" · "+Math.round(totalCardioDist*10)/10+"km":"")} c={c}>
          {cardioWeekly.length>1&&<>
            <div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.06em",marginBottom:8}}>WEEKLY DURATION (MIN)</div>
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4,marginBottom:14}}>
              <div style={{display:"flex",alignItems:"flex-end",gap:3,height:80,minWidth:cardioWeekly.length*28}}>
                {cardioWeekly.map((w,i)=>{
                  const h=Math.max(w.mins/maxCardioMins*70,3);
                  const isLast=i===cardioWeekly.length-1;
                  const showLabel=cardioWeekly.length<=12||(i===0||isLast||i%Math.ceil(cardioWeekly.length/6)===0);
                  return(
                    <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flex:"0 0 auto",width:Math.max(20,Math.min(36,Math.floor(320/Math.min(cardioWeekly.length,12))))+"px"}}>
                      <div style={{fontSize:7,color:isLast?c.g:c.sub,fontWeight:700,whiteSpace:"nowrap"}}>{Math.round(w.mins)}</div>
                      <div style={{width:"100%",background:isLast?c.g:c.g+"66",borderRadius:"3px 3px 0 0",height:h+"px",transition:"height .4s"}} title={fmtD(w.date)+": "+Math.round(w.mins)+"min"}/>
                      <div style={{fontSize:7,color:c.sub,whiteSpace:"nowrap",opacity:showLabel?1:0}}>{fmtD(w.date)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>}
          <div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.06em",marginBottom:6}}>RECENT SESSIONS</div>
          {cardioSessions.slice(0,8).map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:"1px solid "+c.border}}>
              <div style={{minWidth:0,flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:c.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.names.join(", ")}</div>
                <div style={{fontSize:10,color:c.sub}}>{fmtD(s.date)}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                {s.mins>0&&<div style={{fontSize:13,fontWeight:800,color:c.g}}>{Math.round(s.mins)} min</div>}
                {s.dist>0&&<div style={{fontSize:11,color:c.sub}}>{Math.round(s.dist*10)/10} km</div>}
              </div>
            </div>
          ))}
        </CollapsibleSection>}

        {hist.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:c.sub,fontSize:14}}>Log workouts to see your activity data.</div>}
      </>}
    </div>
  );
}
