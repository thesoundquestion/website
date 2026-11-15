import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
test('static Pages build preserves runtime assets and excludes internal tests and notes', () => {
 const p = spawnSync(process.execPath, ['scripts/build-public-site.mjs'], { cwd: root, encoding: 'utf8' });
 assert.equal(p.status, 0, p.stderr || p.stdout);
 assert.match(p.stdout, /PUBLIC_BUILD_OK/);
 const dir = path.join(root, '.pages-dist');
 for (const name of ['index.html','lab/mastering/index.html','tools/index.html','assets/mixing-lab.js','assets/lesson-tutor/approved-answers.json','library/make-audio-make-sense/make-audio-make-sense.pdf']) {
  assert.ok(existsSync(path.join(dir, name)), 'missing runtime file '+name);
 }
 for (const privateName of ['tests','staging','deployment','docs','scripts','.github','README.md','AGENTS.md','assets/illustrations/B01.md']) {
  assert.ok(!existsSync(path.join(dir,privateName)), 'internal file published: '+privateName);
 }
 assert.ok(readdirSync(dir).length > 10, 'output unexpectedly empty');
});
