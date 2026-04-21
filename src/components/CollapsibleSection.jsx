import React, { useState, useRef, useEffect, memo } from 'react';
import { IChev } from '../icons';

function CollapsibleSection({title,sub,icon,c,defaultOpen=true,children,badge}){
  const [open,setOpen]=useState(defaultOpen);
  const bodyRef=useRef(null);
  const [height,setHeight]=useState(defaultOpen?"auto":0);
  const [animating,setAnimating]=useState(false);
  const isJSX=icon&&typeof icon==="object";

  useEffect(()=>{
    if(!bodyRef.current)return;
    if(open){
      const h=bodyRef.current.scrollHeight;
      setHeight(h);
      setAnimating(true);
      const t=setTimeout(()=>{setHeight("auto");setAnimating(false);},280);
      return()=>clearTimeout(t);
    }else{
      const h=bodyRef.current.scrollHeight;
      setHeight(h);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{setHeight(0);setAnimating(true);}));
      const t=setTimeout(()=>setAnimating(false),280);
      return()=>clearTimeout(t);
    }
  },[open]);

  return(
    <div style={{background:c.card,border:"1px solid "+c.border,borderRadius:22,marginBottom:14,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:"none",border:"none",padding:"16px 16px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,fontFamily:"inherit"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
          {icon&&(
            isJSX
              ? <span style={{flexShrink:0,color:c.accent,display:"flex",alignItems:"center"}}>{icon}</span>
              : <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
          )}
          <div style={{minWidth:0,textAlign:"left"}}>
            <div style={{fontWeight:800,fontSize:15,color:c.text,display:"flex",alignItems:"center",gap:7}}>
              {title}
              {badge&&<span style={{fontSize:10,fontWeight:700,background:c.as,color:c.accent,borderRadius:8,padding:"2px 7px",flexShrink:0}}>{badge}</span>}
            </div>
            {sub&&<div style={{fontSize:11,color:c.sub,marginTop:1}}>{sub}</div>}
          </div>
        </div>
        <span style={{color:c.sub,flexShrink:0,transition:"transform .25s cubic-bezier(.4,0,.2,1)",transform:open?"rotate(90deg)":"rotate(0deg)",display:"inline-flex",alignItems:"center",opacity:0.6}}><IChev/></span>
      </button>
      <div ref={bodyRef} style={{overflow:"hidden",transition:animating?"height .26s cubic-bezier(.4,0,.2,1)":"none",height:height===0?0:height==="auto"?"auto":height+"px"}}>
        {(open||animating)&&<div style={{padding:"0 16px 16px"}}>{children}</div>}
      </div>
    </div>
  );
}
export default memo(CollapsibleSection);
