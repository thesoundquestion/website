/* Optional search enhancement: all definitions remain visible without JavaScript. */
(()=>{"use strict";const input=document.getElementById("ag-query"),clear=document.getElementById("ag-clear"),count=document.getElementById("ag-count"),empty=document.getElementById("ag-no-results");if(!input||!clear||!count||!empty)return;
const cards=[...document.querySelectorAll("[data-glossary-term]")],sections=[...document.querySelectorAll("[data-glossary-section]")];
const haystack=cards.map(card=>({card,text:card.textContent.toLocaleLowerCase()}));
function refresh(){const q=input.value.trim().toLocaleLowerCase();let visible=0;for(const item of haystack){const match=!q||item.text.includes(q);item.card.hidden=!match;if(match)visible++;}
for(const section of sections){section.hidden=![...section.querySelectorAll("[data-glossary-term]")].some(card=>!card.hidden);}
clear.hidden=!q;empty.hidden=visible!==0;count.textContent=q?visible+" of "+cards.length+" listening terms match “"+input.value.trim()+"”." :cards.length+" listening terms across four groups.";}
input.addEventListener("input",refresh);clear.addEventListener("click",()=>{input.value="";refresh();input.focus();});refresh();})();