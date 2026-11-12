import {ownerEvidenceFor} from './owner-evidence.mjs';

/**
 * Model-specific, short editorial sound notes for the System Builder preview.
 * Sources are LINKED, not scraped, scored or redistributed measurement datasets.
 * One review is a listening impression, not a promise in another room.
 * Checked 2026-11-12. Exact model/revision matters. Unknown stays unknown.
 */
export const SOUND_PROFILES = Object.freeze({
  'passive-rs202-p3': {
    text:'PSB describes the compact P3 as balanced and clear, but no independent listening profile has been verified for this preview. Its small cabinet cannot promise deep bass.',
    type:'Manufacturer description only', url:'https://content-psbspeakers-com.s3.amazonaws.com/uploads/2021/03/PSB_Alpha-P3-Data-Sheet.pdf'
  },
  'passive-as301-p5': {
    text:'Reviewers describe natural, slightly warm vocals and smooth treble, with lively midrange and respectable bass for a small bookshelf speaker. Very deep bass remains limited.',
    type:'Independent listening review',url:'https://www.theabsolutesound.com/articles/psb-alpha-p5-loudspeaker/'
  },
  'powered-mr4': {
    text:'Independent testing finds a workable nearfield balance but limited low-bass reach. Monitor and Music modes offer different tunings, not a guarantee of studio-level accuracy.',
    type:'Independent measurements and review',url:'https://www.erinsaudiocorner.com/loudspeakers/edifier_mr4/'
  },
  'powered-ora': {
    text:'An independent review found generally even sound with slightly relaxed upper treble and clear mids. Small drivers and cabinet limit deep bass without a subwoofer.',
    type:'Independent measurements and review',url:'https://www.audioholics.com/computer-speaker-reviews/kanto-living-ora'
  },
  'studio-jbl': {
    text:'An independent review heard a broad, deep stereo image and punchy bass, but also some upper-midrange forwardness and midbass resonance. Nearfield hiss is worth checking.',
    type:'Independent measurements and listening review',url:'https://www.erinsaudiocorner.com/loudspeakers/jbl_305pmk2/'
  },
  'studio-kali': {
    text:'Independent measurements support a generally even nearfield balance and useful bass extension for its size. Room placement and boundary EQ can change the result considerably.',
    type:'Independent measurement interpretation',url:'https://www.erinsaudiocorner.com/loudspeakers/kali_lp-6v2/'
  },
  'headphone-hd560': {
    text:'Independent testing describes a mostly neutral presentation with some low-bass roll-off. Open backs leak sound and offer little isolation.',
    type:'Independent headphone test',url:'https://www.rtings.com/headphones/reviews/sennheiser/hd-560s'
  },
  'headphone-hd600': {
    text:'Independent testing finds a broadly balanced midrange with reduced deep bass. It is open-back, with substantial sound leakage and very little isolation.',
    type:'Independent headphone test',url:'https://www.rtings.com/headphones/reviews/sennheiser/hd-600'
  },
  'party-soundboks': {
    text:'Independent testing finds very high output, punchy bass and lively treble, but limited deep rumble. One unit plays stereo music in mono and sounds different off-axis.',
    type:'Independent speaker test (October 2026)',url:'https://www.rtings.com/speaker/reviews/soundboks/4'
  },
  'party-jbl': {text:'Designed around live-event speech/music coverage and microphone mixing. A reliable tonal listening profile for this exact PA revision is not established here.',type:'Application and specifications only',url:'https://www.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw855d8ce0/pdfs/JBL_EONONE-MK2-UserGuide.pdf'},
  'party-dzr': {text:'Built for professional sound reinforcement and high audience output, not a verified home-stereo sound signature. Tonal character at your venue has not been established.',type:'Application and specifications only',url:'https://ca.yamaha.com/en/audio/portable-pa/products/speakers/dzr/specs.html'},
  'used-rx485-titan': {text:'No dependable model-and-revision-specific sonic profile has been verified for the Titan v3 pair. Driver and crossover condition can materially alter a used speaker.',type:'Not independently characterized',url:null},
  'Polk Monitor XT20': {
    text:'Some owners appreciate the larger Polk XT20 for bass and everyday listening, while others find the mids need careful placement or EQ; a universal tonal match is not established.',
    type:'Owner listening reports, varied conditions',
    url:'https://www.reddit.com/r/BudgetAudiophile/comments/1db8yol'
  },
  'Polk Monitor XT15': {
    text:'One hands-on review describes lively, clear sound and useful punch for a low-cost compact speaker, but less expansive stereo imaging and some leaner lower vocals.',
    type:'Independent hands-on listening review, not an owner consensus',
    url:'https://www.tnt-audio.com/casse/polk_xt15_e.html'
  },
  'Polk Signature Elite ES15': {
    text:'A listening review describes clear, lively vocals and crisp highs, with punchy rather than deep bass. Bright recordings or toe-in can make the treble more prominent.',
    type:'Independent listening review',url:'https://www.hifipicks.com/en/reviews/polk-signature-elite-es15-56660'
  },
  'Polk Signature Elite ES20': {
    text:'Reviews commonly describe strong bass and a spacious sound for this size, but disagree about treble: some hear it as balanced, others as bright. Positioning and EQ matter.',
    type:'Linked review synthesis; impressions vary',url:'https://www.audiowords.net/reviews/polk-signature-elite-es20'
  },
  'Klipsch R-50M': {
    text:'A listening review reports direct, vivid stereo placement and lively dynamics with some textured midrange. Other reports vary on treble brightness, so auditioning matters.',
    type:'Independent listening review',url:'https://www.hifireport.com/onkyo-tx-8260-and-klipsch-r-50m-system-review/'
  },
  'Paradigm Monitor SE Atom': {
    text:'Published review impressions describe an engaging, well-balanced compact speaker. Independent lab data are available, but bass depth and your room response remain limited or uncertain.',
    type:'Review excerpt plus independent lab source',url:'https://www.soundstagenetwork.com/index.php?Itemid=110&id=1968&option=com_content&view=article'
  },
  'ELAC Debut 3.0 DB63': {
    text:'ELAC claims natural balance, clearer highs and controlled bass for this 6.5-inch model. An independent tonal listening description has not been verified for this preview.',
    type:'Manufacturer description only',url:'https://elac.com/db63'
  },
  'ELAC Debut 2.0 B6.2': {
    text:'An independent review describes balanced, unforced treble and midrange with rhythmic, weighty bass. It is revealing of poor recordings and does not reproduce the deepest notes.',
    type:'Independent listening review',url:'https://www.whathifi.com/reviews/elac-debut-20-b62'
  },
  'Wharfedale Diamond 12.1': {
    text:'Some exact-model listeners describe it as enjoyable with modest stereo amplifiers; an independent hands-on review describes a composed and relatively forgiving presentation for its size.',
    type:'Limited owner reports and independent hands-on review',
    url:'https://www.whathifi.com/speakers/hi-fi-speakers/hi-fi-deal-alert-the-superb-wharfedale-diamond-12-1-speakers-drop-in-price-in-the-black-friday-sales'
  },
  'Wharfedale Diamond 12.2': {
    text:'A published review describes weighty, controlled bass, articulate instruments and convincing stereo space. Other listeners describe warm mids and smooth upper treble.',
    type:'Independent listening review',url:'https://www.hifichoice.com/content/wharfedale-diamond-122'
  },
  'KEF Q150': {
    text:'Independent loudspeaker measurements document finite deep-bass reach and a response that is not perfectly even. The coaxial driver alone does not prove superior imaging in your room.',
    type:'Independent measurement interpretation',url:'https://www.spinorama.org/speakers/KEF%20Q150/ErinsAudioCorner/index_eac.html'
  },
  'Q Acoustics 3010i': {
    text:'One independent listening review praises lively, clear music playback from the compact original 3010i but notes less scale with dense recordings than larger speakers. Several owners also use them in small systems.',
    type:'Independent hands-on listening review and limited owner experience',
    url:'https://www.whathifi.com/q-acoustics/3010i/review'
  },
  'Q Acoustics 3020i': {
    text:'An independent review describes warm, rich mids, firm bass for the size, detailed treble and a broad stereo presentation. It benefits from some space away from a wall.',
    type:'Independent listening review',url:'https://www.whathifi.com/q-acoustics/3020i/review'
  },
  'JBL Stage 250B': {
    text:'Independent measurements are published for the exact model; the response and bass reach are not perfectly flat or unlimited. A reliable reviewer consensus on perceived tone is not established here.',
    type:'Independent measurement interpretation',url:'https://www.erinsaudiocorner.com/loudspeakers/jbl_250b/'
  },
  'DALI Oberon 1': {
    text:'An independent review reports expressive voices, focused stereo placement and smooth but lively highs. Its small size limits bass authority compared with larger speakers.',
    type:'Independent listening review',url:'https://www.whathifi.com/reviews/dali-oberon-1'
  },
  'Paradigm Titan v3': {
    text:'A dependable sonic profile for the exact vintage revision has not been verified. Surrounds, crossover parts and previous repairs can make two used pairs sound different.',
    type:'Not independently characterized',url:null
  }
});
const UNKNOWN = Object.freeze({text:'No reliable model-specific sound profile has been reviewed yet. Tonal balance, bass and imaging are not inferred from driver materials or brand.',type:'Not independently characterized',url:null});
export function soundProfileFor(item) {
  const model=item?.soundTarget || item?.title || '';
  const owners=ownerEvidenceFor(model);
  if(owners) {
    // Prefer multiple exact-model user experiences over absent/unsuitable lab
    // metrics, but describe them as reports, never acoustic measurement facts.
    return {
      text:owners.short,
      type:owners.label+' (subjective, setup-dependent)',
      url:owners.sources[0]?.url || null,
      ownerSources:owners.sources,
      ownerCaution:owners.caution
    };
  }
  // Scarce owner evidence is never a reason to hide a feasible candidate.
  return SOUND_PROFILES[item?.soundTarget] || SOUND_PROFILES[item?.id] || SOUND_PROFILES[item?.title] || UNKNOWN;
}
const ROOM_LABELS = Object.freeze({desk:'desk / nearfield',bedroom:'bedroom / small room',living_room:'living room',outdoors:'outdoors',party:'event / party'});
/** Explains EXACTLY which editorial tags and context matched, not a sonic score. */
export function recommendationWhy(item, request={}, labels={}) {
  const title = key => labels[key] || key || 'balanced listening';
  const main = item.editorialGoalFocus
    ? 'Shortlisted for your '+title(request.goal)+' priority'
    : 'A comparison option, not a direct editorial match to your '+title(request.goal)+' priority';
  const extras = Array.isArray(item.secondaryFocus) ? item.secondaryFocus : [];
  const matched = extras.length ? '; also tagged for '+extras.map(title).join(' and ') : '';
  const place = !item.sceneCaution && ROOM_LABELS[request.useCase]
    ? '. Suggested for '+ROOM_LABELS[request.useCase]+' use' : '';
  const reuse = item.ownedAmpName ? '. Keeps your '+item.ownedAmpName+' instead of pricing a new amplifier; electrical compatibility remains unverified' : '';
  const input = item.connectionStatus === 'adapter_needed' ? '. Your chosen input needs additional equipment' : '';
  const cap = request.budgetStrict && Number.isFinite(request.budget) && item.subtotal !== null && Number.isFinite(item.subtotal) && item.subtotal <= request.budget
    ? '. Known listed parts are below your ceiling, not a complete-system cost' : '';
  return main+matched+place+reuse+input+cap+'.';
}
