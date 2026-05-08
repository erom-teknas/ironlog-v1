import React, { useState, useMemo } from 'react';
import { today, calcVol } from '../utils';

const MG_COL={Chest:'#7C6EFA',Back:'#34d399',Legs:'#fbbf24',Shoulders:'#f87171',
  Biceps:'#06b6d4',Triceps:'#a78bfa',Core:'#fb923c',Glutes:'#ec4899',Cardio:'#84cc16'};
const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function WorkoutCalendar({hist,c,unit}){
  const now=new Date();
  const [viewYear,setViewYear]=useState(now.getFullYear());
  const [viewMonth,setViewMonth]=useState(now.getMonth());
  const [selectedDate,setSelectedDate]=useState(null);

  // Build lookup: date→{muscles, volume, workouts}
  const dateMap=useMemo(()=>{
    const m={};
    hist.forEach(w=>{
      if(!m[w.date])m[w.date]={muscles:new Set(),volume:0,workouts:[]};
      const vol=w.exercises.reduce((s,e)=>s+calcVol(e.sets),0);
      m[w.date].volume+=vol;
      m[w.date].workouts.push(w);
      (w.exercises||[]).forEach(e=>{if(e.muscle)m[w.date].muscles.add(e.muscle);});
    });
    return m;
  },[hist]);

  // Volume normalization for intensity within this month
  const monthPrefix=viewYear+'-'+String(viewMonth+1).padStart(2,'0');
  const monthDays=Object.entries(dateMap).filter(([d])=>d.startsWith(monthPrefix));
  const maxVol=monthDays.length?Math.max(...monthDays.map(([,v])=>v.volume),1):1;

  // Muscles trained this month (for filtered legend)
  const monthMuscles=useMemo(()=>{
    const s=new Set();
    monthDays.forEach(([,{muscles}])=>muscles.forEach(m=>s.add(m)));
    return s;
  },[viewYear,viewMonth,dateMap]);

  const firstDay=new Date(viewYear,viewMonth,1).getDay();
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const todayStr=today();
  const cells=[];
  for(var i=0;i<firstDay;i++)cells.push(null);
  for(var d=1;d<=daysInMonth;d++)cells.push(d);

  const prevMonth=()=>{if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1);};
  const nextMonth=()=>{if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1);};

  // Selected day popup data
  const selData=selectedDate?dateMap[selectedDate]:null;

  return(
    <div style={{marginBottom:4}}>
      {/* Month nav */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <button onClick={prevMonth} style={{background:c.card2,border:'none',borderRadius:9,padding:'7px 13px',cursor:'pointer',color:c.text,fontFamily:'inherit',fontSize:16,fontWeight:700}}>‹</button>
        <span style={{fontWeight:800,fontSize:15,color:c.text}}>{monthNames[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{background:c.card2,border:'none',borderRadius:9,padding:'7px 13px',cursor:'pointer',color:c.text,fontFamily:'inherit',fontSize:16,fontWeight:700}}>›</button>
      </div>

      {/* Day headers */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3,marginBottom:6}}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d} style={{textAlign:'center',fontSize:10,fontWeight:700,color:c.sub,padding:'2px 0'}}>{d}</div>)}
      </div>

      {/* Day cells */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
        {cells.map((d,i)=>{
          if(!d)return <div key={'e'+i}/>;
          const dateStr=monthPrefix+'-'+String(d).padStart(2,'0');
          const data=dateMap[dateStr];
          const isToday=dateStr===todayStr;
          const isSelected=selectedDate===dateStr;
          const trained=!!data;
          const muscleArr=trained?[...data.muscles]:[];
          const topMuscle=muscleArr[0]||null;
          const col=topMuscle?MG_COL[topMuscle]||c.accent:null;
          // Intensity: 0.15 → 0.55 based on relative volume
          const intensity=trained?0.18+0.37*(data.volume/maxVol):0;
          return(
            <div key={d} onClick={()=>setSelectedDate(isSelected||!trained?null:dateStr)}
              style={{aspectRatio:'1',borderRadius:8,display:'flex',flexDirection:'column',
                alignItems:'center',justifyContent:'center',
                background:trained?col+Math.round(intensity*255).toString(16).padStart(2,'0'):isToday?c.as:c.card2,
                border:'2px solid '+(isSelected?c.text:isToday?c.accent:trained?col||c.accent:'transparent'),
                cursor:trained?'pointer':'default',padding:2,boxSizing:'border-box',
                transition:'border-color .15s'}}>
              <span style={{fontSize:11,fontWeight:isToday?900:trained?700:400,
                color:trained?col||c.accent:isToday?c.accent:c.sub,lineHeight:1}}>{d}</span>
              {trained&&<div style={{display:'flex',gap:1,marginTop:2,flexWrap:'wrap',justifyContent:'center',maxWidth:'100%'}}>
                {muscleArr.slice(0,4).map(m=>(
                  <div key={m} style={{width:4,height:4,borderRadius:'50%',background:MG_COL[m]||c.accent,flexShrink:0}}/>
                ))}
              </div>}
            </div>
          );
        })}
      </div>

      {/* Day detail popup */}
      {selData&&selectedDate&&(
        <div style={{background:c.card2,border:'1px solid '+c.border,borderRadius:14,padding:'12px 14px',marginTop:10,animation:'fadeInUp .15s ease both'}}>
          <div style={{fontWeight:800,fontSize:13,color:c.text,marginBottom:6}}>
            {monthNames[viewMonth]} {parseInt(selectedDate.slice(-2))}
          </div>
          {selData.workouts.map((w,wi)=>(
            <div key={wi} style={{marginBottom:wi<selData.workouts.length-1?8:0}}>
              <div style={{fontWeight:700,fontSize:12,color:c.text,marginBottom:3}}>{w.name}</div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {[...new Set(w.exercises.map(e=>e.muscle))].filter(Boolean).map(m=>(
                  <span key={m} style={{background:(MG_COL[m]||c.accent)+'22',color:MG_COL[m]||c.accent,borderRadius:6,padding:'2px 8px',fontSize:10,fontWeight:700}}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtered legend — only muscles trained this month */}
      {monthMuscles.size>0&&<div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>
        {Object.entries(MG_COL).filter(([m])=>monthMuscles.has(m)).map(([m,col])=>(
          <div key={m} style={{display:'flex',alignItems:'center',gap:3}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:col,flexShrink:0}}/>
            <span style={{fontSize:9,color:c.sub,fontWeight:600}}>{m}</span>
          </div>
        ))}
      </div>}
    </div>
  );
}
