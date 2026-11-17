import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Gmail installer is label-only, not archive/delete/read/forward',()=>{
 const code=read('ops/gmail/INSTALL_FILTERS.gs');
 assert.match(code,/const TSQ_MAILBOX='thesoundquestion@gmail.com'/);
 assert.match(code,/Gmail\.Users\.getProfile\('me'\)/);
 assert.match(code,/action:\{addLabelIds:\[id\]\}/);
 assert.doesNotMatch(code,/action:\{[^}]*removeLabelIds/);
 assert.doesNotMatch(code,/GmailApp\.(?:sendEmail|moveThreadToTrash|markThreadRead|archiveThread)/);
 assert.match(code,/previewTSQGmailFilters/);
 assert.match(code,/installTSQGmailFilters/);
 assert.match(code,/Gmail\.Users\.Settings\.Filters\.create/);
});

test('Gmail rules never auto-certify a license grant or rejection',()=>{
 const code=read('ops/gmail/INSTALL_FILTERS.gs');
 const start=code.indexOf('const TSQ_FILTERS='),end=code.indexOf('function tsqEnsureCorrectAccount_',start);
 const rules=code.slice(start,end);
 assert.match(rules,/TSQ\/01 Pending Approvals/);
 assert.match(rules,/TSQ\/10 Content Permissions/);
 assert.match(rules,/TSQ\/20 Ideas & Feedback/);
 assert.match(rules,/TSQ\/21 Listening Room/);
 assert.match(rules,/TSQ\/40 Search & SEO/);
 assert.match(rules,/Automation \/ GitHub Actions failures/);
 assert.doesNotMatch(rules,/TSQ\/11 Permission Confirmed/);
 assert.doesNotMatch(rules,/TSQ\/12 Permission Restricted/);
 assert.doesNotMatch(rules,/TSQ\/02 Needs Reply/);
 assert.doesNotMatch(rules,/TSQ\/03 Waiting on Reply/);
});

test('Gmail installer is explicitly manual, guarded to the right account and outside public Pages',()=>{
 const code=read('ops/gmail/INSTALL_FILTERS.gs');
 const manifest=JSON.parse(read('ops/gmail/appsscript.json'));
 const docs=read('ops/gmail/README.md');
 assert.match(code,/if\(connected!==TSQ_MAILBOX\)/);
 assert.match(code,/if\(ctx\.existing\.some/);
 assert.equal(manifest.dependencies.enabledAdvancedServices[0].serviceId,'gmail');
 assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/gmail.settings.basic'));
 assert.match(docs,/NOT installed yet/);
 assert.match(docs,/separate daily ChatGPT inbox triage task/);
 assert.match(docs,/No messages were deleted, archived, forwarded or/);
 const build=read('scripts/build-public-site.mjs');
 assert.doesNotMatch(build,/['"]ops\/gmail['"]/);
});
