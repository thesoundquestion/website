/**
 * Editorial, source-linked example systems, not a product leaderboard.
 * Checked 2026-11-12. Prices are individual observed Canadian offers/list prices,
 * NOT normal/representative prices and NOT finished-system costs.
 * Candidate-specific safety / acoustic / room compatibility is NOT certified.
 * No customer information is sent anywhere.
 */
export const EXAMPLES = Object.freeze([
  {
    id:'passive-rs202-p3', architecture:'passive_separates', title:'Budget passive stereo: Yamaha R-S202 + PSB Alpha P3',
    kind:'New-system example', places:['living_room','bedroom'], power:'mains',
    connections:['analog','bluetooth'], goals:['all_rounder','natural','low_volume'],
    parts:[
      {name:'Yamaha R-S202 receiver',count:1,role:'Amplification, volume control and Bluetooth',url:'https://ca.yamaha.com/en/audio/home-audio/products/hifi-components/r-s202/specs.html'},
      {name:'PSB Alpha P3 passive speakers',count:1,role:'One stereo pair, sold as a pair',url:'https://www.psbspeakers.com/products/alpha-p3-compact-bookshelf'}
    ],
    why:'A straightforward receiver and compact passive stereo pair with an analogue or Bluetooth source path.',
    tradeoff:'Important electrical caveat: Yamaha specifies 8 Ω or higher speakers; PSB quotes 8 Ω nominal but a 4 Ω minimum. This is NOT a verified safe pairing. Confirm suitability directly with Yamaha before purchase; otherwise choose a verified match. Neither product alone provides deep sub-bass.',
    extra:['Source must be RCA analogue or Bluetooth. USB, optical and TV HDMI require separately priced conversion/control hardware.',
      'Passive speaker wire is required. Confirm amplifier load permissions under real operating conditions.'],
    priceCA:{components:[{label:'Yamaha R-S202',amount:299.95,url:'https://www.soundroom.ca/products/r-s202b'},{label:'PSB Alpha P3 pair',amount:449,url:'https://www.psbspeakers.com/collections/alpha'}]}
  },
  {
    id:'passive-as301-p5', architecture:'passive_separates', title:'Expandable stereo: Yamaha A-S301 + PSB Alpha P5',
    kind:'New-system example', places:['living_room','bedroom'], power:'mains',
    connections:['analog','optical'],goals:['all_rounder','natural','imaging','dynamic','bass'],
    parts:[
      {name:'Yamaha A-S301 integrated amplifier',count:1,role:'Amplification, volume control, analogue and optical inputs',url:'https://ca.yamaha.com/en/audio/home-audio/products/hifi-components/a-s301/specs.html'},
      {name:'PSB Alpha P5 passive speakers',count:1,role:'One stereo pair',url:'https://www.psbspeakers.com/collections/alpha'}
    ],
    why:'A conventional separate-amp system with built-in optical conversion and a wider speaker-upgrade path than compact powered boxes.',
    tradeoff:'Not a verified speaker/amplifier load match until the P5 minimum-impedance curve, amplifier permitted loads and room output needs are checked. Sub Out on the A-S301 is not evidence that its main speakers are high-passed.',
    extra:['Speaker cable is required; stands, streamer and optional subwoofer are separate.',
      'For Bluetooth, USB or HDMI, add and price an appropriate source or converter.'],
    priceCA:{components:[{label:'Yamaha A-S301',amount:649.95,url:'https://www.crutchfield.ca/p_022AS301B/Yamaha-A-S301.html'},{label:'PSB Alpha P5 pair',amount:699,url:'https://www.psbspeakers.com/collections/alpha'}]}
  },
  {
    id:'powered-mr4', architecture:'consumer_powered_pair', title:'Low-cost wired desk: Edifier MR4 stereo pair',
    kind:'Complete powered pair (with compatible analogue source)', places:['desk','bedroom','living_room'], power:'mains',
    connections:['analog'],goals:['all_rounder','natural','low_volume','imaging'],
    parts:[{name:'Edifier MR4 powered stereo speakers',count:1,role:'One box contains active right speaker, passive left speaker and connecting cable',url:'https://ca.edifier.com/products/mr4'}],
    why:'A single powered stereo package with an analogue input, built-in amplification and front-panel volume control. Avoids buying an amp just to start listening at a desk.',
    tradeoff:'Wired only, no built-in Bluetooth/USB/optical/HDMI. The published 60 Hz frequency-response endpoint does not establish deep bass or room-output headroom. Not a safe assumed party/high-volume system.',
    extra:['A compatible analogue source and wall outlet are required. Confirm desk space, included cables and whether the desired listening level is practical.'],
    priceCA:{components:[{label:'Edifier MR4 pair',amount:179.99,url:'https://ca.edifier.com/products/mr4'}]}
  },
  {
    id:'powered-ora', architecture:'consumer_powered_pair', title:'Compact flexible desk: Kanto ORA stereo pair',
    kind:'Complete powered pair (with a compatible source)', places:['desk','bedroom','living_room'], power:'mains',
    connections:['analog','usb','bluetooth'],goals:['all_rounder','imaging','natural','bass','low_volume'],
    parts:[{name:'Kanto ORA original powered stereo pair',count:1,role:'Pair with internal amplification, USB-C, RCA, Bluetooth and sub output',url:'https://kantoaudio.com/powered-speakers/ora/'}],
    why:'An integrated stereo path for computer and wireless listening. Original ORA documents a 100 Hz main/sub crossover when a sub is connected.',
    tradeoff:'The small 3-inch woofers limit what to assume about low bass or large-room output. Original ORA is not ORA4, whose routing differs. Additional sub, stands and connection accessories cost extra.',
    extra:['For a sub, verify the exact ORA revision and connection; do not infer an automatic clean-SPL increase.'],
    priceCA:{components:[{label:'Kanto ORA pair',amount:399.99,url:'https://www.crutchfield.ca/p_310ORABK/Kanto-ORA-Matte-Black.html'}]}
  },
  {
    id:'studio-jbl', architecture:'active_studio', title:'Nearfield separates: two JBL 305P MkII monitors',
    kind:'Two individual powered monitors', places:['desk','bedroom'], power:'mains',
    connections:['analog'],goals:['imaging','natural','all_rounder','dynamic'],
    parts:[{name:'JBL 305P MkII active monitor',count:2,role:'Order TWO individual loudspeakers; not a pre-packed stereo pair',url:'https://www.jbl.com/305PMKII-.html'},
      {name:'Suitable stereo level control/interface and signal cables',count:1,role:'Required if the source lacks appropriate analogue outputs and level control',url:null}],
    why:'A two-monitor route intended for nearfield stereo listening, with each speaker powered independently.',
    tradeoff:'The quoted monitor price is PER CABINET, and a complete system may need an interface/controller and cables. Verify connection levels, self-noise close to the ears and room placement.',
    extra:['Not a substitute for a portable party rig. No direct USB, optical, HDMI or Bluetooth input on the monitor itself.'],
    priceCA:{components:[{label:'JBL 305P MkII, each',amount:279.99,quantity:2,url:'https://www.avshop.ca/recording-studio-monitoring-studio-monitors/jbl-305p-mkii-powered-5in-two-way-studio-monitor-each-black'}]}
  },
  {
    id:'studio-kali', architecture:'active_studio', title:'Larger desk / small room: two Kali LP-6 V2 monitors',
    kind:'Two individual powered monitors', places:['desk','bedroom','living_room'], power:'mains',
    connections:['analog'],goals:['natural','imaging','all_rounder','dynamic','bass'],
    parts:[{name:'Kali Audio LP-6 V2 (2nd Wave) monitor',count:2,role:'Two individually powered cabinets',url:'https://www.kaliaudio.com/lone-pine-studio-monitors'},
      {name:'Stereo source/volume path and suitable cables',count:1,role:'Check RCA/balanced connection and reliable volume control',url:null}],
    why:'A larger active-monitor alternative when a desk or small room can accommodate two 6.5-inch cabinets and correct placement.',
    tradeoff:'Each monitor needs power, space and suitable level control. Two-cabinet subtotal omits potential interface, stands and cables; no guarantee of better sound than cheaper options in an untreated room.',
    extra:['Check rear boundary-switch settings and listening position. If volume is occasionally high, verify actual output requirements rather than using woofer size as a promise.'],
    priceCA:{components:[{label:'Kali LP-6 V2, each',amount:329.99,quantity:2,url:'https://www.avshop.ca/recording-studio-monitoring-studio-monitors/kali-audio-lp-6-v2-6-5in-studio-monitor-black-each'}]}
  },
  {
    id:'headphone-hd560', architecture:'headphone_first', title:'Open-back home listening: Sennheiser HD 560S',
    kind:'Headphone + existing suitable output', places:['desk','bedroom','living_room'], power:'source_dependent',
    connections:['analog'],goals:['natural','imaging','all_rounder','low_volume'],
    parts:[{name:'Sennheiser HD 560S headphones',count:1,role:'Open-back wired headphone',url:'https://ca.sennheiser-hearing.com/collections/hd-series-headphones'}],
    why:'A wired open-back option for quiet environments when isolation and sound leakage are acceptable.',
    tradeoff:'Not for noisy or shared spaces where isolation matters. Confirm source output/headphone connector, fit and comfortable listening level. A particular soundstage is not guaranteed by open-back construction.',
    extra:['Headphone output or compatible external adapter is required if the source cannot drive it.'],
    priceCA:{components:[{label:'Sennheiser HD 560S',amount:199.95,url:'https://ca.sennheiser-hearing.com/collections/hd-series-headphones'}]}
  },
  {
    id:'headphone-hd600', architecture:'headphone_first', title:'Open-back home alternative: Sennheiser HD 600',
    kind:'Headphone + verified source output', places:['desk','bedroom','living_room'], power:'source_dependent',
    connections:['analog'],goals:['natural','low_volume','imaging'],
    parts:[{name:'Sennheiser HD 600 headphones',count:1,role:'Open-back wired headphone',url:'https://support.sennheiser-hearing.com/hc/en-fr/articles/38292415494173-HD-600-Specifications'}],
    why:'A higher-priced, open-back comparison target with well-documented factory specifications, worth auditioning rather than automatically upgrading.',
    tradeoff:'Needs a suitable headphone output for the intended level; leakage and fit remain. Higher price is not proof of an audible improvement in your setup.',
    extra:['Check exact regional cable, comfort and quiet-level channel matching.'],
    priceCA:{components:[{label:'Sennheiser HD 600 list price',amount:579.95,url:'https://ca.sennheiser-hearing.com/collections/hd-series-headphones'}]}
  },
  {
    id:'party-soundboks', architecture:'party_pa', title:'Portable battery party: SOUNDBOKS 4',
    kind:'One self-powered party speaker', places:['party','outdoors','living_room'], power:'battery',
    connections:['bluetooth','analog'],goals:['party','dynamic'],
    parts:[{name:'SOUNDBOKS 4 (includes battery)',count:1,role:'One powered battery party speaker; stereo/coverage from more units is separate',url:'https://soundboks.ca/products/soundboks-4'}],
    why:'A real battery-powered event option with self-contained amplification and Bluetooth rather than a mains-only home stereo.',
    tradeoff:'One box is not a guaranteed stereo pair. Battery duration depends on level, venue coverage is unverified, and SPL marketing maxima do not prove clean sustained output at the crowd.',
    extra:['Check weight, weather, safe hearing exposure, local serial/recall notices and the event power/coverage plan.'],
    priceCA:{components:[{label:'SOUNDBOKS 4 with battery',amount:1499,url:'https://soundboks.ca/products/soundboks-4'}]}
  },
  {
    id:'party-jbl', architecture:'party_pa', title:'Microphones and small events: JBL EON ONE MK2',
    kind:'One battery PA column system', places:['party','outdoors'], power:'battery',
    connections:['analog','bluetooth'],goals:['party'],
    parts:[{name:'JBL EON ONE MK2',count:1,role:'One powered battery PA column with built-in mixer inputs',url:'https://www.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw855d8ce0/pdfs/JBL_EONONE-MK2-UserGuide.pdf'}],
    why:'An event-oriented option where microphone inputs, transport and battery power matter alongside music playback.',
    tradeoff:'One column is not a full stereo PA. Coverage and clean sustained level for the event need checking. No verified normal regional price is included.',
    extra:['Confirm battery, mic/input configuration, source path, legal sound levels and any recall/serial guidance.'],
    priceCA:null
  },
  {
    id:'party-dzr', architecture:'party_pa', title:'Mains-powered PA: Yamaha DZR15 (non-Dante)',
    kind:'One powered PA cabinet, not a complete stereo rig', places:['party','outdoors'], power:'mains',
    connections:['analog'],goals:['party','dynamic'],
    parts:[{name:'Yamaha DZR15 (non-Dante)',count:2,role:'Example stereo pair: two individual powered PA cabinets',url:'https://ca.yamaha.com/en/audio/portable-pa/products/speakers/dzr/specs.html'},
      {name:'Mixer/controller, safe stands and cabling',count:1,role:'Not included in speaker-only price',url:null}],
    why:'A higher-output event architecture with professional inputs for mains-powered venues.',
    tradeoff:'AC power mandatory, not a backyard battery speaker. Transport, rigging, mixer and venue safety matter. Output and pricing are not checked for your specific audience.',
    extra:['Outdoor use still needs weather protection and safe mounting; check exact non-Dante SKU.'],
    priceCA:null
  },
  {
    id:'used-rx485-titan', architecture:'passive_separates', title:'Used-equipment watchlist: Yamaha RX-485 + Paradigm Titan v3',
    kind:'Research used listings individually', places:['living_room','bedroom'], power:'mains',
    connections:['analog'],goals:['all_rounder','natural','low_volume'],
    usedOnly:true,
    parts:[{name:'Yamaha RX-485 receiver (US/Canada)',count:1,role:'Exact revision/condition required',url:'https://github.com/thesoundquestion/website/blob/main/system-check/gear.js'},
      {name:'Paradigm Titan v3 passive speakers',count:1,role:'Used stereo pair; driver surrounds and originality need checking',url:'https://github.com/thesoundquestion/website/blob/main/system-check/gear.js'}],
    why:'A model-specific used-gear search direction rather than paying new-equipment prices by default.',
    tradeoff:'Not a verified electrical pairing or a guaranteed bargain. Real used prices, condition, repairs, speaker-foam status and amplifier safety all remain unknown.',
    extra:['Ask for a working demo and photos of both speaker drivers, terminals and receiver internals. Count necessary service cost.'],
    priceCA:null
  }
]);

