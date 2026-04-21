import React, { useState, useRef, memo } from 'react';
import { IDrag } from '../icons';

function DragSortList({items,onReorder,keyFn,renderItem,c}){
  const [dragging,setDragging]=useState(null); // index being dragged
  const [over,setOver]=useState(null);         // index being hovered
  const refs=useRef([]);
  const startY=useRef(0);

  const getIndexAtY=(y)=>{
    for(var i=0;i<refs.current.length;i++){
      var el=refs.current[i];
      if(!el)continue;
      var r=el.getBoundingClientRect();
      if(y>=r.top&&y<=r.bottom)return i;
    }
    return null;
  };

  const onTouchStart=(e,idx)=>{
    e.stopPropagation();
    setDragging(idx);
    setOver(idx);
    startY.current=e.touches[0].clientY;
    if(navigator.vibrate)navigator.vibrate(30);
  };

  const onTouchMove=(e)=>{
    if(dragging===null)return;
    e.preventDefault();
    var y=e.touches[0].clientY;
    var idx=getIndexAtY(y);
    if(idx!==null)setOver(idx);
  };

  const onTouchEnd=()=>{
    if(dragging===null)return;
    if(over!==null&&over!==dragging){
      var arr=[...items];
      var [moved]=arr.splice(dragging,1);
      arr.splice(over,0,moved);
      onReorder(arr);
    }
    setDragging(null);
    setOver(null);
  };

  return(
    <div onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
      {items.map((item,idx)=>(
        <div key={keyFn(item,idx)} ref={el=>refs.current[idx]=el}
          style={{opacity:dragging===idx?0.45:1,transform:over===idx&&dragging!==null&&dragging!==idx?"translateY(4px)":"none",transition:"transform .15s,opacity .15s"}}>
          {renderItem(item,idx,(
            <button onTouchStart={e=>onTouchStart(e,idx)}
              style={{background:"none",border:"none",cursor:"grab",color:c.sub,padding:"8px 10px 8px 4px",display:"flex",alignItems:"center",flexShrink:0,touchAction:"none"}}
              aria-label="Drag to reorder">
              <IDrag/>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
export default memo(DragSortList);
