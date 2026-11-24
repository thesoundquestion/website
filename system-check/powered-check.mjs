import {POWERED_OUTPUT_EVIDENCE,poweredHeadroomEstimate}
  from './powered-headroom-model.mjs';

const query=new URLSearchParams(location.search);
const panel=document.getElementById('sc-powered-check');
const form=document.getElementById('sc-powered-form');
const result=document.getElementById('sc-powered-result');
if(panel&&form&&result&&query.get('powered')==='1'){
  panel.hidden=false;
  document.body.classList.add('sc-powered-mode');
  const intro=document.querySelector('.sc > .lead');
  if(intro)intro.textContent='Estimate how the published acoustic output of powered speakers relates to your listening distance and desired music levels. This is different from matching a passive speaker to an amplifier.';
  const get=name=>form.elements.namedItem(name);
  const model=get('model');
  for(const key of Object.keys(POWERED_OUTPUT_EVIDENCE)){
    const option=document.createElement('option');
    option.value=key;
    option.textContent=key;
    model.append(option);
  }
  const chosen=query.get('model');
  if(chosen&&Object.hasOwn(POWERED_OUTPUT_EVIDENCE,chosen))model.value=chosen;
  const numeric=(key,min,max,fallback)=>{
    const raw=Number(query.get(key));
    return query.has(key)&&Number.isFinite(raw)&&raw>=min&&raw<=max?raw:fallback;
  };
  get('distanceFt').value=String(numeric('distanceFt',.5,300,6));
  get('average').value=String(numeric('average',40,115,65));
  get('gap').value=String(numeric('gap',0,45,15));
  const add=(parent,tag,words,cls)=>{
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    node.textContent=words;
    parent.append(node);
    return node;
  };
  const fmt=n=>Number.isInteger(n)?String(n):n.toFixed(1);
  const signed=n=>(n>=0?'+':'')+fmt(n)+' dB';
  const update=()=>{
    result.replaceChildren();
    const distanceFt=Number(get('distanceFt').value),
      averageDb=Number(get('average').value),
      gap=Number(get('gap').value);
    const target={distanceFt,averageDb,peakDb:averageDb+gap};
    const estimate=poweredHeadroomEstimate(model.value,target);
    if(estimate.status==='invalid'){
      add(result,'p','Enter a valid seat distance and listening-level range.','sc-powered-error');
      return;
    }
    const title=add(result,'h3',model.value+' · '+fmt(distanceFt)+' ft');
    title.className='sc-powered-result-title';
    add(result,'p','Planning level: '+fmt(averageDb)+' dB average / '+fmt(target.peakDb)+' dB peak.','sc-powered-target');
    if(estimate.status==='unverified'){
      if(estimate.practical){
        add(result,'p',estimate.practical.summary,'sc-powered-number');
        add(result,'p','Practical guidance only. No verified numerical dB margin for this distance and listening target.','sc-powered-explain');
        add(result,'p',estimate.practical.evidence,'sc-powered-explain');
      }else{
        add(result,'p','Numeric headroom is not established for this exact model.','sc-powered-number');
        add(result,'p','A published electrical watt rating or speaker size cannot tell us the maximum acoustic output. An independent maximum-SPL test with stated distance and distortion conditions would be needed.','sc-powered-explain');
      }
    }else{
      if(estimate.projectedPeakDb!==null){
        const peak=estimate.projectedPeakDb;
        add(result,'p','Published peak projection at this distance: ~'+fmt(peak)+' dB (one speaker).','sc-powered-number');
        add(result,'p','Margin relative to your selected peak: '+signed(estimate.peakMarginDb)+'.','sc-powered-margin');
      }else add(result,'p','Manufacturer peak SPL reference not available.','sc-powered-explain');
      if(estimate.projectedContinuousDb!==null){
        add(result,'p','Published continuous/reference projection: ~'+
          fmt(estimate.projectedContinuousDb)+' dB at this distance.','sc-powered-number');
        add(result,'p','Margin relative to your average: '+signed(estimate.averageMarginDb)+'.','sc-powered-margin');
      }else add(result,'p','Long-term continuous acoustic output is not established by a comparable measurement.','sc-powered-explain');
      add(result,'p','This is a single-speaker distance projection from manufacturer test figures, not a measured level at your seat. No extra stereo gain, close-range boost or room gain has been added.','sc-powered-explain');
    }
    add(result,'p',estimate.caveat,'sc-powered-caveat');
    if(estimate.source){
      const source=document.createElement('a');
      source.href=estimate.source;
      source.target='_blank';
      source.rel='noopener noreferrer';
      source.textContent=estimate.status==='unverified'?
        'Manufacturer specifications (not a maximum-SPL rating)':
        'Manufacturer acoustic-output specifications';
      result.append(source);
    }
    if(estimate.practical?.reviewUrl){
      const review=document.createElement('a');
      review.href=estimate.practical.reviewUrl;
      review.target='_blank';
      review.rel='noopener noreferrer';
      review.textContent='Independent listening and output evidence';
      result.append(review);
    }
  };
  form.addEventListener('submit',ev=>{ev.preventDefault();update();});
  for(const name of ['model','distanceFt','average','gap'])
    get(name).addEventListener('change',update);
  update();
}
