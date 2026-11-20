import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const helper=readFileSync(new URL('../assets/lab-instant-switch.js',import.meta.url),'utf8');
const mixing=readFileSync(new URL('../assets/mixing-lab.js',import.meta.url),'utf8');
const mixingHtml=readFileSync(new URL('../lab/index.html',import.meta.url),'utf8');
const masteringHtml=readFileSync(new URL('../lab/mastering/index.html',import.meta.url),'utf8');

function setup({fail=false,oversize=false}={}){
  const fetches=[],starts=[],stops=[],fades=[];
  let ctx;
  class Param{
    constructor(){this.value=0}
    setValueAtTime(value){this.value=value}
    cancelScheduledValues(){}
    cancelAndHoldAtTime(){}
    linearRampToValueAtTime(value,at){this.value=value;fades.push({value,at})}
  }
  class Source{
    connect(){}
    disconnect(){}
    start(when,offset,duration){starts.push({when,offset,duration})}
    stop(){stops.push(this)}
  }
  class Gain{
    constructor(){this.gain=new Param()}
    connect(){}
    disconnect(){}
  }
  class AudioContext{
    constructor(){this.state='suspended';this.currentTime=0;this.destination={};ctx=this}
    resume(){this.state='running';return Promise.resolve()}
    close(){this.state='closed';return Promise.resolve()}
    createBufferSource(){return new Source()}
    createGain(){return new Gain()}
    decodeAudioData(){return Promise.resolve({
      length:oversize?10*1024*1024:40*44100,
      duration:40,
      numberOfChannels:2
    })}
  }
  const window={AudioContext,fetch:()=>{}};
  const fetch=async(url,{signal})=>{
    fetches.push({url,signal});
    if(fail)throw Error('Network unavailable');
    return {ok:true,headers:{get:()=>null},arrayBuffer:async()=>new ArrayBuffer(256)};
  };
  runInNewContext(helper,{window,fetch,AbortController,console,Map,Set});
  return {engine:new window.TSQLabInstantSwitch(),ctx:()=>ctx,fetches,starts,stops,fades};
}
const three=[
  {key:'narrow',url:'https://audio.example/narrow.flac',gain:1},
  {key:'reference',url:'https://audio.example/reference.flac',gain:1},
  {key:'polished',url:'https://audio.example/polished.flac',gain:1}
];

test('both labs expose optional Prepare, readiness, progress and fallback, not autoplay',()=>{
  for(const page of [mixingHtml,masteringHtml]){
    assert.match(page,/id="prepareInstant"/);
    assert.match(page,/id="instantReadiness"/);
    assert.match(page,/id="instantProgress"/);
    assert.match(page,/src="\/assets\/lab-instant-switch\.js"/);
    assert.match(page,/Prepare instant switching \(optional\)/);
    assert.doesNotMatch(page,/<audio[^>]+src=/i);
  }
  assert.match(mixing,/engine\.prepare\(\{/);
  assert.match(mixing,/if\(instant\.prepared\)\{engine\.seek\(/);
  assert.match(mixing,/clearInstant\(\)/);
  assert.match(masteringHtml,/const trackList=MODES\[mode\]\.items/);
  assert.match(masteringHtml,/if\(instant\.prepared\)\{engine\.seek\(/);
  assert.match(masteringHtml,/if\(instant\.prepared\|\|instant\.preparing\)clearInstant\(\)/);
});

test('three mixing files download only on prepare and start on one audio clock',async()=>{
  const {engine,fetches,starts}=setup();
  assert.equal(fetches.length,0);
  assert.equal(await engine.prepare({id:'mixing',sources:three,duration:30}),true);
  assert.equal(fetches.length,3);
  engine.select('reference');
  engine.play();
  assert.equal(starts.length,3);
  assert.equal(new Set(starts.map(x=>x.when)).size,1);
  assert.equal(new Set(starts.map(x=>x.offset)).size,1);
  engine.dispose();
});

test('rapid A/B/C changes only fade gains, without restarting or fetching',async()=>{
  const {engine,ctx,starts,stops,fetches,fades}=setup();
  await engine.prepare({id:'mixing',sources:three,duration:30});
  engine.play();
  ctx().currentTime=3;
  const at=engine.position();
  const startCount=starts.length,stopCount=stops.length;
  engine.select('reference');
  engine.select('polished');
  engine.select('narrow');
  assert.equal(fetches.length,3);
  assert.equal(starts.length,startCount);
  assert.equal(stops.length,stopCount);
  assert.equal(engine.position(),at);
  assert.ok(fades.length>=9);
  engine.dispose();
});

test('mastering EQ needs only two decoded tracks',async()=>{
  const {engine,fetches,starts}=setup();
  const sources=[
    {key:'eq:off',url:'https://audio.example/eq-off.flac'},
    {key:'eq:on',url:'https://audio.example/eq-on.flac'}
  ];
  assert.equal(await engine.prepare({id:'eq',sources,duration:40}),true);
  assert.equal(fetches.length,2);
  engine.select('eq:on');
  engine.play();
  assert.equal(starts.length,2);
  engine.dispose();
});

test('seeking and pausing preserve a common offset across all tracks',async()=>{
  const {engine,starts,ctx}=setup();
  await engine.prepare({id:'mixing',sources:three,duration:30});
  engine.play();
  ctx().currentTime=5;
  engine.seek(17);
  assert.equal(engine.isPlaying(),true);
  assert.deepEqual(starts.slice(-3).map(x=>x.offset),[17,17,17]);
  engine.pause();
  const at=engine.position();
  engine.play();
  assert.ok(starts.slice(-3).every(x=>Math.abs(x.offset-at)<1e-8));
  engine.dispose();
});

test('network or memory failure rejects preparation, leaving native player as fallback',async()=>{
  for(const options of [{fail:true},{oversize:true}]){
    const {engine}=setup(options);
    await assert.rejects(()=>engine.prepare({id:'mixing',sources:three,duration:30}));
    assert.equal(engine.isReady(),false);
    engine.dispose();
  }
});

test('clear cancels old prepared state before changing experiment or local file',async()=>{
  const {engine}=setup();
  await engine.prepare({id:'mixing',sources:three,duration:30});
  engine.play();
  engine.clear();
  assert.equal(engine.isReady(),false);
  assert.equal(engine.isPlaying(),false);
  assert.equal(engine.position(),0);
  engine.dispose();
});
