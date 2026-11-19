/** Manufacturer-linked catalogue headphone examples, not acoustic rankings.
 * The fitting/isolation information is deliberately qualitative. No invented
 * sensitivity comparison, drive capability, retail price or tonal grading. */
const HEADPHONES=Object.freeze({
 'builder/headphone/fiio-ft1':{fit:'closed',use:'home',maker:'FiiO'},
 'builder/headphone/koss-ksc75':{fit:'open',use:'quiet',maker:'Koss'},
 'builder/headphone/koss-porta-pro-wired':{fit:'open',use:'quiet',maker:'Koss'},
 'legacy/headphone/audio-technica-ath-m50x':{fit:'closed',use:'tracking',maker:'Audio-Technica'},
 'legacy/headphone/beyerdynamic-dt-770-pro-80':{fit:'closed',use:'tracking',maker:'beyerdynamic'},
 'legacy/headphone/grado-sr60x':{fit:'open',use:'quiet',maker:'Grado'},
 'legacy/headphone/grado-sr80x':{fit:'open',use:'quiet',maker:'Grado'},
 'legacy/headphone/moondrop-chu-ii':{fit:'iem',use:'portable',maker:'Moondrop'},
 'legacy/headphone/sennheiser-hd-560s':{fit:'open',use:'quiet',maker:'Sennheiser'},
 'legacy/headphone/sennheiser-hd-600':{fit:'open',use:'quiet',maker:'Sennheiser'},
 'legacy/headphone/shure-se215':{fit:'iem',use:'portable',maker:'Shure'},
 'legacy/headphone/sony-mdr-7506':{fit:'closed',use:'tracking',maker:'Sony'},
 'research/headphone/akg-k371':{fit:'closed',use:'tracking',maker:'AKG'},
 'research/headphone/audio-technica-ath-m40x':{fit:'closed',use:'tracking',maker:'Audio-Technica'},
 'research/headphone/shure-srh440a':{fit:'closed',use:'tracking',maker:'Shure'}
});
const label={open:'Open-backed / open-air',closed:'Closed-back',iem:'In-ear'};
const reason={
 open:'Open designs are worth auditioning in a quiet place. They leak sound and do not isolate you from nearby noise. Width or accuracy cannot be inferred from the enclosure alone.',
 closed:'Closed-back construction can help reduce sound leaking out during recording and noise getting in. Isolation, comfort and tonal balance still vary between individual models.',
 iem:'In-ear monitoring is compact and can suit travel or shared spaces if the tips fit well. Seal, comfort, hygiene and listening level deserve particular attention.'
};
const roomSet=['desk','bedroom','living_room','outdoors'];
const goalTags=['all_rounder']; // never infer subjective bass, imaging or timbre from category
const known=(r)=>HEADPHONES[r.id]||null;
const fitRequested=v=>['open','closed','iem'].includes(v)?v:'any';
export function catalogHeadphoneExamples(catalog,request={}){
 if(!Array.isArray(catalog?.records))return [];
 const fit=fitRequested(request.headphoneFit);
 const context=String(request.headphoneUse||'quiet');
 const list=catalog.records.filter(r=>r.categories?.includes('headphone')&&known(r)
   &&(fit==='any'||known(r).fit===fit))
   .map(r=>{
    const info=known(r);
    const suitableUse=context==='tracking'?info.fit==='closed':
      context==='shared'?info.fit!=='open':
      context==='portable'?info.fit==='iem':
      info.fit==='open';
    const headEvidence=r.evidence?.find(e=>/^https:\/\//.test(e.url))?.url||null;
    return {r,info,score:(suitableUse?20:0)+(info.use==='tracking'&&context==='tracking'?6:0)
      +(info.use==='portable'&&context==='portable'?6:0)+
      (r.id.startsWith('research/')?1:0),source:headEvidence};
   }).sort((a,b)=>b.score-a.score||a.r.id.localeCompare(b.r.id));
 const selected=[];
 // Diversity applies only when fit is flexible. Exact fit requests stay strict.
 while(list.length&&selected.length<5){
  const next=list.map((x,i)=>({x,i,weight:x.score+
    (fit==='any'&&!selected.some(y=>y.info.fit===x.info.fit)?10:0)+
    (!selected.some(y=>y.info.maker===x.info.maker)?3:0)}))
    .sort((a,b)=>b.weight-a.weight||a.i-b.i)[0];
  selected.push(next.x);list.splice(next.i,1);
 }
 return selected.map(({r,info,source})=>({
   id:'catalog-'+r.id,catalogId:r.id,architecture:'headphone_first',
   title:label[info.fit]+': '+r.model,kind:label[info.fit]+' wired headphones',
   places:roomSet,power:'source_dependent',connections:['analog'],goals:goalTags,
   parts:[{name:r.model,count:1,role:'Headphones only. A compatible, volume-controlled headphone output is needed.',url:source}],
   why:reason[info.fit],
   headphoneRationale:(context==='tracking'&&info.fit==='closed'?
     'Closed-back monitoring is a practical starting point near a live microphone. ':
     context==='shared'&&info.fit!=='open'?'This avoids open-back sound leakage in a shared room. ':
     context==='portable'&&info.fit==='iem'?'An in-ear option for compact listening. ':
     'A different physical wearing style to compare. ')+
     'This is not a measured claim about frequency balance, isolation amount or sound quality.',
   tradeoff:'Verify comfort, return policy, cable/plug, your source output and the real local total cost. Published impedance alone cannot determine volume or amplifier requirements.',
   extra:[source?'Manufacturer/source facts are linked for this exact model.':'Model-specific connection and specifications need confirmation.',
    'Try the seal or fit and compare at a safe matched listening level; do not assume a dedicated headphone amplifier is required.']
 }));
}
