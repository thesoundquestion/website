// Regional new-retail references checked 2026-11-13. Used listings stay in research.
const DATE = '2026-11-13';
const EDIFIER_MANUAL = 'https://usa-oss.edifier.com/Uploads/images/2021/07/15/2021071511185516263191358605.pdf';
const T5_MANUAL = 'https://new-edifier-us-oss.edifier.com/files/20240918/ab7c8c4b29b818271ce3ae9f8b50c016.pdf';
const WIIM_MANUAL = 'https://www.wiimhome.com/langPdf/en/WiiM%20Amp%20UM.pdf';
const WIIM_CROSSOVER = 'https://faq.wiimhome.com/en/support/solutions/articles/72000634761-subwoofer-advanced-options-subwoofer-bypass-mode-main-speakers-output-bass';
export const DENON_S650H_MANUAL = 'https://manuals.denon.com/AVRS650H/NA/EN/download.php?filename=%2FAVRS650H%2FNA%2FEN%2Fpdf%2FAVRS650H_NA_EN.pdf';
export const DENON_S650H_NAME = 'Denon AVR-S650H (North America)';
export const DENON_S650H_INPUTS = ['analog', 'optical', 'bluetooth', 'hdmi'];
const ORA_MANUAL = 'https://kantoaudio.com/en-us/products/ora';
const WIIM_INPUTS = ['analog', 'optical', 'bluetooth', 'hdmi'];
const homeScenes = ['desk', 'bedroom', 'living_room'];

export const POWERED_SUB_PAIRS = Object.freeze([
  {model: 'Edifier R1280DBs', url: EDIFIER_MANUAL, inputs: ['analog', 'optical', 'bluetooth'],
    note: 'Use stereo PCM for optical TV. The new package includes the remote, speaker link and analog and optical leads.'},
  {model: 'Kanto ORA', url: ORA_MANUAL, inputs: ['analog', 'usb', 'bluetooth'],
    note: 'The original ORA takes USB audio, stereo RCA or Bluetooth. Check the source lead and use the speakers’ volume control.'}
]);
const [edifier, ora] = POWERED_SUB_PAIRS;

export const USED_SUB_MODELS = Object.freeze({
  US: {model:'Polk PSW10', source:'https://www.polkaudio.com/on/demandware.static/-/Library-Sites-polk_northamerica_shared/default/dwfe4d7b91/downloads/psw-10-12-owners-manual-global.pdf',
    note:'The manual allows a receiver’s Sub Out to connect to either RCA line input. Check for hum, rattles and whether auto standby behaves at your listening level.'},
  GB: {model:'Wharfedale Diamond SW150', source:'https://www.wharfedale.co.uk/products/sw-150',
    note:'For a receiver’s mono Sub Out, the manual uses the left RCA line input. Check the mains label, crossover control and auto standby on the exact unit.'}
});

