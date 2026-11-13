/**
 * Transparent, qualitative interaction policy for System Builder.
 *
 * This module does NOT calculate SPL, rank sound quality, verify amplifier
 * loading, or treat an observed component subtotal as a complete price.
 * Existing exclusion gates run separately and always take precedence.
 */
import {compareBudgetReferences, retailPriceReference} from './price-references.mjs';

const wantedConnection = request => {
  const value=String(request?.connection||'undecided');
  return value==='undecided'?'':value;
};
const isParty = request => request?.goal==='party'||request?.useCase==='party';
const substantialDistance = request =>
  Number.isFinite(Number(request?.distanceFt))&&Number(request.distanceFt)>12;
const highDemand = request => request?.level==='high'||isParty(request);
const highDemandAtDistance = request => highDemand(request)&&substantialDistance(request);
const isNearfieldIdea = example =>
  example?.architecture==='active_studio'||String(example?.id||'').startsWith('powered-')||
  example?.id==='stereo-sub-ora'||example?.id==='stereo-sub-edifier';
// Exact-model editorial caveat already backed by the catalog's own product
// text: the original ORA uses 3-inch mains, not a full-range deep-bass system.
// Other models require individual extension evidence before similar treatment.
const compactBassCaveat = (example,request) =>
  example?.id==='powered-ora' &&
  request.goal==='bass' &&
  request.subMode!=='sub_hpf';

export function examplePriceFor(example, request) {
  const local = example.priceByRegion?.[request.region];
  const snapshot = local?.currency === request.currency ? local :
    request.region === 'CA' && request.currency === 'CAD' ? example.priceCA : null;
  return retailPriceReference(snapshot, request.referenceDate);
}

const countsSecondary = (example,request) =>
  new Set(Array.isArray(request.secondary)?request.secondary:[])
    .size? [...new Set(request.secondary)].filter(goal=>goal!==request.goal&&
      example.goals?.includes(goal)).length:0;

const nativeInput = (example,request) =>
  !wantedConnection(request)||example.connections?.includes(wantedConnection(request));

const inScene = (example,request) => example.places?.includes(request.useCase);

/**
 * Only compares editorial evidence/fit flags. Tie breaks preserve the original
 * order, not a fabricated 0-100 acoustic result. Return value is for sorting.
 */
export function compareExamplePriorities(a,b,request={},fallbackIndex=()=>0) {
  const rank=example=>{
    const primary=example.goals?.includes(request.goal||'all_rounder')?0:1;
    const venue=inScene(example,request)?0:1;
    const input=nativeInput(example,request)?0:1;
    // A desk-scale speaker with no verified far-field clean output is NOT a
    // documented high-output solution. This is a suitability caution, not a
    // numerical SPL claim.
    const demand=highDemandAtDistance(request)&&isNearfieldIdea(example)?1:0;
    const bassNeed=compactBassCaveat(example,request)?1:0;
    const moreGoals=-countsSecondary(example,request);
    // For ordinary desk listening, select input-native, room-suitable systems
    // ahead of otherwise similar choices; goal-tag match remains first.
    const sub = example.bassSetup ? 0 : 1;
    return [sub,primary,demand,bassNeed,venue,input,moreGoals];
  };
  const x=rank(a),y=rank(b);
  for(let i=0;i<x.length;i++) if(x[i]!==y[i])return x[i]-y[i];
  return compareBudgetReferences(examplePriceFor(a,request).subtotal,examplePriceFor(b,request).subtotal,request) ||
    fallbackIndex(a)-fallbackIndex(b);
}

export function explainInputInteractions(request={}) {
  const notes=[];
  const scene=String(request.useCase||'living_room');
  if(isParty(request)){
    notes.push('Party use: favor sustainable clean output and audience coverage; speaker sensitivity and peak watts cannot prove maximum clean loudness.');
  }
  if(highDemandAtDistance(request)){
    notes.push('High-output use beyond 12 ft: compact nearfield options move behind better-situated alternatives. Actual clean SPL still requires model-specific evidence.');
  } else if(request.level==='high'){
    notes.push('Loud listening: confirm output compression, amplifier clipping margin and speaker handling rather than relying on advertised watts.');
  }
  if(request.power==='battery'){
    notes.push('Battery operation is a mandatory gate, not a convenience preference: mains-only choices are excluded.');
  }
  if(scene==='outdoors'){
    notes.push('Outdoor use needs suitable coverage, mounting, weather protection and power. Indoor sensitivity alone does not establish outdoor performance.');
  }
  if(request.goal==='bass'&&request.subMode==='no_sub'){
    notes.push('Bass without a subwoofer: main speakers must do the low-frequency work; extension and loudness must be checked independently.');
  }
  if(request.subMode==='sub_hpf'){
    notes.push('A declared main-speaker high-pass can reduce bass demand, but crossover settings and actual wiring must still be verified.');
  } else if(request.subMode==='sub_full'||request.subMode==='sub_unknown'){
    notes.push('A connected subwoofer does not automatically relieve the main speakers of low bass.');
  } else if (request.subMode === 'plan_sub') {
    notes.push('A matching 2.1 example lists the sub and cables to check for your source.');
  }
  if(wantedConnection(request)){
    notes.push('Native '+wantedConnection(request).toUpperCase()+' input is preferred when other conditions are similar; adapter-dependent routes remain conditional and must include the extra hardware.');
  }
  if(Number.isFinite(request.budget)&&request.budgetStrict!==false){
    notes.push('Recent price references can help order equally suitable choices. Check current prices for all missing parts against your budget.');
  }
  if(Array.isArray(request.secondary)&&request.secondary.length){
    notes.push('Secondary goals break ties only after primary needs and practical constraints; these are editorial tags, not measured sound-quality ratings.');
  }
  return notes.slice(0,6);
}

/** Candidate-level explanation of which declared fields influenced this idea.
 * Never state that a venue, price, output or electrical pairing is verified. */
export function explainExampleInteractions(example,request={}) {
  const reasons=[];
  if(wantedConnection(request)&&nativeInput(example,request))
    reasons.push('Native '+wantedConnection(request).toUpperCase()+' connection is listed; verify source and controls.');
  if(request.useCase&&inScene(example,request))
    reasons.push('Its editorial use-case includes '+request.useCase.replaceAll('_',' ')+'.');
  const secondary=Array.isArray(request.secondary)?request.secondary.filter(g=>
    g!==request.goal&&example.goals?.includes(g)):[];
  if(secondary.length)
    reasons.push('Also tagged for '+secondary.map(x=>x.replaceAll('_',' ')).join(' and ')+'.');
  if(highDemandAtDistance(request)&&isNearfieldIdea(example))
    reasons.push('Clean output beyond 12 ft at the requested level is unverified for this compact/nearfield route.');
  if(compactBassCaveat(example,request))
    reasons.push('Without a verified mains high-pass, the original 3-inch ORA speakers cannot be assumed to provide deep bass unaided.');
  return reasons.slice(0,4);
}
