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
