import React, {useState,useEffect,useRef,useCallback} from 'react';
import ReactDOM from 'react-dom/client';



// ─── Theme ────────────────────────────────────────────────────────────────────
const D={bg:"#0c0c12",card:"#141420",card2:"#1a1a28",border:"#252535",text:"#eeeeff",sub:"#55557a",muted:"#1f1f2e",accent:"#7C6EFA",as:"rgba(124,110,250,0.14)",at:"#b0a0ff",g:"#34d399",gs:"rgba(52,211,153,0.12)",r:"#f87171",rs:"rgba(248,113,113,0.12)",am:"#fbbf24",ams:"rgba(251,191,36,0.12)",nav:"rgba(12,12,18,0.97)"};
const L={bg:"#f1f1f8",card:"#ffffff",card2:"#f5f5fc",border:"#e2e2f0",text:"#0e0e20",sub:"#7070a0",muted:"#e8e8f5",accent:"#5548d9",as:"rgba(85,72,217,0.1)",at:"#5548d9",g:"#059669",gs:"rgba(5,150,105,0.1)",r:"#dc2626",rs:"rgba(220,38,38,0.1)",am:"#d97706",ams:"rgba(217,119,6,0.1)",nav:"rgba(241,241,248,0.97)"};

// ─── Data ─────────────────────────────────────────────────────────────────────
const MG=["Chest","Back","Shoulders","Biceps","Triceps","Legs","Core","Glutes","Cardio"];
const EX={Chest:["Bench Press","Incline DB Press","Cable Fly","Chest Dip","Push-Up","Pec Deck","Decline Press","Dumbbell Pullover"],Back:["Pull-Up","Lat Pulldown","Seated Cable Row","Bent-Over Row","Single-Arm DB Row","Face Pull","Deadlift","T-Bar Row"],Shoulders:["Overhead Press","Lateral Raise","Front Raise","Arnold Press","Rear Delt Fly","Upright Row","Cable Lateral Raise","Shrug"],Biceps:["Barbell Curl","Dumbbell Curl","Hammer Curl","Incline Curl","Cable Curl","Concentration Curl","Spider Curl","Preacher Curl"],Triceps:["Tricep Pushdown","Overhead Extension","Skull Crusher","Close-Grip Bench","Dip","Kickback","Diamond Push-Up"],Legs:["Squat","Leg Press","Romanian Deadlift","Leg Curl","Leg Extension","Walking Lunge","Calf Raise","Hack Squat","Sumo Squat"],Core:["Plank","Crunch","Hanging Leg Raise","Cable Crunch","Russian Twist","Ab Rollout","Side Plank","Dragon Flag"],Glutes:["Hip Thrust","Cable Kickback","Glute Bridge","Bulgarian Split Squat","Abductor Machine","Sumo Deadlift","Donkey Kick"],Cardio:["Treadmill","Elliptical","Cycling","Stair Master","Jump Rope","Row Machine","Assault Bike","Swimming"]};
const MZ={Chest:"ch",Back:"bk",Shoulders:"sh",Biceps:"bi",Triceps:"tr",Legs:"lg",Core:"co",Glutes:"gl"};
const TMPLS=[
  {id:"push",name:"Push Day",tag:"PPL",col:"#7C6EFA",exercises:[{name:"Bench Press",muscle:"Chest",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:80},{reps:8,weight:80},{reps:8,weight:80}]},{name:"Overhead Press",muscle:"Shoulders",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:50},{reps:8,weight:50},{reps:8,weight:50}]},{name:"Lateral Raise",muscle:"Shoulders",sets:[{reps:15,weight:12},{reps:15,weight:12},{reps:15,weight:12}]},{name:"Tricep Pushdown",muscle:"Triceps",sets:[{reps:12,weight:30},{reps:12,weight:30},{reps:12,weight:30}]}]},
  {id:"pull",name:"Pull Day",tag:"PPL",col:"#34d399",exercises:[{name:"Lat Pulldown",muscle:"Back",progression:{increment:2.5,unit:"kg"},sets:[{reps:10,weight:65},{reps:10,weight:65},{reps:10,weight:65}]},{name:"Seated Cable Row",muscle:"Back",progression:{increment:2.5,unit:"kg"},sets:[{reps:10,weight:55},{reps:10,weight:55},{reps:10,weight:55}]},{name:"Face Pull",muscle:"Back",sets:[{reps:15,weight:25},{reps:15,weight:25}]},{name:"Barbell Curl",muscle:"Biceps",progression:{increment:1.25,unit:"kg"},sets:[{reps:10,weight:35},{reps:10,weight:35},{reps:10,weight:35}]}]},
  {id:"legs",name:"Leg Day",tag:"PPL",col:"#fbbf24",exercises:[{name:"Squat",muscle:"Legs",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:100},{reps:8,weight:100},{reps:8,weight:100}]},{name:"Leg Press",muscle:"Legs",progression:{increment:5,unit:"kg"},sets:[{reps:12,weight:160},{reps:12,weight:160},{reps:12,weight:160}]},{name:"Romanian Deadlift",muscle:"Legs",progression:{increment:2.5,unit:"kg"},sets:[{reps:10,weight:80},{reps:10,weight:80},{reps:10,weight:80}]},{name:"Calf Raise",muscle:"Legs",sets:[{reps:20,weight:60},{reps:20,weight:60}]}]},
  {id:"upper",name:"Upper Body",tag:"Split",col:"#f87171",exercises:[{name:"Bench Press",muscle:"Chest",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:80},{reps:8,weight:80}]},{name:"Bent-Over Row",muscle:"Back",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:70},{reps:8,weight:70}]},{name:"Dumbbell Curl",muscle:"Biceps",sets:[{reps:12,weight:14},{reps:12,weight:14}]},{name:"Tricep Pushdown",muscle:"Triceps",sets:[{reps:12,weight:28},{reps:12,weight:28}]}]},
  {id:"lower",name:"Lower Body",tag:"Split",col:"#06b6d4",exercises:[{name:"Squat",muscle:"Legs",progression:{increment:2.5,unit:"kg"},sets:[{reps:8,weight:100},{reps:8,weight:100}]},{name:"Romanian Deadlift",muscle:"Legs",progression:{increment:2.5,unit:"kg"},sets:[{reps:10,weight:80},{reps:10,weight:80}]},{name:"Hip Thrust",muscle:"Glutes",progression:{increment:2.5,unit:"kg"},sets:[{reps:12,weight:90},{reps:12,weight:90}]},{name:"Calf Raise",muscle:"Legs",sets:[{reps:20,weight:50},{reps:20,weight:50}]}]}
];
const PLATES_KG=[25,20,15,10,5,2.5,1.25],BAR_KG=20;
const PLATES_LB=[45,35,25,10,5,2.5],BAR_LB=45;
const PCOL_LB={45:"#ef4444",35:"#3b82f6",25:"#f59e0b",10:"#22c55e",5:"#8b5cf6",2.5:"#ec4899"};
const PCOL={25:"#ef4444",20:"#3b82f6",15:"#f59e0b",10:"#22c55e",5:"#8b5cf6",2.5:"#ec4899",1.25:"#94a3b8"};
const CC=["#7C6EFA","#34d399","#fbbf24","#f87171","#06b6d4","#ec4899","#a78bfa"];
// Bar types: label, kg weight
const BAR_TYPES=[
  {id:"barbell",label:"Barbell",kg:20,lbEquiv:45},
  {id:"ez",label:"EZ Bar",kg:10,lbEquiv:25},
  {id:"dumbbell",label:"Dumbbell",kg:0,lbEquiv:0},
  {id:"none",label:"No Bar",kg:0,lbEquiv:0},
];