// Each row is an advertised amount for one of the units named in the column.
const markets = {
  CA: {
    currency: 'CAD',
    edifier: [229.99, 'https://ca.edifier.com/products/r1280dbs'],
    ora: [399.99, 'https://www.crutchfield.ca/p_310ORABK/Kanto-ORA-Matte-Black.html'],
    sub: [199.99, 'https://ca.edifier.com/products/t5'],
    amp: [499, 'https://unityaudio.ca/products/wiim-amp'],
    speaker: ['Polk Monitor XT15', 249, 'https://www.polkaudio.com/en-ca/product/home-speakers/satellite-surround/monitor-xt15/300147.html'],
    wire: [34.99, 'https://www.bestbuy.ca/en-ca/product/rocketfish-15-24m-50-ft-16awg-speaker-cable-only-at-best-buy/14472775'],
    lead: [4.25, 'https://www.cablesalescanada.com/product/6-rca-powered-subwoofer-cable-m-m-acoustic-research/'],
    usb: [26.99, 'https://www.bestbuy.ca/en-ca/product/startech-1m-3-3-ft-usb-c-to-usb-c-cable-rusb2cc1mb-black/14400321']
  },
  US: {
    currency: 'USD',
    edifier: [199.99, 'https://us.edifier.com/products/r1280dbs'],
    ora: [349.99, 'https://www.sweetwater.com/store/detail/ORAMB--kanto-audio-ora-powered-bookshelf-speakers-black'],
    sub: [199.99, 'https://us.edifier.com/products/t5'],
    amp: [329, 'https://www.musicdirect.com/integrated-amp/wiim-amp-streaming-integrated-amplifier/'],
    speaker: ['Polk Monitor XT15', 179, 'https://www.sweetwater.com/store/detail/MXT15Blk--polk-audio-monitor-xt15-5.25-inch-passive-bookshelf-loudspeaker-pair'],
    wire: [14.41, 'https://marvac.com/products/61-3016-25'],
    lead: [1.98, 'https://www.parts-express.com/Single-RCA-Audio-Video-Subwoofer-Double-Shielded-Cable-6-ft.-240-1000'],
    usb: [6.56, 'https://www.monoprice.com/product?p_id=38916']
  },
  GB: {
    currency: 'GBP',
    edifier: [139, 'https://www.richersounds.com/edifier-r1280dbs-black/'],
    ora: [249, 'https://www.richersounds.com/kanto-ora-black/'],
    sub: [129, 'https://www.richersounds.com/edifier-t5-black/'],
    amp: [359, 'https://www.richersounds.com/wiim-amp-space-grey/'],
    speaker: ['Q Acoustics 3010i', 169, 'https://www.qacoustics.co.uk/products/q-acoustics-3010i'],
    wire: [13.60, 'https://electromarket.co.uk/skytronic-high-quality-transparent-copper-speaker-cable-10m'],
    lead: [2.76, 'https://www.tvcables.co.uk/subwoofer-cable-phono-to-phono.html'],
    usb: [4.08, 'https://www.tvcables.co.uk/1m-usb-c-to-usb-c-cable-usb-3.2-gen-1-black.html']
  }
};
const price = (label, [amount, url]) => ({label, amount, url});
const priceSnapshots = components => Object.fromEntries(Object.entries(markets).map(([region, market]) => [
  region, {currency: market.currency, date: DATE, components: components(market)}
]));
const pairPrice = market => price(edifier.model + ' stereo pair', market.edifier);
const subPrice = market => price('Edifier T5 powered subwoofer', market.sub);
const leadPrice = market => price('Single RCA subwoofer lead', market.lead);
export const R1280DBS_PRICES = priceSnapshots(market => [pairPrice(market)]);

const subPart = {name: 'Edifier T5 powered subwoofer', count: 1,
  role: 'One line-level powered subwoofer. Its power lead and 3.5 mm-to-dual-RCA cable are supplied new.', url: T5_MANUAL};
const monoLead = {name: 'Single RCA subwoofer lead', count: 1,
  role: 'Connect the line-level Sub Out to a T5 RCA Signal In jack. Size the lead for your room.'};
const edifierRouting = {
  label: 'The main speakers play less bass when a sub is connected. Edifier gives no crossover frequency.',
  source: EDIFIER_MANUAL,
  setup: 'Run the included 3.5 mm-to-dual-RCA cable from the active speaker’s Sub Out to the T5 Signal In. Start with the sub level low and adjust its bass cutoff and level at your seat.'
};
const oraRouting = {
  label: 'The original ORA turns down bass below its automatic 100 Hz crossover when a sub is connected.',
  source: ORA_MANUAL,
  setup: 'Use a single RCA lead from ORA Sub Out to the T5 Signal In. Turn the T5 cutoff fully clockwise so the ORA’s 100 Hz crossover does most of the filtering. Start with the sub level low.'
};
const wiimRouting = {
  label: 'An adjustable crossover sends the lowest notes to the sub and reduces bass from the main speakers.',
  source: WIIM_CROSSOVER,
  setup: 'In WiiM Home enable the sub, leave Main Speakers Output Bass and Subwoofer Bypass Mode off, and set the crossover. With the WiiM controlling the cutoff, turn the T5 cutoff control fully clockwise.'
};
const wiimFullRange = {
  label: 'The WiiM can leave the main speakers playing full-range while sending low bass to the sub.',
  source: WIIM_CROSSOVER,
  setup: 'In WiiM Home enable the sub and Main Speakers Output Bass. Leave Subwoofer Bypass Mode off and set the sub crossover. Main-speaker bass output stays in the mix.'
};
const denonRouting = {
  label: 'The receiver can send low bass to the sub through its speaker crossover.',
  source: DENON_S650H_MANUAL,
  setup: 'On the North American AVR-S650H use Stereo, set Subwoofer to Yes and Front speakers to Small, then set the speaker crossover. Connect the receiver’s Subwoofer Pre Out to the T5 Signal In. Turn the T5 cutoff fully clockwise when the receiver sets the crossover.'
};

