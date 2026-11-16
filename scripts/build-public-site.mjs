// Publish tracked website runtime files only; preserve engineering/tests in Git.
import { copyFileSync, existsSync, mkdirSync, rmSync, lstatSync, statSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'site-dist');
const routes = new Set([
  'about', 'connect', 'content-use', 'decoder', 'journey', 'lab', 'labs',
  'library', 'privacy', 'system-builder', 'system-check', 'tools', 'assets',
]);
const rootFiles = new Set(['index.html', '404.html', 'robots.txt', 'sitemap.xml']);
const runtimeExt = new Set([
  '.html', '.css', '.js', '.mjs', '.json', '.svg', '.webp', '.png',
  '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.pdf', '.txt',
]);
const mediaExt = new Set(['.wav', '.flac', '.mp3', '.ogg', '.aiff', '.aif', '.m4a', '.mp4', '.webm']);
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
  if (mediaExt.has(ext) && !approvedMedia.has(entry)) throw new Error('Publication of unapproved audio/video blocked: ' + entry);
  if (!topLevel && !runtimeExt.has(ext)) continue;
  if (parts.some(p => p.startsWith('.'))) continue;
  const from = path.join(root, ...parts);
  if (!existsSync(from)) throw new Error('Tracked runtime file absent: ' + entry);
  if (!lstatSync(from).isFile()) throw new Error('Non-regular runtime file: ' + entry);
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
 'index.html', 'assets/styles.css', 'assets/lesson-tutor/approved-answers.json',
 'decoder/index.html', 'labs/index.html', 'lab/index.html',
 'lab/mastering/index.html', 'labs/formats/index.html', 'tools/index.html', 'system-check/index.html',
 'system-builder/index.html', 'library/make-audio-make-sense/make-audio-make-sense.pdf',
];
for (const file of required) {
 if (!existsSync(path.join(output, ...file.split('/')))) throw new Error('Required runtime file missing: ' + file);
}
if ([...approvedMedia.keys()].some(file => !existsSync(path.join(output, ...file.split('/'))))) throw new Error('Approved MP3 asset missing from public build');
console.log('PUBLIC_BUILD_OK trackedFiles=' + files.length + ' maxBytes=' + maxBytes + ' output=site-dist');
