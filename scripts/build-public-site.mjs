// Publish tracked website runtime files only; preserve engineering/tests in Git.
import { copyFileSync, existsSync, mkdirSync, rmSync, lstatSync, statSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Never publish a stale projection or a partially updated inventory.
// This is a read-only preflight; regeneration remains an explicit development step.
execFileSync(process.execPath,['scripts/build-equipment-catalog.mjs','--check'],
  {cwd:root,stdio:'pipe'});
const output = path.join(root, 'site-dist');
const routes = new Set([
  'about', 'connect', 'content-use', 'decoder', 'journey', 'lab', 'labs',
  'library', 'privacy', 'system-builder', 'system-check', 'tools', 'assets', 'equipment',
]);
const rootFiles = new Set(['index.html', '404.html', 'robots.txt', 'sitemap.xml', '_redirects', '_routes.json']);
const runtimeExt = new Set([
  '.html', '.css', '.js', '.mjs', '.json', '.svg', '.webp', '.png',
  '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.pdf', '.txt',
]);
const mediaExt = new Set(['.wav', '.flac', '.mp3', '.ogg', '.aiff', '.aif', '.m4a', '.mp4', '.webm']);
// A shared inventory is the only source of published preset projections.
// Both legacy consumers must receive generated, checked records.
const equipmentRuntime = new Set([
  'equipment/catalog.generated.json',
  'equipment/legacy-presets.generated.js',
  'equipment/compare-details.generated.js',
  'equipment/catalog-core.mjs',
  'equipment/catalog-client.mjs',
  'equipment/catalog-legacy-adapters.mjs',
  'equipment/price-tiers.mjs',
  'equipment/price-tier-client.mjs',
  'equipment/price-tiers.generated.json',
  // Phase 2 is review-only, but its isolated draft preview needs this module.
  'equipment/comparison-model.mjs',
  'equipment/recording-chain-check.mjs',
  'equipment/headphone-chain-check.mjs'
]);
// Release only the exactly approved 59-page illustrated handbook.
const retiredHandbook = 'library/make-audio-make-sense/make-audio-make-sense.pdf';
const illustratedHandbook = 'library/make-audio-make-sense/make-audio-make-sense-illustrated.pdf';
const illustratedHandbookExpectedSize = 12018958;
const illustratedHandbookExpectedSha256 = 'd647ee22a1931adf45e8cf72fd25792fb10d12a8017e64d54ca105209cfeee77';
/* Allow only explicitly reviewed, checked full-band MP3 examples. Keep the
 * default deny rule for every other audio/video file, including raw stems. */
const approvedMedia = new Map([
  ['assets/audio/formats/light-128.mp3','7ea7d336bc5bb8011aa560aa3394beef6384ba295c51c9a8a8bd66521b011777'],
  ['assets/audio/formats/light-320.mp3','7c7d8ed8ff588af53537a37580af8212209ed3b15ea456e0739a31e7cd36b445'],
  ['assets/audio/formats/diva-128.mp3','b37ad76293aec0020da3697f0051fa03ef70dc30b727b6b8ec625b0295256f9d'],
  ['assets/audio/formats/diva-320.mp3','b1d87b86ac97d63cfff783d1a0fc15a756fa0485a4b1b48dd572e0483766a1c2'],
]);

const git = process.env.TSQ_GIT_EXECUTABLE || 'git';
const raw = execFileSync(git, ['ls-files', '-z'], { cwd: root });
const tracked = raw.toString('utf8').split('\0').filter(Boolean);
if (tracked.length < 80) throw new Error('Too few Git-tracked files in checkout; refusing empty publish');

const files = [];
for (const entry of tracked) {
  if (entry.startsWith('/') || entry.includes('\\') || entry.split('/').includes('..')) {
    throw new Error('Unsafe Git path: ' + entry);
  }
  const parts = entry.split('/');
  const ext = path.extname(entry).toLowerCase();
  const inPublicRoute = parts.length > 1 && routes.has(parts[0]);
  const topLevel = parts.length === 1 &&
    (rootFiles.has(entry) || /^[a-f0-9]{32}\.txt$/i.test(entry));
  if (!inPublicRoute && !topLevel) continue;
  if (parts[0] === 'equipment' && !equipmentRuntime.has(entry)) continue;
  if (entry === retiredHandbook) continue; // Preserve in Git history, but do not serve the retired three-page edition.
  if (mediaExt.has(ext) && !approvedMedia.has(entry)) throw new Error('Publication of unapproved audio/video blocked: ' + entry);
  if (!topLevel && !runtimeExt.has(ext) && !approvedMedia.has(entry)) continue;
  if (parts.some(p => p.startsWith('.'))) continue;
  const from = path.join(root, ...parts);
  if (!existsSync(from)) throw new Error('Tracked runtime file absent: ' + entry);
  if (!lstatSync(from).isFile()) throw new Error('Non-regular runtime file: ' + entry);
  if (entry === illustratedHandbook) {
    const fileSize = statSync(from).size;
    if (fileSize !== illustratedHandbookExpectedSize) throw new Error('Wrong illustrated handbook file size: ' + fileSize);
    const digest = createHash('sha256').update(readFileSync(from)).digest('hex');
    if (digest !== illustratedHandbookExpectedSha256) throw new Error('Wrong illustrated handbook SHA-256; refusing unapproved PDF');
  }
  if (approvedMedia.has(entry)) {
    if (statSync(from).size > 2 * 1024 * 1024) throw new Error('MP3 unexpectedly large: ' + entry);
    const digest = createHash('sha256').update(readFileSync(from)).digest('hex');
    if (digest !== approvedMedia.get(entry)) throw new Error('Approved MP3 hash changed: ' + entry);
  }

  files.push({ entry, from });
}
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
let maxBytes = 0;
for (const {entry, from} of files) {
  const dest = path.join(output, ...entry.split('/'));
  mkdirSync(path.dirname(dest), { recursive: true });
  copyFileSync(from, dest);
  maxBytes = Math.max(maxBytes, statSync(dest).size);
}
if (files.length > 20000) throw new Error('Cloudflare Free 20,000-file quota exceeded');
if (maxBytes > 25 * 1024 * 1024) throw new Error('Cloudflare Pages 25 MiB per-file limit exceeded');
const required = [
 'index.html', '_routes.json', 'assets/styles.css', 'assets/lesson-tutor/approved-answers.json',
 'decoder/index.html', 'labs/index.html', 'lab/index.html',
 'lab/mastering/index.html', 'labs/formats/index.html', 'tools/index.html', 'system-check/index.html',
 'system-builder/index.html', 'equipment/catalog.generated.json',
 'equipment/legacy-presets.generated.js', 'equipment/compare-details.generated.js',
 'equipment/catalog-core.mjs', 'equipment/catalog-client.mjs',
 'equipment/catalog-legacy-adapters.mjs',
 'equipment/price-tiers.mjs', 'equipment/price-tier-client.mjs',
 'equipment/price-tiers.generated.json', 'equipment/comparison-model.mjs',
 'tools/equipment-comparison-preview/index.html',
 'tools/equipment-comparison-preview/preview.mjs',
 'tools/equipment-comparison-preview/style.css',
 'equipment/recording-chain-check.mjs', 'equipment/headphone-chain-check.mjs',
 'tools/chain-check-preview/index.html',
 'tools/chain-check-preview/preview.mjs',
 'tools/chain-check-preview/style.css', illustratedHandbook,
 'labs/abx/index.html', 'assets/abx-lab.js', 'assets/abx-lab.css',
 'assets/lab-readiness.js', 'assets/lab-readiness.css',
 'assets/format-comparison-engine.js',
 'assets/community-board.js', 'assets/community-board.css',
 'assets/share-site.js', 'library/curators-listening-room/index.html',
 'assets/waveforms/mastering-provenance.json',
 'assets/waveforms/mastering-dynamic.svg',
 'assets/waveforms/mastering-moderate.svg',
 'assets/waveforms/mastering-brickwalled.svg',
];
for (const file of required) {
 if (!existsSync(path.join(output, ...file.split('/')))) throw new Error('Required runtime file missing: ' + file);
}
// Pages Functions must be used only for the optional tutor API, never for static requests.
// The Cloudflare Pages publish output (site-dist) must include this routing manifest.
const functionRoutes = JSON.parse(readFileSync(path.join(output, '_routes.json'), 'utf8'));
if (functionRoutes.version !== 1 ||
    JSON.stringify(functionRoutes.include) !== JSON.stringify(['/api/lesson-tutor']) ||
    JSON.stringify(functionRoutes.exclude) !== JSON.stringify([])) {
  throw new Error('Unsafe Pages Functions routing; refuse publication');
}
// Waveform images must be measured from actual published master audio once,
// never generated with browser-side audio downloads on initial page visit.
const waveformManifest = JSON.parse(readFileSync(path.join(output, 'assets/waveforms/mastering-provenance.json'),'utf8'));
if (waveformManifest.bins !== 960 || waveformManifest.channels !== 2 ||
    !/signed min\/max and RMS/.test(waveformManifest.method||'')) throw new Error('Unverified mastering waveform provenance');
for (const kind of ['dynamic','moderate','brickwalled']) {
 const entry = waveformManifest.sources?.[kind];
 const pathName = 'assets/waveforms/mastering-'+kind+'.svg';
 if (!entry || entry.svg !== '/'+pathName || !/^[a-f0-9]{64}$/.test(entry.sha256||'') ||
     !(entry.duration_seconds >= 39 && entry.duration_seconds <= 41) ||
     entry.frames !== 1764000) throw new Error('Missing mastering waveform source record: '+kind);
 const local = path.join(output,pathName);
 if (statSync(local).size > 120000) throw new Error('Oversized mastering waveform: '+kind);
 const actual = createHash('sha256').update(readFileSync(local)).digest('hex');
 if (actual !== entry.svg_sha256) throw new Error('Mastering waveform mismatch: '+kind);
}
if ([...approvedMedia.keys()].some(file => !existsSync(path.join(output, ...file.split('/'))))) throw new Error('Approved MP3 asset missing from public build');
console.log('PUBLIC_BUILD_OK trackedFiles=' + files.length + ' maxBytes=' + maxBytes + ' output=site-dist');
