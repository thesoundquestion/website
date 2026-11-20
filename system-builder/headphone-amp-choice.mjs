/**
 * Headphone-amp choice is a purchase preference, not evidence that extra
 * amplification sounds better. Only manufacturer-linked catalogue records
 * can become named amp/DAC examples. Never infer load-specific drive matches.
 */
const ROUTES=Object.freeze({
  unknown:{label:'your music source',mode:null},
  phone_usb:{label:'your USB-audio phone or tablet',mode:'usb',id:'research/headphone_amplifier/fiio-q11'},
  computer_usb:{label:'your USB-audio computer',mode:'usb',id:'legacy/source/fiio-k11-rca-line-out'},
  analog_line:{label:'your player or DAC with an RCA line output',mode:'analog',id:'research/headphone_amplifier/jds-atom-amp-2'},
  headphone_jack:{label:'your phone or computer headphone socket',mode:'headphone'},
  receiver_headphones:{label:'your receiver headphone socket',mode:'headphone'}
});
const CHOICES=new Set(['yes','no','unsure']);
const sourceRoute=key=>ROUTES[key]||ROUTES.unknown;
const sourceCheck=route=>route.mode==='usb'
  ?'Confirm the phone/computer supports USB audio and the correct USB connector or adapter; the amplifier must provide a proper headphone socket.'
  :route.mode==='analog'
    ?'Confirm the source provides a true analogue RCA line output, not speaker terminals or a digital-only connector.'
    :route.mode==='headphone'
      ?'A headphone socket already includes amplification. Test drive, noise and low-volume control before buying another; do not connect it to a separate amp without checking gain/line-level routing.'
      :'Identify a real USB digital-audio output, analogue line output or suitable headphone socket before choosing an amp.';
export function headphoneAmplifierPlan(request={},catalog=null){
  const choice=CHOICES.has(request.headphoneAmpChoice)?request.headphoneAmpChoice:'';
  if(!choice)return null;
  const route=sourceRoute(request.headphoneSource);
  const check=sourceCheck(route);
  if(choice==='no')return {choice,sourceLabel:route.label,model:null,check,
    summary:'No separate headphone amplifier requested. '+
      (route.mode==='analog'
        ?'An RCA line output alone cannot drive headphones. Use a device with a proper volume-controlled headphone output instead. '
        :route.mode==='usb'
          ?'A USB-only source needs a compatible USB audio headphone adapter or DAC/headphone-output device; no dedicated separate amplifier is included. '
          :'Use an existing suitable headphone output. ')+check};
  if(choice==='unsure')return {choice,sourceLabel:route.label,model:null,check,
    summary:(route.mode==='analog'
      ?'An RCA-only line output needs a headphone amplifier somewhere in the signal path. '
      :route.mode==='usb'
        ?'A USB-only source needs a device that provides an actual headphone output, potentially a small USB DAC/amp. '
        :'A separate headphone amplifier is not automatically needed. ')+check+
      ' Check headphone sensitivity, impedance and required listening-level output, as well as hiss and low-volume channel balance, before deciding.'};
  const record=route.id&&catalog?.records?.find(r=>
    r.id===route.id&&r.categories?.includes('headphone_amplifier')&&
    r.evidence?.some(e=>typeof e.url==='string'&&e.url.startsWith('https://')));
  const url=record?.evidence?.find(e=>typeof e.url==='string'&&e.url.startsWith('https://'))?.url||null;
  if(record&&url){
    const hasDac=record.facts?.hasBuiltInDac?.value===true;
    // A USB path must include actual conversion. RCA uses analogue-only amp.
    if((route.mode==='usb'&&hasDac)||(route.mode==='analog'&&!hasDac)){
      return {choice,sourceLabel:route.label,model:record.model,sourceUrl:url,
        input:route.mode==='usb'?'usb':'rca',hasDac,check,
        summary:'Headphone amplifier requested: '+record.model+
          (hasDac?' (USB DAC + headphone amplifier).':' (analogue headphone amplifier).')+
          ' This is a documented source-connection example; exact headphone drive, noise floor, plugs and current regional price are still to be checked. '+check};
    }
  }
  return {choice,sourceLabel:route.label,model:null,check,
    summary:'You asked to include a headphone amplifier. '+check+
      ' No specific model is shown until a compatible input path is established; a DAC or a headphone amplifier may be needed depending on the source.'};
}
export function applyHeadphoneAmpChoice(shortlist={},request={},catalog=null){
  const plan=headphoneAmplifierPlan(request,catalog);
  if(!plan||!Array.isArray(shortlist.selected))return shortlist;
  return {...shortlist,selected:shortlist.selected.map(item=>{
    if(item.architecture!=='headphone_first')return item;
    const extra=plan.choice==='yes'
      ?[plan.check,'Verify the exact headphone impedance/sensitivity, plug, required level, output noise and gain before considering the proposed amplifier a matched purchase.']
      :[plan.check];
    const part=plan.model?[{name:plan.model,count:1,
      role:plan.hasDac?'New USB DAC and headphone amplifier; check input and headphone output':'New analogue headphone amplifier; requires a suitable RCA line output',
      url:plan.sourceUrl}]:[];
    return {...item,headphoneAmpPlan:plan,parts:[...(item.parts||[]),...part],
      extra:[...(item.extra||[]),...extra],
      tradeoff:(item.tradeoff||'')+
        (plan.model?' This separate amplifier has not been proven necessary or compatible with these exact headphones; its current price is not included in the headphone subtotal.':'')};
  })};
}
