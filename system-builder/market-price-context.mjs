/**
 * Small first-party source-linked PRICE CONTEXT PILOT.
 *
 * A regular retail reference is not a statistical regional average.
 * A seller's asking price, even when a classified is marked SOLD, is not
 * verified consideration paid. These examples are NOT automatically eligible
 * for firm-budget promises. Only exact pair units in Canadian dollars.
 *
 * No web calls, scraping, or third-party bulk price collection.
 * Source observations manually checked 2026-11-12.
 */
export const CANADIAN_PAIR_PRICE_OBSERVATIONS=Object.freeze({
  'Polk Monitor XT15':{
    label:'New regular listed pair CA$249',
    notes:'Manufacturer, Visions and Crutchfield each list the exact two-speaker XT15 pair for CA$249. It is a regular retail asking reference, not a guaranteed in-stock transaction price or cross-country price median.',
    regular:[
      {amount:249,merchant:'Polk Audio Canada',url:'https://www.polkaudio.com/en-ca/product/home-speakers/satellite-surround/monitor-xt15/300147.html',unit:'pair'},
      {amount:249,merchant:'Visions Electronics',url:'https://www.visions.ca/polk-audio-monitor-xt15-compact-high-resolution-bookshelf-loudspeakers-pair',unit:'pair'},
      {amount:249,merchant:'Crutchfield Canada',url:'https://www.crutchfield.ca/p_107MXT15/Polk-Audio-Monitor-XT15.html',unit:'pair'}
    ]
  },
  'Polk Monitor XT20':{
    label:'New regular listed pair CA$349',
    notes:'Three Canadian regular advertised pair references are CA$349; manufacturer also shows a CA$279 promotional price. Backorders and colour/stock differences matter. Do not treat a temporary sale as the normal attainable reference.',
    regular:[
      {amount:349,merchant:'Crutchfield Canada',url:'https://www.crutchfield.ca/p_107MXT20/Polk-Audio-Monitor-XT20.html',unit:'pair'},
      {amount:349,merchant:'Gibbys Electronics',url:'https://gibbyselectronicsupermarket.ca/collections/bookshelf-speakers/products/polk-audio-monitor-xt20-high-resolution-bookshelf-loudspeakers',unit:'pair'},
      {amount:349,merchant:'Visions (regular price)',url:'https://www.visions.ca/polk-audio-monitor-xt20-compact-high-resolution-bookshelf-loudspeakers-pair',unit:'pair'}
    ],
    promotion:[
      {amount:279,merchant:'Polk Audio Canada (advertised sale)',url:'https://www.polkaudio.com/en-ca/product/home-speakers/bookshelf/monitor-xt20/300151.html',unit:'pair'}
    ]
  },
  'Paradigm Monitor SE Atom':{
    label:'New regular listed pair ~CA$360',
    notes:'Three Canadian retailer listings for the exact stereo pair cluster around CA$360; promotional listings can be lower. These are advertised prices, not transactions or a general market average.',
    regular:[
      {amount:359.99,merchant:'The Sound Room',url:'https://www.soundroom.ca/products/monitor-se-atom',unit:'pair'},
      {amount:359.99,merchant:'audio51',url:'https://www.audio51.ca/product-page/paradigm-monitor-se-atom',unit:'pair'},
      {amount:359.98,merchant:'Unify AV',url:'https://unifyav.ca/products/paradigm-monitor-se-atom-1000b-bookshelf-speakers-pair',unit:'pair'}
    ],
    promotion:[
      {amount:269.99,merchant:'Gibbys (listed promotion)',url:'https://gibbyselectronicsupermarket.ca/collections/deals/products/paradigm-monitor-se-atom-bookshelf-speakers-pair',unit:'pair'},
      {amount:269.99,merchant:'Sonxplus (listed promotion)',url:'https://en.sonxplus.com/collections/haut-parleurs-vendredi-fou-black-friday-2026/products/paradigm-monitor-se-atom-haut-parleurs-d-etagere-noir-mat-paire',unit:'pair'}
    ]
  },
  'Paradigm Titan v3':{
    label:'Used asking examples CA$125–195',
    notes:'Three Canadian vintage stereo-pair listings from 2025–2026 were around CA$125–195. One was marked sold but the actual agreed price is unknown. These are examples, NOT a proven average or a guaranteed available deal. Condition and refoaming/service costs matter.',
    usedAsks:[
      {amount:125,market:'Canuck Audio Mart',date:'2026-06-16',status:'sold_marked_asking_only',url:'https://www.canuckaudiomart.com/details/650332704-paradigm-titan-v3-speakers-new-foam/',condition:'stated refoamed'},
      {amount:149.95,market:'Canuck Audio Mart',date:'2025-05-31',status:'expired_dealer_asking_only',url:'https://www.canuckaudiomart.com/details/650219859-paradigm-titan-v3-bookshelf-speakers-black-excellent-trade-in-90-day-acx-wrnty-75-off/',condition:'dealer trade-in, warranty claim'},
      {amount:195,market:'US Audio Mart (Canadian seller)',date:'2026-01-04',status:'sold_marked_asking_only',url:'https://www.usaudiomart.com/details/650281890-paradigm-titan-v3-bookshelf-speakers-made-in-canada-restored/',condition:'seller described as restored; final paid amount unknown'}
    ],
    excludedOlder:[
      {amount:120,date:'2022-08-04',reason:'historical outside recent quote window',url:'https://www.canuckaudiomart.com/details/649885041-paradigm-titan-v3-bookshelf-speakers/'}
    ]
  },
  'Polk Signature Elite ES20':{
    notes:'A 2026 dealer classified was marked sold with a CA$350 asking price. This does not establish the actual transaction price or the representative used market.',
    usedAsks:[
      {amount:350,market:'Canuck Audio Mart',date:'2026-05-27',status:'sold_marked_asking_only',url:'https://www.canuckaudiomart.com/details/650326951-polk-audio-signature-elite-es20-stands-not-included-open-box/',condition:'dealer open-box listing'}
    ]
  },
  'Wharfedale Diamond 12.2':{
    notes:'One Canadian owner reported paying CA$450 via a local used deal for the original Diamond 12.2 in January 2025. A self-reported purchase is not a verified transaction distribution, and 12.2i is a different model.',
    selfReportedPaid:[
      {amount:450,market:'owner self-report',date:'2025-01-06',status:'not_independently_verified_paid',url:'https://www.reddit.com/r/BudgetAudiophile/comments/1hupobk',condition:'roughly month-old pair at time of deal'}
    ]
  }
});
export function priceContextFor(model, region='CA',currency='CAD') {
  if(region!=='CA'||currency!=='CAD')return null;
  const info=CANADIAN_PAIR_PRICE_OBSERVATIONS[model];
  if(!info)return null;
  const used=Array.isArray(info.usedAsks)?info.usedAsks:[];
  const regular=Array.isArray(info.regular)?info.regular:[];
  const promotion=Array.isArray(info.promotion)?info.promotion:[];
  let usedExampleRange=null;
  if(used.length>=2 && used.every(x=>x.amount>0 && /^(2025|2026)-/.test(x.date)))
    usedExampleRange={min:Math.min(...used.map(x=>x.amount)),max:Math.max(...used.map(x=>x.amount)),
      label:info.label,notTransactionPrices:true,notRegionalMedian:true};
  return {notes:info.notes || '',usedExampleRange,
    regular:regular.map(x=>({...x,priceType:'regular_retail_asking'})),
    promotion:promotion.map(x=>({...x,priceType:'promotion_not_normal_market'})),
    usedAsks:used.map(x=>({...x})),
    selfReportedPaid:Array.isArray(info.selfReportedPaid)?info.selfReportedPaid.map(x=>({...x})):[],
    sourceDate:'2026-11-12'};
}
