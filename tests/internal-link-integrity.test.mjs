import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const excluded = new Set(['.git', '.github', 'staging', 'tests', 'docs', 'assets', 'deployment', 'scripts']);
const cache = new Map();
function read(file) {
 if (!cache.has(file)) cache.set(file, readFileSync(file, 'utf8'));
 return cache.get(file);
}
function pages(dir = root) {
 const files = [];
 for (const item of readdirSync(dir, { withFileTypes: true })) {
  if (item.isDirectory()) {
   if (!excluded.has(item.name)) files.push(...pages(path.join(dir, item.name)));
  } else if (item.name === 'index.html') files.push(path.join(dir, item.name));
 }
 return files;
}

test('every internal href/src from published page templates resolves to a staged file', () => {
 const missing = [];
 const invalidFragments = [];
 let checked = 0;
 const all = pages();
 for (const file of all) {
  const html = read(file);
  const base = 'https://site.invalid/' + path.relative(root, file).split(path.sep).join('/');
  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
   const href = match[1];
   if (/^(https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(href)) continue;
   let u;
   try { u = new URL(href, base); } catch { missing.push([path.relative(root,file),href,'malformed URL']); continue; }
   let sitePath;
   try { sitePath = decodeURIComponent(u.pathname).replace(/^\//, ''); }
   catch { missing.push([path.relative(root,file),href,'invalid encoding']); continue; }
   if (!sitePath || sitePath.endsWith('/') || !path.posix.extname(sitePath)) sitePath = sitePath.replace(/\/?$/, '/') + 'index.html';
   const target = path.resolve(root, sitePath);
   checked++;
   if (!target.startsWith(root + path.sep) && target !== path.join(root,'index.html')) {
    missing.push([path.relative(root,file),href,'outside root']); continue;
   }
   if (!existsSync(target) || !statSync(target).isFile()) {
    missing.push([path.relative(root,file),href,'missing target']); continue;
   }
   if (u.hash && target.endsWith('.html')) {
    const fragment = decodeURIComponent(u.hash.slice(1));
    const targetHtml = read(target);
    if (!targetHtml.includes('id="' + fragment + '"') &&
        !targetHtml.includes("id='" + fragment + "'") &&
        !targetHtml.includes('name="' + fragment + '"') &&
        !targetHtml.includes("name='" + fragment + "'")) {
     invalidFragments.push([path.relative(root,file),href]);
    }
   }
  }
 }
 assert.ok(checked > 1000, 'expected broad sitewide coverage');
 assert.deepEqual(missing, [], 'broken local page or asset links');
 assert.deepEqual(invalidFragments, [], 'links to missing internal sections');
});