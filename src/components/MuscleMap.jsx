import React from 'react';
import { MZ } from '../constants';

export default function MuscleMap({c,trained=[]}){
  const z={ch:0,bk:0,sh:0,bi:0,tr:0,lg:0,co:0,gl:0};
  trained.forEach(m=>{const k=MZ[m];if(k)z[k]++;});
  const h=k=>z[k]>0?(c.accent+(z[k]>1?"cc":"77")):"none";
  const st=k=>z[k]>0?c.accent:c.border;
  return(
    <svg viewBox="0 0 120 242" width="100%" style={{maxWidth:110,display:"block",margin:"0 auto"}}>
      <ellipse cx="60" cy="18" rx="13" ry="15" fill={c.card2} stroke={c.border} strokeWidth="1.5"/>
      <rect x="55" y="31" width="11" height="8" rx="3" fill={c.card2} stroke={c.border} strokeWidth="1"/>
      <rect x="37" y="38" width="46" height="48" rx="9" fill={h("ch")} stroke={st("ch")} strokeWidth="1.5"/>
      {z.bk>0&&<rect x="37" y="38" width="46" height="48" rx="9" fill={h("bk")} stroke="none"/>}
      <rect x="40" y="84" width="40" height="28" rx="6" fill={h("co")} stroke={st("co")} strokeWidth="1.5"/>
      <ellipse cx="27" cy="50" rx="10" ry="12" fill={h("sh")} stroke={st("sh")} strokeWidth="1.5"/>
      <ellipse cx="93" cy="50" rx="10" ry="12" fill={h("sh")} stroke={st("sh")} strokeWidth="1.5"/>
      <rect x="13" y="58" width="15" height="30" rx="7" fill={h("bi")} stroke={st("bi")} strokeWidth="1.5"/>
      <rect x="92" y="58" width="15" height="30" rx="7" fill={h("bi")} stroke={st("bi")} strokeWidth="1.5"/>
      {z.tr>0&&<><rect x="13" y="58" width="15" height="30" rx="7" fill={h("tr")} stroke="none"/><rect x="92" y="58" width="15" height="30" rx="7" fill={h("tr")} stroke="none"/></>}
      <rect x="16" y="86" width="10" height="22" rx="5" fill={c.card2} stroke={c.border} strokeWidth="1"/>
      <rect x="94" y="86" width="10" height="22" rx="5" fill={c.card2} stroke={c.border} strokeWidth="1"/>
      <ellipse cx="48" cy="120" rx="14" ry="13" fill={h("gl")} stroke={st("gl")} strokeWidth="1.5"/>
      <ellipse cx="72" cy="120" rx="14" ry="13" fill={h("gl")} stroke={st("gl")} strokeWidth="1.5"/>
      <rect x="36" y="130" width="18" height="52" rx="9" fill={h("lg")} stroke={st("lg")} strokeWidth="1.5"/>
      <rect x="66" y="130" width="18" height="52" rx="9" fill={h("lg")} stroke={st("lg")} strokeWidth="1.5"/>
      <rect x="38" y="180" width="13" height="34" rx="6" fill={h("lg")} stroke={st("lg")} strokeWidth="1.5"/>
      <rect x="69" y="180" width="13" height="34" rx="6" fill={h("lg")} stroke={st("lg")} strokeWidth="1.5"/>
    </svg>
  );
}
