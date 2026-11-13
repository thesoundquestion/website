import {ownerEvidenceFor, ownerEvidenceTier} from './owner-evidence.mjs';
import {priceContextFor} from './market-price-context.mjs';
import {BUILDER_ONLY_SPEAKERS} from './supplemental-speakers.mjs';
import {internationalPriceContextFor, corroboratedInternationalPairPriceFor} from './international-price-context.mjs';
import {compareBudgetReferences, retailPriceReference} from './price-references.mjs';

const CA_PRICE_DATE='2026-11-12';

/**
 * Speaker-only options when a visitor owns an amplifier but no speakers.
 * This is editorial discovery, NOT a guarantee of impedance/current, headroom,
 * acoustic suitability, or a regional value/price winner.
 * All speaker technical claims resolve from the existing read-only System Check
 * catalog. Only exact storefront pair-price examples below are newly supplied.
 * Checked 2026-11-12. Never charge for the already-owned amplifier.
 */
export const SPEAKER_IDEAS = Object.freeze([
  // Contemporary high-output candidates already documented by System Check.
  // Manufacturer sensitivity is an efficiency clue, NOT a clean-max-SPL rating.
  {model:'Cerwin-Vega XLS-215',goals:['party','dynamic','bass'],scenes:['living_room','party','outdoors'],
    reason:'A dual-15-inch passive tower with manufacturer-rated 95.3 dB sensitivity at 1 W / 3.28 ft. A high-output candidate where size, amplifier loading and room coverage permit.',
    downside:'6 Ω nominal, physically very large, and the published 500 W figure is PEAK power, not a verified continuous handling or clean output rating. Local pair price is not established.',
    ca:null},
  {model:'Cerwin-Vega XLS-15',goals:['party','dynamic','bass'],scenes:['living_room','party'],
    reason:'A 15-inch passive tower rated 92.3 dB at 1 W / 3.28 ft. Worth investigating when higher efficiency and substantial cabinet size matter more than compact placement.',
    downside:'6 Ω nominal and a published 400 W PEAK figure, not certified sustained output. Actual clean maximum level, coverage and local pair price require checking.',
    ca:null},
  {model:'Cerwin-Vega XLS-12',goals:['party','dynamic','bass'],scenes:['living_room','party'],
    reason:'A 12-inch passive tower rated 90.8 dB at 1 W / 3.28 ft, a moderate-efficiency fallback when a larger high-output pair is impractical.',
    downside:'6 Ω nominal. Published 300 W is peak power only; do not confuse cone size or wattage with clean loudness capability.',
    ca:null},
  {model:'Klipsch R-51M',goals:['party','dynamic','imaging'],scenes:['bedroom','living_room','party'],
    reason:'A compact horn-loaded passive pair with manufacturer-reported 93 dB sensitivity, useful to investigate where space limits floorstanding speakers.',
    downside:'Klipsch’s manufacturer figure is not directly comparable with anechoic 1 W sensitivity figures, and a small bookshelf enclosure cannot be assumed to sustain full-range party levels.',
    ca:null},
  {model:'Fluance SX6 Elite (SX6-BK)',goals:['all_rounder','natural','imaging','low_volume'],
    scenes:['desk','bedroom','living_room'],
    reason:'A straightforward 5-inch passive stereo pair, worth considering where a listener already owns an amplifier and can tolerate a conventional rear-ported cabinet.',
    downside:'Actual impedance minimum/phase and independent sound evidence are incomplete. The reported 60 Hz extension has no ±dB limit, the 30–100 W spec is not a certified continuous driver limit and no trustworthy normal Canadian pair price has been verified.',
    ca:null},
  {model:'PSB Alpha P3',goals:['all_rounder','natural','imaging','low_volume'],scenes:['desk','bedroom','living_room'],
   reason:'A small, well-reviewed passive pair for limited space. Independent listening notes praise midrange clarity and spaciousness, but its four-inch woofer gives up deep-bass capability.',
   downside:'PSB specifies an 8 Ω nominal and 4 Ω minimum load. Published 85 dB anechoic is not the 87 dB listening-room figure. Its 10–80 W amplifier suggestion is not a damage threshold.',
   ca:{amount:449,url:'https://www.psbspeakers.com/collections/alpha'}},
  {model:'PSB Alpha P5',goals:['all_rounder','natural','imaging','bass'],scenes:['bedroom','living_room'],
   reason:'A larger PSB standmount with multiple independent reports of natural vocals and stable stereo placement. Compare cabinet size and budget against the smaller P3.',
   downside:'Its 4 Ω published minimum needs a capable amplifier; 60 W program power and 10–90 W recommended amplification are not interchangeable with continuous power handling.',
   ca:{amount:699,url:'https://www.psbspeakers.com/collections/alpha'}},
  {model:'Triangle Borea BR03 (passive)',goals:['all_rounder','natural','imaging','dynamic','bass'],scenes:['bedroom','living_room'],
   reason:'A larger front-ported bookshelf option. Independent reviewers report clear, agile bass and spacious sound, while noting a possible treble emphasis in some setups.',
   downside:'Manufacturer specifies an 8 Ω nominal but 4.2 Ω minimum; do not pair automatically with 8 Ω-only amplifiers. Passive BR03 is not the powered BR03 CONNECT.',
   ca:{amount:599,url:'https://ca.trianglehifi.com/en/products/enceinte-bibliotheque-hi-fi-borea-br03-paire'}},
  {model:'Q Acoustics 3030i',goals:['all_rounder','natural','bass','dynamic'],scenes:['bedroom','living_room'],
   reason:'The larger original 3030i model is worth comparing for room-filling bass and relaxed presentation; owner impressions vary with room and stand placement.',
   downside:'6 Ω average, 4 Ω minimum; an 8 Ω-only amplifier is not certified. The original 3030i is distinct from 3030c, and its depth makes narrow shelves awkward.',
   ca:null},
  {model:'Klipsch RP-600M II',goals:['all_rounder','dynamic','imaging','party'],scenes:['bedroom','living_room'],
   reason:'A newer Reference Premiere horn-and-woofer design with independent and owner reports of lively, high-output playback. Its published in-room sensitivity is not an anechoic measurement.',
   downside:'Klipsch says 8 Ω compatible but does not publish minimum impedance in the cited sheet; verify the exact reactive load before connecting. Avoid confusing this with the original RP-600M.',
   ca:null},
  {model:'Polk Signature Elite ES15', goals:['all_rounder','natural','imaging','low_volume'], scenes:['desk','bedroom','living_room'],
   reason:'Compact bookshelf stereo pair for a desk or modest room; worth evaluating for placement, tonal balance and the listening level you need.',
   downside:'Small cabinets will not supply deep bass at arbitrary listening levels. Confirm actual load and clean output, especially with a demanding receiver.',
   ca:{amount:399,url:'https://www.polkaudio.com/en-ca/product/home-speakers/bookshelf/signature-elite-es15/300363-new.html'}},
  {model:'Polk Signature Elite ES20', goals:['all_rounder','natural','bass','dynamic'], scenes:['bedroom','living_room'],
   reason:'Larger 6.5-inch bookshelf alternative when you have more space and want to investigate bass capability without automatically buying a subwoofer.',
   downside:'Larger does not guarantee higher fidelity or clean output in every room; a woofer diameter is not a measured loudness score.',
   ca:{amount:549,url:'https://www.polkaudio.com/en-ca/product/home-speakers/bookshelf/signature-elite-es20/300364.html'}},
  {model:'Polk Monitor XT15', goals:['all_rounder','natural','low_volume','imaging'], scenes:['desk','bedroom','living_room'],
   reason:'A genuinely low-price new passive pair. Its compact cabinet suits modest rooms, and an independent audition describes good pace and clear vocals for the money.',
   downside:'Some recordings can sound lean in the lower vocal range; the manufacturer publishes only 73 Hz at the -3 dB response limit. Check speaker loading and sub expectations.',
   ca:{amount:249,url:'https://www.polkaudio.com/en-ca/product/home-speakers/satellite-surround/monitor-xt15/300147.html'}},
  {model:'Polk Monitor XT20', goals:['all_rounder','bass','dynamic','natural'], scenes:['bedroom','living_room'],
   reason:'A larger but still affordable passive pair. Some owners describe punchy bass and easy long listening, while others find the presentation needs placement or EQ.',
   downside:'The manufacturer rates the -3 dB limit at 57 Hz. Bass at a listening seat depends on placement and the room.',
   ca:{amount:349,url:'https://www.crutchfield.ca/p_107MXT20/Polk-Audio-Monitor-XT20.html'}},
  {model:'Klipsch R-50M', goals:['dynamic','all_rounder','imaging','party'], scenes:['bedroom','living_room'],
   reason:'A horn-loaded compact pair to audition for a different dispersion/presentation approach, with an explicit factory sensitivity reference.',
   downside:'Horn design is a preference/trade-off, not a guaranteed imaging or clarity improvement. Factory sensitivity is room-referenced and is not directly comparable to other anechoic figures.',
   ca:{amount:549,url:'https://www.klipsch.ca/products/r-50m-bookshelf-speakers'}},
  {model:'Paradigm Monitor SE Atom', goals:['all_rounder','natural','imaging','low_volume'], scenes:['desk','bedroom','living_room'],
   reason:'A compact Canadian passive stereo pair for a small room.',
   downside:'Maximum clean output and complete reactive impedance are not established here. Check space for stands, placement and actual listening level.',
   ca:{amount:359.99,url:'https://www.soundroom.ca/products/monitor-se-atom'}},
  {model:'ELAC Debut 3.0 DB63', goals:['bass','dynamic','all_rounder','natural'], scenes:['bedroom','living_room'],
   reason:'A newer 6.5-inch passive design with a published 6 Ω nominal load and factory 4.8 Ω minimum; use these real figures for amplifier screening.',
   downside:'A 4.8 Ω minimum can make it inappropriate for 8 Ω-only amplifier requirements; do not use a burst-power figure as load permission.',
   ca:null},
  {model:'ELAC Debut 2.0 B6.2', goals:['bass','all_rounder','dynamic'], scenes:['bedroom','living_room'],
   reason:'A 6 Ω passive bookshelf alternative with a documented sensitivity basis, useful for exploring a simpler two-channel arrangement.',
   downside:'Older retail stock or used condition may vary. Published 6 Ω nominal is not a full impedance/phase curve.',
   ca:null},
  {model:'Wharfedale Diamond 12.1', goals:['all_rounder','natural','imaging','low_volume'], scenes:['desk','bedroom','living_room'],
   reason:'An original British 5-inch standmount with documented textile tweeter, a familiar easy-listening audition option and an ordinary UK pair-price reference.',
   downside:'Manufacturer minimum impedance is 4 Ω despite the nominal 8 Ω-compatible description. Smaller cabinets and a rear port mean room placement and bass expectations matter. Not the newer 12.1i.',
   ca:null},
  {model:'Wharfedale Diamond 12.2', goals:['natural','bass','all_rounder'], scenes:['bedroom','living_room'],
   reason:'An 8 Ω-compatible bookshelf design with a documented 4 Ω minimum to investigate when the amplifier can handle its real load.',
   downside:'Do not assume that 8 Ω marketing compatibility means the speaker never falls to 4 Ω.',
   ca:null},
  {model:'KEF Q150', goals:['imaging','all_rounder','natural'], scenes:['desk','bedroom','living_room'],
   reason:'A compact coaxial-driver speaker to compare for consistent positioning and soundstage preferences, without claiming a measured personal match.',
   downside:'The maker documents a 3.7 Ω minimum despite the nominal 8 Ω figure; this can be a demanding load for some amplifiers.',
   ca:null},
  {model:'Q Acoustics 3010i', goals:['all_rounder','natural','imaging','low_volume'], scenes:['desk','bedroom'],
   reason:'A genuinely affordable UK compact stereo pair when shelf space is tight. Exact-model owners and a hands-on review praise pleasant music listening, with limited bass scale.',
   downside:'The manufacturer specifies a 6 Ω nominal and 4 Ω minimum load. A 4-inch woofer in a small cabinet is not a bass-first choice without a sub; a larger room may favour the 3020i.',
   ca:null},
  {model:'Q Acoustics 3020i', goals:['natural','imaging','all_rounder'], scenes:['desk','bedroom','living_room'],
   reason:'A compact 6 Ω bookshelf alternative for auditioning placement and tonal presentation with a conventional stereo amplifier.',
   downside:'Published 4 Ω minimum requires an appropriate amplifier. Deep bass and loud clean output remain setup dependent.',
   ca:null},
  {model:'JBL Stage 250B', goals:['all_rounder','dynamic','bass'], scenes:['bedroom','living_room'],
   reason:'A 6 Ω passive bookshelf candidate to research for a living-room stereo pair rather than a full system replacement.',
   downside:'Check amplifier load conditions, output at distance, local pair pricing and exact model revision.',
   ca:null},
  {model:'DALI Oberon 1', goals:['natural','imaging','low_volume'], scenes:['desk','bedroom','living_room'],
   reason:'A small passive bookshelf alternative for compact spaces and careful placement.',
   downside:'Six-ohm nominal load and manufacturer recommended amplifier range are not sufficient to certify your amplifier pairing.',
   ca:null},
  {model:'Paradigm Titan v3', goals:['all_rounder','natural','bass'], scenes:['bedroom','living_room'],usedOnly:true,
   reason:'An older used bookshelf option worth inspecting when you prefer reusing equipment.',
   downside:'Vintage driver surround, crossover and cabinet condition matter. Impedance minimum and representative used transaction prices are not established.',
   ca:null}
]);


