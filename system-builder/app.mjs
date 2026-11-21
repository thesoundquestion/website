import {GOALS, describeBass, eligibleArchitectures, inspectOwnedPair} from './engine.mjs';
import {guideBuilderContext} from './guide-handoff.mjs';
import {bindListeningDistanceDefaults} from './listening-distance.mjs';
import {catalogueGearMatches,unlistedSpecAssessment} from './unlisted-gear.mjs';
import {parseSpeakerSpecText} from './spec-paste.mjs?v=passive-inference-20261120';
import {parseUnlistedSpecText} from './other-gear-spec-paste.mjs?v=sub-20261120';
import {headphoneDriveRequirement} from './headphone-drive.mjs';
import {headphoneAmplifierPlan,applyHeadphoneAmpChoice} from './headphone-amp-choice.mjs';
import {compareAlternative,compareElectronic} from './alternative-comparisons.mjs';
import {soundImpressionFor} from './tonal-impressions.mjs';
import {buildSearches,googleSearchUrl,normalizeModel} from '../system-check/spec-search.mjs';
import {builderIntent,builderFieldRequirement,handoffBuilderIntent,validateBuilderIntent,scopedBuilderInputs} from './intent-routing.mjs';
import {isPoweredSpeakerModel,isPoweredSpeakerRecord,availableSpeakersForIntent,POWERED_AMP_MESSAGE} from './speaker-route.mjs';
import {loadEquipmentCatalog} from '../equipment/catalog-client.mjs';
import {sharedGearAsLegacyView} from './shared-gear-adapter.mjs';
import {loadRegionalPriceTiers} from '../equipment/price-tier-client.mjs';
import {preferVerifiedPriceTier,pricingPreferenceCoverage,validPricePreference} from '../equipment/price-preference.mjs';
import {listeningCatalogOptions,listeningStudioCandidates,describeStudioMonitor} from '../equipment/builder-catalog-options.mjs';
import {shortlistExamples} from './recommendations.mjs';
import {explainInputInteractions} from './decision-context.mjs';
import {shortlistSpeakersForOwnedAmplifier,shortlistPartySpeakerLeads,shortlistPartyPassiveConcepts} from './owned-amp-speakers.mjs';
import {soundProfileFor, recommendationWhy} from './sound-profiles.mjs';
import {ownershipPlan} from './owned-gear-options.mjs';
import {explainBeginnerOption} from './beginner-output.mjs';
import {explainSimpleSystem} from './simple-system-summary.mjs';
import {BUILDER_ONLY_SPEAKERS, builderOnlySpeakerFor} from './supplemental-speakers.mjs';
import {BUILDER_ONLY_HEADPHONES, builderOnlyHeadphoneFor} from './supplemental-headphones.mjs';
import {BUILDER_ONLY_AMPS, builderOnlyAmpFor} from './supplemental-amplifiers.mjs';
import {usedWatchlistFor} from './used-amp-watchlist.mjs';
import {homeSubwooferRequest, ownedSubwooferPath, POWERED_SUB_PAIRS, poweredSubPairFor, USED_SUB_MODELS} from './stereo-subwoofer-examples.mjs';
import {subwooferConnections,knownSubExamplePlan} from './subwoofer-connection.mjs';


// These are illustrative, unweighted seat-level inputs, NOT a measured
// translation of the Builder's broad listening categories or a safety target.
const BUILDER_HEADROOM_PROFILES=Object.freeze({
  quiet:{average:65,gap:15,label:'Quiet / background'},
  moderate:{average:80,gap:15,label:'Comfortable / normal'},
  high:{average:85,gap:20,label:'Occasionally loud'}
});
function headroomHandoff(item,distanceFt,level,useCase='living_room'){
  const profile=BUILDER_HEADROOM_PROFILES[level]||BUILDER_HEADROOM_PROFILES.moderate;
  const params=new URLSearchParams({
    embedded:'1',autocheck:'1',speaker:item.speakerModel,amp:item.amplifierModel,
    distanceFt:String(distanceFt),average:String(profile.average),
    gap:String(profile.gap),profile:String(level||'moderate'),
    preferRoom:['outdoors','party'].includes(useCase)?'0':'1'
  });
  return {profile,params};
}

