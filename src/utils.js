import { PLATES_LB, PLATES_KG, BAR_LB, BAR_KG } from './constants.js';

export function uid(){return Math.random().toString(36).slice(2,9);}
export function haptic(style){try{if(navigator.vibrate)navigator.vibrate(style==="medium"?12:style==="heavy"?25:6);}catch(e){}}
// Smart volume/weight display: 1234 → "1.2k", 12345 → "12.3k", 123 → "123"
export function fmtVol(n){if(n==null||isNaN(n))return"0";if(n>=10000)return Math.round(n/100)/10+"k";if(n>=1000)return Math.round(n/100)/10+"k";return String(Math.round(n));}
export function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
export function parseDate(d){var p=d.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
export function fmtD(d){return parseDate(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});}
export function fmtLong(d){return parseDate(d).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});}
export function calcVol(sets){if(!Array.isArray(sets))return 0;return sets.reduce((s,x)=>s+(parseFloat(x.weight)||0)*(parseInt(x.reps)||0),0);}
export function calc1RM(w,r){var wn=parseFloat(w)||0,rn=parseInt(r)||0;if(wn<=0||rn<=0)return 0;var cappedR=Math.min(rn,15);return rn===1?wn:Math.round(wn*(1+cappedR/30));}
export function bestRM(sets,bwKg){if(!Array.isArray(sets)||!sets.length)return 0;return sets.reduce((b,s)=>{var raw=s.bodyweight?(bwKg||0)+(parseFloat(s.weight)||0):parseFloat(s.weight)||0,r=parseInt(s.reps)||0;return(raw>0&&r>0)?Math.max(b,calc1RM(raw,r)):b;},0);}
export function getStreak(hist){if(!hist.length)return 0;var dates=[...new Set(hist.map(w=>w.date))].sort().reverse();var s=0,cur=new Date(today());for(var i=0;i<dates.length;i++){var diff=Math.round((cur-new Date(dates[i]))/86400000);if(diff<=1){s++;cur=new Date(dates[i]);}else break;}return s;}
export function weekKey(ds){var p=ds.split("-");var d=new Date(+p[0],+p[1]-1,+p[2]);d.setDate(d.getDate()-d.getDay());return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
export function kgToLb(kg){return Math.round(kg*2.2046*4)/4;}  // round to nearest 0.25lb
export function lbToKg(lb){return Math.round(lb/2.2046*100)/100;}
export function dispW(val,unit){var n=parseFloat(val)||0;return unit==="lb"?Math.round(kgToLb(n)*4)/4:n;}
export function storeW(val,unit){var n=parseFloat(val)||0;return unit==="lb"?Math.round(lbToKg(n)*100)/100:n;}
export function fmtW(val,unit){var n=parseFloat(val)||0;if(!n)return"0";return unit==="lb"?(Math.round(kgToLb(n)*4)/4)+"":n+"";}
export function calcPlates(t,unit,barKgOverride){
  var PLATES=unit==="lb"?PLATES_LB:PLATES_KG;
  var BAR=barKgOverride!=null?barKgOverride:(unit==="lb"?BAR_LB:BAR_KG);
  if(t<=BAR)return[];
  var rem=(t-BAR)/2,out=[];
  PLATES.forEach(p=>{while(rem>=p-0.001){out.push(p);rem=Math.round((rem-p)*1000)/1000;}});
  return out;
}
export function smoothPath(pts,W,H,minY,maxY){
  // Cap at 500 points to prevent main-thread blocking on large histories
  if(pts.length>500){var step=Math.ceil(pts.length/500);pts=pts.filter((_,i)=>i%step===0);}
  if(pts.length<2)return"";var range=maxY-minY||1;var px=i=>(i/(pts.length-1))*W;var py=v=>H-((v-minY)/range)*(H*0.85)-H*0.05;var d="M"+px(0)+","+py(pts[0]);for(var i=1;i<pts.length;i++){var x0=px(i-1),y0=py(pts[i-1]),x1=px(i),y1=py(pts[i]),cpx=(x0+x1)/2;d+=" C"+cpx+","+y0+" "+cpx+","+y1+" "+x1+","+y1;}return d;
}
export function areaPath(pts,W,H,minY,maxY){var line=smoothPath(pts,W,H,minY,maxY);if(!line)return"";var px=i=>(i/(pts.length-1))*W;var py=v=>H-((v-minY)/(maxY-minY||1))*(H*0.85)-H*0.05;return line+" L"+px(pts.length-1)+","+H+" L0,"+H+" Z";}
