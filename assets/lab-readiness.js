/* Shared Listening Lab readiness + bounded in-session media preparation.
   No background download until the visitor starts playback. All three labels
   are deliberately identical across Mixing, Mastering, Formats and ABX. */
(() => {
  'use strict';
  const labels = Object.freeze({offline:'Offline',wait:'Please wait',ready:'Ready'});
  function bufferedAhead(media) {
    if (!media || !media.buffered || !Number.isFinite(media.currentTime)) return 0;
    const at=media.currentTime;
    try {
      for(let n=0;n<media.buffered.length;n++){
        if(media.buffered.start(n)<=at+.12 && media.buffered.end(n)>at) return Math.max(0,media.buffered.end(n)-at);
      }
    }catch{}
    return 0;
  }
  function mediaReady(media) {
    if (!media || media.error || media.seeking || media.readyState < 3) return false;
    const ahead=bufferedAhead(media);
    const left=Number.isFinite(media.duration) ? Math.max(0,media.duration-media.currentTime) : 4;
    return ahead>=Math.min(4,Math.max(.35,left-.1)) || (media.readyState===4 && ahead>.1);
  }
  function status({url,failed=false,prepared=false,active=false,media=null,waiting=false}={}) {
    if(!url || failed || (active&&media?.error)) return 'offline';
    if(prepared || (active&&!waiting&&mediaReady(media))) return 'ready';
    return 'wait';
  }
  function set(node,state){
    if(!node)return;
    const next=labels[state]?state:'wait';
    node.textContent=labels[next];
    node.dataset.readiness=next;
    node.classList.toggle('is-ready',next==='ready');
    node.classList.toggle('is-offline',next==='offline');
  }
  function networkPermitsPreload(){
    if(typeof document!=='undefined'&&document.hidden)return false;
    if(typeof navigator==='undefined')return true;
    const net=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    if(net?.saveData)return false;
    if(net?.effectiveType && /^(?:slow-2g|2g)$/.test(net.effectiveType))return false;
    return true;
  }
  function createCache({maxBytes=23*1024*1024,maxFiles=2,onChange=()=>{}}={}){
    const entries=new Map(),failed=new Set();
    let total=0,pending=null,serial=0,closed=false;
    const touch=key=>{const ent=entries.get(key);if(ent){entries.delete(key);entries.set(key,ent)}return ent};
    const has=key=>entries.has(key);
    const get=key=>touch(key)?.url||null;
    function drop(key){
      const old=entries.get(key);
      if(!old)return;
      entries.delete(key);total-=old.bytes;
      URL.revokeObjectURL(old.url);onChange(key);
    }
    function clear(){
      serial++;
      if(pending){pending.controller.abort();pending=null}
      for(const key of [...entries.keys()])drop(key);
      failed.clear();
    }
    function close(){closed=true;clear()}
    function abortPending(){
      serial++;
      if(pending){pending.controller.abort();pending=null}
    }
    async function prepare(key,src,{pinned=[]}={}){
      if(closed||!src||has(key)||!networkPermitsPreload())return get(key);
      if(pending){
        if(pending.key===key)return pending.promise;
        abortPending();
      }
      const version=++serial,controller=new AbortController();
      failed.delete(key);
      const promise=(async()=>{
        try{
          const res=await fetch(src,{method:'GET',mode:'cors',cache:'default',signal:controller.signal});
          if(!res.ok)throw Error('Audio preparation failed');
          const declared=Number(res.headers.get('content-length'));
          if(declared>maxBytes)throw Error('Audio exceeds bounded cache');
          const blob=await res.blob();
          if(!blob.size || blob.size>maxBytes)throw Error('Audio exceeds bounded cache');
          if(closed||controller.signal.aborted||version!==serial)return null;
          while((entries.size>=maxFiles||total+blob.size>maxBytes)&&entries.size){
            const candidate=[...entries.keys()].find(k=>!pinned.includes(k));
            if(!candidate)return null;
            drop(candidate);
          }
          if(blob.size+total>maxBytes)return null;
          const url=URL.createObjectURL(blob);
          entries.set(key,{url,bytes:blob.size,src});
          total+=blob.size;
          onChange(key);
          return url;
        }catch(error){
          if(!controller.signal.aborted && version===serial){failed.add(key);onChange(key)}
          return null;
        }finally{
          if(pending?.key===key&&version===serial)pending=null;
        }
      })();
      pending={key,controller,promise};onChange(key);
      return promise;
    }
    return {has,get,prepare,clear,close,drop,abortPending,failed:key=>failed.has(key),isPreparing:key=>pending?.key===key,bytes:()=>total,keys:()=>[...entries.keys()]};
  }
  const api=Object.freeze({labels,bufferedAhead,mediaReady,status,set,createCache,networkPermitsPreload});
  if(typeof window!=='undefined')window.TSQLabReadiness=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})();