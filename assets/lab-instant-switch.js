/* Shared optional, user-initiated instant switching for the Mixing and Mastering Labs.
 * Download/decode only the selected set of short recordings after Prepare is tapped.
 * All decoded sources start together; A/B switches change gains, not playback time.
 * Ordinary <audio> playback is owned by each lab and always remains the fallback.
 */
(()=>{
  'use strict';
  const FADE=0.004;
  const START_LEAD=0.025;
  const LIMIT=64*1024*1024;
  class LabInstantSwitch {
    constructor({onProgress=()=>{},onEnded=()=>{},maxDownloadBytes=LIMIT,maxDecodedBytes=LIMIT}={}){
      this.onProgress=onProgress;
      this.onEnded=onEnded;
      this.maxDownloadBytes=maxDownloadBytes;
      this.maxDecodedBytes=maxDecodedBytes;
      this.context=null;
      this.abort=null;
      this.version=0;
      this.buffers=null;
      this.keys=[];
      this.gains=null;
      this.nodes=null;
      this.volumes=null;
      this.current=null;
      this.duration=0;
      this.offset=0;
      this.startedOffset=0;
      this.startedAt=0;
      this.running=false;
    }
    static supported(){
      return Boolean(window.AudioContext||window.webkitAudioContext)&&typeof window.fetch==='function';
    }
    unlock(){
      if(!LabInstantSwitch.supported())return false;
      if(!this.context){
        const Context=window.AudioContext||window.webkitAudioContext;
        this.context=new Context({latencyHint:'interactive'});
      }
      if(this.context.state!=='running')this.context.resume().catch(()=>{});
      return true;
    }
    async prepare({id='',sources,duration}){
      if(!LabInstantSwitch.supported())throw Error('Instant audio switching is unsupported.');
      if(!Array.isArray(sources)||sources.length<2||sources.length>3||
          sources.some(x=>!x||typeof x.key!=='string'||!x.key||
            typeof x.url!=='string'||!x.url)||
          new Set(sources.map(x=>x.key)).size!==sources.length){
        throw Error('Choose two or three distinct recordings.');
      }
      // Called synchronously from a listener's button gesture before awaits.
      this.clear();
      this.unlock();
      const token=this.version;
      const resume=this.context.resume();
      const controller=new AbortController();
      this.abort=controller;
      let downloaded=0,downloadedBytes=0,decodedBytes=0;
      const urls=[...new Set(sources.map(x=>x.url))];
      const decoded=await Promise.all(urls.map(async url=>{
        const response=await fetch(url,{signal:controller.signal,cache:'force-cache'});
        if(!response.ok)throw Error('Audio could not be fetched (HTTP '+response.status+').');
        const length=Number(response.headers?.get?.('content-length')||0);
        if(length>this.maxDownloadBytes)throw Error('Audio preparation exceeds download limit.');
        const data=await response.arrayBuffer();
        downloadedBytes+=data.byteLength;
        if(downloadedBytes>this.maxDownloadBytes)throw Error('Audio preparation exceeds download limit.');
        if(controller.signal.aborted)throw Error('Audio preparation cancelled.');
        downloaded++;
        if(token===this.version)this.onProgress(downloaded,urls.length);
        const buffer=await this.context.decodeAudioData(data);
        if(buffer.numberOfChannels<1||buffer.numberOfChannels>2||buffer.length<44100){
          throw Error('This comparison needs valid mono or stereo recordings.');
        }
        decodedBytes+=buffer.length*buffer.numberOfChannels*4;
        if(decodedBytes>this.maxDecodedBytes)throw Error('Audio preparation exceeds memory limit.');
        return [url,buffer];
      }));
      await resume;
      if(token!==this.version||controller.signal.aborted)return false;
      const lookup=new Map(decoded);
      this.keys=sources.map(x=>x.key);
      this.buffers=new Map(sources.map(x=>[x.key,lookup.get(x.url)]));
      this.volumes=new Map(sources.map(x=>[x.key,Number.isFinite(x.gain)?x.gain:1]));
      this.current=this.keys[0];
      this.duration=Math.min(Number.isFinite(duration)&&duration>0?duration:Infinity,
        ...sources.map(x=>lookup.get(x.url).duration));
      if(!(this.duration>0)){
        this.clear();throw Error('The recordings have no common listening duration.');
      }
      this.offset=0;
      this.abort=null;
      this.id=id;
      return true;
    }
    isReady(){return Boolean(this.buffers);}
    isPlaying(){return this.running;}
    position(){
      if(!this.running||!this.context)return this.offset;
      return Math.max(0,Math.min(this.duration,
        this.startedOffset+Math.max(0,this.context.currentTime-this.startedAt)));
    }
    select(key){
      if(!this.isReady()||!this.buffers.has(key))return false;
      this.current=key;
      if(!this.running||!this.gains)return true;
      const now=this.context.currentTime;
      for(const [name,node] of this.gains){
        const gain=node.gain;
        if(typeof gain.cancelAndHoldAtTime==='function')gain.cancelAndHoldAtTime(now);
        else{
          const level=gain.value;
          gain.cancelScheduledValues(now);
          gain.setValueAtTime(level,now);
        }
        gain.linearRampToValueAtTime(name===key?this.volumes.get(key):0,now+FADE);
      }
      return true;
    }
    play(){
      if(!this.isReady())return false;
      if(this.running)return true;
      if(this.offset>=this.duration-0.03)this.offset=0;
      if(this.context.state!=='running')this.context.resume().catch(()=>{});
      this.stopNodes();
      const when=this.context.currentTime+START_LEAD;
      const offset=Math.max(0,Math.min(this.offset,this.duration-0.03));
      const nodes=new Map(),gains=new Map(),token=this.version;
      for(const key of this.keys){
        const source=this.context.createBufferSource();
        source.buffer=this.buffers.get(key);
        const gain=this.context.createGain();
        gain.gain.setValueAtTime(key===this.current?this.volumes.get(key):0,when);
        source.connect(gain);
        gain.connect(this.context.destination);
        nodes.set(key,source);
        gains.set(key,gain);
      }
      this.nodes=nodes;
      this.gains=gains;
      this.startedAt=when;
      this.startedOffset=offset;
      this.running=true;
      for(const source of nodes.values())source.start(when,offset,this.duration-offset);
      nodes.get(this.keys[0]).onended=()=>{
        if(token!==this.version||!this.running||this.nodes!==nodes)return;
        this.offset=this.duration;
        this.running=false;
        this.stopNodes();
        this.onEnded();
      };
      return true;
    }
    pause(){
      if(!this.running)return;
      this.offset=this.position();
      this.running=false;
      this.stopNodes();
    }
    seek(seconds){
      if(!this.isReady())return;
      const next=Math.max(0,Math.min(Number(seconds)||0,this.duration));
      const wasPlaying=this.running;
      if(wasPlaying)this.pause();
      this.offset=next;
      if(wasPlaying&&next<this.duration)this.play();
    }
    stopNodes(){
      if(this.nodes)for(const source of this.nodes.values()){
        source.onended=null;
        try{source.stop();}catch(_){}
        try{source.disconnect();}catch(_){}
      }
      if(this.gains)for(const node of this.gains.values()){
        try{node.disconnect();}catch(_){}
      }
      this.nodes=null;this.gains=null;
    }
    clear(){
      this.version++;
      if(this.abort)this.abort.abort();
      this.abort=null;
      this.running=false;
      this.stopNodes();
      this.buffers=null;this.keys=[];this.volumes=null;this.current=null;
      this.duration=0;this.offset=0;this.id=null;
    }
    dispose(){
      this.clear();
      const context=this.context;
      this.context=null;
      if(context&&context.state!=='closed')context.close().catch(()=>{});
    }
  }
  window.TSQLabInstantSwitch=LabInstantSwitch;
})();
