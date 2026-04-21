import React, { useState } from 'react';
import { BAR_TYPES, PCOL_LB, PCOL } from '../constants';
import { calcPlates, kgToLb, lbToKg } from '../utils';
import { NIn } from './Primitives';
import CollapsibleSection from './CollapsibleSection';

export default function PlateCalc({c,unit="kg"}){
  const [tgt,setTgt]=useState("");
  const [barId,setBarId]=useState("barbell");
  const PCOL_USE=unit==="lb"?PCOL_LB:PCOL;
  const barType=BAR_TYPES.find(b=>b.id===barId)||BAR_TYPES[0];
  const barKg=barType.kg;
  const barDisp=unit==="lb"?barType.lbEquiv:barKg;
  const n=parseFloat(tgt)||0;
  const nKg=unit==="lb"?(n/2.2046):n;
  const plates=n>0&&nKg>barKg?calcPlates(unit==="lb"?n:nKg,unit,unit==="lb"?barType.lbEquiv:barKg):[];
  const showBarOnly=n>0&&nKg<=barKg&&barKg>0;
  return(
    <CollapsibleSection title="Plate Calculator" icon="🏋️" sub="Enter a target weight to see plates" c={c} defaultOpen={false}>
      <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:2}}>
        {BAR_TYPES.map(b=><button key={b.id} onClick={()=>setBarId(b.id)} style={{flexShrink:0,border:"none",borderRadius:10,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:barId===b.id?c.accent:c.card2,color:barId===b.id?"#fff":c.sub}}>
          {b.label}{b.kg>0?" ("+(unit==="lb"?b.lbEquiv:b.kg)+unit+")":""}
        </button>)}
      </div>
      <div style={{fontSize:12,color:c.sub,marginBottom:10}}>{barKg>0?"Bar = "+barDisp+unit+" · ":""}Enter total target weight</div>
      <NIn value={tgt} onChange={setTgt} c={c}/>
      {plates.length>0&&<div style={{marginTop:12}}>
        <div style={{fontSize:10,color:c.sub,marginBottom:8,fontWeight:700,letterSpacing:"0.06em"}}>PLATES ON BAR</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",marginBottom:6}}>
          {plates.map((p,i)=><div key={"L"+i} style={{background:PCOL_USE[p]||"#555",color:"#fff",borderRadius:9,padding:"6px 12px",fontSize:13,fontWeight:800}}>{p}</div>)}
          {barKg>0&&<span style={{fontSize:12,color:c.sub,fontWeight:700,margin:"0 3px"}}>|{barDisp}{unit}|</span>}
          {[...plates].reverse().map((p,i)=><div key={"R"+i} style={{background:PCOL_USE[p]||"#555",color:"#fff",borderRadius:9,padding:"6px 12px",fontSize:13,fontWeight:800}}>{p}</div>)}
        </div>
        <div style={{fontSize:11,color:c.sub,marginBottom:6}}>{plates.length} plate{plates.length!==1?"s":""} per side</div>
        <div style={{fontSize:13,color:c.g,fontWeight:700}}>Total: {n}{unit} ✓</div>
      </div>}
      {showBarOnly&&<div style={{marginTop:8,fontSize:13,color:c.am}}>Bar only ({barDisp}{unit})</div>}
      {n>0&&barKg===0&&<div style={{marginTop:8,fontSize:13,color:c.g}}>No plates needed — dumbbell/cable weight</div>}
    </CollapsibleSection>
  );
}