export const STEREO_SUB_EXAMPLES = Object.freeze([
  {
    id: 'stereo-sub-edifier', architecture: 'consumer_powered_pair', title: 'Edifier R1280DBs + T5',
    kind: 'Powered 2.1 for a desk or small room', places: homeScenes, power: 'mains',
    connections: edifier.inputs, goals: ['bass', 'all_rounder', 'low_volume'],
    parts: [
      {name: edifier.model + ' powered stereo pair', count: 1,
        role: 'Built-in amp, remote, speaker link and analog/optical source leads in the new package.', url: EDIFIER_MANUAL},
      subPart
    ],
    why: 'A straightforward way to add low bass to music or TV with two speakers and one sub. Start with an existing Bluetooth, line-level or optical source.',
    soundTarget: 'Edifier R1280DBs + T5',
    tradeoff: 'Best considered for short listening distances. Sub level and room placement can make bass sound too strong, especially close to a corner.',
    extra: ['For optical TV use stereo PCM. Verify the leads and remote are in the box. Use line-level Sub Out for the T5.'],
    bassSetup: edifierRouting,
    priceByRegion: priceSnapshots(market => [pairPrice(market), subPrice(market)])
  },
  {
    id: 'stereo-sub-ora', architecture: 'consumer_powered_pair', title: 'Kanto ORA + Edifier T5',
    kind: 'USB desktop 2.1 with a 100 Hz crossover', places: ['desk', 'bedroom'], power: 'mains',
    connections: ['usb'], goals: ['bass', 'all_rounder', 'imaging', 'low_volume'],
    parts: [
      {name: 'Kanto ORA powered stereo pair', count: 1, role: 'Original ORA with speaker link and power included.', url: ORA_MANUAL},
      subPart, monoLead,
      {name: 'USB-C data cable', count: 1, role: 'Source lead budgeted for a computer with USB-C. Choose a USB-A to USB-C data lead if your computer requires it.'}
    ],
    why: 'A small pair with a direct USB audio input and an automatic crossover for a computer desk.',
    soundTarget: 'powered-ora',
    tradeoff: 'Best at a short listening distance. The original ORA has no optical or HDMI input. Use the physical volume control.',
    extra: ['The speaker and subwoofer each require wall power. Check space for the sub and leave room to adjust its position.'],
    bassSetup: oraRouting,
    priceByRegion: priceSnapshots(market => [price('Kanto ORA stereo pair', market.ora), subPrice(market),
      leadPrice(market), price('USB-C data cable', market.usb)])
  },
  {
    id: 'stereo-sub-wiim', architecture: 'passive_separates', title: 'WiiM Amp + passive speakers + Edifier T5',
    kind: 'Passive 2.1 with adjustable bass routing', places: homeScenes, power: 'mains',
    connections: WIIM_INPUTS, goals: ['bass', 'all_rounder', 'natural'], requiresRegionalQuote: true,
    parts: [
      {name: 'WiiM Amp (original)', count: 1,
        role: 'Stereo amp and network streamer with line input, Bluetooth, optical and HDMI ARC. RCA, optical and HDMI source leads are supplied new.', url: WIIM_MANUAL},
      subPart,
      {name: 'Copper speaker wire', count: 1, role: 'Cut two lengths for the passive pair. Choose wire length for your room.'},
      monoLead
    ],
    regionalSpeakers: Object.fromEntries(Object.entries(markets).map(([region, {speaker}]) => [region, {
      name: speaker[0] + ' passive stereo pair', count: 1,
      role: 'One stereo pair. The original WiiM Amp lists support for 4 Ω speaker loads. Check the pair’s real load and your listening level.', url: speaker[2]
    }])),
    why: 'Useful when your TV needs HDMI ARC, or when you want an adjustable crossover and the option of changing passive speakers later.',
    tradeoff: 'More parts and setup. The amp needs WiiM Home for configuration. This example is for home listening at modest levels.',
    extra: ['Use stereo PCM with HDMI ARC or optical. A turntable needs a compatible phono stage unless it already has one. For direct computer USB audio choose a USB audio input.'],
    bassSetup: wiimRouting,
    priceByRegion: priceSnapshots(market => [price('WiiM Amp (original)', market.amp),
      price(market.speaker[0] + ' stereo pair', market.speaker.slice(1)), subPrice(market),
      price('Copper speaker wire', market.wire), leadPrice(market)])
  }
]);

