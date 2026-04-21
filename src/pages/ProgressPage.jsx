import React, { useState } from 'react';
import { MG, CC } from '../constants';
import { calcVol, bestRM, kgToLb, weekKey, fmtD, getStreak } from '../utils';
import { ITrash, IScale, ITrendUp, IBarChart, IClock, IFlame, IRuler } from '../icons';
import { Empty } from '../components/Primitives';
import CollapsibleSection from '../components/CollapsibleSection';
import WeightChart from '../components/WeightChart';
import MuscleVolumeTrend from '../components/MuscleVolumeTrend';
import CalendarCard from '../components/CalendarCard';
import StrengthStandards from '../components/StrengthStandards';
import MuscleRadar from '../components/MuscleRadar';

const MEAS_FIELDS=[{k:"chest",l:"Chest"},{k:"waist",l:"Waist"},{k:"hips",l:"Hips"},{k:"biceps",l:"Biceps"},{k:"thighs",l:"Thighs"}];

export default function ProgressPage({hist,c,unit="kg",bwLog=[],onLogBW,onDeleteBW,customExercises={},measLog=[],onLogMeas,onDeleteMeas,measUnit="cm",bwKg=0,bwUnit,onSetBwUnit}){
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

  const now=new Date();
  const rangeMs={"1m":30*864e5,"3m":90*864e5,"6m":180*864e5,"1y":365*864e5,"all":Infinity};
  const filteredHist=React.useMemo(()=>{
    const cutoff=rangeMs[range];
    if(cutoff===Infinity)return hist;
    return hist.filter(w=>(now-new Date(w.date))<=cutoff);
  },[hist,range]);

  if(!hist.length&&!bwLog.length&&!measLog.length)return <Empty icon="📈" title="No data yet" sub="Log workouts to see progress charts." c={c}/>;

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
    return [...new Set([...logged,...custom])].sort();
  },[allLoggedByMuscle,customExercises,exMuscle]);
  const allEx=React.useMemo(()=>[...new Set(hist.flatMap(w=>w.exercises.map(e=>e.name)))].sort(),[hist]);
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

  return(
    <div style={{padding:"20px 16px 100px"}}>
      <h2 style={{fontSize:23,fontWeight:900,margin:"0 0 4px",color:c.text,letterSpacing:"-0.02em"}}>Progress</h2>
      <p style={{fontSize:13,color:c.sub,marginBottom:14}}>Track your weights, volume and strength over time.</p>

      {/* Time range filter */}
      <div style={{display:"flex",gap:6,marginBottom:18,background:c.card2,borderRadius:12,padding:4}}>
        {RANGES.map(r=><button key={r.k} onClick={()=>setRange(r.k)} style={{flex:1,border:"none",borderRadius:9,padding:"6px 4px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:range===r.k?c.accent:"none",color:range===r.k?"#fff":c.sub,transition:"all .2s"}}>{r.l}</button>)}
      </div>

      {/* Body Weight Chart — with independent unit toggle */}
      {bwLog.length>0&&(
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
          <div style={{maxHeight:120,overflowY:"auto"}}>
            {[...bwLog].reverse().slice(0,6).map(e=>(
              <div key={e.date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderTop:"1px solid "+c.border}}>
                <span style={{fontSize:12,color:c.sub}}>{fmtD(e.date)}</span>
                <span style={{fontSize:13,fontWeight:700,color:c.text}}>{effectiveBwUnit==="lb"?Math.round(kgToLb(e.kg)*10)/10:e.kg} {effectiveBwUnit}</span>
                <button onClick={()=>onDeleteBW(e.date)} style={{background:"none",border:"none",cursor:"pointer",color:c.r,padding:"0 4px",display:"flex",alignItems:"center"}}><ITrash/></button>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {hist.length>0&&<>
      {/* Weight progression chart */}
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
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:8}}>{MG.map(m=><button key={m} onClick={()=>setExMuscle(m)} style={{flexShrink:0,border:"none",borderRadius:20,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:exMuscle===m?c.accent:c.card2,color:exMuscle===m?"#fff":c.sub}}>{m}</button>)}</div>
          <div style={{background:c.card2,borderRadius:12,maxHeight:200,overflowY:"auto"}}>{exPickerList.filter(n=>!selExs.includes(n)).length===0&&<div style={{textAlign:"center",padding:"16px",color:c.sub,fontSize:13}}>No exercises in {exMuscle} yet</div>}{exPickerList.filter(n=>!selExs.includes(n)).map(name=>{var hasData=allEx.includes(name);return(<button key={name} onClick={()=>toggleEx(name)} style={{width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:"1px solid "+c.border,padding:"10px 12px",fontSize:13,color:hasData?c.text:c.sub,cursor:"pointer",fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:hasData?600:400}}><span>{name}</span>{!hasData&&<span style={{fontSize:10,color:c.sub,fontStyle:"italic"}}>no data yet</span>}</button>);})}</div>
        </div>}
        {selExs.length>0&&series.some(s=>s.data.length>0)
          ?<WeightChart series={series} c={c} unit={unit} W={340} H={160}/>
          :<div style={{textAlign:"center",padding:"28px 0 12px",color:c.sub,fontSize:13}}>{selExs.length===0?"Tap \"+ Add exercise\" above to plot your weight over time.":"No data in this time range."}</div>
        }
        {filteredHist.length===0&&hist.length>0&&<div style={{textAlign:"center",fontSize:12,color:c.am,marginTop:6}}>No workouts in range — try a wider range above</div>}
      </CollapsibleSection>

      {/* Weekly volume */}
      <CollapsibleSection title="Weekly Volume" icon={<IBarChart/>} sub={"Total "+unit+" lifted per week · "+weekBars.length+" week"+(weekBars.length!==1?"s":"")} c={c}>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:3,height:110,minWidth:weekBars.length*28}}>
            {weekBars.map((w,i)=>{
              const h=Math.max(w.vol/maxVol*90,3);
              const isLast=i===weekBars.length-1;
              const showLabel=weekBars.length<=16||(i===0||isLast||i%Math.ceil(weekBars.length/8)===0);
              return(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flex:"0 0 auto",width:Math.max(20,Math.min(36,Math.floor(320/Math.min(weekBars.length,16))))+"px"}}>
                  <div style={{fontSize:7,color:isLast?c.accent:c.sub,fontWeight:700,whiteSpace:"nowrap"}}>{w.vol>=1000?Math.round(w.vol/100)/10+"k":w.vol}</div>
                  <div style={{width:"100%",background:isLast?c.accent:c.accent+"66",borderRadius:"3px 3px 0 0",height:h+"px",transition:"height .4s",cursor:"default"}} title={fmtD(w.date)+": "+w.vol+unit}/>
                  <div style={{fontSize:7,color:c.sub,whiteSpace:"nowrap",opacity:showLabel?1:0}}>{fmtD(w.date)}</div>
                </div>
              );
            })}
          </div>
        </div>
        {weekBars.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:c.sub,fontSize:13}}>No data in this range</div>}
      </CollapsibleSection>

      {/* Workout Duration Trend */}
      {durationData.length>=2&&<CollapsibleSection title="Workout Duration" icon={<IClock/>} sub={"Avg "+avgDur+" min · "+durationData.length+" session"+(durationData.length!==1?"s":"")} c={c} defaultOpen={false}>
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

      {/* Muscle Frequency Heatmap */}
      {topMuscles.length>0&&<CollapsibleSection title="Muscle Frequency" icon={<IFlame/>} sub="Training frequency per muscle · last 8 weeks" c={c} defaultOpen={false}>
        <div style={{overflowX:"auto"}}>
          <div style={{minWidth:280}}>
            {/* Week labels */}
            <div style={{display:"grid",gridTemplateColumns:"70px repeat(8,1fr)",gap:3,marginBottom:4}}>
              <div/>
              {muscleFreq.weeks.map((wk,i)=>(
                <div key={wk} style={{fontSize:8,color:c.sub,textAlign:"center",fontWeight:700}}>{i===7?"This\nwk":wk.slice(5)}</div>
              ))}
            </div>
            {topMuscles.map(m=>(
              <div key={m} style={{display:"grid",gridTemplateColumns:"70px repeat(8,1fr)",gap:3,marginBottom:3,alignItems:"center"}}>
                <div style={{fontSize:10,color:c.sub,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m}</div>
                {muscleFreq.weeks.map(wk=>{
                  const v=muscleFreq.freq[wk]?.[m]||0;
                  const intensity=v===0?0:Math.min(1,v/4);
                  return(
                    <div key={wk} title={m+" · "+wk+": "+v+" exercise"+(v!==1?"s":"")}
                      style={{height:22,borderRadius:4,background:v===0?c.card2:c.accent,opacity:v===0?0.3:0.2+intensity*0.8,transition:"opacity .2s",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {v>0&&<span style={{fontSize:8,fontWeight:800,color:v===0?c.border:"#fff"}}>{v}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
            <div style={{fontSize:10,color:c.sub,marginTop:6,textAlign:"right"}}>darker = more sessions</div>
          </div>
        </div>
      </CollapsibleSection>}

      {/* Muscle Group Volume Trend */}
      {hist.length>0&&<MuscleVolumeTrend hist={filteredHist} c={c} unit={unit}/>}

      {/* Muscle Balance Radar */}
      {hist.length>0&&<MuscleRadar hist={filteredHist} c={c} unit={unit}/>}

      {/* Strength Standards */}
      {hist.length>0&&<StrengthStandards hist={hist} c={c} unit={unit} bwKg={bwKg}/>}

      {/* Activity Streak Stats — compact row above calendar */}
      {hist.length>0&&(()=>{
        const curStreak=getStreak(hist);
        // Best streak calculation
        const dates=[...new Set(hist.map(w=>w.date))].sort();
        let best=dates.length?1:0,run=1;
        for(let i=1;i<dates.length;i++){
          const prev=new Date(dates[i-1]);prev.setDate(prev.getDate()+1);
          if(prev.toISOString().slice(0,10)===dates[i]){run++;if(run>best)best=run;}
          else run=1;
        }
        const yearStart=new Date().getFullYear()+'-01-01';
        const thisYear=hist.filter(w=>w.date>=yearStart).length;
        return(
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {[
              {label:"Current Streak",val:curStreak+" day"+(curStreak!==1?"s":""),col:c.accent},
              {label:"Best Streak",val:best+" day"+(best!==1?"s":""),col:c.g},
              {label:"This Year",val:thisYear+" session"+(thisYear!==1?"s":""),col:c.sub},
            ].map(s=>(
              <div key={s.label} style={{flex:1,background:c.card,border:"1px solid "+c.border,borderRadius:14,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:15,fontWeight:900,color:s.col,lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:9,color:c.sub,marginTop:3,fontWeight:600}}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Workout Calendar */}
      {hist.length>0&&<CalendarCard hist={hist} c={c} unit={unit}/>}

      </>}

      {/* Body Measurements */}
      <CollapsibleSection title="Body Measurements" icon={<IRuler/>} sub={measLog.length>0?"Last: "+fmtD(measLog[measLog.length-1].date)+" · "+mUnit:"Log chest, waist, arms & more"} c={c} defaultOpen={false}>
        {/* Unit toggle */}
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
          const entry={};
          let any=false;
          MEAS_FIELDS.forEach(f=>{if(measInputs[f.k]&&parseFloat(measInputs[f.k])>0){entry[f.k]=parseFloat(measInputs[f.k]);any=true;}});
          if(!any)return;
          onLogMeas(entry);
          setMeasInputs({});
        }} style={{width:"100%",background:c.accent,border:"none",borderRadius:12,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",marginBottom:12}}>Save Measurements</button>
        {/* Show trends per field */}
        {MEAS_FIELDS.map(f=>{
          const pts=measLog.filter(e=>e[f.k]!=null).map(e=>({date:e.date,y:e[f.k]}));
          if(pts.length<2)return null;
          const latest=pts[pts.length-1].y;
          const first=pts[0].y;
          const delta=Math.round((latest-first)*10)/10;
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
              <span style={{fontSize:11,color:c.text,flex:1,marginLeft:8}}>{MEAS_FIELDS.filter(f=>e[f.k]!=null).map(f=>f.l+": "+e[f.k]+mUnit).join(" · ")}</span>
              {onDeleteMeas&&<button onClick={()=>onDeleteMeas(e.date)} style={{background:"none",border:"none",cursor:"pointer",color:c.r,padding:"0 4px",display:"flex",alignItems:"center"}}><ITrash/></button>}
            </div>
          ))}
        </div>}
      </CollapsibleSection>
    </div>
  );
}
