/**
 * Source-preserving adapter from the canonical registry to the Builder's
 * existing calculator/compatibility representation. Source-published values
 * remain attached to the exact model and category; unknowns stay unknown.
 */
const supportedKinds=new Set(['speaker','amp','source','headphone']);
const validNumber=v=>typeof v==='number'&&Number.isFinite(v);
const basisForSpeaker=b=>b==='1_W_at_1_m'?'power':b==='2.83_V_at_1_m'?'voltage':null;
const basisForHeadphone=b=>b==='dB_SPL_per_mW'?'power':b==='dB_SPL_per_V'?'voltage':null;

export function sharedGearAsLegacyView(entry,kind){
  if(!entry||!supportedKinds.has(kind)||!Array.isArray(entry.categories)||!entry.categories.includes(kind))
    return null;
  const fact=key=>entry.facts?.[key]?.value;
  const profiles=Array.isArray(entry.profiles)?entry.profiles:[];
  // When a complete exact-model legacy or Builder profile exists, it is the
  // authoritative source of its existing typed values and power-test rows.
  const profile=profiles.find(x=>x.category===kind&&x.from==='system-check/gear.js')||
    profiles.find(x=>x.category===kind&&x.from==='system-builder/supplemental-*.mjs')||null;
  const values={...(profile?.values||{})};
  const put=(key,value)=>{
    if(values[key]===undefined&&validNumber(value))values[key]=value;
  };
  const putBasis=(value)=>{
    if(values.basis===undefined&&value)values.basis=value;
  };
  if(kind==='speaker'){
    put('load',fact('speakerNominalImpedanceOhms'));
    put('minimum',fact('speakerMinimumImpedanceOhms'));
    put('sensitivity',fact('speakerSensitivityDb'));
    putBasis(basisForSpeaker(fact('speakerSensitivityBasis')));
  }else if(kind==='amp'){
    put('minimum',fact('minimumSpeakerImpedanceOhms'));
  }else if(kind==='headphone'){
    put('load',fact('nominalImpedanceOhms'));
    put('sensitivity',fact('sensitivityDb'));
    putBasis(basisForHeadphone(fact('sensitivityBasis')));
  }else if(kind==='source'){
    put('sourceVoltage',fact('lineOutputVoltageVrms'));
    put('sourceZ',fact('lineOutputImpedanceOhms'));
  }
  const ratings=(profile?.ratings||[]).filter(row=>Array.isArray(row)&&row.length>=3)
    .map(row=>[...row]);
  if(kind==='amp'&&!ratings.length){
    const facts=fact('speakerPowerRatings');
    if(Array.isArray(facts)){
      for(const row of facts){
        if(validNumber(row?.wattsPerChannel)&&row.wattsPerChannel>0&&
          validNumber(row?.loadOhms)&&row.loadOhms>0&&
          typeof row.duration==='string'&&row.duration.trim()){
          ratings.push([row.wattsPerChannel,row.loadOhms,row.duration,
            ...(row.testConditions!==undefined?[row.testConditions]:[])]);
        }
      }
    }
  }
  const source=entry.evidence?.find(e=>e.from===profile?.from&&/^https:\/\//.test(e.url))||
    entry.evidence?.find(e=>/^https:\/\//.test(e.url));
  return {
    model:String(entry.model||''),
    type:kind,values,ratings,
    note:String(profile?.note||'Shared catalogue entry; only source-stated specifications are used.'),
    url:source?.url||null,
    details:profile?.details||null,
    catalogueId:entry.id,
    speakerKind:fact('speakerKind')||null,
    powered:fact('powered')===true,
    evidence:'Shared source-verified catalogue; no unknown specifications inferred'
  };
}
