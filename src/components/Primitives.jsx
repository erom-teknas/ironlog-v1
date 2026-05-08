import React, { useState } from 'react';

/* ─── Primary button (accent filled) ─────────────────────────────────────── */
export const PBtn=({onClick,disabled,children,c,style={}})=>(
  <button onClick={onClick} disabled={disabled} style={{
    border:"none",borderRadius:"var(--r-md,16px)",padding:"11px 20px",
    fontSize:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",
    fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,
    opacity:disabled?0.4:1,
    background:"linear-gradient(135deg,"+c.accent+","+c.at+")",
    color:"#fff",
    boxShadow:disabled?"none":"0 4px 18px rgba(124,110,250,0.3)",
    ...style
  }}>{children}</button>
);

/* ─── Ghost button (card surface) ────────────────────────────────────────── */
export const GBtn=({onClick,children,c,style={}})=>(
  <button onClick={onClick} style={{
    border:"1px solid "+c.border,borderRadius:"var(--r-md,16px)",padding:"11px 20px",
    fontSize:14,fontWeight:700,cursor:"pointer",
    fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,
    background:c.card2,color:c.text,
    ...style
  }}>{children}</button>
);

/* ─── Danger button ───────────────────────────────────────────────────────── */
export const DBtn=({onClick,children,c,style={}})=>(
  <button onClick={onClick} style={{
    border:"1px solid "+c.r+"33",borderRadius:"var(--r-md,16px)",padding:"11px 20px",
    fontSize:14,fontWeight:700,cursor:"pointer",
    fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,
    background:c.rs,color:c.r,
    ...style
  }}>{children}</button>
);

/* ─── Number input ────────────────────────────────────────────────────────── */
export const NIn=({value,onChange,c})=>(
  <input type="number" inputMode="decimal" value={value} placeholder="0"
    onChange={e=>onChange(e.target.value)}
    style={{
      background:c.card2,border:"1.5px solid "+c.border,
      borderRadius:"var(--r-sm,10px)",padding:"8px 4px",
      fontSize:15,color:c.text,outline:"none",
      width:"100%",boxSizing:"border-box",
      fontFamily:"inherit",textAlign:"center",fontWeight:600,
    }}/>
);

/* ─── Label pill ──────────────────────────────────────────────────────────── */
export const Pill=({label,col,bg})=>(
  <span style={{background:bg,color:col,borderRadius:"var(--r-full,9999px)",padding:"2px 10px",fontSize:11,fontWeight:700}}>{label}</span>
);

/* ─── Empty state ─────────────────────────────────────────────────────────── */
export const Empty=({icon,title,sub,c})=>(
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 24px",textAlign:"center"}}>
    <div style={{fontSize:54,marginBottom:18,filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.4))"}}>{icon}</div>
    <div style={{fontWeight:800,fontSize:19,color:c.text,marginBottom:8,letterSpacing:"-0.02em"}}>{title}</div>
    <div style={{fontSize:14,color:c.sub,lineHeight:1.5}}>{sub}</div>
  </div>
);

/* ─── Tooltip / info bubble ───────────────────────────────────────────────── */
export function Tip({text,c}){
  const [open,setOpen]=useState(false);
  return(
    <span style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
      <button onClick={e=>{e.stopPropagation();setOpen(o=>!o);}}
        style={{background:c.as,border:"none",borderRadius:"50%",width:18,height:18,
          cursor:"pointer",color:c.accent,fontSize:11,fontWeight:900,lineHeight:1,
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
          fontFamily:"inherit",padding:0}}>?</button>
      {open&&(
        <div onClick={e=>{e.stopPropagation();setOpen(false);}}
          style={{position:"fixed",inset:0,zIndex:8000,display:"flex",alignItems:"center",
            justifyContent:"center",padding:24,background:"rgba(0,0,0,0.6)",
            backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}>
          <div onClick={e=>e.stopPropagation()} className="il-spring"
            style={{background:"linear-gradient(140deg,#141422,#1e1e32)",
              border:"1px solid rgba(124,110,250,0.3)",borderRadius:"var(--r-xl,28px)",
              padding:"22px 22px",maxWidth:320,width:"100%",
              boxShadow:"0 24px 64px rgba(0,0,0,0.7)"}}>
            <div style={{fontSize:14,color:"#f0f0ff",lineHeight:1.65,marginBottom:18}}>{text}</div>
            <button onClick={()=>setOpen(false)}
              style={{background:"linear-gradient(135deg,#7C6EFA,#a89dff)",border:"none",
                borderRadius:"var(--r-md,16px)",padding:"10px 20px",color:"#fff",
                fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",width:"100%",
                boxShadow:"0 4px 16px rgba(124,110,250,0.35)"}}>Got it</button>
          </div>
        </div>
      )}
    </span>
  );
}
