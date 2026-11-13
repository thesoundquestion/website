/**
 * Source-linked REGULAR ADVERTISED NEW-PAIR price reference, dated 2026-11-12.
 *
 * This is a small human-verified set, NOT a transaction-price average and not
 * evidence of inventory available to every visitor. No price conversion, no
 * live scraped prices, no inferred single-cabinet pair totals, no affiliate
 * weighting. Regular reference requires >= 2 independent sellers with prices
 * within 7% of the middle observed price. Offers marked "sale" are excluded.
 *
 * Intentionally independent of Canadian price/used-asking data.
 */
export const INTERNATIONAL_PAIR_PRICE_OBSERVATIONS=Object.freeze({
  US:Object.freeze({
    'Polk Monitor XT15':{
      notes:'Three U.S. ordinary advertised stereo-pair references at US$179. Short-lived US$149–159 offers at some stores are excluded from the baseline. Verify current stock, colour and tax.',
      regular:[
        {amount:179,merchant:'Polk Audio US',url:'https://www.polkaudio.com/en-us/product/home-speakers/satellite-surround/monitor-xt15/300147.html',unit:'pair'},
        {amount:179,merchant:'Crutchfield US',url:'https://www.crutchfield.com/p_107MXT15/Polk-Audio-Monitor-XT15.html',unit:'pair'},
        {amount:179,merchant:'Best Buy US',url:'https://www.bestbuy.com/product/polk-audio-monitor-xt15-bookshelf-speaker-pair-midnight-black/JX5P9S46P7',unit:'pair'}
      ],
      promotionExamples:[
        {amount:159,merchant:'Best Buy (individual sale)',url:'https://www.bestbuy.com/product/polk-audio-monitor-xt15-bookshelf-speaker-pair-midnight-black/JX5P9S46P7',unit:'pair',note:'not a verified broadly available programme'}
      ]
    },
    'Polk Monitor XT20':{
      notes:'Three U.S. normal advertised stereo-pair references at US$279. An isolated US$249 offer is a promotion, not the usual reference.',
      regular:[
        {amount:279,merchant:'Polk Audio US',url:'https://www.polkaudio.com/en-us/product/home-speakers/bookshelf/monitor-xt20/300151.html',unit:'pair'},
        {amount:279,merchant:'Crutchfield US',url:'https://www.crutchfield.com/p_107MXT20/Polk-Audio-Monitor-XT20.html',unit:'pair'},
        {amount:279,merchant:'Best Buy US',url:'https://www.bestbuy.com/product/polk-audio-monitor-xt20-bookshelf-speaker-pair-midnight-black/JX5P9S46S9',unit:'pair'}
      ],
      promotionExamples:[
        {amount:249,merchant:'P.C. Richard (sale listing)',url:'https://www.pcrichard.com/polk-monitor-xt20-high-resolution-compact-bookshelf-speakers-pair-black/M-XT20.html',unit:'pair',note:'price-reduced store offer; not the regular reference'}
      ]
    },
    'Polk Signature Elite ES15':{
      notes:'Polk US and Crutchfield US each list a new ES15 stereo pair at US$299 as a regular reference. Do not use Canadian pricing for US visitors.',
      regular:[
        {amount:299,merchant:'Polk Audio US',url:'https://www.polkaudio.com/en-us/product/home-speakers/bookshelf/signature-elite-es15/300363.html',unit:'pair'},
        {amount:299,merchant:'Crutchfield US',url:'https://www.crutchfield.com/p_107ES15WH/Polk-Audio-Signature-Elite-ES15-White.html',unit:'pair'}
      ]
    }
  }),
  GB:Object.freeze({
    'Q Acoustics 3010i':{
      notes:'The maker and New Forest Technology Services list the original compact 3010i pair at £169. Availability and finish can vary; do not infer universal stock or substitute the newer 3010c.',
      regular:[
        {amount:169,merchant:'Q Acoustics UK direct',url:'https://www.qacoustics.co.uk/products/q-acoustics-3010i',unit:'pair'},
        {amount:169,merchant:'New Forest Technology Services',url:'https://www.newforesttech.services/product-page/q-acoustics-3010i',unit:'pair'}
      ]
    },
    'Q Acoustics 3020i':{
      notes:'Q Acoustics direct and independent New Forest Tech Services both list the 3020i pair at £199; Peter Tyson separately advertises £199 as a special (its higher compare-at figure is not treated as market value). Exact original 3020i, not 3020c.',
      regular:[
        {amount:199,merchant:'Q Acoustics UK direct',url:'https://www.qacoustics.co.uk/products/q-acoustics-3020i',unit:'pair'},
        {amount:199,merchant:'New Forest Tech Services',url:'https://www.newforesttech.services/product-page/q-acoustics-3020i',unit:'pair'}
      ],
      promotionExamples:[
        {amount:199,merchant:'Peter Tyson (special listing)',url:'https://petertyson.co.uk/q-acoustics-q-3020i-bookshelf-speakers-english-walnut',unit:'pair',note:'retailer calls £199 a special; not counted as independent normal price'}
      ]
    },
    'Wharfedale Diamond 12.1':{
      notes:'The original 12.1 pair is ordinarily advertised around £249 at three separate British hi-fi retailers. A much lower 2025 Black Friday £179 offer is historical, not a current normal or date-verified sale. Do not conflate newer Diamond 12.1i.',
      regular:[
        {amount:249,merchant:'Audiovation',url:'https://www.audiovation.co.uk/speakers/p/wharfedale-diamond-121-bookshelf-speakers',unit:'pair'},
        {amount:249,merchant:'Quantum AV',url:'https://www.quantumav.co.uk/wharfedale-diamond-12-1-bookshelf-speakers-light-oak-pair',unit:'pair'},
        {amount:249.95,merchant:'Stone Audio',url:'https://www.stoneaudio.co.uk/products/wharfedale-diamond-12-1-standmount-loudspeaker',unit:'pair'}
      ],
      historicalPromotion:[
        {amount:179,date:'2025-11-25',url:'https://www.whathifi.com/speakers/hi-fi-speakers/hi-fi-deal-alert-the-superb-wharfedale-diamond-12-1-speakers-drop-in-price-in-the-black-friday-sales',note:'historical two-shop sale, NOT assumed active'}
      ]
    }
  })
});
const CURRENCY=Object.freeze({US:'USD',GB:'GBP'});
function hostname(url) {
  const match=/^https?:\/\/([^/?#]+)/i.exec(String(url||''));
  return match ? match[1].replace(/^www\./,'').toLowerCase() : '';
}
export function internationalPriceContextFor(model,region,currency){
  if(CURRENCY[region]!==currency)return null;
  const info=INTERNATIONAL_PAIR_PRICE_OBSERVATIONS[region]?.[model];
  if(!info)return null;
  return {
    notes:info.notes,
    regular:(info.regular||[]).map(x=>({...x,priceType:'ordinary_retail_asking'})),
    promotion:(info.promotionExamples||[]).map(x=>({...x,priceType:'unqualified_individual_offer'})),
    historicalPromotion:(info.historicalPromotion||[]).map(x=>({...x})),
    usedAsks:[],selfReportedPaid:[],usedExampleRange:null,
    region,currency,sourceDate:'2026-11-12'
  };
}
/** Typical published offer reference: median of near-equal *independent regular
 * advertisements*, not a statistically estimated price paid. */
export function corroboratedInternationalPairPriceFor(model,region,currency){
  const ctx=internationalPriceContextFor(model,region,currency);
  if(!ctx)return null;
  const observations=ctx.regular.filter(x=>x.unit==='pair'&&Number.isFinite(x.amount)&&x.amount>0&&hostname(x.url));
  if(new Set(observations.map(x=>hostname(x.url))).size<2)return null;
  const sorted=[...observations].sort((a,b)=>a.amount-b.amount);
  const reference=sorted[Math.floor((sorted.length-1)/2)];
  if((sorted.at(-1).amount-sorted[0].amount)/reference.amount > 0.07)return null;
  return {amount:reference.amount,url:reference.url,currency,region,sourceCount:observations.length,
    kind:'corroborated_ordinary_advertised_pair_not_transaction_median'};
}
