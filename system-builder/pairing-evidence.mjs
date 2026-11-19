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
  // Coverage is not the same as suitability. A missing minimum or a demanding
  // impedance dip can never receive the strongest explanatory label.
  const level=!unknownNominal && confirmedSource && hasManufacturerRule &&
      hasMinimum && exactRated && !demandingMinimum ? 'better_documented':
    !unknownNominal && confirmedSource && !demandingMinimum &&
      (hasManufacturerRule || exactRated || hasMinimum) ?
      'partially_documented':'limited';
  const label=level==='better_documented'?'The published numbers give us a stronger starting point':
    level==='partially_documented'?'This is worth considering, but we still need to check more':
    'We need more information before recommending this connection';
  const ohms=nominal===null?'an unknown load':nominal+'-ohm speakers';
  const plainWhy=hasManufacturerRule
    ?'The amplifier maker says it accepts speakers rated '+explicit+
      ' ohms or higher, and these are listed as '+ohms+
      '. That meets the first published requirement. It does not prove the amplifier will handle every demanding musical passage.'
    :exactRated
      ?'These speakers are listed as '+ohms+'. The amplifier has a published power test at that same load. That gives us a useful comparison, but a test rating is not permission to connect every speaker with that number.'
      :nominal!==null
        ?'We know these are listed as '+ohms+', but we do not have a clear manufacturer-approved speaker-load rule for this amplifier. We cannot confirm the pairing yet.'
        :'We do not have a reliable impedance rating for these speakers. We cannot tell whether they are a sensible load for this amplifier yet.';
  const plainMinimum=demandingMinimum
    ?'The speaker has a published lower impedance point that may demand more current. Ask the manufacturer or a qualified technician before treating this pairing as suitable.'
    :hasMinimum
      ?'The speaker also has a published '+minimum+'-ohm lowest point. The load changes with the music, so we still need the amplifier maker’s guidance.'
      :'We have not confirmed how low the speaker’s impedance drops when music plays. That can matter more than its advertised number.';
  const plainNext=demandingMinimum
    ?'Check the exact model manuals and any manufacturer advice about minimum speaker impedance. Do not connect on these numbers alone.'
    :unknownNominal
      ?'Find the exact speaker model and impedance specification before connecting.'
      :'Check the amplifier manual for permitted speaker loads, then use System Check to estimate your normal listening-level needs.';
  return {tier,level,label,notes,nominal,minimum,manufacturerNominalGuidance:hasManufacturerRule,
    continuousRatingAtNominal:exactRated,minimumDocumented:hasMinimum,
    demandingMinimum,sourceLinked:confirmedSource,plainWhy,plainMinimum,plainNext};
}
export function compareSpeakerPairingEvidence(a,b){
  return speakerPairingEvidence(a?.amp,a?.screen,a?.speaker).tier-
    speakerPairingEvidence(b?.amp,b?.screen,b?.speaker).tier;
}
