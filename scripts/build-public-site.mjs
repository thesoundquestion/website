// Publish only runtime website files; preserve tests and engineering notes in Git.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, lstatSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, '.pages-dist');
const publicRoutes = [
  'about', 'connect', 'content-use', 'decoder', 'journey', 'lab', 'labs',
  'library', 'privacy', 'system-builder', 'system-check', 'tools',
];
const publicFiles = ['index.html', '404.html', 'robots.txt', 'sitemap.xml'];
const runtimeExtensions = new Set([
  '.html', '.css', '.js', '.mjs', '.json', '.svg', '.webp', '.png',
  '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.pdf', '.txt',
]);
const excludedExtensions = new Set(['.wav', '.flac', '.mp3', '.ogg', '.aiff', '.aif', '.m4a', '.mp4', '.webm']);

function shouldCopy(src) {
  const relative = path.relative(root, src).split(path.sep);
  if (relative.some((segment) => segment.startsWith('.'))) return false;
  const st = lstatSync(src);
  if (st.isSymbolicLink()) throw new Error('Refusing symbolic link in public output: ' + src);
  if (st.isDirectory()) return true;
  const ext = path.extname(src).toLowerCase();
  if (excludedExtensions.has(ext)) throw new Error('Audio/video unexpectedly tracked in public routes: ' + src);
  return runtimeExtensions.has(ext);
}

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const route of publicRoutes) {
  const from = path.join(root, route);
  if (!existsSync(from) || !statSync(from).isDirectory()) throw new Error('Missing public route: ' + route);
  cpSync(from, path.join(output, route), { recursive: true, filter: shouldCopy });
}
const assets = path.join(root, 'assets');
if (!existsSync(assets)) throw new Error('Runtime assets directory missing');
cpSync(assets, path.join(output, 'assets'), { recursive: true, filter: shouldCopy });

for (const name of publicFiles) {
  const from = path.join(root, name);
  if (!existsSync(from)) throw new Error('Missing top-level site file: ' + name);
  cpSync(from, path.join(output, name));
}
for (const name of readdirSync(root)) {
  if (/^[a-f0-9]{32}\.txt$/i.test(name)) cpSync(path.join(root, name), path.join(output, name));
}
let count = 0;
let maxFileSize = 0;
function validateDir(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, item.name);
    if (item.isDirectory()) validateDir(absolute);
    else {
      count++;
      maxFileSize = Math.max(maxFileSize, statSync(absolute).size);
    }
  }
}
validateDir(output);
if (count > 20000) throw new Error('Pages Free file-count limit exceeded: ' + count);
if (maxFileSize > 25 * 1024 * 1024) throw new Error('Pages 25 MiB individual-file limit exceeded');
for (const required of ['index.html','assets/styles.css','decoder/index.html','labs/index.html','lab/index.html','lab/mastering/index.html','tools/index.html','system-check/index.html','system-builder/index.html']) {
  if (!existsSync(path.join(output, required))) throw new Error('Missing required runtime output: ' + required);
}
console.log('PUBLIC_BUILD_OK files=' + count + ' maxBytes=' + maxFileSize + ' output=.pages-dist');
