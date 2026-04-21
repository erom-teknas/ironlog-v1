import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import LZString from 'lz-string';

const CHUNK_SIZE = 800; // chars per QR chunk

export default function QRTransfer({hist,customRoutines,bwLog,customExercises,c,onClose}){
  const [qrUrls,setQrUrls]=useState([]);
  const [page,setPage]=useState(0);
  const [generating,setGenerating]=useState(true);
  const [error,setError]=useState("");

  useEffect(()=>{
    const data={version:3,date:new Date().toISOString().slice(0,10),workouts:hist,customRoutines,bwLog,customExercises};
    const json=JSON.stringify(data);
    const compressed=LZString.compressToEncodedURIComponent(json);
    const chunks=[];
    for(let i=0;i<compressed.length;i+=CHUNK_SIZE)chunks.push(compressed.slice(i,i+CHUNK_SIZE));
    const total=chunks.length;
    Promise.all(chunks.map((chunk,i)=>{
      const payload=JSON.stringify({i,t:total,d:chunk});
      return QRCode.toDataURL(payload,{width:280,margin:1,color:{dark:"#000000",light:"#ffffff"}});
    })).then(urls=>{
      setQrUrls(urls);
      setGenerating(false);
    }).catch(e=>{
      setError("QR generation failed: "+e.message);
      setGenerating(false);
    });
  },[]);

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:c.card,borderRadius:24,padding:24,width:"100%",maxWidth:340,textAlign:"center"}}>
        <div style={{fontWeight:900,fontSize:18,color:c.text,marginBottom:4}}>📱 QR Transfer</div>
        <div style={{fontSize:12,color:c.sub,marginBottom:16,lineHeight:1.5}}>
          Open IronLog on your other device → Backup → Restore QR, then scan {qrUrls.length>1?"each code in order":"this code"}.
        </div>
        {generating&&<div style={{padding:"32px 0",color:c.sub,fontSize:14}}>Generating QR{hist.length>100?"…this may take a moment":""}…</div>}
        {error&&<div style={{color:c.r,fontSize:13,padding:"12px 0"}}>{error}</div>}
        {!generating&&!error&&qrUrls.length>0&&(
          <>
            {qrUrls.length>1&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{background:c.card2,border:"none",borderRadius:9,padding:"6px 14px",cursor:page===0?"not-allowed":"pointer",color:page===0?c.border:c.text,fontFamily:"inherit",fontSize:13,fontWeight:700}}>‹ Prev</button>
                <span style={{fontSize:13,fontWeight:700,color:c.text}}>Code {page+1} of {qrUrls.length}</span>
                <button onClick={()=>setPage(p=>Math.min(qrUrls.length-1,p+1))} disabled={page===qrUrls.length-1} style={{background:c.card2,border:"none",borderRadius:9,padding:"6px 14px",cursor:page===qrUrls.length-1?"not-allowed":"pointer",color:page===qrUrls.length-1?c.border:c.text,fontFamily:"inherit",fontSize:13,fontWeight:700}}>Next ›</button>
              </div>
            )}
            <img src={qrUrls[page]} alt="QR code" style={{width:240,height:240,borderRadius:12,display:"block",margin:"0 auto"}}/>
            {qrUrls.length>1&&(
              <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:10}}>
                {qrUrls.map((_,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:i===page?c.accent:c.border,transition:"background .2s"}}/>)}
              </div>
            )}
            <div style={{fontSize:11,color:c.sub,marginTop:12}}>{hist.length} workouts · {qrUrls.length} QR code{qrUrls.length>1?"s":""}</div>
          </>
        )}
        <button onClick={onClose} style={{marginTop:16,background:c.card2,border:"none",borderRadius:12,padding:"10px 24px",fontSize:14,fontWeight:700,cursor:"pointer",color:c.sub,fontFamily:"inherit",width:"100%"}}>Close</button>
      </div>
    </div>
  );
}

// ── QR Import scanner (reads chunked QR payloads) ──────────────────────────
export function QRImportReceiver({c,onImport,onClose}){
  const [chunks,setChunks]=useState({});
  const [total,setTotal]=useState(null);
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");

  const handleScan=(text)=>{
    try{
      const obj=JSON.parse(text);
      if(obj.i==null||obj.t==null||!obj.d){setErr("Invalid QR code. Use IronLog QR codes only.");return;}
      setTotal(obj.t);
      setChunks(p=>{
        const next={...p,[obj.i]:obj.d};
        if(Object.keys(next).length===obj.t){
          // All chunks received — reconstruct
          let compressed="";
          for(let i=0;i<obj.t;i++)compressed+=next[i]||"";
          try{
            const json=LZString.decompressFromEncodedURIComponent(compressed);
            const data=JSON.parse(json);
            onImport(data);
            setDone(true);
          }catch(e){setErr("Failed to decode: "+e.message);}
        }
        return next;
      });
    }catch(e){setErr("Not a valid IronLog QR code.");}
  };

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:c.card,borderRadius:24,padding:24,width:"100%",maxWidth:340,textAlign:"center"}}>
        <div style={{fontWeight:900,fontSize:18,color:c.text,marginBottom:8}}>📷 Scan QR Code</div>
        {done
          ?<div style={{color:c.g,fontSize:15,fontWeight:700,padding:"20px 0"}}>✅ Data imported successfully!</div>
          :<>
            <div style={{fontSize:13,color:c.sub,marginBottom:16,lineHeight:1.5}}>
              Paste the QR text below (or use your phone camera and copy the text):
            </div>
            <textarea rows={4} placeholder="Paste QR code content here…"
              style={{width:"100%",background:c.card2,border:"1.5px solid "+c.border,borderRadius:12,padding:"10px 12px",fontSize:13,color:c.text,fontFamily:"inherit",resize:"none",outline:"none",boxSizing:"border-box"}}
              onChange={e=>e.target.value.trim()&&handleScan(e.target.value.trim())}/>
            {total&&<div style={{fontSize:12,color:c.sub,marginTop:8}}>{Object.keys(chunks).length} / {total} codes scanned</div>}
            {err&&<div style={{color:c.r,fontSize:12,marginTop:8}}>{err}</div>}
          </>
        }
        <button onClick={onClose} style={{marginTop:16,background:c.card2,border:"none",borderRadius:12,padding:"10px 24px",fontSize:14,fontWeight:700,cursor:"pointer",color:c.sub,fontFamily:"inherit",width:"100%"}}>Close</button>
      </div>
    </div>
  );
}
