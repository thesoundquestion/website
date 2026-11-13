import {ownerEvidenceFor, ownerEvidenceTier} from './owner-evidence.mjs';
import {priceContextFor,broadActivePromotionFor} from './market-price-context.mjs';
import {BUILDER_ONLY_SPEAKERS} from './supplemental-speakers.mjs';
import {internationalPriceContextFor, corroboratedInternationalPairPriceFor} from './international-price-context.mjs';

/**
 * Speaker-only options when a visitor owns an amplifier but no speakers.
 * This is editorial discovery, NOT a guarantee of impedance/current, headroom,
 * acoustic suitability, or a regional value/price winner.
 * All speaker technical claims resolve from the existing read-only System Check
 * catalog. Only exact storefront pair-price examples below are newly supplied.
 * Checked 2026-11-12. Never charge for the already-owned amplifier.
 */
export const SPEAKER_IDEAS = Object.freeze([
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
  {model:'Klipsch RP-600M II',goals:['all_rounder','dynamic','imaging'],scenes:['bedroom','living_room'],
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
   downside:'The manufacturer rates the -3 dB limit at 57 Hz; bass at a listening seat is room-dependent. Current promotional offers are not the regular price.',
   ca:{amount:349,url:'https://www.crutchfield.ca/p_107MXT20/Polk-Audio-Monitor-XT20.html'}},
  {model:'Klipsch R-50M', goals:['dynamic','all_rounder','imaging'], scenes:['bedroom','living_room'],
   reason:'A horn-loaded compact pair to audition for a different dispersion/presentation approach, with an explicit factory sensitivity reference.',
   downside:'Horn design is a preference/trade-off, not a guaranteed imaging or clarity improvement. Factory sensitivity is room-referenced and is not directly comparable to other anechoic figures.',
   ca:{amount:549,url:'https://www.klipsch.ca/products/r-50m-bookshelf-speakers'}},
  {model:'Paradigm Monitor SE Atom', goals:['all_rounder','natural','imaging','low_volume'], scenes:['desk','bedroom','living_room'],
   reason:'A compact Canadian passive stereo pair with multiple Canadian regular retail price references and a straightforward small-room use case.',
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
  // Keep the original System Check catalog untouched. Builder-only exact-model
  // complements are source-linked and never override existing source presets.
  const byModel=new Map(BUILDER_ONLY_SPEAKERS.map(x=>[x.model,x]));
  for (const record of catalog)byModel.set(record.model,record);
  const goalsOrder={
    all_rounder:['Polk Signature Elite ES15','Polk Monitor XT15','Polk Monitor XT20','Paradigm Monitor SE Atom','Polk Signature Elite ES20','ELAC Debut 3.0 DB63','Klipsch R-50M','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','ELAC Debut 2.0 B6.2','JBL Stage 250B','Paradigm Titan v3','KEF Q150','Q Acoustics 3010i','Q Acoustics 3020i','DALI Oberon 1','PSB Alpha P3','PSB Alpha P5','Triangle Borea BR03 (passive)','Q Acoustics 3030i','Klipsch RP-600M II','Fluance SX6 Elite (SX6-BK)'],
    natural:['Paradigm Monitor SE Atom','Polk Monitor XT15','Polk Monitor XT20','Polk Signature Elite ES15','Polk Signature Elite ES20','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','ELAC Debut 3.0 DB63','DALI Oberon 1','Q Acoustics 3010i','Q Acoustics 3020i','Paradigm Titan v3','KEF Q150','Klipsch R-50M','ELAC Debut 2.0 B6.2','JBL Stage 250B','PSB Alpha P3','PSB Alpha P5','Triangle Borea BR03 (passive)','Q Acoustics 3030i','Fluance SX6 Elite (SX6-BK)'],
    imaging:['Paradigm Monitor SE Atom','Polk Monitor XT15','Polk Monitor XT20','Polk Signature Elite ES15','KEF Q150','DALI Oberon 1','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','Klipsch R-50M','Q Acoustics 3010i','Q Acoustics 3020i','Polk Signature Elite ES20','ELAC Debut 3.0 DB63','JBL Stage 250B','ELAC Debut 2.0 B6.2','Paradigm Titan v3','PSB Alpha P3','PSB Alpha P5','Triangle Borea BR03 (passive)','Klipsch RP-600M II','Fluance SX6 Elite (SX6-BK)'],
    dynamic:['Klipsch R-50M','Polk Monitor XT20','Polk Monitor XT15','Polk Signature Elite ES20','ELAC Debut 3.0 DB63','JBL Stage 250B','ELAC Debut 2.0 B6.2','Polk Signature Elite ES15','Paradigm Monitor SE Atom','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','Paradigm Titan v3','DALI Oberon 1','KEF Q150','Q Acoustics 3010i','Q Acoustics 3020i','Triangle Borea BR03 (passive)','Q Acoustics 3030i','Klipsch RP-600M II','Fluance SX6 Elite (SX6-BK)'],
    bass:['Polk Signature Elite ES20','Polk Monitor XT20','Polk Monitor XT15','ELAC Debut 3.0 DB63','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','ELAC Debut 2.0 B6.2','JBL Stage 250B','Paradigm Titan v3','Paradigm Monitor SE Atom','Klipsch R-50M','Polk Signature Elite ES15','KEF Q150','Q Acoustics 3010i','Q Acoustics 3020i','DALI Oberon 1','PSB Alpha P5','Triangle Borea BR03 (passive)','Q Acoustics 3030i','Fluance SX6 Elite (SX6-BK)'],
    low_volume:['Polk Signature Elite ES15','Polk Monitor XT15','Polk Monitor XT20','Paradigm Monitor SE Atom','DALI Oberon 1','Wharfedale Diamond 12.1','Wharfedale Diamond 12.2','Polk Signature Elite ES20','Q Acoustics 3010i','Q Acoustics 3020i','KEF Q150','Klipsch R-50M','ELAC Debut 3.0 DB63','JBL Stage 250B','Paradigm Titan v3','ELAC Debut 2.0 B6.2','PSB Alpha P3','PSB Alpha P5','Fluance SX6 Elite (SX6-BK)']
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
    // A dated, region-specific ordinary pair price is more actionable than
    // a completely unpriced model under a FIRM budget. Never convert foreign
    // amounts or treat an isolated used asking price as a completed sale.
    if(firm && budget!==null) {
      const evidenceKind=model=>{
        const info=SPEAKER_IDEAS.find(v=>v.model===model);
        const active=broadActivePromotionFor(model,region,currency,input.referenceDate);
        const international=corroboratedInternationalPairPriceFor(model,region,currency);
        const canadian=region==='CA'&&currency==='CAD'?info?.ca?.amount:null;
        const effective=active?.amount??international?.amount??canadian;
        if(Number.isFinite(effective) && effective<=budget)return 0;
        const asks=region==='CA'&&currency==='CAD'&&allowedUsed && info?.usedOnly ?
          priceContextFor(model,region,currency)?.usedExampleRange : null;
        if(asks && asks.min<=budget)return 1;
        return 2;
      };
      const budgetA=evidenceKind(a),budgetB=evidenceKind(b);
      if(budgetA!==budgetB)return budgetA-budgetB;
    }
    // Within a firm budget, a documented buyable pair is more actionable
    // than five unpriced leads, even if it comes with a small-room caveat.
    // Outside priced choices, the actual room/use-case stays important.
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
    const canadianPriced=region==='CA'&&currency==='CAD'&&idea.ca;
    const ordinaryInternational=corroboratedInternationalPairPriceFor(model,region,currency);
    const marketContext=priceContextFor(model,region,currency) ||
      internationalPriceContextFor(model,region,currency);
    const promotionalOffer=broadActivePromotionFor(model,region,currency,input.referenceDate);
    const promoChosen=!!promotionalOffer &&
      (!canadianPriced||promotionalOffer.amount<idea.ca.amount);
    const subtotal=promoChosen ? promotionalOffer.amount :
      ordinaryInternational ? ordinaryInternational.amount :
      canadianPriced ? idea.ca.amount : null;
    if(firm && budget!==null && subtotal!==null && subtotal>budget) {
      excluded.push({title:model,reason:'Speaker-pair observed price exceeds the firm budget. Owned amplifier adds zero purchase cost.'});continue;
    }
    if(selected.length>=5)continue; // Continue checking exclusions even once the visible shortlist is full.
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
      why:idea.reason,
      tradeoff:idea.downside,
      parts:[{name:model+' stereo pair',count:1,role:'Only new major component; keep your '+screen.ampName+' if verified suitable',url:record.url}],
      priceComponents:subtotal!==null?[{label:model+' pair'+(promoChosen?' (seasonal promotion)':''),amount:subtotal,
        url:promoChosen?promotionalOffer.url:(ordinaryInternational?.url || idea.ca?.url)}]:[],
      pricingCurrency:currency,
      promotionalOffer:promoChosen?promotionalOffer:null,
      marketContext,
      usedExampleRange:idea.usedOnly && allowedUsed ? marketContext?.usedExampleRange || null : null,
      budgetCaution:idea.usedOnly && firm && budget!==null && marketContext?.usedExampleRange?.min>budget ?
        'Known used asking examples start above your budget. This is only a lead for a cheaper local listing, not a confirmed in-budget purchase.' : null,
      subtotal,
      pricingStatus:subtotal===null?'regional_price_missing':promoChosen?'seasonal_promotional_pair':'partial_subtotal',
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
