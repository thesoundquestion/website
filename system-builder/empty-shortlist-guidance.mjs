/**
 * User-facing explanation when a curated, safety-gated example shortlist is
 * empty. This is guidance, not a new recommendation or an implied certified
 * compatibility path. Only give a specific reason supported by request fields
 * and verified shortlist exclusions.
 */
const connectionLabels=Object.freeze({
  hdmi:'HDMI',optical:'optical digital',usb:'USB audio',
  bluetooth:'Bluetooth',analog:'analogue audio'
});
const architectureLabels=Object.freeze({
  passive_separates:'a passive speaker and amplifier system',
  consumer_powered_pair:'a powered stereo pair',
  active_studio:'a pair of powered studio monitors',
  headphone_first:'headphones',
  party_pa:'a powered event/PA system'
});
const meaningful=x=>typeof x==='string'&&x.trim()?x.trim():null;

export function explainEmptyExampleShortlist(request={},shortlist={}){
  const reason=[];
  const actions=[];
  const excluded=Array.isArray(shortlist.excluded)?shortlist.excluded:[];
  const rejected=excluded.map(x=>String(x?.reason||'')).join(' ');
  const connection=meaningful(request.connection);
  const arch=meaningful(request.architecture);
  const wanted=connection&&connection!=='undecided'?connectionLabels[connection]||connection:null;
  const budget=Number.isFinite(request.budget)&&request.budget>=0?request.budget:null;
  const currency=['CAD','USD','GBP','EUR','AUD'].includes(request.currency)?request.currency:'local currency';

  if(request.power==='battery' && arch&&['passive_separates','consumer_powered_pair','active_studio'].includes(arch)){
    reason.push('Battery-only operation is required, but this type of home stereo normally depends on mains electricity.');
    actions.push('Choose a documented battery-powered PA option or permit mains power if your location has a suitable outlet.');
  }
  if(wanted && (/No documented direct .* input/.test(rejected)||connection==='hdmi')){
    reason.push('None of the shortlisted '+(architectureLabels[arch]||'systems')+
      ' has a documented direct '+wanted+' input for the source you selected.');
    actions.push('Check which other outputs your music source actually provides, then select one of those inputs.');
    if(connection==='hdmi')
      actions.push('An HDMI audio extractor or compatible receiver is a separate purchase and requires its own format, volume-control, connection and price checks.');
  }
  if(budget!==null && request.budgetStrict!==false &&
      (/budget|over the limit|above the limit|exceeds/i.test(rejected)||budget<180)){
    reason.push('No complete setup has been verified within your '+currency+' '+budget+' spending limit. Unpriced parts are not assumed free.');
    actions.push('Increase the budget, consider a different system type, or compare a separately verified used listing.');
  }
  if(!reason.length)
    reason.push('We do not have a verified, ready-to-connect example satisfying all these selections in the current catalog. That does not prove suitable equipment does not exist.');
  if(!actions.length)
    actions.push('Change one requirement at a time, or search for the exact equipment specifications before attempting a different connection.');
  return {
    title:'No verified complete-system match yet',
    reason:reason.slice(0,2),
    actions:actions.slice(0,3),
    excludedCount:excluded.length
  };
}
