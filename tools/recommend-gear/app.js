/* The Sound Question: standalone, moderated equipment suggestion form.
 * Public form enabled only after Worker and D1 validation. All entries stay private pending manual review.
 */
(() => {
  'use strict';
  const section=document.querySelector('#recommend-gear');
  const form=document.querySelector('#gear-suggestion-form');
  if(!section||!form)return;
  const status=document.querySelector('#gear-suggestion-status');
  const button=form.querySelector('button[type="submit"]');
  const endpoint='https://tsq-abx.thesoundquestion.workers.dev/v1/gear/submit';
  const ready=section.dataset.submissionsEnabled==='true';
  const report=(message)=>{status.textContent=message;};
  if(!ready){
    button.disabled=true;
    report('Preview only: this form is not accepting submissions yet. The private database service must pass its release checks first.');
    return;
  }
  button.disabled=false;
  report('Ready to receive model suggestions for private review.');
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const data=new FormData(form);
    const payload={
      category:String(data.get('category')||''),
      brand:String(data.get('brand')||''),
      model:String(data.get('model')||''),
      variant:String(data.get('variant')||''),
      approxYear:String(data.get('approxYear')||''),
      region:String(data.get('region')||''),
      referenceUrl:String(data.get('referenceUrl')||''),
      specifications:String(data.get('specifications')||''),
      website:String(data.get('website')||''),
      consent:data.get('consent')==='yes'
    };
    button.disabled=true;
    report('Sending your suggestion for review…');
    try{
      const res=await fetch(endpoint,{method:'POST',mode:'cors',
        headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      const response=await res.json();
      if(!res.ok)throw new Error(response.error||'The suggestion could not be saved.');
      report('Thanks! Your suggestion was saved for private review. Reference: '+response.receipt+
        '. Keep this if you want to request removal. Verified models may be added to the public preset library later.');
      form.reset();
    }catch(error){
      report((error instanceof Error?error.message:'Submission failed.')+
        ' Your information has not been confirmed saved. Please try again later.');
    }finally{button.disabled=false;}
  });
})();
