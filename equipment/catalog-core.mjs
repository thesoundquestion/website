/**
 * Shared, source-preserving equipment registry.
 * Pure module: usable by Builder, Checker, comparisons and goal routing.
 * It NEVER infers compatibility, sound quality, prices or missing measurements.
 *
 * No manual edits to the generated catalogue; update the source records.
 */
export const EQUIPMENT_SCHEMA_VERSION = '1.0.0';

const TYPES = new Set([
  'speaker','amp','source','headphone','microphone',
  'audio_interface','mixer_recorder','computer_sound_card','headphone_amplifier'
]);
const LEGACY_PATH = 'system-check/gear.js';
const COMPARE_PATH = 'system-check/compare/specs.js';
const RESEARCH_PATH = 'research/recording-input-catalog-v1.json';
const GOALS = Object.freeze({
  speaker:['home_listening','studio_monitoring','live_sound'],
  amp:['home_listening','speaker_amplification'],
  source:['home_listening','digital_playback'],
  headphone:['headphone_listening','recording_monitoring'],
  microphone:['recording','live_sound'],
  audio_interface:['recording','studio_monitoring'],
  mixer_recorder:['recording','live_sound'],
  computer_sound_card:['digital_playback','recording'],
  headphone_amplifier:['headphone_listening']
});

const asArray = x => Array.isArray(x) ? x : [];
const textValue = x => typeof x === 'string' ? x.trim() : '';
const slug = x => String(x).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'unknown';
const deepCopy = value => JSON.parse(JSON.stringify(value));
const link = url => /^https:\/\//.test(String(url || '')) ? url : null;

