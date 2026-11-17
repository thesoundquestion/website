/**
 * The Sound Question - Gmail routing rules.
 *
 * Run only while signed in as thesoundquestion@gmail.com.
 * Requires Google Apps Script Advanced Gmail API service enabled.
 * This installer NEVER archives, deletes, forwards, marks messages read,
 * or labels correspondence as permission-granted/restricted.
 *
 * Installed Gmail filters act on NEW incoming messages. Earlier mail has
 * already been selectively labeled through the connected Gmail account.
 *
 * First run previewTSQGmailFilters(); then installTSQGmailFilters().
 */
const TSQ_MAILBOX='thesoundquestion@gmail.com';
const TSQ_FILTERS=[
  {
    title:'Pending community approvals',
    query:'subject:"The Sound Question:" "pending community"',
    label:'TSQ/01 Pending Approvals'
  },
  {
    title:'Content licensing and permission correspondence',
    query:'{subject:permission subject:"educational use" subject:licensing subject:license subject:attribution subject:"rights request"} -from:notifications@github.com',
    label:'TSQ/10 Content Permissions'
  },
  {
    title:'Visitor ideas and corrections',
    query:'{subject:"The Sound Question - Idea or Content Permission" subject:"content idea" subject:"lesson suggestion" subject:"listening lab idea" subject:"site feedback" subject:correction} -from:notifications@github.com',
    label:'TSQ/20 Ideas & Feedback'
  },
  {
    title:'Listening Room nominations',
    query:'{subject:"Listening Room" subject:"track suggestion" subject:"recording suggestion"} -from:notifications@github.com',
    label:'TSQ/21 Listening Room'
  },
  {
    title:'Creators and partner outreach',
    query:'{subject:collaboration subject:partnership subject:"sample request" subject:"creator outreach"} -from:notifications@github.com',
    label:'TSQ/30 Creators & Outreach'
  },
  {
    title:'Search Console and SEO',
    query:'{from:sc-noreply@google.com subject:"Search Console" subject:"SEO audit" subject:"thesoundquestion.pages.dev audit"} -from:notifications@github.com',
    label:'TSQ/40 Search & SEO'
  },
  {
    title:'Cloudflare and site infrastructure',
    query:'{from:cloudflare.com subject:"Cloudflare" subject:"Pages deployment" subject:"Workers KV" subject:"D1 database"} -from:notifications@github.com',
    label:'TSQ/41 Hosting & Cloudflare'
  },
  {
    title:'GitHub workflow failures',
    query:'from:notifications@github.com {subject:"Run failed" subject:"PR run failed"}',
    label:'Automation / GitHub Actions failures'
  },
  {
    title:'Routine GitHub successes only',
    query:'from:notifications@github.com {subject:"Run succeeded" subject:"Run completed" subject:"PR run successful"}',
    label:'TSQ/50 Routine Notifications'
  }
];

function tsqEnsureCorrectAccount_(){
  const profile=Gmail.Users.getProfile('me');
  const connected=(profile.emailAddress||'').toLowerCase();
  if(connected!==TSQ_MAILBOX)throw new Error('Wrong account. Expected '+TSQ_MAILBOX+', connected '+connected);
}
function tsqFilterContext_(){
  tsqEnsureCorrectAccount_();
  const labelResult=Gmail.Users.Labels.list('me');
  const labels=new Map((labelResult.labels||[]).map(x=>[x.name,x.id]));
  const existing=Gmail.Users.Settings.Filters.list('me').filter||[];
  return {labels,existing};
}
function previewTSQGmailFilters(){
  const ctx=tsqFilterContext_();
  for(const rule of TSQ_FILTERS){
    const id=ctx.labels.get(rule.label);
    if(!id)throw new Error('Required Gmail label missing: '+rule.label);
    const exists=ctx.existing.some(x=>x.criteria?.query===rule.query&&(x.action?.addLabelIds||[]).includes(id));
    Logger.log((exists?'ALREADY INSTALLED: ':'READY TO INSTALL: ')+rule.title+' > '+rule.label+' | '+rule.query);
  }
  Logger.log('Preview only. No messages or filters were modified.');
}
function installTSQGmailFilters(){
  const ctx=tsqFilterContext_();
  let added=0,skipped=0;
  for(const rule of TSQ_FILTERS){
    const id=ctx.labels.get(rule.label);
    if(!id)throw new Error('Missing Gmail label: '+rule.label);
    if(ctx.existing.some(x=>x.criteria?.query===rule.query&&(x.action?.addLabelIds||[]).includes(id))){
      skipped++;continue;
    }
    const request={
      criteria:{query:rule.query},
      action:{addLabelIds:[id]}
    };
    Gmail.Users.Settings.Filters.create(request,'me');
    added++;
  }
  Logger.log('Installed '+added+' safe, label-only Gmail filters; '+skipped+' were already present.');
  Logger.log('No automatic archive, delete, forwarding, permission approval or mark-as-read action is included.');
}
