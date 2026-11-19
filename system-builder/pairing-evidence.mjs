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
  // Published impedance dips below a manufacturer’s nominal-load figure do not
  // automatically contradict the *nominal* guidance, but add uncertainty.
  const demandingMinimum=hasMinimum&&(
    (explicit!==null&&minimum<explicit)||
    (explicit===null&&testedMin!==null&&minimum<testedMin)
  );
  // Nominal missing cannot outrank documented load data, even if unrelated
  // catalog information happens to be complete.
  const unknownNominal=nominal===null;
  // Explicit manufacturer guidance is stronger than a resistive test load.
  let tier=unknownNominal?9:7-
    (hasManufacturerRule?4:0)-(hasMinimum?2:0)-(exactRated?1:0);
  // Known demanding dips need review; don't reward them just for being known.
  if(demandingMinimum)tier=Math.max(6,tier);
  // Unattributed numbers must not outrank sourced model-specific records.
  if(!confirmedSource)tier=Math.max(8,tier);
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
  const level=tier<=2?'better_documented':tier<=5?'partially_documented':'limited';
  const label=level==='better_documented'?'Better-documented candidate, still conditional':
    level==='partially_documented'?'Partly documented candidate, further checks needed':
    'Limited or concerning load evidence, investigate before connecting';
  return {tier,level,label,notes,nominal,minimum,manufacturerNominalGuidance:hasManufacturerRule,
    continuousRatingAtNominal:exactRated,minimumDocumented:hasMinimum,
    demandingMinimum,sourceLinked:confirmedSource};
}
export function compareSpeakerPairingEvidence(a,b){
  return speakerPairingEvidence(a?.amp,a?.screen,a?.speaker).tier-
    speakerPairingEvidence(b?.amp,b?.screen,b?.speaker).tier;
}