/**
 * Party selection prioritizes manufacturer-documented acoustic efficiency, then
 * credible continuous-output evidence and physical suitability. Do NOT compare
 * Klipsch room/half-space figures directly against 1 W free-field figures or
 * turn sensitivity / peak input power into a maximum clean-SPL prediction.
 */
export function partySpeakerEvidence(record) {
  const v=record?.values||{};
  const sensitivity=v.sensitivity;
  const basis=String(v.basis||'');
  const note=String(record?.note||'').toLowerCase();
  const known=Number.isFinite(sensitivity);
  const roomReferenced=/room.reference|in.room|half.space|listening.room|8 Ω compatibility/.test(note);
  const comparable=known && (basis==='power' ||
    (basis==='voltage' && v.load===8 && !roomReferenced));
  const normalized=known && comparable ?
    (basis==='power'?sensitivity:sensitivity-10*Math.log10((2.83**2)/v.load)) : null;
  // Voltage-basis values at a nominal 8 Ω are only approximate power-based
  // equivalents; published manufacturer methods can still be inconsistent.
  const tier=Number.isFinite(normalized) ?
    normalized>=95?0:normalized>=92?1:2 : 3;
  const label=!known?'Sensitivity unverified':
    sensitivity+' dB at '+(basis==='power'?'1 W':'2.83 V')+
    ' / 3.28 ft'+(!comparable?' (room/method not comparable)':' (manufacturer)');
  return {tier,comparable,sensitivity:known?sensitivity:null,
    normalized, label, continuousW:Number.isFinite(v.speakerPowerContinuous)?
      v.speakerPowerContinuous:null};
}

