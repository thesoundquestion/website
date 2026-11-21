/**
 * One-command release-candidate review. Runs the complete test suite and
 * production-equivalent static build before serving any preview files.
 * Local-only HTTP server; no Cloudflare deployment or external AI use.
 */
import {readdirSync,statSync,existsSync,readFileSync,createReadStream} from 'node:fs';
import {resolve,join,extname,sep} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const testsRoot=join(root,'tests');
function findTests(dir){
  const found=[];
  for(const item of readdirSync(dir,{withFileTypes:true})){
    const path=join(dir,item.name);
    if(item.isDirectory())found.push(...findTests(path));
    else if(item.isFile()&&item.name.endsWith('.test.mjs'))found.push(path);
  }
  return found.sort();
}
function run(label,args){
  process.stdout.write('\n'+label+'\n');
  const processResult=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024,env:process.env});
  const output=(processResult.stdout||'')+'\n'+(processResult.stderr||'');
  if(processResult.status!==0){
    const lines=output.split('\n');
    const failures=lines.filter(x=>/not ok|# fail|error:|Error:|ERR_ASSERTION|PUBLIC_BUILD_OK/.test(x));
    process.stderr.write(failures.slice(0,35).join('\n')+'\n');
    process.stderr.write('\nLast lines for diagnosis:\n'+lines.slice(-45).join('\n')+'\n');
    throw new Error(label+' failed. Preview server was NOT started.');
  }
  process.stdout.write(output.split('\n').filter(x=>/# tests |# pass |# fail |PUBLIC_BUILD_OK|Catalogue and legacy views current/.test(x)).join('\n')+'\n');
}
if(!existsSync(join(root,'.git')))throw new Error('Open a Git clone of the website, not an untracked copy.');
run('Checking canonical equipment projections',['scripts/build-equipment-catalog.mjs','--check']);
run('Checking equipment certification and risk register',['scripts/audit-equipment-certification.mjs','--check']);
const testFiles=findTests(testsRoot);
if(testFiles.length<15)throw new Error('Incomplete test checkout. Refusing preview.');
run('Running all '+testFiles.length+' test modules',['--test',...testFiles]);
run('Building actual static publish output',['scripts/build-public-site.mjs']);
const output=join(root,'site-dist');
const route=JSON.parse(readFileSync(join(output,'_routes.json'),'utf8'));
if(JSON.stringify(route.include)!==JSON.stringify(['/api/lesson-tutor']))throw new Error('Unsafe API routing manifest');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon',
  '.gif':'image/gif','.woff':'font/woff','.woff2':'font/woff2','.pdf':'application/pdf',
  '.mp3':'audio/mpeg','.txt':'text/plain; charset=utf-8'};
const server=createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  let decoded;
  try{decoded=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}
  catch{res.writeHead(400);res.end('Malformed URL');return}
  if(decoded.startsWith('/api/')){res.writeHead(503,{'Content-Type':'text/plain'});res.end('Optional AI backend is disabled in this static preview.');return}
  const requested=resolve(output,'.'+decoded);
  if(requested!==output&&!requested.startsWith(output+sep)){res.writeHead(403);res.end();return}
  let path=requested;
  if(existsSync(path)&&statSync(path).isDirectory())path=join(path,'index.html');
  if(!existsSync(path)||!statSync(path).isFile()){
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
    res.end('This route is not available in the preview.');
    return;
  }
  res.writeHead(200,{'Content-Type':mime[extname(path).toLowerCase()]||'application/octet-stream',
    'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD'){res.end();return}
  createReadStream(path).pipe(res);
});
server.on('error',error=>{process.stderr.write(error.message+'\n');process.exitCode=1});
server.listen(0,'127.0.0.1',()=>{
  const url='http://127.0.0.1:'+server.address().port+'/';
  console.log('\nALL LOCAL PREFLIGHT CHECKS PASSED');
  console.log('Open the full release-candidate site: '+url);
  console.log('Recording / headphone preview: '+url+'tools/chain-check-preview/');
  console.log('Equipment comparisons: '+url+'tools/equipment-comparison-preview/');
  console.log('Ask TSQ prepared answers work; optional live AI remains DISABLED until Cloudflare setup is validated.');
  console.log('Press Ctrl+C to stop the server. No files were deployed to production.');
});
