/**
 * Soft pricing preference for equipment with CURRENT, same-region, category-
 * comparable, multi-retailer evidence. Unknown prices remain eligible and
 * retain their original relative order; price never scores audio quality.
 */
import {regionalPriceLabel} from './price-tier-client.mjs';

export const PRICE_PREFERENCES=Object.freeze({
  any:'No pricing preference',
  budget:'Favour budget pricing',
  mid_grade:'Favour mid-priced',
  premium_pricing:'Favour premium pricing'
});
export const validPricePreference=value=>Object.hasOwn(PRICE_PREFERENCES,value)?value:'any';

/**
 * Known matches receive an optional ordering boost. All non-matches keep
 * their original ordering, including unpriced, stale and unsupported regions.
 * Never hide equipment or infer missing figures from retail appearance.
 */
export function preferVerifiedPriceTier(records,snapshot,{region='CA',preference='any',asOf}={}){
  if(!Array.isArray(records))throw new TypeError('Equipment candidates must be an array');
  const wanted=validPricePreference(preference);
  if(wanted==='any'||!snapshot)return [...records];
  const eligible=records.map((record,index)=>({
    record,index,tier:record?.id?regionalPriceLabel(snapshot,record.id,{region,asOf}):null
  }));
  return eligible.sort((a,b)=>
    Number(b.tier?.tier===wanted)-Number(a.tier?.tier===wanted)||a.index-b.index
  ).map(x=>x.record);
}
export function pricingPreferenceCoverage(records,snapshot,{region='CA',preference='any',asOf}={}){
  const wanted=validPricePreference(preference);
  const counts={matched:0,otherVerified:0,unknown:0};
  for(const record of records){
    const label=record?.id?regionalPriceLabel(snapshot,record.id,{region,asOf}):null;
    if(!label)counts.unknown++;
    else if(label.tier===wanted)counts.matched++;
    else counts.otherVerified++;
  }
  return {...counts,applied:wanted!=='any'&&counts.matched>0,
    note:wanted==='any'?'No price weighting selected.':
      counts.matched?'Verified '+region+' retail matches are shown first; other and unpriced choices remain available.':
      'No current matching retail category in '+region+' for these models; original order is retained.'};
}