export function shortlistPartySpeakerLeads(input={}) {
  const byModel=new Map(BUILDER_ONLY_SPEAKERS.map(x=>[x.model,x]));
  for (const record of input.speakers||[])byModel.set(record.model,record);
  return SPEAKER_IDEAS.filter(idea=>idea.goals.includes('party')&&!idea.usedOnly)
    .map(idea=>({idea,record:byModel.get(idea.model)}))
    .filter(x=>x.record)
    .sort((a,b)=>{
      const x=partySpeakerEvidence(a.record),y=partySpeakerEvidence(b.record);
      return x.tier-y.tier ||
        (Number.isFinite(y.normalized)?y.normalized:-Infinity)-
          (Number.isFinite(x.normalized)?x.normalized:-Infinity) ||
        (y.continuousW||0)-(x.continuousW||0) ||
        a.idea.model.localeCompare(b.idea.model);
    })
    .map(({idea,record})=>({model:idea.model,idea,record,
      evidence:partySpeakerEvidence(record),url:record.url}));
}

/** A passive-party lead is NOT a complete, priced or certified system.
 * An amp, source and appropriate cabling are explicitly missing requirements. */
export function shortlistPartyPassiveConcepts(input={}) {
  const selected=[],excluded=[];
  if(input.power==='battery')
    return {selected,excluded,mode:'party_passive',reason:'Passive speakers do not supply their own battery-powered amplification.'};
  const ideas=shortlistPartySpeakerLeads(input);
  const budget=Number.isFinite(input.budget)&&input.budget>=0?input.budget:null;
  for(const lead of ideas.slice(0,3)){
    const {idea,record,evidence}=lead;
    selected.push({
      id:'party-passive-'+idea.model.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      architecture:'passive_separates',title:idea.model,
      kind:'High-output passive speaker lead · amp required',
      why:'Party priority: '+evidence.label+'. '+idea.reason+
        ' Efficiency is not a maximum clean loudness measurement.',
      tradeoff:idea.downside,
      parts:[{name:idea.model+' stereo pair',count:1,
        role:'Passive speakers; pair price not established',url:record.url},
        {name:'Load-compatible stereo amplifier',count:1,
          role:'Required; model, safe impedance and clean headroom not yet selected or costed',url:null},
        {name:'Source, level control and speaker cables',count:1,
          role:'Required; compatibility and cost unverified',url:null}],
      subtotal:null,pricingStatus:'regional_price_missing',priceComponents:[],
      editorialGoalFocus:true,secondaryFocus:[],
      connectionStatus:'adapter_needed',sourceDate:'2026-11-13',
      sceneCaution:false,levelCaution:true,
      speakerValues:record.values,
      extra:['No complete-system price or within-budget claim'+
        (budget===null?' is available.':'; compare all missing components with your '+input.currency+' budget.'),
        'Check published nominal/minimum speaker impedance against the chosen amplifier. Its watt rating alone is insufficient.',
        'Clean sustained SPL, low-frequency compression and coverage at your distance have not been verified.'],
    });
  }
  return {selected,excluded,mode:'party_passive'};
}

