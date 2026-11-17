# The Sound Question — coordinated site release checklist

**Baseline:** November 17, 2026 pre-release audit. **Branch:** `draft/abx-shared-framework-20261116`. Production `main` and Cloudflare Pages are unchanged until deliberate approval.

### A. Visitor-facing release blockers
- [x] ABX scored-repeat state resets after a completed session, and new session requires a fresh optional statistics opt-in.
- [x] A user-initiated Prepare recordings request works even on Data Saver; only speculative preloading is suppressed.
- [x] ABX explicitly labels Challenge/Advanced as local beta practice, and its public sharing controls are hidden until verified scoring is deliberately released.
- [ ] Release and verify the scored Worker with D1, rate limits, retention cron, secure secret and `ABX_PUBLIC_ENABLED=true` only at coordinated launch.
- [ ] Release and verify community submissions, approved-only display, review/deletion and CORS before enabling the community flag.
- [x] Draft beta **Challenge (10) and Advanced (20)** now work as local-only practice games; no server calls, scores uploaded or community opt-in. Browser smoke verifies start/restart and both lengths with two cached recordings. The private scored Worker remains unreleased; its separate protocol/Node tests are retained. Real Worker/D1 deployment, secret management, consent and server recovery validation remain release gates.
- [ ] Final manual permissions/credits/privacy spot-check before deployment. Content Use has direct contact email and research credit tests already pass; keep this as a real publishing review.
- [~] Free-tier quotas, per-session estimates and cache limits are documented in `docs/abx-labs/FREE_TIER_CAPACITY_2026-11.md`. Read-only Cloudflare API snapshot captured real D1 usage (9 queries, 19 rows read, 11 rows written over one 24-hour window; 49,152 B stored); the audio Worker is deployed but the scored ABX Worker is not. **Audio Worker request totals, live ABX account testing and physical-device checks are still open.**
- [ ] Run final production smoke test after deliberate merge/manual Pages deployment.

### B. Improvements for this update
- [x] Replace Mastering's three page-load FLAC downloads with original source-measured static stereo SVGs (960 min/max/RMS bins; matching shared amplitude scale), and retain hashes in provenance.
- [x] Retire the hidden duplicate Mastering ABX controls and listeners, leaving the dedicated ABX Lab link.
- [x] Audit PR #11: synchronized Web Audio playback is the only tested implementation that avoids source-reload gaps; eager three-file decoding is too expensive as the default.
- [~] **Optional prepared/instant mode staged in Formats**, adapted from PR #11: native Play remains default; explicit preparation downloads only three versions of the chosen song with 14 MiB compressed/48 MiB decoded PCM caps, one group readiness and native fallback. Desktop and mobile-emulated Chrome tests passed against real audio. Physical Android/iOS, memory, Worker and listening-gap measurements remain open; no cross-browser gapless guarantee.
- [~] Real Chrome desktop/mobile-emulated playback passed for prepared A/B/A switching, no new requests after preparation, stable playhead and return to native. Chrome also fetched and decoded real hosted FLAC/MP3 sources. Physical Android/iOS listening for clicks/stutter, memory and account Worker/KV usage remain open. Native mode still restarts its media source.
- [~] **ABX Training and local beta Challenge/Advanced** now reuse just two cached recordings per comparison and attempt same-clock switching, with native fallback where needed. The beta 10/20-round games reveal only personal results at completion, without sending score requests. Real Chrome browser tests pass; physical phone listening still open. Genuine independently checked scoring awaits its separate Worker release.
- [~] **Mixing and Mastering source-change resumption improved in draft:** resume within the selection tap so Android/mobile browsers do not lose gesture authorization after delayed metadata loading. Mixing now assigns no FLAC URL on page entry or pre-Play variant changes, conserving Workers/KV requests. New real-audio browser smoke checks cover resumed source switching and zero idle Mixing requests. Physical-device and listening-gap checks remain open; these native players still reload each recording.
- [x] Add ABX, community, share, waveform and readiness files to required Pages build and validate waveform SVG checksums.
- [x] Source-level internal link and anchor integrity covers 1000+ hrefs; normalize Mastering logo, main navigation and mobile menu to the site's shared labels. Final visual review remains separate.
- [x] Direct Content Use rights questions to the project email while preserving the contact page and permission terms.
- [x] Add regression for Mastering static waveforms, source provenance, old ABX absence and zero initial waveform decoding.

