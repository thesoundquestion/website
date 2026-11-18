import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const repo = new URL('../../', import.meta.url);
const read = file => readFileSync(new URL(file, repo), 'utf8');

test('optional tutor does not route all Pages static traffic through Functions', () => {
  assert.deepEqual(JSON.parse(read('_routes.json')), {
    version: 1,
    include: ['/api/lesson-tutor'],
    exclude: [],
  });
  const build = read('scripts/build-public-site.mjs');
  assert.match(build, /rootFiles[^\n]+['_"]_routes\.json['"]/);
  assert.match(build, /functionRoutes\.include/);
  assert.match(build, /Unsafe Pages Functions routing/);
});

test('deployed AI route is staged off until account bindings and activation checks', () => {
  assert.match(read('functions/api/lesson-tutor.js'), /handleTutorRequest/);
  assert.match(read('assets/lesson-tutor/config.js'), /AI_ENABLED\s*=\s*false/);
  const handler = read('deployment/lesson-tutor/handler.js');
  assert.match(handler, /TUTOR_WORKERS_PLAN\s*===\s*'free'/);
  assert.match(handler, /env\.TUTOR_ENABLED\s*===\s*'true'/);
});
