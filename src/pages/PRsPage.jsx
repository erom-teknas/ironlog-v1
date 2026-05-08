import React, { useState } from 'react';
import { bestRM, calcVol, kgToLb, fmtD } from '../utils';
import { IChev, IPR } from '../icons';
import { Empty } from '../components/Primitives';

export default function PRsPage({hist,c,unit="kg",bwKg=0}){
  const [selEx,setSelEx]=useState(null);
  const [prMode,setPrMode]=useState("weight"); // weight | volume
  if(!hist.length)return <Empty icon="🏆" title="No PRs yet" sub="Start logging to track personal records." c={c}/>;

  const prs={},orms={},volPRs={};
  hist.forEach(w=>w.exercises.forEach(ex=>{
    ex.sets.forEach(s=>{const v=s.bodyweight?(bwKg+(parseFloat(s.weight)||0)):parseFloat(s.weight)||0;if(v>0&&(!prs[ex.name]||v>prs[ex.name]))prs[ex.name]=v;});
    const rm=bestRM(ex.sets,bwKg);if(!orms[ex.name]||rm>orms[ex.name])orms[ex.name]=rm;
    const vol=calcVol(ex.sets);if(vol>0&&(!volPRs[ex.name]||vol>volPRs[ex.name]))volPRs[ex.name]=vol;
  }));

  // 1RM trend or volume trend data for selected exercise
  const trendData=selEx?hist.reduce((acc,w)=>{
    const ex=w.exercises.find(e=>e.name===selEx);
    if(!ex)return acc;
    if(prMode==="volume"){
      const vol=calcVol(ex.sets);
      if(vol>0)acc.push({date:w.date,y:unit==="lb"?Math.round(kgToLb(vol)):vol});
    } else {
      const rm=bestRM(ex.sets,bwKg);
      if(rm>0)acc.push({date:w.date,y:unit==="lb"?Math.round(kgToLb(rm)*4)/4:rm});
    }
    return acc;
  },[]).sort((a,b)=>a.date.localeCompare(b.date)):[];

  const maxY=trendData.length?Math.max(...trendData.map(p=>p.y)):1;
  const minY=trendData.length?Math.min(...trendData.map(p=>p.y)):0;
  const W=320,H=110;
  const px=i=>trendData.length<2?W/2:(i/(trendData.length-1))*W;
  const py=v=>H-((v-(minY-5))/(Math.max(maxY-minY+10,20)))*(H*0.85);
  const pathD=trendData.length>1?trendData.reduce((d,p,i)=>{
    if(i===0)return"M"+px(i)+","+py(p.y);
    const x0=px(i-1),y0=py(trendData[i-1].y),x1=px(i),y1=py(p.y),cpx=(x0+x1)/2;
    return d+" C"+cpx+","+y0+" "+cpx+","+y1+" "+x1+","+y1;
  },""):"";

  const displayPRs=prMode==="weight"
    ?Object.entries(prs).sort((a,b)=>b[1]-a[1])
    :Object.entries(volPRs).sort((a,b)=>b[1]-a[1]);

  return(
    <div style={{padding:"20px 16px 100px"}}>
      <h2 style={{fontSize:23,fontWeight:900,margin:"0 0 6px",color:c.text,letterSpacing:"-0.02em"}}>Personal Records</h2>
      <p style={{fontSize:13,color:c.sub,marginBottom:14}}>Tap any exercise to see your trend</p>

      {/* Mode toggle */}
      <div style={{display:"flex",gap:4,background:c.card2,borderRadius:12,padding:4,marginBottom:18}}>
        {[{k:"weight",l:"Best Weight"},{k:"volume",l:"Best Volume"}].map(m=>(
          <button key={m.k} onClick={()=>setPrMode(m.k)} style={{flex:1,border:"none",borderRadius:9,padding:"7px 4px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:prMode===m.k?c.accent:"none",color:prMode===m.k?"#fff":c.sub,transition:"all .2s"}}>{m.l}</button>
        ))}
      </div>

      {/* Trend chart */}
      {selEx&&<div style={{background:c.card,border:"1px solid "+c.accent+"55",borderRadius:20,padding:"16px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:c.text}}>{selEx}</div>
            <div style={{fontSize:11,color:c.sub,marginTop:1}}>{prMode==="weight"?"Est. 1RM trend":"Session volume trend"} ({unit}{prMode==="volume"?"×reps":""})</div>
          </div>
          <button onClick={()=>setSelEx(null)} style={{background:c.card2,border:"none",borderRadius:9,padding:"5px 10px",fontSize:12,cursor:"pointer",color:c.sub,fontFamily:"inherit"}}>Close</button>
        </div>
        {trendData.length<2
          ?<div style={{textAlign:"center",padding:"16px 0",color:c.sub,fontSize:13}}>Need at least 2 sessions to show trend</div>
          :<div style={{overflowX:"auto"}}>
            <svg width={Math.max(W,trendData.length*40)} height={H+30} style={{display:"block"}}>
              <defs>
                <linearGradient id="rmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.accent} stopOpacity="0.3"/>
                  <stop offset="100%" stopColor={c.accent} stopOpacity="0"/>
                </linearGradient>
              </defs>
              {pathD&&<path d={pathD+" L"+px(trendData.length-1)+","+(H)+" L0,"+H+" Z"} fill="url(#rmGrad)"/>}
              {pathD&&<path d={pathD} fill="none" stroke={c.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
              {trendData.map((p,i)=>(
                <g key={i}>
                  <circle cx={px(i)} cy={py(p.y)} r="4" fill={c.accent}/>
                  <text x={px(i)} y={py(p.y)-8} textAnchor="middle" fontSize="10" fill={c.sub}>{p.y}</text>
                  {(i===0||i===trendData.length-1||(trendData.length>6&&i%Math.floor(trendData.length/4)===0))&&
                    <text x={px(i)} y={H+20} textAnchor="middle" fontSize="9" fill={c.sub}>{fmtD(p.date)}</text>}
                </g>
              ))}
            </svg>
          </div>
        }
      </div>}

      {displayPRs.map(([ex,w],i)=>(
        <div key={ex} onClick={()=>setSelEx(selEx===ex?null:ex)} style={{background:c.card,border:"1px solid "+(selEx===ex?c.accent+"99":i===0?c.accent+"66":c.border),borderRadius:18,padding:"13px 15px",marginBottom:9,cursor:"pointer",boxShadow:i===0?"0 4px 20px "+c.accent+"22":"none",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{fontSize:20}}>{["🥇","🥈","🥉"][i]||(i+1)+"."}</div>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:c.text}}>{ex}</div>
              {prMode==="weight"&&orms[ex]>w&&<div style={{fontSize:11,color:c.sub,marginTop:1}}>~1RM: <strong style={{color:c.at}}>{unit==="lb"?kgToLb(orms[ex]):orms[ex]}{unit}</strong></div>}
              <div style={{fontSize:10,color:c.sub,marginTop:1}}>Tap to see trend</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:21,fontWeight:900,color:i===0?c.accent:c.text}}>
                {prMode==="weight"?(unit==="lb"?kgToLb(w):w):(unit==="lb"?Math.round(kgToLb(w)):w)}
                <span style={{fontSize:11,fontWeight:500,color:c.sub}}>{unit}{prMode==="volume"?"×reps":""}</span>
              </div>
            </div>
            <div style={{color:c.sub,transform:selEx===ex?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",opacity:0.6}}><IChev/></div>
          </div>
        </div>
      ))}
    </div>
  );
}
