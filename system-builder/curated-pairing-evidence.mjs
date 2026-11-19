/**
 * Exact-model, manufacturer-documented electrical matching for published
 * Listening Builder examples. This is NOT a clean-SPL, power-delivery,
 * thermal-reliability or subjective-sound guarantee.
 *
 * Only record a pair after both the amplifier's supported speaker-load range
 * and the actual speaker model's published load requirements are checked.
 * Do not infer speaker-load permission from an amplifier watt figure.
 */
const documented=Object.freeze({
  'passive-bt20a-xt15': Object.freeze({
    level:'manufacturer_supported',
    label:'Speaker load supported by both manufacturers',
    proof:'Fosi lists the BT20A Pro for 2–8 Ω speaker loads. Polk lists the Monitor XT15 as compatible with 4 Ω and 8 Ω amplifiers, with a 4.1 Ω minimum. This is a supported one-pair connection on the manufacturers’ published load specifications.',
    setup:'Use the BT20A Pro speaker terminals for one Polk XT15 stereo pair and its supplied 32 V / 5 A adapter. Connect a source through RCA or Bluetooth. This power supply limits available output; it does not turn a manufacturer-supported 4 Ω connection into an unsupported one.',
    output:'The headline 300 W/channel figure is not evidence of continuous clean output with the included 32 V / 5 A adapter. Actual headroom depends on listening distance, level, speaker sensitivity, the supply and load.',
    notes:[
      'Fosi BT20A Pro: terminating impedance 2–8 Ω; supported 32 V / 5 A and 48 V / 5 A power supply options.',
      'Polk Monitor XT15: manufacturer states compatibility with 4 Ω and 8 Ω amplifiers; 4.1 Ω minimum impedance.',
      'The exact load specification establishes basic stated compatibility, not a promise of undistorted output at any requested volume.'
    ],
    sources:[
      {label:'Fosi BT20A Pro: rated speaker loads and power-supply options',url:'https://fosiaudio.com/products/bt20a-pro-2-channel-bluetooth-power-amplifier'},
      {label:'Polk Monitor XT15: amplifier compatibility',url:'https://www.polkaudio.com/en-ca/product/home-speakers/satellite-surround/monitor-xt15/300147.html'},
      {label:'Polk Monitor XT series: minimum impedance in owner manual',url:'https://www.polkaudio.com/on/demandware.static/-/Library-Sites-polk_northamerica_shared/default/dw9cd07cce/downloads/monitor-xt-series-owners-manual-global.pdf'}
    ]
  }),
  'passive-as301-p5': Object.freeze({
    level:'manufacturer_supported',
    label:'Speaker load supported by published specifications',
    proof:'Yamaha supports a single stereo pair rated 6 Ω or higher in the A-S301 HIGH setting (and 4 Ω or higher in LOW). PSB rates the Alpha P5 at 8 Ω nominal, with a 4 Ω minimum. The pair fits Yamaha’s published single-pair speaker-load guidance.',
    setup:'Connect one PSB Alpha P5 pair to SPEAKERS A or B. For one pair with an 8 Ω nominal rating, Yamaha’s chart specifies the HIGH impedance-selector setting. If you ever change the selector, turn off and unplug the amplifier first; its manual warns not to move the switch while powered.',
    output:'Yamaha specifies 60 W + 60 W into 8 Ω from 20 Hz to 20 kHz at 0.019% THD. PSB recommends 10–90 W amplification. Neither figure alone predicts maximum clean sound level in a particular room.',
    notes:[
      'Yamaha A-S301: single speaker pair HIGH = nominal 6 Ω or higher; LOW = nominal 4 Ω or higher. The selector must never be moved while powered on.',
      'PSB Alpha P5: 8 Ω nominal, 4 Ω minimum, recommended amplifier 10–90 W.',
      'Yamaha publishes 60 W + 60 W continuous at 8 Ω, 20 Hz–20 kHz, 0.019% THD; output at a chosen seat still depends on the listening setup.'
    ],
    sources:[
      {label:'Yamaha A-S301: published power and load specifications',url:'https://usa.yamaha.com/audio/home-audio/products/hifi-components/a-s301/specs.html'},
      {label:'Yamaha A-S301 owner manual: impedance-selector chart',url:'https://europe.yamaha.com/files/download/other_assets/0/332210/web_VEX7920_A-S701_A-S501_A-S301_om_G_EnFrDeSvItEsNlRu_A0.pdf'},
      {label:'PSB Alpha P5: nominal/minimum impedance and recommended amplifier',url:'https://www.psbspeakers.com/products/alpha-p5-bookshelf'}
    ]
  })
});
export function curatedPairingFor(example){
  if(example?.architecture!=='passive_separates') return null;
  return documented[example.id] || null;
}
