import {DENON_S650H_INPUTS, DENON_S650H_MANUAL, DENON_S650H_NAME} from './stereo-subwoofer-examples.mjs';

/**
 * Evergreen second-hand AMPLIFIER search targets, not used sale listings.
 * Prices are intentionally null; a quoted live ask is never a typical sale.
 * Guidance depends on regional electrical variant, driver load and service.
 */
export const USED_AMPLIFIER_WATCHLIST=Object.freeze([
  {model:'Yamaha RX-497',type:'Stereo receiver',audience:'A practical tuner + multiple line inputs in an older two-channel system.',
   evidence:'North American/Canadian original owner manual describes an impedance selector and A/B speaker wiring.',
   source:'https://ca.yamaha.com/files/download/other_assets/6/326686/RX-497_C.pdf',
   checks:'Check the exact rear label, impedance-selector setting WITH POWER OFF, A/B usage, noisy selector, relay contacts and both channels. In one-set mode, the left selector position permits published 4 Ω nominal; it is not a guarantee for all reactive speakers.'},
  {model:'Yamaha RX-596',type:'Stereo receiver',audience:'Traditional hi-fi receiver to watch for when useful analogue inputs and power matter.',
   evidence:'Yamaha manual gives 80 W/channel at 8 Ω and 0.025% THD over 20 Hz–20 kHz for the specified revision.',
   source:'https://data.yamaha.com/files/download/other_assets/6/314126/RX-596.pdf',
   checks:'Check actual regional version and load/impedance switch before connecting demanding speakers; verify speaker relays, tuner, remote and balance with both channels driven.'},
  {model:'Yamaha A-S301',type:'Integrated amplifier',audience:'More recent used analogue-plus-optical option worth comparing against new compact amps.',
   evidence:'Yamaha Canada documents 60 W/channel at 8 Ω across 20 Hz–20 kHz with 0.019% THD.',
   source:'https://ca.yamaha.com/en/audio/home-audio/products/hifi-components/a-s301/specs.html',
   checks:'Verify phono, optical/coaxial inputs, source selector, speaker terminals, heat and exact region. A used price needs checking; do not assume it is always cheaper than a new mini-amp.'},
  {model:'NAD C 316BEE V2',type:'Integrated amplifier',audience:'Simpler music-focused analogue unit with an MM phono stage.',
   evidence:'NAD publishes 40 W/channel continuous and <0.03% THD over 20 Hz–20 kHz under its specified 8/4 Ω conditions.',
   source:'https://nadelectronics.com/products/c-316bee-v2-stereo-integrated-amplifier',
   checks:'Distinguish V2 from original C316BEE. No built-in optical, USB or Bluetooth. Verify phono stage, channels, thermal condition, input knobs and local mains version.'},
  {model:'Denon PMA-600NE',type:'Integrated amplifier',audience:'A used mainstream stereo amp with digital optical inputs, phono and Bluetooth.',
   evidence:'Denon North American manual: 45 W/channel at 8 Ω, 20 Hz–20 kHz, THD 0.07%; speaker terminals 4–16 Ω nominal.',
   source:'https://manuals.denon.com/pma600ne/na/en/OBAOSYxljoeltq.php',
   checks:'Test optical, Bluetooth, phono, both channels, mute and protection. Confirm original region and clean level; published wattage alone is not a speaker match.'},
  {model:DENON_S650H_NAME,type:'AV receiver',markets:['CA','US'],inputs:DENON_S650H_INPUTS,
   audience:'Useful for a TV and passive stereo pair when you also want an adjustable subwoofer crossover.',
   evidence:'The 120 V version supports 4–16 Ω speakers with the correct setting. Front speakers set to Small can hand low bass to the sub.',
   source:DENON_S650H_MANUAL,
   checks:'Confirm the remote, front speaker outputs, subwoofer pre-out and the input you will use. Check HDMI with your TV if needed.'},
  {model:'Onkyo A-9010',type:'Integrated amplifier',audience:'Entry integrated model, if found in the right regional configuration.',
   evidence:'North American Onkyo owner manual specifies 44 W/channel at 8 Ω, 1 kHz, 0.08% THD; 4 Ω uses different test conditions.',
   source:'https://assets.onkyo-av.com/product-manuals/A-9010_En_29402015_150114_web_2022-11-02-203828_sdfw.pdf',
   checks:'North American and European digital input/voltage variants can differ. Verify exact model, mains label and desired input. Test selector, headphones, protection and speaker loading.'},
  {model:'Cambridge Audio Topaz AM10',type:'Integrated amplifier',audience:'Older compact, simple analogue integrated amp to notice when inexpensive and working.',
   evidence:'Official Cambridge manual lists 35 W into 8 Ω and different THD ceilings at 1 kHz and full-band tests.',
   source:'https://www.cambridgeaudio.com/sites/default/files/compliance/doc/Topaz%20AM10%20User%20Manual%20English.pdf',
   checks:'Check mains voltage for Canada (many second-hand units are 230 V), remote, pots, phono and headphone outputs. No assumption of optical/Bluetooth input.'},
  {model:'Yamaha R-S202',type:'Stereo receiver',audience:'Common basic receiver to consider only with an appropriate speaker load.',
   evidence:'Yamaha Canada specifies 8 Ω or higher nominal for one pair. It is not an all-speaker 4 Ω bargain.',
   source:'https://ca.yamaha.com/en/audio/home-audio/products/hifi-components/r-s202/specs.html',
   checks:'Do not pair by nominal 8 Ω marketing label alone when speaker impedance dips strongly. Check full load, A/B speaker use, Bluetooth/inputs, remote and both channels.'}
].map(x=>Object.freeze({...x,usedTypicalPrice:null,listingUrl:null})));
export function usedWatchlistFor({wantedInput='undecided',powered='mains',region}={}){
 if(powered==='battery')return [];
 return USED_AMPLIFIER_WATCHLIST.filter(x=>!x.markets||x.markets.includes(region)).map(x=>({...x,
  inputCaution:(wantedInput==='hdmi'||wantedInput==='usb')&&!x.inputs?.includes(wantedInput)?
   'Check whether this input is available. A separately budgeted converter may be needed.':null
 }));
}
