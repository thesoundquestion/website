/** Catalog-managed Builder amp/receiver entries. Numeric conditions are
 * retained in equipment/source-master.json, never guessed from peak watts.
 */
export {BUILDER_ONLY_AMPS} from './catalog-supplements.generated.mjs';
import {BUILDER_ONLY_AMPS} from './catalog-supplements.generated.mjs';
export function builderOnlyAmpFor(model){
  return BUILDER_ONLY_AMPS.find(item=>item.model===model)||null;
}
