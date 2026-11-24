import {OUTPUT_SCENARIOS,estimateOutputScenario}
  from './illustrative-output-scenarios.mjs';
import {loadEquipmentCatalog} from '../equipment/catalog-client.mjs';

const query=new URLSearchParams(location.search);
const panel=document.getElementById('sc-provisional-check');
const form=document.getElementById('sc-provisional-form');
const result=document.getElementById('sc-provisional-result');
const scenario=OUTPUT_SCENARIOS[query.get('scenario')]||null;
if(panel&&form&&result&&scenario){
  (async()=>{
  panel.hidden=false;
  document.body.classList.add('sc-provisional-mode');
  const intro=document.querySelector('.sc > .lead');
  if(intro)intro.textContent='A clearly labelled estimate for an amplifier whose published output rating is not a validated continuous-power measurement. Explore the assumptions instead of accepting an unqualified number.';
  const get=name=>form.elements.namedItem(name);
  const num=(key,min,max,fallback)=>{
    const n=Number(query.get(key));
    return query.has(key)&&Number.isFinite(n)&&n>=min&&n<=max?n:fallback;
  };
  get('distanceFt').value=String(num('distanceFt',0.5,300,6));
  get('average').value=String(num('average',40,115,65));
  get('gap').value=String(num('gap',0,45,15));
  document.getElementById('sc-provisional-models').textContent=
    scenario.amplifierModel+' + '+scenario.speakerModel+
      ' · supplied '+scenario.supply;
  let values=null;
  let catalogFailure=null;
  try{
    const catalog=await loadEquipmentCatalog({
      url:'/equipment/catalog.generated.json?v=provisional-bt20a-20261121'
    });
    const speaker=catalog.records?.find(x=>x.model===scenario.speakerModel&&
      x.categories?.includes('speaker'));
    const profile=speaker?.profiles?.find(x=>x.category==='speaker'&&
      Number.isFinite(x.values?.sensitivity)&&x.values?.basis);
    values=profile?.values||null;
  }catch(err){
    catalogFailure=err;
    console.warn('[System Check] Provisional speaker catalog unavailable',err);
  }
  const add=(parent,tag,value,cls)=>{
    const node=document.createElement(tag);
    node.textContent=value;
    if(cls)node.className=cls;
    parent.append(node);
    return node;
  };
  const fmt=x=>Number.isInteger(x)?String(x):x.toFixed(1);
  const signed=x=>(x>=0?'+':'')+fmt(x)+' dB';
  const update=()=>{
    result.replaceChildren();
    const distanceFt=Number(get('distanceFt').value);
    const averageDb=Number(get('average').value);
    const gap=Number(get('gap').value);
    const peakDb=averageDb+gap;
    add(result,'h3',scenario.title,'sc-provisional-result-title');
    add(result,'p','Assumed output: about '+scenario.wattsPerChannel+
      ' W/channel into '+scenario.loadOhms+' Ω on '+scenario.supply+
      '. Test duration and distortion criterion are not fully confirmed.',
      'sc-provisional-evidence');
    const x=estimateOutputScenario(scenario,values,
      {distanceFt,averageDb,peakDb});
    if(x.status==='provisional'){
      add(result,'p','Illustrative one-speaker level at '+fmt(distanceFt)+
        ' ft: approximately '+fmt(x.projectedDb)+' dB SPL.',
        'sc-provisional-number');
      add(result,'p','Against your '+fmt(peakDb)+' dB musical peak: '+
        signed(x.peakMarginDb)+' indicative margin.',
        'sc-provisional-margin');
      add(result,'p','This does not prove the output is clean or sustainable, and it is not a prediction of your actual room SPL. Real speaker impedance, bass, clipping and the supply can reduce the usable margin.',
        'sc-provisional-explain');
    }else{
      add(result,'p',x.status==='invalid'?
        'Enter a valid listening distance and target levels.':
        'A source-backed speaker sensitivity is unavailable, so this estimate cannot be calculated.',
        'sc-provisional-error');
    }
    if(catalogFailure)add(result,'p','The speaker catalogue did not load, so no sensitivity was inferred.','sc-provisional-error');
    add(result,'p',scenario.notes,'sc-provisional-caveat');
    const refs=add(result,'div','','sc-provisional-sources');
    for(const source of scenario.sources){
      const a=document.createElement('a');
      a.textContent=source.label;
      a.href=source.url;
      a.target='_blank';
      a.rel='noopener noreferrer';
      refs.append(a);
    }
  };
  form.addEventListener('submit',ev=>{ev.preventDefault();update();});
  for(const key of ['distanceFt','average','gap'])
    get(key).addEventListener('change',update);
  update();
  })().catch(err=>console.warn('[System Check] Provisional mode failed:',err));
}
