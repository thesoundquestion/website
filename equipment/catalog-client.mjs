/**
 * Lazy read-only consumer for the shared equipment catalogue.
 * Import from Builder, Checker, future comparisons or the goal guide.
 *
 * Do not fetch on every homepage visit. Load only when a visitor opens
 * a feature that uses the catalogue; it is a few hundred kilobytes.
 */
import {EQUIPMENT_SCHEMA_VERSION, findEquipment} from './catalog-core.mjs';
let pending=null;
export async function loadEquipmentCatalog({
  url='/equipment/catalog.generated.json',
  fetcher=globalThis.fetch
}={}) {
  if(typeof fetcher!=='function')throw new Error('A fetch implementation is required');
  if(url==='/equipment/catalog.generated.json'&&pending)return pending;
  const load=async()=>{
    const response=await fetcher(url,{cache:'force-cache'});
    if(!response.ok)throw new Error('Equipment catalog HTTP '+response.status);
    const catalog=await response.json();
    if(catalog.schemaVersion!==EQUIPMENT_SCHEMA_VERSION||!Array.isArray(catalog.records))
      throw new Error('Unsupported or malformed equipment catalog');
    return catalog;
  };
  if(url!=='/equipment/catalog.generated.json')return load();
  pending=load().catch(error=>{pending=null;throw error});
  return pending;
}
export {findEquipment};
