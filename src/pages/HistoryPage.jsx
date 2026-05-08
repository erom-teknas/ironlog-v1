import React, { useState, memo } from 'react';
import { today, fmtD, calcVol, kgToLb, bestRM, calc1RM, fmtVol, isCardioEx } from '../utils';
import { uid } from '../utils';
import { useConfirm } from '../hooks.jsx';
import { IChev, ITrash, IShare, IActivity } from '../icons';
import { Empty, PBtn, GBtn, DBtn } from '../components/Primitives';
import { CC } from '../constants';
import ShareCard from '../components/ShareCard';

// Mini sparkline — shows weight trend for one exercise across all history
const Sparkline=memo(function Sparkline({name,hist,unit,c}){
  const pts=React.useMemo(()=>{
    const out=[];
    hist.forEach(w=>{
      const ex=w.exercises.find(e=>e.name===name);
      if(!ex||!ex.sets.length)return;
      const best=Math.max(...ex.sets.map(s=>parseFloat(s.weight)||0));
      if(best>0)out.push(unit==="lb"?Math.round(kgToLb(best)*4)/4:best);
    });
    return out;
  },[name,hist,unit]);
  if(pts.length<2)return null;
  const W=52,H=20,min=Math.min(...pts),max=Math.max(...pts),range=max-min||1;
  const px=i=>(i/(pts.length-1))*W;
  const py=v=>H-((v-min)/range)*(H*0.8)-H*0.1;
  let d="M"+px(0)+","+py(pts[0]);
  for(let i=1;i<pts.length;i++){const cpx=(px(i-1)+px(i))/2;d+=" C"+cpx+","+py(pts[i-1])+" "+cpx+","+py(pts[i])+" "+px(i)+","+py(pts[i]);}
  const trend=pts[pts.length-1]>=pts[0];
  const col=trend?c.g:c.r;
  return(
    <svg width={W} height={H} viewBox={"0 0 "+W+" "+H} style={{flexShrink:0,opacity:0.85}}>
      <path d={d} fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={px(pts.length-1)} cy={py(pts[pts.length-1])} r="2" fill={col}/>
    </svg>
  );
});

const PAGE = 20;

