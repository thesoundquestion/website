/* Mixing Lab: lossless published audio via Cloudflare; optional replacement files stay private. */
(() => {
  'use strict';
  const DURATION = 30;
  const TYPES = ['narrow', 'reference', 'polished'];
  const METRIC = { narrow: ['−42.77 dB', '5%'], reference: ['−14.61 dB', '67%'], polished: ['−9.68 dB', '88%'] };
  const audio = document.getElementById('labAudio');
  audio.addEventListener('play',()=>document.dispatchEvent(new CustomEvent('tsq-lab-audio-focus',{detail:{owner:'mixing'}})));
  document.addEventListener('tsq-lab-audio-focus',event=>{
    if(event.detail?.owner==='mixing')return;
    audio.pause();
    if(instant.prepared){engine.pause();stopClock();updatePlayButton();updateTime()}
  });
  const status = document.getElementById('playerStatus');
  const slider = document.getElementById('seek');
  const playBtn = document.getElementById('playToggle');
  const restartBtn = document.getElementById('restart');
  const timeDisplay = document.getElementById('timeDisplay');
  let current = 'narrow';
  let pendingSeek = null;
  let requestedVersion = 0;
  let currentPlaying = false;
  let userStarted = false;
  let waitingForBuffer = false;
  const readiness = window.TSQLabReadiness;
  const cache = readiness.createCache({maxFiles:2,maxBytes:23*1024*1024,onChange:()=>updateVariant()});
  const instant={preparing:false,prepared:false,failed:false,token:0};
  let instantTimer=null;
  const engine=window.TSQLabInstantSwitch?.supported()?
    new window.TSQLabInstantSwitch({
      onProgress:(count,total)=>{
        if(instant.preparing)document.getElementById('instantProgress').textContent=
          'Preparing recordings: '+count+' of '+total+' downloaded';
      },
      onEnded:()=>{
        if(!instant.prepared)return;
        stopClock();updateTime();updatePlayButton();
        tell('Excerpt finished. Try switching mixes or restart.');
      }
    }):null;
  const isPlaying=()=>instant.prepared?engine.isPlaying():!audio.paused&&!audio.ended;
  const getPosition=()=>instant.prepared?engine.position():
    (Number.isFinite(audio.currentTime)?audio.currentTime:0);
  const dispatchFocus=()=>document.dispatchEvent(
    new CustomEvent('tsq-lab-audio-focus',{detail:{owner:'mixing'}}));
  function stopClock(){if(instantTimer!==null){clearInterval(instantTimer);instantTimer=null}}
  function startClock(){stopClock();instantTimer=setInterval(()=>{updateTime();updatePlayButton()},180)}
  function paintInstant(){
    const button=document.getElementById('prepareInstant');
    const notice=document.getElementById('instantReadiness');
    button.disabled=instant.preparing||!engine;
    button.textContent=instant.prepared?'Return to regular playback':
      engine?'Prepare instant switching (optional)':'Instant switching unavailable here';
    notice.hidden=!instant.preparing&&!instant.prepared&&!instant.failed;
    if(!notice.hidden)readiness.set(notice,
      instant.preparing?'wait':instant.prepared?'ready':'offline');
  }
  function clearInstant(){
    const previous={playing:instant.prepared?engine.isPlaying():isPlaying(),at:getPosition()};
    instant.token++;
    engine?.clear();
    instant.preparing=false;instant.prepared=false;instant.failed=false;
    stopClock();paintInstant();
    document.getElementById('instantProgress').textContent='';
    return previous;
  }
  const AUDIO_HOST = 'https://tsq-lab-audio.thesoundquestion.workers.dev';
  const files = Object.create(null);
  for (const type of TYPES) files[type] = { name: type + '.flac', url: AUDIO_HOST + '/mixing/' + type + '.flac', local: false };

  const fmt = (seconds) => {
    const n = Math.max(0, Math.min(DURATION, Number(seconds) || 0));
    return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}.${Math.floor((n % 1) * 10)}`;
  };
  const tell = (message) => { status.textContent = message; };
  const updateTime = () => {
    const value=Math.min(DURATION,getPosition());
    slider.value = String(value);
    timeDisplay.textContent = `${fmt(value)} / 0:30.0`;
  };
  const updatePlayButton = () => {
    currentPlaying = isPlaying();
    document.getElementById('playLabel').textContent = currentPlaying ? 'Pause' : 'Play';
    document.getElementById('playIcon').textContent = currentPlaying ? 'Ⅱ' : '▶';
  };
  const updateVariant = () => {
    TYPES.forEach(type => {
      const selected = type === current;
      document.querySelector(`[data-variant-card="${type}"]`).classList.toggle('is-active', selected);
      document.querySelector(`[data-mix="${type}"]`).setAttribute('aria-pressed', String(selected));
      document.querySelector(`[data-guide="${type}"]`).hidden = !selected;
      const ready = document.querySelector(`[data-state="${type}"]`);
      ready.hidden=!userStarted && !files[type]?.local && !instant.prepared && !instant.preparing;
      if(instant.prepared||instant.preparing)
        readiness.set(ready,instant.prepared?'ready':'wait');
      else readiness.set(ready,readiness.status({
        url:files[type]?.url,
        failed:!!files[type]?.failed,
        prepared:!!files[type]?.local||cache.has(type),
        active:type===current,
        media:audio,
        waiting:waitingForBuffer
      }));
    });
    document.getElementById('widthReadout').textContent = METRIC[current][0];
    document.getElementById('widthBar').style.width = METRIC[current][1];
    const hasAudio = Boolean(files[current]);
    playBtn.disabled = !hasAudio;
    restartBtn.disabled = !hasAudio;
    slider.disabled = !hasAudio;
  };
  const setSource = (type, keepPosition = true, forceResume = false, at = null) => {
    if(instant.prepared){
      current=type;engine.select(type);updateVariant();updateTime();updatePlayButton();
      tell('Instant switch to '+(type==='reference'?'Conventional Reference':
        type==='narrow'?'Extreme Narrow':'Creative / Polished')+'.');
      return;
    }
    const wasPlaying=forceResume||(!audio.paused&&!audio.ended);
    const time=Number.isFinite(at)?at:
      keepPosition&&Number.isFinite(audio.currentTime)?audio.currentTime:0;
    current = type;
    waitingForBuffer = false;
    requestedVersion += 1;
    const version = requestedVersion;
    updateVariant();
    audio.pause();
    if (!files[type]) {
      audio.removeAttribute('src');
      audio.load();
      pendingSeek = null;
      slider.value = '0';
      timeDisplay.textContent = `${fmt(time)} / 0:30.0`;
      tell(`Load the ${type} WAV to audition it.`);
      updatePlayButton();
      return;
    }
    pendingSeek = Math.max(0, Math.min(DURATION - 0.05, time));
    // A visitor looking at the page, or choosing a mix before Play, should
    // cause zero media requests. preload=none alone is not a reliable guard.
    if(!userStarted){
      audio.removeAttribute('src');audio.preload='none';audio.load();
      tell('Mix selected. Press Play when ready.');
      updatePlayButton();
      return;
    }
    audio.preload = 'auto';
    audio.src = files[type].local ? files[type].url : (cache.get(type) || files[type].url);
    audio.load();
    // Resume within the selection tap, not asynchronously at loadedmetadata.
    // Some mobile browsers block playback after the original gesture ends.
    if(wasPlaying)audio.play().catch(()=>{
      if(version===requestedVersion)tell('Press Play to continue; your browser requires another tap.');
    });
    const label = type === 'reference' ? 'Conventional Reference' : type === 'narrow' ? 'Extreme Narrow' : 'Creative / Polished';
    tell(`${label} selected. ${wasPlaying ? 'Continuing near the same position.' : 'Press Play when ready.'}`);
    if (version !== requestedVersion) return;
    updatePlayButton();
  };
  const useFile = (type, file) => {
    if (!file) return;
    if (!/\.(wav|flac)$/i.test(file.name) && !/(wav|flac)/i.test(file.type)) { tell(`Please choose a WAV or FLAC file for ${type}.`); return; }
    const prior=(instant.prepared||instant.preparing)?clearInstant():null;
    if (files[type]?.local) URL.revokeObjectURL(files[type].url);
    cache.drop(type);
    files[type] = { name: file.name, url: URL.createObjectURL(file), local: true, failed:false };
    const selected = current === type;
    updateVariant();
    if(prior){
      setSource(current,true,prior.playing,prior.at);
      tell('Recording updated. Instant switching is off until you prepare the new selection.');
    }else if(selected)setSource(type,false);
  };
  const guessType = (name) => {
    const n = name.toUpperCase();
    if (n.includes('NARROW')) return 'narrow';
    if (n.includes('REFERENCE') || n.includes('CONVENTIONAL')) return 'reference';
    if (n.includes('POLISHED') || n.includes('SPATIAL')) return 'polished';
    return null;
  };
  document.getElementById('fileBatch').addEventListener('change', (event) => {
    let added = 0;
    for (const file of Array.from(event.target.files || [])) {
      const type = guessType(file.name);
      if (type) { useFile(type, file); added += 1; }
    }
    if (added === 0) tell('No matching filenames found. Use “Replace this recording” beside each mix.');
    else tell(`${added} audio ${added === 1 ? 'file' : 'files'} selected on your device. Select a mix and press Play.`);
    event.target.value = '';
  });
  document.querySelectorAll('[data-file-for]').forEach(input => input.addEventListener('change', event => {
    const file = event.target.files && event.target.files[0];
    useFile(input.dataset.fileFor, file);
    if (file) tell(`${file.name} loaded locally for ${input.dataset.fileFor}.`);
    event.target.value = '';
  }));
  document.querySelectorAll('[data-mix]').forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.mix !== current) setSource(btn.dataset.mix);
  }));
  audio.addEventListener('loadedmetadata', () => {
    if (pendingSeek !== null) {
      try { audio.currentTime = Math.min(pendingSeek, Math.max(0, (audio.duration || DURATION) - 0.05)); } catch (_error) { /* browser handles this later */ }
    }
    pendingSeek = null;
    updateTime();
    updateVariant();
  });
  function maybePrepareNext(){
    if(instant.preparing||instant.prepared)return;
    if(!userStarted || audio.paused || waitingForBuffer || !readiness.mediaReady(audio))return;
    if(!readiness.networkPermitsPreload())return;
    if(cache.keys().some(key=>key!==current))return; // one alternate at a time
    const order=TYPES.slice(TYPES.indexOf(current)+1).concat(TYPES.slice(0,TYPES.indexOf(current)));
    const next=order.find(type=>!files[type].local && !cache.has(type));
    if(next)cache.prepare(next,files[next].url,{pinned:[current]});
  }
  audio.addEventListener('progress',()=>{updateVariant();maybePrepareNext()});
  audio.addEventListener('canplay',()=>{waitingForBuffer=false;updateVariant();maybePrepareNext()});
  audio.addEventListener('playing',()=>{waitingForBuffer=false;updateVariant();maybePrepareNext()});
  audio.addEventListener('waiting',()=>{waitingForBuffer=true;updateVariant();tell('Please wait while audio buffers. Your place is preserved.')});
  audio.addEventListener('stalled',()=>{waitingForBuffer=true;updateVariant();tell('Please wait while audio buffers. Your place is preserved.')});
  audio.addEventListener('seeked',()=>{waitingForBuffer=false;updateVariant()});
  audio.addEventListener('timeupdate',()=>{updateTime();updateVariant()});
  audio.addEventListener('play', updatePlayButton);
  audio.addEventListener('pause', updatePlayButton);
  audio.addEventListener('ended', () => { updatePlayButton(); tell('Excerpt finished. Choose another mix to compare.'); });
  audio.addEventListener('error', () => {if(files[current])files[current].failed=true;updateVariant();tell('Playback failed. Check your connection or replace this recording with a local WAV or FLAC.')});
  playBtn.addEventListener('click', () => {
    if (!files[current]) return;
    if(instant.prepared){
      if(engine.isPlaying()){engine.pause();stopClock()}
      else{engine.play();dispatchFocus();startClock()}
      updatePlayButton();updateTime();return;
    }
    if (audio.paused) {
      if(!userStarted){
        const requestedCue=pendingSeek;
        userStarted=true;setSource(current,false);
        if(requestedCue!==null)pendingSeek=requestedCue;
      }
      audio.preload='auto';
      audio.play().catch(() => tell('Playback unavailable. Try another WAV or browser.'));
    }
    else audio.pause();
  });
  restartBtn.addEventListener('click', () => {
    if(instant.prepared){
      engine.seek(0);engine.play();dispatchFocus();startClock();
      updateTime();updatePlayButton();return;
    }
    if(!userStarted){userStarted=true;setSource(current,false)}
    audio.preload='auto';
    audio.currentTime = 0;
    updateTime();
    if (audio.paused) audio.play().catch(() => tell('Press Play to start.'));
  });
  slider.addEventListener('input', () => {
    if (!files[current]) return;
    if(instant.prepared){engine.seek(Number(slider.value));updateTime();updatePlayButton();return}
    try { audio.currentTime = Number(slider.value); } catch (_error) { /* wait for metadata */ }
    updateTime();
  });
  document.querySelectorAll('[data-seek]').forEach(btn => btn.addEventListener('click', () => {
    if (!files[current]) { tell('Load a WAV before using the cue buttons.'); return; }
    const time = Math.max(0, Math.min(DURATION - .05, Number(btn.dataset.seek)));
    if(instant.prepared)engine.seek(time);
    else if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = time;
    else pendingSeek = time;
    updateTime();
  }));
  document.getElementById('prepareInstant').addEventListener('click',async()=>{
    if(!engine||instant.preparing)return;
    if(instant.prepared){
      const prior=clearInstant();
      setSource(current,true,prior.playing,prior.at);
      tell('Regular playback restored. Mix switching may pause briefly.');
      return;
    }
    const token=++instant.token;
    instant.preparing=true;instant.failed=false;
    document.getElementById('instantProgress').textContent='Preparing recordings: 0 of 3 downloaded';
    paintInstant();
    try{
      // Nothing is fetched or decoded until the listener explicitly taps Prepare.
      const ok=await engine.prepare({
        id:'mixing',duration:DURATION,
        sources:TYPES.map(type=>({key:type,url:files[type].url,gain:1}))
      });
      if(token!==instant.token)return;
      if(!ok)throw Error('Preparation cancelled');
      const wasPlaying=!audio.paused&&!audio.ended;
      const at=Math.min(DURATION-.05,Number.isFinite(audio.currentTime)?audio.currentTime:0);
      engine.select(current);engine.seek(at);
      audio.pause();cache.clear();
      instant.preparing=false;instant.prepared=true;userStarted=true;
      if(wasPlaying){engine.play();dispatchFocus();startClock()}
      document.getElementById('instantProgress').textContent=
        'All three mixes ready. Selection buttons now switch instantly.';
      paintInstant();updateVariant();updateTime();updatePlayButton();
      tell(wasPlaying?'Instant switching is on. Try another mix.':'Ready. Press Play to compare the mixes.');
    }catch(_){
      if(token!==instant.token)return;
      engine.clear();instant.preparing=false;instant.prepared=false;instant.failed=true;
      document.getElementById('instantProgress').textContent=
        'Could not prepare all recordings. Regular playback still works.';
      paintInstant();updateVariant();
    }
  });
  window.addEventListener('pagehide', () => {
    stopClock();engine?.dispose();cache.close();
    Object.values(files).filter(file => file.local).forEach(file => URL.revokeObjectURL(file.url));
  });
  updateVariant();
  paintInstant();
  updateTime();
  setSource(current, false);
})();
