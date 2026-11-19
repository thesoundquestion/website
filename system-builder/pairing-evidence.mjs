/**
 * Evidence coverage for the *preliminary* pairing of a documented passive
 * loudspeaker with a specified owned amplifier. This does not assess sonic
 * quality, speaker phase angle, true minimum load, acoustic output, clipping,
 * manufacturer approval, or safety with a real reactive load.
 *
 * Data is read from existing source-backed equipment records only. A continuous
 * resistive rating at 4/6/8 ohms is evidence of a rating, not an impedance
 * permission. Explicit manufacturer nominal-load requirements carry more weight.
 * These tiers are ordinal coverage classes, NEVER 0–100 compatibility scores.
 */
const number=x=>typeof x==='number'&&Number.isFinite(x)?x:null;
export function speakerPairingEvidence(ownedAmp={},screen={},speaker={}){
  const values=speaker?.values||{};
  const provisional=ownedAmp?.record?.userEntered===true||speaker?.userEntered===true;
  const nominal=number(values.load);
  const minimum=number(values.minimum);
  const explicit=number(screen?.explicitNominalFloor);
  const ratings=Array.isArray(ownedAmp?.record?.ratings)?ownedAmp.record.ratings:[];
  const exactRated=nominal!==null&&ratings.some(r=>
    Array.isArray(r)&&r[2]==='continuous'&&number(r[0])!==null&&r[1]===nominal);
  const confirmedSource=typeof speaker?.url==='string'&&/^https:\/\//.test(speaker.url);
  const hasManufacturerRule=explicit!==null&&nominal!==null&&nominal>=explicit;
  const hasMinimum=minimum!==null;
  const testedMin=number(screen?.minPublishedTestOhms);
  // Speaker impedance naturally varies with frequency. It would be wrong to
  // call an 8-ohm nominal speaker incompatible with an 8-ohm-rated amplifier
  // just because its measured minimum is below 8 ohms.
  // Reserve extra screening for a genuinely unusual published dip, less than
  // 75% of nominal, or an explicit contrary manufacturer instruction.
  const demandingMinimum=hasMinimum&&nominal!==null&&minimum<nominal*0.75;
  const unknownNominal=nominal===null;
  // A documented manufacturer-supported nominal load is the strongest normal
  // beginner match. A power test at that load is useful corroboration but
  // is not equivalent to a manufacturer's speaker-load permission.
  let tier=hasManufacturerRule?(exactRated?0:1):
    exactRated?3:nominal!==null?5:8;
  if(demandingMinimum)tier=Math.max(6,tier);
  if(!confirmedSource)tier=Math.max(7,tier);
  if(provisional)tier=Math.max(7,tier);
  const notes=[];
  if(hasManufacturerRule)
    notes.push('The amplifier has documented manufacturer guidance of at least '+explicit+
      ' Ω nominal, and the speaker is published as '+nominal+' Ω nominal.');
  else if(explicit!==null&&nominal!==null)
    notes.push('The speaker’s published '+nominal+' Ω nominal load must be checked against the amplifier’s '+explicit+' Ω minimum.');
  else
    notes.push('Exact manufacturer nominal speaker-load permission is not established for this amplifier.');
  if(nominal===null)
    notes.push('The speaker’s nominal impedance is not verified in this source record.');
  if(minimum!==null)
    notes.push('The speaker has a published '+minimum+' Ω minimum, but the full impedance curve and phase remain unresolved.');
  else
    notes.push('The speaker’s minimum impedance and phase are not documented here.');
  if(exactRated)
    notes.push('The amplifier has a continuous power rating at this nominal '+nominal+' Ω test load; that rating does not prove permission for every real speaker.');
  else
    notes.push('No directly comparable continuous amplifier rating at this speaker’s nominal load is documented.');
  if(demandingMinimum)
    notes.push('Published minimum impedance dips below the relevant nominal/test reference; the load may demand more current and must not be treated as cleared.');
  if(provisional)
    notes.unshift('At least one device uses visitor-entered values. The linked document and actual product revision have not been independently verified; this is a provisional screening only.');
  // A speaker minimum need NOT be published for its manufacturer's
  // nominal-impedance rating to be a useful ordinary buying guide.
  const level=provisional?'needs_review':
    hasManufacturerRule&&!demandingMinimum&&confirmedSource?'basic_match':
    exactRated&&!demandingMinimum&&confirmedSource?'rated_load_only':'needs_review';
  const label=provisional?'Provisional: check the entered specifications against the actual manual':
    level==='basic_match'?'Good basic match based on published specifications':
    level==='rated_load_only'?'The published load and power test can be compared':
    'Check the speaker and amplifier ratings before choosing';
  const ohms=nominal===null?'an unknown load':nominal+'-ohm speakers';
  const plainWhy=provisional
    ?'This comparison uses specification numbers supplied by the visitor. It can narrow the options, but it does not verify the ratings or establish a safe electrical match.'
    :hasManufacturerRule&&!demandingMinimum
    ?'The amplifier maker says it works with speakers rated '+explicit+
      ' ohms or higher, and these speakers are listed as '+ohms+
      '. Those published requirements line up for a single speaker pair.'
    :hasManufacturerRule
      ?'The advertised ratings line up, but this particular speaker also has an unusually low published impedance point. We should check the amplifier maker’s guidance for that exact speaker.'
    :exactRated
      ?'These are listed as '+ohms+', and the amplifier has a power rating measured at that same load. That gives us a useful starting point, but we still need its supported speaker-load guidance.'
      :nominal!==null
        ?'These speakers are listed as '+ohms+', but we have not confirmed which speaker ratings this amplifier maker allows.'
        :'The speaker’s basic ohm rating is missing. Find that number before choosing an amplifier.';
  const plainMinimum=demandingMinimum
    ?'An unusually low measured impedance may make these speakers harder to power. This is a specific reason to check the exact models.'
    :hasMinimum
      ?'The minimum impedance is also documented. You can see that detail below if you want to investigate further.'
      :'The detailed impedance curve is not available here, but you do not need to research that curve for an ordinary published nominal-rating match.';
  const plainNext=demandingMinimum
    ?'Check the specific speaker and amplifier documentation before connecting this pair.'
    :hasManufacturerRule
      ?'Next, consider whether the speakers can play at the volume you want from your listening position.'
      :unknownNominal
        ?'Find the speaker’s nominal ohm rating.'
        :'Check the amplifier maker’s recommended speaker ratings, then consider listening distance and volume.';
  return {tier,level,label,notes,nominal,minimum,provisional,
    manufacturerNominalGuidance:!provisional&&hasManufacturerRule,
    continuousRatingAtNominal:exactRated,minimumDocumented:hasMinimum,
    demandingMinimum,sourceLinked:confirmedSource,plainWhy,plainMinimum,plainNext};
}
export function compareSpeakerPairingEvidence(a,b){
  return speakerPairingEvidence(a?.amp,a?.screen,a?.speaker).tier-
    speakerPairingEvidence(b?.amp,b?.screen,b?.speaker).tier;
}