export default function HistoryPage({hist,c,unit="kg",onDelete,onExportCSV,onRepeat,onSaveAsPlan,customPlans=[],bwKg=0}){
  const [open,setOpen]=useState(null);
  const [share,setShare]=useState(null);
  const [savedPlanToast,setSavedPlanToast]=useState(null); // workout id that was just saved

  // Convert a logged workout into a custom plan template
  const saveAsPlan=(w)=>{
    // Check if already saved to avoid duplicates
    const alreadySaved=customPlans.some(p=>p.sourceId===w.id);
    if(alreadySaved){setSavedPlanToast(w.id);setTimeout(()=>setSavedPlanToast(null),2500);return;}
    const col=CC[Math.floor(Math.random()*CC.length)];
    const plan={
      id:uid(),
      sourceId:w.id, // track origin so we can warn on re-save
      name:w.name||"Saved Workout",
      tag:"Custom",
      col,
      block:"Saved",
      exercises:w.exercises.map(ex=>({
        id:uid(),
        name:ex.name,
        muscle:ex.muscle,
        isCardio:ex.isCardio||false,
        bodyweight:ex.bodyweight||false,
        barType:ex.barType||"barbell",
        sets:ex.sets.map(s=>({
          id:uid(),
          reps:s.reps||"",
          weight:s.weight||"",
          label:s.label||"Working",
          bodyweight:s.bodyweight||false,
        })),
      })),
    };
    onSaveAsPlan(plan);
    setSavedPlanToast(w.id);
    setTimeout(()=>setSavedPlanToast(null),2500);
  };
  const [search,setSearch]=useState("");
  const [visibleCount,setVisibleCount]=useState(PAGE);
  const {confirm:dlgConfirm,confirmEl}=useConfirm(c);
  const filtered=React.useMemo(()=>{
    if(!search.trim())return [...hist].reverse();
    var q=search.toLowerCase();
    return [...hist].reverse().filter(w=>{
      if((w.name||"").toLowerCase().includes(q))return true;
      if((w.notes||"").toLowerCase().includes(q))return true;
      if(fmtD(w.date).toLowerCase().includes(q))return true;
      if(w.exercises&&w.exercises.some(e=>(e.name||"").toLowerCase().includes(q)))return true;
      if(w.exercises&&w.exercises.some(e=>(e.muscle||"").toLowerCase().includes(q)))return true;
      if(w.exercises&&w.exercises.some(e=>(e.notes||"").toLowerCase().includes(q)))return true;
      return false;
    });
  },[hist,search]);
  const grouped=React.useMemo(()=>{
    if(search.trim())return [{label:null,items:filtered}];
    const now=new Date();const todayStr=today();
    const startOfWeek=new Date(now);startOfWeek.setDate(now.getDate()-now.getDay());startOfWeek.setHours(0,0,0,0);
    const startOfLastWeek=new Date(startOfWeek);startOfLastWeek.setDate(startOfLastWeek.getDate()-7);
    const groups={};
    filtered.forEach(w=>{
      const d=new Date(w.date+"T00:00:00");
      let label;
      if(w.date===todayStr)label="Today";
      else if(d>=startOfWeek)label="This Week";
      else if(d>=startOfLastWeek)label="Last Week";
      else label=d.toLocaleDateString("en-US",{month:"long",year:"numeric"});
      if(!groups[label])groups[label]=[];
      groups[label].push(w);
    });
    return Object.entries(groups).map(([label,items])=>({label,items}));
  },[filtered]);
  if(!hist.length)return <Empty icon="📋" title="No workouts yet" sub="Start logging to see your history." c={c}/>;
  return(
    <div style={{padding:"20px 16px 100px"}}>
      {confirmEl}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h2 style={{fontSize:23,fontWeight:900,margin:0,color:c.text,letterSpacing:"-0.02em"}}>History</h2>
        {onExportCSV&&<button onClick={onExportCSV} disabled={!hist.length} style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",color:c.sub,fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,opacity:hist.length?1:0.4}}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </button>}
      </div>
      {/* Search bar */}
      <div style={{position:"relative",marginBottom:14}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setOpen(null);setVisibleCount(PAGE);}}
          placeholder="Search workouts, exercises, muscles, notes…"
          style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:12,padding:"10px 36px 10px 14px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:c.sub,fontSize:16,lineHeight:1,padding:4}}>×</button>}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:"32px 0",color:c.sub,fontSize:14}}>No workouts match "{search}"</div>}
      {(()=>{
        let shown=0;
        return grouped.map(({label,items})=>{
          const visible=items.filter(()=>shown++<visibleCount);
          if(!visible.length)return null;
          return(<div key={label||"search"}>
            {label&&<div style={{fontSize:11,fontWeight:800,color:c.sub,letterSpacing:"0.08em",marginBottom:8,marginTop:4,paddingLeft:2}}>{label.toUpperCase()}</div>}
            {visible.map((w,vi)=>{
        const v=w.exercises.reduce((s,e)=>s+calcVol(e.sets),0),isO=open===w.id;
        return(
          <div key={w.id} className="il-fade-up" style={{background:c.card,border:"1px solid "+c.border,borderRadius:19,marginBottom:11,overflow:"hidden",animationDelay:(vi*0.04)+"s"}}>
            <button onClick={()=>setOpen(isO?null:w.id)} style={{width:"100%",background:"none",border:"none",padding:"14px 15px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",WebkitTapHighlightColor:"rgba(124,110,250,0.1)"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:14,color:c.text,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.name}</div>
                <div style={{display:"flex",gap:6,fontSize:12,color:c.sub,flexWrap:"wrap",alignItems:"center"}}>
                  <span>{fmtD(w.date)}</span>
                  <span style={{color:c.border}}>·</span>
                  <span>{w.exercises.length} exercises</span>
                  <span style={{color:c.border}}>·</span>
                  <span>{fmtVol(unit==="lb"?Math.round(kgToLb(v)):v)} {unit}</span>
                  {w.duration>0&&<><span style={{color:c.border}}>·</span><span>{Math.floor(w.duration/60)}m {w.duration%60}s</span></>}
                  {w.rating>0&&<span>{"⭐".repeat(w.rating)}</span>}
                </div>
              </div>
              <div style={{color:c.sub,transform:isO?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",flexShrink:0,marginLeft:8,opacity:0.6}}><IChev/></div>
            </button>
            {isO&&<div style={{borderTop:"1px solid "+c.border,padding:"12px 15px 15px"}}>
              {w.exercises.map((ex,i)=>{
                const isC=ex.isCardio!=null?!!ex.isCardio:isCardioEx(ex.name,ex.muscle);
                const rm=!isC?bestRM(ex.sets,bwKg):0;
                // Cardio totals for header summary
                const totalMins=isC?ex.sets.reduce((s,x)=>s+(parseFloat(x.mins)||0),0):0;
                const totalDist=isC?ex.sets.reduce((s,x)=>s+(parseFloat(x.dist)||0),0):0;
                return<div key={i} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div style={{fontWeight:700,fontSize:13,color:c.text}}>
                      {isC&&<span style={{display:"flex",color:c.g,marginRight:4}}><IActivity/></span>}
                      {ex.name}
                      {!isC&&rm>0&&<span style={{fontSize:11,color:c.sub,marginLeft:7}}>~1RM {unit==="lb"?Math.round(kgToLb(rm)*4)/4:rm}{unit}</span>}
                      {isC&&totalMins>0&&<span style={{fontSize:11,color:c.sub,marginLeft:7}}>{totalMins}min{totalDist>0?" · "+Math.round(totalDist*10)/10+"km":""}</span>}
                    </div>
                    {!isC&&<Sparkline name={ex.name} hist={hist} unit={unit} c={c}/>}
                  </div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {ex.sets.map((s,j)=>{
                      // Label colour — handles both strength and cardio labels
                      const lc=s.label==="Warm-up"?c.am
                        :s.label==="Drop set"?c.r
                        :s.label==="Intervals"?c.am
                        :s.label==="Sprint"?c.r
                        :c.sub;
                      // Pill text — cardio shows duration/distance; strength shows weight×reps
                      const pillText=isC
                        ?((s.mins||"0")+"min"+(s.dist?" · "+s.dist+"km":""))
                        :(s.bodyweight?"BW":(unit==="lb"?Math.round(kgToLb(parseFloat(s.weight)||0)*4)/4:parseFloat(s.weight)||0)+unit)+"×"+(s.reps||"0");
                      const showLabel=s.label&&s.label!=="Working"&&s.label!=="Steady";
                      return<div key={j} style={{background:c.card2,borderRadius:7,padding:"4px 9px",fontSize:11,color:lc,fontWeight:600,display:"flex",alignItems:"center",gap:3}}>
                        <span>{pillText}</span>
                        {showLabel&&<span style={{fontSize:9,opacity:0.7}}>{s.label}</span>}
                      </div>;
                    })}
                  </div>
                  {ex.notes&&<div style={{fontSize:11,color:c.sub,marginTop:5,fontStyle:"italic",lineHeight:1.4}}>{ex.notes}</div>}
                </div>;
              })}
              {w.notes&&<div style={{background:c.card2,borderRadius:11,padding:"9px 11px",fontSize:13,color:c.sub,marginBottom:11,fontStyle:"italic"}}>"{w.notes}"</div>}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {onRepeat&&<PBtn onClick={()=>onRepeat(w)} c={c} style={{width:"100%",justifyContent:"center",fontSize:15,padding:"13px 20px",letterSpacing:"-0.01em"}}>Repeat Workout</PBtn>}
                {onSaveAsPlan&&(()=>{
                  const already=customPlans.some(p=>p.sourceId===w.id);
                  const justSaved=savedPlanToast===w.id;
                  return(
                    <button onClick={()=>saveAsPlan(w)}
                      style={{width:"100%",background:justSaved?c.gs:already?c.card2:c.as,border:"1.5px solid "+(justSaved?c.g:already?c.border:c.accent),borderRadius:14,padding:"12px 20px",fontSize:14,fontWeight:700,cursor:"pointer",color:justSaved?c.g:already?c.sub:c.accent,fontFamily:"inherit",letterSpacing:"-0.01em",transition:"all .2s"}}>
                      {justSaved?"✓ Saved to Plans":already?"↑ Already in Plans":"↑ Save as Plan"}
                    </button>
                  );
                })()}
                <div style={{display:"flex",gap:7}}>
                  <GBtn onClick={()=>setShare(w)} c={c} style={{flex:1,justifyContent:"center",fontSize:13}}><IShare/>Share</GBtn>
                  <DBtn onClick={()=>dlgConfirm("Delete \""+w.name+"\"?\nThis cannot be undone.").then(ok=>{if(ok){onDelete(w.id);setOpen(null);}})} c={c} style={{flex:1,justifyContent:"center",fontSize:13}}><ITrash/>Delete</DBtn>
                </div>
              </div>
            </div>}
          </div>
        );
      })}
          </div>);
        });
      })()}
      {filtered.length>visibleCount&&(
        <div style={{marginBottom:12}}>
          <div style={{textAlign:"center",fontSize:11,color:c.sub,fontWeight:600,marginBottom:8,letterSpacing:"0.04em"}}>
            Showing {Math.min(visibleCount,filtered.length)} of {filtered.length} workouts
          </div>
          <div style={{background:c.card2,borderRadius:8,height:3,overflow:"hidden",marginBottom:12}}>
            <div style={{height:"100%",width:Math.round((Math.min(visibleCount,filtered.length)/filtered.length)*100)+"%",background:"linear-gradient(90deg,#7C6EFA,#a89dff)",borderRadius:8,transition:"width .3s ease"}}/>
          </div>
          <button onClick={()=>setVisibleCount(v=>v+PAGE)} style={{width:"100%",background:"rgba(124,110,250,0.1)",border:"1.5px solid rgba(124,110,250,0.35)",borderRadius:14,padding:"13px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#9b8ffc",fontFamily:"inherit",letterSpacing:"-0.01em",transition:"background .15s"}}>
            Load {Math.min(PAGE,filtered.length-visibleCount)} more ↓
          </button>
        </div>
      )}
      {share&&<ShareCard workout={share} c={c} unit={unit} bwKg={bwKg} onClose={()=>setShare(null)}/>}
    </div>
  );
}
