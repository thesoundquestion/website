/* The Sound Question: buffered, synchronized format comparison.
 * All three approved versions of ONE short song are decoded before playback.
 * Once ready, all sources share the AudioContext clock; switching only changes
 * gain, not sources, seek position, or network requests. No libraries or APIs.
 *
 * Graceful fallback belongs to the page controller: FLAC decode/CORS/network
 * or memory failures must not leave visitors without an ordinary <audio> player.
 */
(() => {
  'use strict';
  const FORMATS = Object.freeze(['lossless', '128', '320']);
  const FADE_SECONDS = 0.004;
  const START_LEAD = 0.025;
  // One deliberately chosen short song only. 40 s × 3 stereo PCM buffers
  // at 48 kHz costs about 46 MB, before modest browser overhead.
  const MAX_DOWNLOAD_BYTES = 14 * 1024 * 1024;
  const MAX_DECODED_BYTES = 48 * 1024 * 1024;

  class SynchronizedFormatBuffers {
    constructor({ onProgress = () => {}, onEnded = () => {} } = {}) {
      this.onProgress = onProgress;
      this.onEnded = onEnded;
      this.context = null;
      this.buffers = null;
      this.sources = null;
      this.gains = null;
      this.abort = null;
      this.version = 0;
      this.song = null;
      this.format = 'lossless';
      this.volumes = null;
      this.duration = 0;
      this.offset = 0;
      this.startedAt = 0;
      this.startedOffset = 0;
      this.running = false;
    }

    static supported() {
      return Boolean(window.AudioContext || window.webkitAudioContext) &&
        typeof window.fetch === 'function';
    }

    // Call during the listener's Prepare tap, BEFORE any awaits or downloads.
    // That preserves mobile browsers' user-gesture permission for Web Audio.
    unlock() {
      if (!SynchronizedFormatBuffers.supported()) return false;
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!this.context) this.context = new Ctor({ latencyHint: 'interactive' });
      if (this.context.state !== 'running') this.context.resume().catch(() => {});
      return true;
    }

    async prepare(song, urls, volumes) {
      if (!SynchronizedFormatBuffers.supported()) {
        throw new Error('Synchronized audio is not supported in this browser.');
      }
      this.clear();
      const token = this.version;
      this.song = song;
      this.volumes = { ...volumes };
      this.unlock();
      const resumePromise = this.context.resume();
      this.abort = new AbortController();
      const signal = this.abort.signal;
      let downloaded = 0, downloadedBytes = 0, decodedBytes = 0;
      const tracks = await Promise.all(FORMATS.map(async format => {
        const res = await fetch(urls[format], { signal, cache: 'force-cache' });
        if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + format);
        const declared = Number(res.headers?.get?.('content-length') || 0);
        if (declared > MAX_DOWNLOAD_BYTES) throw new Error('Too much audio to prepare.');
        const bytes = await res.arrayBuffer();
        downloadedBytes += bytes.byteLength;
        if (downloadedBytes > MAX_DOWNLOAD_BYTES) throw new Error('Too much audio to prepare.');
        if (signal.aborted) throw new Error('Audio preparation was cancelled.');
        downloaded++;
        if (token === this.version) this.onProgress(downloaded, FORMATS.length);
        const decoded = await this.context.decodeAudioData(bytes);
        if (decoded.numberOfChannels !== 2 || decoded.length < 44100) {
          throw new Error('Invalid stereo comparison source: ' + format);
        }
        decodedBytes += decoded.length * decoded.numberOfChannels * 4;
        if (decodedBytes > MAX_DECODED_BYTES) throw new Error('Decoded audio exceeds the preparation limit.');
        return [format, decoded];
      }));
      await resumePromise;
      if (token !== this.version || signal.aborted) return false;
      this.buffers = new Map(tracks);
      // Use the shared excerpt duration, not one decoder's MP3 padding.
      this.duration = Math.min(Number(urls.duration) || Infinity,
        ...tracks.map(([, buffer]) => buffer.duration));
      if (!Number.isFinite(this.duration) || this.duration <= 0) {
        throw new Error('Invalid comparison duration.');
      }
      this.abort = null;
      this.offset = 0;
      return true;
    }

    isReady() { return Boolean(this.buffers); }
    isPlaying() { return this.running; }
    position() {
      if (!this.running || !this.context) return this.offset;
      return Math.max(0, Math.min(this.duration,
        this.startedOffset + Math.max(0, this.context.currentTime - this.startedAt)));
    }

    select(format) {
      if (!FORMATS.includes(format)) throw new Error('Unknown audio format');
      this.format = format;
      if (!this.running || !this.gains || !this.context) return;
      const now = this.context.currentTime;
      for (const [key, node] of this.gains) {
        const gain = node.gain;
        // Cancel older fades for rapid A/B/A switching. Do not restart sources.
        if (typeof gain.cancelAndHoldAtTime === 'function') {
          gain.cancelAndHoldAtTime(now);
        } else {
          const from = gain.value;
          gain.cancelScheduledValues(now);
          gain.setValueAtTime(from, now);
        }
        gain.linearRampToValueAtTime(
          key === format ? this.volumes[key] : 0, now + FADE_SECONDS);
      }
    }

    play() {
      if (!this.isReady()) return false;
      if (this.running) return true;
      if (this.offset >= this.duration - 0.03) this.offset = 0;
      // A resume request on direct user interaction is required on mobile.
      if (this.context.state !== 'running') this.context.resume().catch(() => {});
      this._stopNodes();
      const at = Math.max(0, Math.min(this.offset, this.duration - 0.03));
      const start = this.context.currentTime + START_LEAD;
      const nodes = new Map();
      const gains = new Map();
      const token = this.version;
      for (const format of FORMATS) {
        const source = this.context.createBufferSource();
        source.buffer = this.buffers.get(format);
        const gain = this.context.createGain();
        gain.gain.setValueAtTime(format === this.format ? this.volumes[format] : 0, start);
        source.connect(gain);
        gain.connect(this.context.destination);
        nodes.set(format, source);
        gains.set(format, gain);
      }
      this.sources = nodes;
      this.gains = gains;
      this.startedAt = start;
      this.startedOffset = at;
      this.running = true;
      // All three sources start with the same offset and audio clock time.
      for (const source of nodes.values()) source.start(start, at, this.duration - at);
      nodes.get('lossless').onended = () => {
        if (token !== this.version || !this.running || this.sources !== nodes) return;
        this.offset = this.duration;
        this.running = false;
        this._stopNodes();
        this.onEnded();
      };
      return true;
    }

    pause() {
      if (!this.running) return;
      this.offset = this.position();
      this.running = false;
      this._stopNodes();
    }

    seek(seconds) {
      const next = Math.max(0, Math.min(Number(seconds) || 0, this.duration));
      const resume = this.running;
      if (resume) this.pause();
      this.offset = next;
      if (resume && next < this.duration) this.play();
    }

    clear() {
      this.version++;
      if (this.abort) this.abort.abort();
      this.abort = null;
      this.running = false;
      this._stopNodes();
      this.buffers = null;
      this.duration = 0;
      this.offset = 0;
      this.song = null;
      this.volumes = null;
    }

    _stopNodes() {
      if (this.sources) for (const source of this.sources.values()) {
        source.onended = null;
        try { source.stop(); } catch (_) { /* source already ended */ }
        try { source.disconnect(); } catch (_) {}
      }
      if (this.gains) for (const gain of this.gains.values()) {
        try { gain.disconnect(); } catch (_) {}
      }
      this.sources = null;
      this.gains = null;
    }

    dispose() {
      this.clear();
      const ctx = this.context;
      this.context = null;
      if (ctx && ctx.state !== 'closed') ctx.close().catch(() => {});
    }

    // Read-only test diagnostics. No recordings or private data are exposed.
    debug() {
      return { song: this.song, format: this.format, ready: this.isReady(),
        playing: this.isPlaying(), position: this.position(), duration: this.duration,
        sources: this.sources ? this.sources.size : 0 };
    }
  }
  window.TSQFormatBuffers = SynchronizedFormatBuffers;
})();
