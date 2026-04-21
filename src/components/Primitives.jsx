import React, { useState } from 'react';

export const PBtn=({onClick,disabled,children,c,style={}})=><button onClick={onClick} disabled={disabled} style={{border:"none",borderRadius:13,padding:"10px 18px",fontSize:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,opacity:disabled?0.4:1,background:c.accent,color:"#fff",...style}}>{children}</button>;
export const GBtn=({onClick,children,c,style={}})=><button onClick={onClick} style={{border:"none",borderRadius:13,padding:"10px 18px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,background:c.card2,color:c.text,...style}}>{children}</button>;
export const DBtn=({onClick,children,c,style={}})=><button onClick={onClick} style={{border:"none",borderRadius:13,padding:"10px 18px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,background:c.rs,color:c.r,...style}}>{children}</button>;
export const NIn=({value,onChange,c})=><input type="number" inputMode="decimal" value={value} placeholder="0" onChange={e=>onChange(e.target.value)} style={{background:c.card2,border:"1.5px solid "+c.border,borderRadius:10,padding:"8px 4px",fontSize:14,color:c.text,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"inherit",textAlign:"center"}}/>;
export const Pill=({label,col,bg})=><span style={{background:bg,color:col,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}>{label}</span>;
export const Empty=({icon,title,sub,c})=><div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 24px",textAlign:"center"}}><div style={{fontSize:52,marginBottom:16}}>{icon}</div><div style={{fontWeight:800,fontSize:18,color:c.text,marginBottom:8}}>{title}</div><div style={{fontSize:14,color:c.sub}}>{sub}</div></div>;

export function Tip({text,c}){
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
