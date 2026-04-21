import React, { useState, useMemo } from 'react';
import { today, fmtD } from '../utils';

export default function WorkoutCalendar({hist,c,unit}){
  const now=new Date();
  const [viewYear,setViewYear]=useState(now.getFullYear());
  const [viewMonth,setViewMonth]=useState(now.getMonth());
  // Build lookup: date→[muscles]
  const dateMap=useMemo(()=>{
    const m={};
    hist.forEach(w=>{
      if(!m[w.date])m[w.date]=new Set();
      (w.exercises||[]).forEach(e=>{if(e.muscle)m[w.date].add(e.muscle);});
    });
    return m;
  },[hist]);
  const MG_COL={Chest:'#7C6EFA',Back:'#34d399',Legs:'#fbbf24',Shoulders:'#f87171',Biceps:'#06b6d4',Triceps:'#a78bfa',Core:'#fb923c',Glutes:'#ec4899',Cardio:'#84cc16'};
  const firstDay=new Date(viewYear,viewMonth,1).getDay();
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const todayStr=today();
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const cells=[];
  for(var i=0;i<firstDay;i++)cells.push(null);
  for(var d=1;d<=daysInMonth;d++)cells.push(d);
  const prevMonth=()=>{if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1);};
  const nextMonth=()=>{if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1);};
  return(
    <div style={{background:c.card,border:'1px solid '+c.border,borderRadius:20,padding:'16px',marginBottom:16}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <button onClick={prevMonth} style={{background:c.card2,border:'none',borderRadius:9,padding:'7px 13px',cursor:'pointer',color:c.text,fontFamily:'inherit',fontSize:16,fontWeight:700}}>‹</button>
        <span style={{fontWeight:800,fontSize:15,color:c.text}}>{monthNames[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{background:c.card2,border:'none',borderRadius:9,padding:'7px 13px',cursor:'pointer',color:c.text,fontFamily:'inherit',fontSize:16,fontWeight:700}}>›</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3,marginBottom:6}}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d} style={{textAlign:'center',fontSize:10,fontWeight:700,color:c.sub,padding:'2px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
        {cells.map((d,i)=>{
          if(!d)return <div key={'e'+i}/>;
          const dateStr=viewYear+'-'+String(viewMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
          const muscles=dateMap[dateStr];
          const isToday=dateStr===todayStr;
          const trained=!!muscles;
          const topMuscle=muscles?[...muscles][0]:null;
          const col=topMuscle?MG_COL[topMuscle]||c.accent:null;
          return(
            <div key={d} style={{aspectRatio:'1',borderRadius:8,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:trained?col+'33':isToday?c.as:c.card2,border:'2px solid '+(isToday?c.accent:trained?col||c.accent:'transparent'),cursor:'default',padding:2,boxSizing:'border-box'}}>
              <span style={{fontSize:11,fontWeight:isToday?900:trained?700:400,color:trained?col||c.accent:isToday?c.accent:c.sub,lineHeight:1}}>{d}</span>
              {trained&&<div style={{display:'flex',gap:1,marginTop:2,flexWrap:'wrap',justifyContent:'center'}}>
                {[...muscles].slice(0,3).map(m=><div key={m} style={{width:4,height:4,borderRadius:'50%',background:MG_COL[m]||c.accent}}/>)}
              </div>}
            </div>
          );
        })}
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>
        {Object.entries(MG_COL).map(([m,col])=>(
          <div key={m} style={{display:'flex',alignItems:'center',gap:3}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:col,flexShrink:0}}/>
            <span style={{fontSize:9,color:c.sub}}>{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
