/**
 * Hard eligibility gates for recommended equipment combinations.
 *
 * A known conflict is a rejection, not a yellow warning on a recommended
 * product. Missing headroom measurements and unconfirmed phase curves are NOT
 * proof of an unsafe pairing. Those remain in optional technical details.
 */
const hasText=value=>typeof value==='string'&&value.trim().length>0;
const finite=value=>typeof value==='number'&&Number.isFinite(value);

/** Return an explicit blocked result only for known prohibition or mismatch. */
export function screenRecommendationSafety(item={},request={}){
  const blockers=[];
  if(hasText(item.ownershipBlocker))
    blockers.push(item.ownershipBlocker.trim());
  if(item.recallStatus==='affected')
    blockers.push('The exact product is covered by a confirmed, applicable safety recall.');
  if(item.connectionStatus==='incompatible')
    blockers.push('The selected equipment has a documented incompatible connection or control path.');
  if(item.environmentSuitability==='incompatible')
    blockers.push('The equipment is documented as incompatible with the requested environment.');
  if(item.levelSuitability==='fails')
    blockers.push('Verified clean output does not meet the requested level.');
  if(item.manualPairing?.supported===false)
    blockers.push(item.manualPairing.statement||
      'The amplifier manufacturer does not permit this speaker load.');
  if(item.manufacturerPairing?.supported===false)
    blockers.push(item.manufacturerPairing.statement||
      'The manufacturer explicitly prohibits this equipment pairing.');
  if(item.architecture==='passive_separates'){
    const ampFloor=item.ampMinimumNominalOhms??item.amplifierMinimumNominalOhms;
    const speakerNominal=item.speakerValues?.load??item.speakerRecord?.values?.load;
    if(finite(ampFloor)&&finite(speakerNominal)&&speakerNominal<ampFloor)
      blockers.push('Published '+speakerNominal+' Ω nominal speaker load is below the amplifier minimum of '+ampFloor+' Ω.');
  }
  if(request.power==='battery'&&item.power==='mains')
    blockers.push('The requested battery-only system cannot run from this mains-only supply.');

  return {eligible:blockers.length===0,blockers};
}

/**
 * Rankable proposals only. Exclusions remain available for a separate,
 * optional explanation, NEVER as a recommendation containing a hazard badge.
 */
export function removeUnsafeRecommendations(shortlist,request={}){
  const safe=[],excluded=[...(shortlist?.excluded||[])];
  for(const item of shortlist?.selected||[]){
    const screened=screenRecommendationSafety(item,request);
    if(screened.eligible)safe.push(item);
    else excluded.push({
      title:item.title||item.id||'Unidentified equipment',
      reason:screened.blockers.join(' ')
    });
  }
  return {...shortlist,selected:safe,excluded};
}
