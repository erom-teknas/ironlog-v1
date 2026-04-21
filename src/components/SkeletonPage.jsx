import React from 'react';

function Skel({h=16,w="100%",mb=8,radius=10}){
  return <div className="il-skel" style={{height:h,width:w,marginBottom:mb,borderRadius:radius}}/>;
}

export default function SkeletonPage(){
  return(
    <div style={{padding:"20px 16px",opacity:0.7}}>
      <Skel h={28} w="55%" mb={20} radius={12}/>
      {[1,2,3].map(i=>(
        <div key={i} style={{borderRadius:20,overflow:"hidden",marginBottom:14,padding:16,border:"1px solid #ffffff0a",background:"#14141e"}}>
          <div style={{display:"flex",gap:10,marginBottom:12,alignItems:"center"}}>
            <Skel h={16} w="40%" mb={0}/>
            <Skel h={12} w="25%" mb={0}/>
          </div>
          <Skel h={10} w="80%" mb={6}/>
          <Skel h={10} w="60%" mb={0}/>
        </div>
      ))}
      <div style={{borderRadius:20,overflow:"hidden",padding:16,border:"1px solid #ffffff0a",background:"#14141e"}}>
        <Skel h={14} w="35%" mb={12}/>
        <div style={{display:"flex",gap:8}}>
          <Skel h={36} w="48%" mb={0} radius={12}/>
          <Skel h={36} w="48%" mb={0} radius={12}/>
        </div>
      </div>
    </div>
  );
}