export function poweredSubPairFor(name) {
  return POWERED_SUB_PAIRS.find(pair => name?.trim().toLowerCase() === pair.model.toLowerCase());
}

export function homeSubwooferRequest(request) {
  return request.power !== 'battery' && request.goal !== 'party' &&
    homeScenes.includes(request.useCase || 'living_room') &&
    ['open', 'consumer_powered_pair', 'passive_separates'].includes(request.architecture || 'open');
}

export function requestedSubExamples(request) {
  if (!homeSubwooferRequest(request) || request.subOwned !== 'no' || request.subCount !== 1 ||
      !['plan_sub', 'sub_hpf', 'sub_full', 'sub_unknown'].includes(request.subMode)) return [];
  return STEREO_SUB_EXAMPLES.filter(item => {
    if (request.connection && request.connection !== 'undecided' && !item.connections.includes(request.connection)) return false;
    // The Edifier manual confirms bass reduction without specifying a high-pass curve or a full-range mode.
    return item.id === 'stereo-sub-wiim' || (item.id === 'stereo-sub-ora' && request.connection === 'usb' && request.subMode !== 'sub_full') ||
      (item.id === 'stereo-sub-edifier' && ['plan_sub', 'sub_unknown'].includes(request.subMode));
  });
}

export function configureSubExample(item, request) {
  if (!item.bassSetup) return item;
  const speaker = item.regionalSpeakers?.[request.region];
  return {
    ...item,
    title: speaker ? 'WiiM Amp + ' + speaker.name.replace(' passive stereo pair', '') + ' + T5' : item.title,
    parts: speaker ? [item.parts[0], speaker, ...item.parts.slice(1)] : item.parts,
    bassSetup: request.subMode === 'sub_full' ? wiimFullRange : item.bassSetup
  };
}

export function ownedSubwooferPath(own, request) {
  if (!homeSubwooferRequest(request) || request.subMode === 'no_sub' ||
      !request.subMode || request.subCount !== 1) return null;
  const amp = own.amp?.name?.trim().toLowerCase();
  const arch = request.architecture || 'open';
  const poweredPair = poweredSubPairFor(own.speaker?.name);
  let route;
  if (poweredPair && (arch === 'open' || arch === 'consumer_powered_pair')) {
    if (request.connection && request.connection !== 'undecided' && !poweredPair.inputs.includes(request.connection)) return null;
    if (poweredPair === edifier && ['plan_sub', 'sub_unknown'].includes(request.subMode))
      route = {retained: edifier.model, bassSetup: edifierRouting, needsLead: false};
    if (poweredPair === ora && request.subMode !== 'sub_full')
      route = {retained: ora.model, bassSetup: oraRouting, needsLead: true};
  } else if (!poweredPair && (arch === 'open' || arch === 'passive_separates') && amp === 'wiim amp' &&
      (!request.connection || request.connection === 'undecided' || WIIM_INPUTS.includes(request.connection))) {
    route = {retained: 'WiiM Amp (original)',
      bassSetup: request.subMode === 'sub_full' ? wiimFullRange : wiimRouting, needsLead: true};
  } else if (!poweredPair && (arch === 'open' || arch === 'passive_separates') &&
      ['denon avr-s650h', DENON_S650H_NAME.toLowerCase()].includes(amp) &&
      (!request.connection || request.connection === 'undecided' || DENON_S650H_INPUTS.includes(request.connection)) &&
      ['CA', 'US'].includes(request.region) && request.subMode !== 'sub_full') {
    route = {retained: DENON_S650H_NAME, bassSetup: denonRouting, needsLead: true};
  }
  if (!route) return null;
  const market = markets[request.region];
  const buying = request.subOwned === 'no';
  const components = buying && market?.currency === request.currency ?
    [subPrice(market), ...(route.needsLead ? [leadPrice(market)] : [])] : [];
  const subtotal = components.length ? Math.round(components.reduce((sum, p) => sum + p.amount, 0) * 100) / 100 : null;
  const overBudget = subtotal !== null && Number.isFinite(request.budget) && subtotal > request.budget;
  return {...route, buying, components, subtotal, overBudget, date: DATE,
    wantsOwnedSub: request.subOwned === 'yes', needsMainSpeakers: !poweredPair && !own.speaker?.name};
}
