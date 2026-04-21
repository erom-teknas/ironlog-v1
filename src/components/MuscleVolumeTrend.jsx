import React, { useState, useMemo } from 'react';
import { MG, CC } from '../constants';
import { weekKey, calcVol, fmtD, kgToLb } from '../utils';
import CollapsibleSection from './CollapsibleSection';
import { IActivity } from '../icons';

export default function MuscleVolumeTrend({hist,c,unit}){
  const [selMg,setSelMg]=useState(MG[0]);
  const data=useMemo(()=>{
    const weeks={};
    hist.forEach(w=>{
      w.exercises.filter(e=>e.muscle===selMg).forEach(e=>{
        const k=weekKey(w.date);
        weeks[k]=(weeks[k]||0)+calcVol(e.sets);
      });
    });
    return Object.entries(weeks).sort((a,b)=>a[0].localeCompare(b[0])).map(([d,v])=>({
      date:d,y:Math.round(unit==="lb"?kgToLb(v):v)
    }));
  },[hist,selMg,unit]);
  const maxV=Math.max(...data.map(d=>d.y),1);
  return(
    <CollapsibleSection title="Muscle Group Volume" icon={<IActivity/>} sub={selMg+" weekly volume"} c={c}>
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:8,marginBottom:10}}>
        {MG.map(m=><button key={m} onClick={()=>setSelMg(m)} style={{flexShrink:0,border:"none",borderRadius:20,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:selMg===m?c.accent:c.card2,color:selMg===m?"#fff":c.sub}}>{m}</button>)}
      </div>
      {data.length===0
        ?<div style={{textAlign:"center",padding:"18px 0",color:c.sub,fontSize:13}}>No {selMg} sessions in this range</div>
        :<div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:3,height:90,minWidth:data.length*28}}>
            {data.map((w,i)=>{
              const h=Math.max(w.y/maxV*80,3);
              const isLast=i===data.length-1;
              const col=CC[MG.indexOf(selMg)%CC.length];
              return(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flex:"0 0 auto",width:Math.max(20,Math.min(36,Math.floor(300/Math.min(data.length,14))))+"px"}}>
                  <div style={{fontSize:7,color:isLast?col:c.sub,fontWeight:700,whiteSpace:"nowrap"}}>{w.y>=1000?Math.round(w.y/100)/10+"k":w.y}</div>
                  <div style={{width:"100%",background:isLast?col:col+"88",borderRadius:"3px 3px 0 0",height:h+"px"}} title={fmtD(w.date)+": "+w.y+unit}/>
                  {(i===0||isLast||i%Math.ceil(data.length/6)===0)&&<div style={{fontSize:7,color:c.sub,whiteSpace:"nowrap"}}>{fmtD(w.date)}</div>}
                </div>
              );
            })}
          </div>
        </div>
      }
    </CollapsibleSection>
  );
}
