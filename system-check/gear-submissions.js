/* Optional public suggestion form. Reviewer-verified data enters gear.js separately. */
(() => {
  'use strict';
  const section=document.querySelector('#suggest-gear');
  const form=document.querySelector('#gear-suggestion-form');
  if(!section||!form)return;
  const status=document.querySelector('#gear-suggestion-status');
  const button=form.querySelector('button[type="submit"]');
  const ready=section.dataset.submissionsEnabled==='true';
  const endpoint='https://tsq-abx.thesoundquestion.workers.dev/v1/gear/submit';
  const report=(message)=>{status.textContent=message};
  if(!ready){
    button.disabled=true;
    report('Preview only. Suggestions cannot be sent until the moderated database service is tested and enabled.');
    return;
  }
  button.disabled=false;
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    button.disabled=true;
    report('Sending your suggestion for review…');
    const data=new FormData(form);
    const payload={
      category:String(data.get('category')||''),brand:String(data.get('brand')||''),
      model:String(data.get('model')||''),specifications:String(data.get('specifications')||''),
      referenceUrl:String(data.get('referenceUrl')||''),
      website:String(data.get('website')||''),
      consent:data.get('consent')==='yes'
    };
    try{
      const response=await fetch(endpoint,{method:'POST',mode:'cors',
        headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Could not submit the suggestion.');
      report('Saved for review. Your reference: '+result.receipt+
        '. This equipment is not yet an approved preset. Keep the reference if you need to request removal.');
      form.reset();
    }catch(error){report(error instanceof Error?error.message:'The suggestion could not be sent. Please try later.')}
    finally{button.disabled=false}
  });
})();
