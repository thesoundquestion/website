/** Catalog-managed Builder speaker entries. Do not edit models here.
 * Edit equipment/source-master.json and regenerate the equipment catalogue.
 */
export {BUILDER_ONLY_SPEAKERS} from './catalog-supplements.generated.mjs';
import {BUILDER_ONLY_SPEAKERS} from './catalog-supplements.generated.mjs';
export function builderOnlySpeakerFor(model){
  return BUILDER_ONLY_SPEAKERS.find(item=>item.model===model)||null;
}
