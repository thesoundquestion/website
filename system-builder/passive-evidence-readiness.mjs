/**
 * Check whether a named passive amplifier+speaker system has the inputs
 * necessary for a model-specific System Check headroom estimate.
 *
 * This is NOT a claim that the system meets the selected listening target,
 * a speaker damage/safety certificate, or a numerical product quality score.
 * Unknown measurements do not become zeroes or guessed substitutes.
 */
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const exact=(catalog,model,category)=>
  catalog?.records?.find(row=>row?.model===model&&row.categories?.includes(category))||null;

function profileValues(entry,category){
  const profiles=(entry?.profiles||[]).filter(p=>p.category===category);
  const legacy=profiles.find(p=>p.from==='system-check/gear.js');
  const supplemental=profiles.find(p=>p.from==='system-builder/supplemental-*.mjs');
  return legacy||supplemental||profiles.find(p=>p.values)||null;
}

/**
 * A verified load match is a separate prerequisite established by curated
 * pairing evidence. A complete power/sensitivity data set is an additional
 * gate for calling a passive system a calculable candidate.
 */
export function passivePairingReadiness(example,catalog,curated=null){
  if(example?.architecture!=='passive_separates')
    return {status:'not_applicable',missing:[]};
  if(!curated?.amplifierModel||!curated?.speakerModel)
    return {status:'incomplete',missing:['documented exact amplifier/speaker pairing']};
  if(!Array.isArray(catalog?.records))
    return {status:'unknown',missing:['equipment catalogue not loaded']};

  const amp=profileValues(exact(catalog,curated.amplifierModel,'amp'),'amp');
  const speaker=profileValues(exact(catalog,curated.speakerModel,'speaker'),'speaker');
  const values=speaker?.values||{};
  const missing=[];

  if(!finite(values.load)||values.load<=0)missing.push('speaker nominal impedance');
  if(!finite(values.sensitivity)||values.sensitivity<=0||
     !['voltage','power'].includes(values.basis))
    missing.push('speaker sensitivity with its 1 m reference');
  const power=amp?.ratings?.some(([watts,load,duration])=>
    finite(watts)&&watts>0&&finite(load)&&load>0&&
    finite(values.load)&&Math.abs(load-values.load)<0.01&&duration==='continuous');
  if(!power)missing.push('amplifier continuous power at the speaker nominal load');
  return {
    status:missing.length?'incomplete':'calculable',
    missing,
    amplifierModel:curated.amplifierModel,
    speakerModel:curated.speakerModel
  };
}

/** Only compare verification readiness within passive systems with the same
 * fundamental intent. A different architecture is never penalized for not
 * having separate external amplifier ratings.
 */
export function passiveReadinessPriority(a,b,catalog,curatedFor,request={}){
  if(!Array.isArray(catalog?.records)||
     a?.architecture!=='passive_separates'||
     b?.architecture!=='passive_separates')
    return 0;
  // Never let evidence availability override a declared primary purpose,
  // location or a clear below/above-budget distinction.
  const goal=String(request.goal||'all_rounder');
  const place=String(request.useCase||'living_room');
  if(Boolean(a.goals?.includes(goal))!==Boolean(b.goals?.includes(goal))||
     Boolean(a.places?.includes(place))!==Boolean(b.places?.includes(place)))
    return 0;
  const budget=Number.isFinite(request.budget)&&request.budget>=0?request.budget:null;
  if(budget!==null&&request.budgetStrict!==false){
    const subtotal=e=>e.priceByRegion?.[request.region]?.components?.reduce(
      (sum,x)=>sum+x.amount*(x.quantity||1),0) ??
      (request.region==='CA'&&request.currency==='CAD'?
        e.priceCA?.components?.reduce((sum,x)=>sum+x.amount*(x.quantity||1),0):null);
    const aPrice=subtotal(a),bPrice=subtotal(b);
    if(aPrice!==null&&bPrice!==null){
      const aWithin=aPrice<=budget,bWithin=bPrice<=budget;
      if(aWithin!==bWithin)return 0; // defer to preexisting budget logic
    }
  }
  const ax=passivePairingReadiness(a,catalog,curatedFor(a)).status==='calculable';
  const bx=passivePairingReadiness(b,catalog,curatedFor(b)).status==='calculable';
  return ax===bx?0:(ax?-1:1);
}
