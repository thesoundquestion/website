import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const skipDirs = new Set(['.git', '.github', 'staging', 'tests', 'scripts', 'deployment', 'assets', 'docs', 'site-dist', '.pages-dist']);
const read = file => readFileSync(path.join(root, file), 'utf8');

function publishedHtml(dir = '') {
  return readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => {
    const relative = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) return skipDirs.has(entry.name) ? [] : publishedHtml(relative);
    return entry.name === 'index.html' ? [relative] : [];
  });
}

test('every published HTML page is included in the sitemap once and is indexable', () => {
  const pages = publishedHtml().sort();
  const sitemap = read('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).sort();
  const rootUrl = 'https://thesoundquestion.pages.dev/';
  const expected = pages.map(page => rootUrl + page.replace(/(^index\.html$|index\.html$)/, '')).sort();
  assert.ok(pages.length >= 46, 'expected all published pages');
  assert.deepEqual(urls, expected, 'sitemap must contain every published HTML page exactly once');

  for (const page of pages) {
    const html = read(page);
    assert.doesNotMatch(html, /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i, page);
    assert.match(html, /<link[^>]*rel=["']canonical["'][^>]*href=["']https:\/\/thesoundquestion\.pages\.dev\//i, page + ': self-domain canonical');
    assert.doesNotMatch(html, /review draft|not published|offline preview|local review only/i, page);
  }
});
