import {ownerEvidenceFor, ownerEvidenceTier} from './owner-evidence.mjs';

/**
 * Speaker-only options when a visitor owns an amplifier but no speakers.
 * This is editorial discovery, NOT a guarantee of impedance/current, headroom,
 * acoustic suitability, or a regional value/price winner.
 * All speaker technical claims resolve from the existing read-only System Check
 * catalog. Only exact storefront pair-price examples below are newly supplied.
 * Checked 2026-11-12. Never charge for the already-owned amplifier.
 */
export const SPEAKER_IDEAS = Object.freeze([
  {model:'Polk Signature Elite ES15', goals:['all_rounder','natural','imaging','low_volume'], scenes:['desk','bedroom','living_room'],
   reason:'Compact bookshelf stereo pair for a desk or modest room; worth evaluating for placement, tonal balance and the listening level you need.',
   downside:'Small cabinets will not supply deep bass at arbitrary listening levels. Confirm actual load and clean output, especially with a demanding receiver.',
   ca:{amount:399,url:'https://www.polkaudio.com/en-ca/product/home-speakers/bookshelf/signature-elite-es15/300363-new.html'}},
  {model:'Polk Signature Elite ES20', goals:['all_rounder','natural','bass','dynamic'], scenes:['bedroom','living_room'],
   reason:'Larger 6.5-inch bookshelf alternative when you have more space and want to investigate bass capability without automatically buying a subwoofer.',
   downside:'Larger does not guarantee higher fidelity or clean output in every room; a woofer diameter is not a measured loudness score.',
   ca:{amount:549,url:'https://www.polkaudio.com/en-ca/product/home-speakers/bookshelf/signature-elite-es20/300364.html'}},
  {model:'Klipsch R-50M', goals:['dynamic','all_rounder','imaging'], scenes:['bedroom','living_room'],
   reason:'A horn-loaded compact pair to audition for a different dispersion/presentation approach, with an explicit factory sensitivity reference.',
   downside:'Horn design is a preference/trade-off, not a guaranteed imaging or clarity improvement. Factory sensitivity is room-referenced and is not directly comparable to other anechoic figures.',
   ca:{amount:549,url:'https://www.klipsch.ca/products/r-50m-bookshelf-speakers'}},
  {model:'Paradigm Monitor SE Atom', goals:['all_rounder','natural','imaging','low_volume'], scenes:['desk','bedroom','living_room'],
   reason:'A familiar Canadian passive bookshelf option with documented anechoic and in-room sensitivity figures; examine its compact-room suitability.',
   downside:'Actual impedance minimum and high-level compression are not established by this preset. Budget for stands or shelf placement.',
   ca:null},
  {model:'ELAC Debut 3.0 DB63', goals:['bass','dynamic','all_rounder','natural'], scenes:['bedroom','living_room'],
   reason:'A newer 6.5-inch passive design with a published 6 Ω nominal load and factory 4.8 Ω minimum; use these real figures for amplifier screening.',
   downside:'A 4.8 Ω minimum can make it inappropriate for 8 Ω-only amplifier requirements; do not use a burst-power figure as load permission.',
   ca:null},
  {model:'ELAC Debut 2.0 B6.2', goals:['bass','all_rounder','dynamic'], scenes:['bedroom','living_room'],
   reason:'A 6 Ω passive bookshelf alternative with a documented sensitivity basis, useful for exploring a simpler two-channel arrangement.',
   downside:'Older retail stock or used condition may vary. Published 6 Ω nominal is not a full impedance/phase curve.',
   ca:null},
  {model:'Wharfedale Diamond 12.2', goals:['natural','bass','all_rounder'], scenes:['bedroom','living_room'],
   reason:'An 8 Ω-compatible bookshelf design with a documented 4 Ω minimum to investigate when the amplifier can handle its real load.',
   downside:'Do not assume that 8 Ω marketing compatibility means the speaker never falls to 4 Ω.',
   ca:null},
  {model:'KEF Q150', goals:['imaging','all_rounder','natural'], scenes:['desk','bedroom','living_room'],
   reason:'A compact coaxial-driver speaker to compare for consistent positioning and soundstage preferences, without claiming a measured personal match.',
   downside:'The maker documents a 3.7 Ω minimum despite the nominal 8 Ω figure; this can be a demanding load for some amplifiers.',
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

/** Only documented continuous ratings are used as an *initial conservative
 * nominal-load discovery filter*. They do NOT prove that a real reactive
 * loudspeaker is safe, or define amplifier impedance permissions. */
export function ampSpeakerScreening(amp) {
  const ratings = amp?.record?.ratings || [];
  const continuous = ratings.filter(x=>Array.isArray(x) && x[2]==='continuous' &&
    Number.isFinite(x[1]) && x[1]>=2 && x[1]<=16).map(x=>x[1]);
  const minPublishedTestOhms = continuous.length ? Math.min(...continuous) : null;
  const model=String(amp?.name||amp?.record?.model||'');
  const explicitNominalFloor = model === 'Yamaha R-S202' ? 8 : model === 'Sony STR-DH190' ? 6 : null;
  const discoveryFloor = explicitNominalFloor || (minPublishedTestOhms !== null ?
    Math.min(8,Math.max(4,minPublishedTestOhms)) : 8);
  const exactManufacturerRule = model === 'Yamaha R-S202' ?
    'Yamaha specifies 8 Ω or higher for a single speaker pair A or B (and 16 Ω or higher for A+B where applicable). A nominal label alone does not establish actual impedance minimum or thermal safety.' :
    model === 'Sony STR-DH190' ? 'Sony lists 6–16 Ω speakers; verify the exact regional revision and operating conditions.' : '';
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
  const budget=Number.isFinite(input.budget)&&input.budget>=0?input.budget:null;
  const firm=input.budgetStrict!==false;
  const allowedUsed=input.used!==false;
  const selected=[],excluded=[];
  if (input.power==='battery') return {selected,excluded,screen,reason:'A mains-powered home amplifier does not meet a mandatory battery requirement; a portable source/amplifier must be verified first.',mode:'speaker_only'};
  const byModel=new Map(catalog.map(x=>[x.model,x]));
  const goalsOrder={
    all_rounder:['Polk Signature Elite ES15','Paradigm Monitor SE Atom','Polk Signature Elite ES20','ELAC Debut 3.0 DB63','Klipsch R-50M','Wharfedale Diamond 12.2','ELAC Debut 2.0 B6.2','JBL Stage 250B','Paradigm Titan v3','KEF Q150','Q Acoustics 3020i','DALI Oberon 1'],
    natural:['Paradigm Monitor SE Atom','Polk Signature Elite ES15','Polk Signature Elite ES20','Wharfedale Diamond 12.2','ELAC Debut 3.0 DB63','DALI Oberon 1','Q Acoustics 3020i','Paradigm Titan v3','KEF Q150','Klipsch R-50M','ELAC Debut 2.0 B6.2','JBL Stage 250B'],
    imaging:['Paradigm Monitor SE Atom','Polk Signature Elite ES15','KEF Q150','DALI Oberon 1','Wharfedale Diamond 12.2','Klipsch R-50M','Q Acoustics 3020i','Polk Signature Elite ES20','ELAC Debut 3.0 DB63','JBL Stage 250B','ELAC Debut 2.0 B6.2','Paradigm Titan v3'],
    dynamic:['Klipsch R-50M','Polk Signature Elite ES20','ELAC Debut 3.0 DB63','JBL Stage 250B','ELAC Debut 2.0 B6.2','Polk Signature Elite ES15','Paradigm Monitor SE Atom','Wharfedale Diamond 12.2','Paradigm Titan v3','DALI Oberon 1','KEF Q150','Q Acoustics 3020i'],
    bass:['Polk Signature Elite ES20','ELAC Debut 3.0 DB63','Wharfedale Diamond 12.2','ELAC Debut 2.0 B6.2','JBL Stage 250B','Paradigm Titan v3','Paradigm Monitor SE Atom','Klipsch R-50M','Polk Signature Elite ES15','KEF Q150','Q Acoustics 3020i','DALI Oberon 1'],
    low_volume:['Polk Signature Elite ES15','Paradigm Monitor SE Atom','DALI Oberon 1','Wharfedale Diamond 12.2','Polk Signature Elite ES20','Q Acoustics 3020i','KEF Q150','Klipsch R-50M','ELAC Debut 3.0 DB63','JBL Stage 250B','Paradigm Titan v3','ELAC Debut 2.0 B6.2']
  };
  const ids=goalsOrder[goal]||goalsOrder.all_rounder;
  // Listener priorities and room come first. Among similarly suitable options,
  // several relevant first-person owner accounts are more useful than an
  // unverified claimed sound signature. No invented acoustic match score.
  const ordered=[...ids].sort((a,b)=>{
    const x=SPEAKER_IDEAS.find(v=>v.model===a);
    const y=SPEAKER_IDEAS.find(v=>v.model===b);
    const goalA=x?.goals.includes(goal)?0:1;
    const goalB=y?.goals.includes(goal)?0:1;
    if(goalA!==goalB)return goalA-goalB;
    const sceneA=x?.scenes.includes(scene)?0:1;
    const sceneB=y?.scenes.includes(scene)?0:1;
    if(sceneA!==sceneB)return sceneA-sceneB;
    const ownerA=ownerEvidenceTier(a,goal);
    const ownerB=ownerEvidenceTier(b,goal);
    if(ownerA!==ownerB)return ownerA-ownerB;
    return ids.indexOf(a)-ids.indexOf(b);
  });
  for(const model of ordered) {
    const idea=SPEAKER_IDEAS.find(x=>x.model===model);
    const record=byModel.get(model);
    if(!idea || !record)continue;
    if(idea.usedOnly&&!allowedUsed)continue;
    const nominal=record.values?.load;
    // Missing load information must not automatically prevent discovery.
    // It does require a plainly visible do-not-connect-before-check warning.
    const loadUnknown=!Number.isFinite(nominal);
    // Conservative screening; insufficient documentation never becomes "safe".
    if(!loadUnknown && nominal<screen.discoveryFloor) {
      excluded.push({title:model,reason:'Nominal load below the conservative amplifier search limit ('+screen.discoveryFloor+' Ω). Not a definitive safety determination.'});continue;
    }
    const minimum=record.values?.minimum;
    if(screen.discoveryFloor>=8 && Number.isFinite(minimum) && minimum<6) {
      excluded.push({title:model,reason:'Published minimum '+minimum+' Ω is more demanding than this 8 Ω-only screening route; model requires independent compatibility review.'});continue;
    }
    const priced=region==='CA'&&currency==='CAD'&&idea.ca;
    const subtotal=priced?idea.ca.amount:null;
    if(firm && budget!==null && subtotal!==null && subtotal>budget) {
      excluded.push({title:model,reason:'Speaker-pair observed price exceeds the firm budget. Owned amplifier adds zero purchase cost.'});continue;
    }
    if(selected.length>=5)break;
    const caution=loadUnknown ?
      'This speaker’s nominal load is not verified. Do NOT connect to '+screen.ampName+' until its load and the amplifier manufacturer’s permission are confirmed.' :
      screen.explicitNominalFloor ?
      'Your '+screen.ampName+' manufacturer load guidance still needs checking against the speaker’s full impedance curve; a nominal '+nominal+' Ω label is not a safety certificate.' :
      'Your amplifier has '+(screen.minPublishedTestOhms??'no verified')+' Ω published continuous-load test data; that is NOT a promise of compatibility with this speaker’s unknown phase/minimum or your volume.';
    selected.push({
      id:'owned-speaker-'+model.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      architecture:'passive_separates',
      title:model,
      kind:'Speaker pair for your existing '+screen.ampName,
      why:idea.reason,
      tradeoff:idea.downside,
      parts:[{name:model+' stereo pair',count:1,role:'Only new major component; keep your '+screen.ampName+' if verified suitable',url:record.url}],
      priceComponents:priced?[{label:model+' pair',amount:subtotal,url:idea.ca.url}]:[],
      subtotal,
      pricingStatus:subtotal===null?'regional_price_missing':'partial_subtotal',
      sourceDate:'2026-11-12',
      editorialGoalFocus:idea.goals.includes(goal),
      secondaryFocus:second.filter(x=>idea.goals.includes(x)),
      connectionStatus:'owned_amp_source_unverified',
      sourceCaution:['usb','optical','hdmi','bluetooth'].includes(input.connection) ?
        'Check whether '+screen.ampName+' actually accepts your selected '+input.connection.toUpperCase()+' source; an adapter or external source may be required.' : null,
      sourceBatteryCaution:false,
      sceneCaution:!idea.scenes.includes(scene),
      placementCaution:Number(input.distanceFt)>12,
      levelCaution:input.level==='high',
      extra:[caution,'Check the exact speaker revision, nominal and minimum impedance, phase angle, and your amplifier manual before connecting.',
        'Speaker cable, source connectivity and any necessary stands are extra. No new amplifier has been included in the price.',
        'Use System Check to evaluate clean level at your actual listening position; manufacturer sensitivity figures may use different conventions.'],
      loadCaution:loadUnknown ?
        'Load unknown: do not connect these speakers to '+screen.ampName+' until the manufacturer’s requirements are checked.' :
        screen.explicitNominalFloor?'Confirm load: '+screen.ampName+' requires suitable speakers; '+nominal+' Ω nominal alone does not prove a safe match.':null,
      ownerEvidenceLabel:ownerEvidenceFor(model)?.label || 'Model specifications; listening reports not verified',
      ownerEvidenceBasis:ownerEvidenceFor(model)?.band || 'spec_led',
      ownedAmpName:screen.ampName,
      speakerValues:record.values
    });
  }
  return {selected,excluded,screen,mode:'speaker_only'};
}
