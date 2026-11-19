// Convert the canonical lesson-tutor JSON into a plain ESM data module.
// Cloudflare Pages currently bundles Functions with a Wrangler parser that does
// not understand the JSON "with { type: 'json' }" import attribute syntax.
// Keep the browser asset as JSON; use this checked, generated copy server-side.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const input=new URL('../assets/lesson-tutor/approved-answers.json',import.meta.url);
const output=new URL('../deployment/lesson-tutor/approved-answers.generated.js',import.meta.url);
const bank=JSON.parse(readFileSync(input,'utf8'));
const expected="// AUTO-GENERATED from assets/lesson-tutor/approved-answers.json.\n"+
 "// Shared approved teaching text; update the JSON source and regenerate this file together.\n"+
 "// Plain JavaScript avoids Wrangler Pages' older JSON import-attributes parser.\n"+
 "export default "+JSON.stringify(bank,null,2)+";\n";
if(process.argv.includes('--check')){
 if(readFileSync(output,'utf8')!==expected){
  throw new Error('Generated tutor bank does not match approved-answers.json. Regenerate with node scripts/build-tutor-bank-module.mjs');
 }
 console.log('TUTOR_BANK_MODULE_OK');
}else{
 writeFileSync(output,expected,'utf8');
 console.log('Wrote deployment/lesson-tutor/approved-answers.generated.js from approved JSON');
}
