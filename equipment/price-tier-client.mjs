/**
 * Optional market-positioning labels for catalogue lists and comparisons.
 * Price bands are about relative retail expense, never sound quality.
 * Loads only when a tools page requests regional pricing.
 */
import {getCurrentPriceTier} from './price-tiers.mjs';
export const PRICE_TIER_LABELS=Object.freeze({
  budget:'Budget pricing',
  mid_grade:'Mid-priced',
  premium_pricing:'Premium pricing'
});
export async function loadRegionalPriceTiers({
  fetcher=globalThis.fetch,url='/equipment/price-tiers.generated.json'
}={}) {
  if(typeof fetcher!=='function')throw new Error('Fetch is required');
  const response=await fetcher(url,{cache:'no-cache'});
  if(!response.ok)throw new Error('Pricing bands unavailable');
  const snapshot=await response.json();
  if(snapshot.schemaVersion!=='1.0.0'||!snapshot.regions)
    throw new Error('Unrecognized regional pricing tier format');
  return snapshot;
}
export function regionalPriceLabel(snapshot,equipmentId,{region='CA',asOf}={}) {
  const data=snapshot?.regions?.[region];
  if(!data)return null;
  const tier=getCurrentPriceTier(data,equipmentId,{asOf:asOf||new Date().toISOString().slice(0,10)});
  if(!tier)return null;
  return {label:PRICE_TIER_LABELS[tier.tier],tier:tier.tier,region,
    confidence:tier.confidence,asOf:tier.asOf,expiresOn:tier.expiresOn,
    meaning:'relative price position within researched new-retail peers, not performance'};
}

/**
 * Order an existing category's candidates by regional price tier.
 * Unknown and expired models remain visible at the end; never treat them
 * as poor performers, free products, or top picks.
 */
export function sortEquipmentByRegionalTier(items,snapshot,{
  region='CA',asOf
}={}) {
  const order={budget:0,mid_grade:1,premium_pricing:2};
  return [...items].sort((a,b)=>{
    const left=regionalPriceLabel(snapshot,a.id,{region,asOf});
    const right=regionalPriceLabel(snapshot,b.id,{region,asOf});
    const al=left?order[left.tier]:3,bl=right?order[right.tier]:3;
    return al-bl||String(a.model||'').localeCompare(String(b.model||''));
  });
}
