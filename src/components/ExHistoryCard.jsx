import React, { useMemo, memo } from 'react';
import { fmtD, kgToLb, calcVol, bestRM, fmtW } from '../utils';

function ExHistoryCard({name,hist,unit,c}){
  const sessions=useMemo(()=>{
    const found=[];
    for(var i=hist.length-1;i>=0&&found.length<3;i--){
      const ex=(hist[i].exercises||[]).find(e=>e.name===name);
      if(ex&&ex.sets&&ex.sets.length){
        found.push({date:hist[i].date,sets:ex.sets});
      }
    }
    return found;
  },[hist,name]);
  if(!sessions.length)return null;
  return(
    <div style={{background:c.card2,borderRadius:12,padding:'10px 12px',marginBottom:8}}>
      <div style={{fontSize:10,fontWeight:700,color:c.sub,letterSpacing:'0.07em',marginBottom:6}}>HISTORY</div>
      {sessions.map((s,i)=>(
        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:i<sessions.length-1?6:0}}>
          <span style={{fontSize:10,color:c.sub,flexShrink:0,minWidth:44}}>{fmtD(s.date)}</span>
          <div style={{display:'flex',gap:4,flexWrap:'wrap',flex:1}}>
            {s.sets.filter(st=>!st.bodyweight).map((st,j)=>(
              <span key={j} style={{fontSize:10,background:c.card,borderRadius:6,padding:'2px 6px',color:c.text,fontWeight:600,flexShrink:0}}>
                {fmtW(st.weight,unit)}×{st.reps}
              </span>
            ))}
            {s.sets.some(st=>st.bodyweight)&&<span style={{fontSize:10,background:c.card,borderRadius:6,padding:'2px 6px',color:c.at,fontWeight:600}}>BW×{s.sets[0].reps}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
export default memo(ExHistoryCard);
