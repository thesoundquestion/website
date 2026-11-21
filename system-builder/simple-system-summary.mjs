/**
 * A concise, source-conscious presentation model for a visitor assembling a
 * complete system without owned equipment. The existing shortlist is still
 * the authority for filtering, order, budget, connections and sources.
 * This layer makes no acoustic measurements or new compatibility claims.
 */
const SPACE={
  living_room:'living room',bedroom:'bedroom',desk:'desk / nearfield',
  outdoors:'outdoor space',party:'gathering'
};
const FOCUS={
  all_rounder:'balanced everyday listening',
  natural:'natural vocals and instruments',
  imaging:'imaging and spaciousness',
  bass:'bass impact',
  dynamic:'musical dynamics',
  low_volume:'quiet listening',
  party:'music for a gathering'
};
export const friendlySystemName=item=>String(item?.title||'System option')
  .replace(/^[^:]{3,55}:\s*/,'');
export const namedSystemParts=item=>(item?.parts||[])
  .filter(p=>typeof p?.name==='string'&&p.name.trim())
  .map(p=>(p.count>1?p.count+' × ':'')+p.name.trim());
export function explainSimpleSystem(item={},request={},isFirst=false){
  const room=SPACE[request.useCase]||'listening space';
  const focus=FOCUS[request.goal]||'music listening';
  const distance=Number.isFinite(request.distanceFt)&&request.distanceFt>0
    ?' at '+request.distanceFt+' ft':'';
  const fitsGoal=Array.isArray(item.goals)&&item.goals.includes(request.goal);
  const fitsRoom=Array.isArray(item.places)&&item.places.includes(request.useCase);
  const place=fitsRoom?room+' listening'+distance:'a different system approach';
  const context=isFirst
    ?(fitsGoal?'This is the first example for '+focus+' in '+place+'. '
      :'This is one option to explore for '+place+'. ')
    :(fitsGoal?'Also listed for '+focus+' in '+place+'. '
      :'Another system approach for '+place+'. ');
  const reason=String(item.why||'').trim();
  const why=context+(reason||'It is a system idea, not an exact performance match.');
  const connection={
    passive_separates:'Connect the music source to the amplifier, then connect the amplifier to the passive speakers with speaker wire.',
    consumer_powered_pair:'Connect a compatible music source to the powered pair. The speakers already contain the amplification.',
    active_studio:'Connect a suitable stereo source and volume control to both powered monitors. Each monitor needs mains power.',
    headphone_first:'Connect to a suitable headphone output on your music player. A separate headphone amplifier is not automatically required.',
    party_pa:'Connect your music source to the powered PA or mixer, and check the available power and number of speakers.'
  }[item.architecture]||'Confirm the source, amplifier and speakers form a connected system.';
  const important=item.connectionStatus==='adapter_needed'
    ?'Your selected source needs an extra connection or converter.'
    :item.ownershipBlocker||item.loadCaution||item.sourceCaution||'';
  return {
    title:friendlySystemName(item),why,connection,
    parts:namedSystemParts(item),
    important:String(important||'').trim(),
    tradeoff:String(item.tradeoff||'').trim(),
    soundTarget:item.soundTarget||item.speakerModel||item.curatedPairing?.speakerModel||null,
    headroomStatus:item.headroomData?.status||'not_applicable',
    headroomMissing:item.headroomData?.missing||[],
    priceDate:item.priceDate||null,
    priceStatus:item.pricingStatus||null,
    subtotal:Number.isFinite(item.subtotal)?item.subtotal:null
  };
}