const allowedArch = ['passive_separates','consumer_powered_pair','active_studio','headphone_first','party_pa'];
export function shortlistExamples(input = {}) {
  const arch = allowedArch.includes(input.architecture) ? input.architecture : 'open';
  const scene = String(input.useCase || 'living_room');
  const aim = String(input.goal || 'all_rounder');
  const neededPower = input.power === 'battery' ? 'battery' : null;
  const strict = input.budgetStrict !== false;
  const budget = Number.isFinite(input.budget) && input.budget >= 0 ? input.budget : null;
  const region = String(input.region || '');
  const currency = String(input.currency || '');
  const used = input.used !== false;
  const selected = [], excluded = [];
  const targetArchitectures = arch === 'open' ?
    (scene === 'party' || aim === 'party' ? ['party_pa'] : ['passive_separates','consumer_powered_pair','active_studio']) :
    [arch];
  let order;
  if (targetArchitectures.length === 1 && targetArchitectures[0] === 'headphone_first') order = ['headphone-hd560','headphone-hd600'];
  else if (targetArchitectures.length === 1 && targetArchitectures[0] === 'party_pa') order = ['party-soundboks','party-jbl','party-dzr'];
  else if (scene === 'desk') order = ['powered-mr4','powered-ora','studio-jbl','studio-kali','passive-rs202-p3','passive-as301-p5','used-rx485-titan'];
  else if (aim === 'bass') order = ['powered-ora','passive-as301-p5','studio-kali','passive-rs202-p3','studio-jbl','powered-mr4','used-rx485-titan'];
  else if (aim === 'dynamic' || input.level === 'high') order = ['passive-as301-p5','studio-kali','passive-rs202-p3','studio-jbl','powered-ora','powered-mr4','used-rx485-titan'];
  else order = ['passive-rs202-p3','passive-as301-p5','powered-ora','powered-mr4','studio-kali','studio-jbl','used-rx485-titan'];
  const max = arch === 'open' ? 4 : 3;
  for (const id of order) {
    const product = EXAMPLES.find(x => x.id === id);
    if (!product || !targetArchitectures.includes(product.architecture)) continue;
    if (product.usedOnly && !used) continue;
    if (neededPower && product.power !== 'battery' && product.power !== 'source_dependent') {
      excluded.push({title:product.title,reason:'Battery operation required; this example uses wall power.'}); continue;
    }
    const snapshot = region === 'CA' && currency === 'CAD' ? product.priceCA : null;
    const subtotal = snapshot ? Math.round(snapshot.components.reduce((n,p)=>n+p.amount*(p.quantity || 1),0)*100)/100 : null;
    if (strict && budget !== null && subtotal !== null && subtotal > budget) {
      excluded.push({title:product.title,reason:'The evidenced component subtotal alone is over your firm budget.'});
      continue;
    }
    if (selected.length >= max) continue;
    if (arch === 'open' && selected.some(x=>x.architecture===product.architecture) &&
        new Set(selected.map(x=>x.architecture)).size < 3) continue;
    const needsConnection = input.connection && input.connection !== 'undecided' && !product.connections.includes(input.connection);
    selected.push({ ...product, subtotal, priceComponents:snapshot?.components || [],
      pricingStatus: subtotal === null ? 'regional_price_missing' : 'partial_subtotal',
      connectionStatus: needsConnection ? 'adapter_needed' : 'native_possible',
      levelCaution:input.level === 'high' && ['powered-mr4','powered-ora'].includes(product.id),
      placementCaution:(Number(input.distanceFt)>10 && ['powered-mr4','powered-ora','studio-jbl','studio-kali'].includes(product.id)),
      sceneCaution:!product.places.includes(scene),
      sourceBatteryCaution:neededPower && product.power === 'source_dependent'
    });
  }
  return {selected,excluded,region,currency,budget,sourceDate:'2026-11-12'};
}
