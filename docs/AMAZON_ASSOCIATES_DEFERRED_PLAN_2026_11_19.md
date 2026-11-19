# The Sound Question — Deferred Amazon Associates integration

**Prepared:** November 19, 2026  
**Owner decision:** Document and prepare the approach, **but do not register or activate affiliate links yet**.  
**Status:** Planning only; no Amazon account application, account/store ID, affiliate links, scripts, cookies, tracking, API integration, production-site edits, or Cloudflare deployment.  
**Project:** https://thesoundquestion.com/ · `thesoundquestion/website`

## Why this is deferred

The Sound Question has only recently launched its new .com site and expanded gear tools. Amazon.com Associates currently evaluates applications after **three qualifying sales**. Its account-dormancy help says an application may be withdrawn if fewer than three qualifying sales are referred **within 180 days of applying**. Starting that period before the website has genuine shopping-intent visitors adds avoidable pressure and little benefit.

The three-sale rule is **not clearly presented in the general Operating Policies page**. The authoritative source is Amazon's separate account-dormancy/application-review help, and it must be rechecked before enrollment.

- [Amazon.com Associates: Account Dormancy and application review](https://affiliate-program.amazon.com/help/node/topic/G7MJTPEP9NC3YKMG)
- [Amazon.com Associates: Application Review Process](https://affiliate-program.amazon.com/help/node/topic/G8TW5AE9XL2VX9VM)
- [Amazon.com Associates: Operating Agreement](https://affiliate-program.amazon.com/help/operating/agreement)
- [Amazon.com Associates: Program Policies](https://affiliate-program.amazon.com/help/operating/policies)

**No purchases through the owner's own links.** Do not purchase for yourself, for customers or for friends/family through your Special Links; do not request or encourage friends/relatives/associates to purchase through those links to reach the threshold; do not manufacture orders or clicks. Only genuine, independently motivated qualifying customer purchases count toward this plan. Amazon decides what qualifies.

- [Amazon.com Associates: Participation Requirements](https://affiliate-program.amazon.com/help/operating/participation/)
- [Amazon.com Associates: Why purchases through your own links do not qualify](https://affiliate-program.amazon.com/help/node/topic/G46FTB8KQF8NRUWG)
- [Amazon.com Associates: Friends and family orders](https://affiliate-program.amazon.com/help/node/topic/G63DR893K4DH55XZ)

## Decision gate: when to revisit registration

Do **not** schedule signup by calendar date or enroll automatically. Revisit after organic discovery and buyer-oriented pages show meaningful activity:

1. Search Console shows sustained organic impressions/clicks on relevant gear pages (Builder, Compare My Gear, System Check, headphones, speakers, amplifier/source lessons). No fixed traffic number is a guarantee of three qualifying sales.
2. The website has several useful, trustworthy purchase-decision pages with clearly identified supported products and honest evidence, including meaningful lower-cost alternatives.
3. Owner confirms they want to begin the **180-day application clock** and can supervise the first qualifying sales.
4. Recheck Amazon.com's current eligibility, active-sale rules, geographic eligibility for Canadian site owners, payment/tax onboarding, OneLink availability, permitted link types and API restrictions. Do not assume rules remain unchanged.
5. Confirm that the free-only operating model still holds. No paid affiliate plugin, link-cloaking service, geolocation service, price feed or new server-side runtime is required.

**No automation is authorized to start registration** when any metrics are reached. A separate owner decision is required.

## Recommended account and international strategy

The expected audience is international even though the site is based in Canada. The initial candidate is **Amazon.com Associates (US)**, subject to confirming Canada-based applicant eligibility and current terms; it is not necessary to join Amazon.ca first merely because the site operates from Canada.

Amazon's simplified **OneLink** documentation currently describes using a single US store ID to earn in **Canada, United Kingdom, Germany, France, Italy and Spain**, subject to completing the one-time country setup and actual program eligibility. Amazon's other marketplaces may require separate registrations and tracking IDs. Do not assume all markets, product matches, taxes, prices, or commissions work alike.

- [OneLink international FAQ, Canada + EU5](https://affiliate-program.amazon.com/help/node/topic/G4CL4623QZAVGV7A)
- [OneLink first-time setup guide](https://affiliate-program.amazon.com/help/node/topic/GURY9HX6KNJU6LQE)
- [OneLink international availability and costs](https://affiliate-program.amazon.com/help/node/topic/G8JHEWQ9GTDUN7EH)
- [International Associates programs](https://affiliate-program.amazon.com/help/node/topic/GCE3F2NCVZLDFM6A)

**Proposed first wave:** US (Amazon.com) and OneLink-enabled Canada/UK, then other supported countries only when useful audience demand justifies the compliance review.

For every example product, manually validate actual marketplace listings and variants. Check whether OneLink's **exact/close match** redirection is appropriate; avoid sending a reader to a misleading model or materially different item. Make the destination marketplace visible and allow users to choose a non-affiliate alternative when the local match is unsuitable.

**Do not** build custom location-based redirects, obscure origin URLs, assign individual tracking tags to visitors, scrape Amazon product pages, or collect visitor location. Use Amazon's supported linking tools rather than inventing an international link engine.

## Intended placements and product mapping

Use existing editorial/engineering work; do not create a separate product database competing with the canonical equipment catalogue.

| Existing part of site | Future affiliate placement | Guardrail |
| --- | --- | --- |
| Listening System Builder | Optional **View on Amazon** beside a technically appropriate selected recommendation | Do not let affiliate participation determine what equipment qualifies. |
| Creating System Builder | Optional verified link for entry-level interfaces, microphones, headphones and related hardware | Preserve real USB recording-channel, phantom-power and connection limits. |
| Compare My Gear | Optional shop links after a source-backed specification comparison | Non-Amazon, used-market, or no-retailer alternatives stay usable. |
| Selected buying guidance / lesson pages | Short **Where to look** / **Examples to consider** section only when genuinely useful | Do not turn every glossary lesson into an advertisement. |
| Future equipment buying hub | Small curated lists of affordable, good-value gear | Explanations and caveats first, shopping link second. |

Prioritize actual products already covered in the site's source catalogue. **The count of catalogued products is not an Amazon listing count.** A separate verification pass will identify which exact models/variants are sold by Amazon.com, Amazon.ca and Amazon.co.uk. Used and discontinued equipment may not have a suitable listing and must never receive an unrelated substitute just to create a commission opportunity.

**Future model fields (conceptual; NOT implemented now):** canonical site equipment ID, verified exact model/variant, Amazon ASIN or official link per supported marketplace, manually checked date, merchant choice, meaningful alternatives, link eligibility/approval status. Keep these optional and isolated from the source-backed engineering specs. Never invent ASINs, availability, discounts or prices.

## Pricing, product content and privacy

- **Prefer no live prices at all.** Pricing, stock and seller selection change constantly. For articles needing context, use general price positioning or a clearly dated, non-live estimate, not “current,” “cheapest,” or a promised deal.
- Use original site-authored product explanations and existing lawful site assets. Do not copy Amazon photographs, listing copy, customer star ratings or reviews. Amazon Product Advertising content has license, API and caching restrictions; verify those rules before any future use. A plain human-authored text link avoids the need for dynamic price/image feeds.
- No paid Amazon-link plugin, dynamic API, affiliate analytics beacon, cookies, third-party JS, geolocation tracking or Cloudflare Worker is needed for the initial design. Browser clicks on an outbound affiliate link will be handled by Amazon under its terms.
- Do not use custom redirectors or link cloaking; preserve the originating page's referrer transparency and normal accessibility.
- Affiliate links must not silently appear in downloadable PDFs, emails or unrelated places. Review platform/channel policy separately before any expansion beyond the website.
- Review and update Privacy, Content Use, editorial disclosures and any required consumer-law disclosures **before the first affiliate link is published**.

Sources:
- [Operating Agreement, including required Associate statement](https://affiliate-program.amazon.com/help/operating/agreement)
- [Amazon linking requirements](https://affiliate-program.amazon.com/help/operating/linking/)
- [Amazon disclosure guidance](https://affiliate-program.amazon.com/help/node/topic/GPXFHVYZMTGPUMPE)
- [Participation requirements and restrictions](https://affiliate-program.amazon.com/help/operating/participation/)

## Editorial independence and disclosures

**Affiliate revenue must never control the recommendation.** The Sound Question exists to explain whether a difference matters, not to present every more expensive product as an upgrade.

Keep all recommendations evidence-first:

- Explain engineering and use-case trade-offs: measured response, headroom, noise, output/impedance compatibility, features, construction and serviceability.
- Name meaningful affordable alternatives, explain the actual reason for recommending pricier equipment, and preserve used-market/other-retailer paths.
- State when manufacturer claims or published specs are missing, uncertain, or not comparable.
- No paid placement disguised as a technical recommendation; any review sample, loan or sponsorship needs its own clear disclosure.
- Clearly distinguish a product the editorial team has physically tested from one selected using documented measurements/specifications only.

At activation, include Amazon's required sitewide identification statement (or current accepted equivalent), currently:

> As an Amazon Associate I earn from qualifying purchases.

Each affiliate placement must also have a **nearby clear disclosure**, e.g. “Affiliate link: we may earn a commission if you purchase, at no extra cost to you.” Amazon's help emphasizes that a sitewide notice alone is not a substitute for adequate nearby disclosure. Do not publish that statement claiming current Associates status before actual enrollment.

## Deferred implementation stages (only after renewed approval)

### Stage A — Read-only viability review

- Review Search Console traffic and actual demand by country/page, not invented conversion estimates.
- Audit existing product recommendations against real Amazon listings in US/CA/UK.
- Verify the current application threshold, operating terms, OneLink behavior, tax/payment eligibility, and local legal disclosure needs.
- Present a short owner decision memo: register now, hold, or skip Amazon.

### Stage B — Enrollment (owner-controlled)

- Owner registers or authorizes account setup and handles identity, tax, banking and program approvals.
- Record application date, store ID(s), marketplaces activated and actual account status **privately**, never hard-code secrets or sensitive financial information into the public repo.
- If OneLink is eligible, complete its account-side country setup and choose safe product matching preferences.
- Track the 180-day requirement using actual Amazon Associates reporting, distinguishing sales from clicks, items shipped and qualifying commissions.

### Stage C — GitHub-only pilot (no Cloudflare deployment)

- Build a small optional affiliate-link mapping layer for **3–5 verified products**, using original text and no fetched Amazon image/price content.
- Put disclosures adjacent to links and update sitewide Associate identification and Privacy.
- Check links, accessibility, keyboard behavior, locale choice, exact product variants and non-affiliate alternatives with tests.
- Keep the pilot on a GitHub branch/draft PR. Use local/GitHub Actions checks rather than Cloudflare preview builds.

### Stage D — Owner-approved production activation

- Reconfirm live account status and policy compliance before publication.
- Present exact changes and test results. Obtain separate owner approval to merge to `main` and a **specific one-off Cloudflare production deployment**.
- Perform a manual smoke check for US, Canada and UK links; confirm disclosures, destination products, safe fallback and no broken layouts.
- Observe performance through Amazon reports and Search Console, without adding paid tracking.

### Stage E — Expand only if justified

- Add new products and marketplaces only after editorial review, actual listing verification and evidence of usefulness.
- Keep stale/discontinued links out of the UI. Provide a manual link audit at release time, not a daily babysitting workflow.
- Stop using the program if it conflicts with the site's independence, policy constraints or free-only operation.

## Definition of done (future activation)

- [ ] Owner explicitly chooses to start Associates enrollment and its 180-day clock.
- [ ] Current Amazon policy and Canadian resident onboarding requirements verified.
- [ ] International country choices and OneLink account preferences verified.
- [ ] At least three to five exact products and non-affiliate alternatives checked manually.
- [ ] Amazon account/store IDs are valid and active; no financial credentials in GitHub.
- [ ] Required disclosure by each affiliate link plus sitewide Associate statement and Privacy update.
- [ ] No Amazon prices, ratings, stock claims, or product images borrowed without explicit licensed method.
- [ ] Builder/Checker engineering calculations unaffected; recommendations remain merchant-neutral.
- [ ] All GitHub/local tests pass; mobile and keyboard checks completed.
- [ ] Separate explicit owner authorization obtained for production merge and **one** Cloudflare deployment.
- [ ] Post-launch click destinations manually verified; actual qualifying sales monitored only after enrollment.

## Current action log

- **2026-11-19:** User decided **not to apply yet**; requested documentation and a future setup plan. Official US Associates and OneLink help pages reviewed. This document is preparation only.
- **Next event:** Owner requests activation after the site has meaningful legitimate shopping-intent traffic. There is no scheduled signup date, no affiliate link integration, and no automatic deployment.

**This document is not a legal or tax opinion. Current Amazon agreements and relevant Canadian disclosure/tax requirements govern when the project eventually activates.**
