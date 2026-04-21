import React, { useState, useMemo, memo } from 'react';
import { CC } from '../constants';
import { smoothPath, areaPath, fmtD } from '../utils';

function WeightChart({c,series=[],unit="kg",W=340,H=160}){
  const [tip,setTip]=useState(null);
  const derived=useMemo(()=>{
    if(!series.length||!series[0].data.length)return null;
    const allVals=series.flatMap(s=>s.data.map(d=>d.y));
    const minY=Math.max(0,Math.min(...allVals)*0.92),maxY=Math.max(...allVals)*1.05;
    const range=maxY-minY||1;
    const px=(i,len)=>(i/(Math.max(len-1,1)))*W;
    const py=v=>H-((v-minY)/range)*(H*0.82)-H*0.06;
    const grid=[0,0.25,0.5,0.75,1].map(t=>minY+t*range);
    return{minY,maxY,range,px,py,grid};
  },[series,W,H]);
  if(!derived)return null;
  const{px,py,grid}=derived;
  return(
    <div style={{position:"relative",userSelect:"none"}}>
      <svg width="100%" viewBox={"0 0 "+W+" "+H} style={{overflow:"visible",display:"block"}}>
        <defs>{series.map((s,si)=><linearGradient key={si} id={"g"+si} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s.color} stopOpacity="0.25"/><stop offset="100%" stopColor={s.color} stopOpacity="0"/></linearGradient>)}</defs>
        {grid.map((v,i)=>{const y=py(v);return<g key={i}><line x1="0" y1={y} x2={W} y2={y} stroke={c.border} strokeWidth="1" strokeDasharray="4,4"/><text x="2" y={y-3} fill={c.sub} fontSize="9" fontFamily="-apple-system,sans-serif">{Math.round(v)}</text></g>;})}
        {series.map((s,si)=>{const pts=s.data.map(d=>d.y);const area=areaPath(pts,W,H,minY,maxY);return area?<path key={si} d={area} fill={"url(#g"+si+")"}/>:null;})}
        {series.map((s,si)=>{const pts=s.data.map(d=>d.y);const path=smoothPath(pts,W,H,minY,maxY);return path?<path key={si} d={path} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round"/>:null;})}
        {series.map((s,si)=>s.data.map((d,di)=>{const x=px(di,s.data.length),y=py(d.y);return<g key={si+"-"+di}><circle cx={x} cy={y} r="10" fill="transparent" onMouseEnter={()=>setTip({x,y,val:d.y,date:d.date,color:s.color})} onMouseLeave={()=>setTip(null)} onTouchStart={()=>setTip({x,y,val:d.y,date:d.date,color:s.color})} onTouchEnd={()=>setTimeout(()=>setTip(null),1500)}/><circle cx={x} cy={y} r="4" fill={s.color} stroke={c.card} strokeWidth="2"/></g>;}))}
        {tip&&<g><rect x={Math.min(tip.x-40,W-90)} y={tip.y-46} width="88" height="38" rx="8" fill={c.card} stroke={c.border} strokeWidth="1"/><text x={Math.min(tip.x-40,W-90)+44} y={tip.y-30} textAnchor="middle" fill={tip.color} fontSize="13" fontWeight="800" fontFamily="-apple-system,sans-serif">{tip.val}{unit}</text><text x={Math.min(tip.x-40,W-90)+44} y={tip.y-16} textAnchor="middle" fill={c.sub} fontSize="9" fontFamily="-apple-system,sans-serif">{tip.date}</text></g>}
      </svg>
      <div style={{display:"flex",marginTop:4}}>{series[0].data.map((d,i)=>{const show=series[0].data.length<=6||(i===0||i===series[0].data.length-1||i%Math.ceil(series[0].data.length/5)===0);return<div key={i} style={{fontSize:8,color:c.sub,textAlign:"center",flex:1,opacity:show?1:0}}>{fmtD(d.date)}</div>;})}</div>
    </div>
  );
}
export default memo(WeightChart);
