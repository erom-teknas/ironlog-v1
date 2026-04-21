import React, { useState } from 'react';
import { PCOL_LB, PCOL } from '../constants';
import { getStreak, calcVol, today, fmtD, kgToLb, lbToKg } from '../utils';
import CollapsibleSection from '../components/CollapsibleSection';
import MuscleMap from '../components/MuscleMap';
import QRTransfer, { QRImportReceiver } from '../components/QRTransfer';
import { IPlus, IGrid } from '../icons';

export default function HomePage({hist,dark,c,unit="kg",onBlank,onRoutine,onBackup,onImport,onImportData,bwLog=[],onLogBW,gymPlates=[],onSetGymPlates,lastSnapshot="",customRoutines=[],customExercises={},reminderDays=0,onSetReminderDays,bwUnit,onSetBwUnit}){
  const effectiveBwUnit=bwUnit||unit;
  const [showQR,setShowQR]=useState(false);
  const [showQRImport,setShowQRImport]=useState(false);
  const [bwInput,setBwInput]=useState("");
  const handleQRImport=(data)=>{if(onImportData)onImportData(data);};
  const streak=getStreak(hist),now=new Date();
  const weekVol=hist.filter(w=>(now-new Date(w.date))/86400000<=7).reduce((s,w)=>s+w.exercises.reduce((a,e)=>a+calcVol(e.sets),0),0);
  const last=hist.length?hist[hist.length-1]:null;
  const todayM=[...new Set(hist.filter(w=>w.date===today()).flatMap(w=>w.exercises.map(e=>e.muscle)))];
  const hr=new Date().getHours(),greet=hr<12?"Good morning":hr<17?"Good afternoon":"Good evening";
  const insights=[];
  if(hist.length){
    const ds={};[...hist].reverse().forEach(w=>w.exercises.forEach(e=>{if(!ds[e.muscle])ds[e.muscle]=Math.floor((now-new Date(w.date))/86400000);}));
    Object.entries(ds).forEach(([m,d])=>{if(d>=5)insights.push({msg:m+" not trained in "+d+" days 💤",col:"am"});});
    if(weekVol>4000)insights.push({msg:"Strong week — "+(unit==="lb"?Math.round(kgToLb(weekVol)/1000)+"k lb":Math.round(weekVol/1000)+"k kg")+" lifted 🔥",col:"g"});
    if(streak>=3)insights.push({msg:streak+"-day streak! Keep going 🏆",col:"ac"});
  }
  return(<>
    <div style={{paddingBottom:32}}>
      <div style={{background:dark?"linear-gradient(155deg,#1e1b4b,#0c0c12)":"linear-gradient(155deg,#312e81,#1e1b4b)",borderRadius:"0 0 32px 32px",padding:"20px 20px 30px",color:"#fff",marginBottom:18}}>
        <p style={{margin:"0 0 4px",fontSize:11,color:"#a89dff",fontWeight:700,letterSpacing:"0.1em"}}>{greet.toUpperCase()}</p>
        <h1 style={{margin:"0 0 22px",fontSize:28,fontWeight:900,letterSpacing:"-0.03em",lineHeight:1.1}}>{hist.length===0?"Let's get to work.":"Ready to crush it? 💪"}</h1>
        <div style={{display:"flex",gap:9}}>
          {[
            {l:"STREAK",v:streak>0?streak+"d":"—",e:"🔥"},
            {l:"THIS WEEK",v:weekVol>0?(unit==="lb"?Math.round(kgToLb(weekVol)/1000)+"k lb":Math.round(weekVol/1000)+"k kg"):"—",e:"📦"},
            {l:"SESSIONS",v:hist.length||"—",e:"🏅"}
          ].map(s=><div key={s.l} style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:16,padding:"13px 6px",textAlign:"center"}}><div style={{fontSize:20,marginBottom:2}}>{s.e}</div><div style={{fontSize:18,fontWeight:900,lineHeight:1}}>{s.v}</div><div style={{fontSize:9,color:"rgba(168,157,255,0.85)",marginTop:3,fontWeight:700,letterSpacing:"0.08em"}}>{s.l}</div></div>)}
        </div>
      </div>
      <div style={{padding:"0 16px"}}>
        {insights.slice(0,3).map((ins,i)=><div key={i} style={{background:ins.col==="g"?c.gs:ins.col==="am"?c.ams:c.as,borderRadius:13,padding:"11px 13px",marginBottom:8,fontSize:13,color:ins.col==="g"?c.g:ins.col==="am"?c.am:c.at,fontWeight:600}}>{ins.msg}</div>)}
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          <button onClick={onBlank} style={{flex:1,background:c.accent,color:"#fff",border:"none",borderRadius:20,padding:"17px 12px",fontSize:14,fontWeight:800,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:4,fontFamily:"inherit",boxShadow:"0 6px 20px "+c.accent+"44"}}><IPlus/><span>Blank Workout</span><span style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontWeight:400}}>Start fresh</span></button>
          <button onClick={onRoutine} style={{flex:1,background:c.card,color:c.text,border:"1.5px solid "+c.border,borderRadius:20,padding:"17px 12px",fontSize:14,fontWeight:800,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:4,fontFamily:"inherit"}}><IGrid/><span>Use Routine</span><span style={{fontSize:11,color:c.sub,fontWeight:400}}>Pick a template</span></button>
        </div>
        <CollapsibleSection title="Today's Muscles" icon="💪" sub={todayM.length?todayM.join(" · "):"Nothing logged yet"} c={c}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{flex:1,fontSize:13,color:c.sub,lineHeight:1.6}}>{todayM.length?todayM.join(" · "):"Nothing yet — start a workout!"}</div>
            <div style={{width:76,flexShrink:0}}><MuscleMap trained={todayM} c={c}/></div>
          </div>
        </CollapsibleSection>

        {last&&<CollapsibleSection title="Last Workout" icon="🏋️" sub={last.name?last.name+" · "+fmtD(last.date):fmtD(last.date)} c={c}>
          {last.exercises.slice(0,3).map((ex,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"6px 0",borderTop:"1px solid "+c.border,color:c.sub}}><span style={{color:c.text,fontWeight:600}}>{ex.name}</span><span>{ex.sets.length} sets · {unit==="lb"?kgToLb(Math.max(...ex.sets.map(s=>parseFloat(s.weight)||0))):Math.max(...ex.sets.map(s=>parseFloat(s.weight)||0))}{unit}</span></div>)}
          {last.exercises.length>3&&<div style={{fontSize:12,color:c.sub,marginTop:5}}>+{last.exercises.length-3} more</div>}
        </CollapsibleSection>}

        {/* ── Body Weight Log ── */}
        <CollapsibleSection title="Body Weight" icon="⚖️"
          sub={<span style={{display:"flex",alignItems:"center",gap:6}}>
            <span>{bwLog.length>0?"Latest: "+(effectiveBwUnit==="lb"?Math.round(kgToLb(bwLog[bwLog.length-1].kg)*10)/10:bwLog[bwLog.length-1].kg)+effectiveBwUnit:"Log your weight"}</span>
            {onSetBwUnit&&<button onClick={e=>{e.stopPropagation();onSetBwUnit(effectiveBwUnit==="kg"?"lb":"kg");}}
              style={{background:"rgba(124,110,250,0.15)",border:"1px solid rgba(124,110,250,0.3)",borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:800,cursor:"pointer",color:"#b0a0ff",fontFamily:"inherit",lineHeight:1.5}}>
              {effectiveBwUnit==="kg"?"→ lb":"→ kg"}
            </button>}
          </span>} c={c}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="number" inputMode="decimal" value={bwInput} onChange={e=>setBwInput(e.target.value)}
              placeholder={"Weight in "+effectiveBwUnit+"…"}
              style={{flex:1,background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"9px 12px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>{
              var n=parseFloat(bwInput);
              var maxW=effectiveBwUnit==="lb"?700:320;var minW=effectiveBwUnit==="lb"?45:20;
              if(!n||n<minW||n>maxW){setBwInput("");return;}
              onLogBW(effectiveBwUnit==="lb"?Math.round(lbToKg(n)*100)/100:n);
              setBwInput("");
            }} style={{background:c.accent,border:"none",borderRadius:11,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",flexShrink:0}}>Log</button>
          </div>
          {bwInput&&(parseFloat(bwInput)<(effectiveBwUnit==="lb"?44:20)||parseFloat(bwInput)>(effectiveBwUnit==="lb"?700:320))&&
            <div style={{fontSize:11,color:c.r,marginTop:5}}>Enter a valid weight ({effectiveBwUnit==="lb"?"44–700 lb":"20–320 kg"})</div>
          }
        </CollapsibleSection>

        {/* ── My Plates ── */}
        {onSetGymPlates&&(()=>{
          const PCOL_USE=unit==="lb"?PCOL_LB:PCOL;
          const FALLBACK_COLS=["#ef4444","#3b82f6","#f59e0b","#22c55e","#8b5cf6","#ec4899","#94a3b8","#f97316","#06b6d4","#84cc16","#a78bfa","#fb7185","#34d399","#fbbf24","#60a5fa"];
          const STANDARD_KG=[25,20,15,10,5,2.5,1.25,0.5,0.25];
          const STANDARD_LB=[55,45,35,25,15,10,5,2.5,1.25];
          const standardList=unit==="lb"?STANDARD_LB:STANDARD_KG;
          const customPlatesKg=gymPlates.filter(p=>!STANDARD_KG.some(s=>Math.abs(s-p)<0.01));
          const ownedCount=gymPlates.length;
          return(
            <CollapsibleSection title="My Plates" icon="🔵" sub={(unit==="lb"?"lb":"kg")+" · "+ownedCount+" plate"+(ownedCount!==1?"s":"")+" selected · tap to toggle"} c={c} defaultOpen={false}>
              <div style={{fontSize:12,color:c.sub,marginBottom:12,lineHeight:1.5}}>Tap a plate to add/remove it from your gym kit. Only selected plates appear in the + weight picker during workouts.</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
                {standardList.map((p,i)=>{
                  const pKg=unit==="lb"?lbToKg(p):p;
                  const owned=gymPlates.some(g=>Math.abs(g-pKg)<0.01);
                  const col=PCOL_USE[p]||FALLBACK_COLS[i%FALLBACK_COLS.length];
                  return(
                    <button key={p} onClick={()=>onSetGymPlates(prev=>{
                      const already=prev.some(g=>Math.abs(g-pKg)<0.01);
                      return already?prev.filter(g=>Math.abs(g-pKg)>0.01):[...prev,pKg].sort((a,b)=>b-a);
                    })} style={{width:50,height:50,borderRadius:"50%",border:"3px solid "+(owned?col:"transparent"),background:owned?col:c.card2,color:owned?"#fff":c.sub,fontSize:11,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",opacity:owned?1:0.35,flexShrink:0}}>
                      {p}
                    </button>
                  );
                })}
              </div>
              {customPlatesKg.length>0&&<div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.07em",marginBottom:6}}>MY CUSTOM PLATES</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  {customPlatesKg.map((pKg,i)=>{
                    const disp=unit==="lb"?Math.round(kgToLb(pKg)*4)/4:pKg;
                    return(
                      <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                        <div style={{width:50,height:50,borderRadius:"50%",background:FALLBACK_COLS[(i+9)%FALLBACK_COLS.length],display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:900}}>{disp}</div>
                        <button onClick={()=>onSetGymPlates(prev=>prev.filter(g=>Math.abs(g-pKg)>0.01))}
                          style={{background:c.rs,border:"none",borderRadius:6,padding:"2px 8px",fontSize:10,cursor:"pointer",color:c.r,fontFamily:"inherit"}}>✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>}
              <div style={{display:"flex",gap:8,alignItems:"center",marginTop:8}}>
                <input type="number" inputMode="decimal" id="custom-plate-input" placeholder={"Custom plate ("+(unit==="lb"?"lb":"kg")+")…"}
                  style={{flex:1,background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"8px 12px",fontSize:13,color:c.text,outline:"none",fontFamily:"inherit"}}/>
                <button onClick={()=>{
                  const inp=document.getElementById("custom-plate-input");
                  const v=parseFloat(inp&&inp.value);
                  if(!v||v<=0||v>500)return;
                  const vKg=unit==="lb"?lbToKg(v):v;
                  onSetGymPlates(prev=>{
                    if(prev.some(g=>Math.abs(g-vKg)<0.01))return prev;
                    return[...prev,vKg].sort((a,b)=>b-a);
                  });
                  if(inp)inp.value="";
                }} style={{background:c.accent,border:"none",borderRadius:11,padding:"8px 14px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",flexShrink:0}}>+ Add</button>
              </div>
            </CollapsibleSection>
          );
        })()}

        {/* ── Workout Reminder ── */}
        {'Notification' in window&&<CollapsibleSection title="Workout Reminder" icon="🔔" sub={reminderDays?("Remind after "+reminderDays+" rest day"+(reminderDays===1?"":"s")):"Off — tap to enable"} c={c} defaultOpen={false}>
          <div style={{fontSize:12,color:c.sub,marginBottom:12,lineHeight:1.6}}>Get a push notification if you haven't trained in N days. Fires at 9am on the day you're overdue. Requires notification permission.</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {[0,1,2,3,4,5,7].map(d=>(
              <button key={d} onClick={()=>{
                if(d>0&&Notification.permission!=='granted'){
                  Notification.requestPermission().then(p=>{if(p==='granted')onSetReminderDays(d);});
                } else {
                  onSetReminderDays(d);
                }
              }} style={{border:"none",borderRadius:20,padding:"7px 13px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:reminderDays===d?c.accent:c.card2,color:reminderDays===d?"#fff":c.sub}}>
                {d===0?"Off":d+"d"}
              </button>
            ))}
          </div>
          {reminderDays>0&&Notification.permission!=='granted'&&<div style={{fontSize:11,color:c.am,background:c.ams,borderRadius:9,padding:"7px 10px"}}>⚠️ Notification permission not granted — tap a day option above to request it.</div>}
          {reminderDays>0&&Notification.permission==='granted'&&<div style={{fontSize:11,color:c.g,background:c.gs,borderRadius:9,padding:"7px 10px"}}>✅ Reminders on — you'll be notified if you skip {reminderDays}+ day{reminderDays===1?"":"s"}.</div>}
        </CollapsibleSection>}

        {/* ── Backup & Restore ── */}
        <CollapsibleSection title="Backup & Restore" icon="💾" sub={lastSnapshot?"Last auto-snapshot: "+fmtD(lastSnapshot):"Auto-saves daily to your device"} c={c} defaultOpen={false}>
          <div style={{fontSize:12,color:c.sub,marginBottom:8,lineHeight:1.6}}>
            IronLog <strong style={{color:c.g}}>auto-saves a snapshot to your device every day</strong> — no action needed. You can also export to a file for off-device storage (iCloud, Google Drive etc.).
          </div>
          {lastSnapshot&&<div style={{fontSize:11,color:c.g,marginBottom:10,background:c.gs,borderRadius:10,padding:"7px 11px"}}>✅ Last auto-snapshot: {fmtD(lastSnapshot)}</div>}
          <div style={{display:"flex",gap:9,marginBottom:9}}>
            <button onClick={onBackup} disabled={!hist.length} style={{flex:1,background:c.accent,color:"#fff",border:"none",borderRadius:13,padding:"11px 8px",fontSize:13,fontWeight:700,cursor:hist.length?"pointer":"not-allowed",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:hist.length?1:0.5}}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export File
            </button>
            <label style={{flex:1,background:c.card2,color:c.text,border:"1px solid "+c.border,borderRadius:13,padding:"11px 8px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Restore File
              <input type="file" accept=".json" onChange={onImport} style={{display:"none"}}/>
            </label>
          </div>
          <div style={{display:"flex",gap:9}}>
            <button onClick={()=>setShowQR(true)} disabled={!hist.length} style={{flex:1,background:c.card2,color:c.text,border:"1px solid "+c.border,borderRadius:13,padding:"10px 8px",fontSize:13,fontWeight:700,cursor:hist.length?"pointer":"not-allowed",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:hist.length?1:0.5}}>
              📱 QR Export
            </button>
            <button onClick={()=>setShowQRImport(true)} style={{flex:1,background:c.card2,color:c.text,border:"1px solid "+c.border,borderRadius:13,padding:"10px 8px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              📷 QR Import
            </button>
          </div>
          <div style={{fontSize:11,color:c.sub,marginTop:10,textAlign:"center"}}>{hist.length} workout{hist.length!==1?"s":""} stored</div>
        </CollapsibleSection>
      </div>
    </div>
    {showQR&&<QRTransfer hist={hist} customRoutines={customRoutines} bwLog={bwLog} customExercises={customExercises} c={c} onClose={()=>setShowQR(false)}/>}
    {showQRImport&&<QRImportReceiver c={c} onImport={handleQRImport} onClose={()=>setShowQRImport(false)}/>}
  </>);
}
