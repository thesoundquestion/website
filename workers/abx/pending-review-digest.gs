/**
 * The Sound Question moderation inbox digest.
 * Copy this file into a private Google Apps Script project owned by
 * thesoundquestion@gmail.com. It is NOT deployed from the website repository.
 *
 * Required Script Properties:
 * MODERATION_READ_SECRET = secret also set in the Cloudflare Worker
 * MODERATION_ENDPOINT = https://tsq-abx.thesoundquestion.workers.dev/v1/moderation/pending-counts
 *
 * Set the Apps Script project timezone to America/Halifax.
 * Run installDailyPendingDigest() once and grant the requested permissions.
 * No messages are sent when there are no entries pending approval.
 * Includes gear model nominations when the independent gear queue is enabled.
 */
const REVIEW_ADDRESS = 'thesoundquestion@gmail.com';
function sendPendingReviewDigest(){
  const config=PropertiesService.getScriptProperties();
  const secret=config.getProperty('MODERATION_READ_SECRET');
  const url=config.getProperty('MODERATION_ENDPOINT');
  if(!secret||secret.length<32||!/^https:\/\/tsq-abx\.thesoundquestion\.workers\.dev\/v1\/moderation\/pending-counts$/.test(url||'')){
    throw new Error('Missing or invalid private moderation notification settings.');
  }
  const response=UrlFetchApp.fetch(url,{method:'get',headers:{Authorization:'Bearer '+secret},muteHttpExceptions:true});
  if(response.getResponseCode()!==200)throw new Error('Moderation counter did not respond successfully ('+response.getResponseCode()+').');
  const result=JSON.parse(response.getContentText());
  const pending=Number(result.pending);
  if(!Number.isInteger(pending)||pending<0)throw new Error('Invalid pending count.');
  if(pending===0)return; // Quiet inbox when nothing needs approval.
  const counts=[
    ['Listening Room suggestions',result.listeningRoomSuggestions],
    ['Listening Room comments',result.listeningRoomComments],
    ['ABX Lab comments',result.abxComments],
    ['Equipment model recommendations',result.gearSuggestions]
  ];
  const text=[
    'There '+(pending===1?'is':'are')+' '+pending+' pending website '+(pending===1?'entry':'entries')+' awaiting review.',
    '',
    ...counts.map(([label,n])=>label+': '+Number(n||0)),
    '',
    'Review entries in Cloudflare Dashboard > Workers & Pages > D1 > tsq-abx-scores > Console.',
    'Read-only SQL:',
    "SELECT id,section,kind,category,artist,title,body FROM community_posts WHERE status='pending' ORDER BY created_at ASC LIMIT 50;",
    '',
    'Equipment models, if the gear queue is enabled:',
    "SELECT id,category,brand,model,variant,approx_year,region,reference_url FROM gear_suggestions WHERE status='pending' ORDER BY created_at ASC LIMIT 50;",
    '',
    'Approve or reject community entries manually; research gear models before publishing a preset. Nothing is published automatically.',
    '',
    'This is a daily digest. You will not receive one email per submission.'
  ].join('\n');
  GmailApp.sendEmail(REVIEW_ADDRESS,'The Sound Question: '+pending+' pending community '+(pending===1?'review':'reviews'),text);
}
function installDailyPendingDigest(){
  const name='sendPendingReviewDigest';
  for(const trigger of ScriptApp.getProjectTriggers()){
    if(trigger.getHandlerFunction()===name)ScriptApp.deleteTrigger(trigger);
  }
  ScriptApp.newTrigger(name).timeBased().everyDays(1).atHour(9).create();
}