### C. Editorial and continuity
- [x] Pre-release audit checked 47 sitemap routes and the existing 24-lesson sequence.
- [x] Current build checks approved MP3 hashes and the illustrated handbook; retired quick-guide PDF is omitted.
- [x] Add plain-language introductory summaries to the longest frequency response, mixing and mastering lessons; preserve advanced sections for interested readers.
- [~] **Beginner-first language audit scanned all 47 sitemap routes** and revised actual body/first-use explanations across 37 routes (25 lesson topics plus index/glossary/library, lab and system tools). Ten conversational or policy routes were reviewed without new edits. Definitions were moved beside examples without changing measurements, graphs, algorithms or credits. Key generated result wording was also simplified in System Check, Compare My Gear and System Builder (THD vs THD+N, speaker loads, headroom, sensitivity, powered/passive systems and subs), with the original unverified-versus-measured safeguards retained. Editorial consistency tests added in `tests/editorial-simplification.test.mjs`; audit ledger: `docs/BEGINNER_FIRST_LANGUAGE_AUDIT_2026-11-17.md`. **Still outstanding:** comprehensive sentence-by-sentence proofread, remaining dynamic feedback, physical-device/screen-reader QA and final source/rights review. The 59-page PDF handbook itself was not rewritten.
- [x] Remove unnecessary hosting-provider mentions from the visitor-facing ABX and Mastering lab copy. Scan of all 47 sitemap pages found these two lesson instances; keep accurate provider disclosure in the separate privacy policy.
- [x] Explain 51 curated selections versus 53 tracks: a three-song suite appears as one curated entry; fix outdated Library index count of 38 selections to match current 51/53.
- [~] Owner opened the prior draft on an actual Android phone using a local Termux HTTP server and reported that it generally worked, but observed slower X switching in ABX. The ABX Training same-clock fix and native A/B/X alias pause fix now pass real Chrome and mobile-emulated browser tests. Owner must `git pull` and listen again on the physical Samsung, especially rapid A/B/X switches, initial Play and fallback.

### C2. November 17 owner review, approved items staged in draft
- [x] Lesson 13 now starts with real situations (multi-driver earbuds on an older receiver; same headphones on a low-impedance jack; combinations with no practical problem) and links to a published measured example without reproducing proprietary graphs.
- [x] Lesson 14 removes redundant output-to-input dropdown matching and its JavaScript, replacing it with a short explanation of line, digital/DAC and turntable/phono connections. Other lesson interactions stay intact.
- [x] Lesson 18 draws the 256 stored levels as close-spaced lines and adds a labelled magnified inset; all three options show the same measurement principle.
- [x] Lesson 19 adds a direct ABX Training link beside the MP3/lossless Listening Lab and corrects outdated claims that no audio examples exist.
- [x] Contact page reorganized into separate general inquiries and equipment-maker cards with consistent spacing, plus restrained optional donation copy. Visible text no longer names the payment provider, but the privacy policy retains accurate external-service identification. Homepage support prompt now appears just after the hero; fuller share/support section follows the learning-path cards.
- [x] ABX Challenge/Advanced beta is functional offline from the scoring Worker, with local-only results and no public statistics UI.
- [ ] **Lesson 9 Class A/AB visual is deliberately NOT edited**. Owner rejected jargon-first proposal; awaiting sign-off on new speaker-motion and heat/effort analogy, with no unexplained output-device or waveform terms.
- [ ] Conduct real-device visual review (Contact mobile spacing, 256-level inset legibility, homepage support prominence) and listening review for all ABX fallback modes.
- [ ] Actual user acceptance and production deployment authorization.

### D. Admin follow-up, **not a release blocker**
- [ ] Authorize Gmail native filters if desired; scheduled inbox triage already runs.
- [ ] Authorize optional daily moderation reminder email when convenient. The community can be moderated directly in D1 without email alerts.
- [ ] Review pending posts and permissions periodically through the existing administrative workflow.

### E. Outreach and optional reader support (Ko-fi connected; support links still staged)
- [x] Split `/connect/` contact copy into general/recording submissions and a specific equipment-loan/business inquiry mailto; include expectations for temporary loans, shipping, returns, editorial independence and disclosure. Homepage links directly to `/connect/#business-inquiries`.
- [x] Owner confirms Ko-fi page `https://ko-fi.com/thesoundquestion` is set up with **both PayPal and Stripe linked**. External support links are staged in Connect and the homepage. This confirms account connections by owner report, not a successful third-party checkout test or independent public-page availability test.
- [ ] Check Ko-fi Standard versus Contributor fee status, current payment/FX processing terms, and perform an optional low-value real payment test before publishing the support links.
- [x] On site, use **Support the project** without implying registered-charity status or tax-deductible receipts. Keep lessons, labs and tools free, using external links only and no payment widgets, tracking scripts or new backend/Worker calls.
- [ ] If real tips or supplied review hardware are accepted, review Canadian tax/bookkeeping obligations and privacy wording. CRA notes creator gifts, tips and donations can be taxable income; Canadian Competition Bureau expects disclosure of material brand/product relationships when recommending products.
- [x] Add restrained external support links on Connect and the homepage's existing outreach section; no Ko-fi scripts, forms or back-end Worker calls. Privacy page states contributions are handled outside the site. No requests for donations within lessons.