/** Only documented continuous ratings are used as an *initial conservative
 * nominal-load discovery filter*. They do NOT prove that a real reactive
 * loudspeaker is safe, or define amplifier impedance permissions. */
export function ampSpeakerScreening(amp) {
  const ratings = amp?.record?.ratings || [];
  const continuous = ratings.filter(x=>Array.isArray(x) && x[2]==='continuous' &&
    Number.isFinite(x[1]) && x[1]>=2 && x[1]<=16).map(x=>x[1]);
  const minPublishedTestOhms = continuous.length ? Math.min(...continuous) : null;
  const model=String(amp?.name||amp?.record?.model||'');
  const explicitNominalFloor = model === 'Yamaha R-S202' ? 8 : model === 'Sony STR-DH190' ? 6 :
    amp?.record?.details?.minNominalOhms ?? null;
  const discoveryFloor = explicitNominalFloor || (minPublishedTestOhms !== null ?
    Math.min(8,Math.max(4,minPublishedTestOhms)) : 8);
  const exactManufacturerRule = model === 'Yamaha R-S202' ?
    'Yamaha specifies 8 Ω or higher for a single speaker pair A or B (and 16 Ω or higher for A+B where applicable). A nominal label alone does not establish actual impedance minimum or thermal safety.' :
    model === 'Sony STR-DH190' ? 'Sony lists 6–16 Ω speakers; verify the exact regional revision and operating conditions.' :
    explicitNominalFloor ? 'The manual specifies a '+explicitNominalFloor+' Ω minimum nominal speaker load. Follow the speaker impedance setting in the manual.' : '';
  return {ampName:model||'Unlisted amplifier',discoveryFloor,minPublishedTestOhms,
    explicitNominalFloor,exactManufacturerRule,known:!!amp?.record};
}