// ─── Utils ────────────────────────────────────────────────────────────────────
function uid(){return Math.random().toString(36).slice(2,9);}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function parseDate(d){var p=d.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function fmtD(d){return parseDate(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});}
function fmtLong(d){return parseDate(d).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});}
function calcVol(sets){if(!Array.isArray(sets))return 0;return sets.reduce((s,x)=>s+(parseFloat(x.weight)||0)*(parseInt(x.reps)||0),0);}
function calc1RM(w,r){var wn=parseFloat(w)||0,rn=parseInt(r)||0;if(wn<=0||rn<=0)return 0;var cappedR=Math.min(rn,15);return rn===1?wn:Math.round(wn*(1+cappedR/30));}
function bestRM(sets){if(!Array.isArray(sets)||!sets.length)return 0;return sets.reduce((b,s)=>{var w=parseFloat(s.weight)||0,r=parseInt(s.reps)||0;return(w>0&&r>0)?Math.max(b,calc1RM(w,r)):b;},0);}
// calcPlates moved above with unit support
function getStreak(hist){if(!hist.length)return 0;var dates=[...new Set(hist.map(w=>w.date))].sort().reverse();var s=0,cur=new Date(today());for(var i=0;i<dates.length;i++){var diff=Math.round((cur-new Date(dates[i]))/86400000);if(diff<=1){s++;cur=new Date(dates[i]);}else break;}return s;}
function weekKey(ds){var p=ds.split("-");var d=new Date(+p[0],+p[1]-1,+p[2]);d.setDate(d.getDate()-d.getDay());return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
// ─── IndexedDB Storage (persistent on iPhone, survives cache clears) ──────────
var IDB_NAME="ironlog_db",IDB_VER=1,IDB_STORE="kv";
var _idb=null;
function openDB(){
  if(_idb)return Promise.resolve(_idb);
  return new Promise((res,rej)=>{
    var r=indexedDB.open(IDB_NAME,IDB_VER);
    r.onupgradeneeded=e=>{e.target.result.createObjectStore(IDB_STORE,{keyPath:"k"});};
    r.onsuccess=e=>{_idb=e.target.result;res(_idb);};
    r.onerror=e=>rej(e.target.error);
  });
}
function idbSet(k,v){
  return openDB().then(db=>new Promise((res,rej)=>{
    var tx=db.transaction(IDB_STORE,"readwrite");
    tx.objectStore(IDB_STORE).put({k,v:JSON.stringify(v)});
    tx.oncomplete=()=>res();
    tx.onerror=e=>rej(e.target.error);
  })).catch(()=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}});
}
function idbGet(k,def){
  return openDB().then(db=>new Promise((res,rej)=>{
    var tx=db.transaction(IDB_STORE,"readonly");
    var req=tx.objectStore(IDB_STORE).get(k);
    req.onsuccess=e=>{
      var r=e.target.result;
      if(!r){res(def);return;}
      try{res(JSON.parse(r.v));}catch(e){res(def);}
    };
    req.onerror=e=>rej(e.target.error);
  })).catch(()=>{try{var v=localStorage.getItem(k);return v?JSON.parse(v):def;}catch(e){return def;}});
}
// Sync fallback for initial state (localStorage) — IndexedDB async migration happens on mount
function lsGet(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function kgToLb(kg){return Math.round(kg*2.2046*4)/4;}  // round to nearest 0.25lb
function lbToKg(lb){return Math.round(lb/2.2046*100)/100;}
function dispW(val,unit){var n=parseFloat(val)||0;return unit==="lb"?Math.round(kgToLb(n)*4)/4:n;}
function storeW(val,unit){var n=parseFloat(val)||0;return unit==="lb"?Math.round(lbToKg(n)*100)/100:n;}
function fmtW(val,unit){var n=parseFloat(val)||0;if(!n)return"0";return unit==="lb"?(Math.round(kgToLb(n)*4)/4)+"":n+"";}
function calcPlates(t,unit,barKgOverride){
  var PLATES=unit==="lb"?PLATES_LB:PLATES_KG;
  var BAR=barKgOverride!=null?barKgOverride:(unit==="lb"?BAR_LB:BAR_KG);
  if(t<=BAR)return[];
  var rem=(t-BAR)/2,out=[];
  PLATES.forEach(p=>{while(rem>=p-0.001){out.push(p);rem=Math.round((rem-p)*1000)/1000;}});
  return out;
}
function smoothPath(pts,W,H,minY,maxY){
  // Cap at 500 points to prevent main-thread blocking on large histories
  if(pts.length>500){var step=Math.ceil(pts.length/500);pts=pts.filter((_,i)=>i%step===0);}
  if(pts.length<2)return"";var range=maxY-minY||1;var px=i=>(i/(pts.length-1))*W;var py=v=>H-((v-minY)/range)*(H*0.85)-H*0.05;var d="M"+px(0)+","+py(pts[0]);for(var i=1;i<pts.length;i++){var x0=px(i-1),y0=py(pts[i-1]),x1=px(i),y1=py(pts[i]),cpx=(x0+x1)/2;d+=" C"+cpx+","+y0+" "+cpx+","+y1+" "+x1+","+y1;}return d;
}
function areaPath(pts,W,H,minY,maxY){var line=smoothPath(pts,W,H,minY,maxY);if(!line)return"";var px=i=>(i/(pts.length-1))*W;var py=v=>H-((v-minY)/(maxY-minY||1))*(H*0.85)-H*0.05;return line+" L"+px(pts.length-1)+","+H+" L0,"+H+" Z";}

// ─── Icons ─────────────────────────────────────────────────────────────────────
const IHome=()=><svg width="20"height="20"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 21V12h6v9"/></svg>;
const ILog=()=><svg width="20"height="20"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><path d="M6 5v14M18 5v14"/><rect x="2"y="8"width="4"height="8"rx="1"/><rect x="18"y="8"width="4"height="8"rx="1"/><line x1="6"y1="12"x2="18"y2="12"/></svg>;
const IHist=()=><svg width="20"height="20"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><circle cx="12"cy="12"r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IChart=()=><svg width="20"height="20"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IPR=()=><svg width="20"height="20"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><path d="M6 2h12v6a6 6 0 01-12 0V2z"/><path d="M6 4H4a2 2 0 000 4h2M18 4h2a2 2 0 010 4h-2M12 14v4M8 22h8"/></svg>;
const IGrid=()=><svg width="20"height="20"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><rect x="3"y="3"width="18"height="18"rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
const IPlus=()=><svg width="15"height="15"fill="none"stroke="currentColor"strokeWidth="2.5"viewBox="0 0 24 24"><line x1="12"y1="5"x2="12"y2="19"/><line x1="5"y1="12"x2="19"y2="12"/></svg>;
const ITrash=()=><svg width="14"height="14"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>;
const ICheck=()=><svg width="13"height="13"fill="none"stroke="currentColor"strokeWidth="2.5"viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>;
const IX=()=><svg width="13"height="13"fill="none"stroke="currentColor"strokeWidth="2.5"viewBox="0 0 24 24"><line x1="18"y1="6"x2="6"y2="18"/><line x1="6"y1="6"x2="18"y2="18"/></svg>;
const IChev=()=><svg width="14"height="14"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>;
const IShare=()=><svg width="14"height="14"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><circle cx="18"cy="5"r="3"/><circle cx="6"cy="12"r="3"/><circle cx="18"cy="19"r="3"/><line x1="8.59"y1="13.51"x2="15.42"y2="17.49"/><line x1="15.41"y1="6.51"x2="8.59"y2="10.49"/></svg>;
const ISun=()=><svg width="16"height="16"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><circle cx="12"cy="12"r="5"/><line x1="12"y1="1"x2="12"y2="3"/><line x1="12"y1="21"x2="12"y2="23"/><line x1="4.22"y1="4.22"x2="5.64"y2="5.64"/><line x1="18.36"y1="18.36"x2="19.78"y2="19.78"/><line x1="1"y1="12"x2="3"y2="12"/><line x1="21"y1="12"x2="23"y2="12"/></svg>;
const IMoon=()=><svg width="16"height="16"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>;
const IHelp=()=><svg width="20"height="20"fill="none"stroke="currentColor"strokeWidth="2"viewBox="0 0 24 24"><circle cx="12"cy="12"r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12"y1="17"x2="12.01"y2="17"/></svg>;
const TABS=[{id:"home",label:"Home",Icon:IHome},{id:"log",label:"Log",Icon:ILog},{id:"history",label:"History",Icon:IHist},{id:"progress",label:"Progress",Icon:IChart},{id:"prs",label:"PRs",Icon:IPR},{id:"routines",label:"Routines",Icon:IGrid},{id:"help",label:"Help",Icon:IHelp}];

// ─── Tooltip — inline ? badge that reveals explanation on tap ─────────────────
function Tip({text,c}){
  const [open,setOpen]=useState(false);
  return(
    <span style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
      <button onClick={e=>{e.stopPropagation();setOpen(o=>!o);}}
        style={{background:c.as,border:"none",borderRadius:"50%",width:18,height:18,cursor:"pointer",color:c.accent,fontSize:11,fontWeight:900,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"inherit",padding:0}}>?</button>
      {open&&<div onClick={e=>{e.stopPropagation();setOpen(false);}}
        style={{position:"fixed",inset:0,zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:"rgba(0,0,0,0.5)"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#1a1a28",border:"1px solid #7C6EFA55",borderRadius:18,padding:"18px 20px",maxWidth:320,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
          <div style={{fontSize:14,color:"#eeeeff",lineHeight:1.6,marginBottom:14}}>{text}</div>
          <button onClick={()=>setOpen(false)} style={{background:"#7C6EFA",border:"none",borderRadius:10,padding:"8px 20px",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",width:"100%"}}>Got it</button>
        </div>
      </div>}
    </span>
  );
}

// ─── Base UI ──────────────────────────────────────────────────────────────────
const PBtn=({onClick,disabled,children,c,style={}})=><button onClick={onClick} disabled={disabled} style={{border:"none",borderRadius:13,padding:"10px 18px",fontSize:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,opacity:disabled?0.4:1,background:c.accent,color:"#fff",...style}}>{children}</button>;
const GBtn=({onClick,children,c,style={}})=><button onClick={onClick} style={{border:"none",borderRadius:13,padding:"10px 18px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,background:c.card2,color:c.text,...style}}>{children}</button>;
const DBtn=({onClick,children,c,style={}})=><button onClick={onClick} style={{border:"none",borderRadius:13,padding:"10px 18px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,background:c.rs,color:c.r,...style}}>{children}</button>;
const NIn=({value,onChange,c})=><input type="number" inputMode="decimal" value={value} placeholder="0" onChange={e=>onChange(e.target.value)} style={{background:c.card2,border:"1.5px solid "+c.border,borderRadius:10,padding:"8px 4px",fontSize:14,color:c.text,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"inherit",textAlign:"center"}}/>;
const Pill=({label,col,bg})=><span style={{background:bg,color:col,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}>{label}</span>;
const Empty=({icon,title,sub,c})=><div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 24px",textAlign:"center"}}><div style={{fontSize:52,marginBottom:16}}>{icon}</div><div style={{fontWeight:800,fontSize:18,color:c.text,marginBottom:8}}>{title}</div><div style={{fontSize:14,color:c.sub}}>{sub}</div></div>;

// ─── Inline Confirm Dialog — replaces window.confirm (blocked in iframes) ─────
// Usage: const {confirmEl,confirm} = useConfirm(c);
//   confirm("Message?").then(ok => { if(ok) doThing(); })
//   Render {confirmEl} anywhere in the JSX tree.
function useConfirm(c){
  const [state,setState]=useState(null); // {msg, resolve}
  const confirm=(msg)=>new Promise(resolve=>{setState({msg,resolve});});
  const respond=(ok)=>{if(state){state.resolve(ok);setState(null);}};
  const confirmEl=state?(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:c.card,borderRadius:22,padding:"24px 20px",width:"100%",maxWidth:320,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
        <div style={{fontSize:15,fontWeight:700,color:c.text,marginBottom:20,lineHeight:1.5,textAlign:"center"}}>{state.msg}</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>respond(false)} style={{flex:1,background:c.card2,border:"1px solid "+c.border,borderRadius:13,padding:"11px",fontSize:14,fontWeight:700,cursor:"pointer",color:c.sub,fontFamily:"inherit"}}>Cancel</button>
          <button onClick={()=>respond(true)} style={{flex:1,background:c.r,border:"none",borderRadius:13,padding:"11px",fontSize:14,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit"}}>OK</button>
        </div>
      </div>
    </div>
  ):null;
  return{confirm,confirmEl};
}

// ─── SwipeToDelete ────────────────────────────────────────────────────────────
// Wraps any row. Swipe left >60px → red Delete button slides in. Tap it → onDelete().
// Works in scrollable modals. Distinguishes horizontal swipe from vertical scroll.
function SwipeToDelete({children,onDelete,c}){
  const [offset,setOffset]=useState(0);
  const [open,setOpen]=useState(false);
  const startX=useRef(null);
  const startY=useRef(null);
  const isH=useRef(false); // confirmed horizontal gesture
  const BTN=72; // width of the delete button

  const onTouchStart=e=>{
    startX.current=e.touches[0].clientX;
    startY.current=e.touches[0].clientY;
    isH.current=false;
  };
  const onTouchMove=e=>{
    if(startX.current===null)return;
    const dx=e.touches[0].clientX-startX.current;
    const dy=e.touches[0].clientY-startY.current;
    // Only lock horizontal after we're sure it's not a vertical scroll
    if(!isH.current){
      if(Math.abs(dy)>Math.abs(dx)){startX.current=null;return;} // vertical — ignore
      if(Math.abs(dx)>6)isH.current=true; // confirmed horizontal
    }
    if(!isH.current)return;
    e.preventDefault(); // prevent page scroll during horizontal swipe
    const raw=open?dx-BTN:dx;
    const clamped=Math.max(-BTN,Math.min(0,raw));
    setOffset(clamped);
  };
  const onTouchEnd=()=>{
    if(startX.current===null){setOffset(open?-BTN:0);return;}
    startX.current=null;
    if(offset<-BTN/2){setOffset(-BTN);setOpen(true);}
    else{setOffset(0);setOpen(false);}
  };

  const onMouseDown=e=>{
    if(e.button!==0)return;
    startX.current=e.clientX;
    startY.current=e.clientY;
    isH.current=false;
  };
  const onMouseMove=e=>{
    if(startX.current===null)return;
    const dx=e.clientX-startX.current;
    const dy=e.clientY-startY.current;
    if(!isH.current){
      if(Math.abs(dy)>Math.abs(dx)){startX.current=null;return;}
      if(Math.abs(dx)>6)isH.current=true;
    }
    if(!isH.current)return;
    const raw=open?dx-BTN:dx;
    const clamped=Math.max(-BTN,Math.min(0,raw));
    setOffset(clamped);
  };
  const onMouseUp=()=>{
    if(startX.current===null){setOffset(open?-BTN:0);return;}
    startX.current=null;
    if(offset<-BTN/2){setOffset(-BTN);setOpen(true);}
    else{setOffset(0);setOpen(false);}
  };

  const close=()=>{setOffset(0);setOpen(false);};

  return(
    <div style={{position:"relative",overflow:"hidden",borderBottom:"1px solid "+c.border}}>
      {/* Red delete button revealed behind */}
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:BTN+"px",background:c.r,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>{close();onDelete();}}>
        <span style={{color:"#fff",fontSize:12,fontWeight:800}}>Delete</span>
      </div>
      {/* Row content slides left */}
      <div
        style={{display:"flex",alignItems:"center",background:c.card,transform:"translateX("+offset+"px)",transition:startX.current===null?"transform .2s ease":"none",willChange:"transform",userSelect:"none"}}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {children}
      </div>
    </div>
  );
}
// The Web Audio clock runs independently of the JS event loop and screen lock.
// We hold one shared AudioContext, resumed on first user gesture.
// When a rest timer starts, we schedule 3 beeps at the exact future timestamp.
var _actx=null;
var _scheduledBeeps=[];
function getACtx(){
  if(!_actx){try{_actx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}
  return _actx;
}
function resumeACtx(){
  var ctx=getACtx();
  if(ctx&&ctx.state==="suspended"){ctx.resume().catch(()=>{});}
  return ctx;
}
function cancelScheduledBeeps(){
  _scheduledBeeps.forEach(function(n){try{n.stop();}catch(e){}});
  _scheduledBeeps=[];
}
function scheduleBeepsAt(fireAtMs){
  // Call this immediately after a user gesture (tap on timer circle)
  var ctx=resumeACtx();
  if(!ctx)return;
  cancelScheduledBeeps();
  var delayS=(fireAtMs-Date.now())/1000;
  if(delayS<0)delayS=0;
  // 3 beeps: 880Hz, 880Hz, 1046Hz — ascending pattern
  [[880,0],[880,0.25],[1046,0.5]].forEach(function(pair){
    var freq=pair[0],off=pair[1];
    var t=ctx.currentTime+delayS+off;
    var o=ctx.createOscillator();
    var g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.frequency.value=freq;o.type="sine";
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(0.5,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
    o.start(t);o.stop(t+0.36);
    _scheduledBeeps.push(o);
  });
}
function hapticBeep(){
  // Immediate beep + vibrate (for when timer finishes while app is visible)
  try{if(navigator.vibrate)navigator.vibrate([80,60,80,60,120]);}catch(e){}
  var ctx=resumeACtx();
  if(!ctx)return;
  cancelScheduledBeeps();
  [[880,0],[880,0.2],[1046,0.4]].forEach(function(pair){
    var freq=pair[0],off=pair[1];
    var t=ctx.currentTime+off;
    var o=ctx.createOscillator();var g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.frequency.value=freq;o.type="sine";
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(0.5,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
    o.start(t);o.stop(t+0.36);
  });
}

// ─── Rest Timer (small circle, lives in App state) ────────────────────────────
const TIMER_STEPS=[60,120,180];
function RestTimerCircle({c,timerSecs,timerStart,onCycle,onDone}){
  const [now,setNow]=useState(()=>Date.now());
  const rafRef=useRef(null);
  // ALL hooks must be at the top — no hooks after conditional returns
  useEffect(()=>{
    if(!timerSecs)return;
    // Schedule beeps at exact future time using Web Audio clock (runs through screen lock)
    scheduleBeepsAt(timerStart+timerSecs*1000);
    function tick(){setNow(Date.now());rafRef.current=requestAnimationFrame(tick);}
    rafRef.current=requestAnimationFrame(tick);
    function onVis(){if(document.visibilityState==="visible")setNow(Date.now());}
    document.addEventListener("visibilitychange",onVis);
    return()=>{cancelAnimationFrame(rafRef.current);document.removeEventListener("visibilitychange",onVis);};
  },[timerSecs,timerStart]);
  const elapsed=timerSecs?Math.min((now-timerStart)/1000,timerSecs):0;
  const remain=timerSecs?Math.max(timerSecs-elapsed,0):0;
  const pct=timerSecs?Math.min(elapsed/timerSecs,1):0;
  const done=timerSecs>0&&remain<=0;
  useEffect(()=>{
    if(!done)return;
    cancelScheduledBeeps(); // already fired via scheduled audio
    hapticBeep();            // also do immediate vibrate+beep for visible feedback
    const t=setTimeout(onDone,1200);
    return()=>clearTimeout(t);
  },[done,onDone]);
  const R=19,circ=2*Math.PI*R;
  const mm=Math.floor(remain/60),ss=Math.floor(remain%60);
  const label=done?"✓":(mm>0?mm+":"+(ss<10?"0":"")+ss:ss+"s");
  const handleCycle=()=>{cancelScheduledBeeps();resumeACtx();onCycle();};
  if(!timerSecs){
    return(
      <button onClick={handleCycle} title="Tap to start rest timer" style={{position:"relative",width:44,height:44,borderRadius:"50%",background:"none",border:"none",cursor:"pointer",padding:0,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="44" height="44" style={{position:"absolute",top:0,left:0}}>
          <circle cx="22" cy="22" r={R} fill="none" stroke={c.muted} strokeWidth="3"/>
        </svg>
        <span style={{position:"relative",fontSize:9,fontWeight:700,color:c.sub,lineHeight:1,letterSpacing:"0.02em"}}>REST</span>
      </button>
    );
  }
  return(
    <button onClick={handleCycle} title="Tap to change duration or stop" style={{position:"relative",width:44,height:44,borderRadius:"50%",background:"none",border:"none",cursor:"pointer",padding:0,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg width="44" height="44" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
        <circle cx="22" cy="22" r={R} fill="none" stroke={c.muted} strokeWidth="3"/>
        <circle cx="22" cy="22" r={R} fill="none"
          stroke={done?c.g:c.accent} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}/>
      </svg>
      <span style={{position:"relative",fontSize:done?13:10,fontWeight:800,color:done?c.g:c.accent,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{label}</span>
    </button>
  );
}

// ─── Muscle Map ───────────────────────────────────────────────────────────────
function MuscleMap({c,trained=[]}){
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

// ─── Weight Chart ─────────────────────────────────────────────────────────────
function WeightChart({c,series=[],unit="kg",W=340,H=160}){
  const [tip,setTip]=useState(null);
  if(!series.length||!series[0].data.length)return null;
  const allVals=series.flatMap(s=>s.data.map(d=>d.y));
  const minY=Math.max(0,Math.min(...allVals)*0.92),maxY=Math.max(...allVals)*1.05;
  const range=maxY-minY||1;
  const px=(i,len)=>(i/(Math.max(len-1,1)))*W;
  const py=v=>H-((v-minY)/range)*(H*0.82)-H*0.06;
  const grid=[0,0.25,0.5,0.75,1].map(t=>minY+t*range);
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

// ─── Share Card ───────────────────────────────────────────────────────────────
function ShareCard({workout:w,c,unit="kg",onClose}){
  const v=w.exercises.reduce((s,e)=>s+calcVol(e.sets),0);
  const sets=w.exercises.reduce((s,e)=>s+e.sets.length,0);
  const best=w.exercises.reduce((b,e)=>{const rm=bestRM(e.sets);return rm>b.val?{val:rm,name:e.name}:b;},{val:0,name:""});
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(140deg,#1a1a2e,#16213e,#0f3460)",borderRadius:28,padding:"30px 22px",width:"100%",maxWidth:320,boxShadow:"0 24px 80px rgba(0,0,0,0.8)"}}>
        <div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:36,marginBottom:6}}>🏋️</div><div style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-0.02em"}}>{w.name}</div><div style={{fontSize:12,color:"#8888bb",marginTop:4}}>{fmtLong(w.date)}</div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:14}}>{[
          {l:"Volume",v:unit==="lb"?(kgToLb(v)>=1000?Math.round(kgToLb(v)/100)/10+"k lb":Math.round(kgToLb(v))+" lb"):(v>=1000?Math.round(v/100)/10+"k kg":Math.round(v)+" kg")},
          {l:"Sets",v:sets},
          {l:"Exercises",v:w.exercises.length}
        ].map(s=><div key={s.l} style={{background:"rgba(255,255,255,0.08)",borderRadius:14,padding:"12px 6px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{s.v}</div><div style={{fontSize:9,color:"#8888bb",marginTop:3,fontWeight:700,letterSpacing:"0.05em"}}>{s.l.toUpperCase()}</div></div>)}</div>
        {best.val>0&&<div style={{background:"rgba(124,110,250,0.2)",border:"1px solid rgba(124,110,250,0.4)",borderRadius:14,padding:"12px",marginBottom:14,textAlign:"center"}}><div style={{fontSize:10,color:"#b0a0ff",fontWeight:700,letterSpacing:"0.07em",marginBottom:3}}>BEST ~1RM</div><div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{unit==="lb"?kgToLb(best.val):best.val}{unit} — {best.name}</div></div>}
        {w.rating>0&&<div style={{textAlign:"center",fontSize:22,marginBottom:14}}>{"⭐".repeat(w.rating)}</div>}
        <div style={{textAlign:"center",fontSize:10,color:"#55557a",marginBottom:16,fontWeight:600}}>● IronLog · Track. Lift. Grow.</div>
        <button onClick={onClose} style={{width:"100%",background:"rgba(255,255,255,0.1)",border:"none",borderRadius:13,padding:12,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Close</button>
      </div>
    </div>
  );
}

// ─── Plate Calc ───────────────────────────────────────────────────────────────
function PlateCalc({c,unit="kg"}){
  const [tgt,setTgt]=useState("");
  const [barId,setBarId]=useState("barbell");
  const PCOL_USE=unit==="lb"?PCOL_LB:PCOL;
  const barType=BAR_TYPES.find(b=>b.id===barId)||BAR_TYPES[0];
  const barKg=barType.kg;
  const barDisp=unit==="lb"?Math.round(barKg*2.2046):barKg;
  const n=parseFloat(tgt)||0;
  const nKg=unit==="lb"?(n/2.2046):n;
  const plates=n>0&&nKg>barKg?calcPlates(unit==="lb"?n:nKg,unit,unit==="lb"?barType.lbEquiv:barKg):[];
  const showBarOnly=n>0&&nKg<=barKg&&barKg>0;
  return(
    <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:18,padding:18,marginBottom:16}}>
      <div style={{fontWeight:800,fontSize:15,color:c.text,marginBottom:8}}>🏋️ Plate Calculator</div>
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
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomePage({hist,dark,c,unit="kg",onBlank,onRoutine,onBackup,onImport,bwLog=[],onLogBW,gymPlates=[],onSetGymPlates,lastSnapshot=""}){
  const [bwInput,setBwInput]=useState("");
  const streak=getStreak(hist),now=new Date();
  const weekVol=hist.filter(w=>(now-new Date(w.date))/86400000<=7).reduce((s,w)=>s+w.exercises.reduce((a,e)=>a+calcVol(e.sets),0),0);
  const last=hist.length?hist[hist.length-1]:null;
  const todayM=[...new Set(hist.filter(w=>w.date===today()).flatMap(w=>w.exercises.map(e=>e.muscle)))];
  const hr=new Date().getHours(),greet=hr<12?"Good morning":hr<17?"Good afternoon":"Good evening";
  const insights=[];
  if(hist.length){
    const ds={};[...hist].reverse().forEach(w=>w.exercises.forEach(e=>{if(!ds[e.muscle])ds[e.muscle]=Math.floor((now-new Date(w.date))/86400000);}));
    Object.entries(ds).forEach(([m,d])=>{if(d>=5)insights.push({msg:m+" not trained in "+d+" days 💤",col:"am"});});
    if(weekVol>4000)insights.push({msg:"Strong week — "+(unit==="lb"?Math.round(kgToLb(weekVol)/1000)+"k lb":Math.round(weekVol/1000)+"k kg")+" lifted 🔥",col:"g"});
    if(streak>=3)insights.push({msg:streak+"-day streak! Keep going 🏆",col:"ac"});
  }
  return(
    <div style={{paddingBottom:32}}>
      <div style={{background:dark?"linear-gradient(155deg,#1e1b4b,#0c0c12)":"linear-gradient(155deg,#312e81,#1e1b4b)",borderRadius:"0 0 32px 32px",padding:"20px 20px 30px",color:"#fff",marginBottom:18}}>
        <p style={{margin:"0 0 4px",fontSize:11,color:"#a89dff",fontWeight:700,letterSpacing:"0.1em"}}>{greet.toUpperCase()}</p>
        <h1 style={{margin:"0 0 22px",fontSize:28,fontWeight:900,letterSpacing:"-0.03em",lineHeight:1.1}}>{hist.length===0?"Let's get to work.":"Ready to crush it? 💪"}</h1>
        <div style={{display:"flex",gap:9}}>
          {[
            {l:"STREAK",v:streak>0?streak+"d":"—",e:"🔥"},
            {l:"THIS WEEK",v:weekVol>0?(unit==="lb"?Math.round(kgToLb(weekVol)/1000)+"k lb":Math.round(weekVol/1000)+"k kg"):"—",e:"📦"},
            {l:"SESSIONS",v:hist.length||"—",e:"🏅"}
          ].map(s=><div key={s.l} style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:16,padding:"13px 6px",textAlign:"center"}}><div style={{fontSize:20,marginBottom:2}}>{s.e}</div><div style={{fontSize:18,fontWeight:900,lineHeight:1}}>{s.v}</div><div style={{fontSize:9,color:"rgba(168,157,255,0.85)",marginTop:3,fontWeight:700,letterSpacing:"0.08em"}}>{s.l}</div></div>)}
        </div>
      </div>
      <div style={{padding:"0 16px"}}>
        {insights.slice(0,3).map((ins,i)=><div key={i} style={{background:ins.col==="g"?c.gs:ins.col==="am"?c.ams:c.as,borderRadius:13,padding:"11px 13px",marginBottom:8,fontSize:13,color:ins.col==="g"?c.g:ins.col==="am"?c.am:c.at,fontWeight:600}}>{ins.msg}</div>)}
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          <button onClick={onBlank} style={{flex:1,background:c.accent,color:"#fff",border:"none",borderRadius:20,padding:"17px 12px",fontSize:14,fontWeight:800,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:4,fontFamily:"inherit",boxShadow:"0 6px 20px "+c.accent+"44"}}><IPlus/><span>Blank Workout</span><span style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontWeight:400}}>Start fresh</span></button>
          <button onClick={onRoutine} style={{flex:1,background:c.card,color:c.text,border:"1.5px solid "+c.border,borderRadius:20,padding:"17px 12px",fontSize:14,fontWeight:800,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:4,fontFamily:"inherit"}}><IGrid/><span>Use Routine</span><span style={{fontSize:11,color:c.sub,fontWeight:400}}>Pick a template</span></button>
        </div>
        <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:16,marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
          <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14,color:c.text,marginBottom:4}}>Today's Muscles</div><div style={{fontSize:12,color:c.sub,lineHeight:1.5}}>{todayM.length?todayM.join(" · "):"Nothing yet — start a workout!"}</div></div>
          <div style={{width:76,flexShrink:0}}><MuscleMap trained={todayM} c={c}/></div>
        </div>
        {last&&<div style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:16,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"center"}}><div style={{fontWeight:800,fontSize:14,color:c.text}}>Last Workout</div><div style={{fontSize:12,color:c.sub}}>{fmtD(last.date)}</div></div>
          {last.exercises.slice(0,3).map((ex,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"6px 0",borderTop:"1px solid "+c.border,color:c.sub}}><span style={{color:c.text,fontWeight:600}}>{ex.name}</span><span>{ex.sets.length} sets · {unit==="lb"?kgToLb(Math.max(...ex.sets.map(s=>parseFloat(s.weight)||0))):Math.max(...ex.sets.map(s=>parseFloat(s.weight)||0))}{unit}</span></div>)}
          {last.exercises.length>3&&<div style={{fontSize:12,color:c.sub,marginTop:5}}>+{last.exercises.length-3} more</div>}
        </div>}

        {/* ── Body Weight Log ── */}
        <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:"16px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontSize:18}}>⚖️</span>
            <div style={{fontWeight:800,fontSize:14,color:c.text}}>Body Weight</div>
            {bwLog.length>0&&<span style={{marginLeft:"auto",fontSize:12,color:c.sub}}>Latest: <strong style={{color:c.text}}>{unit==="lb"?Math.round(kgToLb(bwLog[bwLog.length-1].kg)*10)/10:bwLog[bwLog.length-1].kg}{unit}</strong></span>}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="number" inputMode="decimal" value={bwInput} onChange={e=>setBwInput(e.target.value)}
              placeholder={"Weight in "+(unit==="lb"?"lb":"kg")+"…"}
              style={{flex:1,background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"9px 12px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>{
              var n=parseFloat(bwInput);
              var maxW=unit==="lb"?700:320;var minW=unit==="lb"?44:20;
              if(!n||n<minW||n>maxW){setBwInput("");return;}
              onLogBW(unit==="lb"?Math.round(lbToKg(n)*100)/100:n);
              setBwInput("");
            }} style={{background:c.accent,border:"none",borderRadius:11,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",flexShrink:0}}>Log</button>
          </div>
          {bwInput&&(parseFloat(bwInput)<(unit==="lb"?44:20)||parseFloat(bwInput)>(unit==="lb"?700:320))&&
            <div style={{fontSize:11,color:c.r,marginTop:5}}>Enter a valid weight ({unit==="lb"?"44–700 lb":"20–320 kg"})</div>
          }
        </div>

        {/* ── My Plates ── */}
        {onSetGymPlates&&(()=>{
          const PCOL_USE=unit==="lb"?PCOL_LB:PCOL;
          const FALLBACK_COLS=["#ef4444","#3b82f6","#f59e0b","#22c55e","#8b5cf6","#ec4899","#94a3b8","#f97316","#06b6d4","#84cc16","#a78bfa","#fb7185","#34d399","#fbbf24","#60a5fa"];
          // Show expanded standard set + any custom plates user has added
          const STANDARD_KG=[25,20,15,10,5,2.5,1.25,0.5,0.25];
          const STANDARD_LB=[55,45,35,25,15,10,5,2.5,1.25];
          const standardList=unit==="lb"?STANDARD_LB:STANDARD_KG;
          const customPlatesKg=gymPlates.filter(p=>!STANDARD_KG.some(s=>Math.abs(s-p)<0.01));
          return(
            <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:"16px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:18}}>🔵</span>
                <div style={{fontWeight:800,fontSize:14,color:c.text}}>My Plates</div>
                <span style={{fontSize:11,color:c.sub,marginLeft:"auto"}}>{unit==="lb"?"lb":"kg"} · tap to toggle</span>
              </div>
              <div style={{fontSize:12,color:c.sub,marginBottom:12,lineHeight:1.5}}>Tap a plate to add/remove it from your gym kit. Only selected plates appear in the + weight picker during workouts.</div>
              {/* Standard plates */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
                {standardList.map((p,i)=>{
                  const pKg=unit==="lb"?lbToKg(p):p;
                  const owned=gymPlates.some(g=>Math.abs(g-pKg)<0.01);
                  const col=PCOL_USE[p]||FALLBACK_COLS[i%FALLBACK_COLS.length];
                  return(
                    <button key={p} onClick={()=>onSetGymPlates(prev=>{
                      const already=prev.some(g=>Math.abs(g-pKg)<0.01);
                      return already?prev.filter(g=>Math.abs(g-pKg)>0.01):[...prev,pKg].sort((a,b)=>b-a);
                    })} style={{width:50,height:50,borderRadius:"50%",border:"3px solid "+(owned?col:"transparent"),background:owned?col:c.card2,color:owned?"#fff":c.sub,fontSize:11,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",opacity:owned?1:0.35,flexShrink:0}}>
                      {p}
                    </button>
                  );
                })}
              </div>
              {/* Custom plates (user-added) */}
              {customPlatesKg.length>0&&<div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.07em",marginBottom:6}}>MY CUSTOM PLATES</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  {customPlatesKg.map((pKg,i)=>{
                    const disp=unit==="lb"?Math.round(kgToLb(pKg)*4)/4:pKg;
                    return(
                      <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                        <div style={{width:50,height:50,borderRadius:"50%",background:FALLBACK_COLS[(i+9)%FALLBACK_COLS.length],display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:900}}>{disp}</div>
                        <button onClick={()=>onSetGymPlates(prev=>prev.filter(g=>Math.abs(g-pKg)>0.01))}
                          style={{background:c.rs,border:"none",borderRadius:6,padding:"2px 8px",fontSize:10,cursor:"pointer",color:c.r,fontFamily:"inherit"}}>✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>}
              {/* Add custom plate */}
              <div style={{display:"flex",gap:8,alignItems:"center",marginTop:8}}>
                <input type="number" inputMode="decimal" id="custom-plate-input" placeholder={"Custom plate ("+(unit==="lb"?"lb":"kg")+")…"}
                  style={{flex:1,background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"8px 12px",fontSize:13,color:c.text,outline:"none",fontFamily:"inherit"}}/>
                <button onClick={()=>{
                  const inp=document.getElementById("custom-plate-input");
                  const v=parseFloat(inp&&inp.value);
                  if(!v||v<=0||v>500)return;
                  const vKg=unit==="lb"?lbToKg(v):v;
                  onSetGymPlates(prev=>{
                    if(prev.some(g=>Math.abs(g-vKg)<0.01))return prev;
                    return[...prev,vKg].sort((a,b)=>b-a);
                  });
                  if(inp)inp.value="";
                }} style={{background:c.accent,border:"none",borderRadius:11,padding:"8px 14px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",flexShrink:0}}>+ Add</button>
              </div>
            </div>
          );
        })()}

        {/* ── Backup & Restore ── */}
        <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:"16px 16px 18px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:18}}>💾</span>
            <div style={{fontWeight:800,fontSize:14,color:c.text}}>Backup & Restore</div>
          </div>
          <div style={{fontSize:12,color:c.sub,marginBottom:6,lineHeight:1.6}}>
            IronLog <strong style={{color:c.g}}>auto-saves a snapshot to your device every day</strong> — no action needed. You can also export to a file for off-device storage (iCloud, Google Drive etc.).
          </div>
          {lastSnapshot&&<div style={{fontSize:11,color:c.g,marginBottom:10,background:c.gs,borderRadius:10,padding:"7px 11px"}}>✅ Last auto-snapshot: {fmtD(lastSnapshot)}</div>}
          <div style={{display:"flex",gap:9}}>
            <button onClick={onBackup} disabled={!hist.length} style={{flex:1,background:c.accent,color:"#fff",border:"none",borderRadius:13,padding:"11px 8px",fontSize:13,fontWeight:700,cursor:hist.length?"pointer":"not-allowed",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:hist.length?1:0.5}}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export File
            </button>
            <label style={{flex:1,background:c.card2,color:c.text,border:"1px solid "+c.border,borderRadius:13,padding:"11px 8px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Restore File
              <input type="file" accept=".json" onChange={onImport} style={{display:"none"}}/>
            </label>
          </div>
          <div style={{fontSize:11,color:c.sub,marginTop:10,textAlign:"center"}}>{hist.length} workout{hist.length!==1?"s":""} stored</div>
        </div>
      </div>
    </div>
  );
}

// ─── SW Notification helpers ─────────────────────────────────────────────────
function swNotif(delaySecs,label){
  if(!('serviceWorker' in navigator))return;
  var reg=window._swReg;
  if(!reg||!reg.active)return;
  if(delaySecs>0){
    reg.active.postMessage({type:'SCHEDULE_NOTIF',delay:delaySecs*1000,label:label||'Rest done — next set!'});
  } else {
    reg.active.postMessage({type:'CANCEL_NOTIF'});
  }
}
function requestNotifPermission(){
  if(!('Notification' in window))return Promise.resolve('denied');
  if(Notification.permission==='granted')return Promise.resolve('granted');
  return Notification.requestPermission();
}

// ─── Workout Calendar ─────────────────────────────────────────────────────────
function WorkoutCalendar({hist,c,unit}){
  const now=new Date();
  const [viewYear,setViewYear]=useState(now.getFullYear());
  const [viewMonth,setViewMonth]=useState(now.getMonth());
  // Build lookup: date→[muscles]
  const dateMap=React.useMemo(()=>{
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

// ─── Exercise History Card (inline in log) ─────────────────────────────────
function ExHistoryCard({name,hist,unit,c}){
  const sessions=React.useMemo(()=>{
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

// ─── Log ──────────────────────────────────────────────────────────────────────
function LogPage({initial:init,c,unit="kg",logName,finishRef,onSave,
  draftExs,setDraftExs,draftRating,setDraftRating,draftNotes,setDraftNotes,
  draftT0,onDiscard,timerSecs,timerStart,lastTimerSecs=60,startTimer,cycleTimer,stopTimer,
  customExercises={},onAddCustomEx,onDeleteCustomEx,onRenameCustomEx,hist=[],gymPlates=[],bwLog=[]}){
  // ALL hooks at top — no hooks after conditional returns (React rule #310)
  const exs=draftExs, setExs=setDraftExs;
  const rating=draftRating, setRating=setDraftRating;
  const notes=draftNotes, setNotes=setDraftNotes;
  const {confirm:dlgConfirm,confirmEl}=useConfirm(c);
  const [platePickerFor,setPlatePickerFor]=useState(null);
  const seeded=useRef(false);
  useEffect(()=>{seeded.current=false;},[init]);
  useEffect(()=>{
    if(!seeded.current&&init&&exs.length===0){
      setExs(init.exercises.map(e=>({...e,id:uid(),sets:e.sets.map(s=>({...s,id:uid(),done:false}))})));
      seeded.current=true;
    }
  },[init,exs.length]);
  const [elapsedSec,setElapsedSec]=useState(()=>Math.floor((Date.now()-draftT0.current)/1000));
  useEffect(()=>{
    const t=setInterval(()=>setElapsedSec(Math.floor((Date.now()-draftT0.current)/1000)),1000);
    return()=>clearInterval(t);
  },[]);
  const el=String(Math.floor(elapsedSec/60)).padStart(2,"0")+":"+String(elapsedSec%60).padStart(2,"0");

  // Screen Wake Lock — keeps screen on during workout
  useEffect(()=>{
    let lock=null;
    if('wakeLock' in navigator){
      navigator.wakeLock.request('screen').then(l=>{lock=l;}).catch(()=>{});
      const reacquire=()=>{if(document.visibilityState==='visible')navigator.wakeLock.request('screen').then(l=>{lock=l;}).catch(()=>{});};
      document.addEventListener('visibilitychange',reacquire);
      return()=>{document.removeEventListener('visibilitychange',reacquire);if(lock)lock.release().catch(()=>{});};
    }
  },[]);
  const [picker,setPicker]=useState(false);
  const [pm,setPm]=useState(MG[0]);
  const [search,setSearch]=useState("");
  const [newExName,setNewExName]=useState("");
  const [editingEx,setEditingEx]=useState(null);
  const [editExVal,setEditExVal]=useState("");
  const [saved,setSaved]=useState(false);
  const [focusedExId,setFocusedExId]=useState(null);
  const [exNotes,setExNotes]=useState({}); // {exId: string} — per-exercise cues
  const [notifGranted,setNotifGranted]=useState(typeof Notification!=='undefined'&&Notification.permission==='granted');

  // ── Feature 1: last session lookup ────────────────────────────────────────
  const lastSessionSets=(name)=>{
    for(var i=hist.length-1;i>=0;i--){
      var ex=hist[i].exercises.find(e=>e.name===name);
      if(ex&&ex.sets&&ex.sets.length)return ex.sets;
    }
    return null;
  };

  // ── Feature 3: overload indicator ─────────────────────────────────────────
  const overloadBadge=(ex)=>{
    var last=lastSessionSets(ex.name);
    if(!last)return null;
    var lastVol=last.reduce((s,x)=>(parseFloat(x.weight)||0)*(parseInt(x.reps)||0)+s,0);
    var curVol=ex.sets.filter(s=>s.done).reduce((s,x)=>(parseFloat(x.weight)||0)*(parseInt(x.reps)||0)+s,0);
    var lastMaxW=Math.max(...last.map(s=>parseFloat(s.weight)||0));
    var curMaxW=Math.max(...ex.sets.filter(s=>s.done).map(s=>parseFloat(s.weight)||0),0);
    if(curVol===0&&curMaxW===0)return{icon:"📋",text:"Last: "+last[0].reps+"×"+(unit==="lb"?Math.round(kgToLb(parseFloat(last[0].weight)||0)):parseFloat(last[0].weight)||0)+unit,col:c.sub};
    if(curMaxW>lastMaxW)return{icon:"↑",text:"Weight PR!",col:c.g};
    if(curVol>lastVol)return{icon:"↑",text:"Vol up",col:c.g};
    if(curVol===lastVol)return{icon:"→",text:"Same",col:c.am};
    return{icon:"↓",text:"Vol down",col:c.r};
  };

  const addEx=(name)=>{
    var last=lastSessionSets(name);
    // Infer default bar type from exercise name
    var defaultBar="barbell";
    var n=name.toLowerCase();
    if(n.includes("dumbbell")||n.includes("db")||n.includes("cable")||n.includes("machine")||n.includes("lateral raise")||n.includes("fly")||n.includes("curl")&&!n.includes("barbell")&&!n.includes("ez"))defaultBar="dumbbell";
    if(n.includes("pull-up")||n.includes("pullup")||n.includes("chin")||n.includes("push-up")||n.includes("pushup")||n.includes("plank")||n.includes("dip"))defaultBar="none";
    if(n.includes("ez")||n.includes("skull"))defaultBar="ez";
    var sets=last
      ? last.map(s=>({id:uid(),reps:s.reps,weight:s.weight,done:false,bodyweight:s.bodyweight||false}))
      : [{id:uid(),reps:"",weight:"",done:false,bodyweight:false}];
    setExs(p=>[...p,{id:uid(),name,muscle:pm,sets,bodyweight:false,barType:last?last[0].barType||defaultBar:defaultBar}]);
    setPicker(false);setSearch("");
  };
  const submitNewEx=()=>{
    var n=newExName.trim();if(!n)return;
    if((customExercises[pm]||[]).includes(n)||(EX[pm]||[]).includes(n)){
      dlgConfirm('"'+n+'" already exists in '+pm+'. Choose a different name.').then(()=>{});return;
    }
    onAddCustomEx(pm,n);setNewExName("");
  };
  const [autoRest,setAutoRest]=useState(true); // auto-start rest timer on set completion
  const upd=React.useCallback((eid,sid,f,v)=>setExs(p=>p.map(e=>e.id!==eid?e:{...e,sets:e.sets.map(s=>s.id!==sid?s:{...s,[f]:v})})),[]);
  const tog=React.useCallback((eid,sid)=>{
    setExs(p=>{
      const next=p.map(e=>e.id!==eid?e:{...e,sets:e.sets.map(s=>s.id!==sid?s:{...s,done:!s.done})});
      const prevEx=p.find(e=>e.id===eid);
      const prevSet=prevEx&&prevEx.sets.find(s=>s.id===sid);
      const justCompleted=prevSet&&!prevSet.done;
      if(justCompleted){try{if(navigator.vibrate)navigator.vibrate(50);}catch(e){}}
    //  if(justCompleted&&autoRest&&timerSecs===0){
      if(justCompleted&&autoRest){
        startTimer(lastTimerSecs);
        // SW notification for locked-screen alert
        if(notifGranted)swNotif(lastTimerSecs,'Rest done — '+lastTimerSecs+'s. Next set!');
      }
      return next;
    });
  },[autoRest,timerSecs,lastTimerSecs,startTimer,notifGranted]);
  // addS copies last set's weight+reps (set copy feature)
  const addS=eid=>setExs(p=>p.map(e=>{
    if(e.id!==eid)return e;
    const l=e.sets[e.sets.length-1];
    return{...e,sets:[...e.sets,{id:uid(),reps:l?l.reps:"",weight:l?l.weight:"",done:false,bodyweight:l?!!l.bodyweight:false,label:l&&l.label==="Working"?l.label:"Working"}]};
  }));
  const remS=(eid,sid)=>setExs(p=>p.map(e=>e.id!==eid?e:{...e,sets:e.sets.filter(s=>s.id!==sid)}));
  const remE=eid=>setExs(p=>p.filter(e=>e.id!==eid));
  // Feature 4: bodyweight toggle per exercise
  const toggleBW=(eid)=>setExs(p=>p.map(e=>e.id!==eid?e:{...e,bodyweight:!e.bodyweight,sets:e.sets.map(s=>({...s,bodyweight:!e.bodyweight,weight:!e.bodyweight?"BW":""}))}));
  const finish=()=>{if(!exs.length)return;onSave({id:uid(),name:(logName||"").trim()||"Workout "+fmtD(today()),date:today(),exercises:exs,rating,notes});setSaved(true);};
  useEffect(()=>{if(finishRef)finishRef.current=finish;},[exs,rating,notes,logName,saved]);
  const tv=exs.reduce((s,e)=>s+calcVol(e.sets.filter(x=>!x.bodyweight)),0);
  const doneCount=exs.reduce((s,e)=>s+e.sets.filter(x=>x.done).length,0);
  const total=exs.reduce((s,e)=>s+e.sets.length,0);

  // Feature 2: search filter
  const searchLower=search.toLowerCase().trim();
  const filteredCustom=(customExercises[pm]||[]).filter(n=>!searchLower||n.toLowerCase().includes(searchLower));
  const filteredBuiltin=(EX[pm]||[]).filter(n=>!searchLower||n.toLowerCase().includes(searchLower));
  // When searching, also search across all muscle groups
  const searchResults=searchLower?MG.flatMap(m=>[...(customExercises[m]||[]),...(EX[m]||[])].filter(n=>n.toLowerCase().includes(searchLower)).map(n=>({name:n,muscle:m}))):[];

  return(
    <div style={{paddingBottom:120}}>
      {confirmEl}
      <div style={{background:c.bg,padding:"8px 16px 10px",borderBottom:"1px solid "+c.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontSize:11,color:c.sub,display:"flex",alignItems:"center",gap:5,fontVariantNumeric:"tabular-nums"}}>{el} elapsed · {doneCount}/{total} sets <Tip c={c} text="Elapsed time since you started this workout. Progress bar shows completed vs total sets."/></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <RestTimerCircle c={c} timerSecs={timerSecs} timerStart={timerStart} onCycle={cycleTimer} onDone={stopTimer}/>
            {/* Auto-rest toggle */}
            <button onClick={()=>setAutoRest(a=>!a)} title={autoRest?"Auto-rest ON: timer starts when you complete a set":"Auto-rest OFF: start timer manually"} style={{background:autoRest?c.accent+"22":c.card2,border:"1px solid "+(autoRest?c.accent:c.border),borderRadius:8,padding:"3px 7px",fontSize:9,fontWeight:700,cursor:"pointer",color:autoRest?c.accent:c.sub,fontFamily:"inherit",flexShrink:0,lineHeight:1.3}}>AUTO</button>
            {!notifGranted&&'Notification' in window&&<button onClick={()=>requestNotifPermission().then(p=>{if(p==='granted')setNotifGranted(true);})} style={{background:c.card2,border:"1px solid "+c.border,borderRadius:8,padding:"3px 7px",fontSize:9,fontWeight:700,cursor:"pointer",color:c.sub,fontFamily:"inherit",flexShrink:0,lineHeight:1.3}} title="Enable notifications for rest timer">🔔</button>}
            <span style={{fontSize:11,color:c.sub,fontWeight:600}}>{(unit==="lb"?Math.round(kgToLb(tv)):tv).toLocaleString()} {unit}</span>
            {exs.length>0&&!saved&&<button onClick={()=>dlgConfirm("Discard this workout?\nAll sets will be lost.").then(ok=>{if(ok)onDiscard();})} style={{background:c.rs,border:"none",borderRadius:8,padding:"3px 9px",fontSize:11,fontWeight:700,cursor:"pointer",color:c.r,fontFamily:"inherit"}}>Discard</button>}
          </div>
        </div>
        <div style={{height:3,background:c.muted,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",background:c.accent,borderRadius:99,width:total?(doneCount/total*100)+"%":"0%",transition:"width .4s"}}/>
        </div>
      </div>
      <div style={{padding:"14px 16px 0"}}>
        <div style={{display:"flex",gap:9,marginBottom:16,alignItems:"center"}}>
          <div style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"5px 12px",fontSize:12,color:c.sub,fontWeight:600}}>{fmtD(today())}</div>
          <div style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"5px 12px",fontSize:12,color:c.sub,fontWeight:600}}>{exs.length} exercise{exs.length!==1?"s":""}</div>
          <div style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"5px 12px",fontSize:12,color:c.sub,fontWeight:600}}>{(unit==="lb"?Math.round(kgToLb(tv)):tv).toLocaleString()} {unit}</div>
        </div>
        {exs.map(ex=>{
          const rm=bestRM(ex.sets.filter(s=>!s.bodyweight));
          const badge=overloadBadge(ex);
          const isBW=!!ex.bodyweight;
          const PCOL_USE=unit==="lb"?PCOL_LB:PCOL;
          const exBarType=BAR_TYPES.find(b=>b.id===(ex.barType||"barbell"))||BAR_TYPES[0];
          const barKgForEx=exBarType.kg;
          const barDispForEx=unit==="lb"?exBarType.lbEquiv:barKgForEx;
          return(
            <div key={ex.id} style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:15,marginBottom:13}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{flex:1,minWidth:0,paddingRight:8}}>
                  <button onClick={()=>setFocusedExId(ex.id)} style={{background:"none",border:"none",padding:0,cursor:"pointer",textAlign:"left",width:"100%",fontFamily:"inherit"}}>
                    <div style={{fontWeight:800,fontSize:15,color:c.text,wordBreak:"break-word"}}>{ex.name}
                      <span style={{fontSize:10,color:c.accent,fontWeight:600,marginLeft:6}}>⤢ Focus</span>
                    </div>
                  </button>
                  <div style={{display:"flex",gap:7,marginTop:3,alignItems:"center",flexWrap:"wrap"}}>
                    <Pill label={ex.muscle} col={c.at} bg={c.as}/>
                    {!isBW&&rm>0&&<span style={{fontSize:11,color:c.sub}}>~1RM: <strong style={{color:c.text}}>{unit==="lb"?kgToLb(rm):rm}{unit}</strong></span>}
                    {badge&&<span style={{fontSize:11,fontWeight:700,color:badge.col}}>{badge.icon} {badge.text}</span>}
                    {ex.progressionApplied&&<span style={{fontSize:10,fontWeight:700,color:c.g,background:c.gs,borderRadius:8,padding:"2px 7px"}}>📈 +{ex.progressionApplied}{unit} applied</span>}
                    {ex.deloadApplied&&<span style={{fontSize:10,fontWeight:700,color:c.am,background:c.ams,borderRadius:8,padding:"2px 7px"}}>🔄 Deload -10%</span>}
                  </div>
                </div>
                <button onClick={()=>dlgConfirm("Remove "+ex.name+"?").then(ok=>{if(ok)remE(ex.id);})}
                  style={{background:c.rs,border:"none",borderRadius:10,padding:"10px 12px",cursor:"pointer",color:c.r,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,minWidth:40,minHeight:40}}>
                  <ITrash/>
                </button>
              </div>
              {/* Exercise history (last 3 sessions) */}
              <ExHistoryCard name={ex.name} hist={hist} unit={unit} c={c}/>
              {/* Exercise notes / cues */}
              {(exNotes[ex.id]!==undefined||false)&&<div style={{marginBottom:8}}>
                <textarea value={exNotes[ex.id]||""} onChange={e2=>setExNotes(p=>({...p,[ex.id]:e2.target.value}))}
                  placeholder="Form cues, notes for this exercise…" rows={2}
                  style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:10,padding:"7px 10px",fontSize:12,color:c.text,fontFamily:"inherit",resize:"none",outline:"none",boxSizing:"border-box"}}/>
              </div>}
              <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                <button onClick={()=>setExNotes(p=>({...p,[ex.id]:p[ex.id]!==undefined?undefined:""}))}
                  style={{background:exNotes[ex.id]!==undefined?c.accent+"22":c.card2,border:"1px solid "+(exNotes[ex.id]!==undefined?c.accent:c.border),borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:700,cursor:"pointer",color:exNotes[ex.id]!==undefined?c.accent:c.sub,fontFamily:"inherit"}}>
                  {exNotes[ex.id]!==undefined?"✎ Notes":"+ Notes"}
                </button>
                <button onClick={()=>setExs(p=>p.map(x=>x.id!==ex.id?x:{...x,isSuperset:!x.isSuperset}))}
                  style={{background:ex.isSuperset?c.am+"22":c.card2,border:"1px solid "+(ex.isSuperset?c.am:c.border),borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:700,cursor:"pointer",color:ex.isSuperset?c.am:c.sub,fontFamily:"inherit"}}>
                  {ex.isSuperset?"⚡ Superset ON":"⚡ Superset"}
                </button>
              </div>
              {ex.isSuperset&&<div style={{fontSize:11,color:c.am,background:c.ams,borderRadius:8,padding:"5px 10px",marginBottom:8}}>⚡ Superset — no rest between this and the next exercise</div>}
              {/* Controls row */}
              <div style={{display:"flex",gap:7,marginBottom:9,alignItems:"center"}}>
                {!isBW&&<select value={ex.barType||"barbell"} onChange={e=>setExs(p=>p.map(x=>x.id!==ex.id?x:{...x,barType:e.target.value}))}
                  style={{background:c.card2,border:"1px solid "+c.border,borderRadius:8,padding:"5px 8px",fontSize:11,color:c.sub,fontFamily:"inherit",cursor:"pointer",flex:1}}>
                  {BAR_TYPES.map(b=><option key={b.id} value={b.id}>{b.label}{b.kg>0?" ("+(unit==="lb"?b.lbEquiv:b.kg)+unit+")":""}</option>)}
                </select>}
                <button onClick={()=>toggleBW(ex.id)} style={{background:isBW?c.accent+"22":c.card2,border:"1px solid "+(isBW?c.accent:c.border),borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer",color:isBW?c.accent:c.sub,fontFamily:"inherit",flexShrink:0}}>{isBW?"✓ BW":"BW"}</button>
              </div>
              {/* BW extra weight field */}
              {isBW&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9,background:c.card2,borderRadius:10,padding:"8px 12px",flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:c.sub,flexShrink:0}}>Base: <strong style={{color:c.text}}>{bwLog.length>0?(unit==="lb"?Math.round(kgToLb(bwLog[bwLog.length-1].kg)*10)/10:bwLog[bwLog.length-1].kg):"??"}{unit}</strong></span>
                <span style={{fontSize:12,color:c.sub,flexShrink:0}}>+ Extra:</span>
                <input type="number" inputMode="decimal" value={ex.bwExtra||""} placeholder="0" onChange={e=>setExs(p=>p.map(x=>x.id!==ex.id?x:{...x,bwExtra:e.target.value}))}
                  style={{background:c.card,border:"1.5px solid "+c.border,borderRadius:8,padding:"5px 8px",fontSize:13,color:c.text,outline:"none",width:64,textAlign:"center",fontFamily:"inherit"}}/>
                <span style={{fontSize:12,color:c.sub,flexShrink:0}}>{unit}</span>
                {bwLog.length>0&&(parseFloat(ex.bwExtra)||0)>0&&<span style={{fontSize:11,color:c.accent,fontWeight:700,flexShrink:0}}>= {unit==="lb"?Math.round((kgToLb(bwLog[bwLog.length-1].kg)+(parseFloat(ex.bwExtra)||0))*10)/10:Math.round(((bwLog[bwLog.length-1]?.kg||0)+(parseFloat(ex.bwExtra)||0))*10)/10}{unit}</span>}
              </div>}
              <div style={{display:"grid",gridTemplateColumns:isBW?"22px 1fr 38px":"22px 1fr 1fr 38px",gap:5,marginBottom:7}}>
                {(isBW?["#","Reps","✓"]:["#",unit,"Reps","✓"]).map(h=><div key={h} style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.06em",textAlign:"center"}}>{h}</div>)}
              </div>
              {ex.sets.map((s,idx)=>{
                const wDisp=!isBW?(parseFloat(unit==="lb"?fmtW(s.weight,"lb"):s.weight)||0):0;
                const plates=(!isBW&&barKgForEx>0&&wDisp>(unit==="lb"?barDispForEx:barKgForEx))?calcPlates(wDisp,unit,unit==="lb"?barDispForEx:barKgForEx):[];
                const setLabel=s.label;
                const labelCol=setLabel==="Warm-up"?c.am:setLabel==="Drop set"?c.r:null;
                return(
                  <div key={s.id}>
                    {setLabel&&setLabel!=="Working"&&<div style={{fontSize:9,fontWeight:700,color:labelCol,letterSpacing:"0.06em",paddingLeft:28,marginBottom:2}}>{setLabel.toUpperCase()}</div>}
                    <div style={{display:"grid",gridTemplateColumns:isBW?"22px 1fr 38px":"22px 1fr 1fr 38px",gap:5,marginBottom:plates.length?2:5,alignItems:"center",opacity:s.done?0.5:1,transition:"opacity .2s"}}>
                      <div style={{textAlign:"center",fontSize:12,color:c.sub,fontWeight:700}}>{idx+1}</div>
                      {!isBW&&<div style={{display:"flex",gap:3,alignItems:"center"}}>
                        <NIn value={s.weight&&parseFloat(s.weight)?fmtW(s.weight,unit):s.weight} onChange={v=>upd(ex.id,s.id,"weight",unit==="lb"&&v?String(storeW(v,"lb")):v)} c={c}/>
                        <button onClick={()=>setPlatePickerFor({eid:ex.id,sid:s.id,cur:parseFloat(unit==="lb"?fmtW(s.weight,unit):s.weight)||0,barType:ex.barType||"barbell"})}
                          style={{background:c.accent+"22",border:"1px solid "+c.accent+"55",borderRadius:8,padding:"8px 7px",cursor:"pointer",color:c.accent,fontSize:13,fontWeight:900,lineHeight:1,flexShrink:0}}>+</button>
                      </div>}
                      <NIn value={s.reps} onChange={v=>upd(ex.id,s.id,"reps",v)} c={c}/>
                      <button onClick={()=>s.done?remS(ex.id,s.id):tog(ex.id,s.id)} style={{background:s.done?c.gs:c.card2,border:"1.5px solid "+(s.done?c.g:c.border),borderRadius:9,padding:8,cursor:"pointer",color:s.done?c.g:c.sub,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>{s.done?<ICheck/>:<IX/>}</button>
                    </div>
                    {plates.length>0&&!s.done&&<div style={{display:"flex",alignItems:"center",gap:3,paddingLeft:27,paddingBottom:6,flexWrap:"wrap"}}>
                      {/* Left side plates */}
                      {plates.map((p,pi)=><span key={"L"+pi} style={{background:PCOL_USE[p]||"#555",color:"#fff",borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:800}}>{p}</span>)}
                      {barDispForEx>0&&<span style={{fontSize:10,color:c.sub,margin:"0 2px"}}>|{barDispForEx}{unit}|</span>}
                      {/* Right side plates (reverse order — same as physical loading) */}
                      {[...plates].reverse().map((p,pi)=><span key={"R"+pi} style={{background:PCOL_USE[p]||"#555",color:"#fff",borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:800}}>{p}</span>)}
                    </div>}
                  </div>
                );
              })}
              <button onClick={()=>addS(ex.id)} style={{width:"100%",marginTop:5,background:"none",border:"1.5px dashed "+c.border,borderRadius:11,padding:"8px",fontSize:12,color:c.sub,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>+ Add set</button>
            </div>
          );
        })}
        <button onClick={()=>setPicker(true)} style={{width:"100%",background:"none",border:"2px dashed "+c.border,borderRadius:20,padding:17,fontSize:14,color:c.sub,cursor:"pointer",fontFamily:"inherit",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginBottom:16}}><IPlus/> Add Exercise</button>
        {exs.length>0&&<div style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:16,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,color:c.text,marginBottom:10}}>How did it feel?</div>
          <div style={{display:"flex",gap:7,marginBottom:12}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setRating(n)} style={{flex:1,background:"none",border:"none",cursor:"pointer",fontSize:24,opacity:n<=rating?1:0.2,transition:"opacity .15s",fontFamily:"inherit"}}>⭐</button>)}</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes, PRs, how you felt…" rows={2} style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"9px 12px",fontSize:13,color:c.text,fontFamily:"inherit",resize:"none",outline:"none",boxSizing:"border-box"}}/>
        </div>}
      </div>

      {/* ── Focus Mode Modal ── */}
      {focusedExId&&(()=>{
        const ex=exs.find(e=>e.id===focusedExId);if(!ex)return null;
        const isBW=!!ex.bodyweight;
        const exBarType=BAR_TYPES.find(b=>b.id===(ex.barType||"barbell"))||BAR_TYPES[0];
        const barKgF=exBarType.kg,barDispF=unit==="lb"?exBarType.lbEquiv:barKgF;
        const PCOL_USE2=unit==="lb"?PCOL_LB:PCOL;
        return(
          <div style={{position:"fixed",inset:0,background:c.bg,zIndex:300,display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{width:"100%",maxWidth:430,height:"100%",display:"flex",flexDirection:"column",overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:"env(safe-area-inset-bottom,20px)"}}>
            <div style={{background:c.card,padding:"env(safe-area-inset-top,0px) 16px 14px",borderBottom:"1px solid "+c.border,position:"sticky",top:0,zIndex:1,display:"flex",alignItems:"center",gap:12,flexShrink:0,paddingTop:"calc(env(safe-area-inset-top,0px) + 14px)"}}>
              <button onClick={()=>setFocusedExId(null)} style={{background:c.card2,border:"none",borderRadius:10,padding:"10px 16px",fontSize:14,fontWeight:700,cursor:"pointer",color:c.text,fontFamily:"inherit",flexShrink:0,minHeight:44}}>← Back</button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:900,fontSize:17,color:c.text,letterSpacing:"-0.02em",lineHeight:1.2,wordBreak:"break-word"}}>{ex.name}</div>
                <Pill label={ex.muscle} col={c.at} bg={c.as}/>
              </div>
              <button onClick={()=>addS(ex.id)} style={{background:c.accent,border:"none",borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",flexShrink:0,minHeight:44}}>+ Set</button>
            </div>
            <div style={{padding:"16px 16px 0",flex:1}}>
              {/* Controls */}
              <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
                {!isBW&&<select value={ex.barType||"barbell"} onChange={e=>setExs(p=>p.map(x=>x.id!==ex.id?x:{...x,barType:e.target.value}))}
                  style={{flex:1,minWidth:120,background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"10px 10px",fontSize:13,color:c.sub,fontFamily:"inherit",cursor:"pointer"}}>
                  {BAR_TYPES.map(b=><option key={b.id} value={b.id}>{b.label}{b.kg>0?" ("+(unit==="lb"?b.lbEquiv:b.kg)+unit+")":""}</option>)}
                </select>}
                <button onClick={()=>toggleBW(ex.id)} style={{background:isBW?c.accent+"22":c.card2,border:"1px solid "+(isBW?c.accent:c.border),borderRadius:10,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer",color:isBW?c.accent:c.sub,fontFamily:"inherit",flexShrink:0,minHeight:44}}>{isBW?"✓ BW":"BW"}</button>
              </div>
              {isBW&&bwLog.length>0&&<div style={{background:c.card2,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:13,color:c.sub,flexShrink:0}}>Base: <strong style={{color:c.text}}>{unit==="lb"?Math.round(kgToLb(bwLog[bwLog.length-1].kg)*10)/10:bwLog[bwLog.length-1].kg}{unit}</strong></span>
                <span style={{fontSize:13,color:c.sub,flexShrink:0}}>+ Extra:</span>
                <input type="number" inputMode="decimal" value={ex.bwExtra||""} placeholder="0"
                  onChange={e=>setExs(p=>p.map(x=>x.id!==ex.id?x:{...x,bwExtra:e.target.value}))}
                  style={{background:c.card,border:"1.5px solid "+c.border,borderRadius:9,padding:"8px 10px",fontSize:15,color:c.text,outline:"none",width:80,textAlign:"center",fontFamily:"inherit"}}/>
                <span style={{fontSize:13,color:c.sub,flexShrink:0}}>{unit}</span>
              </div>}
              {/* Big set rows */}
              {ex.sets.map((s,idx)=>{
                const wDisp2=!isBW?(parseFloat(unit==="lb"?fmtW(s.weight,unit):s.weight)||0):0;
                const plates2=(!isBW&&barKgF>0&&wDisp2>barDispF)?calcPlates(wDisp2,unit,unit==="lb"?barDispF:barKgF):[];
                return(
                  <div key={s.id} style={{background:s.done?c.gs:c.card,border:"2px solid "+(s.done?c.g:c.border),borderRadius:20,padding:"16px",marginBottom:14,transition:"all .2s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:8}}>
                      <span style={{fontSize:13,fontWeight:700,color:s.done?c.g:c.sub,flexShrink:0}}>SET {idx+1}{s.label&&s.label!=="Working"?" · "+s.label:""}</span>
                      <button onClick={()=>s.done?remS(ex.id,s.id):tog(ex.id,s.id)}
                        style={{background:s.done?c.g:c.accent,border:"none",borderRadius:12,padding:"12px 18px",fontSize:14,fontWeight:900,cursor:"pointer",color:"#fff",fontFamily:"inherit",minHeight:44,flexShrink:0}}>
                        {s.done?"✓ Done":"Mark Done"}
                      </button>
                    </div>
                    {!isBW&&<div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>WEIGHT ({unit})</div>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <input type="number" inputMode="decimal"
                            value={s.weight&&parseFloat(s.weight)?fmtW(s.weight,unit):s.weight}
                            onChange={v=>upd(ex.id,s.id,"weight",unit==="lb"&&v.target.value?String(storeW(v.target.value,"lb")):v.target.value)}
                            style={{flex:1,minWidth:0,background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                          <button onClick={()=>setPlatePickerFor({eid:ex.id,sid:s.id,cur:parseFloat(unit==="lb"?fmtW(s.weight,unit):s.weight)||0,barType:ex.barType||"barbell"})}
                            style={{background:c.accent,border:"none",borderRadius:12,padding:"14px 14px",fontSize:20,fontWeight:900,cursor:"pointer",color:"#fff",flexShrink:0,minHeight:44}}>+</button>
                        </div>
                        {plates2.length>0&&<div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
                          {/* Left side */}
                          {plates2.map((p,pi)=><div key={"L"+pi} style={{width:32,height:32,borderRadius:"50%",background:PCOL_USE2[p]||"#555",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:900,flexShrink:0}}>{p}</div>)}
                          {barKgF>0&&<span style={{fontSize:10,color:c.sub,margin:"0 2px",fontWeight:700}}>|{barDispF}{unit}|</span>}
                          {/* Right side (reversed) */}
                          {[...plates2].reverse().map((p,pi)=><div key={"R"+pi} style={{width:32,height:32,borderRadius:"50%",background:PCOL_USE2[p]||"#555",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:900,flexShrink:0}}>{p}</div>)}
                        </div>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>REPS</div>
                        <input type="number" inputMode="numeric" value={s.reps} onChange={v=>upd(ex.id,s.id,"reps",v.target.value)}
                          style={{width:"100%",background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                      </div>
                    </div>}
                    {isBW&&<div style={{marginBottom:10}}>
                      <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:6}}>REPS</div>
                      <input type="number" inputMode="numeric" value={s.reps} onChange={v=>upd(ex.id,s.id,"reps",v.target.value)}
                        style={{width:"100%",background:c.card2,border:"2px solid "+c.border,borderRadius:12,padding:"14px 6px",fontSize:22,fontWeight:800,color:c.text,outline:"none",textAlign:"center",fontFamily:"inherit",boxSizing:"border-box"}}/>
                    </div>}
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        );
      })()}

      {/* ── Plate Picker Modal (+ button) ── */}
      {platePickerFor&&(()=>{
        const PCOL_USE2=unit==="lb"?PCOL_LB:PCOL;
        const barType=BAR_TYPES.find(b=>b.id===platePickerFor.barType)||BAR_TYPES[0];
        const barDisp=unit==="lb"?barType.lbEquiv:barType.kg;
        // Default perSide = true only for barbell/EZ bar — cables/machines are single
        const defaultPerSide=barType.id==="barbell"||barType.id==="ez";
        const [perSide,setPerSide]=platePickerFor._perSide!==undefined
          ?[platePickerFor._perSide,(v)=>setPlatePickerFor(prev=>({...prev,_perSide:v}))]
          :[defaultPerSide,(v)=>setPlatePickerFor(prev=>({...prev,_perSide:v}))];
        const [customPlateInput,setCustomPlateInput]=platePickerFor._cpi!==undefined
          ?[platePickerFor._cpi,(v)=>setPlatePickerFor(prev=>({...prev,_cpi:v}))]
          :["",(v)=>setPlatePickerFor(prev=>({...prev,_cpi:v}))];
        const plateList=gymPlates.length>0
          ?gymPlates.map(p=>unit==="lb"?Math.round(kgToLb(p)*4)/4:p)
          :(unit==="lb"?PLATES_LB:PLATES_KG);
        // cur = bar + plates total (same unit as display).
        // If weight was 0 and bar exists, start at barDisp so first plate tap gives correct total.
        const rawCur=platePickerFor.cur;
        const cur=rawCur<=0&&barDisp>0?barDisp:rawCur;
        const multiplier=perSide?2:1;
        // plateWeight = weight stored in the field = cur (bar+plates total)
        // adding a plate of size p: new total = cur + p*multiplier
        const addPlate=(p)=>{
          const newVal=Math.round((cur+p*multiplier)*1000)/1000;
          const stored=unit==="lb"?String(storeW(newVal,"lb")):String(newVal);
          upd(platePickerFor.eid,platePickerFor.sid,"weight",stored);
          setPlatePickerFor(prev=>({...prev,cur:newVal}));
        };
        const removePlate=(p)=>{
          // Don't go below bar weight
          const floor=barDisp>0?barDisp:0;
          const newVal=Math.max(floor,Math.round((cur-p*multiplier)*1000)/1000);
          const stored=unit==="lb"?String(storeW(newVal,"lb")):String(newVal);
          upd(platePickerFor.eid,platePickerFor.sid,"weight",stored);
          setPlatePickerFor(prev=>({...prev,cur:newVal}));
        };
        const addCustom=()=>{
          const v=parseFloat(customPlateInput);
          if(!v||v<=0||v>500)return;
          addPlate(v);
          setPlatePickerFor(prev=>({...prev,_cpi:""}));
        };
        // Plates currently loaded (for display): decompose cur - bar
        const platesSoFar=barDisp>0&&cur>barDisp?calcPlates(cur,unit,unit==="lb"?barType.lbEquiv:barType.kg):[];
        const FALLBACK_COLS=["#ef4444","#3b82f6","#f59e0b","#22c55e","#8b5cf6","#ec4899","#94a3b8","#f97316","#06b6d4","#84cc16","#a78bfa","#fb7185","#34d399","#fbbf24","#60a5fa"];
        return(
          <div onClick={()=>setPlatePickerFor(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
            <div onClick={e=>e.stopPropagation()} style={{background:c.card,borderRadius:"26px 26px 0 0",padding:"20px 18px 0",width:"100%",maxWidth:430,boxSizing:"border-box",maxHeight:"75vh",overflowY:"auto",WebkitOverflowScrolling:"touch",paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 20px)"}}>
              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontWeight:900,fontSize:17,color:c.text}}>Add Weight</div>
                <button onClick={()=>setPlatePickerFor(null)} style={{background:c.card2,border:"none",borderRadius:9,padding:"8px 14px",cursor:"pointer",color:c.sub,fontFamily:"inherit",fontSize:13,fontWeight:700,minHeight:44}}>Done</button>
              </div>
              {/* Total display — cur = bar + plates */}
              <div style={{background:c.card2,borderRadius:12,padding:"10px 14px",marginBottom:12}}>
                <div style={{fontSize:12,color:c.sub,marginBottom:4}}>Total weight on bar</div>
                <div style={{fontSize:22,fontWeight:900,color:c.text}}>{cur}{unit}</div>
                {barDisp>0&&<div style={{fontSize:11,color:c.sub,marginTop:3,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span>{barDisp}{unit} bar</span>
                  {platesSoFar.length>0&&<>
                    <span>+</span>
                    {platesSoFar.map((p,i)=><span key={i} style={{background:PCOL_USE2[p]||FALLBACK_COLS[i%FALLBACK_COLS.length],color:"#fff",borderRadius:5,padding:"1px 6px",fontSize:10,fontWeight:800}}>{p}</span>)}
                    <span style={{fontSize:10,color:c.sub}}>per side</span>
                  </>}
                </div>}
              </div>
              {/* Per-side toggle */}
              <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",background:c.card2,borderRadius:12,padding:"8px 12px"}}>
                <span style={{fontSize:12,color:c.sub,flex:1}}>
                  {perSide?"× 2 (one plate per side — barbell)":"× 1 (single — cable / machine / dumbbell)"}
                </span>
                <button onClick={()=>setPerSide(!perSide)} style={{background:perSide?c.accent:c.card,border:"1px solid "+c.border,borderRadius:9,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer",color:perSide?"#fff":c.sub,fontFamily:"inherit",flexShrink:0,minHeight:36}}>
                  {perSide?"÷2 → Single":"×2 → Per side"}
                </button>
              </div>
              {/* Plate circles */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:14}}>
                {plateList.map((p,i)=>(
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <button onClick={()=>addPlate(p)}
                      style={{width:56,height:56,borderRadius:"50%",background:PCOL_USE2[p]||FALLBACK_COLS[i%FALLBACK_COLS.length],border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:900,boxShadow:"0 3px 10px rgba(0,0,0,0.25)",flexShrink:0}}>
                      {p}
                    </button>
                    <button onClick={()=>removePlate(p)}
                      style={{background:c.card2,border:"1px solid "+c.border,borderRadius:7,padding:"3px 10px",fontSize:11,cursor:"pointer",color:c.sub,fontFamily:"inherit",minHeight:28}}>−</button>
                  </div>
                ))}
              </div>
              {/* Custom plate input */}
              <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
                <input type="number" inputMode="decimal" value={customPlateInput} onChange={e=>setCustomPlateInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")addCustom();}}
                  placeholder={"Custom weight ("+unit+")…"}
                  style={{flex:1,background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"9px 12px",fontSize:13,color:c.text,outline:"none",fontFamily:"inherit"}}/>
                <button onClick={addCustom} disabled={!parseFloat(customPlateInput)} style={{background:c.accent,border:"none",borderRadius:11,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",flexShrink:0,opacity:parseFloat(customPlateInput)?1:0.4}}>Add</button>
              </div>
              <button onClick={()=>{
                // Clear plates but keep bar weight in field
                const clearVal=barDisp>0?barDisp:0;
                const stored=unit==="lb"?String(storeW(clearVal,"lb")):String(clearVal);
                upd(platePickerFor.eid,platePickerFor.sid,"weight",stored);
                setPlatePickerFor(prev=>({...prev,cur:clearVal}));
              }} style={{width:"100%",background:c.rs,border:"none",borderRadius:12,padding:"11px",fontSize:13,fontWeight:700,cursor:"pointer",color:c.r,fontFamily:"inherit",marginBottom:4}}>Clear plates (keep bar)</button>
            </div>
          </div>
        );
      })()}

      {picker&&<div onClick={()=>{setPicker(false);setSearch("");setNewExName("");setEditingEx(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:100,display:"flex",alignItems:"flex-end"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:c.card,borderRadius:"26px 26px 0 0",padding:"22px 16px 48px",width:"100%",maxHeight:"82vh",overflowY:"auto",boxSizing:"border-box"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{margin:0,fontSize:19,fontWeight:900,color:c.text}}>Add Exercise</h3>
            <button onClick={()=>{setPicker(false);setSearch("");setNewExName("");setEditingEx(null);}} style={{background:c.card2,border:"none",borderRadius:9,padding:8,cursor:"pointer",color:c.sub,display:"flex"}}><IX/></button>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search all exercises…"
            style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:12,padding:"10px 14px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:12}}/>
          {searchLower
            ? <div>
                {searchResults.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:c.sub,fontSize:14}}>No exercises found</div>}
                {searchResults.map(({name,muscle})=>(
                  <button key={muscle+name} onClick={()=>{setPm(muscle);addEx(name);}} style={{width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:"1px solid "+c.border,padding:"13px 4px",fontSize:15,color:c.text,cursor:"pointer",fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:500}}>
                    <span>{name}</span><span style={{fontSize:11,color:c.sub,flexShrink:0,marginLeft:8}}>{muscle}</span>
                  </button>
                ))}
              </div>
            : <div>
                <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:10,marginBottom:12}}>
                  {MG.map(m=><button key={m} onClick={()=>{setPm(m);setNewExName("");setEditingEx(null);}} style={{flexShrink:0,border:"none",borderRadius:20,padding:"7px 13px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:pm===m?c.accent:c.card2,color:pm===m?"#fff":c.sub}}>{m}</button>)}
                </div>
                {filteredCustom.length>0&&<div style={{marginBottom:8}}>
                  <div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.08em",marginBottom:6,paddingLeft:4}}>MY EXERCISES — swipe left to delete</div>
                  {filteredCustom.map(name=>(
                    <SwipeToDelete key={name} onDelete={()=>onDeleteCustomEx(pm,name)} c={c}>
                      {editingEx===name
                        ?<div style={{flex:1,display:"flex",alignItems:"center",gap:6,padding:"8px 4px"}}>
                          <input autoFocus value={editExVal} onChange={e=>setEditExVal(e.target.value)}
                            onKeyDown={e=>{if(e.key==="Enter"){onRenameCustomEx(pm,name,editExVal);setEditingEx(null);}if(e.key==="Escape")setEditingEx(null);}}
                            style={{flex:1,background:c.card2,border:"1.5px solid "+c.accent,borderRadius:9,padding:"6px 10px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit"}}/>
                          <button onClick={()=>{onRenameCustomEx(pm,name,editExVal);setEditingEx(null);}} style={{background:c.accent,border:"none",borderRadius:8,padding:"6px 11px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit"}}>Save</button>
                          <button onClick={()=>setEditingEx(null)} style={{background:c.card2,border:"none",borderRadius:8,padding:"6px 10px",fontSize:12,cursor:"pointer",color:c.sub,fontFamily:"inherit"}}>✕</button>
                        </div>
                        :<>
                          <button onClick={()=>addEx(name)} style={{flex:1,textAlign:"left",background:"none",border:"none",padding:"13px 4px",fontSize:15,color:c.accent,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>★ {name}</button>
                          <button onClick={()=>{setEditingEx(name);setEditExVal(name);}} style={{background:"none",border:"none",padding:"8px 10px",cursor:"pointer",color:c.sub,fontSize:12,fontFamily:"inherit"}}>Edit</button>
                        </>
                      }
                    </SwipeToDelete>
                  ))}
                </div>}
                <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
                  <input value={newExName} onChange={e=>setNewExName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submitNewEx();}}
                    placeholder={"Add custom "+pm+" exercise…"}
                    style={{flex:1,background:c.card2,border:"1.5px solid "+c.border,borderRadius:11,padding:"9px 12px",fontSize:13,color:c.text,outline:"none",fontFamily:"inherit"}}/>
                  <button onClick={submitNewEx} disabled={!newExName.trim()} style={{background:newExName.trim()?c.accent:c.muted,border:"none",borderRadius:11,padding:"9px 14px",fontSize:13,fontWeight:700,cursor:newExName.trim()?"pointer":"default",color:newExName.trim()?"#fff":c.sub,fontFamily:"inherit",flexShrink:0}}>Add</button>
                </div>
                {filteredCustom.length>0&&<div style={{fontSize:10,color:c.sub,fontWeight:700,letterSpacing:"0.08em",marginBottom:6,paddingLeft:4}}>BUILT-IN</div>}
                {filteredBuiltin.map(name=><button key={name} onClick={()=>addEx(name)} style={{width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:"1px solid "+c.border,padding:"14px 4px",fontSize:15,color:c.text,cursor:"pointer",fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:500}}>{name}<IChev/></button>)}
              </div>
          }
        </div>
      </div>}
    </div>
  );
}

// ─── History ──────────────────────────────────────────────────────────────────
function HistoryPage({hist,c,unit="kg",onDelete,onExportCSV}){
  const [open,setOpen]=useState(null);
  const [share,setShare]=useState(null);
  const [search,setSearch]=useState("");
  const {confirm:dlgConfirm,confirmEl}=useConfirm(c);
  const filtered=React.useMemo(()=>{
    if(!search.trim())return [...hist].reverse();
    var q=search.toLowerCase();
    return [...hist].reverse().filter(w=>{
      if((w.name||"").toLowerCase().includes(q))return true;
      if((w.notes||"").toLowerCase().includes(q))return true;
      if(fmtD(w.date).toLowerCase().includes(q))return true;
      if(w.exercises&&w.exercises.some(e=>(e.name||"").toLowerCase().includes(q)))return true;
      return false;
    });
  },[hist,search]);
  if(!hist.length)return <Empty icon="📋" title="No workouts yet" sub="Start logging to see your history." c={c}/>;
  return(
    <div style={{padding:"20px 16px 100px"}}>
      {confirmEl}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h2 style={{fontSize:23,fontWeight:900,margin:0,color:c.text,letterSpacing:"-0.02em"}}>History</h2>
        {onExportCSV&&<button onClick={onExportCSV} disabled={!hist.length} style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer",color:c.sub,fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,opacity:hist.length?1:0.4}}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </button>}
      </div>
      {/* Search bar */}
      <div style={{position:"relative",marginBottom:14}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setOpen(null);}}
          placeholder="Search workouts, exercises, notes…"
          style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:12,padding:"10px 36px 10px 14px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:c.sub,fontSize:16,lineHeight:1,padding:4}}>×</button>}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:"32px 0",color:c.sub,fontSize:14}}>No workouts match "{search}"</div>}
      {filtered.map(w=>{
        const v=w.exercises.reduce((s,e)=>s+calcVol(e.sets),0),isO=open===w.id;
        return(
          <div key={w.id} style={{background:c.card,border:"1px solid "+c.border,borderRadius:19,marginBottom:11,overflow:"hidden"}}>
            <button onClick={()=>setOpen(isO?null:w.id)} style={{width:"100%",background:"none",border:"none",padding:"14px 15px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",WebkitTapHighlightColor:"rgba(124,110,250,0.1)"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:14,color:c.text,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.name}</div>
                <div style={{display:"flex",gap:6,fontSize:12,color:c.sub,flexWrap:"wrap",alignItems:"center"}}>
                  <span>{fmtD(w.date)}</span>
                  <span style={{color:c.border}}>·</span>
                  <span>{w.exercises.length} exercises</span>
                  <span style={{color:c.border}}>·</span>
                  <span>{unit==="lb"?Math.round(kgToLb(v)).toLocaleString():v.toLocaleString()} {unit}</span>
                  {w.rating>0&&<span>{"⭐".repeat(w.rating)}</span>}
                </div>
              </div>
              <div style={{color:c.sub,transform:isO?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",flexShrink:0,marginLeft:8,opacity:0.6}}><IChev/></div>
            </button>
            {isO&&<div style={{borderTop:"1px solid "+c.border,padding:"12px 15px 15px"}}>
              {w.exercises.map((ex,i)=>{const rm=bestRM(ex.sets);return<div key={i} style={{marginBottom:12}}><div style={{fontWeight:700,fontSize:13,color:c.text,marginBottom:5}}>{ex.name}{rm>0&&<span style={{fontSize:11,color:c.sub,marginLeft:7}}>~1RM {unit==="lb"?kgToLb(rm):rm}{unit}</span>}</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{ex.sets.map((s,j)=><div key={j} style={{background:c.card2,borderRadius:7,padding:"4px 9px",fontSize:11,color:c.sub,fontWeight:600}}>{unit==="lb"?kgToLb(parseFloat(s.weight)||0):s.weight}{unit}×{s.reps}</div>)}</div></div>;})}
              {w.notes&&<div style={{background:c.card2,borderRadius:11,padding:"9px 11px",fontSize:13,color:c.sub,marginBottom:11,fontStyle:"italic"}}>"{w.notes}"</div>}
              <div style={{display:"flex",gap:7}}>
                <GBtn onClick={()=>setShare(w)} c={c} style={{flex:1,justifyContent:"center"}}><IShare/>Share</GBtn>
                <DBtn onClick={()=>dlgConfirm("Delete \""+w.name+"\"?\nThis cannot be undone.").then(ok=>{if(ok){onDelete(w.id);setOpen(null);}})} c={c} style={{flex:1,justifyContent:"center"}}><ITrash/>Delete</DBtn>
              </div>
            </div>}
          </div>
        );
      })}
      {share&&<ShareCard workout={share} c={c} unit={unit} onClose={()=>setShare(null)}/>}
    </div>
  );
}

// ─── Calendar Card (collapsible wrapper for Progress page) ────────────────────
function CalendarCard({hist,c,unit}){
  const [open,setOpen]=useState(false);
  // Quick stats for the collapsed header
  const thisMonth=today().slice(0,7);
  const sessionsThisMonth=hist.filter(w=>w.date.startsWith(thisMonth)).length;
  return(
    <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,marginBottom:14,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{width:"100%",background:"none",border:"none",padding:"14px 16px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
        <span style={{fontSize:20}}>📅</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:14,color:c.text}}>Workout Calendar</div>
          <div style={{fontSize:11,color:c.sub,marginTop:1}}>{sessionsThisMonth} session{sessionsThisMonth!==1?"s":""} this month</div>
        </div>
        <span style={{fontSize:16,color:c.sub,transition:"transform .2s",transform:open?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>⌄</span>
      </button>
      {open&&<div style={{borderTop:"1px solid "+c.border,padding:"0 12px 12px"}}>
        <WorkoutCalendar hist={hist} c={c} unit={unit}/>
      </div>}
    </div>
  );
}

// ─── Progress ─────────────────────────────────────────────────────────────────
function ProgressPage({hist,c,unit="kg",bwLog=[],onLogBW,onDeleteBW,customExercises={}}){
  const [mode,setMode]=useState("weight");
  const [selExs,setSelExs]=useState([]);
  const [addingEx,setAddingEx]=useState(false);
  const [exMuscle,setExMuscle]=useState(MG[0]);
  const [range,setRange]=useState("3m"); // 1m 3m 6m 1y all

  // Filter hist by selected time range — memoized for performance
  const now=new Date();
  const rangeMs={
    "1m":30*864e5,"3m":90*864e5,"6m":180*864e5,"1y":365*864e5,"all":Infinity
  };
  const filteredHist=React.useMemo(()=>{
    const cutoff=rangeMs[range];
    if(cutoff===Infinity)return hist;
    return hist.filter(w=>(now-new Date(w.date))<=cutoff);
  },[hist,range]);

  if(!hist.length&&!bwLog.length)return <Empty icon="📈" title="No data yet" sub="Log workouts to see progress charts." c={c}/>;

  const allLoggedByMuscle=React.useMemo(()=>{
    const byMuscle={};
    hist.forEach(w=>w.exercises.forEach(ex=>{
      var m=ex.muscle||"";
      if(!byMuscle[m])byMuscle[m]=new Set();
      byMuscle[m].add(ex.name);
    }));
    return byMuscle;
  },[hist]);
  const exPickerList=React.useMemo(()=>{
    var logged=[...(allLoggedByMuscle[exMuscle]||new Set())];
    var custom=customExercises[exMuscle]||[];
    return [...new Set([...logged,...custom])].sort();
  },[allLoggedByMuscle,customExercises,exMuscle]);
  const allEx=React.useMemo(()=>[...new Set(hist.flatMap(w=>w.exercises.map(e=>e.name)))].sort(),[hist]);
  const toggleEx=name=>{setSelExs(p=>{if(p.includes(name))return p.filter(x=>x!==name);if(p.length>=4)return p;return[...p,name];});setAddingEx(false);};

  const series=React.useMemo(()=>selExs.map((name,si)=>{
    const points=[];
    filteredHist.forEach(w=>{
      const ex=w.exercises.find(e=>e.name===name);if(!ex)return;
      var rawVal=mode==="volume"?calcVol(ex.sets):mode==="1rm"?bestRM(ex.sets):Math.max(...ex.sets.map(s=>parseFloat(s.weight)||0));
      var val=unit==="lb"?(mode==="volume"?Math.round(kgToLb(rawVal)):kgToLb(rawVal)):rawVal;
      if(val>0)points.push({date:w.date,y:val});
    });
    points.sort((a,b)=>new Date(a.date)-new Date(b.date));
    return{label:name,data:points,color:CC[si%CC.length]};
  }),[selExs,filteredHist,mode,unit]);

  const weekBars=React.useMemo(()=>{
    const weeks={};
    filteredHist.forEach(w=>{const k=weekKey(w.date);weeks[k]=(weeks[k]||0)+w.exercises.reduce((s,e)=>s+calcVol(e.sets),0);});
    return Object.entries(weeks).sort((a,b)=>a[0].localeCompare(b[0])).map(([d,v])=>({date:d,vol:Math.round(unit==="lb"?kgToLb(v):v)}));
  },[filteredHist,unit]);

  const maxVol=Math.max(...weekBars.map(w=>w.vol),1);
  const modeLabel=mode==="weight"?"Max Weight ("+unit+")":mode==="1rm"?"Est. 1RM ("+unit+")":"Volume ("+unit+"×reps)";

  // Body weight chart
  const bwDisplay=bwLog.map(e=>({date:e.date,y:unit==="lb"?Math.round(kgToLb(e.kg)*10)/10:e.kg}));
  const bwMax=bwDisplay.length?Math.max(...bwDisplay.map(p=>p.y)):100;
  const bwMin=bwDisplay.length?Math.min(...bwDisplay.map(p=>p.y)):50;
  const BW=320,BH=100;
  const bpx=i=>bwDisplay.length<2?BW/2:(i/(bwDisplay.length-1))*BW;
  const bpy=v=>BH-((v-bwMin+2)/(Math.max(bwMax-bwMin+4,5)))*(BH*0.85);
  const bwPath=bwDisplay.length>1?bwDisplay.reduce((d,p,i)=>{
    if(i===0)return"M"+bpx(i)+","+bpy(p.y);
    const x0=bpx(i-1),y0=bpy(bwDisplay[i-1].y),x1=bpx(i),y1=bpy(p.y),cpx=(x0+x1)/2;
    return d+" C"+cpx+","+y0+" "+cpx+","+y1+" "+x1+","+y1;
  },""):"";

  const RANGES=[{k:"1m",l:"1M"},{k:"3m",l:"3M"},{k:"6m",l:"6M"},{k:"1y",l:"1Y"},{k:"all",l:"All"}];

  return(
    <div style={{padding:"20px 16px 100px"}}>
      <h2 style={{fontSize:23,fontWeight:900,margin:"0 0 4px",color:c.text,letterSpacing:"-0.02em"}}>Progress</h2>
      <p style={{fontSize:13,color:c.sub,marginBottom:14}}>Track your weights, volume and strength over time.</p>

      {/* Time range filter */}
      <div style={{display:"flex",gap:6,marginBottom:18,background:c.card2,borderRadius:12,padding:4}}>
        {RANGES.map(r=><button key={r.k} onClick={()=>setRange(r.k)} style={{flex:1,border:"none",borderRadius:9,padding:"6px 4px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:range===r.k?c.accent:"none",color:range===r.k?"#fff":c.sub,transition:"all .2s"}}>{r.l}</button>)}
      </div>

      {/* Body Weight Chart */}
      {bwLog.length>0&&<div style={{background:c.card,border:"1px solid "+c.border,borderRadius:22,padding:"18px 16px 14px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><div style={{fontWeight:800,fontSize:15,color:c.text}}>Body Weight</div><div style={{fontSize:11,color:c.sub,marginTop:2}}>{unit} · {bwLog.length} entr{bwLog.length===1?"y":"ies"}</div></div>
          {bwDisplay.length>=2&&<div style={{fontSize:12,fontWeight:700,color:bwDisplay[bwDisplay.length-1].y<=bwDisplay[0].y?c.g:c.r}}>
            {bwDisplay[bwDisplay.length-1].y<=bwDisplay[0].y?"↓":"↑"} {Math.abs(Math.round((bwDisplay[bwDisplay.length-1].y-bwDisplay[0].y)*10)/10)}{unit}
          </div>}
        </div>
        {bwDisplay.length>1&&<svg width="100%" viewBox={"0 0 "+BW+" "+(BH+24)} style={{display:"block",overflow:"visible"}}>
          <defs><linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.g} stopOpacity="0.3"/><stop offset="100%" stopColor={c.g} stopOpacity="0"/></linearGradient></defs>
          <path d={bwPath+" L"+bpx(bwDisplay.length-1)+","+BH+" L0,"+BH+" Z"} fill="url(#bwGrad)"/>
          <path d={bwPath} fill="none" stroke={c.g} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {bwDisplay.map((p,i)=>{
            const show=bwDisplay.length<=8||(i===0||i===bwDisplay.length-1||i%Math.ceil(bwDisplay.length/5)===0);
            return(<g key={i}>
              <circle cx={bpx(i)} cy={bpy(p.y)} r="3.5" fill={c.g}/>
              {show&&<><text x={bpx(i)} y={bpy(p.y)-7} textAnchor="middle" fontSize="9" fill={c.sub}>{p.y}</text>
              <text x={bpx(i)} y={BH+18} textAnchor="middle" fontSize="8" fill={c.sub}>{fmtD(p.date)}</text></>}
            </g>);
          })}
        </svg>}
        {bwDisplay.length===1&&<div style={{fontSize:13,color:c.sub,textAlign:"center",padding:"8px 0"}}>Log more entries to see your trend</div>}
        <div style={{marginTop:10,maxHeight:120,overflowY:"auto"}}>
          {[...bwLog].reverse().slice(0,6).map(e=>(
            <div key={e.date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderTop:"1px solid "+c.border}}>
              <span style={{fontSize:12,color:c.sub}}>{fmtD(e.date)}</span>
              <span style={{fontSize:13,fontWeight:700,color:c.text}}>{unit==="lb"?Math.round(kgToLb(e.kg)*10)/10:e.kg} {unit}</span>
              <button onClick={()=>onDeleteBW(e.date)} style={{background:"none",border:"none",cursor:"pointer",color:c.r,padding:"0 4px",display:"flex",alignItems:"center"}}><ITrash/></button>
            </div>
          ))}
        </div>
      </div>}

      {hist.length>0&&<>
      {/* Weight progression chart */}
      <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:22,padding:"18px 16px 14px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><div style={{fontWeight:800,fontSize:15,color:c.text}}>Weight Progression</div><div style={{fontSize:11,color:c.sub,marginTop:2}}>{modeLabel}</div></div>
          <div style={{display:"flex",gap:4,background:c.card2,borderRadius:10,padding:3}}>
            {[{k:"weight",l:"Wt"},{k:"1rm",l:"1RM"},{k:"volume",l:"Vol"}].map(m=><button key={m.k} onClick={()=>setMode(m.k)} style={{border:"none",borderRadius:8,padding:"4px 9px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:mode===m.k?c.accent:"none",color:mode===m.k?"#fff":c.sub}}>{m.l}</button>)}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
          {selExs.map((name,si)=><div key={name} style={{display:"flex",alignItems:"center",gap:4,background:CC[si%CC.length]+"22",border:"1px solid "+CC[si%CC.length]+"55",borderRadius:20,padding:"4px 10px"}}><div style={{width:8,height:8,borderRadius:"50%",background:CC[si%CC.length],flexShrink:0}}/><span style={{fontSize:11,fontWeight:700,color:CC[si%CC.length]}}>{name}</span><button onClick={()=>toggleEx(name)} style={{background:"none",border:"none",cursor:"pointer",color:CC[si%CC.length],fontSize:13,lineHeight:1,padding:"0 0 0 2px"}}>×</button></div>)}
          {selExs.length<4&&<button onClick={()=>setAddingEx(p=>!p)} style={{border:"1.5px dashed "+c.border,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",color:c.sub,background:"none",fontFamily:"inherit"}}>{addingEx?"Cancel":"+ Add exercise"}</button>}
        </div>
        {addingEx&&<div style={{marginBottom:12}}>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:8}}>{MG.map(m=><button key={m} onClick={()=>setExMuscle(m)} style={{flexShrink:0,border:"none",borderRadius:20,padding:"5px 11px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",background:exMuscle===m?c.accent:c.card2,color:exMuscle===m?"#fff":c.sub}}>{m}</button>)}</div>
          <div style={{background:c.card2,borderRadius:12,maxHeight:200,overflowY:"auto"}}>{exPickerList.filter(n=>!selExs.includes(n)).length===0&&<div style={{textAlign:"center",padding:"16px",color:c.sub,fontSize:13}}>No exercises in {exMuscle} yet</div>}{exPickerList.filter(n=>!selExs.includes(n)).map(name=>{var hasData=allEx.includes(name);return(<button key={name} onClick={()=>toggleEx(name)} style={{width:"100%",textAlign:"left",background:"none",border:"none",borderBottom:"1px solid "+c.border,padding:"10px 12px",fontSize:13,color:hasData?c.text:c.sub,cursor:"pointer",fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center",fontWeight:hasData?600:400}}><span>{name}</span>{!hasData&&<span style={{fontSize:10,color:c.sub,fontStyle:"italic"}}>no data yet</span>}</button>);})}</div>
        </div>}
        {selExs.length>0&&series.some(s=>s.data.length>0)
          ?<WeightChart series={series} c={c} unit={unit} W={340} H={160}/>
          :<div style={{textAlign:"center",padding:"28px 0 12px",color:c.sub,fontSize:13}}>{selExs.length===0?"Tap \"+ Add exercise\" above to plot your weight over time.":"No data in this time range."}</div>
        }
        {filteredHist.length===0&&hist.length>0&&<div style={{textAlign:"center",fontSize:12,color:c.am,marginTop:6}}>No workouts in range — try a wider range above</div>}
      </div>

      {/* Weekly volume */}
      <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:22,padding:"18px 16px 14px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
          <div style={{fontWeight:800,fontSize:15,color:c.text}}>Weekly Volume</div>
          <div style={{fontSize:11,color:c.sub}}>{weekBars.length} week{weekBars.length!==1?"s":""}</div>
        </div>
        <div style={{fontSize:11,color:c.sub,marginBottom:12}}>Total {unit} lifted per week · scroll to see all</div>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:3,height:110,minWidth:weekBars.length*28}}>
            {weekBars.map((w,i)=>{
              const h=Math.max(w.vol/maxVol*90,3);
              const isLast=i===weekBars.length-1;
              const showLabel=weekBars.length<=16||(i===0||isLast||i%Math.ceil(weekBars.length/8)===0);
              return(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flex:"0 0 auto",width:Math.max(20,Math.min(36,Math.floor(320/Math.min(weekBars.length,16))))+"px"}}>
                  <div style={{fontSize:7,color:isLast?c.accent:c.sub,fontWeight:700,whiteSpace:"nowrap"}}>{w.vol>=1000?Math.round(w.vol/100)/10+"k":w.vol}</div>
                  <div style={{width:"100%",background:isLast?c.accent:c.accent+"66",borderRadius:"3px 3px 0 0",height:h+"px",transition:"height .4s",cursor:"default"}} title={fmtD(w.date)+": "+w.vol+unit}/>
                  <div style={{fontSize:7,color:c.sub,whiteSpace:"nowrap",opacity:showLabel?1:0}}>{fmtD(w.date)}</div>
                </div>
              );
            })}
          </div>
        </div>
        {weekBars.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:c.sub,fontSize:13}}>No data in this range</div>}
      </div>

      {/* Workout Calendar — collapsible, below charts */}
      {hist.length>0&&<CalendarCard hist={hist} c={c} unit={unit}/>}

      <PlateCalc c={c} unit={unit}/>
      </>}
    </div>
  );
}

// ─── Help / Tutorial ──────────────────────────────────────────────────────────
function HelpPage({c}){
  const [open,setOpen]=useState(null);
  const [query,setQuery]=useState("");
  const sections=[
    {id:"start",icon:"🏋️",title:"Getting Started",items:[
      {q:"How do I log a workout?",a:"Tap Log in the bottom nav → tap Add Exercise → choose a muscle group and tap any exercise. Enter weight and reps for each set, then tap ✓ to mark a set done. When you're finished, tap Finish Workout."},
      {q:"What is a blank workout vs. a routine?",a:"A blank workout is freestyle — you add whichever exercises you like as you go. A routine is a saved template (like Push Day) that pre-loads your exercises and fills in the weights from your last session automatically."},
      {q:"How do I name my workout?",a:"Tap the name field at the top of the log screen (it shows 'Workout name…') and type whatever you like. The name is saved in your history."},
      {q:"Will my data survive if I update or reinstall the app?",a:"Yes. All your workouts, routines, and body weight entries are stored directly on your device and are completely safe through app updates. If you're reinstalling, use Export File first to save a backup."},
    ]},
    {id:"log",icon:"📝",title:"Logging Sets",items:[
      {q:"What does the ✓ button do?",a:"Marks that set as completed. The row fades to show it's done. If Auto-rest (AUTO button) is on, the rest timer starts automatically. Tap ✓ again on a completed set to remove it."},
      {q:"How do I remove an exercise from my workout?",a:"Tap the red trash icon (🗑) in the top-right corner of the exercise card. A confirmation prompt will appear. Tap OK to remove it. This only removes it from the current workout — it stays in the exercise library."},
      {q:"How do I remove a set?",a:"Tap ✓ on a set that is already marked done — this deletes it. Alternatively, tap ✓ to mark it done first, then tap ✓ again to remove it."},
      {q:"What is the ⤢ Focus button?",a:"Tap the exercise name to open a full-screen view for just that exercise — bigger inputs, bigger buttons, easier to read mid-lift. Tap ← Back when done."},
      {q:"What is the + button next to the weight? How does the plate picker work?",a:"Opens the plate picker. The big number shown is the TOTAL weight on the bar (bar + all plates). Tap a plate circle to add one plate each side — the total updates immediately. The bar weight is already included, so if you see '45lb bar' and tap a 45lb plate, the total becomes 135lb (45 bar + 45 per side × 2). Tap − under a plate to remove it. For cables and machines, switch to × 1 mode so plates add once instead of twice."},
      {q:"The plate chips on the card show wrong plates — how do I fix it?",a:"Make sure the weight field shows the full total including the bar (e.g. 135lb for barbell + two 45lb plates). If you typed the weight manually without the bar, add the bar weight to it. The plate display always works backwards from the total weight — it subtracts the bar first, then splits what's left equally per side."},
      {q:"What is the set copy feature?",a:"Every time you tap '+ Add set', the new set automatically copies the weight and reps from the previous set. No need to re-type the same numbers."},
      {q:"What is the BW toggle?",a:"Marks the exercise as bodyweight (pull-up, dip, push-up). If you've logged your body weight, you can also add extra weight (vest, belt) and IronLog shows the combined total."},
      {q:"What is the bar type dropdown?",a:"Tells the plate calculator which bar you're using. Barbell = 20 kg / 45 lb bar. EZ Bar = 10 kg / 25 lb bar. Dumbbell and No Bar mean the weight you enter is the full weight with no bar subtracted."},
      {q:"What is the AUTO button?",a:"When AUTO is lit up, the rest timer starts on its own every time you complete a set. When off, start it manually by tapping the REST circle. AUTO remembers the last duration you chose."},
      {q:"How do I change the rest timer duration?",a:"Tap the REST circle to start it, then tap again to cycle through 60s → 120s → 180s → off. Whatever you last set, AUTO will use for the next set."},
      {q:"What is the 🔔 bell button?",a:"Enables notifications so IronLog can alert you when your rest is up — even if your phone screen is locked. Tap it once to give permission. You only need to do this once."},
      {q:"What are Warm-up / Working / Drop set labels?",a:"Set type labels you can assign in routines. Warm-up sets show in amber — they don't affect the progression calculation. Drop sets show in red. Working sets are your main lifting sets."},
      {q:"What is the exercise history shown on each card?",a:"The last 3 sessions for that exercise appear just below the exercise name — date, sets, weight × reps. Lets you see at a glance what you did last time without leaving the screen."},
      {q:"How do I add notes or form cues to an exercise?",a:"Tap the '+ Notes' button on any exercise card. A text field appears where you can write form cues, coaching tips, or reminders. The notes stay visible while you log that exercise."},
      {q:"What is a Superset?",a:"Tap '⚡ Superset' on an exercise to mark it as part of a superset — exercises performed back-to-back with no rest between them. An amber banner reminds you to skip the rest timer and go straight to the next exercise."},
    ]},
    {id:"plates",icon:"🔵",title:"Plates & My Plates",items:[
      {q:"Where do I set up my plates?",a:"Home screen → scroll to My Plates. Tap a plate circle to toggle it on (coloured = you have it) or off (dimmed = you don't). Only your owned plates show in the picker during workouts."},
      {q:"How do I add a custom plate size?",a:"In My Plates, type your plate weight in the 'Custom plate' field and tap Add. It appears as a circle with a × to remove it. Useful for 2.5 lb micro-plates, 17.5 kg plates, and so on."},
      {q:"How do I delete a custom exercise I added by mistake?",a:"In the Add Exercise picker (when logging or in Routines), find your custom exercise under 'MY EXERCISES' and swipe it left. A red Delete button appears — tap it to remove. Built-in exercises cannot be deleted."},
      {q:"The plate chips on the card show wrong plates — why?",a:"The plate display works from the total weight in the field (bar included). If you entered the weight manually without including the bar, the chips will be wrong. Always use the + plate picker to build the weight — it automatically includes the bar so the maths is always right."},
      {q:"The plate picker doubled my weight for cables — how do I fix it?",a:"Tap the toggle button inside the plate picker (it says '× 2' or '× 1'). For cables, machines and dumbbells it should show × 1. The app tries to detect this automatically from the exercise name, but you can always override it."},
    ]},
    {id:"calendar",icon:"📅",title:"Workout Calendar",items:[
      {q:"Where is the workout calendar?",a:"Progress tab → top of the screen. A full monthly calendar shows every day you trained, colour-coded by muscle group. Tap the arrows to browse previous months."},
      {q:"What do the coloured dots mean?",a:"Each colour represents a muscle group — purple for Chest, green for Back, yellow for Legs, and so on. The legend is shown below the calendar. Multiple dots on one day means you trained multiple muscle groups."},
    ]},
    {id:"progress",icon:"📈",title:"Progress & Charts",items:[
      {q:"How do I track strength progress for an exercise?",a:"Progress tab → tap '+ Add exercise' → choose an exercise. A chart appears showing your estimated 1RM or max weight over time. Add up to 4 exercises at once to compare."},
      {q:"What is Est. 1RM?",a:"Estimated one-rep max — a way to compare sets of different reps. Calculated from your working sets: weight × (1 + reps ÷ 30). Higher is better, regardless of rep count."},
      {q:"What is the weekly volume bar chart?",a:"Total weight lifted per calendar week. Scroll left to see older weeks. Useful for spotting trends — are you doing more or less total work over time?"},
    ]},
    {id:"routines",icon:"📋",title:"Routines & Progression",items:[
      {q:"What is automatic progression?",a:"When you start a routine and completed every set last time, IronLog adds the set increment (e.g. +2.5 kg) automatically. No manual tracking — the app does it for you."},
      {q:"What is the deload badge?",a:"If you fail to complete all sets in two back-to-back sessions, IronLog automatically reduces the weight by 10% on your next session. This prevents you from grinding against the same weight forever."},
      {q:"How do I create my own routine?",a:"Routines tab → New → name it and choose a colour → Add Exercise → set target weight and reps per set, with optional Warm-up/Working/Drop labels. Tap Save."},
      {q:"Are last-session weights filled in automatically?",a:"Yes. When you start any routine, IronLog finds your most recent session for each exercise and pre-fills those weights. You can change them at any time before or during the workout."},
    ]},
    {id:"data",icon:"💾",title:"Data & Backup",items:[
      {q:"Does IronLog auto-save?",a:"Yes — every time you open the app, a silent backup snapshot is saved to your device storage automatically. No download needed. The Home screen shows when the last backup was made."},
      {q:"What is Export File for?",a:"Creates a backup file that downloads to your Files app. Use this to move your data to a new phone, save to iCloud or email it to yourself. Do this before uninstalling the app."},
      {q:"How do I restore from a backup?",a:"Home → Backup & Restore → Restore File → pick your IronLog backup file. Choose Merge to add its records to your existing data, or Replace to swap completely."},
    ]},
    {id:"body",icon:"⚖️",title:"Body Weight",items:[
      {q:"How do I log my body weight?",a:"Home screen → Body Weight card → type your weight → tap Log. Supports both kg and lb — follows whichever unit you've selected. Multiple entries build a trend chart in Progress."},
      {q:"How does body weight show in exercises?",a:"When you toggle BW on an exercise (e.g. pull-up), the base shows your most recently logged body weight. Add extra weight in the Extra field if you're wearing a vest or holding a dumbbell."},
    ]},
  ];
  // Search across all items
  const q2=query.trim().toLowerCase();
  const filtered=q2?sections.map(sec=>({...sec,items:sec.items.filter(it=>it.q.toLowerCase().includes(q2)||it.a.toLowerCase().includes(q2))})).filter(sec=>sec.items.length):sections;
  return(
    <div style={{padding:"20px 16px 100px"}}>
      <h2 style={{fontSize:23,fontWeight:900,margin:"0 0 4px",color:c.text,letterSpacing:"-0.02em"}}>Help & Guide</h2>
      <p style={{fontSize:13,color:c.sub,marginBottom:14}}>Tap any question to expand. Tap the <strong style={{color:c.accent}}>?</strong> badges in the app for instant tips.</p>
      {/* Search */}
      <div style={{position:"relative",marginBottom:16}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search help…"
          style={{width:"100%",background:c.card,border:"1.5px solid "+c.border,borderRadius:13,padding:"10px 36px 10px 14px",fontSize:14,color:c.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        {query&&<button onClick={()=>setQuery("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:c.sub,fontSize:16,lineHeight:1,padding:4}}>×</button>}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:c.sub,fontSize:14}}>No results for "{query}"</div>}
      {filtered.map(sec=>(
        <div key={sec.id} style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,marginBottom:14,overflow:"hidden"}}>
          <div style={{padding:"13px 16px",borderBottom:"1px solid "+c.border,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>{sec.icon}</span>
            <span style={{fontWeight:900,fontSize:15,color:c.text}}>{sec.title}</span>
            <span style={{marginLeft:"auto",fontSize:11,color:c.sub}}>{sec.items.length} topic{sec.items.length!==1?"s":""}</span>
          </div>
          {sec.items.map((item,i)=>{
            const key=sec.id+"_"+i;
            const isOpen=open===key;
            return(
              <div key={i} style={{borderBottom:i<sec.items.length-1?"1px solid "+c.border:"none"}}>
                <button onClick={()=>setOpen(isOpen?null:key)}
                  style={{width:"100%",background:"none",border:"none",padding:"13px 16px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                  <span style={{fontSize:13,fontWeight:700,color:c.text,flex:1,lineHeight:1.4}}>{item.q}</span>
                  <span style={{fontSize:16,color:c.sub,flexShrink:0,transition:"transform .2s",transform:isOpen?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>⌄</span>
                </button>
                {isOpen&&<div style={{padding:"0 16px 14px",fontSize:13,color:c.sub,lineHeight:1.7,background:c.card2}}>{item.a}</div>}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:20,padding:"16px",marginBottom:14,textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:8}}>💪</div>
        <div style={{fontWeight:800,fontSize:15,color:c.text,marginBottom:6}}>IronLog</div>
        <div style={{fontSize:12,color:c.sub,lineHeight:1.7}}>Track. Lift. Grow.<br/>Your data never leaves your phone.<br/>No account. No subscription. No ads.</div>
      </div>
    </div>
  );
}

// ─── PRs ──────────────────────────────────────────────────────────────────────
function PRsPage({hist,c,unit="kg"}){
  const [selEx,setSelEx]=useState(null);
  if(!hist.length)return <Empty icon="🏆" title="No PRs yet" sub="Start logging to track personal records." c={c}/>;
  const prs={},orms={};
  hist.forEach(w=>w.exercises.forEach(ex=>{
    ex.sets.forEach(s=>{const v=parseFloat(s.weight)||0;if(!prs[ex.name]||v>prs[ex.name])prs[ex.name]=v;});
    const rm=bestRM(ex.sets);if(!orms[ex.name]||rm>orms[ex.name])orms[ex.name]=rm;
  }));
  // 1RM trend data for selected exercise
  const trendData=selEx?hist.reduce((acc,w)=>{
    const ex=w.exercises.find(e=>e.name===selEx);
    if(!ex)return acc;
    const rm=bestRM(ex.sets);
    if(rm>0)acc.push({date:w.date,y:unit==="lb"?Math.round(kgToLb(rm)*4)/4:rm});
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
  return(
    <div style={{padding:"20px 16px 100px"}}>
      <h2 style={{fontSize:23,fontWeight:900,margin:"0 0 6px",color:c.text,letterSpacing:"-0.02em"}}>Personal Records</h2>
      <p style={{fontSize:13,color:c.sub,marginBottom:18}}>Tap any exercise to see your estimated 1RM trend</p>
      {/* 1RM trend chart */}
      {selEx&&<div style={{background:c.card,border:"1px solid "+c.accent+"55",borderRadius:20,padding:"16px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:c.text}}>{selEx}</div>
            <div style={{fontSize:11,color:c.sub,marginTop:1}}>Est. 1RM trend ({unit})</div>
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
      {Object.entries(prs).sort((a,b)=>b[1]-a[1]).map(([ex,w],i)=>(
        <div key={ex} onClick={()=>setSelEx(selEx===ex?null:ex)} style={{background:c.card,border:"1px solid "+(selEx===ex?c.accent+"99":i===0?c.accent+"66":c.border),borderRadius:18,padding:"13px 15px",marginBottom:9,cursor:"pointer",boxShadow:i===0?"0 4px 20px "+c.accent+"22":"none",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{fontSize:20}}>{["🥇","🥈","🥉"][i]||(i+1)+"."}</div>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:c.text}}>{ex}</div>
              {orms[ex]>w&&<div style={{fontSize:11,color:c.sub,marginTop:1}}>~1RM: <strong style={{color:c.at}}>{unit==="lb"?kgToLb(orms[ex]):orms[ex]}{unit}</strong></div>}
              <div style={{fontSize:10,color:c.sub,marginTop:1}}>Tap to see 1RM trend</div>
            </div>
          </div>
          <div style={{fontSize:21,fontWeight:900,color:i===0?c.accent:c.text}}>{unit==="lb"?kgToLb(w):w}<span style={{fontSize:11,fontWeight:500,color:c.sub}}>{unit}</span></div>
        </div>
      ))}
    </div>
  );
}

// ─── Routines ─────────────────────────────────────────────────────────────────
function RoutinesPage({c,unit="kg",onUse,customRoutines,onSaveCustom,onDeleteCustom,customExercises={},onAddCustomEx,onDeleteCustomEx,onRenameCustomEx}){
  const {confirm:dlgConfirm,confirmEl}=useConfirm(c);
  const [open,setOpen]=useState(null);
  const [editing,setEditing]=useState(null);
  const allRoutines=[...TMPLS.map(t=>({...t,builtin:true})),...customRoutines.map(t=>({...t,builtin:false}))];

  // ── Editor state ──────────────────────────────────────────────────────────
  const blankRoutine=()=>({id:uid(),name:"",tag:"Custom",col:"#7C6EFA",exercises:[]});
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
    setForm(f=>({...f,exercises:[...f.exercises,{name,muscle:exMg,sets:defaultSets}]}));
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
        <input value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value}))} placeholder="Category (e.g. PPL, Split, Custom…)" style={{background:c.card2,border:"1.5px solid "+c.border,borderRadius:10,padding:"8px 11px",fontSize:13,color:c.text,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
      </div>

      {/* Exercises */}
      <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:18,padding:"14px 15px",marginBottom:13}}>
        <div style={{fontSize:11,color:c.sub,fontWeight:700,marginBottom:12,letterSpacing:"0.05em"}}>EXERCISES</div>
        {form.exercises.map((ex,ei)=>(
          <div key={ei} style={{background:c.card2,borderRadius:14,padding:"12px 13px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
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
        ))}
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
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <h2 style={{fontSize:23,fontWeight:900,margin:"0 0 4px",color:c.text,letterSpacing:"-0.02em"}}>Routines</h2>
          <p style={{fontSize:13,color:c.sub,margin:0}}>Built-in & your own programs.</p>
        </div>
        <PBtn onClick={openNew} c={c} style={{padding:"9px 14px",fontSize:13,flexShrink:0,marginTop:2}}><IPlus/> New</PBtn>
      </div>

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
            <div><span style={{background:t.col+"22",color:t.col,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}>{t.tag||"Custom"}</span><div style={{fontWeight:900,fontSize:17,color:c.text,marginTop:4,letterSpacing:"-0.02em"}}>{t.name}</div><div style={{fontSize:12,color:c.sub,marginTop:1}}>{t.exercises.length} exercises</div></div>
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

// ─── Root ─────────────────────────────────────────────────────────────────────
HomePage=React.memo(HomePage);
HistoryPage=React.memo(HistoryPage);
ProgressPage=React.memo(ProgressPage);
PRsPage=React.memo(PRsPage);
RoutinesPage=React.memo(RoutinesPage);
HelpPage=React.memo(HelpPage);
WorkoutCalendar=React.memo(WorkoutCalendar);
ExHistoryCard=React.memo(ExHistoryCard);
MuscleMap=React.memo(MuscleMap);
WeightChart=React.memo(WeightChart);
ShareCard=React.memo(ShareCard);
PlateCalc=React.memo(PlateCalc);
CalendarCard=React.memo(CalendarCard);

function App(){
  const [tab,setTab]=useState("home");
  const [dark,setDark]=useState(()=>lsGet("il_dark",true));
  const [unit,setUnit]=useState(()=>lsGet("il_unit","kg"));
  const [hist,setHist]=useState(()=>lsGet("il_v4",[]));
  const [logInit,setLogInit]=useState(null);
  const [logName,setLogName]=useState("");
  const logFinishRef=useRef(null);
  const [loaded,setLoaded]=useState(false);
  const c=dark?D:L;
  // ── App-level confirm dialog — replaces all window.confirm in App scope ───
  const {confirm:appConfirm,confirmEl:appConfirmEl}=useConfirm(c);
  // ── Draft state lifted to App so switching tabs never loses log data ──────
  const [draftExs,setDraftExs]=useState([]);
  const [draftRating,setDraftRating]=useState(0);
  const [draftNotes,setDraftNotes]=useState("");
  const draftT0=useRef(Date.now());
  const hasDraft=draftExs.length>0;
  // ── Timer state — lifted so it survives tab switches, timestamp-based for screen lock ──
  const [timerSecs,setTimerSecs]=useState(0);   // 0=off, 60/120/180=active
  const [timerStart,setTimerStart]=useState(0); // Date.now() when timer started
  const [lastTimerSecs,setLastTimerSecs]=useState(60); // remembers last chosen duration
  const cycleTimer=()=>{
    const cur=timerSecs;
    const idx=TIMER_STEPS.indexOf(cur);
    const next=idx===-1?TIMER_STEPS[0]:(idx===TIMER_STEPS.length-1?0:TIMER_STEPS[idx+1]);
    if(next===0){setTimerSecs(0);}else{setTimerSecs(next);setTimerStart(Date.now());setLastTimerSecs(next);}
  };
  const startTimer=(secs)=>{setTimerSecs(secs);setTimerStart(Date.now());};
  const stopTimer=()=>{setTimerSecs(0);swNotif(0);};
  // Auto-save draft to IndexedDB every time it changes (only after initial load)
  useEffect(()=>{
    if(!loaded) return;
    idbSet("il_draft",{exs:draftExs,rating:draftRating,notes:draftNotes,name:logName,sec:Math.floor((Date.now()-draftT0.current)/1000),t0:draftT0.current,init:logInit});
  },[draftExs,draftRating,draftNotes,logName,loaded]);
  // Restore draft on mount
  useEffect(()=>{
    idbGet("il_draft",null).then(d=>{
      if(d&&d.exs&&d.exs.length>0){
        setDraftExs(d.exs);
        setDraftRating(d.rating||0);
        setDraftNotes(d.notes||"");
        setLogName(d.name||"");
        setLogInit(d.init||null);
        if(d.t0){draftT0.current=d.t0;}
      }
    });
  },[]);

  // On mount: migrate from localStorage → IndexedDB, then load from IndexedDB
  useEffect(()=>{
    var lsData=lsGet("il_v4",[]);
    idbGet("il_v4",[]).then(idbData=>{
      // Use whichever has more data (merge favoring IndexedDB, fallback to ls)
      var merged=idbData.length>=lsData.length?idbData:lsData;
      setHist(merged);
      setLoaded(true);
      // Persist merged into IndexedDB and clear localStorage entry to avoid confusion
      if(merged.length>0){
        idbSet("il_v4",merged).then(()=>{
          try{localStorage.removeItem("il_v4");}catch(e){}
        });
      }
    });
    idbGet("il_unit","kg").then(u=>{setUnit(u);});
  },[]);

  // Persist every hist change to IndexedDB
  useEffect(()=>{if(loaded)idbSet("il_v4",hist);},[hist,loaded]);

  // Persist dark mode preference
  useEffect(()=>{idbSet("il_dark",dark);},[dark]);
  useEffect(()=>{idbSet("il_unit",unit);try{localStorage.setItem("il_unit",JSON.stringify(unit));}catch(e){};},[unit]);
  const clearDraft=()=>{setDraftExs([]);setDraftRating(0);setDraftNotes("");setLogName("");setLogInit(null);draftT0.current=Date.now();idbSet("il_draft",null);};
  const saveW=w=>{setHist(p=>[...p,w]);clearDraft();setTab("history");};
  const delW=id=>setHist(p=>p.filter(w=>w.id!==id));
  const blank=()=>{if(!hasDraft){setLogInit(null);setLogName("");draftT0.current=Date.now();}setTab("log");};
  // ── Custom routines ────────────────────────────────────────────────────────
  const [customRoutines,setCustomRoutines]=useState([]);
  useEffect(()=>{idbGet("il_custom_routines",[]).then(r=>setCustomRoutines(r||[]));;},[]);
  useEffect(()=>{if(loaded)idbSet("il_custom_routines",customRoutines);},[customRoutines,loaded]);
  const saveCustomRoutine=(r)=>{
    setCustomRoutines(p=>{const idx=p.findIndex(x=>x.id===r.id);return idx>=0?p.map(x=>x.id===r.id?r:x):[...p,r];});
  };
  const deleteCustomRoutine=(id)=>setCustomRoutines(p=>p.filter(r=>r.id!==id));
  // ── Body weight tracking — [{date,kg}] stored in IDB ──────────────────────
  const [bwLog,setBwLog]=useState([]);
  useEffect(()=>{idbGet("il_bw",[]).then(r=>setBwLog(r||[]));} ,[]);
  useEffect(()=>{if(loaded)idbSet("il_bw",bwLog);},[bwLog,loaded]);
  const logBW=(kg)=>{
    const d=today();
    setBwLog(p=>{const without=p.filter(x=>x.date!==d);return[...without,{date:d,kg}].sort((a,b)=>a.date.localeCompare(b.date));});
  };
  const deleteBW=(date)=>setBwLog(p=>p.filter(x=>x.date!==date));
  // ── Custom exercises — per muscle group, stored in IDB ─────────────────
  // Shape: {Chest:["My Ex",...], Back:[...], ...}
  const [customExercises,setCustomExercises]=useState({});
  useEffect(()=>{idbGet("il_custom_ex",{}).then(r=>setCustomExercises(r||{}));},[]);
  useEffect(()=>{if(loaded)idbSet("il_custom_ex",customExercises);},[customExercises,loaded]);
  const addCustomExercise=(muscle,name)=>{
    var n=name.trim();
    if(!n)return;
    setCustomExercises(p=>{
      var existing=[...(p[muscle]||[])];
      if(existing.includes(n))return p;
      return{...p,[muscle]:[...existing,n]};
    });
  };
  const deleteCustomExercise=(muscle,name)=>{
    setCustomExercises(p=>({...p,[muscle]:(p[muscle]||[]).filter(x=>x!==name)}));
  };
  const renameCustomExercise=(muscle,oldName,newName)=>{
    var n=newName.trim();
    if(!n||n===oldName)return;
    setCustomExercises(p=>({...p,[muscle]:(p[muscle]||[]).map(x=>x===oldName?n:x)}));
  };
  // ── Gym plates kit — user's owned plates stored as kg values ──────────────
  // Default: standard full set. User can customise in Settings on Home screen.
  const DEFAULT_PLATES_KG=[25,20,15,10,5,2.5,1.25];
  const [gymPlates,setGymPlates]=useState(DEFAULT_PLATES_KG);
  useEffect(()=>{idbGet("il_gym_plates",DEFAULT_PLATES_KG).then(r=>setGymPlates(r&&r.length?r:DEFAULT_PLATES_KG));},[]);
  useEffect(()=>{if(loaded)idbSet("il_gym_plates",gymPlates);},[gymPlates,loaded]);
  const useTmpl=t=>{
    const doStart=()=>{
      clearDraft();
      const exercises=t.exercises.map(ex=>{
        // Find last 2 sessions for this exercise
        var sessions=[];
        for(var i=hist.length-1;i>=0&&sessions.length<2;i--){
          var found=hist[i].exercises.find(e=>e.name===ex.name);
          if(found&&found.sets&&found.sets.length)sessions.push(found);
        }
        var lastSession=sessions[0]||null;
        if(!lastSession)return ex;
        var sets=lastSession.sets.map(s=>({...s,id:uid(),done:false}));
        const prog=ex.progression;
        var progressionApplied=null;
        var deloadApplied=null;
        if(prog&&prog.increment){
          const allDoneLast=lastSession.sets.every(s=>s.done!==false);
          const allDonePrev=sessions[1]?sessions[1].sets.every(s=>s.done!==false):true;
          const incKg=prog.unit==="lb"?lbToKg(prog.increment):prog.increment;
          if(allDoneLast){
            // Linear progression — completed last session
            sets=sets.map(s=>{const w=parseFloat(s.weight)||0;return{...s,weight:w?String(Math.round((w+incKg)*100)/100):s.weight};});
            progressionApplied=prog.increment;
          } else if(!allDoneLast&&sessions[1]&&!allDonePrev){
            // Failed 2 sessions in a row → deload 10%
            sets=sets.map(s=>{const w=parseFloat(s.weight)||0;return{...s,weight:w?String(Math.round(w*0.9*100)/100):s.weight};});
            deloadApplied=true;
          }
          // else: failed once — keep same weight, no increment
        }
        return{...ex,sets,progressionApplied,deloadApplied};
      });
      setLogInit({name:t.name,date:today(),exercises});
      setLogName(t.name);draftT0.current=Date.now();setTab("log");
    };
    if(hasDraft){
      appConfirm("You have a workout in progress.\nStart this routine and discard it?").then(ok=>{if(ok)doStart();});
    }else{
      doStart();
    }
  };
  // ── Backup system ──────────────────────────────────────────────────────────
  // saveBackupFile: triggers a real file download → goes to Files app / Downloads
  const saveBackupFile=(workouts,ts,silent)=>{
    const data={version:2,date:ts,workouts,createdAt:new Date().toISOString(),auto:!!silent};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="IronLog-"+ts+".json";
    document.body.appendChild(a);a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  };
  const doBackup=()=>{
    if(!hist.length)return;
    const ts=new Date().toISOString().slice(0,10);
    saveBackupFile(hist,ts,false);
    idbSet("il_last_backup",ts);
  };
  const importBackup=e=>{
    const file=e.target.files&&e.target.files[0];
    if(!file)return;
    if(file.size>50*1024*1024){appConfirm("File too large (max 50MB).").then(()=>{});e.target.value="";return;}
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        const workouts=data.workouts||data;
        if(!Array.isArray(workouts)){appConfirm("❌ Invalid backup file — no workout array found.").then(()=>{});return;}
        const valid=workouts.filter(w=>w&&typeof w==="object"&&w.id&&w.date&&Array.isArray(w.exercises));
        const bad=workouts.length-valid.length;
        const doImport=(toImport)=>{
          const sanitized=toImport.map(w=>({...w,exercises:(w.exercises||[]).map(ex=>({...ex,sets:Array.isArray(ex.sets)?ex.sets.map(s=>({id:s.id||uid(),reps:parseInt(s.reps)||0,weight:parseFloat(s.weight)||0,done:!!s.done})):[]}))}) );
          if(hist.length===0){
            setHist(sanitized);
            appConfirm("✅ Restored "+sanitized.length+" workouts!").then(()=>{});
            return;
          }
          appConfirm(
            "You have "+hist.length+" workout"+(hist.length!==1?"s":"")+" on this device.\n\n"+
            "OK = Merge (keep all, add "+sanitized.length+" from backup)\n"+
            "Cancel = Replace (overwrite with backup only)"
          ).then(choice=>{
            if(choice){
              const existingIds=new Set(hist.map(w=>w.id));
              const newOnly=sanitized.filter(w=>!existingIds.has(w.id));
              const merged=[...hist,...newOnly].sort((a,b)=>a.date.localeCompare(b.date));
              setHist(merged);
              appConfirm("✅ Merged: "+merged.length+" workouts ("+newOnly.length+" added from backup).").then(()=>{});
            }else{
              setHist(sanitized);
              appConfirm("✅ Replaced with "+sanitized.length+" workouts from backup.").then(()=>{});
            }
          });
        };
        if(bad>0){
          appConfirm(bad+" invalid entries found. Import the "+valid.length+" valid ones?").then(ok=>{if(ok)doImport(valid);});
        }else{
          doImport(valid);
        }
      }catch(err){appConfirm("❌ Invalid backup file.").then(()=>{});}
    };
    reader.readAsText(file);
    e.target.value="";
  };
  // ── Backup due state — iOS blocks silent downloads, must be user-triggered ──
  const [backupDue,setBackupDue]=useState(false);
  const [updateAvail,setUpdateAvail]=useState(false);
  useEffect(()=>{
    // Check flag immediately — covers case where SW update event fired before React mounted
    if(window._swUpdatePending){setUpdateAvail(true);}
    var handler=function(){setUpdateAvail(true);};
    window.addEventListener('swUpdate',handler);
    return()=>window.removeEventListener('swUpdate',handler);
  },[]);
  const doUpdate=()=>{
    var reg=window._swReg;
    if(reg&&reg.waiting){
      reg.waiting.postMessage({type:'SKIP_WAITING'});
      navigator.serviceWorker.addEventListener('controllerchange',function(){
        window.location.reload();
      },{once:true});
    } else {
      window.location.reload();
    }
  };
  useEffect(()=>{
    if(!loaded||!hist.length)return;
    idbGet("il_last_backup","").then(last=>{
      if(last!==today())setBackupDue(true);
    });
    // Auto-snapshot to IDB happens silently every time app loads with new data
    idbGet("il_last_snapshot","").then(last=>{
      setLastSnapshot(last||"");
      if(last!==today()){doSnapshot();}// silent, no download, no prompt
    });
  },[loaded,hist]);
  const exportCSV=()=>{
    if(!hist.length)return;
    // Build CSV rows: Date, Workout, Exercise, Set#, Weight(kg), Weight(display), Reps, 1RM, Volume, Notes
    var rows=[["Date","Workout Name","Exercise","Muscle","Set","Weight (kg)","Weight ("+unit+")","Reps","Est 1RM ("+unit+")","Volume (kg)","Workout Notes","Rating"]];
    hist.forEach(w=>{
      (w.exercises||[]).forEach(ex=>{
        (ex.sets||[]).forEach((s,si)=>{
          var wKg=parseFloat(s.weight)||0;
          var wDisp=unit==="lb"?Math.round(kgToLb(wKg)*4)/4:wKg;
          var r=parseInt(s.reps)||0;
          var rm=calc1RM(wKg,r);
          var rmDisp=unit==="lb"?Math.round(kgToLb(rm)*4)/4:rm;
          rows.push([
            w.date,
            (w.name||"").replace(/,/g,""),
            (ex.name||"").replace(/,/g,""),
            ex.muscle||"",
            si+1,
            wKg,
            wDisp,
            r,
            rmDisp||"",
            wKg*r,
            (w.notes||"").replace(/[\n,]/g," "),
            w.rating||""
          ]);
        });
      });
    });
    var csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n");
    var blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");
    a.href=url;a.download="IronLog-export-"+today()+".csv";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  };
  // ── Silent auto-snapshot to IDB — no file download required ──────────────
  // Saves a JSON snapshot to IDB key 'il_snapshot_YYYY-MM-DD'. Keeps last 7.
  // User can restore from snapshot anytime via Home screen.
  const [lastSnapshot,setLastSnapshot]=useState("");
  const [snapshotDue,setSnapshotDue]=useState(false);
  useEffect(()=>{
    if(!loaded||!hist.length)return;
    idbGet("il_last_snapshot","").then(last=>{
      setLastSnapshot(last||"");
      if(last!==today())setSnapshotDue(true);
    });
  },[loaded,hist]);
  const doSnapshot=()=>{
    if(!hist.length)return;
    const ts=today();
    const snap={version:2,date:ts,workouts:hist,createdAt:new Date().toISOString()};
    idbSet("il_snapshot_"+ts,snap);
    idbSet("il_last_snapshot",ts);
    setLastSnapshot(ts);setSnapshotDue(false);
    // Prune snapshots older than 7 days
    for(let i=7;i<30;i++){const old=new Date();old.setDate(old.getDate()-i);idbSet("il_snapshot_"+old.toISOString().slice(0,10),null);}
  };
  // Still keep manual file export for real off-device backup
  const doAutoBackup=()=>{
    const ts=today();
    saveBackupFile(hist,ts,true);
    idbSet("il_last_backup",ts);
    setBackupDue(false);
    doSnapshot(); // also do a silent IDB snapshot
  };

  // Timer: no auto-dismiss on tab change — it keeps running invisibly, only shown on log tab
  const TogglesRow=()=><div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
    <button onClick={()=>setUnit(u=>u==="kg"?"lb":"kg")} style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"6px 11px",cursor:"pointer",color:c.accent,fontSize:12,fontWeight:800,fontFamily:"inherit",lineHeight:1}}>{unit}</button>
    <button onClick={()=>setDark(d=>!d)} style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,padding:"7px 9px",cursor:"pointer",color:c.sub,display:"flex",alignItems:"center"}}>{dark?<ISun/>:<IMoon/>}</button>
  </div>;
  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100svh",background:c.bg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",position:"relative",overflowX:"hidden",color:c.text,transition:"background .3s"}}>
      {appConfirmEl}

      {/* ── Fixed top bar — always visible, always same position ── */}
      <div className="il-topbar" style={{background:c.bg,borderBottom:"1px solid "+c.border,display:"flex",alignItems:"center",justifyContent:"space-between",paddingLeft:16,paddingRight:16,paddingBottom:10}}>
        {/* Left: page title or workout name input */}
        <div style={{flex:1,minWidth:0,marginRight:10}}>
          {tab==="log"
            ? <input value={logName} onChange={e=>setLogName(e.target.value)} placeholder="Workout name…" style={{background:"none",border:"none",fontSize:16,fontWeight:900,color:c.text,outline:"none",fontFamily:"inherit",letterSpacing:"-0.02em",width:"100%"}}/>
            : <span style={{fontSize:16,fontWeight:900,color:c.text,letterSpacing:"-0.02em"}}>🏋️ IronLog</span>
          }
        </div>
        {/* Right: ALWAYS unit toggle + dark toggle (+ Finish on log tab) — identical position every screen */}
        <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0}}>
          <button onClick={()=>setUnit(u=>u==="kg"?"lb":"kg")} style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,width:42,height:32,cursor:"pointer",color:c.accent,fontSize:12,fontWeight:800,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>{unit}</button>
          <button onClick={()=>setDark(d=>!d)} style={{background:c.card2,border:"1px solid "+c.border,borderRadius:10,width:32,height:32,cursor:"pointer",color:c.sub,display:"flex",alignItems:"center",justifyContent:"center"}}>{dark?<ISun/>:<IMoon/>}</button>
          {tab==="log"&&<button onClick={()=>logFinishRef.current&&logFinishRef.current()} style={{border:"none",borderRadius:10,height:32,padding:"0 14px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,background:c.accent,color:"#fff",whiteSpace:"nowrap"}}><ICheck/>Finish</button>}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="il-scroll">
        {/* Daily backup banner — shown when backup is due (iOS requires user tap to download) */}
        {updateAvail&&<div style={{margin:"12px 16px 0",background:"linear-gradient(135deg,#7C6EFA22,#a78bfa11)",border:"1px solid #7C6EFA55",borderRadius:14,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:"#b0a0ff"}}>🆕 Update available</div>
            <div style={{fontSize:11,color:c.sub,marginTop:1}}>New version of IronLog is ready. Your data is safe.</div>
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <button onClick={doUpdate} style={{background:c.accent,border:"none",borderRadius:10,padding:"7px 13px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit"}}>Update now</button>
            <button onClick={()=>setUpdateAvail(false)} style={{background:"none",border:"none",padding:"4px 6px",cursor:"pointer",color:c.sub,fontSize:16,lineHeight:1}}>×</button>
          </div>
        </div>}
        {backupDue&&hist.length>0&&<div style={{margin:"12px 16px 0",background:c.gs,border:"1px solid "+c.g+"55",borderRadius:14,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:c.g}}>💾 Daily backup ready</div>
            <div style={{fontSize:11,color:c.sub,marginTop:1}}>Tap to save today's backup to Files</div>
          </div>
          <button onClick={doAutoBackup} style={{background:c.g,border:"none",borderRadius:10,padding:"7px 13px",fontSize:12,fontWeight:700,cursor:"pointer",color:"#fff",fontFamily:"inherit",flexShrink:0}}>Save now</button>
          <button onClick={()=>setBackupDue(false)} style={{background:"none",border:"none",padding:"4px 6px",cursor:"pointer",color:c.sub,fontSize:16,lineHeight:1}}>×</button>
        </div>}
        {/* Resume in-progress workout banner — shown on all tabs except log */}
        {hasDraft&&tab!=="log"&&<div onClick={()=>setTab("log")} style={{margin:"12px 16px 0",background:c.accent+"22",border:"1px solid "+c.accent+"55",borderRadius:14,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontSize:13,fontWeight:700,color:c.at}}>💪 Workout in progress</div><div style={{fontSize:11,color:c.sub,marginTop:2}}>{logName||"Unnamed workout"} · {draftExs.length} exercise{draftExs.length!==1?"s":""} · tap to resume</div></div>
          <div style={{fontSize:11,fontWeight:700,color:c.accent,background:c.card,borderRadius:9,padding:"5px 10px",flexShrink:0,marginLeft:8}}>Resume →</div>
        </div>}
        {tab==="home"&&<HomePage hist={hist} dark={dark} c={c} unit={unit} onBlank={blank} onRoutine={()=>setTab("routines")} onBackup={doBackup} onImport={importBackup} bwLog={bwLog} onLogBW={logBW} gymPlates={gymPlates} onSetGymPlates={setGymPlates} lastSnapshot={lastSnapshot}/>}
        {tab==="log"&&<LogPage
          initial={logInit} c={c} unit={unit} logName={logName} finishRef={logFinishRef} onSave={saveW}
          draftExs={draftExs} setDraftExs={setDraftExs}
          draftRating={draftRating} setDraftRating={setDraftRating}
          draftNotes={draftNotes} setDraftNotes={setDraftNotes}
          draftT0={draftT0}
          onDiscard={clearDraft}
          timerSecs={timerSecs} timerStart={timerStart} lastTimerSecs={lastTimerSecs}
          startTimer={startTimer} cycleTimer={cycleTimer} stopTimer={stopTimer}
          customExercises={customExercises} onAddCustomEx={addCustomExercise} onDeleteCustomEx={deleteCustomExercise} onRenameCustomEx={renameCustomExercise}
          hist={hist} gymPlates={gymPlates} bwLog={bwLog}
        />}
        {tab==="history"&&<HistoryPage hist={hist} c={c} unit={unit} onDelete={delW} onExportCSV={exportCSV}/>}
        {tab==="progress"&&<ProgressPage hist={hist} c={c} unit={unit} bwLog={bwLog} onLogBW={logBW} onDeleteBW={deleteBW} customExercises={customExercises}/>}
        {tab==="prs"&&<PRsPage hist={hist} c={c} unit={unit}/>}
        {tab==="routines"&&<RoutinesPage c={c} unit={unit} onUse={useTmpl} customRoutines={customRoutines} onSaveCustom={saveCustomRoutine} onDeleteCustom={deleteCustomRoutine} customExercises={customExercises} onAddCustomEx={addCustomExercise} onDeleteCustomEx={deleteCustomExercise} onRenameCustomEx={renameCustomExercise}/>}
        {tab==="help"&&<HelpPage c={c}/>}
      </div>

      {/* Rest timer circle lives inside LogPage info bar — no global render needed */}

      {/* ── Bottom nav ── */}
      <div className="il-nav" style={{background:c.nav,backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderTop:"1px solid "+c.border,display:"flex"}}>
        {TABS.map(({id,label,Icon})=>{const active=tab===id;return(<button key={id} onClick={()=>setTab(id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,color:active?c.accent:c.sub,fontFamily:"inherit",transition:"color .15s",padding:"4px 0"}}><div style={{transform:active?"scale(1.15)":"scale(1)",transition:"transform .2s"}}><Icon/></div><span style={{fontSize:9,fontWeight:active?800:500,letterSpacing:"0.05em"}}>{label.toUpperCase()}</span>{active&&<div style={{width:4,height:4,borderRadius:"50%",background:c.accent}}/>}</button>);})}
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(p){super(p);this.state={err:null};}
  static getDerivedStateFromError(e){return{err:e};}
  render(){
    if(this.state.err){
      const msg=this.state.err.message||String(this.state.err);
      const stk=(this.state.err.stack||"").split("\n").slice(0,6).join("\n");
      const c=window._ilDark===false?L:D;
      return <div style={{padding:24,background:D.bg,minHeight:"100svh",fontFamily:"-apple-system,sans-serif"}}>
        <div style={{fontSize:32,marginBottom:12}}>💥</div>
        <div style={{fontSize:18,fontWeight:800,color:"#f87171",marginBottom:12}}>Runtime Error</div>
        <div style={{background:"#1a1a28",borderRadius:12,padding:16,fontSize:13,color:"#f87171",fontFamily:"monospace",whiteSpace:"pre-wrap",wordBreak:"break-all",lineHeight:1.5,marginBottom:12}}>{msg}</div>
        <div style={{background:"#1a1a28",borderRadius:12,padding:16,fontSize:11,color:"#8888aa",fontFamily:"monospace",whiteSpace:"pre-wrap",wordBreak:"break-all",lineHeight:1.5}}>{stk}</div>
        <button onClick={()=>this.setState({err:null})} style={{marginTop:16,background:"#7C6EFA",color:"#fff",border:"none",borderRadius:12,padding:"10px 20px",fontSize:14,fontWeight:700,cursor:"pointer"}}>Retry</button>
      </div>;
    }
    return this.props.children;
  }
}

export { ErrorBoundary };
export default App;
