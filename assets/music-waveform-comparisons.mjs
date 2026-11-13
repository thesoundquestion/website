/**
 * Original, synthetic DAW-style waveform teaching examples.
 *
 * Same underlying invented 4.8-second phrase in every comparison.
 * No recorded music, remote network calls, user audio, or audio playback.
 * Illustrative feedforward compression, not measured commercial masters.
 */
export const EXCERPT_SECONDS = 4.8;
const RATE = 12000;
const COUNT = Math.round(EXCERPT_SECONDS * RATE);
const TAU = Math.PI * 2;
const clamp = (x,min,max) => Math.min(max,Math.max(min,x));
const decay = (time,at,seconds) => time>=at?Math.exp(-(time-at)/seconds):0;
const pseudonoise = t => (Math.sin(TAU*1933.7*t)*Math.sin(TAU*2807.3*t)
  +0.35*Math.sin(TAU*3917.1*t))/1.35;

/** Returns one fictional single-channel musical passage, not playback audio. */
export function syntheticMusicSample(t) {
  const beat = Math.floor(t/0.5);
  const note = [55,65.4,73.4,65.4][beat%4];
  const strumAt = Math.floor(t/0.25)*0.25;
  const guitarEnv = decay(t,strumAt,0.13);
  const bassAt = beat*0.5;
  const bassEnv = decay(t,bassAt,0.30);
  const verse = t<1.55?0.58:1;
  const guitar = verse*(0.17*Math.sin(TAU*164.81*t)
    +0.11*Math.sin(TAU*246.94*t)+0.06*Math.sin(TAU*329.63*t))*guitarEnv;
  const bass = verse*0.32*bassEnv*(Math.sin(TAU*note*t)
    +0.22*Math.sin(TAU*note*2*t));
  const kickAt = Math.floor(t)*1;
  const kickTime = t-kickAt;
  const kick = 0.54*decay(t,kickAt,0.115)
    *Math.sin(TAU*(55-8*kickTime)*kickTime);
  const snareAt = Math.floor(t-0.5)+0.5;
  const snare = snareAt>=0?verse*0.56*decay(t,snareAt,0.07)
    *(0.77*pseudonoise(t)+0.23*Math.sin(TAU*175*t)):0;
  const cymbalAt = Math.floor(t/2)*2;
  const cymbal = 0.15*decay(t,cymbalAt,0.55)*pseudonoise(t+0.2);
  return guitar+bass+kick+snare+cymbal;
}
const peak = samples => samples.reduce((p,s)=>Math.max(p,Math.abs(s)),0);
const rms = samples => Math.sqrt(
  samples.reduce((sum,s)=>sum+s*s,0)/samples.length);
const scale = (samples,multiplier) => samples.map(x=>x*multiplier);
function compress(samples,threshold,ratio,attack,release) {
  const output=new Float64Array(samples.length);
  const attackCoeff=Math.exp(-1/(attack*RATE));
  const releaseCoeff=Math.exp(-1/(release*RATE));
  let envelope=0;
  for(let i=0;i<samples.length;i++){
    const amplitude=Math.abs(samples[i]);
    const coeff=amplitude>envelope?attackCoeff:releaseCoeff;
    envelope=coeff*envelope+(1-coeff)*amplitude;
    const gain=envelope<=threshold?1:
      Math.pow(threshold/envelope,1-1/ratio);
    output[i]=samples[i]*gain;
  }
  return output;
}
let cache;
function masters() {
  if(cache)return cache;
  const source=Float64Array.from({length:COUNT},
    (_,i)=>syntheticMusicSample(i/RATE));
  const originalPeak=peak(source);
  const unprocessed=scale(source,0.95/originalPeak);
  // Fast attack on this illustration's brief transients is essential:
  // slower settings would lower sustained body without catching the peaks,
  // mis-teaching how a peak-limited master differs from a dynamic one.
  const moderateRaw=compress(source,0.24,2.7,0.00015,0.025);
  const heavyRaw=compress(source,0.065,10,0.00002,0.015);
  const peakMatched={
    dynamic:unprocessed,
    moderate:scale(moderateRaw,0.95/peak(moderateRaw)),
    limited:scale(heavyRaw,0.95/peak(heavyRaw))
  };
  const targetRms=rms(unprocessed);
  const levelMatched={
    dynamic:unprocessed,
    moderate:scale(peakMatched.moderate,targetRms/rms(peakMatched.moderate)),
    limited:scale(peakMatched.limited,targetRms/rms(peakMatched.limited))
  };
  cache={peak:peakMatched,level:levelMatched};
  return cache;
}
const TYPES=['dynamic','moderate','limited'];
/** peak: equal sample peaks at same playback knob; level: equal RMS after
 * illustrative playback gain. RMS is NOT a full perceptual loudness match. */
