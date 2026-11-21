import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BUILDER_INTENTS} from '../system-builder/intent-routing.mjs';

const file=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const page=file('../system-builder/index.html');
const app=file('../system-builder/app.mjs');
const compact=file('../system-builder/compact-preview.css');
const cmd=file('../PREVIEW_FULL_SITE_WINDOWS.cmd');

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
test('the Windows preview does not silently open an old server on port 8765',()=>{
 assert.match(cmd,/set "PORT=8877"/);
 assert.match(cmd,/if errorlevel 1 goto port_busy/);
 assert.match(cmd,/Port %PORT% is already occupied/);
 assert.match(cmd,/system-builder\//);
 assert.match(page,/sb-preview-build/);
 assert.match(page,/fullsite-catalog-layout-20261120/);
});
