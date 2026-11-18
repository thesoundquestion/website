/**
 * Descriptive regional purchase-price bands, NOT performance/quality grades.
 * Prices never appear in the public result. This module does not fetch the web.
 * Each observation needs a verifiable regional merchant URL and capture date.
 */
export const PRICE_TIER_POLICY=Object.freeze({
  version:'1.0.0',maxAgeDays:45,minDistinctRetailersPerModel:2,
  minComparableModelsPerCohort:5,minCohortRetailers:3,
  maxCrossRetailerRatio:2.5,tiers:['budget','mid_grade','premium_pricing']
});
const REGION_CURRENCY=Object.freeze({CA:'CAD',US:'USD',GB:'GBP',EU:'EUR',AU:'AUD'});
export const retailCategoryFor=entry=>{
  if(entry.categories?.includes('headphone'))return 'wired_headphones';
  const sp=entry.facts?.speakerKind?.value;
  if(sp==='powered_studio_monitor')return 'powered_studio_monitors_per_cabinet';
  if(sp==='powered_pa_speaker')return 'powered_pa_per_cabinet';
  if(entry.categories?.includes('microphone'))return 'microphones';
  if(entry.categories?.includes('audio_interface'))return 'usb_audio_interfaces';
  if(entry.categories?.includes('mixer_recorder'))return 'mixers_recorders';
  if(entry.categories?.includes('headphone_amplifier'))return 'headphone_amplifiers';
  // The historic 'amp' and 'speaker' presets contain integrated amps,
  // AV receivers, power amps, stereo pairs, centres and floorstanders.
  // Without an explicitly verified subtype and package quantity, it is
  // unsafe to group their prices together, even when their plugs match.
  if(entry.categories?.includes('amp'))return null;
  if(entry.categories?.includes('speaker'))return null;
  return null;
};
const median=items=>{
  const values=[...items].sort((a,b)=>a-b),m=values.length>>1;
  return values.length%2?values[m]:(values[m-1]+values[m])/2;
};
const percentile=(values,fraction)=>{
  const v=[...values].sort((a,b)=>a-b),n=(v.length-1)*fraction,l=Math.floor(n),h=Math.ceil(n);
  return v[l]+(v[h]-v[l])*(n-l);
};
const ageDays=(snapshot,now)=>Math.floor((Date.parse(now+'T12:00:00Z')-Date.parse(snapshot+'T12:00:00Z'))/86400000);
const plausibleDate=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)&&Number.isFinite(Date.parse(x+'T12:00:00Z'));

export function buildRegionalPriceTiers(catalog,research,{region='CA',asOf='2026-11-18'}={}) {
  if(!REGION_CURRENCY[region])throw new Error('Unsupported region '+region);
  if(!plausibleDate(asOf))throw new Error('Invalid comparison date');
  const records=Array.isArray(catalog?.records)?catalog.records:[];
  const byId=new Map(records.map(x=>[x.id,x]));
  const observations=Array.isArray(research?.observations)?research.observations:[];
  const groups=new Map();
  for(const item of observations) {
    if(item.region!==region)continue;
    if(!byId.has(item.equipmentId))throw new Error('Price observation references unknown equipment '+item.equipmentId);
    if(!plausibleDate(item.checkedOn))throw new Error('Invalid retail observation date');
    if(item.currency!==REGION_CURRENCY[region])throw new Error('Currency mismatch for '+item.equipmentId);
    if(typeof item.amount!=='number'||!Number.isFinite(item.amount)||item.amount<=0)throw new Error('Invalid retailer price');
    if(!/^https:\/\//.test(item.url||'')||!item.retailerId)throw new Error('Missing retailer evidence');
    // Special/promotional, used, refurbished, open-box or bundle prices
    // are not representative new regular retail price observations.
    if(item.condition!=='new'||item.priceKind!=='regular'||item.unit!=='one_product')continue;
    if(ageDays(item.checkedOn,asOf)<0||ageDays(item.checkedOn,asOf)>PRICE_TIER_POLICY.maxAgeDays)continue;
    const expected=retailCategoryFor(byId.get(item.equipmentId));
    if(!expected||item.category!==expected)throw new Error('Category mismatch for '+item.equipmentId);
    const key=item.equipmentId,merchant=item.retailerId;
    if(!groups.has(key))groups.set(key,new Map());
    const sameRetailer=groups.get(key);
    if(!sameRetailer.has(merchant)||item.checkedOn>sameRetailer.get(merchant).checkedOn)
      sameRetailer.set(merchant,item);
  }
  const qualified=[];
  for(const [id,retailerMap] of groups) {
    const quotes=[...retailerMap.values()],values=quotes.map(x=>x.amount);
    if(quotes.length<PRICE_TIER_POLICY.minDistinctRetailersPerModel)continue;
    if(Math.max(...values)/Math.min(...values)>PRICE_TIER_POLICY.maxCrossRetailerRatio)continue;
    qualified.push({id,category:retailCategoryFor(byId.get(id)),average:values.reduce((a,b)=>a+b,0)/values.length,
      quoteCount:quotes.length,retailers:quotes.map(x=>x.retailerId)});
  }
  const cohorts={};
  for(const item of qualified)(cohorts[item.category] ||= []).push(item);
  const categories={},tiersById={};
  for(const [category,items] of Object.entries(cohorts)) {
    const retailers=new Set(items.flatMap(x=>x.retailers));
    const ready=items.length>=PRICE_TIER_POLICY.minComparableModelsPerCohort &&
      retailers.size>=PRICE_TIER_POLICY.minCohortRetailers;
    // Log prices: a $100 to $200 jump and $500 to $1,000 are the same
    // relative purchasing difference. Tertiles are category/region-relative.
    const bounds=ready?
      [percentile(items.map(x=>Math.log(x.average)),1/3),
        percentile(items.map(x=>Math.log(x.average)),2/3)]:null;
    categories[category]={status:ready?'sampled':'insufficient_retail_evidence',
      representativeModels:items.length,retailerCount:retailers.size,region,
      pricingBasis:'average_regular_new_retail_across_distinct_merchants',
      boundariesHidden:true};
    for(const item of items)if(ready){
      const v=Math.log(item.average);
      const tier=v<=bounds[0]?'budget':v<=bounds[1]?'mid_grade':'premium_pricing';
      tiersById[item.id]={tier,category,region,asOf,
        confidence:'limited_sample',qualifyingRetailers:item.quoteCount,
        // Deliberately no numeric price, inferred sound quality or ranking.
        basis:'relative_new_retail_price_only',expiresOn:new Date(Date.parse(asOf+'T12:00:00Z')+
          PRICE_TIER_POLICY.maxAgeDays*86400000).toISOString().slice(0,10)};
    }
  }
  return {policyVersion:PRICE_TIER_POLICY.version,region,asOf,
    summary:{eligibleModels:qualified.length,labelledModels:Object.keys(tiersById).length},
    categories,tiersById};
}
export function getCurrentPriceTier(result,equipmentId,{asOf=result?.asOf}={}) {
  const item=result?.tiersById?.[equipmentId];
  if(!item||!plausibleDate(asOf)||asOf>item.expiresOn||asOf<item.asOf)return null;
  return item;
}
