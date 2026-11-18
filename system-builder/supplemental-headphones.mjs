/** Catalog-managed Builder headphones. Sensitivity references remain explicit.
 * The 17 Builder-only models live in equipment/source-master.json.
 */
export {BUILDER_ONLY_HEADPHONES} from './catalog-supplements.generated.mjs';
import {BUILDER_ONLY_HEADPHONES} from './catalog-supplements.generated.mjs';
export function builderOnlyHeadphoneFor(model){
  return BUILDER_ONLY_HEADPHONES.find(item=>item.model===model)||null;
}
