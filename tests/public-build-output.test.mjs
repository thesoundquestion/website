import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
test('static Pages build includes tracked runtime assets and excludes internal/untracked files', () => {
 const p = spawnSync(process.execPath, ['scripts/build-public-site.mjs'], { cwd: root, encoding: 'utf8', env: process.env });
 assert.equal(p.status, 0, p.stderr || p.stdout);
 assert.match(p.stdout, /PUBLIC_BUILD_OK/);
 const dir = path.join(root, 'site-dist');
 for (const name of ['index.html','lab/mastering/index.html','tools/index.html','decoder/microphone-types/index.html','decoder/speaker-types/index.html','assets/equipment-types.css','assets/illustrations/mic-types-mechanisms.svg','assets/illustrations/speaker-types-settings.svg','assets/mixing-lab.js','assets/lesson-tutor/approved-answers.json','library/make-audio-make-sense/make-audio-make-sense-illustrated.pdf','labs/abx/index.html','assets/abx-lab.js','assets/abx-lab.css','assets/lab-readiness.js','assets/lab-readiness.css','assets/community-board.js','assets/community-board.css','assets/share-site.js','library/curators-listening-room/index.html','assets/waveforms/mastering-provenance.json','assets/waveforms/mastering-dynamic.svg','assets/waveforms/mastering-moderate.svg','assets/waveforms/mastering-brickwalled.svg']) {
  assert.ok(existsSync(path.join(dir, name)), 'missing runtime file '+name);
 }
 for (const name of ['equipment/catalog.generated.json','equipment/legacy-presets.generated.js',
  'equipment/compare-details.generated.js','equipment/catalog-core.mjs',
  'equipment/catalog-legacy-adapters.mjs','equipment/catalog-client.mjs',
  'equipment/price-tiers.mjs','equipment/price-tier-client.mjs',
  'equipment/price-tiers.generated.json',
  'equipment/comparison-model.mjs','equipment/recording-chain-check.mjs',
  'equipment/headphone-chain-check.mjs']) {
  assert.ok(existsSync(path.join(dir,name)), 'missing unified inventory runtime: '+name);
 }
 for(const name of [
  'tools/equipment-comparison-preview/index.html',
  'tools/equipment-comparison-preview/preview.mjs',
  'tools/equipment-comparison-preview/style.css'
 ])assert.ok(existsSync(path.join(dir,name)), 'missing draft comparison review asset: '+name);
 for(const name of [
   'tools/chain-check-preview/index.html',
   'tools/chain-check-preview/preview.mjs',
   'tools/chain-check-preview/style.css'
 ]) assert.ok(existsSync(path.join(dir,name)), 'missing chain-check draft preview: '+name);
 assert.ok(!existsSync(path.join(dir,'equipment/README.md')), 'internal inventory handoff was published');
 assert.ok(!existsSync(path.join(dir,'equipment/source-master.json')), 'editable equipment master must not publish');
 assert.ok(!existsSync(path.join(dir,'equipment/REGIONAL_PRICE_TIERS_2026_11_18.md')), 'retail evidence memo must not publish');
 assert.ok(!existsSync(path.join(dir,'library/make-audio-make-sense/make-audio-make-sense.pdf')), 'retired three-page PDF was published');
 assert.ok(existsSync(path.join(dir,'_redirects')), 'legacy PDF redirect missing');
 for (const privateName of ['tests','staging','deployment','docs','scripts','.github','README.md','AGENTS.md','assets/illustrations/B01.md']) {
  assert.ok(!existsSync(path.join(dir,privateName)), 'internal or untracked file published: '+privateName);
 }

 const approved = ['light-128.mp3','light-320.mp3','diva-128.mp3','diva-320.mp3','manifest.json'];
 const formatDir = path.join(dir,'assets/audio/formats');
 assert.deepEqual(readdirSync(formatDir).sort(), approved.sort(), 'Only four verified MP3s and manifest should publish');
 assert.ok(existsSync(path.join(dir,'labs/formats/index.html')), 'New listening test is missing');
 assert.ok(readdirSync(dir).length > 10, 'output unexpectedly empty');
});
