/* Share The Sound Question, no analytics or third-party scripts. */
(() => {
  'use strict';
  const url='https://thesoundquestion.pages.dev/';
  const btn=document.getElementById('nativeShare');
  const copy=document.getElementById('copySiteLink');
  const feedback=document.getElementById('shareFeedback');
  const announce=message=>{if(feedback)feedback.textContent=message};
  if(btn&&typeof navigator.share==='function'){
    btn.hidden=false;
    btn.addEventListener('click',async()=>{
      try{await navigator.share({title:'The Sound Question',text:'Explore audio through lessons and listening labs.',url});}
      catch(e){if(e?.name!=='AbortError')announce('Sharing could not open. Try Copy site link instead.')}
    });
  }
  if(copy)copy.addEventListener('click',async()=>{
    try{
      if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      announce('Site link copied.');
    }catch{announce('Copy this link: '+url)}
  });
})();
