import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const lessons=[
 ['bass-extension','Bass extension describes how far down','low-frequency number'],
 ['speaker-sensitivity','Speaker sensitivity helps describe','test conditions'],
 ['speaker-impedance','lower impedance asks the amplifier for more current','At the same voltage'],
 ['speaker-drivers','A crossover directs different parts of the music','whole speaker'],
 ['amplifier-power',"An amplifier's watt rating does not directly tell you how loud",'speaker load'],
 ['amplifier-distortion',"That's distortion",'test frequency']
];

for(const [slug,explanation,context] of lessons){
 test(slug+' begins with a direct, listening-focused explanation before the illustrative spec',()=>{
   const page=readFileSync(new URL('../decoder/'+slug+'/index.html',import.meta.url),'utf8');
   const lead=page.match(/<h1>[\s\S]*?<\/h1><p class="lead">([\s\S]*?)<\/p>/)?.[1];
   assert.ok(lead,slug+' lead paragraph is missing');
   assert.ok(lead.length>=180&&lead.length<=430,slug+' lead is either missing or too long');
   assert.ok(lead.includes(explanation),slug+' missing immediate plain-English explanation');
   assert.ok(lead.includes(context),slug+' does not connect the explanation to useful evidence');
   assert.ok(page.indexOf('<p class="lead">')<page.indexOf('dl-example-spec'),slug+' must explain before introducing specifications');
 });
}
