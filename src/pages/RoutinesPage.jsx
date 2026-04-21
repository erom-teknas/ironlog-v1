import React, { useState } from 'react';
import { MG, EX, TMPLS } from '../constants';
import { uid, today, kgToLb, lbToKg } from '../utils';
import { useConfirm } from '../hooks.jsx';
import { IPlus, ITrash, IX, IChev } from '../icons';
import { PBtn, GBtn } from '../components/Primitives';
import DragSortList from '../components/DragSortList';
import SwipeToDelete from '../components/SwipeToDelete';

export default function RoutinesPage({c,unit="kg",onUse,customRoutines,onSaveCustom,onDeleteCustom,customExercises={},onAddCustomEx,onDeleteCustomEx,onRenameCustomEx}){
  const {confirm:dlgConfirm,confirmEl}=useConfirm(c);
  const [open,setOpen]=useState(null);
  const [editing,setEditing]=useState(null);
  const allRoutines=[...TMPLS.map(t=>({...t,builtin:true})),...customRoutines.map(t=>({...t,builtin:false}))];

  // ── Editor state ──────────────────────────────────────────────────────────
  const [scheduleMode,setScheduleMode]=useState(false);
  const [weekPlan,setWeekPlan]=useState(()=>{try{return JSON.parse(localStorage.getItem("il_week_plan")||"{}");}catch{return{};}});
  const [schedDay,setSchedDay]=useState(null);
  const saveWeekPlan=(plan)=>{setWeekPlan(plan);try{localStorage.setItem("il_week_plan",JSON.stringify(plan));}catch{}};
  const BLOCKS=["Hypertrophy","Strength","Peaking","Maintenance","Cut","Deload","Custom"];
  const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const blankRoutine=()=>({id:uid(),name:"",tag:"Custom",col:"#7C6EFA",block:"Hypertrophy",exercises:[]});
  const [form,setForm]=useState(blankRoutine());
  const [exPicker,setExPicker]=useState(false);
  const [exMg,setExMg]=useState(MG[0]);
  const [newExNameR,setNewExNameR]=useState("");
  const [editingExR,setEditingExR]=useState(null);
  const [editExValR,setEditExValR]=useState("");

  const openNew=()=>{setForm(blankRoutine());setEditing("new");};
  const openEdit=(t)=>{setForm({...t,exercises:t.exercises.map(e=>({...e,sets:e.sets.map(s=>({...s}))}))});setEditing(t.id);};
  const closeEditor=()=>{setEditing(null);setExPicker(false);setNewExNameR("");setEditingExR(null);};

  const addExToForm=(name)=>{
    // Default: 1 warm-up set + 3 working sets for compound exercises
    var isCompound=["Squat","Deadlift","Bench Press","Overhead Press","Bent-Over Row","Pull-Up","Lat Pulldown"].includes(name);
    var defaultSets=isCompound
      ?[{reps:10,weight:unit==="lb"?lbToKg(45):20,label:"Warm-up"},{reps:8,weight:unit==="lb"?lbToKg(45):20,label:"Working"},{reps:8,weight:unit==="lb"?lbToKg(45):20,label:"Working"},{reps:8,weight:unit==="lb"?lbToKg(45):20,label:"Working"}]
      :[{reps:8,weight:unit==="lb"?lbToKg(45):20,label:"Working"},{reps:8,weight:unit==="lb"?lbToKg(45):20,label:"Working"},{reps:8,weight:unit==="lb"?lbToKg(45):20,label:"Working"}];
    setForm(f=>({...f,exercises:[...f.exercises,{id:uid(),name,muscle:exMg,sets:defaultSets}]}));
    setExPicker(false);
  };
  const removeExFromForm=(i)=>setForm(f=>({...f,exercises:f.exercises.filter((_,j)=>j!==i)}));
  const updSet=(ei,si,field,val)=>setForm(f=>({...f,exercises:f.exercises.map((e,i)=>i!==ei?e:{...e,sets:e.sets.map((s,j)=>j!==si?s:{...s,[field]:field==="reps"?parseInt(val)||0:field==="label"?val:parseFloat(val)||0})})}));
  const addSetToEx=(ei)=>setForm(f=>({...f,exercises:f.exercises.map((e,i)=>{if(i!==ei)return e;const l=e.sets[e.sets.length-1]||{reps:8,weight:20,label:"Working"};return{...e,sets:[...e.sets,{...l}]};})}));
  const removeSetFromEx=(ei,si)=>setForm(f=>({...f,exercises:f.exercises.map((e,i)=>i!==ei?e:{...e,sets:e.sets.filter((_,j)=>j!==si)})}));

  const saveForm=()=>{
    if(!form.name.trim()){dlgConfirm("Please give your routine a name.").then(()=>{});return;}
    if(!form.exercises.length){dlgConfirm("Add at least one exercise before saving.").then(()=>{});return;}
    onSaveCustom({...form,name:form.name.trim()});
    closeEditor();
  };

  const COLORS=["#7C6EFA","#34d399","#fbbf24","#f87171","#06b6d4","#ec4899","#a78bfa","#fb923c"];

  // ── Editor screen ──────────────────────────────────────────────────────────
  if(editing!==null){return(
    <div style={{padding:"20px 16px 120px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button onClick={closeEditor} style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"7px 12px",fontSize:13,fontWeight:700,cursor:"pointer",color:c.text,fontFamily:"inherit"}}>← Back</button>
        <h2 style={{margin:0,fontSize:20,fontWeight:900,color:c.text,letterSpacing:"-0.02em",flex:1}}>{editing==="new"?"New Routine":"Edit Routine"}</h2>
        <PBtn onClick={saveForm} c={c} style={{padding:"8px 16px",fontSize:13}}>Save</PBtn>
      </div>

      {/* Name */}
      <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:18,padding:"14px 15px",marginBottom:13}}>
        <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:7,letterSpacing:"0.05em"}}>ROUTINE NAME</div>
        <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Monday Push" style={{background:"none",border:"none",fontSize:17,fontWeight:800,color:c.text,outline:"none",fontFamily:"inherit",width:"100%",letterSpacing:"-0.01em"}}/>
      </div>

      {/* Color + tag */}
      <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:18,padding:"14px 15px",marginBottom:13}}>
        <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:10,letterSpacing:"0.05em"}}>COLOUR & CATEGORY</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:11}}>
          {COLORS.map(col=><button key={col} onClick={()=>setForm(f=>({...f,col}))} style={{width:28,height:28,borderRadius:"50%",background:col,border:form.col===col?"3px solid "+c.text:"3px solid transparent",cursor:"pointer",padding:0,flexShrink:0}}/>)}
        </div>
        <input value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value}))} placeholder="Category (e.g. PPL, Split, Custom…)" style={{background:c.card2,border:"1.5px solid "+c.border,borderRadius:10,padding:"8px 11px",fontSize:13,color:c.text,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box",marginBottom:10}}/>
        <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:7,letterSpacing:"0.05em"}}>PERIODIZATION BLOCK</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {BLOCKS.map(b=><button key={b} onClick={()=>setForm(f=>({...f,block:b}))} style={{border:"none",borderRadius:20,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:(form.block||"Hypertrophy")===b?c.accent:c.card2,color:(form.block||"Hypertrophy")===b?"#fff":c.sub}}>{b}</button>)}
        </div>
      </div>

      {/* Exercises */}
      <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:18,padding:"14px 15px",marginBottom:13}}>
        <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:12,letterSpacing:"0.05em"}}>EXERCISES</div>
        <DragSortList items={form.exercises} onReorder={arr=>setForm(f=>({...f,exercises:arr}))} keyFn={(ex,ei)=>ex.id||ei} c={c} renderItem={(ex,ei,dragHandle)=>(
          <div style={{background:c.card2,borderRadius:14,padding:"12px 13px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              {dragHandle}
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:14,color:c.text}}>{ex.name}</div>
                <div style={{fontSize:11,color:c.sub,marginTop:1}}>{ex.muscle}</div>
              </div>
              <button onClick={()=>removeExFromForm(ei)} style={{background:c.rs,border:"none",borderRadius:10,padding:"10px 14px",cursor:"pointer",color:c.r,display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,flexShrink:0}}><ITrash/> Remove</button>
            </div>
            {/* Sets */}
            <div style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr 30px",gap:5,marginBottom:6}}>
              {["Type",unit,"Reps",""].map((h,i)=><div key={i} style={{fontSize:10,color:c.sub,fontWeight:700,textAlign:"center"}}>{h}</div>)}
            </div>
            {ex.sets.map((s,si)=>(
              <div key={si} style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr 30px",gap:5,marginBottom:5,alignItems:"center"}}>
                <select value={s.label||"Working"} onChange={e=>updSet(ei,si,"label",e.target.value)}
                  style={{background:s.label==="Warm-up"?c.ams:s.label==="Drop set"?c.rs:c.card,border:"1.5px solid "+(s.label==="Warm-up"?c.am:s.label==="Drop set"?c.r:c.border),borderRadius:9,padding:"4px 3px",fontSize:10,color:s.label==="Warm-up"?c.am:s.label==="Drop set"?c.r:c.sub,outline:"none",width:"100%",fontFamily:"inherit",cursor:"pointer"}}>
                  <option value="Warm-up">Warm-up</option>
                  <option value="Working">Working</option>
                  <option value="Drop set">Drop set</option>
                </select>
                <input type="number" inputMode="decimal" value={unit==="lb"?Math.round(kgToLb(s.weight)*4)/4:s.weight} onChange={e=>updSet(ei,si,"weight",unit==="lb"?lbToKg(parseFloat(e.target.value)||0):parseFloat(e.target.value)||0)} placeholder="0" style={{background:c.card,border:"1.5px solid "+c.border,borderRadius:9,padding:"7px 4px",fontSize:13,color:c.text,outline:"none",width:"100%",boxSizing:"border-box",textAlign:"center",fontFamily:"inherit"}}/>
                <input type="number" inputMode="numeric" value={s.reps} onChange={e=>updSet(ei,si,"reps",e.target.value)} placeholder="0" style={{background:c.card,border:"1.5px solid "+c.border,borderRadius:9,padding:"7px 4px",fontSize:13,color:c.text,outline:"none",width:"100%",boxSizing:"border-box",textAlign:"center",fontFamily:"inherit"}}/>
                <button onClick={()=>removeSetFromEx(ei,si)} style={{background:"none",border:"none",cursor:"pointer",color:c.sub,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}><IX/></button>
              </div>
            ))}
            <button onClick={()=>addSetToEx(ei)} style={{width:"100%",marginTop:3,background:"none",border:"1.5px dashed "+c.border,borderRadius:9,padding:"6px",fontSize:12,color:c.sub,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>+ Add set</button>
          </div>
        )}/>
        <button onClick={()=>setExPicker(true)} style={{width:"100%",background:"none",border:"2px dashed "+c.border,borderRadius:14,padding:14,fontSize:13,color:c.sub,cursor:"pointer",fontFamily:"inherit",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:4}}><IPlus/> Add Exercise</button>
      </div>

      {/* Exercise picker modal */}
      {exPicker&&<div onClick={()=>{setExPicker(false);setNewExNameR("");setEditingExR(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:200,display:"flex",alignItems:"flex-end"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:c.card,borderRadius:"24px 24px 0 0",padding:"20px 16px 48px",width:"100%",maxHeight:"80vh",overflowY:"auto",boxSizing:"border-box"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{margin:0,fontSize:18,fontWeight:900,color:c.text}}>Add Exercise</h3>
            <button onClick={()=>{setExPicker(false);setNewExNameR("");setEditingExR(null);}} style={{background:c.card2,border:"none",borderRadius:9,padding:8,cursor:"pointer",color:c.sub,display:"flex"}}><IX/></button>
          </div>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,marginBottom:12}}>
            {MG.map(m=><button key={m} onClick={()=>{setExMg(m);setNewExNameR("");setEditingExR(null);}} style={{flexShrink:0,border:"none",borderRadius:20,padding:"6px 13px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:exMg===m?c.accent:c.card2,color:exMg===m?"#fff":c.sub}}>{m}</button>)}
          </div>
          {/* Custom exercises */}
          {(customExercises[exMg]||[]).length>0&&<div style={{marginBottom:8}}>
            <div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.08em",marginBottom:6,paddingLeft:4}}>MY EXERCISES — swipe left to delete</div>
            {(customExercises[exMg]||[]).map(name=>(
              <SwipeToDelete key={name} onDelete={()=>onDeleteCustomEx(exMg,name)} c={c}>
                {editingExR===name
                  ?<div style={{flex:1,display:"flex",alignItems:"center",gap:6,padding:"8px 4px"}}>
                    <input autoFocus value={editExValR} onChange={e=>setEditExValR(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"){onRenameCustomEx(exMg,name,editExValR);setEditingExR(null);}if(e.key==="Escape")setEditingExR(null);}}
                      style={{flex:1,background:c.card2,border:"1.5px solid "+c.accent,borderRadius:9,padding:"6px 10px",fontSize:13,color:c.text,outline:"none",fontFamily:"inherit"}}/>
                    <button onClick={()=>{onRenameCustomEx(exMg,name,editExValR);setEditingExR(null);}} style={{background:c.accent,border:"none",borderRadius:8,padding:"6px 11px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit"}}>Save</button>
                    <button onClick={()=>setEditingExR(null)} style={{background:c.card2,border:"none",borderRadius:8,padding:"6px 10px",fontSize:12,cursor:"pointer",color:c.sub,fontFamily:"inherit"}}>✕</button>
                  </div>
                  :<>
                    <button onClick={()=>addExToForm(name)} style={{flex:1,textAlign:"left",background:"none",border:"none",padding:"12px 4px",fontSize:14,color:c.accent,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>★ {name}</button>
                    <button onClick={()=>{setEditingExR(name);setEditExValR(name);}} style={{background:"none",border:"none",padding:"8px 10px",cursor:"pointer",color:c.sub,fontSize:12,fontFamily:"inherit"}}>Edit</button>
                  </>
                }
              </SwipeToDelete>
            ))}
          </div>}
          {/* Add new custom exercise */}
          <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
            <input value={newExNameR} onChange={e=>setNewExNameR(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&newExNameR.trim()){onAddCustomEx(exMg,newExNameR.trim());setNewExNameR("");}}}
              placeholder={"Add custom "+exMg+" exercise…"}
              style={{flex:1,background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"9px 12px",fontSize:13,color:c.text,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>{if(newExNameR.trim()){onAddCustomEx(exMg,newExNameR.trim());setNewExNameR("");}}} disabled={!newExNameR.trim()} style={{background:newExNameR.trim()?c.accent:c.muted,border:"none",borderRadius:11,padding:"9px 14px",fontSize:13,fontWeight:700,cursor:newExNameR.trim()?"pointer":"default",color:newExNameR.trim()?"#fff":c.sub,fontFamily:"inherit",flexShrink:0}}>Add</button>
          </div>
          {(customExercises[exMg]||[]).length>0&&<div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.08em",marginBottom:6,paddingLeft:4}}>BUILT-IN</div>}
          {EX[exMg].map(name=><button key={name} onClick={()=>addExToForm(name)} style={{width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:"1px solid "+c.border,padding:"13px 4px",fontSize:14,color:c.text,cursor:"pointer",fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:500}}>{name}<IChev/></button>)}
        </div>
      </div>}
    </div>
  );}

  // ── List screen ───────────────────────────────────────────────────────────
  return(
    <div style={{padding:"20px 16px 100px"}}>
      {confirmEl}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <h2 style={{fontSize:23,fontWeight:900,margin:"0 0 4px",color:c.text,letterSpacing:"-0.02em"}}>Routines</h2>
          <p style={{fontSize:13,color:c.sub,margin:0}}>Built-in & your own programs.</p>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0,marginTop:2}}>
          <button onClick={()=>setScheduleMode(s=>!s)} style={{background:scheduleMode?c.accent+"22":c.card2,border:"1px solid "+(scheduleMode?c.accent:c.border),borderRadius:10,padding:"7px 11px",fontSize:12,fontWeight:700,cursor:"pointer",color:scheduleMode?c.accent:c.sub,fontFamily:"inherit"}}>📅 Schedule</button>
          <PBtn onClick={openNew} c={c} style={{padding:"9px 14px",fontSize:13}}><IPlus/> New</PBtn>
        </div>
      </div>

      {/* ── Weekly Schedule View ── */}
      {scheduleMode&&<div style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:"16px",marginBottom:18}}>
        <div style={{fontWeight:800,fontSize:15,color:c.text,marginBottom:12}}>📅 Weekly Program</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:12}}>
          {DAYS.map(day=>{
            const rid=weekPlan[day];
            const r=allRoutines.find(x=>x.id===rid);
            return(
              <div key={day} onClick={()=>setSchedDay(schedDay===day?null:day)}
                style={{background:r?r.col+"22":c.card2,border:"2px solid "+(schedDay===day?c.accent:r?r.col+"55":c.border),borderRadius:12,padding:"8px 4px",textAlign:"center",cursor:"pointer",minHeight:64,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,transition:"border-color .15s"}}>
                <div style={{fontSize:10,fontWeight:800,color:c.sub}}>{day.toUpperCase()}</div>
                {r?<>
                  <div style={{width:8,height:8,borderRadius:"50%",background:r.col}}/>
                  <div style={{fontSize:8,fontWeight:700,color:r.col,lineHeight:1.2,textAlign:"center",wordBreak:"break-word"}}>{r.name}</div>
                </>:<div style={{fontSize:16,color:c.border}}>+</div>}
              </div>
            );
          })}
        </div>
        {schedDay&&<div>
          <div style={{fontSize:12,color:c.sub,marginBottom:8,fontWeight:700}}>{schedDay} — assign a routine:</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <button onClick={()=>{saveWeekPlan({...weekPlan,[schedDay]:null});setSchedDay(null);}} style={{background:c.rs,border:"none",borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",color:c.r,fontFamily:"inherit"}}>✕ Rest day</button>
            {allRoutines.map(r=>(
              <button key={r.id} onClick={()=>{saveWeekPlan({...weekPlan,[schedDay]:r.id});setSchedDay(null);}}
                style={{background:r.col+"22",border:"1px solid "+r.col+"55",borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",color:r.col,fontFamily:"inherit"}}>{r.name}</button>
            ))}
          </div>
        </div>}
      </div>}

      {/* Built-in routines */}
      {TMPLS.length>0&&<div style={{fontSize:11,color:c.sub,fontWeight:700,letterSpacing:"0.07em",marginBottom:10}}>BUILT-IN</div>}
      {TMPLS.map(t=>{const isO=open===t.id;return(
        <div key={t.id} style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:"15px 14px",marginBottom:11}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:isO?11:0}}>
            <div><span style={{background:t.col+"22",color:t.col,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}>{t.tag}</span><div style={{fontWeight:900,fontSize:17,color:c.text,marginTop:4,letterSpacing:"-0.02em"}}>{t.name}</div><div style={{fontSize:12,color:c.sub,marginTop:1}}>{t.exercises.length} exercises</div></div>
            <div style={{display:"flex",gap:6}}><GBtn onClick={()=>setOpen(isO?null:t.id)} c={c} style={{padding:"7px 10px",fontSize:11}}>{isO?"Hide":"Preview"}</GBtn><PBtn onClick={()=>onUse(t)} c={c} style={{padding:"7px 13px",fontSize:12}}>Start</PBtn></div>
          </div>
          {isO&&<div style={{borderTop:"1px solid "+c.border,paddingTop:10}}>{t.exercises.map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"7px 0",borderBottom:"1px solid "+c.border,color:c.sub}}><span style={{color:c.text,fontWeight:600}}>{e.name}</span><span>{e.sets.length}×{e.sets[0].reps} @ {unit==="lb"?Math.round(kgToLb(e.sets[0].weight)):e.sets[0].weight}{unit}</span></div>)}</div>}
        </div>
      );})}

      {/* Custom routines */}
      {customRoutines.length>0&&<div style={{fontSize:11,color:c.sub,fontWeight:700,letterSpacing:"0.07em",margin:"18px 0 10px"}}>MY ROUTINES</div>}
      {customRoutines.map(t=>{const isO=open===t.id;return(
        <div key={t.id} style={{background:c.card,border:"1px solid "+t.col+"55",borderRadius:20,padding:"15px 14px",marginBottom:11}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:isO?11:0}}>
            <div><div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:3}}><span style={{background:t.col+"22",color:t.col,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}>{t.tag||"Custom"}</span>{t.block&&<span style={{background:c.card2,color:c.sub,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}>{t.block}</span>}</div><div style={{fontWeight:900,fontSize:17,color:c.text,marginTop:2,letterSpacing:"-0.02em"}}>{t.name}</div><div style={{fontSize:12,color:c.sub,marginTop:1}}>{t.exercises.length} exercises</div></div>
            <div style={{display:"flex",gap:6}}>
              <GBtn onClick={()=>setOpen(isO?null:t.id)} c={c} style={{padding:"7px 10px",fontSize:11}}>{isO?"Hide":"Preview"}</GBtn>
              <GBtn onClick={()=>openEdit(t)} c={c} style={{padding:"7px 10px",fontSize:11}}>Edit</GBtn>
              <PBtn onClick={()=>onUse(t)} c={c} style={{padding:"7px 13px",fontSize:12}}>Start</PBtn>
            </div>
          </div>
          {isO&&<div style={{borderTop:"1px solid "+c.border,paddingTop:10}}>
            {t.exercises.map((e,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"7px 0",borderBottom:"1px solid "+c.border,color:c.sub}}><span style={{color:c.text,fontWeight:600}}>{e.name}</span><span>{e.sets.length}×{e.sets[0].reps} @ {unit==="lb"?Math.round(kgToLb(e.sets[0].weight)):e.sets[0].weight}{unit}</span></div>)}
            <button onClick={()=>dlgConfirm("Delete "+t.name+"?").then(ok=>{if(ok)onDeleteCustom(t.id);})} style={{marginTop:10,background:c.rs,border:"none",borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer",color:c.r,fontFamily:"inherit"}}>Delete routine</button>
          </div>}
        </div>
      );})}

      {customRoutines.length===0&&<div style={{background:c.card,border:"2px dashed "+c.border,borderRadius:20,padding:"28px 20px",textAlign:"center",marginTop:6}}>
        <div style={{fontSize:32,marginBottom:10}}>📋</div>
        <div style={{fontWeight:700,fontSize:15,color:c.text,marginBottom:6}}>No custom routines yet</div>
        <div style={{fontSize:13,color:c.sub,marginBottom:16}}>Create your own workout plans with your exercises, sets and weights.</div>
        <PBtn onClick={openNew} c={c} style={{margin:"0 auto"}}><IPlus/> Create First Routine</PBtn>
      </div>}
    </div>
  );
}
