# Equipment Pricing Position: Budget, Mid-priced and Premium Pricing

**Status:** first researched pilot only. This is *not* an estimate of sound quality, construction quality, or a buying recommendation.

## Design decision

For product listings and future side-by-side comparisons, show a **regional price-position label**, not a retail price. The editor retains the observed prices and links in `equipment/source-master.json` under `pricingResearch`, but the generated public `equipment/price-tiers.generated.json` contains **no numeric retail amounts**.

| Public display | Meaning |
| --- | --- |
| Budget pricing | In the lower third of researched *new-retail prices* for similar products in the selected region |
| Mid-priced | Middle third of that category's regional new-retail sample |
| Premium pricing | Upper third of *price positioning*, not an assertion that the gear is better |
| No pricing label | Insufficient, obsolete or non-comparable current evidence; never presume budget |

In code, the internal slugs are `budget`, `mid_grade` and
`premium_pricing`. The user-facing label for `mid_grade` is **Mid-priced**
to avoid implying a technical or quality grade.

A **comparable product cohort** must match *equipment function and the
unit sold*: wired headphones versus wired headphones; a single powered
studio monitor versus single powered studio monitors; a microphone versus
other relevant microphones. Never combine speakers per pair with speakers
per cabinet, interface recording channel count with mixer channels, PA
peak SPL with studio continuous SPL, or mixed power-amp/AVR subtypes.
Until a legacy model has a verified subtype/unit, its category has no
automatic price group.

## Evidence and calculation policy

1. Record exact model/revision, geographic region, currency, retailer URL,
   observation date, regular new-item asking price and **sold unit**. No
   currency-converted foreign market prices.
2. Exclude coupons, flash sales, open-box, used, refurbished, marketplace
   bundles and shipping/tax add-ons. Never treat a temporary discount as
   ordinary retail or a listing as proof something is in stock.
3. Deduplicate merchant repeats. At least **two distinct merchants**
   must establish one product's asking-price average. Cross-retailer
   discrepancies above a 2.5× ratio require manual review.
4. At least **five qualifying exact models** and three distinct merchants
   within the region and functional category before any labels are created.
   This is a minimum, not a claim that five are a statistically representative
   market survey. The starting labels have `limited_sample` confidence.
5. Compute the arithmetic average of each model's qualifying listed
   regular retail amounts, then split the **logarithms of model-average
   prices** at the 33rd and 67th percentiles. Log prices avoid treating
   a $1,000 difference as equally significant in $100 and $10,000 markets.
   Each model has **one vote** in the regional cohort regardless of how
   many stores list it.
6. All estimates and classification evidence expire after **45 days**.
   Old surveys return **no current label** rather than displaying stale
   assumptions. This also means a model can move between bands as its
   exact regional peers change. No product changes quality when that
   happens.
7. The public API includes region, category, label, review date, evidence
   count and expiration, **not observed prices, actual availability, numeric
   price cutoffs or performance scores**.

## First Canadian trial: wired headphones

As of 2026-11-18, these five exact models each have two distinct Canadian
retailer references and produce a **limited-sample** demonstration. They
should not be described as a complete survey of the Canadian headphone market.

| Model | Indicative CA relative band | Retailer evidence (internal prices suppressed in UI) |
| --- | --- | --- |
| Sony MDR-7506 | Budget pricing | [Studio Economik](https://www.economik.com/products/mdr-7506), [AVShop](https://www.avshop.ca/sound-amp-pa-audio/headphones/over-ear-headphones/sony-mdr-7506-studio-headphones) |
| Grado SR80x | Budget pricing | [Studio Economik](https://www.economik.com/products/sr80x), [Gramophone](https://www.gramophone.ca/category/grado) |
| Audio-Technica ATH-M50x | Mid-priced | [Studio Economik](https://www.economik.com/products/ath-m50x), [AVShop](https://www.avshop.ca/sound-amp-pa-audio/headphones/over-ear-headphones/audio-technica-ath-m50x-closed-back-studio-headphones-black) |
| AKG K371 | Premium pricing (relative to this small sample) | [Studio Economik](https://www.economik.com/collections/akg/products/k-371), [AZ Electronics](https://azelectronics.ca/products/akg-k371-over-ear-closed-back-foldable-studio-headphones) |
| Sennheiser HD 600 | Premium pricing (relative to this small sample) | [Studio Economik](https://www.economik.com/collections/high-fidelity/products/hd-600), [Sennheiser Canada](https://ca.sennheiser-hearing.com/collections/wired-headphones-1/products/hd-600) |

The Grado **SR80x** is not the older **SR80e**. Used or discontinued
equipment without a current new-retail sample gets **no new-retail
classification**. Likewise, unresearched regions currently have no label,
not an assumed Canadian label or an exchange-rate extrapolation.

The classification will disappear after **2027-01-02** unless refreshed.
Current stock status was not independently checked. Some retailer pages
mark models unavailable; they serve as ordinary *list price references*,
not evidence of immediate purchasing access.

## Rollout

- `equipment/price-tiers.mjs` holds the testable regional validation and
  category-relative classification logic.
- `equipment/price-tier-client.mjs` supports lazy loading, readable tier
  labels, expiry checks and a stable budget → mid-priced → premium-pricing
  sort, with unknown items kept visible afterward.
- `equipment/price-tiers.generated.json` is the **public no-numeric-price**
  snapshot. Original sale/budget calculations in System Builder remain
  unchanged; they still depend on dated numerical price inputs for actual
  affordability calculations. In a later UI pass, distinguish those
  estimates from an item's descriptive retail price band.
- `tests/equipment-price-tiers.test.mjs` checks exclusion of stale,
  promotional and mismatched quotes, evidence thresholds, region isolation,
  classification, sorting and hidden numeric figures.
- Extend coverage market-by-market, category-by-category; do **not**
  force a label on all 173 models merely to fill the filter menus.

**Important editorial sentence for the website:**
"Pricing tiers describe where equipment sits among comparable products
in your region. They do not measure sound quality or indicate a bargain."
