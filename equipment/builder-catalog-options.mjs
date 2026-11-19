/**
 * Canonical equipment discovery for the Listening Builder.
 * This is NOT a sonic recommendation, compatibility certificate or price rank.
 * Existing acoustic calculations and curated recommendation algorithms remain untouched.
 */
import {preferVerifiedPriceTier,pricingPreferenceCoverage,validPricePreference} from './price-preference.mjs';

const roles={
  studio:'powered_studio_monitor',
  pa:'powered_pa_speaker'
};
const fact=(record,key)=>record?.facts?.[key]?.value??null;
const isSpeaker=r=>r?.categories?.includes('speaker');
const ordered=(records,prices,region,preference)=>preferVerifiedPriceTier(records,prices,{region,preference:validPricePreference(preference)});
export function listeningCatalogOptions(catalog,kind,{prices=null,region='CA',preference='any'}={}){
  if(!Array.isArray(catalog?.records))throw new TypeError('Shared catalogue required');
  const kindCategories={
    speaker:['speaker'],amp:['amp'],
    source:['source','computer_sound_card','audio_interface','headphone_amplifier'],
    headphone:['headphone']
  }[kind];
  if(!kindCategories)throw new RangeError('Unsupported listening equipment type');
  const entries=catalog.records.filter(r=>kindCategories.some(c=>r.categories.includes(c)));
  // One physical model is listed once, even when it has several roles.
  const unique=[...new Map(entries.map(r=>[r.model,r])).values()];
  const buckets=kind==='speaker'?[
    {id:'passive',title:'Passive and other speakers · verify exact type',
      items:unique.filter(r=>!Object.values(roles).includes(fact(r,'speakerKind')))},
    {id:'studio',title:'Powered studio monitors · line-level input, sold per cabinet',
      items:unique.filter(r=>fact(r,'speakerKind')===roles.studio)},
    {id:'pa',title:'Powered PA speakers · live sound, sold per cabinet',
      items:unique.filter(r=>fact(r,'speakerKind')===roles.pa)}
  ]:[{id:kind,title:'Equipment from the shared catalogue',items:unique}];
  return buckets.map(b=>({
    ...b,items:ordered(b.items,prices,region,preference),
    coverage:pricingPreferenceCoverage(b.items,prices,{region,preference})
  }));
}
export function listeningStudioCandidates(catalog,{prices=null,region='CA',preference='any'}={}){
  const group=listeningCatalogOptions(catalog,'speaker',{prices,region,preference})
    .find(x=>x.id==='studio');
  return group?.items||[];
}
export function describeStudioMonitor(record){
  if(fact(record,'speakerKind')!=='powered_studio_monitor')throw new RangeError('Not a verified powered studio monitor');
  const inputs=record.connections?.inputs?.map(x=>x.type)||[];
  const response=fact(record,'responseMinus3DbHz');
  const amplifiers=fact(record,'internalAmplificationWatts');
  const count=fact(record,'unitsPerRetailPackage');
  const source=record.evidence?.find(e=>/^https:\/\//.test(e.url))?.url||null;
  return {
    id:record.id,model:record.model,source,
    cabinetCount:count,
    inputTypes:inputs,
    frequencyRangeMinus3DbHz:Array.isArray(response)?response:null,
    internalAmplification:amplifiers,
    cautions:[
      'This powered monitor requires a compatible line-level signal, NOT a passive amplifier speaker output.',
      count===1?'This record describes ONE cabinet. Stereo usually requires two, plus compatible outputs and a volume control.':'Verify the number of cabinets and full stereo cost.',
      'Internal amplifier watts do not describe the watts your separate passive-speaker amplifier must provide.',
      'A frequency-range number does not rank loudspeaker accuracy, distortion, dispersion or maximum clean output.'
    ]
  };
}