function createEntry(id, model, category) {
  return {
    id, model, aliases:[], categories:[category], goalTags:[...(GOALS[category]||[])],
    connections:{inputs:[],outputs:[],descriptions:[]},
    facts:{},
    profiles:[], evidence:[],
    pricing:{currentPrice:null,currency:null,checkedDate:null,availability:null},
    comparisonAnchor:false,
    review:{status:'source_specific_not_independently_measured',unknowns:[]}
  };
}
function uniquePush(list, value) {
  if (value !== null && value !== undefined && value !== '' && !list.includes(value)) list.push(value);
}
function addCategory(entry,category) {
  uniquePush(entry.categories, category);
  for (const goal of (GOALS[category]||[])) uniquePush(entry.goalTags, goal);
}
function addEvidence(entry,url,from,fields=[],date=null) {
  const u = link(url);
  if(!u || entry.evidence.some(e=>e.url===u&&e.from===from)) return;
  entry.evidence.push({url:u,from,fields:asArray(fields).map(String),checkedDate:date});
}
function port(entry,direction,value,scope,from) {
  if (!value || typeof value !== 'string') return;
  const list = entry.connections[direction];
  if (!list.some(x=>x.type===value&&x.scope===scope)) list.push({type:value,scope,from});
}
function addLegacy(entry,row,kind,detail) {
  entry.profiles.push({category:kind,from:LEGACY_PATH,legacyModel:row.model,
    values:deepCopy(row.values||{}),ratings:deepCopy(row.ratings||[]),
    note:row.note||'',details:detail?deepCopy(detail):null});
  addEvidence(entry,row.url,LEGACY_PATH,['catalogue preset']);
  if(detail) addEvidence(entry,detail.reference,COMPARE_PATH,['supplemental specifications'],detail.reviewedOn||null);
  if(kind==='source'&&typeof row.values?.sourceConnection==='string')
    port(entry,'outputs',row.values.sourceConnection,'analogue line output',LEGACY_PATH);
  if(kind==='headphone'&&typeof detail?.connector==='string')
    uniquePush(entry.connections.descriptions, 'Headphone cable/plug (review wording): '+detail.connector);
  for(const [key,val] of Object.entries(row.values||{}))
    if(val===null) uniquePush(entry.review.unknowns,'legacy.'+key);
}
const RESEARCH_METADATA = new Set([
  'id','model','category','role','sourceEvidence','manufacturerSpec','existingPresetRef',
  'comparisonAnchor','editorialNote','evidenceCheckedDate','evidenceTier',
  'price','priceCurrency','priceCheckedDate','availability','ratingsConsensus','roleOfRecord'
]);
function addResearch(entry,row) {
  const fields={};
  for(const [key,value] of Object.entries(row))
    if(!RESEARCH_METADATA.has(key)) fields[key]=deepCopy(value);
  entry.profiles.push({
    category:row.category,from:RESEARCH_PATH,researchId:row.id,
    roles:asArray(row.role),specifications:fields,note:row.editorialNote||''
  });
  entry.comparisonAnchor=entry.comparisonAnchor||row.comparisonAnchor===true;
  addEvidence(entry,row.manufacturerSpec,RESEARCH_PATH,['manufacturer model reference'],row.evidenceCheckedDate);
  for(const ev of asArray(row.sourceEvidence))
    addEvidence(entry,ev.url,RESEARCH_PATH,ev.fields,row.evidenceCheckedDate);
  for(const role of asArray(row.role)) uniquePush(entry.goalTags,'role:'+role);
  for(const kind of asArray(row.outputs))
    port(entry,'outputs',kind,'microphone output',RESEARCH_PATH);
  for(const kind of asArray(row.physicalInputTypes))
    port(entry,'inputs',kind,'computer sound-card input',RESEARCH_PATH);
  for(const kind of asArray(row.physicalOutputTypes))
    port(entry,'outputs',kind,'computer sound-card output',RESEARCH_PATH);
  for(const kind of asArray(row.sourceInputTypes))
    port(entry,'inputs',kind,'headphone amplifier source input',RESEARCH_PATH);
  for(const kind of asArray(row.headphoneOutputTypes))
    port(entry,'outputs',kind,'headphone amplifier output',RESEARCH_PATH);
  if(typeof row.connection==='string')
    uniquePush(entry.connections.descriptions,'Headphone connection (manufacturer wording): '+row.connection);
  for(const [k,v] of Object.entries(fields))
    if(v===null) uniquePush(entry.review.unknowns,'research.'+k);
  // Numeric/boolean facts remain scoped to their exact named capability.
  const keys=[
    'requires48v','micPreampCount','simultaneousAnalogInputs',
    'computerRecordingInputs','computerPlaybackOutputs','hasPhantom48v',
    'directMonitor','loopback','advertisedMixerChannels','usbRecordingMode',
    'hasBuiltInDac','nominalImpedanceOhms','sensitivityDb','sensitivityBasis',
    'outputImpedanceOhms','outputImpedanceCeilingOhms',
    'ratedOutputMilliwatts','maxRateKhz','maxBitDepth'
  ];
  for(const key of keys) if(Object.hasOwn(row,key))
    entry.facts[key]={value:deepCopy(row[key]),scope:row.category,from:RESEARCH_PATH,
      evidenceStatus:row[key]===null?'unknown':'source_stated'};
}
function addBuilder(entry,row) {
  entry.profiles.push({category:row.type,from:'system-builder/supplemental-*.mjs',
    values:deepCopy(row.values||{}),ratings:deepCopy(row.ratings||[]),
    note:row.note||'',details:deepCopy(row.details||{}),evidenceNote:row.evidence||''});
  addEvidence(entry,row.url,'system-builder/supplemental-*.mjs',['builder supplement'],row.details?.reviewedOn||null);
  if(typeof row.details?.connector==='string')
    uniquePush(entry.connections.descriptions,row.details.connector);
}
function sortedEntry(entry) {
  entry.review.unknowns.sort();
  entry.categories.sort();
  entry.goalTags.sort();
  entry.evidence.sort((a,b)=>a.from.localeCompare(b.from)||a.url.localeCompare(b.url));
  return entry;
}
/**
 * Compose without applying guessed facts. Each source profile retains its own
 * measurement basis and product function, including line-out vs headphone-out.
 *
 * The 'same physical device' joins below are EXPLICIT and variant-specific.
 * Do not add fuzzy substring matching or automatically merge same-brand models.
 */
