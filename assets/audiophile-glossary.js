/* Optional search enhancement: all definitions remain visible without JavaScript. */
(()=>{"use strict";const input=document.getElementById("ag-query"),clear=document.getElementById("ag-clear"),count=document.getElementById("ag-count"),empty=document.getElementById("ag-no-results");if(!input||!clear||!count||!empty)return;
const cards=[...document.querySelectorAll("[data-glossary-term]")],sections=[...document.querySelectorAll("[data-glossary-section]")];
const haystack=cards.map(card=>({card,text:card.textContent.toLocaleLowerCase()}));
function refresh(){const q=input.value.trim().toLocaleLowerCase();let visible=0;for(const item of haystack){const match=!q||item.text.includes(q);item.card.hidden=!match;if(match)visible++;}
for(const section of sections){section.hidden=![...section.querySelectorAll("[data-glossary-term]")].some(card=>!card.hidden);}
clear.hidden=!q;empty.hidden=visible!==0;count.textContent=q?visible+" of "+cards.length+" listening terms match “"+input.value.trim()+"”." :cards.length+" listening terms across four groups.";}
input.addEventListener("input",refresh);clear.addEventListener("click",()=>{input.value="";refresh();input.focus();});refresh();})();
/* Optional visual gallery: no-JS fallback displays all five comparisons. */
(()=>{
  'use strict';
  const panels=[...document.querySelectorAll('[data-ag-visual-panel]')];
  const buttons=[...document.querySelectorAll('[data-ag-visual-tab]')];
  const controls=document.querySelector('[data-ag-visual-tabs]');
  if(!controls||panels.length!==5||buttons.length!==5)return;
  const keys=new Set(panels.map(p=>p.dataset.agVisualPanel));
  function select(key){
    if(!keys.has(key))return;
    for(const panel of panels)panel.hidden=panel.dataset.agVisualPanel!==key;
    for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.agVisualTab===key));
  }
  for(const button of buttons)button.addEventListener('click',()=>select(button.dataset.agVisualTab));
  document.querySelectorAll('[data-ag-open-visual]').forEach(link=>{
    link.addEventListener('click',()=>select(link.dataset.agOpenVisual));
  });
  window.addEventListener('hashchange',()=>{
    const key=window.location.hash.replace('#visual-','');
    if(keys.has(key))select(key);
  });
  const initial=window.location.hash.startsWith('#visual-')?window.location.hash.slice(8):'width';
  select(keys.has(initial)?initial:'width');
  controls.hidden=false;
  const search=document.querySelector('#ag-query');
  const gallery=document.querySelector('#visual-examples');
  if(search&&gallery){
    const keywords=[
      ['width',['soundstage','stage width','wide','narrow']],
      ['imaging',['imaging','focused','diffuse']],
      ['separation',['separation','congestion','congested','crowded']],
      ['depth',['depth','holographic','layered','flat stage']],
      ['distance',['forward','laid-back','laid back','distance']]
    ];
    function syncSearch(){
      const term=search.value.trim().toLowerCase();
      if(!term){gallery.hidden=false;return;}
      const pair=keywords.find(([,words])=>words.some(word=>word.includes(term)||term.includes(word)));
      gallery.hidden=!pair;
      if(pair)select(pair[0]);
    }
    search.addEventListener('input',syncSearch);
    syncSearch();
  }
})();
