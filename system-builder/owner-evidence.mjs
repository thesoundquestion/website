/**
 * Source-linked, model-specific listening context from manually reviewed owner
 * discussions. Original critical summaries only. No copied post text, scraping,
 * manufactured sample sizes, sentiment percentages or sound-quality scores.
 *
 * The evidence label describes strength of available testimony, not the
 * probability a particular visitor will enjoy the speaker. Exact model/revision
 * matters. Missing records never disqualify a product.
 *
 * This module is a tiny editorial pilot, not a mirrored forum database.
 * Checked 2026-11-12; sources and details can change after that date.
 */
export const OWNER_EVIDENCE = Object.freeze({
  'Triangle Borea BR03 (passive)':{
    band:'some',relevantGoals:['all_rounder','natural','imaging','dynamic','bass'],
    label:'Several exact passive-model owner experiences',
    short:'Owners often describe the passive BR03 as spacious and lively, with clear vocals and firm bass; room size and speaker placement remain important.',
    caution:'Owners compare different amps, rooms and KEF/ELAC alternatives. One report prefers the Triangle for nuance while another recommends ELAC for loud rock; no standardized level-matched consensus.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1duh1rv',context:'Living-room owner compares passive BR03 against KEF Q150, July 2024'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/hp0foq',context:'Several owners comment on vocal clarity and bass, July 2020'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1xlfqwl',context:'BR03/ELAC owner compares character and loud rock, November 2026'}
    ]
  },
  'Q Acoustics 3030i':{
    band:'repeated_mixed',relevantGoals:['all_rounder','natural','bass','dynamic'],
    label:'Multiple firsthand owners with mixed bass impressions',
    short:'Several 3030i owners praise low-end weight and easy listening, while another felt the bass lacked the expected punch. Speaker stands, room position and wall distance appear important.',
    caution:'These are uncontrolled, different rooms and electronics. Do not substitute 3030c owners or turn a 3030i bass reputation into a measured room-independent score.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1fbataj',context:'Owner moves from 3010i to 3030i and praises added bass, September 2024'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1ova0eh',context:'Owner disappointed by bass and discussing placement, November 2025'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/nd03e7',context:'Owner praises bass but notes no sub replacement, May 2021'}
    ]
  },
  'Klipsch RP-600M II':{
    band:'some',relevantGoals:['all_rounder','dynamic','imaging'],
    label:'Several owners, limited controlled comparisons',
    short:'Owners of the exact RP-600M II often enjoy its energetic, room-filling presentation. Some mention toe-in, grilles and a subwoofer as worthwhile setup choices.',
    caution:'Do not conflate RP-600M II with the earlier RP-600M, R-50M or RP-500M II. Owner enthusiasm cannot certify actual sensitivity, full impedance minima, or treble comfort.',
    sources:[
      {url:'https://www.reddit.com/r/Klipsch/comments/1pzq7yl',context:'New owner and multiple replies, December 2025'},
      {url:'https://www.reddit.com/r/Klipsch/comments/1ngc081',context:'Owner reports upgrade vs R-51M and setup caveats, September 2025'},
      {url:'https://www.reddit.com/r/Klipsch/comments/1hhznph',context:'Owner with WiiM Amp, December 2024'}
    ]
  },
  'Polk Monitor XT20':{
    band:'some',relevantGoals:['all_rounder','bass','dynamic','natural'],
    label:'Owners report different experiences',
    short:'Some XT20 owners enjoy its punchy bass and relaxed listening; a separate owner calls it less refined and says setup or EQ made a difference.',
    caution:'The positive bass comments include EDM, amplifier bass boost and rooms of different sizes. A complaint about muddy mids is another personal setup report, not a measured fault or proof that everyone needs EQ.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1db8yol',context:'Two XT20 owners discuss stereo/desktop use and bass, June 2024'},
      {url:'https://www.reddit.com/r/hometheater/comments/1do6320',context:'XT20 owner reports bass and tonal criticisms in home theater use, June 2024'}
    ]
  },
  'Polk Signature Elite ES15': {
    band:'repeated', relevantGoals:['all_rounder','natural','imaging','low_volume'],
    label:'Several firsthand owner reports',
    short:'Owners in several setups report satisfying vocals and a comfortable compact-room presentation; a few disagree about clarity.',
    caution:'Bass without a subwoofer depends on the room and level. Owners disagree about clarity and treble, and none of these accounts is a controlled response measurement.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1h9wre1/',context:'Detailed desktop comparison, December 2024'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1f2l1gt/',context:'Owner comparison with KEF Q150, August 2024'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1q7qenu/',context:'Dissatisfied owner, January 2026'}
    ]
  },
  'Polk Signature Elite ES20': {
    band:'some', relevantGoals:['all_rounder','bass'],
    label:'Several owner experiences',
    short:'Some owners choose the larger ES20 for a fuller, more bass-oriented presentation; not everyone agrees about tonal balance.',
    caution:'Larger cabinet size and owner preference do not establish measured low-bass extension, clean output or universal listening comfort.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1nm4kzi/',context:'ES15-to-ES20 owner comparison, September 2025'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/w7r34m/',context:'Critical owner experience, July 2022'}
    ]
  },
  'ELAC Debut 3.0 DB63': {
    band:'repeated_mixed', relevantGoals:['all_rounder','bass','natural'],
    label:'Multiple owners, mixed experiences',
    short:'Some DB63 owners praise vocal body and bass; others find the presentation too subdued or unsatisfying in their setup.',
    caution:'These are differing impressions, not an objective warmth, bass or imaging score. Amp, placement, input route and level vary across reports.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1qbptmc/',context:'Positive owner with and without subwoofer, January 2026'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1qt3egh/',context:'Dissatisfied owner with Fosi electronics, February 2026'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1j12cp2/',context:'Owner describing low-level presentation concerns, March 2025'}
    ]
  },
  'KEF Q150': {
    band:'repeated_mixed', relevantGoals:['all_rounder','imaging','natural'],
    label:'Multiple owners, mixed experiences',
    short:'Owners often mention clear stereo placement and detail, while some find bass limited or report problems in particular systems.',
    caution:'Manufacturer specifications include a low impedance minimum for this nominally 8-ohm speaker. Owner praise never overrides an amplifier maker’s load restrictions.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1kjt4nt/',context:'Positive first-owner report, May 2025'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/15erktt/',context:'Owner investigating disappointing sound, July 2023'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/11n6v8s/',context:'Owner with bass expectations in larger room, March 2023'}
    ]
  },
  'Q Acoustics 3010i': {
    band:'some',relevantGoals:['all_rounder','natural','imaging','low_volume'],
    label:'Some firsthand owner experience',
    short:'Owners used this compact 3010i in desktop and mixed surround systems. One later moved to the much larger 3030i for fuller bass, which is a useful expectation for a small pair.',
    caution:'Other 3000i versions and the newer 3010c are different speakers. Owner setups vary, and a limited bass impression is not measured clean maximum output.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1fbataj',context:'Owner upgraded from 3010i desktop pair to 3030i for deeper low end, September 2024'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1g9oxcs',context:'Owner using 3010i in Yamaha RX-V385 system, October 2024'}
    ]
  },
  'Q Acoustics 3020i': {
    band:'some', relevantGoals:['all_rounder','natural','low_volume','imaging'],
    label:'Some firsthand owner support',
    short:'Owners in smaller rooms report enjoyable 2.0 listening, sometimes without a subwoofer; that may not translate to larger rooms.',
    caution:'The reports do not establish standardized deep-bass output or high-level performance. Placement and desired bass level remain important.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1fwncdl/',context:'Small-room owner, October 2024'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1iz40bs/',context:'Australian owner with optional sub, February 2025'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1wkahyf/',context:'Nearfield owner comment, November 2026'}
    ]
  },
  'Wharfedale Diamond 12.1': {
    band:'some', relevantGoals:['all_rounder','natural','imaging','low_volume'],
    label:'Some exact-model owner experiences',
    short:'Several original 12.1 owners enjoy their speakers for varied music and modest amplification; one newer owner also raised a cabinet/driver cosmetic concern.',
    caution:'Room placement, stand height and listening level vary; no standardized subjective score is implied. Keep original 12.1 separate from later 12.1i and do not confuse an appearance complaint with a proven acoustic defect.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1ro0fai/',context:'Two original 12.1 owners using compact Fosi amplifiers, March 2026'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1uq76su/',context:'Original 12.1 owner discussing music use against JBL alternative, July 2026'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1ibd4id/',context:'New and used original 12.1 owners discussing cosmetic marks, January 2025'}
    ]
  },
  'Wharfedale Diamond 12.2': {
    band:'repeated', relevantGoals:['all_rounder','natural','bass','low_volume'],
    label:'Several owners, different systems',
    short:'Owners describe the original Diamond 12.2 as comfortable for music, sometimes with enough bass for their room. That does not establish deep-bass output.',
    caution:'Reports are not level-matched or room-independent. Do not mix 12.2 with the newer 12.2i, and do not treat used sale anecdotes as typical market prices.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1qq1mud/',context:'Former owner describing easy listening with Rotel, January 2026'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1x54xj1/',context:'Long-term owner with Marantz NR1506, October 2026'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1wt9k6a/',context:'Separate 12.2 owner comment, September 2026'}
    ]
  },
  'DALI Oberon 1': {
    band:'some', relevantGoals:['natural','imaging','low_volume','all_rounder'],
    label:'Two different owner experiences',
    short:'One owner praised precise stereo positioning; another described fatigue at quiet levels. Treble comfort and placement deserve an audition.',
    caution:'One report changed multiple amplifier/placement variables and cannot establish the audible cause. Another reports fatigue with a Denon system. No universal sonic trait is measured.',
    sources:[
      {url:'https://www.reddit.com/r/audiophile/comments/1pzgv22/',context:'Owner comparison and brightness caveat, December 2025'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1xb5pxh/',context:'Owner reports listening fatigue, October 2026'}
    ]
  },
  'ELAC Debut 2.0 B6.2': {
    band:'some', relevantGoals:['bass','dynamic','all_rounder','natural'],
    label:'Owners in several different rooms',
    short:'Some owners report satisfying bass and value with this exact B6.2 generation. Others still use a sub or question their room and amplifier setup.',
    caution:'Do not transfer claims from the older Debut B6, newer Debut 3.0 DB63 or related Uni-Fi models. Reports are uncontrolled, often from different rooms.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/164c3l5/',context:'Owner using Marantz PM6007 reports satisfying bass, August 2023'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1iiqiz8/',context:'Owner describes positive budget use, February 2025'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1e0chpo/',context:'Owner troubleshooting an existing B6.2 system, July 2024'}
    ]
  },
  'JBL Stage 250B': {
    band:'some', relevantGoals:['all_rounder','dynamic','imaging','bass'],
    label:'A few firsthand listening accounts',
    short:'Some owners favour Stage 250B clarity and bass over their previous entry-level speakers; the number of detailed comparisons is still small.',
    caution:'One account uses a powered subwoofer and another compares store demonstrations, so do not infer sub-free bass or an objective measured improvement.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1t25zjv/',context:'Owner compared ES15 and Stage 250B in store, May 2026'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1q3uzu0/',context:'250B owner compared prior JBL series, June 2026'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1nfj48i/',context:'Owned 250B in Sony/Technics system with subwoofer, September 2025'}
    ]
  },
  'Klipsch R-50M': {
    band:'some', relevantGoals:['dynamic','all_rounder','imaging'],
    label:'Some exact-model owner reports',
    short:'Owners report enjoyable music playback, while advice-thread criticism often concerns Klipsch generally rather than confirmed R-50M ownership.',
    caution:'Do not conflate R-50M with R-50PM, R-51M, RP-600M, or R-50M II. Actual bass and treble preference remain system- and listener-dependent.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1q5ztkc/',context:'JBL MA310 with owned R-50M pair, January 2026'},
      {url:'https://www.reddit.com/r/Klipsch/comments/1tc9cya/',context:'Owner of four R-50M comments on value, May 2026'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1qyw249/',context:'Owner of R-50M with older JVC receiver, February 2026'}
    ]
  },
  'Paradigm Titan v3': {
    band:'limited', relevantGoals:['all_rounder','bass','natural'],
    label:'Limited vintage-owner reports',
    short:'Some vintage owners value the Titans as inexpensive, enjoyable speakers, but their actual condition matters more than generic sound adjectives.',
    caution:'Original foam surrounds can deteriorate, and repaired pairs can differ. Test each driver; visually verify the surrounds and the exact v3 revision before making a used offer.',
    sources:[
      {url:'https://www.reddit.com/r/audiophile/comments/1f18eyd/',context:'Owned v3 pair and first-hand surround condition discussion, August 2024'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1nzntej/',context:'Owned v3 pair requiring foam repair, October 2025'},
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1ettrfs/',context:'Vintage v3 owner-condition advice, August 2024'}
    ]
  },
  'Paradigm Monitor SE Atom': {
    band:'limited', relevantGoals:['all_rounder','natural'],
    label:'Limited firsthand owner context',
    short:'Some owners report satisfaction in compact systems, but there is not enough independent firsthand context to describe a consistent sonic character.',
    caution:'One discussion contains different owner uses. Do not claim an established preference consensus from that shared thread.',
    sources:[
      {url:'https://www.reddit.com/r/BudgetAudiophile/comments/1pdax61/',context:'Owner discussion across stereo and surround uses, December 2025'}
    ]
  }
});
const priority=Object.freeze({repeated:0,repeated_mixed:0,some:1,limited:2});
export function ownerEvidenceFor(model) {
  return OWNER_EVIDENCE[String(model||'')] || null;
}
/** Qualitative evidence band for editorial order among already eligible models.
 * Returns an ordinal tier only, never a sonic performance score. */
export function ownerEvidenceTier(model,goal) {
  const item=ownerEvidenceFor(model);
  if(!item || !item.relevantGoals.includes(goal))return 3;
  return priority[item.band]??3;
}
