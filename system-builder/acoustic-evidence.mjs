/**
 * Shared amplifier + passive-speaker loudness evidence translator.
 * The original catalog's 1 W versus 2.83 V sensitivity basis is retained.
 * Use ONLY same-nominal-load full-band continuous amplifier test ratings.
 */
export function acousticEvidenceForPair(speaker={},amplifier={}) {
  const s=speaker.record||speaker;
  const amp=amplifier.record||amplifier;
  const v=s?.values||{};
  const nominal=v.load;
  const sensitivity=v.sensitivity;
  const basis=v.basis;
  if(!Number.isFinite(nominal)||nominal<=0||
      !Number.isFinite(sensitivity)||
      !['power','voltage'].includes(basis))return null;
  const ratings=amp?.ratings||[];
  const match=ratings.find(r=>Array.isArray(r)&&r[2]==='continuous'&&
    r[1]===nominal&&Number.isFinite(r[0])&&r[0]>0&&
    /20\s*Hz\s*[–-]\s*20\s*kHz/i.test(r[3]||''));
  if(!match)return null;
  // A 2.83 V sensitivity corresponds to 8/R watts at nominal impedance.
  const sensitivityDb1W1m=basis==='voltage' ?
    sensitivity-10*Math.log10(8/nominal):sensitivity;
  return {
    speakerModel:s?.model||speaker.name||'Speaker',
    amplifierModel:amp?.model||amplifier.name||'Amplifier',
    sensitivityDb1W1m:Number(sensitivityDb1W1m.toFixed(2)),
    nominalOhms:nominal,
    pairGainDb:3,
    continuousWattsPerChannel:match[0],
    reference:'catalog_same_load_full_band',
    sourceUrls:[s?.url,amp?.url].filter(Boolean)
  };
}
