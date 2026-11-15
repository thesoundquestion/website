/* The Sound Question / Mixing Lab. Files stay in-browser, no network requests. */
(() => {
  'use strict';
  const DURATION = 30;
  const TYPES = ['narrow', 'reference', 'polished'];
  const METRIC = { narrow: ['−42.77 dB', '5%'], reference: ['−14.61 dB', '67%'], polished: ['−9.68 dB', '88%'] };
  const audio = document.getElementById('labAudio');
  const status = document.getElementById('playerStatus');
  const slider = document.getElementById('seek');
  const playBtn = document.getElementById('playToggle');
  const restartBtn = document.getElementById('restart');
  const timeDisplay = document.getElementById('timeDisplay');
  let current = 'narrow';
  let pendingSeek = null;
  let resumeOnReady = false;
  let requestedVersion = 0;
  let currentPlaying = false;
  const files = Object.create(null);

  const fmt = (seconds) => {
    const n = Math.max(0, Math.min(DURATION, Number(seconds) || 0));
    return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}.${Math.floor((n % 1) * 10)}`;
  };
  const tell = (message) => { status.textContent = message; };
  const updateTime = () => {
    const value = Number.isFinite(audio.currentTime) ? Math.min(DURATION, audio.currentTime) : 0;
    slider.value = String(value);
    timeDisplay.textContent = `${fmt(value)} / 0:30.0`;
  };
  const updatePlayButton = () => {
    currentPlaying = !audio.paused && !audio.ended;
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
      ready.textContent = files[type] ? '✓ Loaded' : 'Not loaded';
      ready.classList.toggle('is-ready', Boolean(files[type]));
    });
    document.getElementById('widthReadout').textContent = METRIC[current][0];
    document.getElementById('widthBar').style.width = METRIC[current][1];
    const hasAudio = Boolean(files[current]);
    playBtn.disabled = !hasAudio;
    restartBtn.disabled = !hasAudio;
    slider.disabled = !hasAudio;
  };
  const setSource = (type, keepPosition = true) => {
    const wasPlaying = !audio.paused && !audio.ended;
    const time = keepPosition && Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    current = type;
    requestedVersion += 1;
    const version = requestedVersion;
    updateVariant();
    audio.pause();
    if (!files[type]) {
      audio.removeAttribute('src');
      audio.load();
      pendingSeek = null;
      resumeOnReady = false;
      slider.value = '0';
      timeDisplay.textContent = `${fmt(time)} / 0:30.0`;
      tell(`Load the ${type} WAV to audition it.`);
      updatePlayButton();
      return;
    }
    pendingSeek = Math.max(0, Math.min(DURATION - 0.05, time));
    resumeOnReady = wasPlaying;
    audio.src = files[type].url;
    audio.load();
    const label = type === 'reference' ? 'Conventional Reference' : type === 'narrow' ? 'Extreme Narrow' : 'Creative / Polished';
    tell(`${label} selected. ${wasPlaying ? 'Continuing near the same position.' : 'Press Play when ready.'}`);
    if (version !== requestedVersion) return;
    updatePlayButton();
  };
  const useFile = (type, file) => {
    if (!file) return;
    if (!/\.wav$/i.test(file.name) && !/wav/i.test(file.type)) { tell(`Please choose a WAV file for ${type}.`); return; }
    if (files[type]) URL.revokeObjectURL(files[type].url);
    files[type] = { name: file.name, url: URL.createObjectURL(file) };
    const selected = current === type;
    updateVariant();
    if (selected) setSource(type, false);
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
    if (added === 0) tell('No matching filenames found. Use “Load just this WAV” beside each version.');
    else tell(`${added} WAV ${added === 1 ? 'file' : 'files'} loaded locally. Select a mix and press Play.`);
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
    if (resumeOnReady) {
      resumeOnReady = false;
      audio.play().catch(() => tell('Playback was blocked. Press Play to resume.'));
    }
    updateTime();
  });
  audio.addEventListener('timeupdate', updateTime);
  audio.addEventListener('play', updatePlayButton);
  audio.addEventListener('pause', updatePlayButton);
  audio.addEventListener('ended', () => { updatePlayButton(); tell('Excerpt finished. Choose another mix to compare.'); });
  audio.addEventListener('error', () => tell('This audio could not be decoded. Check that the file is a supported WAV.'));
  playBtn.addEventListener('click', () => {
    if (!files[current]) return;
    if (audio.paused) audio.play().catch(() => tell('Playback unavailable. Try another WAV or browser.'));
    else audio.pause();
  });
  restartBtn.addEventListener('click', () => {
    audio.currentTime = 0;
    updateTime();
    if (audio.paused) audio.play().catch(() => tell('Press Play to start.'));
  });
  slider.addEventListener('input', () => {
    if (!files[current]) return;
    try { audio.currentTime = Number(slider.value); } catch (_error) { /* wait for metadata */ }
    updateTime();
  });
  document.querySelectorAll('[data-seek]').forEach(btn => btn.addEventListener('click', () => {
    if (!files[current]) { tell('Load a WAV before using the cue buttons.'); return; }
    const time = Math.max(0, Math.min(DURATION - .05, Number(btn.dataset.seek)));
    if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = time;
    else pendingSeek = time;
    updateTime();
  }));
  window.addEventListener('pagehide', () => Object.values(files).forEach(file => URL.revokeObjectURL(file.url)));
  updateVariant();
  updateTime();
})();
