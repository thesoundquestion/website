import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BUILDER_INTENTS} from '../system-builder/intent-routing.mjs';

const file=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const page=file('../system-builder/index.html');
const app=file('../system-builder/app.mjs');
const compact=file('../system-builder/compact-preview.css');
const cmd=file('../PREVIEW_FULL_SITE_WINDOWS.cmd');
const ps1=file('../PREVIEW_FULL_SITE_WINDOWS.ps1');

test('complete-system mode shows listening distance beside other core questions',()=>{
 assert.ok(BUILDER_INTENTS.complete_system.fields.includes('useCase'));
 assert.ok(BUILDER_INTENTS.complete_system.fields.includes('distanceFt'));
 assert.ok(BUILDER_INTENTS.complete_system.fields.includes('level'));
 assert.match(page,/name="distanceFt"/);
});
test('the main recommendation occupies its whole column, not half a slot',()=>{
 assert.match(compact,/\.sb \.sb-compact-matches>\.sb-primary-recommendation\{[\s\S]*?display:block;/);
 assert.match(compact,/\.sb \.sb-compact-matches>\.sb-primary-recommendation>\.sb-recommend\{[\s\S]*?display:block;/);
 assert.match(compact,/grid-template-columns:minmax\(0,1\.15fr\) minmax\(0,\.85fr\)/);
 assert.match(app,/const matchesRow=el\('div','sb-compact-matches'\)/);
 assert.match(app,/matchesRow.append\(grid\)/);
});
test('equipment loading remains source-backed and has a visible failure state',()=>{
 assert.match(page,/id="sb-catalog-alert"/);
 assert.match(app,/showCatalogAlert\('The shared equipment catalogue could not load/);
 assert.match(app,/sharedGearAsLegacyView\(shared,kind\)/);
 assert.match(app,/Your selected sourced model/);
 assert.match(page,/\/equipment\/legacy-presets.generated.js/);
});
test('Windows launcher uses a branch-verified dedicated port rather than stale server',()=>{
 assert.match(cmd,/PREVIEW_FULL_SITE_WINDOWS\.ps1/);
 assert.match(ps1,/Port = 8877/);
 assert.match(ps1,/Wrong Git branch/);
 assert.match(ps1,/127\.0\.0\.1/);
 assert.match(ps1,/system-builder\//);
 assert.match(page,/sb-preview-build/);
 assert.match(page,/app\.mjs\?v=powered-practical-output-20261121/);
});

test('saved pairing facts are shown only inside a compact disclosure',()=>{
 assert.match(app,/const specs=el\('details','sb-saved-pair-specs'\)/);
 assert.match(app,/Saved amplifier & speaker specifications/);
 assert.match(app,/ampContinuous/);
 assert.match(app,/hasSensitivity/);
 assert.match(compact,/\.sb \.sb-results \.sb-saved-pair-specs/);
});
