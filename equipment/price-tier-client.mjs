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