export function shortlistSpeakersForOwnedAmplifier(input={}) {
  const ownedAmp=input.amp || {};
  const screen=ampSpeakerScreening(ownedAmp);
  const catalog=Array.isArray(input.speakers) ? input.speakers : [];
  const scene=String(input.useCase||'living_room');
  const goal=String(input.goal||'all_rounder');
  const second=Array.isArray(input.secondary)?input.secondary:[];
  const region=String(input.region||'');
  const currency=String(input.currency||'');
  const allowedUsed=input.used!==false;
  const selected=[],excluded=[];
  if (input.power==='battery') return {selected,excluded,screen,reason:'A mains-powered home amplifier does not meet a mandatory battery requirement; a portable source/amplifier must be verified first.',mode:'speaker_only'};
  // Keep the original System Check catalog untouched. Builder-only exact-model
  // complements are source-linked and never override existing source presets.
  const byModel=new Map(BUILDER_ONLY_SPEAKERS.map(x=>[x.model,x]));
  for (const record of catalog)byModel.set(record.model,record);
  const goalsOrder={
    party:['Cerwin-Vega XLS-215','Cerwin-Vega XLS-15','Cerwin-Vega XLS-12','Klipsch R-51M','Klipsch R-50M','Klipsch RP-600M II','Triangle Borea BR03 (passive)','Polk Signature Elite ES20','Polk Monitor XT20'],
    all_rounder:['Polk Signature Elite ES15','Polk Monitor XT15','Polk Monitor XT20','Paradigm Monitor SE Atom','Polk Signature Elite ES20','ELAC Debut 3.0 DB63','Klipsch R-50M','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','ELAC Debut 2.0 B6.2','JBL Stage 250B','Paradigm Titan v3','KEF Q150','Q Acoustics 3010i','Q Acoustics 3020i','DALI Oberon 1','PSB Alpha P3','PSB Alpha P5','Triangle Borea BR03 (passive)','Q Acoustics 3030i','Klipsch RP-600M II','Fluance SX6 Elite (SX6-BK)'],
    natural:['Paradigm Monitor SE Atom','Polk Monitor XT15','Polk Monitor XT20','Polk Signature Elite ES15','Polk Signature Elite ES20','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','ELAC Debut 3.0 DB63','DALI Oberon 1','Q Acoustics 3010i','Q Acoustics 3020i','Paradigm Titan v3','KEF Q150','Klipsch R-50M','ELAC Debut 2.0 B6.2','JBL Stage 250B','PSB Alpha P3','PSB Alpha P5','Triangle Borea BR03 (passive)','Q Acoustics 3030i','Fluance SX6 Elite (SX6-BK)'],
    imaging:['Paradigm Monitor SE Atom','Polk Monitor XT15','Polk Monitor XT20','Polk Signature Elite ES15','KEF Q150','DALI Oberon 1','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','Klipsch R-50M','Q Acoustics 3010i','Q Acoustics 3020i','Polk Signature Elite ES20','ELAC Debut 3.0 DB63','JBL Stage 250B','ELAC Debut 2.0 B6.2','Paradigm Titan v3','PSB Alpha P3','PSB Alpha P5','Triangle Borea BR03 (passive)','Klipsch RP-600M II','Fluance SX6 Elite (SX6-BK)'],
    dynamic:['Klipsch R-50M','Polk Monitor XT20','Polk Monitor XT15','Polk Signature Elite ES20','ELAC Debut 3.0 DB63','JBL Stage 250B','ELAC Debut 2.0 B6.2','Polk Signature Elite ES15','Paradigm Monitor SE Atom','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','Paradigm Titan v3','DALI Oberon 1','KEF Q150','Q Acoustics 3010i','Q Acoustics 3020i','Triangle Borea BR03 (passive)','Q Acoustics 3030i','Klipsch RP-600M II','Fluance SX6 Elite (SX6-BK)'],
    bass:['Polk Signature Elite ES20','Polk Monitor XT20','Polk Monitor XT15','ELAC Debut 3.0 DB63','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','ELAC Debut 2.0 B6.2','JBL Stage 250B','Paradigm Titan v3','Paradigm Monitor SE Atom','Klipsch R-50M','Polk Signature Elite ES15','KEF Q150','Q Acoustics 3010i','Q Acoustics 3020i','DALI Oberon 1','PSB Alpha P5','Triangle Borea BR03 (passive)','Q Acoustics 3030i','Fluance SX6 Elite (SX6-BK)'],
    low_volume:['Polk Signature Elite ES15','Polk Monitor XT15','Polk Monitor XT20','Paradigm Monitor SE Atom','DALI Oberon 1','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','Polk Signature Elite ES20','Q Acoustics 3010i','Q Acoustics 3020i','KEF Q150','Klipsch R-50M','ELAC Debut 3.0 DB63','JBL Stage 250B','Paradigm Titan v3','ELAC Debut 2.0 B6.2','PSB Alpha P3','PSB Alpha P5','Fluance SX6 Elite (SX6-BK)']
  };
  const partyMode=goal==='party'||scene==='party';
  const ids=partyMode?goalsOrder.party:(goalsOrder[goal]||goalsOrder.all_rounder);
  const ideas=new Map(SPEAKER_IDEAS.map(idea=>[idea.model,idea]));
  const pricesByModel=new Map(ids.map(model=>{
    const context=priceContextFor(model,region,currency) || internationalPriceContextFor(model,region,currency);
    const regular=region==='CA'&&currency==='CAD' ? ideas.get(model)?.ca :
      corroboratedInternationalPairPriceFor(model,region,currency);
    const links=context?.regular.map(({merchant,url})=>({merchant,url})) || [];
    const snapshot=regular ? {date:context?.sourceDate || CA_PRICE_DATE,
      components:[{label:model+' pair',amount:regular.amount,url:regular.url}]} : null;
    return [model,{...retailPriceReference(snapshot,input.referenceDate),marketContext:links.length?{regular:links}:null}];
  }));
  // Listener priorities and room come first. Among similarly suitable options,
  // several relevant first-person owner accounts are more useful than an
  // unverified claimed sound signature. No invented acoustic match score.
  const ordered=[...ids].sort((a,b)=>{
    const x=ideas.get(a);
    const y=ideas.get(b);
    const goalA=x?.goals.includes(partyMode?'party':goal)?0:1;
    const goalB=y?.goals.includes(partyMode?'party':goal)?0:1;
    if(goalA!==goalB)return goalA-goalB;
    if(partyMode){
      const aEvidence=partySpeakerEvidence(byModel.get(a));
      const bEvidence=partySpeakerEvidence(byModel.get(b));
      if(aEvidence.tier!==bEvidence.tier)return aEvidence.tier-bEvidence.tier;
      if(Number.isFinite(aEvidence.normalized)&&Number.isFinite(bEvidence.normalized) &&
        aEvidence.normalized!==bEvidence.normalized)
        return bEvidence.normalized-aEvidence.normalized;
    }
    const sceneA=x?.scenes.includes(scene)?0:1;
    const sceneB=y?.scenes.includes(scene)?0:1;
    if(sceneA!==sceneB)return sceneA-sceneB;
    const secondaryA=second.filter(g=>g!==goal&&x?.goals.includes(g)).length;
    const secondaryB=second.filter(g=>g!==goal&&y?.goals.includes(g)).length;
    if(secondaryA!==secondaryB)return secondaryB-secondaryA;
    const budgetOrder=compareBudgetReferences(pricesByModel.get(a).subtotal,pricesByModel.get(b).subtotal,input);
    if(budgetOrder)return budgetOrder;
    const ownerA=ownerEvidenceTier(a,goal);
    const ownerB=ownerEvidenceTier(b,goal);
    if(ownerA!==ownerB)return ownerA-ownerB;
    return ids.indexOf(a)-ids.indexOf(b);
  });
  for(const model of ordered) {
    const idea=ideas.get(model);
    const record=byModel.get(model);
    if(!idea || !record)continue;
    // Do not convert historic classified asking examples into a "buy now"
    // recommendation. Vintage speakers remain selectable when already owned;
    // acquisition advice belongs in a condition-first evergreen watchlist.
    if(idea.usedOnly){
      if(allowedUsed)excluded.push({title:model,
        reason:'Used vintage research target only. No current listing, dependable transaction price or verified condition is assumed. Keep an eye out and inspect individually.'});
      continue;
    }
    const nominal=record.values?.load;
    // Missing load information must not automatically prevent discovery.
    // It does require a plainly visible do-not-connect-before-check warning.
    const loadUnknown=!Number.isFinite(nominal);
    // Explicit manufacturer nominal-load floors require a verified speaker
    // nominal figure, not marketing wording like "8 ohm compatible."
    if(loadUnknown && screen.explicitNominalFloor) {
      excluded.push({title:model,reason:'The '+screen.ampName+
        ' requires a verified nominal load of at least '+screen.explicitNominalFloor+
        ' Ω. Speaker impedance is unknown; do not propose this pairing until verified.'});
      continue;
    }
    // Conservative screening; insufficient documentation never becomes "safe".
    if(!loadUnknown && nominal<screen.discoveryFloor) {
      excluded.push({title:model,reason:'Nominal load below the conservative amplifier search limit ('+screen.discoveryFloor+' Ω). Not a definitive safety determination.'});continue;
    }
    const minimum=record.values?.minimum;
    if(screen.discoveryFloor>=8 && Number.isFinite(minimum) && minimum<6) {
      excluded.push({title:model,reason:'Published minimum '+minimum+' Ω is more demanding than this 8 Ω-only screening route; model requires independent compatibility review.'});continue;
    }
    if(selected.length>=5)continue; // Continue checking exclusions even once the visible shortlist is full.
    const prices=pricesByModel.get(model);
    const caution=loadUnknown ?
      'This speaker’s nominal load is not verified. Your amplifier has '+
      (screen.minPublishedTestOhms??'no verified')+
      ' Ω published continuous-load test data, which does not establish compatibility. Do NOT connect to '+
      screen.ampName+' until the load and manufacturer permission are confirmed.' :
      screen.explicitNominalFloor ?
      'Your '+screen.ampName+' manufacturer load guidance still needs checking against the speaker’s full impedance curve; a nominal '+nominal+' Ω label is not a safety certificate.' :
      'Your amplifier has '+(screen.minPublishedTestOhms??'no verified')+' Ω published continuous-load test data; that is NOT a promise of compatibility with this speaker’s unknown phase/minimum or your volume.';
    selected.push({
      id:'owned-speaker-'+model.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      architecture:'passive_separates',
      title:model,
      kind:'Speaker pair for your existing '+screen.ampName,
      why:partyMode ?
        'Party priority: '+partySpeakerEvidence(record).label+'. '+idea.reason+
        ' Sensitivity reduces watts needed for a given level, but does not certify sustained clean SPL.' : idea.reason,
      tradeoff:idea.downside,
      parts:[{name:model+' stereo pair',count:1,role:'Only new major component; keep your '+screen.ampName+' if verified suitable',url:record.url}],
      ...prices,
      pricingCurrency:currency,
      pricingStatus:prices.subtotal===null?'regional_price_missing':'partial_subtotal',
      sourceDate:'2026-11-12',
      editorialGoalFocus:idea.goals.includes(goal),
      secondaryFocus:second.filter(x=>idea.goals.includes(x)),
      connectionStatus:'owned_amp_source_unverified',
      sourceCaution:['usb','optical','hdmi','bluetooth'].includes(input.connection) ?
        'Check whether '+screen.ampName+' actually accepts your selected '+input.connection.toUpperCase()+' source; an adapter or external source may be required.' : null,
      sourceBatteryCaution:false,
      sceneCaution:!idea.scenes.includes(scene),
      placementCaution:Number(input.distanceFt)>12,
      levelCaution:input.level==='high'||partyMode,
      extra:[caution,'Check the exact speaker revision, nominal and minimum impedance, phase angle, and your amplifier manual before connecting.',
        'Speaker cable, source connectivity and any necessary stands are extra. No new amplifier has been included in the price.',
        'Use System Check to evaluate clean level at your actual listening position; manufacturer sensitivity figures may use different conventions.'],
      loadCaution:loadUnknown ?
        'Load unknown: do not connect these speakers to '+screen.ampName+' until the manufacturer’s requirements are checked.' :
        screen.explicitNominalFloor?'Confirm load: '+screen.ampName+' requires suitable speakers; '+nominal+' Ω nominal alone does not prove a safe match.':null,
      ownerEvidenceLabel:ownerEvidenceFor(model)?.label || 'Model specifications; listening reports not verified',
      ownerEvidenceBasis:ownerEvidenceFor(model)?.band || 'spec_led',
      ownedAmpName:screen.ampName,
      speakerValues:record.values,
      decisionReasons:[
        ...(idea.goals.includes(goal)?['The primary listening goal is an editorial fit tag, not a measured acoustic score.']:[]),
        ...(second.filter(g=>idea.goals.includes(g)).length?[
          'Also considered: '+second.filter(g=>idea.goals.includes(g)).join(', ')+'.']:[]),
        ...(scene==='party'?['Party context favors efficient speakers, but clean continuous output and coverage remain unknown.']:[]),
        ...(Number(input.distanceFt)>12?[
          'A listening distance beyond 12 ft warrants an individual clean-headroom check in System Check.']:[])
      ],
      partySensitivityEvidence:partyMode?partySpeakerEvidence(record):null
    });
  }
  return {selected,excluded,screen,mode:'speaker_only'};
}
