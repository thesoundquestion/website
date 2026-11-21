import {ownerEvidenceFor} from './owner-evidence.mjs';

/**
 * Model-specific, short editorial sound notes for the System Builder preview.
 * Sources are LINKED, not scraped, scored or redistributed measurement datasets.
 * One review is a listening impression, not a promise in another room.
 * Checked 2026-11-12. Exact model/revision matters. Unknown stays unknown.
 */
export const SOUND_PROFILES = Object.freeze({
  "powered-r1280t": {text:"An independent review describes a bass-and-treble-forward default balance that can sound more even after small tone-control adjustments; the pair becomes strained at high volume.",
    type:"Independent model-specific listening review",
    url:"https://www.soundguys.com/edifier-r1280t-review-127991/"},
  "powered-r1280db": {text:"An independent R1280DB review describes a comfortable, warm-leaning sound with natural vocals, although its midrange is not the last word in detail.",
    type:"Independent model-specific listening review",
    url:"https://theheadphonelist.com/edifier-r1280db-review-easygoing/"},
  "powered-r1280dbs": {text:"A review of the exact R1280DBs reports full, clear and punchy small-room playback with enjoyable stereo placement; that listening judgment is not a measured clean-output limit.",
    type:"Independent model-specific listening review",
    url:"https://www.techradar.com/reviews/edifier-r1280dbs"},
  "Edifier R1280DBs + T5": {text:"One owner found the bass could dominate with the sub level set too high. Another reported that the sub woke reliably when playing music. Try it at your usual volume.",
    type:"Individual owner experiences",
    url:"https://www.reddit.com/r/BudgetAudiophile/comments/1vyxex5/anyone_with_t5_powered_active_subwoofer/",
    ownerCaution:"These reports describe different rooms and volume settings. Listen for the bass blending with the pair at your seat.",
    ownerSources:[
      {context:"R1280DBs and T5 owner on sub level",url:"https://www.reddit.com/r/BudgetAudiophile/comments/1vyxex5/anyone_with_t5_powered_active_subwoofer/"},
      {context:"R1280DBs and T5 owner on standby",url:"https://forums.hardwarezone.com.sg/threads/pc-speaker-recommendation.6640007/page-47"}
    ]},
  "powered-r1700bts": {text:"An owner-reviewer found the R1700BTs enjoyable in a home office but comparatively thin and lacking bass authority when moved into larger listening rooms.",
    type:"Independent model-specific listening review",
    url:"https://www.ecoustics.com/reviews/edifier-r1700bts/"},
  "powered-mr3": {text:"Independent MR3 testing finds a reasonably even desktop response and useful imaging, while the limiter and bass output constrain louder listening.",
    type:"Independent model-specific listening review",
    url:"https://www.erinsaudiocorner.com/loudspeakers/edifier_mr3/"},
  "powered-m60": {text:"Independent M60 measurements find a smooth midrange and fairly controlled nearfield balance; deep bass and high-level bass headroom are limited by the small cabinets.",
    type:"Independent model-specific listening review",
    url:"https://www.erinsaudiocorner.com/loudspeakers/edifier_m60/"},
  "passive-bt20a-xt15": {text:"An independent Polk XT15 listening review reports lively, clear sound for its price, with limited low bass and some leaner lower vocals. The Fosi amplifier’s sound has not been established by the maker’s wattage or chip.",
    type:"One independent Polk speaker listening review; amp sound not inferred",
    url:"https://www.tnt-audio.com/casse/polk_xt15_e.html"},
  "headphone-ksc75": {text:"Koss describes the KSC75 as lightweight, open-air listening. Bass, tonality and perceived detail depend strongly on fit and ear position; an exact-model independent sound consensus has not been reviewed for this shortlist.",
    type:"Manufacturer description only; independent tonal profile unverified",
    url:"https://koss.com/en-ca/products/ksc75"},
  "headphone-portapro": {text:"Koss describes the wired Porta Pro as a bass-oriented, open-air portable headphone. Actual bass, tonal preference, noise leakage and comfort depend on the wearer and fit; no numerical sound score is inferred.",
    type:"Manufacturer description only; independent tonal profile unverified",
    url:"https://koss.com/en-ca/products/porta-pro"},
  "Fluance SX6 Elite (SX6-BK)": {text:"Fluance describes the SX6 Elite as a compact rear-ported passive design. No reliable independent exact-revision tonal review has been checked, so a warm/bright sound signature or measured bass limit is not asserted.",
    type:"Manufacturer description only; independent tonal profile unverified",
    url:"https://www.fluance.com/sx6-high-definition-two-way-bookshelf-loudspeakers-black-ash"},

  'PSB Alpha P3':{
    text:'A SoundStage independent audition describes open, clean mids and treble beyond its compact dimensions, but limited deep-bass output. A small room or subwoofer may suit it better.',
    type:'Independent model-specific listening review',
    url:'https://www.soundstagehifi.com/index.php/equipment-reviews/2-uncategorised/1259-psbs-alpha-p3-loudspeaker-paul-barton-aims-for-high-sound-quality-at-a-very-low-price'
  },
  'PSB Alpha P5':{
    text:'Several independent reviews describe natural vocals and coherent stereo placement with a smooth, slightly warm presentation. Bass is respectable for the enclosure, not subwoofer-deep.',
    type:'Multiple independent listening reviews',
    url:'https://www.soundstageaccess.com/index.php/equipment-reviews/959-psb-alpha-p5-loudspeakers'
  },
  'Triangle Borea BR03 (passive)':{
    text:'A model-specific audition found agile bass and a spacious presentation with some treble emphasis; listeners vary in preference with placement and electronics.',
    type:'Independent listening review and separate owner accounts',
    url:'https://www.whathifi.com/reviews/triangle-borea-br03'
  },
  'Q Acoustics 3030i':{
    text:'One independent review describes controlled bass, relaxed tonal balance and good scale; owners disagree about how punchy bass feels in different rooms.',
    type:'Independent listening review and varied owner accounts',
    url:'https://www.whathifi.com/reviews/q-acoustics-3030i'
  },
  'Klipsch RP-600M II':{
    text:'An independent review describes better composure than the prior RP-600M. Published in-room sensitivity is not a calibrated anechoic comparison; some owners value toe-in and grille changes.',
    type:'Independent listening review and owner accounts',
    url:'https://www.erinsaudiocorner.com/loudspeakers/klipsch_rp_600m_ii/'
  },
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
  'Cerwin-Vega XLS-215': {
    text:'The manufacturer documents a dual-15-inch tower and 95.3 dB sensitivity at 1 W / 3.28 ft. This supports high-efficiency screening, not a claim about tonal accuracy, clean maximum SPL or sustained distortion.',
    type:'Manufacturer specification only; listening profile unverified',
    url:'https://cerwinvega.com/products/xls-215'
  },
  'Cerwin-Vega XLS-15': {
    text:'The manufacturer quotes 92.3 dB sensitivity at 1 W / 3.28 ft for the 15-inch tower. A dependable independent assessment of tonal balance and sustained high-output compression is not established.',
    type:'Manufacturer specification only; listening profile unverified',
    url:'https://cerwinvega.com/products/xls-15'
  },
  'Cerwin-Vega XLS-12': {
    text:'This 12-inch tower is manufacturer-rated at 90.8 dB at 1 W / 3.28 ft. Cabinet size and a peak-watt label cannot establish its real clean volume or subjective sound character.',
    type:'Manufacturer specification only; listening profile unverified',
    url:'https://cerwinvega.com/products/xls-12'
  },
  'Klipsch R-51M': {
    text:'Klipsch publishes a 93 dB sensitivity figure and continuous/peak input figures for this compact horn-loaded model. The manufacturer sensitivity convention and cabinet limits prevent a direct real-room party-output comparison.',
    type:'Manufacturer specification only; listening profile unverified',
    url:'https://assets.klipsch.com/product-specsheets/R-51M_Spec-Sheet_v01.pdf'
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
  },
  // Independent listening impressions for popular headphones. The descriptions
  // capture review tendencies, not a universal frequency-response preference.
  'FiiO FT1':{
    text:'Independent reviews commonly report a warm, bass-forward closed-back sound with substantial low-end weight. Listeners differ on whether that richness is appealing or obscures some midrange detail.',
    type:'Multiple independent listening reviews, varying judgments',
    url:'https://www.rtings.com/headphones/reviews/fiio/ft1',
    reviewSources:[
      {url:'https://www.rtings.com/headphones/reviews/fiio/ft1',context:'RTINGS measured response and listening discussion'},
      {url:'https://www.techradar.com/audio/headphones/fiio-ft1-review',context:'Independent review finds sound-dependent trade-offs'}
    ]
  },
  'AKG K371':{
    text:'Independent testing describes a bass-weighty but generally smooth, even midrange and clear-treble presentation. An exact fit and earcup seal are important to the perceived low end.',
    type:'Independent listening reviews and measured response',
    url:'https://www.rtings.com/headphones/reviews/akg/k371',
    reviewSources:[
      {url:'https://www.rtings.com/headphones/reviews/akg/k371',context:'RTINGS tonal assessment'},
      {url:'https://headphones.com/blogs/reviews/akg-k371-review-closed-back-benchmark-headphone',context:'Independent listening assessment'}
    ]
  },
  'Grado SR80x':{
    text:'Some reviewers describe a particularly clear, energetic upper-frequency presentation with comparatively modest bass. Other reviewers hear more bass body, so expectations about warmth versus brightness are not unanimous.',
    type:'Independent reviews with differing impressions',
    url:'https://www.soundguys.com/grado-labs-sr80x-review-71743/',
    reviewSources:[
      {url:'https://www.soundguys.com/grado-labs-sr80x-review-71743/',context:'SoundGuys SR80x frequency-response discussion'},
      {url:'https://www.headfonia.com/grado-sr80x-sr325x-review/3/',context:'Headfonia listening review'}
    ]
  },
  'Grado SR60x':{
    text:'Independent comparisons describe a similarly open-air Grado presentation but less emphasised treble than the SR80x. Fit and pad position affect the bass and treble that reach your ears.',
    type:'Independent listening and comparative review',
    url:'https://www.soundguys.com/grado-labs-sr60x-review-70100/',
    reviewSources:[
      {url:'https://www.soundguys.com/grado-labs-sr60x-review-70100/',context:'SoundGuys SR60x response and SR80x comparison'}
    ]
  },
  'Koss KSC75':{
    text:'Independent headphone measurements and listener comparisons describe an open, clear presentation for its size with limited low-bass weight. Ear-clip positioning changes the perceived bass.',
    type:'Independent headphone measurements and listening comparison',
    url:'https://www.rtings.com/headphones/reviews/koss/ksc75',
    reviewSources:[
      {url:'https://www.rtings.com/headphones/reviews/koss/ksc75',context:'RTINGS KSC75 comparison'}
    ]
  },
  'Koss Porta Pro (wired)':{
    text:'Independent comparisons often describe the Porta Pro as fuller and bassier than the KSC75, with a softer upper-frequency balance. The on-ear fit and pad condition can change what you hear.',
    type:'Independent comparative listening and measurements',
    url:'https://www.audiodiscourse.com/2020/12/koss-yaxi-measurements-and-impressions.html',
    reviewSources:[
      {url:'https://www.audiodiscourse.com/2020/12/koss-yaxi-measurements-and-impressions.html',context:'Measurements and comparison of Koss models'},
      {url:'https://www.rtings.com/headphones/reviews/koss/ksc75',context:'Koss Porta Pro comparison'}
    ]
  },
  'Audio-Technica ATH-M50x':{
    text:'Comparative independent tests find a more uneven low-frequency and treble balance than the smoother AKG K371. Bass and treble emphasis can make recordings feel more forceful or less even.',
    type:'Independent headphone comparison and measurements',
    url:'https://www.rtings.com/headphones/tools/compare/audio-technica-ath-m50x-akg-k371/295/1671'
  },
  'Sennheiser HD 560S':{
    text:'Headphone comparisons often describe a relatively leaner, analytical balance through mids and treble, with a little more low-bass presence than the HD 600. Higher-frequency peaks may stand out on bright recordings.',
    type:'Independent measured and listening comparison',
    url:'https://headphones.com/blogs/reviews/sennheiser-hd560s-vs-hd600-comparative-review',
    reviewSources:[
      {url:'https://headphones.com/blogs/reviews/sennheiser-hd560s-vs-hd600-comparative-review',context:'Direct HD 560S versus HD 600 listening review'},
      {url:'https://www.rtings.com/headphones/reviews/sennheiser/hd-560s',context:'RTINGS HD 560S response review'}
    ]
  },
  'Sennheiser HD 600':{
    text:'Reviews often emphasise its smooth, natural midrange and intimate vocal presentation, with limited deep bass and a relatively understated sense of physical bass impact.',
    type:'Independent comparative listening and measurements',
    url:'https://headphones.com/blogs/reviews/sennheiser-hd560s-vs-hd600-comparative-review',
    reviewSources:[
      {url:'https://headphones.com/blogs/reviews/sennheiser-hd560s-vs-hd600-comparative-review',context:'Direct HD 600 versus HD 560S listening review'},
      {url:'https://www.rtings.com/headphones/tools/compare/sennheiser-hd-600-vs-sennheiser-hd-560s/325/18492',context:'RTINGS independent HD 600 comparison'}
    ]
  },
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
  return main+matched+place+reuse+input+'.';
}
