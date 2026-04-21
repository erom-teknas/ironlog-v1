// ─── IndexedDB Storage (persistent on iPhone, survives cache clears) ──────────
var IDB_NAME="ironlog_db",IDB_VER=1,IDB_STORE="kv";
var _idb=null;
export function openDB(){
  if(_idb)return Promise.resolve(_idb);
  return new Promise((res,rej)=>{
    var r=indexedDB.open(IDB_NAME,IDB_VER);
    r.onupgradeneeded=e=>{e.target.result.createObjectStore(IDB_STORE,{keyPath:"k"});};
    r.onsuccess=e=>{_idb=e.target.result;res(_idb);};
    r.onerror=e=>rej(e.target.error);
  });
}
export function idbSet(k,v){
  return openDB().then(db=>new Promise((res,rej)=>{
    var tx=db.transaction(IDB_STORE,"readwrite");
    tx.objectStore(IDB_STORE).put({k,v:JSON.stringify(v)});
    tx.oncomplete=()=>res();
    tx.onerror=e=>rej(e.target.error);
  })).catch(()=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}});
}
export function idbGet(k,def){
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
export function lsGet(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
export function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
