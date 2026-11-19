/**
 * Explicit, optional transfer of small non-identifying setup choices from
 * Find My Setup to the Listening Builder. Not a compatibility solver.
 * Never include entered product names, prices, locations or free-form notes.
 */
const choices=Object.freeze({
  match:{owned:['both','amp','speakers','unsure'],speakerType:['passive','powered','unsure']},
  vinyl:{phono:['yes','no','unsure'],speakers:['powered','passive','receiver','unsure']},
  digital:{player:['computer','streamer','cd','phone'],listen:['receiver','powered','passive','unsure']},
  improve:{problem:['bass','space','harsh','general'],gear:['passive','powered','headphones','unsure']},
  hifi:{focus:['imaging','vocals','bass','overall','unsure'],gear:['full','amp','speakers','none','unsure'],seat:['desk','chair','several','unsure']},
  headphones:{use:['home','noisy','create','gaming'],source:['phone','computer','receiver','unsure']},
  tv:{problem:['dialogue','movie','game','general'],system:['tv','soundbar','stereo','unsure']}
});
const valid=(id,answers)=>Boolean(choices[id]&&Object.entries(choices[id]).every(([key,allowed])=>allowed.includes(answers?.[key])));
export function guideBuilderHref(id,answers){
  if(!valid(id,answers))return '/system-builder/';
  const p=new URLSearchParams({from:'find-my-setup',intent:id});
  for(const key of Object.keys(choices[id]))p.set(key,answers[key]);
  return '/system-builder/?'+p.toString();
}
export function guideBuilderContext(query){
  const p=query instanceof URLSearchParams?query:new URLSearchParams(query);
  if(p.get('from')!=='find-my-setup'||p.getAll('intent').length!==1)return null;
  const intent=p.get('intent');
  const options=choices[intent];
  if(!options)return null;
  const answers={};
  for(const [key,allowed] of Object.entries(options)){
    if(p.getAll(key).length!==1||!allowed.includes(p.get(key)))return null;
    answers[key]=p.get(key);
  }
  const prefill={};
  let title='',summary='',checks=[];
  if(intent==='match'){
    title='Match your existing amplifier and speakers';
    const powered=answers.speakerType==='powered';
    if(powered)prefill.architecture='consumer_powered_pair';
    if(answers.speakerType==='passive')prefill.architecture='passive_separates';
    summary=answers.owned==='amp'?'You told us you have an amplifier. Enter its exact model under What can you keep?, and find speakers that fit its documented limits.':
      answers.owned==='speakers'?'You told us you have speakers. Enter their exact model, then investigate a suitable amplifier if they are passive.':
      answers.owned==='both'?'You told us you own both pieces. Enter their exact models so the Builder can work around them.':
      'Identify whether the speakers are powered or passive, then enter the actual models where known.';
    checks=powered?[
      'Powered speakers contain amplification: never connect an external amplifier’s speaker terminals to their line-level inputs.',
      'The Builder does not certify your exact source connection; verify the input and volume control.'
    ]:[
      'System Check is the separate tool for published amplifier ratings, speaker sensitivity and estimated listening headroom.',
      'An amplifier rating at nominal ohms does not certify minimum-impedance, phase or thermal compatibility.'
    ];
  }else if(intent==='vinyl'){
    title='Build around your vinyl source';
    prefill.architecture=answers.speakers==='powered'?'consumer_powered_pair':
      ['passive','receiver'].includes(answers.speakers)?'passive_separates':'open';
    summary=answers.phono==='yes'?'Your turntable has a stated LINE output. Check the receiving input before adding a second phono stage.':
      answers.phono==='no'?'Your turntable has a raw phono output. You need an appropriate phono stage, either separately or in a matching PHONO input.':
      'We have not established whether your turntable contains a phono stage. Confirm the exact model and output mode first.';
    checks=[
      'This version of the Listening Builder does NOT include or price a turntable, cartridge or phono preamp in its complete-system examples.',
      'Use powered speakers with line input or passive speakers with a suitable amplifier; verify the entire source and volume path.',
      'Do not feed a LINE output through another PHONO stage, or a raw phono cartridge directly to an ordinary line input.'
    ];
  }else if(intent==='digital'){
    title='Connect your existing digital music source';
    prefill.architecture=answers.listen==='powered'?'consumer_powered_pair':
      ['receiver','passive'].includes(answers.listen)?'passive_separates':'open';
    const player={computer:'computer',streamer:'streamer',cd:'CD player',phone:'phone or tablet'}[answers.player];
    summary='You want to use your '+player+'. Keep it if an appropriate output can connect to your chosen listening equipment.';
    checks=[
      'The Builder does not verify a particular digital interface, adapter, DAC or protocol automatically.',
      'A suitable analogue source output or matching built-in digital input may make a separate DAC unnecessary.',
      'An analogue-only input cannot accept a digital-only output through a passive cable.'
    ];
  }else if(intent==='improve'){
    title='Improve your existing listening system before buying';
    if(answers.gear==='headphones')prefill.architecture='headphone_first';
    else if(answers.gear==='powered')prefill.architecture='consumer_powered_pair';
    else if(answers.gear==='passive')prefill.architecture='passive_separates';
    prefill.goal=answers.problem==='bass'?'bass':answers.problem==='space'?'imaging':'all_rounder';
    summary='Enter the models you already own so the Builder can consider keeping them. Your earlier symptom alone does not diagnose faulty electronics.';
    checks=[
      'Compare the same recording at a safe, repeatable level, and check placement, room or headphone fit before purchasing.',
      'The Builder cannot identify the cause of muddy, narrow or congested sound from a descriptive answer alone.'
    ];
  }else if(intent==='hifi'){
    title='Build or improve your home listening system';
    prefill.goal=answers.focus==='imaging'?'imaging':answers.focus==='vocals'?'natural':answers.focus==='bass'?'bass':'all_rounder';
    if(answers.seat==='desk')prefill.useCase='desk';
    summary=answers.gear==='none'?'You are starting from scratch. Consider a complete system, not just one component.':
      'Use the owned-equipment fields to keep what you have and assess missing parts before spending.';
    checks=[
      'No actual model details were passed from the guide. Add exact models where known.',
      'Room placement and source connections matter even when the amplifier and speakers are suitable.'
    ];
  }else if(intent==='headphones'){
    title='Find a headphone setup for your listening needs';
    prefill.architecture='headphone_first';
    prefill.headphoneUse=answers.use==='noisy'?'commute':answers.use==='gaming'?'gaming':answers.use==='create'?'studio':'quiet';
    summary='Explore a headphone listening route without assuming you need to purchase a separate DAC or amplifier.';
    checks=['Verify the headphone output, plug, available output level and comfort/fit on your actual source.'];
  }else if(intent==='tv'){
    title='Explore a listening system for television';
    summary='Keep the television output and receiver or speaker inputs in mind. HDMI is not automatically ARC/eARC-compatible.';
    checks=['Check optical, HDMI ARC/eARC, analogue outputs, supported audio formats and volume control before buying.'];
  }
  return {intent,answers,prefill,title,summary,checks};
}