export function masteringSamples(type='dynamic',mode='peak') {
  if(!TYPES.includes(type)||!['peak','level'].includes(mode))
    throw new Error('Unknown waveform comparison');
  return masters()[mode][type];
}
export function sampledStats(samples) {
  const p=peak(samples),r=rms(samples);
  return {samplePeak:p,rms:r,peakAboveAverageDb:
    r>0?20*Math.log10(p/r):null};
}
export function quantizePcmSample(value,bits) {
  if(![8,16,24].includes(bits))throw new Error('Unsupported bit depth');
  const positiveCodes=2**(bits-1)-1;
  return Math.round(clamp(value,-1,1)*positiveCodes)/positiveCodes;
}
/** All bit-depth examples use precisely the SAME dynamic mastering.
 * No dither in this instructional quantizer, as disclosed in the lesson. */
export function bitDepthSamples(bits=16) {
  return masteringSamples('dynamic','peak').map(x=>quantizePcmSample(x,bits));
}
/** Generates vertical min/max strokes as familiar in Audacity or a DAW.
 * On-screen resolution conceals nearly all bit-depth rounding differences. */
export function audioEditorPath(samples,{width=720,height=90,bins=420}={}) {
  if(!samples?.length||!Number.isInteger(bins)||bins<10||bins>2000)
    throw new Error('Invalid waveform data or bins');
  const middle=height/2,extent=height*0.455;
  let path='';
  for(let i=0;i<bins;i++){
    const first=Math.floor(i*samples.length/bins);
    const last=Math.max(first+1,Math.floor((i+1)*samples.length/bins));
    let low=Infinity,high=-Infinity;
    for(let j=first;j<last;j++){
      const v=samples[j];low=Math.min(low,v);high=Math.max(high,v);
    }
    const x=((i+0.5)*width/bins).toFixed(2);
    path+='M'+x+','+(middle-high*extent).toFixed(2)+
      'V'+(middle-low*extent).toFixed(2);
  }
  return path;
}
function renderMaster(root) {
  const variants=[...root.querySelectorAll('[data-music-master]')];
  const buttons=[...root.querySelectorAll('[data-music-mode]')];
  const message=root.querySelector('[data-music-caption]');
  const status=root.querySelector('[data-music-status]');
  function show(mode) {
    for(const button of buttons){
      const yes=button.dataset.musicMode===mode;
      button.setAttribute('aria-pressed',String(yes));
      button.classList.toggle('is-current',yes);
    }
    for(const element of variants){
      const type=element.dataset.musicMaster;
      const samples=masteringSamples(type,mode);
      element.querySelector('path[data-music-wave]')?.setAttribute('d',audioEditorPath(samples));
      const svg=element.querySelector('svg[role="img"]');
      if(svg)svg.setAttribute('aria-label',type+' mastering, '+
        (mode==='peak'?'same highest sample peak and same playback setting':
        'adjusted to the same illustrative average electrical signal strength')+
        '. Original synthetic music-like waveform with 4.8 seconds of peaks and sustained passages.');
    }
    if(message)message.textContent=mode==='peak'?
      'Same volume setting, with the highest peaks reaching the same limit: the more heavily limited version fills more of the gaps between hits and usually seems louder overall.':
      'Volume adjusted for a fairer comparison: the more dynamic master now has much bigger momentary peaks compared with the music around them. These examples match signal RMS as an approximation, not perceived loudness measured in LUFS.';
    if(status)status.textContent=mode==='peak'?
      'Showing all versions with matching highest peaks.':
      'Showing all versions at matching illustrative average levels.';
  }
  for(const button of buttons)
    button.addEventListener('click',()=>show(button.dataset.musicMode));
  show('peak');
}
function renderBits(root) {
  for(const element of root.querySelectorAll('[data-music-bit-depth]')){
    const bits=Number(element.dataset.musicBitDepth);
    const samples=bitDepthSamples(bits);
    element.querySelector('path[data-music-wave]')?.setAttribute('d',audioEditorPath(samples,{bins:380}));
    const svg=element.querySelector('svg[role="img"]');
    if(svg)svg.setAttribute('aria-label',bits+
      '-bit version of the exact same invented musical passage, at normal audio-editor zoom. '+
      'The overall waveform shape looks essentially the same at each bit depth.');
  }
}
function init() {
  document.querySelectorAll('[data-music-mastering]').forEach(renderMaster);
  document.querySelectorAll('[data-music-bitdepth]').forEach(renderBits);
}
if(typeof document!=='undefined'){
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',init);
  else init();
}