export function composeEquipmentCatalog({
  legacyGear, compareDetails={}, researchCatalog, builderOnly=[]
}) {
  if(!legacyGear || typeof legacyGear!=='object') throw new TypeError('legacyGear required');
  if(!researchCatalog || !Array.isArray(researchCatalog.records)) throw new TypeError('research records required');
  const rows=new Map();
  const lookup=new Map();
  for(const [kind,records] of Object.entries(legacyGear)) {
    if(!TYPES.has(kind)||!Array.isArray(records)) throw new Error('Invalid legacy category '+kind);
    for(const row of records) {
      if(!textValue(row.model)) throw new Error('Missing legacy model');
      const key=kind+'|'+row.model.toLowerCase();
      if(lookup.has(key)) throw new Error('Duplicate legacy model '+key);
      const id='legacy/'+kind+'/'+slug(row.model);
      if(rows.has(id)) throw new Error('Slug collision '+id);
      const entry=createEntry(id,row.model,kind);
      addLegacy(entry,row,kind,compareDetails?.[kind]?.[row.model]);
      rows.set(id,entry);lookup.set(key,id);
    }
  }
  const researchIds=new Set();
  for(const row of researchCatalog.records) {
    if(!textValue(row.id)||!textValue(row.model)||!TYPES.has(row.category))
      throw new Error('Invalid research identity');
    if(researchIds.has(row.id))throw new Error('Duplicate research id '+row.id);
    researchIds.add(row.id);
    const explicit=row.existingPresetRef;
    // Creative: the exact HD model is ONE device with distinct line-in/line-out roles.
    // FiiO: original K11 SE/RCA output vs same product's headphone stage, NOT K11 R2R.
    const sameDevice = row.id==='fiio-k11' ?
      {category:'source',model:'FiiO K11 (RCA line out)'} : explicit;
    let match=null;
    if(sameDevice) {
      match=lookup.get(sameDevice.category+'|'+String(sameDevice.model).toLowerCase());
      if(!match) throw new Error('Missing explicitly linked preset '+row.id);
    } else {
      match=lookup.get(row.category+'|'+row.model.toLowerCase())||null;
    }
    const id=match||'research/'+row.category+'/'+slug(row.id);
    const entry=rows.get(id)||createEntry(id,row.model,row.category);
    addCategory(entry,row.category);
    if(entry.model!==row.model) uniquePush(entry.aliases,row.model);
    addResearch(entry,row);
    rows.set(id,entry);
    lookup.set(row.category+'|'+row.model.toLowerCase(),id);
  }
  for(const row of builderOnly) {
    if(!row||!TYPES.has(row.type)||!textValue(row.model))throw new Error('Invalid builder supplement');
    const key=row.type+'|'+row.model.toLowerCase();
    const existing=lookup.get(key);
    const id=existing||'builder/'+row.type+'/'+slug(row.model);
    const entry=rows.get(id)||createEntry(id,row.model,row.type);
    addCategory(entry,row.type);
    addBuilder(entry,row);
    rows.set(id,entry);
    lookup.set(key,id);
  }
  // Every entry has a cited source and independently scoped source profiles.
  for(const entry of rows.values()){
    if(!entry.evidence.length) throw new Error('Uncited equipment entry '+entry.id);
  }
  const records=[...rows.values()].map(sortedEntry).sort((a,b)=>a.id.localeCompare(b.id));
  const categories={};
  for(const entry of records) for(const cat of entry.categories)
    categories[cat]=(categories[cat]||0)+1;
  return {
    schemaVersion:EQUIPMENT_SCHEMA_VERSION,status:'draft_not_published',
    description:'Generated read-only view. Original specification sources remain authoritative; unknowns are not filled by inference.',
    sources:[LEGACY_PATH,COMPARE_PATH,RESEARCH_PATH,
      'system-builder/supplemental-speakers.mjs',
      'system-builder/supplemental-amplifiers.mjs',
      'system-builder/supplemental-headphones.mjs'],
    summary:{totalModels:records.length,byCategory:categories,
      researchProfiles:researchIds.size,legacyProfiles:Object.values(legacyGear).reduce((s,a)=>s+a.length,0),
      builderSupplementProfiles:builderOnly.length},
    records
  };
}
export function findEquipment(catalog,{model,category}={}) {
  if(!catalog?.records||!textValue(model)) return null;
  const name=model.toLowerCase().trim();
  return catalog.records.find(x=>
    (!category||x.categories.includes(category)) &&
    (x.model.toLowerCase()===name||x.aliases.some(a=>a.toLowerCase()===name))
  )||null;
}
