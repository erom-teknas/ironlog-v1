import React, { useState, useRef } from 'react';

export default function SwipeToDelete({children,onDelete,c}){
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
