import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const js=readFileSync(new URL('../system-check/calculator.js',import.meta.url),'utf8');
const begin=js.indexOf('function renderConnections(');
const end=js.indexOf('\nfunction powerPercent(',begin);
assert.ok(begin>=0&&end>begin);
const src=js.slice(begin,end);

function render(values={},ratings=[],volts=3.68,load=8){
 const printed=[];
 const context={
  num:name=>values[name]??NaN,
  show:n=>new Intl.NumberFormat('en-CA',{maximumSignificantDigits:3}).format(n),
  db:n=>n.toFixed(1),
  addText:(tag,msg)=>printed.push({tag,msg}),
  Math,Number
 };
 const fn=runInNewContext(src+'\nrenderConnections',context);
 fn(volts,ratings,load);
 return printed.map(x=>x.msg).join(' ');
}

test('complete amplifier and source specifications get one useful plain-language answer',()=>{
 const message=render({
  sourceVoltage:2,inputSensitivity:1,
  sourceZ:50,inputZ:47,
  outputZ:0.07,minimum:3.7
 },[{type:'continuous',load:8,watts:105}]);
 assert.match(message,/Source and amplifier connection/);
 assert.match(message,/Your source should provide enough signal/);
 assert.doesNotMatch(message,/Enter both|unverified|0\.4 dB|3\.7 Ω|Look for a source/);
});

test('missing impedance values do not trigger a prompt or generic warning',()=>{
 const message=render({sourceVoltage:2,inputSensitivity:1},
  [{type:'continuous',load:8,watts:105}]);
 assert.match(message,/should provide enough signal/);
 assert.doesNotMatch(message,/impedance|unverified|check the manual/i);
});

test('without sufficient source and gain/sensitivity data, omit unhelpful section',()=>{
 const message=render({sourceVoltage:2,sourceZ:50,outputZ:0.1,minimum:3.7});
 assert.equal(message,'');
});

test('an actual source shortfall gets a concise explanation',()=>{
 const message=render({sourceVoltage:0.05,inputSensitivity:1},
  [{type:'continuous',load:8,watts:105}]);
 assert.match(message,/may not provide enough signal/);
 assert.doesNotMatch(message,/Enter both|unverified/);
});

test('significant, calculated input attenuation is reported only with both impedances',()=>{
 const message=render({sourceVoltage:0.2,inputSensitivity:1,sourceZ:10000,inputZ:10},
   [{type:'continuous',load:8,watts:105}]);
 assert.match(message,/signal loss at the input/);
 assert.match(message,/Your source’s specified output level may be too low/);
});

test('speaker frequency-response interaction requires both impedance extremes and a material difference',()=>{
 const message=render({outputZ:1.5,minimum:3,maximum:20},[],4,8);
 assert.match(message,/Amplifier and speaker interaction/);
 assert.match(message,/level variation/);
 assert.doesNotMatch(message,/Enter both measured/);
});
