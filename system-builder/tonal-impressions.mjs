/**
 * Evidence-backed, prospective tonal context for alternative setups.
 * Comparisons are of transducers (speaker/headphone models), not unsupported
 * sonic signatures attributed to DAC chips, amps or manufacturer prestige.
 * Uses the existing exact-model listening review and owner evidence; never
 * converts report count to a probability or review percentage.
 */
import {soundProfileFor} from './sound-profiles.mjs';

const SHORT=Object.freeze({
 'PSB Alpha P3':'open and clear through mids and treble, but limited deep bass',
 'PSB Alpha P5':'natural-sounding vocals, smooth treble and a slightly warm balance',
 'Triangle Borea BR03 (passive)':'a lively, spacious presentation with noticeable treble energy and agile bass',
 'Q Acoustics 3030i':'bass weight and easy listening, although impressions of bass punch vary',
 'Q Acoustics 3020i':'warm, rich vocals, firm bass for its size and broad stereo presentation',
 'Q Acoustics 3010i':'clear, lively sound with less bass scale than larger models',
 'Q Acoustics 3030i':'a fuller, easy-going low end that some owners still find lacking in punch',
 'Klipsch RP-600M II':'energetic, room-filling playback, with treble and positioning preferences varying',
 'Polk Monitor XT15':'lively, clear sound, with leaner lower vocals and limited deep bass',
 'Polk Monitor XT20':'punchy bass and relaxed listening for some owners, with mixed midrange impressions',
 'Polk Signature Elite ES15':'lively, clear vocals and crisp upper frequencies with punchy but not deep bass',
 'Polk Signature Elite ES20':'bass weight and spaciousness, with some disagreement about treble brightness',
 'ELAC Debut 3.0 DB63':'substantial vocal body and bass for some, but too subdued for others',
 'ELAC Debut 2.0 B6.2':'weighty, rhythmic bass and balanced, unforced upper frequencies',
 'Wharfedale Diamond 12.1':'a composed, forgiving balance from a small cabinet',
 'Wharfedale Diamond 12.2':'weighty, controlled bass and smooth upper frequencies',
 'DALI Oberon 1':'expressive voices, focused imaging and smooth but lively highs',
 'Klipsch R-50M':'lively dynamic presentation and vivid stereo placement, with varying treble impressions',
 'JBL 305P MkII':'broad stereo image and punchy bass, with some upper-midrange forwardness',
 'Kali LP-6 v2':'even nearfield balance and useful bass reach for its size',
 'Edifier MR4':'workable, mostly even nearfield balance with limited low-bass reach',
 'Kanto ORA':'fairly even balance, clear mids and softer upper treble',
 'FiiO FT1':'warm, bass-rich closed-back sound that some listeners find overly thick',
 'AKG K371':'weighty bass, even mids, clear treble and generally smooth balance',
 'Grado SR80x':'prominent upper frequencies and an energetic, detailed presentation, with mixed reports about bass',
 'Grado SR60x':'a similarly open presentation with less treble emphasis than the SR80x',
 'Koss KSC75':'open, clear sound with relatively little deep-bass weight',
 'Koss Porta Pro (wired)':'a fuller, darker, bassier balance than the KSC75',
 'Audio-Technica ATH-M50x':'a more uneven bass/treble balance than the smoother AKG K371',
 'Sennheiser HD 560S':'an analytical, relatively lean midrange/treble balance with modest low bass',
 'Sennheiser HD 600':'smooth natural vocals and a close, midrange-focused presentation with restrained sub-bass'
});
const omitType=type=>/manufacturer description only|manufacturer specification only|not independently characterized|application and specifications only|independent measurement interpretation/i.test(type);
const trim=x=>String(x||'').replace(/\s+/g,' ').trim();
const normalize=x=>trim(x).replace(/\s*\((?:RCA line out|RCA)\)$/i,'');
const nameOf=i=>normalize(i?.soundTarget||i?.speakerModel||i?.curatedPairing?.speakerModel||
  i?.headphoneModel||i?.title||'');
function profileFor(i){
  const name=nameOf(i);
  const sound=soundProfileFor({...i,soundTarget:name});
  if(!sound||omitType(sound.type)||(!sound.url&&!sound.ownerSources?.length))return null;
  const report=SHORT[name]||trim(sound.text).replace(/\.$/,'');
  if(!report)return null;
  const sources=[...(sound.ownerSources||sound.reviewSources||[]).map(x=>({url:x.url,label:x.context||'Listening review'}))];
  if(sound.url&&!sources.some(x=>x.url===sound.url))
    sources.unshift({url:sound.url,label:'Model-specific listening review'});
  return {name,report,sources:sources.filter(x=>/^https:\/\//.test(x.url)).slice(0,2),type:sound.type};
}
export function tonalComparison(primary,alternative){
  if(!primary||!alternative)return null;
  const x=profileFor(primary),y=profileFor(alternative);
  if(!x&&!y)return null;
  if(x&&y&&x.name===y.name)return null; // The same speakers/headphones, even with a different amplifier.
  if(x&&y){
    return {
      heading:'How the sound may differ',
      text:'Listening reports describe '+x.name+' as '+x.report+
        ', while '+y.name+' is often described as '+y.report+
        '. These are plausible differences to listen for, not a direct level-matched comparison.',
      sources:[
        ...x.sources.slice(0,1).map(v=>({...v,label:x.name+' impressions'})),
        ...y.sources.slice(0,1).map(v=>({...v,label:y.name+' impressions'}))
      ],
      models:[x.name,y.name]
    };
  }
  if(y){
    return {heading:'What listeners report about this alternative',
      text:'Reviews and owner impressions of '+y.name+' describe '+y.report+
        '. That gives you a useful tonal expectation to audition, rather than a guaranteed difference from the first option.',
      sources:y.sources.map(v=>({...v,label:y.name+' impressions'})),models:[y.name]};
  }
  // If the main model has reviews but the alternative has none, avoid
  // suggesting a sonic direction for the unknown one.
  return null;
}
