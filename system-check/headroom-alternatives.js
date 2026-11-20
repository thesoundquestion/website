'use strict';

/**
 * Draft headroom repair shortlist.
 * One saved preset inventory; exact-load watts only; no price, distortion,
 * source-connection, or real-world loudness guarantees.
 */
(function (root) {
  const supportedSinglePairLoads=Object.freeze({
    // Maker speaker-impedance chart (HIGH >=6 Ω, LOW >=4 Ω).
    'Yamaha A-S301':{min:4,source:'https://ca.yamaha.com/files/download/other_assets/8/332208/web_VEX7880_A-S701_A-S501_A-S301_om_U_EnFr_A0.pdf'},
    'Yamaha A-S501':{min:4,source:'https://ca.yamaha.com/files/download/other_assets/8/332208/web_VEX7880_A-S701_A-S501_A-S301_om_U_EnFr_A0.pdf'},
    'Yamaha A-S701':{min:4,source:'https://ca.yamaha.com/files/download/other_assets/8/332208/web_VEX7880_A-S701_A-S501_A-S301_om_U_EnFr_A0.pdf'},
    // Maker specifies single-pair 6-16 Ω.
    'Sony STR-DH190':{min:6,max:16,source:'https://www.sony.ca/en/electronics/support/audio-components-receivers-amplifiers/str-dh190/specifications'}
  });
  const positive=n=>Number.isFinite(n)&&n>0;
  const permission=(amp,ohms)=>{
    const rule=supportedSinglePairLoads[amp];
    return rule&&positive(ohms)&&ohms>=rule.min&&(!rule.max||ohms<=rule.max)?rule:null;
  };
  const get=(rows,type,ohms)=>{
    const matched=(rows||[]).filter(row=>{
      const watts=Array.isArray(row)?row[0]:row.watts;
      const load=Array.isArray(row)?row[1]:row.load;
      const duration=Array.isArray(row)?row[2]:row.type;
      return duration===type&&positive(watts)&&load===ohms;
    });
    if(!matched.length)return null;
    return Math.max(...matched.map(row=>Array.isArray(row)?row[0]:row.watts));
  };
  const modelWattage=({sensitivity,basis,load,distance,room,pair,level})=>{
    if(!positive(load)||!positive(distance)||!positive(sensitivity)||!Number.isFinite(level))return null;
    const atSeat=sensitivity-20*Math.log10(distance/(1/0.3048))+room+pair;
    const refWatts=basis==='power'?1:(2.83*2.83/load);
    return refWatts*Math.pow(10,(level-atSeat)/10);
  };
  function suggestions({catalog,speakerModel,ampModel,sensitivity,basis,load,
    distance,room=0,pair=3,average=null,peak,averageWatts=null,peakWatts,
    amplifierRatings=[]}={}){
    const result={amplifiers:[],speakers:[]};
    if(!catalog?.speaker||!catalog?.amp||!positive(load)||!positive(peakWatts)||
      !positive(distance)||!Number.isFinite(peak))return result;
    const selectedSpeaker=catalog.speaker.find(x=>x.model===speakerModel);
    const selectedAmp=catalog.amp.find(x=>x.model===ampModel);
    const comparableSensitivity=(candidate)=>candidate.values?.basis===basis;
    const averageNeeds=Number.isFinite(averageWatts)&&averageWatts>=0?averageWatts:0;

    // Keep existing speakers. Require matching 8/6/4 Ω short-burst and
    // continuous figures, plus a cited manufacturer's nominal-load rule.
    if(selectedSpeaker&&selectedSpeaker.values?.load===load){
      const v=selectedSpeaker.values;
      const handlingAllows=(!positive(v.speakerPowerPeak)||peakWatts<=v.speakerPowerPeak)&&
        (!positive(v.speakerPowerMaxInput)||peakWatts<=v.speakerPowerMaxInput)&&
        (!positive(v.speakerPowerContinuous)||averageNeeds<=v.speakerPowerContinuous);
      if(handlingAllows){
        for(const amp of catalog.amp){
          if(amp.model===ampModel)continue;
          const loadProof=permission(amp.model,load);
          if(!loadProof)continue;
          const burst=get(amp.ratings,'burst',load);
          const continuous=get(amp.ratings,'continuous',load);
          if(burst===null||continuous===null||burst<peakWatts||continuous<averageNeeds)continue;
          result.amplifiers.push({model:amp.model,burst,continuous,load,
            url:amp.url,loadSource:loadProof.source,
            note:'Published '+burst+' W/ch burst and '+continuous+' W/ch continuous at '+load+' Ω; nominal speaker load is permitted by the maker.'});
        }
      }
    }
    result.amplifiers.sort((a,b)=>a.burst-b.burst||a.model.localeCompare(b.model));
    result.amplifiers=result.amplifiers.slice(0,2);

    // Keep existing amplifier. Require comparable sensitivity units, maker
    // nominal-load permission, actual burst/continuous ratings at the NEW
    // speaker load, plus explicit per-speaker continuous and peak handling.
    // An amplifier recommendation range is never treated as driver handling.
    if(selectedAmp&&Number.isFinite(sensitivity)){
      for(const sp of catalog.speaker){
        if(sp.model===speakerModel||!comparableSensitivity(sp))continue;
        const v=sp.values||{};
        if(!positive(v.load)||!positive(v.sensitivity)||!positive(v.speakerPowerPeak)||
          !positive(v.speakerPowerContinuous)||!permission(ampModel,v.load))continue;
        const burst=get(amplifierRatings,'burst',v.load);
        const continuous=get(amplifierRatings,'continuous',v.load);
        if(burst===null||continuous===null)continue;
        const p=modelWattage({sensitivity:v.sensitivity,basis:v.basis,load:v.load,distance,room,pair,level:peak});
        const a=Number.isFinite(average)?modelWattage({sensitivity:v.sensitivity,basis:v.basis,load:v.load,distance,room,pair,level:average}):0;
        if(!positive(p)||!Number.isFinite(a)||p>burst||a>continuous||
          p>v.speakerPowerPeak||a>v.speakerPowerContinuous)continue;
        const improvement=10*Math.log10(peakWatts/p);
        // No sideways swaps. The existing pair might already be adequate,
        // in which case the failed-headroom UI never calls this search.
        if(improvement<0.5)continue;
        result.speakers.push({model:sp.model,load:v.load,requiredPeakWatts:p,
          peakHandling:v.speakerPowerPeak,sensitivity:v.sensitivity,
          gainDb:improvement,url:v.speakerPowerSource||sp.url,
          note:'At this seat: about '+Math.round(p)+' W/ch peak required versus '+burst+
            ' W/ch documented burst; published speaker peak handling '+v.speakerPowerPeak+' W.'});
      }
    }
    result.speakers.sort((a,b)=>b.gainDb-a.gainDb||a.model.localeCompare(b.model));
    result.speakers=result.speakers.slice(0,2);
    return result;
  }
  root.systemCheckHeadroomAlternatives={suggestions};
})(window);