const el = (tag, className = '', text = '') => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};
const addText = (parent, tag, text, className = '') => {
  const node = el(tag, className, text);
  parent.append(node);
  return node;
};
function list(parent, statements, className = '') {
  const ul = el('ul', className);
  for (const statement of statements) addText(ul, 'li', statement);
  parent.append(ul);
  return ul;
}
function link(parent, url, text) {
  if (!url) return;
  let target;
  try { target = new URL(url, window.location.href); } catch { return; }
  if (target.protocol !== 'https:' && target.protocol !== 'http:') return;
  const a = el('a', 'sb-source-link', text);
  a.href = target.href;
  if (target.origin !== window.location.origin) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  parent.append(a);
}
const options = {
  passive_separates: {
    title: 'Traditional passive stereo',
    description: 'Two passive speakers (without built-in amplification), an amplifier or receiver that can safely drive them, and a way to connect and control the music source.',
    verify: ['Match actual speaker impedance minimum and phase to the amplifier maker’s permitted load.',
      'Use the existing System Check for sensitivity, distance, continuous/peak power and published test conditions.',
      'Price both speakers plus any missing amp, DAC/inputs, stands or cabling. A compatible owned amp adds zero incremental purchase cost.']
  },
  consumer_powered_pair: {
    title: 'Powered stereo pair',
    description: 'A complete left/right amplified speaker system. Some products include source switching and volume control; others do not.',
    verify: ['Confirm a stereo pair is included, not one speaker, and verify supported inputs and volume controls.',
      'Check power supply, DSP/input latency if relevant, sub routing and any fixed limitations on upgrading.',
      'Compare its full system cost with passive speakers plus every part not already owned.']
  },
  active_studio: {
    title: 'Active studio / desk monitors',
    description: 'Two studio-style speakers with built-in amplification. They are often priced one speaker at a time, and may need a separate volume control and suitable stereo connection.',
    verify: ['Budget for two cabinets, two power feeds, correct cables and interface/volume hardware where needed.',
      'Check input type, balanced/unbalanced adapters, nearfield hiss and controls at your actual seat.',
      'Compare measured nearfield response and low-frequency limits using compatible methods; avoid interpreting a per-cabinet max SPL as a pair rating.']
  },
  party_pa: {
    title: 'Portable party / PA',
    description: 'A venue-first route using portable battery systems, mains-powered party speakers or professional PA, depending on the actual event.',
    verify: ['Confirm audience size, coverage, weight, weather protection, safe mounting, and clean sustained output rather than headline peak watts.',
      'When off-grid operation is mandatory, AC-only options fail the requirement. Check battery runtime at the declared volume.',
      'Check official safety/serial recall instructions for any battery pack, and include necessary subwoofers, stands and transport in the price.']
  },
  headphone_first: {
    title: 'Headphone / IEM-first listening',
    description: 'A private listening chain with source, suitable headphone output and controls, plus comfort/fit that suits the listener.',
    verify: ['Check how loudly the headphones play from a stated input (sensitivity), their ohm rating, plug, fit, the source’s available power and whether both channels stay balanced at low volume.',
      'Open-back and closed-back are not numerical soundstage scores; isolation and room noise matter.',
      'Do not turn a headphone frequency-range endpoint into a claim of fidelity or detail.']
  }
};
const money = {CA:'CAD',US:'USD',GB:'GBP',EU:'EUR',AU:'AUD',other:'other'};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sb-form');
  if (!form) return;
  const guideHandoff=guideBuilderContext(window.location.search);
  const inventory = window.systemBuilderInventory || null;
  let sharedCatalog=null;
  let priceSnapshot=null;
  const catalogueByCategory=new Map();
  const originalOptions=new Map();
  let completeSpeakerChoices=[];
  function rememberSpeakerChoices(){
    const select=document.getElementById('sb-speaker');
    completeSpeakerChoices=[...select.children].map(node=>node.cloneNode(true));
  }
  function filterSpeakerChoicesForIntent(){
    const select=document.getElementById('sb-speaker');
    if(!select||!completeSpeakerChoices.length)return;
    const previous=select.value;
    select.replaceChildren(...completeSpeakerChoices.map(node=>node.cloneNode(true)));
    if(intentSelect.value==='amp_for_speakers'){
      const metadata={legacy:[...(inventory?.speaker||[]),...BUILDER_ONLY_SPEAKERS],
        shared:sharedCatalog?.records?.filter(x=>x.categories?.includes('speaker'))||[],pairs:POWERED_SUB_PAIRS};
      for(const option of [...select.querySelectorAll('option')]){
        if(option.value && isPoweredSpeakerModel(option.value,metadata))option.remove();
      }
      for(const group of select.querySelectorAll('optgroup')){
        if(!group.querySelector('option'))group.remove();
      }
    }
    select.value=[...select.options].some(option=>option.value===previous)?previous:'';
    if(previous && previous!==select.value)refreshGearSearch('speaker');
  }
  const state = document.getElementById('sb-inventory-state');
  const catalogAlert=document.getElementById('sb-catalog-alert');
  const showCatalogAlert=(message)=>{
    if(!catalogAlert)return;
    catalogAlert.textContent=message||'';
    catalogAlert.hidden=!message;
  };
  const result = document.getElementById('sb-results');
  const body = document.getElementById('sb-result-body');
  const goal = form.elements.namedItem('goal');
  const architecture = form.elements.namedItem('architecture');
  const headphonePreferences = document.getElementById('sb-headphone-preferences');
  const headphoneAmpSetup=document.getElementById('sb-headphone-amp-setup');
  const headphoneAmpChoice=form.elements.namedItem('headphoneAmpChoice');
  const headphoneDacChoice=form.elements.namedItem('headphoneDacChoice');
  const headphoneSource=form.elements.namedItem('headphoneSource');
  const headphoneAmpGuidance=document.getElementById('sb-headphone-amp-guidance');
  const syncHeadphoneInputs=()=>{
    const active=architecture.value==='headphone_first';
    if(headphonePreferences)headphonePreferences.hidden=!active;
    if(headphoneAmpSetup)headphoneAmpSetup.hidden=!active;
    if(headphoneAmpChoice){headphoneAmpChoice.disabled=!active;headphoneAmpChoice.required=active;}
    if(headphoneDacChoice){headphoneDacChoice.disabled=!active;headphoneDacChoice.required=active;}
    if(headphoneSource)headphoneSource.disabled=!active;
    if(headphoneAmpGuidance&&active){
      const choice=headphoneAmpChoice.value;
      const dac=headphoneDacChoice.value;
      headphoneAmpGuidance.textContent=dac==='combo'
        ?'A combined DAC/amp includes both functions. We will show a compatible-source example and its headphone output.'
        :dac==='separate'
          ?'A standalone DAC provides line-level output. If no headphone amplifier is included, you need an existing suitable headphone output downstream.'
          :choice==='yes'
            ?'We will show documented headphone amplifiers when your source can connect to them. Exact headphone drive and price still need checking.'
            :choice==='no'?'No new headphone amplifier will be added. We will check what your existing headphone output must provide.'
              :'We will help you decide whether any additional headphone electronics are useful.';
    }
  };
  architecture.addEventListener('change',()=>{syncHeadphoneInputs();updateFieldRequirements();});
  headphoneAmpChoice.addEventListener('change',()=>{
    if(headphoneAmpChoice.value==='no'&&headphoneDacChoice.value==='combo')
      headphoneDacChoice.value='';
    syncHeadphoneInputs();
  });
  headphoneDacChoice.addEventListener('change',()=>{
    if(headphoneDacChoice.value==='combo')headphoneAmpChoice.value='yes';
    syncHeadphoneInputs();
  });
  headphoneSource.addEventListener('change',syncHeadphoneInputs);
  syncHeadphoneInputs();
  const subMode = form.elements.namedItem('subMode');
  const subOwnedField = form.elements.namedItem('subOwned');
  const extras = [...form.querySelectorAll('[name="secondary"]')];
  let subOwnershipChosen = false;

  if (inventory) {
    const names = {speaker:'speaker',amp:'amp',source:'source',headphone:'headphone'};
    for (const [kind,id] of Object.entries(names)) {
      const select = document.getElementById('sb-' + id);
      for (const record of inventory[kind] || []) {
        const option = el('option', '', record.model);
        option.value = record.model;
        select.append(option);
      }
      const supplements=kind==='speaker' ? [...BUILDER_ONLY_SPEAKERS,...POWERED_SUB_PAIRS] :
        kind==='headphone' ? BUILDER_ONLY_HEADPHONES :
        kind==='amp' ? BUILDER_ONLY_AMPS : [];
      for (const record of supplements) {
        if ((inventory[kind] || []).some(x=>x.model===record.model)) continue;
        const option=el('option','',record.model+' (Builder addition)');
        option.value=record.model;
        select.append(option);
      }
    }
    const count = Object.values(inventory).reduce((n, records) => n + records.length, 0);
    state.textContent = count + ' existing System Check presets loaded (read-only) · '+
      BUILDER_ONLY_SPEAKERS.length+' sourced passive speakers · '+
      BUILDER_ONLY_HEADPHONES.length+' wired headphones · '+
      BUILDER_ONLY_AMPS.length+' additional amplifiers and receivers · '+POWERED_SUB_PAIRS.length+' powered pairs.';
  } else {
    state.textContent = 'The saved preset catalog did not load. Unlisted model inputs remain available; no specs will be assumed.';
    showCatalogAlert('Saved equipment presets did not load. The Builder can still accept sourced manual specifications, but automatic matches may be incomplete.');
  }
  rememberSpeakerChoices();

  function syncGoals() {
    const chosen = extras.filter(x => x.checked && x.value !== goal.value);
    for (const x of extras) {
      if (x.value === goal.value) x.checked = false;
      x.disabled = x.value === goal.value || (chosen.length >= 2 && !x.checked);
    }
    document.getElementById('sb-goal-note').textContent =
      chosen.length + ' of 2 extra priorities chosen. These are qualitative directions, not invented percentages.';
  }
  goal.addEventListener('change', syncGoals);
  extras.forEach(x => x.addEventListener('change', syncGoals));
  syncGoals();

  if(guideHandoff){
    for(const [key,value] of Object.entries(guideHandoff.prefill)){
      const field=form.elements.namedItem(key);
      if(field && [...(field.options||[])].some(x=>x.value===value))field.value=value;
    }
    syncGoals();
    syncHeadphoneInputs();
    const panel=el('section','sb-preview sb-guide-handoff');
    panel.setAttribute('aria-label','Your choices from Find My Setup');
    addText(panel,'h2',guideHandoff.title);
    addText(panel,'p',guideHandoff.summary);
    addText(panel,'p','We carried over a few category choices from your guide. Review or change any Builder inputs. No equipment model has been guessed, and a source-to-speaker connection is not certified.');
    const detail=el('details','sb-more');
    addText(detail,'summary','What still needs checking');
    list(detail,guideHandoff.checks);
    panel.append(detail);
    form.before(panel);
  }

  // Use the room-specific starting distance, including any optional guide
  // handoff choice, without overwriting a visitor's manually entered feet.
  bindListeningDistanceDefaults(form);

  // The task picker is the actual first step. Existing, source-backed
  // equipment selectors are moved, never cloned, so the original Builder
  // validation and catalog remain authoritative.
  const intentSelect=form.elements.namedItem('buildIntent');
  const quick=document.getElementById('sb-quick-setup');
  const advanced=document.getElementById('sb-advanced-form');
  const actionButtons=document.getElementById('sb-actions');
  const sourceHelp=document.getElementById('sb-source-help');
  const intentNote=document.getElementById('sb-intent-note');
  const intentFeedback=document.getElementById('sb-intent-feedback');
  const requiredGroupHelp=document.getElementById('sb-required-group-help');
  const moved=new Map();
  const reference=document.querySelector('.sb-listening-reference');
  const setFeedback=message=>{
    intentFeedback.textContent=message;
    intentFeedback.hidden=!message;
  };
  function restoreQuickFields(){
    for(const [node,marker] of moved){
      if(marker.parentNode)marker.replaceWith(node);
    }
    moved.clear();
    quick.replaceChildren();
  }
  function showQuickNode(node){
    if(!node||moved.has(node))return;
    const marker=document.createComment('Original Builder field position');
    node.replaceWith(marker);
    moved.set(node,marker);
    quick.append(node);
  }
  function updateFieldRequirements(){
    const id=intentSelect.value;
    const route=builderIntent(id);
    const messages={
      required:'Required',
      required_either:'Required: choose here OR type below',
      optional_alternative:'Search for my gear (if not listed)',
      required_if_unlisted:'Required for an unlisted model',
      optional:'Optional'
    };
    // The label wraps the actual field, so screen-reader users hear the same
    // requirement as sighted users. Every dropdown/text/number input gets one.
    for(const label of form.querySelectorAll('label.sb-field')){
      const field=label.querySelector('select, input:not([type="checkbox"])');
      if(!field)continue;
      let rule=['headphoneAmpChoice','headphoneDacChoice'].includes(field.name)&&
        architecture.value==='headphone_first'
        ?'required':builderFieldRequirement(id,field.name);
      if(rule==='required_if_unlisted'){
        const kind=field.name.startsWith('speaker')?'speaker':'amp';
        const hasCustom=String(form.elements.namedItem(kind+'Other')?.value||'').trim();
        if(!hasCustom)rule='optional';
      }
      let status=label.querySelector('.sb-field-requirement');
      if(!status){
        status=el('span','sb-field-requirement');
        label.insertBefore(status,field);
      }
      status.textContent=messages[rule];
      status.dataset.requirement=rule;
      // A model may be selected in the dropdown OR typed in a second input.
      // Never mark either alternative individually required in the browser.
      field.required=rule==='required';
      if(rule==='required_either'||rule==='optional_alternative')
        field.setAttribute('aria-describedby','sb-required-group-help');
      else if(field.getAttribute('aria-describedby')==='sb-required-group-help')
        field.removeAttribute('aria-describedby');
    }
    requiredGroupHelp.hidden=!route?.requiredOwn;
    if(route?.requiredOwn){
      const name=route.requiredOwn==='speaker'?'speakers':'amplifier or receiver';
      requiredGroupHelp.textContent='Required: identify the '+name+
        ' you already have. Choose a sourced model from the list, OR search for your unlisted model and add the relevant figures from its manufacturer specifications. A name alone is not enough for matching.';
    }else requiredGroupHelp.textContent='';
  }
  function setBuilderIntent({preserveGuide=false}={}){
    const id=intentSelect.value;
    const route=builderIntent(id);
    restoreQuickFields();
    setFeedback('');
    if(advanced)advanced.open=false;
    if(!route){
      quick.hidden=true;
      advanced.hidden=true;
      filterSpeakerChoicesForIntent();
      sourceHelp.hidden=true;
      actionButtons.hidden=true;
      intentNote.textContent='Pick a task first. You never need to enter specifications for equipment you have not bought.';
      updateFieldRequirements();
      return;
    }
    intentNote.textContent=route.description+' All other information is optional and can be added under More choices.';
    if(route.architecture)architecture.value=route.architecture;
    else if(!preserveGuide)architecture.value='open';
    if(id==='subwoofer'){
      subMode.value='plan_sub';
      subOwnedField.value='no';
    }
    syncHeadphoneInputs();
    syncSub();
    advanced.hidden=Boolean(route.directRoute);
    sourceHelp.hidden=!route.directRoute;
    actionButtons.hidden=Boolean(route.directRoute);
    quick.hidden=Boolean(route.directRoute);
    if(route.directRoute){
      filterSpeakerChoicesForIntent();
      updateFieldRequirements();
      return;
    }
    for(const key of route.fields){
      const control=form.elements.namedItem(key);
      const node=control?.closest('label');
      if(node)showQuickNode(node);
      if(key.endsWith('Other')&&['speaker','amp','source','headphone'].includes(key.slice(0,-5)))
        showQuickNode(document.getElementById('sb-'+key.slice(0,-5)+'-search'));
      if(key==='level'&&reference)showQuickNode(reference);
    }
    if(id==='subwoofer'){
      // The task-first layout moves individual controls into its quick form.
      // Also move the associated paste UI, otherwise it remains hidden in
      // the collapsed advanced section and cannot be used on mobile.
      for(const key of ['sb-sub-spec-paste','sb-sub-spec-fill',
        'sb-sub-spec-feedback','sb-sub-spec-observations']){
        const node=document.getElementById(key);
        showQuickNode(key==='sb-sub-spec-paste'?node?.closest('label'):node);
      }
    }
    filterSpeakerChoicesForIntent();
    updateFieldRequirements();
    // No route asks visitors for unowned product specifications. The advanced
    // section is still available to people who want technical fine-tuning.
  }
  intentSelect.addEventListener('change',()=>setBuilderIntent());
  function renderSetupWorkflow(parent,{steps=[],equipment=''}={}, {collapsed=false}={}){
    const panel=el('section','sb-setup-workflow');
    addText(panel,'h5','How will this setup work?');
    const ordered=el('ol','sb-setup-steps');
    for(const step of steps)if(typeof step==='string'&&step.trim())
      addText(ordered,'li',step);
    if(!ordered.children.length)
      addText(ordered,'li','Confirm the source, amplification, output and speakers or headphones in the selected system.');
    panel.append(ordered);
    if(equipment)addText(panel,'p',equipment,'sb-setup-equipment');
    if(collapsed){
      const disclosure=el('details','sb-setup-disclosure');
      addText(disclosure,'summary','How to connect this setup');
      disclosure.append(panel);
      parent.append(disclosure);
    }else parent.append(panel);
    return panel;
  }
  function renderSubwooferWiring(parent,plan,{heading='How the subwoofer connects',showSources=true}={}){
    const box=el('div','sb-sub-route');
    addText(box,'h4',heading);
    addText(box,'p',plan.title,'sb-sub-connection-kind');
    addText(box,'p',plan.signal);
    addText(box,'p','Wiring: '+plan.cable,'sb-sub-cable');
    addText(box,'h5','Will this take bass away from the main speakers?');
    addText(box,'p',plan.mainBass,'sb-sub-main-filter');
    addText(box,'p','Before connecting: '+plan.next,'sb-sub-next');
    if(plan.warnings.length){
      const d=el('details','sb-sub-routing-detail');
      addText(d,'summary','Important connection notes');
      list(d,plan.warnings);
      box.append(d);
    }
    if(showSources&&plan.sourceLinks.length){
      const d=el('details','sb-sub-routing-detail');
      addText(d,'summary','Manufacturer instructions and connection evidence');
      for(const source of plan.sourceLinks)link(d,source.url,source.title);
      box.append(d);
    }
    parent.append(box);
    return box;
  }
  const preselectedIntent=handoffBuilderIntent(guideHandoff);
  if(preselectedIntent)intentSelect.value=preselectedIntent;
  setBuilderIntent({preserveGuide:Boolean(preselectedIntent)});

  function syncSub() {
    const sub = subMode.value !== 'no_sub';
    document.getElementById('sb-sub-count').hidden = !sub;
    document.getElementById('sb-sub-owned').hidden = !sub;
  }
  subMode.addEventListener('change', () => {
    if (!subOwnershipChosen) subOwnedField.value = subMode.value === 'plan_sub' ? 'no' : 'yes';
    syncSub();
  });
  subOwnedField.addEventListener('change', () => { subOwnershipChosen = true; });
  syncSub();

  form.elements.namedItem('region').addEventListener('change', ev => {
    form.elements.namedItem('currency').value = money[ev.target.value] || 'other';
    reorderListeningPriceChoices();
  });
  form.elements.namedItem('pricePreference')?.addEventListener('change',reorderListeningPriceChoices);
  // One live lookup, same model-aware search queries as System Check.
  // A saved exact model keeps the already verified fields; no web scraping.
  const modelKey=value=>normalizeModel(value).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  function refreshGearSearch(kind){
    const panel=document.getElementById('sb-'+kind+'-search');
    if(!panel)return;
    const typed=normalizeModel(form.elements.namedItem(kind+'Other')?.value||'');
    const preset=form.elements.namedItem(kind);
    const matches=panel.querySelector('[data-gear-matches]');
    const searches=panel.querySelector('[data-gear-searches]');
    const manual=panel.querySelector('[data-gear-details]');
    const message=panel.querySelector('[data-gear-message]');
    panel.hidden=!typed;
    matches.replaceChildren();
    searches.replaceChildren();
    if(!typed)return;
    const options=[...preset.options].filter(x=>x.value).map(x=>({model:x.value}));
    const saved=catalogueGearMatches(options,typed,6);
    const exact=saved.filter(x=>modelKey(x.model)===modelKey(typed));
    if(exact.length===1){
      preset.value=exact[0].model;
      form.elements.namedItem(kind+'Other').value='';
      panel.hidden=true;
      updateFieldRequirements();
      return;
    }
    for(const match of saved){
      const choose=el('button','button button-secondary','Use saved model: '+match.model);
      choose.type='button';
      choose.addEventListener('click',()=>{
        preset.value=match.model;
        form.elements.namedItem(kind+'Other').value='';
        refreshGearSearch(kind);
        updateFieldRequirements();
      });
      matches.append(choose);
    }
    for(const [index,query] of buildSearches(kind,typed).entries()){
      const link=el('a','sb-search-link'+(index===0?' sb-search-link-primary':''),query.label+' (opens new tab) ↗');
      link.href=googleSearchUrl(query.query);
      // Keep the in-progress Builder form in its original browser tab.
      // Browsers may use a second tab rather than a separate window on mobile.
      link.target='_blank';link.rel='noopener noreferrer';
      // When returning from the manufacturer/spec search, the paste box and
      // individual verified-value fields should already be in view.
      link.addEventListener('click',()=>{manual.hidden=false;manual.open=true;});
      searches.append(link);
    }
    const hasSuggestions=saved.length>0;
    // A similar catalogue model does not mean this exact model is saved.
    // Keep manual source-backed entry available even when suggestions appear.
    manual.hidden=false;
    if(!hasSuggestions)manual.open=true;
    // Once the visitor opens the form, preserve it while typing more model
    // text. A similar saved-model suggestion must not hide pasted work.
    message.textContent=hasSuggestions
      ?'Choose an exact saved model above, or open Not in the catalogue to enter the documented specifications for your different model.'
      :'No saved model matched. Use the searches above, then enter only the documented facts this match requires.';
  }
  const speakerPaste=document.getElementById('sb-speaker-spec-paste');
  const speakerFill=document.getElementById('sb-speaker-spec-fill');
  const speakerPasteFeedback=document.getElementById('sb-speaker-spec-feedback');
  const speakerReview=document.getElementById('sb-speaker-spec-observations');
  if(speakerPaste&&speakerFill&&speakerPasteFeedback){
    speakerFill.addEventListener('click',()=>{
      const parsed=parseSpeakerSpecText(speakerPaste.value);
      const copied=[],preserved=[];
      for(const [name,value] of Object.entries(parsed.fields)){
        const input=form.elements.namedItem(name);
        if(!input)continue;
        if(String(input.value).trim()){
          preserved.push(name);
          continue;
        }
        input.value=String(value);
        input.dispatchEvent(new Event('input',{bubbles:true}));
        copied.push(name);
      }
      const label={
        speakerPowerType:'speaker type',speakerLoad:'nominal impedance',speakerMinimum:'minimum impedance',
        speakerSensitivity:'listening sensitivity',speakerBasis:'sensitivity basis',
        speakerSensitivityEnvironment:'measurement setting',speakerAnechoic:'anechoic reference',
        speakerRecommendedAmpMin:'recommended amplifier minimum',
        speakerRecommendedAmpMax:'recommended amplifier maximum',
        speakerMaxInput:'listed maximum speaker input'
      };
      const unit={speakerPowerType:'',speakerLoad:' Ω',speakerMinimum:' Ω',speakerSensitivity:' dB',speakerBasis:'',
        speakerAnechoic:' dB',speakerSensitivityEnvironment:'',
        speakerRecommendedAmpMin:' W',speakerRecommendedAmpMax:' W',speakerMaxInput:' W'};
      const recognised=Object.entries(parsed.fields).map(([name,value])=>
        label[name]+': '+value+(unit[name]||''));
      const description=copied.length
        ?'Filled: '+copied.map(name=>label[name]).join(', ')+'. '
        :'No new fields were filled. ';
      const existing=preserved.length
        ?'Existing values were kept; clear a field if you want to replace it. ':'';
      const readout=recognised.length
        ?'Recognised from paste: '+recognised.join('; ')+'. '
        :'No usable labelled values recognised. Try including the field name, number and unit together, for example "Nominal impedance: 8 Ω". ';
      speakerPasteFeedback.textContent=description+readout+existing+
        ' Review the fields below, identify passive or powered, and paste the original manufacturer URL.';
      if(speakerReview){
        speakerReview.replaceChildren();
        for(const note of [...(parsed.observations||[]),...parsed.notes])
          addText(speakerReview,'li',note);
        speakerReview.hidden=!speakerReview.children.length;
      }
      updateFieldRequirements();
    });
  }
  const specFieldLabels={
    ampMinLoad:'supported speaker impedance',
    ampRatedWatts:'watts per channel',
    ampRatedLoad:'amplifier power test load',
    sourceOutput:'audio output',
    headphoneLoad:'headphone impedance',
    headphoneSensitivity:'headphone sensitivity',
    headphoneBasis:'sensitivity reference'
  };
  for(const kind of ['amp','source','headphone']){
    const textarea=document.getElementById('sb-'+kind+'-spec-paste');
    const fill=document.getElementById('sb-'+kind+'-spec-fill');
    const feedback=document.getElementById('sb-'+kind+'-spec-feedback');
    const review=document.getElementById('sb-'+kind+'-spec-observations');
    if(!textarea||!fill||!feedback||!review)continue;
    fill.addEventListener('click',()=>{
      const found=parseUnlistedSpecText(kind,textarea.value);
      const copied=[],preserved=[];
      for(const [name,value] of Object.entries(found.fields)){
        const input=form.elements.namedItem(name);
        if(!input)continue;
        if(String(input.value).trim()){
          preserved.push(specFieldLabels[name]||name);
          continue;
        }
        input.value=String(value);
        input.dispatchEvent(new Event('input',{bubbles:true}));
        copied.push((specFieldLabels[name]||name)+': '+value);
      }
      feedback.textContent=copied.length
        ?'Filled: '+copied.join('; ')+'. Review or correct below.'
        :'No new fields filled. Use the editable boxes below for any missing specification.';
      if(preserved.length)feedback.textContent+=' Existing values retained: '+preserved.join(', ')+'.';
      review.replaceChildren();
      for(const note of [...(found.observations||[]),...(found.notes||[])])
        addText(review,'li',note);
      review.hidden=!review.children.length;
      updateFieldRequirements();
    });
  }
  const subPaste=document.getElementById('sb-sub-spec-paste');
  const subFill=document.getElementById('sb-sub-spec-fill');
  const subFeedback=document.getElementById('sb-sub-spec-feedback');
  const subReview=document.getElementById('sb-sub-spec-observations');
  if(subPaste&&subFill&&subFeedback&&subReview){
    subFill.addEventListener('click',()=>{
      const parsed=parseUnlistedSpecText('sub',subPaste.value);
      const copied=[],kept=[];
      for(const [name,value] of Object.entries(parsed.fields)){
        const field=form.elements.namedItem(name);
        if(!field)continue;
        if(field.value&&field.value!=='unknown'){kept.push(name);continue;}
        field.value=value;
        field.dispatchEvent(new Event('change',{bubbles:true}));
        copied.push(name+': '+value);
      }
      subFeedback.textContent=copied.length?
        'Recognised and filled: '+copied.join(', ')+'. Confirm the connections below.':
        'No new connections filled. Use the dropdowns below for anything not recognised.';
      if(kept.length)subFeedback.textContent+=' Your existing choices were retained.';
      subReview.replaceChildren();
      for(const note of [...parsed.observations,...parsed.notes])addText(subReview,'li',note);
      subReview.hidden=!subReview.children.length;
    });
  }
  for(const kind of ['speaker','amp','source','headphone']){
    const preset=form.elements.namedItem(kind);
    const typed=form.elements.namedItem(kind+'Other');
    preset.addEventListener('change',()=>{
      if(preset.value)typed.value='';
      refreshGearSearch(kind);
      updateFieldRequirements();
    });
    typed.addEventListener('input',()=>{
      if(typed.value.trim())preset.value='';
      refreshGearSearch(kind);
      updateFieldRequirements();
    });
    refreshGearSearch(kind);
  }
  form.addEventListener('reset', () => queueMicrotask(() => {
    subOwnershipChosen = false;
    for(const kind of ['speaker','amp','source','headphone'])refreshGearSearch(kind);
    syncGoals(); syncSub(); syncHeadphoneInputs(); result.hidden = true;
    intentSelect.value='';
    setBuilderIntent();
  }));

  const kindsForCategory={
    speaker:['speaker'],amp:['amp'],source:['source','computer_sound_card','audio_interface','headphone_amplifier'],
    headphone:['headphone']
  };
  function availableShared(kind){
    return sharedCatalog?.records?.filter(x=>kindsForCategory[kind].some(cat=>x.categories.includes(cat)))||[];
  }
  // The canonical registry is the primary equipment menu source.
  // These groupings come from actual device roles, not brand guesses.
  // Old static presets remain a fallback only if the catalogue cannot load.
  function reorderListeningPriceChoices(){
    if(!sharedCatalog)return;
    const region=String(form.elements.namedItem('region').value||'CA');
    const preference=validPricePreference(String(form.elements.namedItem('pricePreference')?.value||'any'));
    let matching=0,unpriced=0,listed=0;
    for(const kind of ['speaker','amp','source','headphone']){
      const select=document.getElementById('sb-'+kind);
      if(!select)continue;
      const previous=select.value;
      const buckets=listeningCatalogOptions(sharedCatalog,kind,{prices:priceSnapshot,region,preference});
      select.replaceChildren();
      const placeholder=el('option','','None selected / not owned');
      placeholder.value='';select.append(placeholder);
      for(const bucket of buckets){
        matching+=bucket.coverage.matched;
        unpriced+=bucket.coverage.unknown;
        listed+=bucket.items.length;
        if(!bucket.items.length)continue;
        const group=document.createElement('optgroup');group.label=bucket.title;
        for(const entry of bucket.items){
          const option=el('option','',entry.model);
          option.value=entry.model;
          // The group title carries the critical powered/passive distinction.
          // A priced model may still be unfit for this listener.
          group.append(option);
        }
        select.append(group);
      }
      // Legacy "powered stereo pair" examples are a distinct editorial
      // supplement, not independently inventoried single-cabinet models.
      if(kind==='speaker'){
        const seen=new Set(buckets.flatMap(b=>b.items.map(x=>x.model)));
        const extras=POWERED_SUB_PAIRS.filter(x=>!seen.has(x.model));
        if(extras.length){
          const group=document.createElement('optgroup');
          group.label='Additional powered stereo pair examples · check exact package';
          for(const entry of extras){
            const option=el('option','',entry.model+' (example only)');option.value=entry.model;
            group.append(option);
          }
          select.append(group);
        }
      }
      if(previous&&![...select.options].some(item=>item.value===previous)){
        // The canonical price/category menu may omit legacy supplements.
        // Do not erase a still-verified model selected before async loading.
        const stillKnown=(inventory?.[kind]||[]).some(x=>x.model===previous)||
          availableShared(kind).some(x=>x.model===previous||x.aliases?.includes(previous))||
          (kind==='speaker'&&Boolean(builderOnlySpeakerFor(previous)||poweredSubPairFor(previous)))||
          (kind==='headphone'&&Boolean(builderOnlyHeadphoneFor(previous)))||
          (kind==='amp'&&Boolean(builderOnlyAmpFor(previous)));
        if(stillKnown){
          const group=el('optgroup');
          group.label='Your selected sourced model';
          const savedOption=el('option','',previous);
          savedOption.value=previous;
          group.append(savedOption);
          select.append(group);
        }
      }
      if([...select.options].some(item=>item.value===previous))select.value=previous;
      else select.value='';
    }
    rememberSpeakerChoices();
    filterSpeakerChoicesForIntent();
    const message=preference==='any'?'No retail category weighted.':
      matching>0?matching+' current '+region+' product(s) match the preferred price tier and appear earlier within their equipment type.':
        'No current '+region+' price-tier matches in these categories; catalogue order is unchanged.';
    const info=document.getElementById('sb-price-evidence');
    if(info)info.textContent=message+' '+unpriced+' catalogue entries lack comparable price evidence. Price categories are not quality or safety scores.';
    state.textContent='Canonical equipment catalogue loaded: '+sharedCatalog.records.length+
      ' unique products, '+listed+' listening-category entries. Powered studio monitors, PA speakers and passive models are identified separately. '+
      'Every unknown specification remains unknown.';
  }
  async function attachSharedInventory(){
    try{
      sharedCatalog=await loadEquipmentCatalog({url:'/equipment/catalog.generated.json?v=psb-alpha-20261120'});
      try{priceSnapshot=await loadRegionalPriceTiers()}catch{priceSnapshot=null}
      reorderListeningPriceChoices();
      if(inventory)showCatalogAlert('');
    }catch(error){
      state.textContent+=' Canonical catalogue unavailable; showing legacy fallback presets only. No missing facts are inferred.';
      showCatalogAlert('The shared equipment catalogue could not load. Some saved models are unavailable; older verified presets remain available. Refresh the preview or check the local server.');
      console.warn('[TSQ Builder] Canonical equipment catalogue load failed:',error);
    }
  }
  const catalogReady=attachSharedInventory();

  function chosenGear(data, kind) {
    const exact = String(data.get(kind) || '');
    const custom = exact ? '' : String(data.get(kind+'Other') || '').trim();
    const shared=availableShared(kind).find(x=>x.model===exact||x.aliases?.includes(exact));
    const record = (inventory?.[kind] || []).find(x => x.model === exact) ||
      (kind==='speaker' ? builderOnlySpeakerFor(exact) || poweredSubPairFor(exact) :
        kind==='headphone' ? builderOnlyHeadphoneFor(exact) :
        kind==='amp' ? builderOnlyAmpFor(exact) : null) ||
      (shared?sharedGearAsLegacyView(shared,kind):null);
    const submitted=custom?unlistedSpecAssessment(kind,data):null;
    const resolved=custom?submitted?.record:record;
    return {name: custom || resolved?.model || '', record: resolved||null,
      unlisted: !!custom,userSupplied:submitted?.state==='provisional',
      specStatus:submitted?.state||'catalogue',specMessage:submitted?.message||''};
  }
  let reportContainer = null;
  function section(title) {
    // The regular shortlist stays visible; the engineering appendix is opt-in.
    // Its individual sections are independently expandable for quick scanning.
    const withinAudit = !!reportContainer;
    const node = el(withinAudit ? 'details' : 'section', withinAudit ? 'sb-audit-part' : '');
    addText(node, withinAudit ? 'summary' : 'h3', title);
    (reportContainer || body).append(node);
    return node;
  }
  function dedicatedSubReport(data){
    const amp=chosenGear(data,'amp');
    const speakers=chosenGear(data,'speaker');
    const model=String(data.get('subName')||'').trim();
    const subOwned=String(data.get('subOwned')||'no');
    const plan=subwooferConnections({
      ampName:amp.name,subName:model,
      ampOutput:String(data.get('subAmpOutput')||'unknown'),
      subInput:String(data.get('subInput')||'unknown'),
      highPass:String(data.get('subHighPass')||'unknown'),
      subOwned
    });
    const box=el('section','sb-sub-intent-report');
    addText(box,'h3','Your subwoofer connection plan');
    const owned=[amp.name?speakers.name?amp.name+' and '+speakers.name:amp.name:speakers.name];
    if(owned[0])addText(box,'p','Building around: '+owned[0]+(model?' · Subwoofer: '+model:''));
    if(!amp.name&&!speakers.name)
      addText(box,'p','You can explore the wiring without entering a model. We will need your equipment’s exact connections before calling a particular hookup ready.');
    const kind=plan.direct?'A connection route to check':'Further information or hardware needed';
    addText(box,'p',kind,'sb-sub-connection-kind');
    renderSetupWorkflow(box,{
      steps:[
        'Keep '+(speakers.name||'your main speakers')+' connected through their intended amplification; the subwoofer supplements their bass.',
        plan.signal,
        plan.mainBass
      ],
      equipment:'Wiring: '+plan.cable
    });
    renderSubwooferWiring(box,plan,{heading:'Connection details for this setup'});
    if(!model&&!['speaker_high','both'].includes(plan.input)&&plan.output==='speaker_only'){
      addText(box,'p','Shopping tip: a powered subwoofer with compatible high-level inputs may be easier to add to an amplifier that only has speaker terminals. Otherwise include the cost of a manufacturer-approved converter.');
    }
    if(!model&&!['speaker_only','unknown'].includes(plan.output)){
      addText(box,'p','Shopping tip: look for a powered subwoofer with a compatible RCA line input and documented controls. The Edifier T5 is one example of an RCA-input subwoofer, not a fit guarantee.');
      link(box,'https://www.edifier.com/int/ca/p/subwoofers/t5','Edifier T5 input information');
    }
    addText(box,'p','A subwoofer purchase may also need a longer signal cable, speaker wire or a converter, a nearby power outlet, room for placement and time to adjust volume and crossover. Those extras are not included in a generic subwoofer price.','sb-sub-cost');
    addText(box,'p','No amplifier watts or speaker impedance rating is needed to identify the basic subwoofer signal path. This connection plan does not promise how much bass the system will produce.','sb-help');
    body.append(box);
    const note=el('details','sb-audit');
    addText(note,'summary','What is high-pass filtering, and why does it matter?');
    addText(note,'p','A low-pass filter limits the high frequencies going to the sub. A high-pass filter limits low frequencies going to the main speakers. Some receivers or powered speaker systems do both; a normal RCA sub output alone does not prove the main speakers are filtered.');
    addText(note,'p','When bass is deliberately reduced in the main speakers, they may have less low-frequency work to do. That benefit depends on the actual crossover and settings. Do not credit it if the wiring is unknown.');
    body.append(note);
  }

  function report(data) {
    body.replaceChildren();
    reportContainer = null;
    if(guideHandoff){
      const bridge=el('section','sb-preview sb-guide-result');
      addText(bridge,'h3','Your original question: '+guideHandoff.title);
      addText(bridge,'p','The examples below address speaker, amplifier and listening choices using your reviewed Builder inputs. They do not automatically prove the source chain or guarantee a complete purchase.');
      list(bridge,guideHandoff.checks);
      if(guideHandoff.intent==='vinyl')
        addText(bridge,'p','Important: turntable, cartridge and phono-preamp prices are NOT included in the Builder’s displayed system subtotals. An eligible amplifier/speaker suggestion alone is not a complete vinyl system cost.','sb-brief-note');
      body.append(bridge);
    }
    if(String(data.get('buildIntent'))==='subwoofer'){
      dedicatedSubReport(data);
      return;
    }
    const primary = String(data.get('goal') || 'all_rounder');
    const mainGoal = GOALS[primary] || GOALS.all_rounder;
    const secondary = extras.filter(x => x.checked && x.value !== primary).map(x => GOALS[x.value]).filter(Boolean);
    const arch = String(data.get('architecture') || 'open');
    const useCase = String(data.get('useCase') || 'living_room');
    const distanceFt = Number(data.get('distanceFt'));
    const powered = String(data.get('power') || 'mains');
    const bassMode = String(data.get('subMode') || 'no_sub');
    const bassCount = bassMode === 'no_sub' ? 0 : Number(data.get('subCount')) || 1;
    const subOwned = bassMode === 'no_sub' ? null : String(data.get('subOwned') || 'unknown');
    const bass = describeBass(bassMode, bassCount);
    const wantedInput = form.elements.namedItem('connection').selectedOptions[0].textContent;
    const own = Object.fromEntries(['speaker','amp','source','headphone'].map(kind => [kind,chosenGear(data,kind)]));
    const anyOwned = Object.values(own).some(x => x.name);
    const budgetText = String(data.get('budget') || '').trim();
    const currency = String(data.get('currency') || 'other');
    const region = form.elements.namedItem('region').selectedOptions[0].textContent;

    const profile = el('p','sb-profile');
    profile.textContent = [
      mainGoal.label,
      distanceFt.toLocaleString() + ' ft',
      form.elements.namedItem('level').selectedOptions[0].textContent,
      budgetText ? budgetText + ' ' + currency + ' budget' : (region + ' · budget not set')
    ].join(' · ');
    body.append(profile);

    // Actual named equipment comes first. Each card is an editorial starting point,
    // never an automatic compatibility certification or a regional value winner.
    const speakerFocus = !!own.amp.name && !own.speaker.name &&
      (arch === 'open' || arch === 'passive_separates') && powered !== 'battery' &&
      useCase !== 'party' && primary !== 'party';
    const intent=builderIntent(String(data.get('buildIntent')||''));
    const shop = section(intent?.resultTitle||
      (anyOwned ? 'Build around your owned equipment' :
        speakerFocus ? 'Speakers for your '+own.amp.name : 'A few options worth a look'));
    if (own.amp.name && !own.speaker.name && !speakerFocus)
      addText(shop,'p',powered === 'battery' ?
        'Your existing '+own.amp.name+' is not verified for battery operation. A separate passive-stereo route keeping it is shown for wall-powered listening.' :
        'Your chosen '+(options[arch]?.title || 'event/listening')+' route may not use '+own.amp.name+' directly. A separate compatible route retaining it is still shown below.','sb-brief-note');
    if (anyOwned)
      addText(shop,'p','Your entered equipment is the starting point, even when a different system is selected. Items that do not belong in this listening path are still acknowledged and kept for separate use.','sb-brief-note');
    if(Object.values(own).some(x=>x.userSupplied))
      addText(shop,'p','These suggestions use specifications entered by you. The model revision and figures have not been independently checked, so equipment matches remain provisional.','sb-brief-note');
    const noSource=Object.values(own).filter(x=>x.userSupplied&&x.record?.sourceStatus==='missing');
    if(noSource.length)
      addText(shop,'p','No source URL provided for '+noSource.map(x=>x.name).join(', ')+'. The Builder can still suggest options using your entered specifications; confirm compatibility before connecting equipment.','sb-brief-note');
    const speakerValues=own.speaker.record?.values;
    if(own.speaker.userSupplied&&Number.isFinite(speakerValues?.reportedSensitivity)){
      const inRoom=speakerValues.sensitivityEnvironment==='in_room';
      addText(shop,'p','Speaker sensitivity used for planning: '+
        speakerValues.reportedSensitivity+' dB'+
        (inRoom?' in-room':'')+
        (Number.isFinite(speakerValues.anechoicReferenceDb)&&inRoom?
          ' (anechoic reference: '+speakerValues.anechoicReferenceDb+' dB)':'')+
        (speakerValues.basisAssumed?' · approximately 1 W / 2.83 V at 1 m for 8 Ω nominal-class':'')+
        '. '+(inRoom?'The in-room value already includes the manufacturer’s assumed room contribution; do not add it again. ':'')+
        'Actual seat level still depends on your room and placement.','sb-brief-note');
    }
    if(own.speaker.record?.values?.recommendedAmpMinW!=null &&
       own.speaker.record?.values?.recommendedAmpMaxW!=null){
      const guidance=own.speaker.record.values;
      addText(shop,'p','Speaker power guidance entered: '+guidance.recommendedAmpMinW+
        '–'+guidance.recommendedAmpMaxW+' W recommended amplifier power'+
        (guidance.listedMaxInputW!=null?'; '+guidance.listedMaxInputW+' W listed maximum input':'')+
        '. These are approximate manufacturer-style shopping guidelines, not a published continuous handling limit or a guarantee of safe operation.','sb-brief-note');
    }
    const preference=validPricePreference(String(data.get('pricePreference')||'any'));
    const budget = budgetText ? Number(budgetText) : null;
    const request = {
      architecture:arch, useCase, goal:primary, level:String(data.get('level')), subMode:bassMode,
      buildIntent:String(data.get('buildIntent')||''),
      distanceFt, power:powered, connection:String(data.get('connection')),
      secondary:extras.filter(x=>x.checked&&x.value!==primary).map(x=>x.value),
      character:String(data.get('character')),
      region:String(data.get('region')), currency, referenceDate:new Date().toISOString().slice(0,10),
      subCount:bassCount, subOwned,
      budget:Number.isFinite(budget) ? budget : null,
      pricePreference:preference,
      budgetStrict:data.get('budgetStrict') === 'strict',used:data.has('used'),
      headphoneUse:String(data.get('headphoneUse')||'quiet'),headphoneFit:String(data.get('headphoneFit')||'any'),
      headphoneAmpChoice:String(data.get('headphoneAmpChoice')||''),
      headphoneDacChoice:String(data.get('headphoneDacChoice')||''),
      headphoneSource:String(data.get('headphoneSource')||'unknown')
    };
    const partyPassiveRoute=(primary==='party'||useCase==='party') &&
      arch==='passive_separates' && powered!=='battery';
    const ownership = anyOwned ? ownershipPlan({own,request,inventory,catalog:sharedCatalog}) : null;
    const initialShortlist = ownership || (speakerFocus
      ? shortlistSpeakersForOwnedAmplifier({ ...request, amp:own.amp, speakers:inventory?.speaker })
      : partyPassiveRoute ? shortlistPartyPassiveConcepts({...request,speakers:inventory?.speaker}) : shortlistExamples(request,sharedCatalog));
    const shortlist=arch==='headphone_first'
      ?applyHeadphoneAmpChoice(initialShortlist,request,sharedCatalog):initialShortlist;
    const headphoneElectronicsPlan=arch==='headphone_first'
      ?headphoneAmplifierPlan(request,sharedCatalog):null;
    if(headphoneElectronicsPlan)
      addText(shop,'p',headphoneElectronicsPlan.summary,'sb-headphone-amp-result');
    // Price-position preference may reorder only verified, same-region,
    // comparable catalogue examples. It NEVER removes a recommendation.
    // We do not pretend that an unknown price is budget priced.
    if(preference!=='any'&&priceSnapshot&&!ownership&&!speakerFocus&&!partyPassiveRoute){
      const exampleIds={
        'headphone-hd600':'legacy/headphone/sennheiser-hd-600',
        'headphone-hd560':'legacy/headphone/sennheiser-hd-560s'
      };
      const candidates=shortlist.selected.map(item=>({...item,
        id:item.catalogId||exampleIds[item.id]||null,originalId:item.id}));
      const ordered=preferVerifiedPriceTier(candidates,priceSnapshot,{region:request.region,preference});
      shortlist.selected=ordered.map(item=>({...item,id:item.originalId}));
    }
    const tierEvidence=pricingPreferenceCoverage(
      shortlist.selected.map(item=>({id:item.catalogId||({
        'headphone-hd600':'legacy/headphone/sennheiser-hd-600',
        'headphone-hd560':'legacy/headphone/sennheiser-hd-560s'
      })[item.id]||null})),
      priceSnapshot,{region:request.region,preference}
    );
    if(preference!=='any')
      addText(shop,'p',tierEvidence.note+' Price categories describe local retail expense, not sound quality.','sb-brief-note');
    // The introductory full-system path has its own deliberately small view.
    // The source-backed shortlist above still determines eligibility and order.
    // Do not render the large technical/audit card tree on this simple path.
    if(request.buildIntent==='complete_system'&&!anyOwned&&bassMode==='no_sub'){
      shop.classList.add('sb-simple-system-results');
      const chosen=shortlist.selected.slice(0,4);
      if(!chosen.length){
        addText(shop,'p','No complete example fits these selections yet. Try another system approach.','sb-simple-empty');
        return;
      }
      const panel=el('div','sb-simple-match-layout');
      const renderSimpleCard=(item,top)=>{
        const data=explainSimpleSystem(item,request,top);
        const card=el('article','sb-simple-match'+(top?' sb-simple-primary':' sb-simple-alternative'));
        addText(card,'span',top?'FIRST SUGGESTED SETUP':'ANOTHER WAY TO LISTEN','sb-simple-eyebrow');
        addText(card,'h4',data.title,'sb-simple-title');
        const why=el('div','sb-simple-why');
        addText(why,'strong',top?'Why it comes first':'Why it is here');
        addText(why,'p',data.why);
        card.append(why);
        const sound=soundImpressionFor(item);
        if(sound?.text&&sound.sources?.some(x=>/^https:\/\//.test(x.url))){
          const listening=el('div','sb-simple-sound');
          addText(listening,'strong','How listeners describe the sound');
          addText(listening,'p',sound.text.replace(/[.!?]$/,'')+'.');
          const source=el('div','sb-simple-source');
          for(const cited of sound.sources.filter(x=>/^https:\/\//.test(x.url)).slice(0,2))
            link(source,cited.url,cited.label||'Read listening review');
          listening.append(source);
          card.append(listening);
        }
        // Ordinary connection guidance is useful even when no source model
        // has been entered. Never present this as a certified input match.
        addText(card,'p',data.connection,'sb-simple-connection');
        if(data.important)addText(card,'p','Check: '+data.important,'sb-simple-note');
        if(top&&data.parts.length)
          addText(card,'p','What the example includes: '+data.parts.join(' · '),'sb-simple-parts');

        if(item.architecture==='passive_separates'){
          const amplifier=item.amplifierModel||item.curatedPairing?.amplifierModel;
          const speakers=item.speakerModel||item.curatedPairing?.speakerModel;
          if(amplifier&&speakers){
            const profile=headroomHandoff({amplifierModel:amplifier,speakerModel:speakers},
              distanceFt,request.level,request.useCase);
            profile.params.delete('embedded');
            const line=el('div','sb-simple-checker');
            if(data.headroomStatus==='calculable')
              addText(line,'span','Saved ratings available for a headroom estimate.','sb-simple-headroom');
            else
              addText(line,'span','Some headroom ratings are missing.','sb-simple-headroom');
            link(line,'/system-check/?'+profile.params.toString(),
              'Check this exact system in System Check');
            card.append(line);
          }
        }
        const technical=el('details','sb-simple-details');
        addText(technical,'summary','Parts, trade-offs and sources');
        if(!top&&data.parts.length)addText(technical,'p','Includes: '+data.parts.join(' · '));
        if(data.tradeoff)addText(technical,'p',data.tradeoff);
        if(data.headroomStatus==='incomplete'&&data.headroomMissing.length)
          addText(technical,'p','For a model-specific headroom estimate, we still need: '+
            data.headroomMissing.join('; ')+'.');
        if(data.subtotal!==null&&data.priceDate)
          addText(technical,'p','Dated listed-parts reference: '+
            new Intl.NumberFormat('en-CA',{style:'currency',
              currency:['CAD','USD','GBP','EUR','AUD'].includes(currency)?currency:'CAD'})
              .format(data.subtotal)+' ('+data.priceDate+'). Not a current complete purchase price.');
        for(const part of (item.parts||[]))
          if(part.url)link(technical,part.url,'Specifications: '+part.name);
        card.append(technical);
        return card;
      };
      panel.append(renderSimpleCard(chosen[0],true));
      if(chosen.length>1){
        const alternatives=el('section','sb-simple-alternatives');
        addText(alternatives,'h4','Other options and how they sound');
        for(const item of chosen.slice(1))alternatives.append(renderSimpleCard(item,false));
        panel.append(alternatives);
      }
      shop.append(panel);
      addText(shop,'p','These are sourced examples arranged for your listening choices, not a sound-quality ranking or a measured prediction of clean volume.','sb-simple-footer');
      return;
    }

    const combinedFactors=explainInputInteractions(request);
    if(combinedFactors.length){
      const decision=el('details','sb-more sb-decision-logic');
      addText(decision,'summary','How your answers change the recommendations');
      list(decision,combinedFactors);
      shop.append(decision);
    }
    if(bassMode!=='no_sub'&&arch!=='headphone_first'){
      const genericPlan=subwooferConnections({
        ampName:own.amp.name,
        subName:String(data.get('subName')||'').trim(),
        ampOutput:String(data.get('subAmpOutput')||'unknown'),
        subInput:String(data.get('subInput')||'unknown'),
        highPass:String(data.get('subHighPass')||'unknown'),
        subOwned
      });
      const connectionBlock=el('details','sb-sub-route-section');
      addText(connectionBlock,'summary','Subwoofer connection: '+genericPlan.title);
      renderSubwooferWiring(connectionBlock,genericPlan,{heading:'Your subwoofer wiring and filtering'});
      shop.append(connectionBlock);
    }
    const hasSubExample = shortlist.selected.some(item => item.bassSetup);
    const retainedSubPath = ownedSubwooferPath(own, request);
    if (bassMode === 'plan_sub' && !retainedSubPath && homeSubwooferRequest(request)) {
      if (!hasSubExample)
        addText(shop,'p',subOwned === 'no' && bassCount === 1 && (!ownership || ownership.mode === 'keep_source') ?
          'The Builder has no complete 2.1 example for this combination. You can start with the stereo ideas below.' :
          'The stereo ideas cover the main system. Check what you need to connect the subwoofer.','sb-brief-note');
    }
    const displayCurrency=['CAD','USD','GBP','EUR','AUD'].includes(currency)?currency:'CAD';
    const priceLocale={CAD:'en-CA',USD:'en-US',GBP:'en-GB',EUR:'en-IE',AUD:'en-AU'}[displayCurrency];
    const priceFormat = value => new Intl.NumberFormat(priceLocale,
      {style:'currency',currency:displayCurrency}).format(value);
    const renderPriceReferences = (parent, {priceDate,priceComponents,subtotal,marketContext}, heading) => {
      const retailers = marketContext?.regular || [];
      if (!priceComponents?.length && !retailers.length) return;
      addText(parent,heading,priceDate ? 'Retail price reference · '+priceDate+' · '+currency : 'Check current prices');
      if (priceDate)
        addText(parent,'p','Listed parts at that time: '+priceFormat(subtotal)+'. Check current prices before buying.','sb-card-reference');
      const seen = new Set();
      for (const part of priceComponents || []) {
        const label = (part.quantity > 1 ? part.quantity+' × ' : '')+part.label;
        const description = priceDate ? label+' · '+priceFormat(part.amount)+(part.quantity > 1 ? ' each' : '') : label;
        const line = addText(parent,'p',description,'sb-card-reference');
        if (part.url) {
          link(line,part.url,'View listing for '+part.label);
          seen.add(part.url);
        }
      }
      for (const {merchant,url} of retailers) {
        if (!url || seen.has(url)) continue;
        link(addText(parent,'p','','sb-card-reference'),url,merchant);
        seen.add(url);
      }
    };
    const renderHeadphoneElectronics=(plan)=>{
      if(!plan)return;
      const section=el('section','sb-headphone-electronics-recs');
      section.setAttribute('aria-label','Headphone amplifier and DAC recommendations');
      addText(section,'h4','DAC and headphone amplifier recommendations');
      if(!plan.components.length){
        addText(section,'p',plan.issue||'No additional electronics have been selected.','sb-help');
        shop.append(section);
        return;
      }
      addText(section,'p','Matched to your chosen source connection. Check headphone power and plugs before buying.','sb-help');
      const draw=(device,alternative=false)=>{
        const card=el('article','sb-headphone-electronics-card'+(alternative?' sb-headphone-electronics-alt':''));
        addText(card,'span',alternative?'Other documented option':'Included in this setup','sb-headphone-electronics-kicker');
        addText(card,'h5',device.model);
        addText(card,'p',device.label+' · '+device.note);
        if(alternative){
          const baseline=plan.components.find(x=>x.type===device.type)||plan.components[0];
          const compared=compareElectronic(baseline,device);
          if(compared){
            const explanation=el('div','sb-comparison-copy');
            addText(explanation,'strong','Compared with '+compared.baseline);
            addText(explanation,'p',compared.change+'.');
            addText(explanation,'p','You may prefer this if '+compared.preference+'.');
            addText(explanation,'p','What to check: '+compared.tradeoff);
            card.append(explanation);
          }
        }
        addText(card,'p','Price not included · check current local price and headphone-output specifications','sb-headphone-electronics-cost');
        link(card,device.sourceUrl,'Manufacturer specifications for '+device.model);
        return card;
      };
      const chosen=el('div','sb-headphone-electronics-list');
      for(const device of plan.components)chosen.append(draw(device));
      section.append(chosen);
      if(plan.alternatives.length){
        addText(section,'h5','Other source-compatible electronics to compare','sb-headphone-electronics-other-heading');
        const others=el('div','sb-headphone-electronics-list');
        for(const device of plan.alternatives)others.append(draw(device,true));
        section.append(others);
      }
      addText(section,'p','Electronics prices are not included. Check current price, connectors, gain and headphone output before buying.','sb-headphone-electronics-footnote');
      shop.append(section);
    };
    const renderCard = (item,alternativeComparison=null,detailOnly=false) => {
      const card = el('article','sb-recommend sb-recommend-compact'+(detailOnly?' sb-recommend-supplement':''));
      const head = el('div','sb-card-head');
      const heading = el('div','sb-card-heading');
      addText(heading,'span',item.kind,'sb-kind');
      addText(heading,'h4',item.title.replace(/^[^:]{3,45}:\s*/,''));
      head.append(heading);
      const noPurchase = ['owned-complete','owned-headphones','owned-other-route','owned-powered-pair'].includes(item.id);
      if (noPurchase) {
        const badge = el('div','sb-card-price');
        addText(badge,'strong','Reuse first');
        head.append(badge);
      }
      if(!detailOnly)card.append(head);
      if(item.architecture==='headphone_first'&&item.headphoneAmpPlan?.components?.length){
        const selectedElectronics=el('div','sb-headphone-card-electronics');
        addText(selectedElectronics,'strong','Electronics in this setup');
        addText(selectedElectronics,'p',item.headphoneAmpPlan.components.map(c=>c.label+': '+c.model).join(' · '));
        addText(selectedElectronics,'p','Manufacturer sources and alternative models are shown in the DAC and amplifier recommendations above.');
        card.append(selectedElectronics);
      }
      const overview=explainBeginnerOption(item,request);
      // An approved speaker load is not sufficient evidence for a clean
      // output recommendation. Keep the result honest about data coverage.
      const evidenceState=item.headroomData?.status;
      const visibleStatus=(item.architecture==='passive_separates'&&
          evidenceState==='incomplete')
        ?'Speaker load supported; clean-output estimate still needs data'
        :(item.architecture==='passive_separates'&&evidenceState==='unknown')
          ?'Speaker load documented; output ranking remains provisional'
          :overview.status;
      addText(card,'p',visibleStatus,'sb-beginner-status sb-beginner-'+
        (evidenceState==='incomplete'||evidenceState==='unknown'?'review':overview.priority));
      if(item.headroomData?.status==='incomplete'&&item.headroomData.missing.length&&
         !detailOnly){
        const notes=el('details','sb-headroom-missing');
        addText(notes,'summary','Which output specifications are missing?');
        addText(notes,'p',item.headroomData.missing.join('; ')+'.');
        card.append(notes);
      }
      if (item.reuseNames?.length)
        addText(card,'p','Retains: '+item.reuseNames.join(' · '),'sb-card-retained');
      if (item.bassSetup){
        addText(card,'p',item.bassSetup.label,'sb-card-minor');
        const modelPlan=knownSubExamplePlan(item.id);
        if(modelPlan){
          const subDetail=el('details','sb-sub-wiring-disclosure');
          addText(subDetail,'summary','Subwoofer wiring and bass filtering');
          renderSubwooferWiring(subDetail,modelPlan,{heading:'What connecting this subwoofer involves'});
          card.append(subDetail);
        }
      }
      else if (bassMode !== 'no_sub' && !noPurchase && ['consumer_powered_pair','passive_separates','active_studio'].includes(item.architecture))
        addText(card,'p','Stereo parts only. Subwoofer and crossover costs are separate.','sb-card-minor');
      const whyBox=el('div','sb-beginner-reason');
      addText(whyBox,'h5',overview.reuse?'Why keeping this is a valid option':'Why this option was suggested');
      addText(whyBox,'p',overview.reason,'sb-beginner-plain');
      card.append(whyBox);
      // Source-linked firsthand owner accounts are the listening section.
      // Technical cautions belong in the separately available verification UI.
      if(!alternativeComparison&&!detailOnly){
        const primarySound=soundImpressionFor(item);
        const ownerSound=soundProfileFor(item);
        const ownerSources=ownerSound?.ownerSources||[];
        // Never fill the listening area with an invented or generic profile.
        // Present actual firsthand impressions only where we have sources.
        if(ownerSources.length){
          const sourcedOwnerSummary=primarySound?.sources?.some(link=>
            ownerSources.some(owner=>owner.url===link.url))
            ?primarySound.text:ownerSound.text;
          const profile=el('section','sb-primary-sound');
          addText(profile,'strong','What owners say');
          addText(profile,'p',String(sourcedOwnerSummary).replace(/[.!?]$/,'')+'.');
          const links=el('div','sb-tonal-sources');
          for(const source of ownerSources.slice(0,2))
            link(links,source.url,source.context||'Firsthand owner report');
          profile.append(links);
          card.append(profile);
        }
      }
      // Keep the exact signal path one tap away on the main result; an opened
      // alternative already lives inside a disclosure and needs no second one.
      renderSetupWorkflow(card,overview.setupWorkflow,{collapsed:!detailOnly});
      // Identify the exact models from owned pairings OR documented prebuilt
      // passive recommendations. Missing measured specs stay missing.
      const headroomModels = {
        amplifierModel:item.amplifierModel||item.curatedPairing?.amplifierModel,
        speakerModel:item.speakerModel||item.curatedPairing?.speakerModel
      };
      if(headroomModels.amplifierModel&&headroomModels.speakerModel&&!detailOnly){
        // Original saved measurements are inspectable without duplicating the
        // calculator in the recommendation surface.
        const saved=(kind,model)=>{
          const original=(inventory?.[kind]||[]).find(x=>x.model===model);
          if(original)return original;
          const supplement=kind==='speaker'?builderOnlySpeakerFor(model):
            kind==='amp'?builderOnlyAmpFor(model):null;
          if(supplement)return supplement;
          const shared=availableShared(kind).find(x=>x.model===model||x.aliases?.includes(model));
          return shared?sharedGearAsLegacyView(shared,kind):null;
        };
        const amp=saved('amp',headroomModels.amplifierModel);
        const speaker=saved('speaker',headroomModels.speakerModel);
        const specs=el('details','sb-saved-pair-specs');
        addText(specs,'summary','Saved amplifier & speaker specifications');
        const ampContinuous=amp?.ratings?.find(r=>r[2]==='continuous'&&
          Number.isFinite(r[0])&&Number.isFinite(r[1]));
        addText(specs,'p',headroomModels.amplifierModel+': '+
          (ampContinuous?ampContinuous[0]+' W/channel continuous into '+ampContinuous[1]+' Ω'+
            (ampContinuous[3]?' ('+ampContinuous[3]+')':'')
            :'No comparable continuous power measurement recorded for this exact model.'));
        const speakerValues=speaker?.values||{};
        const hasSensitivity=Number.isFinite(speakerValues.sensitivity)&&
          ['power','voltage'].includes(speakerValues.basis);
        const speakerFacts=[
          Number.isFinite(speakerValues.load)?speakerValues.load+' Ω nominal':null,
          Number.isFinite(speakerValues.minimum)?speakerValues.minimum+' Ω minimum':null,
          hasSensitivity?speakerValues.sensitivity+' dB ('+
            (speakerValues.basis==='power'?'1 W':'2.83 V')+' at 1 m)':null
        ].filter(Boolean);
        addText(specs,'p',headroomModels.speakerModel+': '+
          (speakerFacts.length?speakerFacts.join(' · '):'No numeric speaker specifications saved')+
          (hasSensitivity?'':'. Sensitivity reference not established for a model-specific headroom calculation.'));
        if(amp?.url)link(specs,amp.url,'Amplifier specification source');
        if(speaker?.url)link(specs,speaker.url,'Speaker specification source');
        card.append(specs);
      }
      if(headroomModels.amplifierModel&&headroomModels.speakerModel){
        // Only a short, real calculation verdict belongs in the first view.
        // The original System Check calculation remains unmodified below.
        const inline=el('details','sb-inline-system-check');
        const {profile,params}=headroomHandoff(headroomModels,distanceFt,request.level,request.useCase);
        const summary=el('summary','sb-headroom-summary');
        addText(summary,'strong','Headroom for these exact models');
        const verdict=addText(summary,'span','Checking the saved ratings…','sb-headroom-verdict');
        inline.append(summary);
        addText(inline,'p',profile.label+' · '+distanceFt+' ft · illustrative '+profile.average+' dB average / '+(profile.average+profile.gap)+' dB peak. Not a measured listening level.','sb-headroom-brief');
        const frame=el('iframe','sb-inline-system-check-frame');
        frame.title='Headroom results for '+headroomModels.speakerModel+' with '+headroomModels.amplifierModel;
        frame.setAttribute('aria-hidden','true');
        frame.tabIndex=-1;
        // Load the true result even while collapsed so the summary can show
        // its verdict; do not compute or invent an independent estimate.
        frame.loading=detailOnly?'lazy':'eager';
        frame.src='/system-check/?'+params.toString();
        const refresh=()=>{
          try{
            const doc=frame.contentDocument;
            if(!doc)return;
            const actual=doc.querySelector('#result-status')?.textContent?.trim();
            if(actual)verdict.textContent=actual;
            if(inline.open)
              frame.style.height=Math.max(300,Math.ceil(doc.documentElement.scrollHeight)+16)+'px';
          }catch{/* Keep the calculator link available if iframe access is blocked. */}
        };
        frame.addEventListener('load',()=>{
          refresh();
          try{
            const doc=frame.contentDocument;
            if(doc?.body&&typeof ResizeObserver!=='undefined')
              new ResizeObserver(()=>{if(inline.open)refresh();}).observe(doc.body);
          }catch{/* The full calculator link remains available. */}
        });
        inline.addEventListener('toggle',()=>{if(inline.open)refresh();});
        inline.append(frame);
        const full=new URLSearchParams(params);
        full.delete('embedded');
        card.append(inline);
      }
      // Always expose the calculator transfer directly on the primary card.
      // It preselects the models known for this actual recommendation.
      if(!detailOnly){
        const checkAmp=headroomModels.amplifierModel||own.amp.name;
        const checkSpeaker=headroomModels.speakerModel||own.speaker.name;
        const checkParams=new URLSearchParams();
        if(checkAmp)checkParams.set('amp',checkAmp);
        if(checkSpeaker)checkParams.set('speaker',checkSpeaker);
        if(Number.isFinite(distanceFt)&&distanceFt>=0.5&&distanceFt<=300)
          checkParams.set('distanceFt',String(distanceFt));
        if(checkAmp&&checkSpeaker){
          const checkProfile=BUILDER_HEADROOM_PROFILES[request.level]||BUILDER_HEADROOM_PROFILES.moderate;
          checkParams.set('autocheck','1');
          checkParams.set('average',String(checkProfile.average));
          checkParams.set('gap',String(checkProfile.gap));
          checkParams.set('preferRoom',['outdoors','party'].includes(request.useCase)?'0':'1');
        }
        const checkAction=el('div','sb-checker-action');
        link(checkAction,'/system-check/'+(checkParams.size?'?'+checkParams.toString():''),
          checkAmp||checkSpeaker?'Open System Check with this gear':'Open System Check');
        card.append(checkAction);
      }
      const proof=el('details','sb-beginner-proof');
      addText(proof,'summary','Why these parts work together');
      if(overview.goalExplanation)addText(proof,'p',overview.goalExplanation,'sb-beginner-basis');
      addText(proof,'p',overview.matchingEvidence,'sb-beginner-plain');
      card.append(proof);
      if(overview.firstChecks.length){
        const firstChecks=el('div','sb-beginner-checks');
        addText(firstChecks,'h5',overview.priority==='critical'?'Important: resolve before connecting':
          overview.checkHeading||'What to check before connecting or buying');
        list(firstChecks,overview.firstChecks,'sb-beginner-checklist');
        card.append(firstChecks);
      }
      if(overview.costAndTradeoffs.length&&!item.amplifierModel)
        addText(card,'p','Price and trade-off: '+overview.costAndTradeoffs[0],'sb-beginner-cost');
      const evidence=el('details','sb-beginner-evidence');
      addText(evidence,'summary','See the technical details and original sources');
      addText(evidence,'p',overview.technicalEvidence,'sb-beginner-technical');
      addText(evidence,'p',recommendationWhy(item,request,
        Object.fromEntries(Object.entries(GOALS).map(([key,value])=>[key,value.label]))),'sb-beginner-technical');
      // The user-specific rationale is now above the system chain on every card.
      if (item.amplifierFit) {
        const fitInfo=item.amplifierFit;
        const p=el('p','sb-card-power');
        addText(p,'strong','Power & headroom: ');
        const power=fitInfo.amp;
        const facts=power.exact
          ?power.watts+' W/channel continuous at '+power.ohms+' Ω'
          :'No directly published continuous power at this exact load';
        const burst=Number.isFinite(fitInfo.documentedBurst)
          ?' · separate '+fitInfo.documentedBurst+' W/channel short-burst rating at the same load'
          :'';
        p.append(document.createTextNode(facts+burst+'. Use the on-page calculator for your desired listening level.'));
        evidence.append(p);
        if (fitInfo.context) {
          const impression=el('p','sb-card-review');
          addText(impression,'strong','Reviewer/lab context: ');
          impression.append(document.createTextNode(fitInfo.context.text));
          evidence.append(impression);
        }
      }
      const sound = soundProfileFor(item);
      // A speaker's listening profile must never be presented as the amplifier's
      // sound. Unknown owned-speaker profiles do not get a generic "Sound" card.
      const showSound = sound.type !== 'Not independently characterized';
      if (showSound) {
        const soundLine = el('p','sb-card-sound');
        addText(soundLine,'strong',sound.ownerSources?.length ? 'Owner experiences: ' : (item.soundTarget ? 'Your speaker’s sound: ' : 'Sound: '));
        soundLine.append(document.createTextNode(sound.text));
        evidence.append(soundLine);
      }

      if(evidence.childElementCount>1)card.append(evidence);

      const details = el('details','sb-card-details');
      addText(details,'summary','Full verification, trade-offs, equipment and sources');
      addText(details,'p',item.why,'sb-card-why-full');
      if (item.reuseNames?.length) {
        addText(details,'h5','What stays in your system');
        list(details,item.reuseNames);
      }
      if (item.keptSeparate?.length) {
        addText(details,'h5','Also owned, kept for other use');
        list(details,item.keptSeparate);
      }
      if (item.curatedPairing?.sources?.length){
        addText(details,'h5','Published manufacturer information for this exact pairing');
        for(const source of item.curatedPairing.sources)
          if(source?.url && source?.label)link(details,source.url,source.label);
      }
      if (item.amplifierEvidence?.length) {
        addText(details,'h5','Why this amplifier: technical evidence and checks');
        list(details,item.amplifierEvidence);
        if (item.amplifierSource) link(details,item.amplifierSource,'Published amplifier specifications');
        if (item.manualPairing?.source) link(details,item.manualPairing.source,'Manufacturer speaker-load instructions');
        if (item.amplifierFit?.speaker?.source)
          link(details,item.amplifierFit.speaker.source,'Published speaker power specification');
        if (item.amplifierFit?.context) {
          addText(details,'h5','Model-specific listening reports, not a brand sound signature');
          addText(details,'p',item.amplifierFit.context.tier,'sb-card-reference');
          for (const report of item.amplifierFit.context.sources)
            link(details,report.url,report.label);
        }
      }
      if (showSound) {
        addText(details,'h5',item.soundTarget ? 'Your speaker’s sound: evidence' : 'Sound description: evidence');
        addText(details,'p',sound.type+'. These are individual listening experiences or reviewed observations, not a precision sound-quality score.','sb-card-reference');
        if (sound.ownerSources?.length) {
          addText(details,'p',sound.ownerCaution,'sb-card-reference');
          for (const source of sound.ownerSources)
            link(details,source.url,source.context);
        } else if (sound.url) link(details,sound.url,'Read the source');
      }
      if (!item.editorialGoalFocus)
        addText(details,'p','An alternative approach for comparison, not a verified performance match to your main priority.');
      if (item.secondaryFocus.length)
        addText(details,'p','Also connects to: '+item.secondaryFocus.map(x=>GOALS[x]?.label||x).join(', ')+'. Not a measurement-based match.');
      if (item.ownedAmpName) addText(details,'p','Amplifier already owned: '+item.ownedAmpName+' (no additional purchase price included). Speaker suitability remains conditional.','sb-card-reference');
      addText(details,'h5','Equipment and connections');
      const parts = el('ul','sb-buy-parts');
      for (const part of item.parts) {
        const li = el('li');
        addText(li,'strong',(part.count > 1 ? part.count+' × ' : '') + part.name);
        addText(li,'span',' · '+part.role);
        if (part.url) link(li,part.url,'Specifications');
        parts.append(li);
      }
      details.append(parts);
      renderPriceReferences(details,item,'h5');
      if(item.decisionReasons?.length){
        addText(details,'h5','How your inputs affected this option');
        list(details,item.decisionReasons);
      }
      addText(details,'h5','Trade-offs');
      addText(details,'p',item.tradeoff);
      const checks=[...new Set([...overview.checks,...overview.technicalChecks,...(item.extra||[])])];
      if(overview.costAndTradeoffs.length){
        addText(details,'h5','Complete-cost gaps and trade-offs');
        list(details,overview.costAndTradeoffs);
      }
      if(item.bassSetup){
        addText(details,'h5','Connect and set up the subwoofer');
        addText(details,'p',item.bassSetup.setup);
        link(details,item.bassSetup.source,'Manufacturer bass-routing instructions');
      }
      if(checks.length){
        addText(details,'h5','Specific remaining checks');
        list(details,checks);
      }
      card.append(details);
      return card;
    };

    // Show what owners hear from each alternative in the ordinary results view.
    // Do not require or manufacture a head-to-head comparison.
    const renderComparisonPreview=(baseline,choices,heading,klass='sb-comparison-overview',target=shop)=>{
      if(!choices?.length)return;
      const preview=el('section',klass);
      addText(preview,'h4',heading);
      const grid=el('div','sb-comparison-preview-list');
      for(const item of choices){
        const note=el('article','sb-comparison-preview-card');
        // This is an independent listening description of the alternative.
        // We do not require an exact head-to-head model comparison.
        addText(note,'h5',item.title.replace(/^[^:]{3,45}:\s*/,''));
        // Alternatives have their OWN audible character, not a contrast
        // against the first match. Do not show generic "no tonal direction" text.
        const ownerB=soundProfileFor(item);
        const ownerSources=ownerB?.ownerSources||[];
        if(ownerSources.length){
          const sound=soundImpressionFor(item);
          const description=String(sound?.text||ownerB.text).replace(/[.!?]$/,'');
          addText(note,'p','What owners say: '+description+'.','sb-tonal-one-line');
          const links=el('div','sb-tonal-sources');
          for(const source of ownerSources.slice(0,2))
            link(links,source.url,source.context||'Firsthand owner report');
          if(links.children.length)note.append(links);
        }
        if(item.why){
          const fit=el('details','sb-comparison-fit');
          addText(fit,'summary','Why this option fits');
          addText(fit,'p',item.why,'sb-compact-compare');
          note.append(fit);
        }
        // One short independent listening description, with optional wiring,
        // headroom, cost and source details attached to this option.
        const detail=el('details','sb-alternative-details');
        addText(detail,'summary','Connections, headroom & full specifications');
        detail.append(renderCard(item,null,true));
        note.append(detail);
        grid.append(note);
      }
      if(grid.children.length){preview.append(grid);target.append(preview);}
    };
    if(headphoneElectronicsPlan)renderHeadphoneElectronics(headphoneElectronicsPlan);
    if (shortlist.selected.length) {
      addText(shop,'p',intent?.requiredOwn==='speaker'
        ?'These amplifiers have published continuous-power tests at your speakers’ nominal load. Use the inline System Check to calculate the listening level you actually want.'
        :'Start with the recommended fit below. Open the short explanations when you want the details.','sb-results-orientation');
      // The primary is the only full card on the main page. Other product
      // summaries are visible below, each with its own optional setup detail.
      const grid = el('div','sb-recommendations sb-primary-recommendation');
      const firstCard=renderCard(shortlist.selected[0]);
      firstCard.classList.add('sb-recommend--primary');
      firstCard.tabIndex=-1;
      firstCard.id='sb-first-recommendation';
      grid.append(firstCard);
      const matchesRow=el('div','sb-compact-matches');
      matchesRow.append(grid);
      shop.append(matchesRow);
      if(shortlist.selected.length>1)
        renderComparisonPreview(shortlist.selected[0],shortlist.selected.slice(1),
          'Other options · What owners hear',
          'sb-upgrade-comparison-preview sb-comparison-overview',matchesRow);
      if(request.character !== 'faithful')
        addText(shop,'p','Owner listening impressions describe individual products, not guaranteed results in every system.','sb-brief-note');
      addText(shop,'p','Check current prices and stock for all the parts you need. Include delivery and taxes when comparing with your budget.','sb-brief-note');
    } else {
      addText(shop,'p',speakerFocus ?
        'No evidence-backed pairing is available for these inputs in our current catalogue. We need additional models or comparable measurements before making a recommendation.' :
        'There are no examples for your selected system type and power requirements. Try a different setup.','sb-report-note');
    }
    // Show passive high-efficiency leads next to the event/PA route without
    // pretending that an unpriced speaker pair is a complete party system.
    // Existing owned speakers/amps are not automatically replaced here.
    if ((primary==='party'||useCase==='party') &&
        (arch==='open'||arch==='passive_separates') &&
        powered!=='battery' && !own.speaker.name && !own.amp.name &&
        arch!=='passive_separates') {
      const leads=shortlistPartySpeakerLeads({speakers:inventory?.speaker}).slice(0,3);
      if(leads.length){
        const subsection=el('div','sb-party-speaker-leads');
        addText(subsection,'h4','High-sensitivity passive speaker alternatives');
        addText(subsection,'p','For a mains-powered stereo party setup, these are speaker-only research leads, not complete systems. Each needs a separately checked amplifier, source, cables and full budget. Manufacturer sensitivity is not clean maximum SPL.','sb-brief-note');
        const entries=el('ul');
        for(const lead of leads){
          const li=el('li');
          addText(li,'strong',lead.model+' · '+lead.evidence.label+'. ');
          li.append(document.createTextNode('Compare amplifier load, clean output at your distance, space and ordinary pair price. '));
          link(li,lead.url,'Model specification');
          entries.append(li);
        }
        subsection.append(entries);
        shop.append(subsection);
      }
    }
    // Catalog-backed alternatives are deliberately separate from the editorial
    // shortlist. This ensures every verified powered studio monitor is visible,
    // while the existing system-ranking and amplifier physics remain untouched.
    if(sharedCatalog && (arch==='active_studio'||(arch==='open'&&useCase==='desk'))){
      const monitors=listeningStudioCandidates(sharedCatalog,{
        prices:priceSnapshot,region:request.region,preference
      });
      if(monitors.length){
        const explorer=el('section','sb-catalog-studio');
        addText(explorer,'h4','Powered studio monitors in the shared equipment catalogue');
        addText(explorer,'p','These are available research candidates, not ranked sound-quality recommendations. Each published model is a powered line-level cabinet, not a passive speaker that needs an external amplifier.','sb-brief-note');
        const cards=el('div','sb-catalog-studio-grid');
        const firstMonitor=monitors[0];
        const monitorIntro=el('div','sb-brief-note');
        addText(monitorIntro,'strong','Compared with your main recommendation: ');
        addText(monitorIntro,'span','These powered monitors change cabinet size, source-input options and installation. A different woofer size or power figure does not prove more usable bass or cleaner peaks; compare exact model measurements and your listening distance.');
        explorer.append(monitorIntro);
        for(const record of monitors){
          const details=describeStudioMonitor(record);
          const card=el('article','sb-catalog-studio-card');
          addText(card,'h5',record.model);
          const facts=[];
          if(details.cabinetCount===1)facts.push('One cabinet in the documented package');
          if(details.frequencyRangeMinus3DbHz)facts.push('Manufacturer frequency range at −3 dB: '+details.frequencyRangeMinus3DbHz.join('–')+' Hz');
          if(details.inputTypes.length)facts.push('Documented input types: '+details.inputTypes.join(', '));
          if(details.internalAmplification&&typeof details.internalAmplification==='object'){
            const a=details.internalAmplification;
            if(Number.isFinite(a.lf)&&Number.isFinite(a.hf))facts.push('Internal LF/HF amplifier sections: '+a.lf+' W / '+a.hf+' W. Not external power.');
          }
          list(card,facts.length?facts:['Published specifications incomplete; check the manufacturer documentation.']);
          const monitorComparison=compareAlternative(shortlist.selected[0],
            {title:record.model,architecture:'active_studio',connections:details.inputTypes||[]},
            request,sharedCatalog);
          if(monitorComparison)
            addText(card,'p',monitorComparison.summary+' You may prefer it if '+monitorComparison.preference+'. Check: '+monitorComparison.tradeoff,'sb-card-reference');
          addText(card,'p',details.cautions[0]+' '+details.cautions[1],'sb-brief-note');
          link(card,details.source,'Manufacturer/source documentation');
          cards.append(card);
        }
        explorer.append(cards);
        addText(explorer,'p','The preference for budget, mid-priced or premium equipment changes only the order of models with current, comparable local price evidence. Missing price categories do not hide the Yamaha models.','sb-brief-note');
        shop.append(explorer);
      }
    }
    if (shortlist.excluded.length && budget !== null) {
      const excluded = el('details','sb-more');
      addText(excluded,'summary','Why some options were left out');
      list(excluded,shortlist.excluded.slice(0,5).map(x=>x.title+': '+x.reason));
      shop.append(excluded);
    }

    // Evergreen models rather than expired classified ads. This is deliberately
    // NOT an automatically priced shopping recommendation or safe-pair verdict.
    if (request.used && powered!=='battery' &&
        (arch==='open'||arch==='passive_separates')) {
      const saved = usedWatchlistFor({wantedInput:request.connection,powered,region:request.region});
      if (saved.length) {
        const watch = el('details','sb-more sb-used-watchlist');
        addText(watch,'summary','Used stereo amplifiers worth keeping an eye out for · model watchlist');
        addText(watch,'p',
          'These are established models to recognise when shopping second-hand, not current listings or confirmed local bargains. No used price, stock status or automatic speaker compatibility is claimed.','sb-brief-note');
        for(const candidate of saved){
          const block=el('div','sb-used-watch-model');
          addText(block,'h4',candidate.model+' · '+candidate.type);
          addText(block,'p','Why consider it: '+candidate.audience);
          addText(block,'p','Documented basis: '+candidate.evidence,'sb-card-reference');
          addText(block,'p','Inspect before buying: '+candidate.checks,'sb-card-reference');
          if(candidate.inputCaution)addText(block,'p',candidate.inputCaution,'sb-card-alert');
          link(block,candidate.source,'Read manufacturer manual/specifications');
          watch.append(block);
        }
        addText(watch,'p',
          'Budget for possible service, transportation, suitable mains voltage, accessories and a real working demonstration. “Keep an eye out” means compare any future offer to its condition; it is never a predicted deal price.','sb-brief-note');
        shop.append(watch);
      }
    }

    if (retainedSubPath) {
      const route = retainedSubPath;
      const panel = el('details','sb-more sb-retained-sub');
      const summary = route.buying ? 'Add a sub and keep your '+route.retained : 'Subwoofer connection for your '+route.retained;
      addText(panel,'summary',summary);
      addText(panel,'p',route.bassSetup.label);
      addText(panel,'p',route.buying ? 'The example uses an Edifier T5. Check whether you need a separate connection cable.' :
        route.wantsOwnedSub ? 'Keep your subwoofer if it accepts the right connection. The T5 wiring below is an example.' :
        'Confirm whether your sub can be reused. The T5 wiring below is an example.');
      if (route.needsMainSpeakers) addText(panel,'p','Price the passive stereo pair and speaker wire separately.');
      const retainedSub= subwooferConnections({ampName:route.retained,subName:'Edifier T5',subOwned:route.wantsOwnedSub?'yes':'no'});
      renderSetupWorkflow(panel,{
        steps:[
          'Keep '+route.retained+' as the main amplification or powered-speaker system.',
          retainedSub.signal,
          retainedSub.mainBass
        ],
        equipment:'Connection hardware: '+retainedSub.cable
      });
      renderSubwooferWiring(panel,retainedSub,{heading:'Connection details for this example'});
      addText(panel,'p',route.bassSetup.setup);
      link(panel,route.bassSetup.source,'Manufacturer bass-routing instructions');
      if (route.buying) renderPriceReferences(panel,route,'h4');
      shop.append(panel);
    }

    // Replacements use the same concise inline comparison cards; the only
    // optional disclosure here is the independent keep-versus-replace criteria.
    // Do not duplicate every replacement product a second time.
    if (ownership) {
      if (ownership.mode !== 'keep_source') {
        const alternativesList=shortlistExamples(request).selected.slice(0,3);
        if(alternativesList.length)
          renderComparisonPreview(shortlist.selected[0],alternativesList,
            'Compared with keeping your current setup',
            'sb-replacement-comparison-preview sb-comparison-overview');
        else
          addText(shop,'p','No additional complete system is supported by the selected architecture and known prices.','sb-brief-note');
      }
      if(ownership.comparisonReasons?.length){
        const criteria=el('details','sb-more sb-replacement-criteria');
        addText(criteria,'summary','When is replacing your current gear worthwhile?');
        list(criteria,ownership.comparisonReasons);
        shop.append(criteria);
      }
    }
    if (((bassMode !== 'no_sub' && subOwned !== 'yes') || (primary === 'bass' && bassMode === 'no_sub')) &&
        arch !== 'headphone_first' && arch !== 'party_pa' && powered !== 'battery' &&
        primary !== 'party' && useCase !== 'party' && !hasSubExample && !retainedSubPath) {
      const subAdd = el('details','sb-more');
      addText(subAdd,'summary',bassMode === 'no_sub' ? 'Optional deeper bass ideas' : 'Subwoofer models to investigate');
      addText(shop,'p','Subwoofer alternatives compared: the SVS SB-1000 Pro uses a sealed enclosure; the RSL Speedwoofer 10E uses a ported design. You may prefer a sealed enclosure for its packaging/roll-off characteristics or a ported system when its tuning and measured output suit your bass goal. Neither design guarantees tighter bass or better sound. Compare measured low-frequency output, placement, mains high-pass and actual total cost.','sb-sub-comparison-preview');
      addText(subAdd,'p','SVS SB-1000 Pro (sealed) and RSL Speedwoofer 10E (ported). Integration and regional prices still need verification.');
      link(subAdd,'https://www.svsound.com/products/sb-1000-pro-subwoofer','SVS specifications');
      link(subAdd,'https://rslspeakers.com/pages/speedwoofer-10e','RSL specifications');
      shop.append(subAdd);
    }
    const usedSub = request.used && homeSubwooferRequest(request) && bassMode !== 'no_sub' &&
      subOwned !== 'yes' ? USED_SUB_MODELS[request.region] : null;
    if (usedSub) {
      const watch = el('details','sb-more sb-used-sub');
      addText(watch,'summary','Used subwoofer to look for · '+usedSub.model);
      addText(watch,'p',usedSub.note);
      addText(watch,'p','Compare the local price plus freight and any missing leads with a new sub. Your amp or speakers determine whether the main speakers play less bass.','sb-brief-note');
      link(watch,usedSub.source,'Manufacturer instructions');
      shop.append(watch);
    }

    const detail = el('details','sb-audit');
    addText(detail,'summary','Want the technical explanation? Explore compatibility, pricing & evidence');
    body.append(detail);
    reportContainer = detail;
    const goals = section('What matters for your listening goals');
    addText(goals,'p',mainGoal.focus + '.');
    if (secondary.length) list(goals,secondary.map(x => x.label + ': ' + x.focus + '.'));
    addText(goals,'p',data.get('character') === 'character' ?
      'You prefer a particular tonal character. That preference is valid, but is not a measured fidelity advantage.' :
      data.get('character') === 'explore' ?
      'Compare a faithful-to-source setup with deliberate tonal adjustments, keeping preference and measurable accuracy separate.' :
      'Begin by preserving the recorded signal as accurately as practicable; any preferred coloration is a separate choice.');
    const ownedSection = section('Existing equipment: what can we establish?');
    if (!anyOwned) addText(ownedSection,'p','No existing components were selected. A whole new working signal path must be costed, not just a speaker pair.');
    else {
      for (const kind of ['speaker','amp','source','headphone']) {
        const x = own[kind];
        if (!x.name) continue;
        const line = addText(ownedSection,'p',kind[0].toUpperCase() + kind.slice(1) + ': ' + x.name);
        line.style.marginBottom = '.25rem';
        if (x.unlisted){
          addText(ownedSection,'p',x.userSupplied?
            'User-entered specifications: '+x.specMessage+' These numbers are provisional, not part of the verified catalogue.':
            'Unlisted model: no usable specifications were supplied. The tool cannot verify compatibility from the model name.','sb-help');
          if(x.record?.url)link(ownedSection,x.record.url,'Visitor-provided specification or manual');
        }else {
          addText(ownedSection,'p','Saved preset, not an endorsement. ' + (x.record.note || 'No additional note recorded.'),'sb-help');
          link(ownedSection,x.record.url,'Preset specification source');
          if (x.record.details?.reference && x.record.details.reference !== x.record.url)
            link(ownedSection,x.record.details.reference,'Supplemental specification source');
        }
      }
      if (arch !== 'headphone_first' && arch !== 'consumer_powered_pair' && arch !== 'active_studio' &&
          !poweredSubPairFor(own.speaker.name)) {
        const audit = inspectOwnedPair(own.speaker.record,own.amp.record);
        if (audit.facts.length) list(ownedSection,audit.facts,'sb-facts');
        if (audit.checks.length) {
          addText(ownedSection,'h4','Still to verify');
          list(ownedSection,audit.checks);
        }
      }
      if (own.source.record) {
        const conn = own.source.record.values?.sourceConnection;
        if (conn) addText(ownedSection,'p','Saved source output connection: ' + String(conn) + '. Confirm connector levels, cable type and volume control before declaring a match.');
        else addText(ownedSection,'p','Saved source has no validated output-interface match for this pathway.');
      }
      if(own.headphone.record){
        const hv=own.headphone.record.values||{};
        const demand=headphoneDriveRequirement({
          impedanceOhms:hv.load,sensitivityDb:hv.sensitivity,basis:hv.basis,
          targetDb:95
        });
        if(demand.status==='estimated_requirement')
          addText(ownedSection,'p','Illustrative headphone drive demand at 95 dB SPL: '+
            demand.voltsRms.toFixed(3)+' V RMS, '+demand.milliwatts.toFixed(2)+' mW, '+
            demand.milliampsRms.toFixed(1)+' mA into '+hv.load+' Ω nominal. '+
            'This is an electrical estimate, not a listening-level recommendation. '+
            'The actual source headphone-output capability and connection still need to be known.');
      }
      if (own.headphone.name && arch === 'headphone_first')
        addText(ownedSection,'p','Keep the headphones on the shortlist for a fit and drive check. An impedance number alone does not establish a sufficient/quiet output.');
      if (own.speaker.name && !poweredSubPairFor(own.speaker.name) && (arch === 'consumer_powered_pair' || arch === 'active_studio'))
        addText(ownedSection,'p','Speakers you own may be passive, which means they still need a separate amplifier. Do not assume they work as powered speakers just because you selected a different system layout.');
    }
    if (data.get('keepWorking')) addText(ownedSection,'p',
      request.buildIntent==='improve_existing'?
        'Use placement and the current system’s headroom as your baseline, then compare the specific speaker alternatives above. A speaker change may address clean peaks, bass output or placement, but the Builder has not measured a fault in your present pair.':
        'Keep/placement-first is a valid outcome. An upgrade is not justified until a real limitation or missing feature is identified.','sb-report-note');

    if (arch !== 'headphone_first') {
      const subSection = section('Bass routing: ' + bass.heading);
      list(subSection,bass.notes);
      if (bassMode !== 'no_sub') {
        addText(subSection,'p','Subwoofers selected: ' + (bassCount >= 3 ? 'three or more' : String(bassCount)) +
          '. Already owned: ' + subOwned +
          '. Owned reusable gear carries zero incremental hardware cost, but setup, routing hardware and integration may still cost money.');
      }
      if (bassMode === 'sub_hpf') addText(subSection,'p','The high-pass claim is based on your selection, not independently verified by this form. Show the exact crossover/router settings and source before taking an amplifier/speaker bass-relief credit.','sb-report-note');
    } else if (bassMode !== 'no_sub') {
      const subSection = section('Headphone-specific exception');
      addText(subSection,'p','Speaker/subwoofer routing does not enter a headphone-only equipment decision. The selected subwoofer configuration is ignored for this pathway.');
    }

    const pathwaySection = section('Reasoned system pathways, separated by architecture');
    addText(pathwaySection,'p','These are possible ways to build a working system, not a ranking of the best products. Check the exact model, every required connection and local availability before buying.');
    const pathwayCards = el('div','sb-pathways');
    const chosen = eligibleArchitectures({architecture:arch,useCase,goal:primary});
    for (const key of chosen) {
      const config = options[key]; if (!config) continue;
      const card = el('article','sb-pathway');
      addText(card,'div','Conditional · verification required','sb-status');
      addText(card,'h4',config.title);
      addText(card,'p',config.description);
      const checks = [...config.verify];
      if (powered === 'battery') checks.unshift('HARD GATE: a candidate must be demonstrably battery-capable. An AC-only system is ineligible.');
      if (powered === 'flexible') checks.unshift('Power can be mains or battery; verify the chosen system rather than assuming portability.');
      if (key === 'passive_separates' && own.amp.record)
        checks.push('Your existing amplifier could be retained at zero purchase cost only if its load, controls and output are proven adequate.');
      if (key === 'headphone_first' && own.headphone.name)
        checks.push('Test your owned ' + own.headphone.name + ' with a suitable source before buying a replacement.');
      if (key !== 'headphone_first' && bassMode !== 'no_sub')
        checks.push('Include the actual subwoofer connection and configuration in the total signal chain; unknown routing is treated as full-range mains for headroom.');
      list(card,checks);
      pathwayCards.append(card);
    }
    pathwaySection.append(pathwayCards);
    if (arch === 'open' && primary !== 'party' && useCase !== 'party')
      addText(pathwaySection,'p','Party/PA is intentionally excluded from ordinary stereo/desk routes. Choose party as the main goal or the architecture to evaluate an event system.');

    const logistics = section('Cost, connections and remaining unknowns');
    const parts = [
      'Listening distance: ' + distanceFt + ' ft. This is an input for later technical checks, not a computed room response.',
      'Required source connection: ' + wantedInput + '. Verify real source/output/input types and a functional volume-control path.',
      'Region: ' + region + ' (' + currency + '). ' + (budgetText ? 'Spending ceiling: ' + budgetText + ' ' + currency + (data.get('budgetStrict') === 'strict' ? ' (firm).' : ' (flexible).') : 'No spending limit supplied.'),
      'Only some exact models have dated, region-matched new-pair price references. Other products and most used markets still require a local price check; missing prices are never treated as free.',
      'Complete-system price must include each required speaker, amplifier, source, volume control, stands, cables, subwoofer, service work and applicable region costs.',
      'Check real product availability, mains voltage, environment, any safety notices, and warranty/revision before buying.'
    ];
    if (data.get('used')) parts.push('Used gear is allowed as a research route. Verify service history, availability and real local transaction prices.');
    if (!data.get('service')) parts.push('Do not assume vintage maintenance is free or acceptable: service cost and risk must be counted.');
    list(logistics,parts);
    const first = section('Try this before spending');
    const experiments = [mainGoal.experiment, ...secondary.map(x => x.experiment)];
    if (arch === 'headphone_first') experiments.push('Try fit/seal and lower listening volume before paying for a new DAC or amplifier.');
    else experiments.push('Confirm L/R polarity, placement symmetry and room/setup constraints before attributing congestion or imaging issues to a component.');
    if (data.get('keepWorking') && anyOwned) experiments.unshift('Run your present setup through System Check first. If it already meets your level, connectivity and tonal needs, no upgrade may be necessary.');
    list(first,experiments);
    const referrals = addText(first,'p','Cross-check rather than inventing numbers: ');
    link(referrals,'/system-check/','System Check for verified headroom');
    link(referrals,'/system-check/compare/','Compare My Gear source notes');
    const limitation = section('Evidence limits');
    addText(limitation,'p','This Builder does not have a rights-cleared, method-compatible, catalogue-wide acoustic measurement dataset, only limited source-verified category-specific regional price samples, and no calibrated preference-to-product scoring. Manufacturer specs, independent review links and original measurements are different evidence tiers. No data is scraped or copied from third-party review graphs.');
    link(limitation,'https://www.erinsaudiocorner.com/measurement-data-policy/','Independent measurement-data usage policy');
  }

  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    if (!form.reportValidity()) return;
    const raw=new FormData(form);
    const check=validateBuilderIntent(intentSelect.value,raw);
    if(!check.ok){
      setFeedback(check.message);
      intentFeedback.scrollIntoView({behavior:'auto',block:'nearest'});
      return;
    }
    const selected=scopedBuilderInputs(raw,intentSelect.value,advanced.open);
    if(intentSelect.value==='amp_for_speakers'){
      const speaker=chosenGear(selected,'speaker');
      const knownPowered=isPoweredSpeakerModel(speaker.name,{legacy:[...(inventory?.speaker||[]),...BUILDER_ONLY_SPEAKERS],
        shared:sharedCatalog?.records?.filter(x=>x.categories?.includes('speaker'))||[],pairs:POWERED_SUB_PAIRS});
      if(knownPowered||isPoweredSpeakerRecord(speaker.record)){
        setFeedback(POWERED_AMP_MESSAGE);
        intentFeedback.scrollIntoView({behavior:'auto',block:'nearest'});
        return;
      }
    }
    // If the visitor clicks quickly, wait for the verified equipment registry
    // before deciding what is the strongest candidate. A missing registry may
    // keep the older preset suggestions, but never silently claim full evidence.
    setFeedback('Checking available verified equipment specifications…');
    await catalogReady;
    setFeedback('');
    report(selected);
    result.hidden = false;
    // Start with the explanation and any overall system guidance, not the
    // first product. This container is already keyboard-focusable (tabindex -1).
    result.focus({preventScroll:true});
    result.scrollIntoView({behavior:'instant',block:'start'});
  });
});