### F. Related draft reconciliation, no blind branch merges
- [x] PR #11 **closed without merging** after all six changed paths were reviewed and reconciled into PR #15: synced Web Audio, optional Formats preparation, bounded memory, native fallback, documentation and passing real-hosted-audio regression tests. No duplicate draft should be merged. Physical Safari/Android listening remains an independent gate.
- [x] PR #10 closed as superseded after confirming merged PR #13/#14, main PDF size/hash build gate, current illustrated link and legacy 301 redirect. No re-merge.
- [~] PR #1 is **not simply a duplicate**: main has System Builder, but this draft contains additional ownership-first shortlists, pricing safeguards and owner-evidence work. Keep it unmerged and separate for review; do not close it merely because main contains the tool.

**Editorial release check:** A first-use/full-body targeted copy pass was committed across 37 of 47 inspected routes. The remaining exhaustive sentence review, interactive response language, visual/accessibility QA and human rights/privacy acceptance are NOT marked complete. The generated 59-page handbook PDF is a separate artifact and was not rewritten in this website HTML pass.

**No automatic Cloudflare Pages deployments. No paid upgrades as a shortcut.**

## First-use playback instructions (November 17)

- [x] **Mixing Lab:** short instructions directly before the player explain **Play**, a possible brief pause, and why visitors might compare a rough mix against a finished mix. **Replace this recording** beside each version accepts arbitrary WAV/FLAC filenames; **Replace examples (optional)** batch-imports files with matching version names. Local files stay on-device and do not guarantee seamless switching.
- [x] **Mastering Lab:** first-use instructions explain online playback, original album release vs remaster comparisons and the optional local-file section. Visitors can now choose **Use my WAV for A/B/C** for ordinary WAV filenames without relying on the specially named demo batch importer. Personal WAV buttons map only to the current comparison; EQ hides C. Original demo measurements/waveforms and volume-match claims are clearly separated from personal files. Local switching may still pause; personal files are not uploaded.
- [x] **ABX Lab:** moved playback guidance above the interactive game: choose Training, press **Prepare recordings**, wait until ready, then tap A/B/X. Same-clock, pause-free switching is limited to supported devices; scored modes use **Start scored session** when available.
- [x] Removed repetitive ABX preparation text from below the game, keeping the explanation where visitors need it.
- [ ] Verify instructions are readable on real mobile devices and by screen readers during final pre-release acceptance.

## Editorial validation (November 17)

- A 47-route first-use/body editorial audit and 37-route targeted rewrite are documented in `docs/BEGINNER_FIRST_LANGUAGE_AUDIT_2026-11-17.md`; no technical measurements, sample files, publishing gates or equations were intentionally changed.
- Important interactive copy was also updated in System Check, Compare My Gear and System Builder. Regression tests retain exact checks for speaker-load warnings, unverified distortion, party and subwoofer constraints.
- **Latest code CI passed:** [site regression](https://github.com/thesoundquestion/website/actions/runs/44158992072) and [real-audio browser playback](https://github.com/thesoundquestion/website/actions/runs/44158991943), both at commit `c0ec77dd07d019c5a9a01862c13fbdbba889e6d5`, including the final dither wording correction. The only commits afterwards are to editorial/checklist metadata.
- Editorial QA remains **partially open**, especially exhaustive sentences, accessibility, visual layout, generated strings not sampled, and human permissions/credits/privacy acceptance. This is **not** authority to release.

## Current test evidence

- Site regression and expanded real-audio Chrome desktop/mobile-emulated playback workflows **passed** on November 17 at commit `2accb75685bb4a6fd22b78520b479613f46cb418`: [site regression](https://github.com/thesoundquestion/website/actions/runs/44153613230), [browser playback](https://github.com/thesoundquestion/website/actions/runs/44153612739). These include the 14/48 MiB synchronized buffer caps, ABX Training A/B/X, Mixing idle audio request prevention and actual Mixing/Mastering continuation after switching. Later changes to the free-tier handoff are documentation-only; continue validation after further runtime edits.
- Scored ABX mock browser regression: 10 rounds, one deliberately failed X request recovered through `/v1/resume`, no new Worker requests from repeated A/B/X, another attempt starts with consent OFF. This is **not** the live scoring backend.
- Formats browser regression: zero media requests before Play, including switching tracks and song; on-demand audio playback still succeeds.
- Detailed Mastering waveform SVGs load without downloading FLAC data, with verified source-file hashes.
- The old PR #11 is **closed without merging**; its synchronized Web Audio paths are integrated in this draft. **Optional Formats and ABX Training synchronized playback passed Chrome desktop/mobile-emulated tests**. Mixing, Mastering and scored ABX still use native source changes. Real device listening and Worker budget measurement remain release checks.

