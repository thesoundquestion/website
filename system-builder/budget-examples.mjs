/**
 * Exact-model budget starts for shoppers who enter no owned hardware.
 * All prices are dated Canadian MAKER/DEALER asking references, not verified
 * transaction medians, current inventory, or complete installed-system costs.
 * None of these powered systems can be connected to passive-amp outputs.
 */
const EDIFIER='https://ca.edifier.com/';
const pair=(id,model,amount,connections,places,goals,why,tradeoff,notes=[],powerNote='')=>({
  id,architecture:'consumer_powered_pair',
  title:'Budget powered stereo: '+model,
  kind:'One powered stereo pair, compatible source required',
  places,power:'mains',connections,goals,
  parts:[{name:model+' powered stereo pair',count:1,
    role:'One package with built-in amplification and paired left/right speakers; do not connect to amplifier speaker outputs',
    url:EDIFIER+'products/'+id.slice('powered-'.length)}],
  why,tradeoff,
  extra:[...notes,'No separate power amplifier is required. Use line/headphone/USB/digital input as specified, NEVER the speaker-level output of another amplifier.',
    'Power and frequency range are manufacturer specifications, not a verified clean seat SPL or subwoofer crossover.' ],
  priceCA:{components:[{label:model+' stereo pair · manufacturer asking reference',amount,
    url:EDIFIER+'products/'+id.slice('powered-'.length)}]},
  priceEvidence:'manufacturer_single_asking_not_market_average',powerNote
});
export const BUDGET_EXAMPLES=Object.freeze([
  pair('powered-r1280t','Edifier R1280T',169.99,['analog'],
    ['desk','bedroom','living_room'],['all_rounder','low_volume','natural'],
    'The lowest-priced simple stereo package in this group: two RCA line inputs, remote and onboard volume/tone controls. No standalone amplifier needed.',
    'RCA analogue only. No Bluetooth, optical, USB or guaranteed subwoofer output. Manufacturer 42 W RMS total is not a clean-room SPL promise.',
    ['Published maker total is 2 × 21 W RMS. Use RCA or a suitable 3.5 mm-to-RCA line/headphone source; verify output level.']),
  pair('powered-r1280db','Edifier R1280DB',199.99,['analog','optical','bluetooth'],
    ['desk','bedroom','living_room'],['all_rounder','low_volume','natural'],
    'Adds Bluetooth, optical and coaxial digital inputs over the analogue-only R1280T for a modest increment.',
    'The DB is not the later DBs. Do not assume this exact DB has the DBs subwoofer output or automatic bass management.',
    ['Maker states 42 W RMS total; frequency range alone does not establish full response at volume.']),
  pair('powered-r1280dbs','Edifier R1280DBs',229.99,['analog','optical','bluetooth'],
    ['desk','bedroom','living_room'],['all_rounder','bass','low_volume'],
    'Adds a dedicated subwoofer output to the R1280DB input set, useful if bass extension may be added later.',
    'SUB OUT does not establish a high-pass filter on the main speakers. A separate sub, cables and setup are additional costs; one pair is not a party system.',
    ['The manufacturer lists dual RCA, optical, coaxial and Bluetooth inputs with subwoofer out; verify crossover behaviour for the actual revision.']),
  pair('powered-r1700bts','Edifier R1700BTs',269.99,['analog','bluetooth'],
    ['desk','bedroom','living_room'],['all_rounder','bass','dynamic'],
    'A physically larger powered pair with RCA, Bluetooth and a subwoofer output; useful when desk space allows a bigger cabinet.',
    'No optical or USB input on this exact model. The manufacturer 66 W total is not directly comparable with real acoustic headroom or lower-frequency extension.',
    ['Manufacturer specifies two 4-inch bass/mid units and 66 W total among internal drivers; SUB OUT does not prove filtered main speakers.']),
  pair('powered-mr3','Edifier MR3',169.99,['analog','bluetooth'],
    ['desk','bedroom'],['natural','imaging','all_rounder','low_volume'],
    'Budget desktop/nearfield alternative with RCA, balanced TRS, 3.5 mm and Bluetooth 5.4 rather than one fixed RCA-only path.',
    'Manufacturer calls it studio style, but this does not prove measured neutrality. Its 3.5-inch drivers cannot promise deep bass or high clean room output.',
    ['Published 18 W × 2 RMS and 92.5 dB maximum are factory figures, not interchangeable with other brands’ maximum SPL tests.']),
  pair('powered-m60','Edifier M60',249.99,['analog','bluetooth','usb'],
    ['desk','bedroom'],['all_rounder','imaging','low_volume','natural'],
    'Small desktop speakers with USB-C audio, Bluetooth and 3.5 mm analogue input; useful when a computer source needs digital USB audio directly.',
    'Three-inch woofers limit expectations for strong deep bass. No optical/HDMI input, no verified main high-pass and no independently validated sound preference score.',
    ['Maker rates 66 W RMS as a sum of multiple amplifier bands; avoid comparing that number directly with conventional amplifier channel watts.']),
  {
    id:'passive-bt20a-xt15',architecture:'passive_separates',
    title:'Affordable passive starter: Fosi BT20A Pro + Polk Monitor XT15',
    kind:'Two-piece conditional passive stereo example',places:['desk','bedroom','living_room'],
    power:'mains',connections:['analog','bluetooth'],goals:['all_rounder','natural','low_volume','imaging'],
    parts:[
      {name:'Fosi Audio BT20A Pro (32 V / 5 A supply)',count:1,
        role:'Compact stereo amplification, RCA/BT, tone and volume control; included PSU must be verified',
        url:'https://fosiaudio.com/pages/2-1-channel-amplifier-bt20a-pro'},
      {name:'Polk Monitor XT15 passive speaker pair',count:1,role:'One new passive stereo pair, not two individual prices',
        url:'https://www.polkaudio.com/en-ca/product/home-speakers/satellite-surround/monitor-xt15/300147.html'}
    ],
    why:'A compact amp and passive stereo pair for listeners who value future speaker replacement. CA$189.99 for the Fosi and CA$249 for the speakers are separately corroborated ordinary listed references.',
    tradeoff:'This is an initial pairing, NOT a certified safe reactive load or clean SPL. Polk reports a 4.1 Ω minimum. Fosi markets 2–8 Ω support but does not give a test-condition-matched continuous power figure with the normal 32 V/5 A supply. Do not infer 300 W per channel from the advertised maximum.',
    extra:['Connect only a suitable RCA line/headphone source or Bluetooth. No optical, USB DAC or TV HDMI without another component.',
      'Check amp/speaker output level at the seat, Fosi 32 V/5 A supply, heat, actual speaker impedance and phase, cable, stands, delivery/taxes.',
      'Fosi manufacturer THD percentage is not identified here at rated continuous both-channel power across the full band.'],
    priceCA:{components:[
      {label:'Fosi BT20A Pro · ordinary CA dealer asking',amount:189.99,
        url:'https://soulfi-audio.ca/product/fosi-audio-bt20a-pro-bluetooth-amplifier/'},
      {label:'Polk XT15 stereo pair · ordinary CA reference',amount:249,
        url:'https://www.polkaudio.com/en-ca/product/home-speakers/satellite-surround/monitor-xt15/300147.html'}
    ]},
    priceEvidence:'multi_retailer_ordinary_advertised_components_not_installed_cost',
    loadCaution:'Check the Polk XT15’s 4.1 Ω minimum against the actual Fosi BT20A Pro power-supply configuration; no published 300 W claim proves this pairing safe or clean.'
  },
  {
    id:'headphone-ksc75',architecture:'headphone_first',
    title:'Very low-cost personal listening: Koss KSC75',
    kind:'Wired open-earclip headphones with suitable output',
    places:['desk','bedroom','living_room'],power:'source_dependent',
    connections:['analog'],goals:['imaging','natural','all_rounder','low_volume'],
    parts:[{name:'Koss KSC75 wired earclip headphones',count:1,role:'One 3.5 mm pair, not a source or amplifier',url:'https://koss.com/en-ca/products/ksc75'}],
    why:'A very inexpensive open-air wired option for listeners who can tolerate leakage and an earclip fit. No separate headphone amplifier should be bought without checking the actual source output.',
    tradeoff:'Earclip comfort and seal vary. Almost no noise isolation, and deep bass output depends on fit; not suitable for noisy environments.',
    extra:['Koss lists 60 Ω and 101 dB SPL/mW; sensitivity per milliwatt is not the same as dB per volt. Verify a 3.5 mm output and comfortable volume.'],
    priceCA:{components:[{label:'Koss KSC75 · Canadian manufacturer asking',amount:36,url:'https://koss.com/en-ca/products/ksc75'}]},
    priceEvidence:'manufacturer_single_asking_not_market_average'
  },
  {
    id:'headphone-portapro',architecture:'headphone_first',
    title:'Portable open-air music listening: Koss Porta Pro',
    kind:'Wired open-air headphones with suitable output',places:['desk','bedroom','living_room'],power:'source_dependent',
    connections:['analog'],goals:['all_rounder','natural','low_volume','bass'],
    parts:[{name:'Koss Porta Pro original wired on-ear headphones',count:1,role:'Original 3.5 mm wired variant only',
      url:'https://koss.com/en-ca/products/porta-pro'}],
    why:'A compact collapsible model with documented 60 Ω/101 dB per mW sensitivity; a lower-cost comparison to larger open-back designs.',
    tradeoff:'Open cushions leak sound, bass varies with fit, and this is not the Bluetooth, microphone or Utility variant. Headband and foam pads deserve a comfort check.',
    extra:['A source with a suitable 3.5 mm headphone output is required, not merely a DAC RCA line output.'],
    priceCA:{components:[{label:'Koss Porta Pro · Canadian manufacturer asking',amount:71,url:'https://koss.com/en-ca/products/porta-pro'}]},
    priceEvidence:'manufacturer_single_asking_not_market_average'
  }
]);
