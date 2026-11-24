import test from 'node:test';
import assert from 'node:assert/strict';
import {STEREO_SUB_EXAMPLES} from '../system-builder/stereo-subwoofer-examples.mjs';
import {BUDGET_EXAMPLES} from '../system-builder/budget-examples.mjs';
import {curatedPairingFor} from '../system-builder/curated-pairing-evidence.mjs';

const by=id=>STEREO_SUB_EXAMPLES.find(x=>x.id===id);

test('every selected 2.1 architecture contains a verified wiring source and named powered sub',()=>{
 assert.equal(STEREO_SUB_EXAMPLES.length,3);
 for(const x of STEREO_SUB_EXAMPLES){
   assert.ok(x.bassSetup?.label?.length>30,x.id+' no setup meaning');
   assert.ok(x.bassSetup?.setup?.length>50,x.id+' missing actual hookup');
   assert.ok(x.bassSetup?.source?.startsWith('https://'),x.id+' missing device source');
   assert.ok(x.parts.some(p=>/powered subwoofer/.test(p.name)),x.id+' no sub');
   assert.ok(x.parts.some(p=>/RCA|WiiM Amp|ORA|R1280/.test(p.name)),x.id+' missing active route');
   assert.ok(x.parts.some(p=>/subwoofer/i.test(p.name)&&!/speaker output/i.test(p.role||'')),
     x.id+' sub must remain on line input, not amplifier speaker outputs');
 }
});
test('R1280DBs does not invent crossover frequency, unlike exact-model original ORA',()=>{
 const edifier=by('stereo-sub-edifier'),ora=by('stereo-sub-ora');
 assert.match(edifier.bassSetup.label,/bass.*reduced|less bass/i);
 assert.match(edifier.bassSetup.label,/no crossover frequency/i);
 assert.doesNotMatch(edifier.bassSetup.setup,/\b(?:80|100|120)\s*Hz\b/i);
 assert.match(edifier.bassSetup.setup,/Sub Out.*Signal In/);
 assert.equal(edifier.stereoAlternative,'powered-r1280dbs');
 assert.deepEqual(BUDGET_EXAMPLES.find(x=>x.id==='powered-r1280dbs').connections,
   ['analog','optical','bluetooth']);
 assert.match(ora.bassSetup.label,/original ORA.*100 Hz crossover/i);
 assert.match(ora.bassSetup.setup,/Sub Out.*Signal In/);
 assert.match(ora.bassSetup.setup,/T5 cutoff fully clockwise/i);
 assert.ok(ora.connections.includes('usb'));
 assert.ok(!ora.connections.includes('hdmi'));
 assert.equal(ora.stereoAlternative,'powered-ora');
});
test('WiiM system uses configurable main high-pass and does not confuse subwoofer bypass',()=>{
 const item=by('stereo-sub-wiim');
 assert.match(item.bassSetup.label,/adjustable crossover/);
 assert.match(item.bassSetup.setup,/Main Speakers Output Bass.*Subwoofer Bypass Mode off/);
 assert.match(item.bassSetup.setup,/WiiM Home/);
 assert.match(item.bassSetup.source,/faq\.wiimhome\.com/);
 assert.ok(item.connections.includes('hdmi'));
 const withRegionalSpeaker={...item,parts:[...item.parts,item.regionalSpeakers.CA]};
 const pairing=curatedPairingFor(withRegionalSpeaker);
 assert.equal(pairing?.amplifierModel,'WiiM Amp');
 assert.equal(pairing?.speakerModel,'Polk Monitor XT15');
 assert.ok(pairing?.sources?.some(x=>/wiimhome/.test(x.url)));
});
