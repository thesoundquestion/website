#!/usr/bin/env node
// Submit canonical public URLs to IndexNow ONLY after a production deployment.
// Dry-run by default. This script never triggers Cloudflare deployments.
import { readFileSync } from 'node:fs';

const host = 'thesoundquestion.com';
const origin = 'https://' + host;
const key = 'd4c6d4d6b0f543328922f93a80145ba7';
const keyUrl = origin + '/' + key + '.txt';
const localKey = readFileSync(new URL('../' + key + '.txt', import.meta.url), 'utf8').trim();
if (localKey !== key) throw new Error('IndexNow verification key file is missing or altered');

const args = process.argv.slice(2);
if (args.some((arg) => !['--submit', '--dry-run'].includes(arg))) {
  throw new Error('Supported options: --dry-run (default) or --submit');
}
if (args.includes('--submit') && args.includes('--dry-run')) {
  throw new Error('Choose either --dry-run or --submit');
}

const selection = (process.env.INDEXNOW_PATHS || '/').trim();
let candidates;
if (selection === '@sitemap') {
  const sitemap = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
  candidates = Array.from(sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi), (match) =>
    match[1].replaceAll('&amp;', '&')
  );
} else {
  candidates = selection.split(/[\s,]+/).filter(Boolean);
}

function canonicalUrl(candidate) {
  if (!(candidate.startsWith('/') || candidate.startsWith(origin + '/'))) {
    throw new Error('Expected a canonical site URL or path, got: ' + candidate);
  }
  const url = new URL(candidate, origin);
  if (url.origin !== origin || url.search || url.hash || url.username || url.password) {
    throw new Error('IndexNow accepts only canonical public page URLs: ' + candidate);
  }
  return url.href;
}

const urls = [...new Set(candidates.map(canonicalUrl))];
if (!urls.length || urls.length > 10000) {
  throw new Error('IndexNow requires 1 to 10,000 URLs per submission');
}
console.log('IndexNow targets (' + urls.length + '):\n' + urls.join('\n'));

if (!args.includes('--submit')) {
  console.log('Dry run only. To notify search engines, rerun with --submit after the production deployment.');
} else {
  const keyResponse = await fetch(keyUrl, { signal: AbortSignal.timeout(15000) });
  if (!keyResponse.ok || (await keyResponse.text()).trim() !== key) {
    throw new Error('Live key verification failed at ' + keyUrl + ' (HTTP ' + keyResponse.status + '). Publish first.');
  }
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: keyUrl, urlList: urls }),
    signal: AbortSignal.timeout(25000),
  });
  const responseBody = (await response.text()).slice(0, 400);
  console.log('IndexNow response: HTTP ' + response.status + (responseBody ? ' ' + responseBody : ''));
  if (![200, 202].includes(response.status)) process.exitCode = 1;
}
