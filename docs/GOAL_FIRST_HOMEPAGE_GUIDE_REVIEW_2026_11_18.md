# TSQ-GOAL-01 — Home-first goal chooser editorial and release review
**Date:** 2026-11-18 · **Status:** DRAFT REVIEW, NOT MERGED OR DEPLOYED  
**PR:** https://github.com/thesoundquestion/website/pull/21  
**Draft branch:** draft/goal-first-home-entry-20261118  
**Original plan:** thesoundquestion/research/TSQ_GOAL_FIRST_EQUIPMENT_GUIDE_IMPLEMENTATION_PLAN_2026_11_18.md

## Owner's defining revision
After the original request for heavy homepage placement, the owner specified that the **whole homepage should be less busy, with much less text**: simply guide visitors to what they're trying to do, with About, Share, Donate and Contact available. Avoid long introduction blocks, full lessons on the homepage or a giant questionnaire.

**Approved design direction for review:**
1. Brief opening question: “What are you looking to do?”
2. Six recognizably different, prominent starting goals (hi-fi, vocal, songs/guitar, streaming, band recording and live performance).
3. A single link to the full chooser (11 goals).
4. A compact **text-link row** to Lessons, Labs, Tools and Library, **not** a competing second card grid.
5. Three concise lower-page affordances: About; Share/Donate; Contact.
6. Keep the existing no-account/free stance, optional Ko-fi, real sharing actions, educational contact and permission language and the six established header links.
7. Move the actual situation-dependent questions, detailed equipment flow and lesson recommendations to the dedicated tool.

## Changed files and behavior
- **Home:** \`index.html\` shortened, with new goal links of the form \`/tools/find-my-setup/?goal=<known-id>\`, one primary card grid, a compact quick-link strip and concise utility blocks; previous wave illustration, multi-paragraph mission pitch, large secondary discovery cards and expanded promotion were removed from the homepage. The content remains accessible through Journey, Lessons, Labs, Library and About. Site header, footer, legitimate contact and supported share actions preserved.
- **Global CSS:** \`assets/styles.css\` appended localized home components, with responsive 3/2/1 goal columns, compact links and sensible mobile utility layout, reduced-motion support, no external font or image dependencies.
- **New tool:** \`tools/find-my-setup/index.html\`, \`tools/find-my-setup/app.mjs\`, \`tools/find-my-setup/engine.mjs\`, \`assets/goal-guide.css\`.
- **Site navigation:** \`tools/index.html\` includes the goal chooser as a distinct tool, not a replacement for System Builder or the existing gear-model suggestion form. \`sitemap.xml\` includes canonical /tools/find-my-setup/.
- **Quality:** new \`tests/goal-first-guide.test.mjs\`; updated homepage layout/links tests and \`tests/public-build-output.test.mjs\` to require the tool runtime in actual Pages output. No existing Decoder curriculum/order, listening labs or technical System Builder calculations were changed.

## User journeys and recommendations
Visitor chooses **one goal** and answers 2 or 3 relevant, plain-English questions (no model numbers or jargon required). The tool shows:
- a minimal functional sound path, with why each element exists;
- possible upgrades / unnecessary gear;
- a non-commercial alternative and what needs compatibility verification;
- **specific existing published** lesson links with a one-sentence reason each;
- a supported listening-only System Builder handoff, with **no invented prefilled data or unsafe goal mapping**.

The 11 goals are: home hi-fi, TV/gaming sound, headphones, vocal/rap recording, singer-songwriter, drums, band recording, streaming/video, podcast, live performance, and general learning.

**Meaningful decision examples:**
- Rap over an existing beat + USB mic: a recorded beat doesn't become a physical microphone input; no redundant external interface required for the USB mic.
- Singer-songwriter: overdubbing one part at a time vs one blended simultaneous mic vs two separately editable simultaneous inputs are distinct.
- Acoustic drums vs electronic drums: electronic module may output stereo audio or MIDI; a one-mic real kit recording can be valid; independent multi-mic inputs only if wanted.
- Band: stereo rehearsal vs overdubbed tracks vs isolated live multitrack and actual simultaneous input count.
- Remote podcast/stream: account for delayed guest-return audio, monitoring and multi-person inputs, without prescribing a large console to everybody.
- Hi-fi: current setup and listening position are considered; imaging, bass or voice priorities send to different lessons; Builder is used only for **existing supported listening system work**.
- Live: audience PA vs separate performer monitoring, with cautious venue/power/feedback considerations.

## Canonical teaching links / avoiding redundancy
Equipment categories are mentioned briefly and *not* retaught. Deep explanations remain in existing published lessons: \`audiophile-glossary/#space\`, \`speaker-dispersion/#understand\`, \`speaker-types/#jobs\`, \`recording-sources/#paths\`, \`microphone-types/#inside\`, \`recording-resolution/#gain\`, \`mixing-soundstage/#multitrack\`, \`mastering-dynamic-range/#mix-and-master\`, \`headphone-types/\`, relevant digital formats lessons and listening labs. An automated route+anchor check validates all recommendation links. The unmerged audio-interfaces-and-mixers draft is **not** presented as a live lesson.

## Privacy / boundaries
- Deterministic client-side \`engine.mjs\`; no account, server submission, tracking, purchase requirement, paid API, persistent storage or free-text personal details in URLs.
- Home query parameters whitelist only a **goal identifier**, not the visitor's answers. Unknown identifiers are ignored.
- No invented prices, sound-quality scores, technical compatibility guarantees, product catalog matching, or unsupported PA calculations.
- A **multi-goal/hybrid mode**, model-level input-capability matching, and prefilled System Builder handoff require separate future research and tests. Do not imply they already exist.
- Without JavaScript, tool page offers direct links to appropriate lessons and Builder.

## Regression results
- The first draft suite correctly identified obsolete homepage ordering assumptions and one new copy-sensitive test; updated to enforce the owner's simplified layout.
- The next review reduced the secondary 4-card discovery block to a small text-link row; two old tests expecting the cards were updated to check the preserved real destinations.
- Final full GitHub Actions run: **447 of 447 tests passed**, no failures/skips, including static public-site output guard, source-link checks, existing lesson/ABX/player tests, course/assistant inventory, module syntax and route integrity.
- Run: https://github.com/thesoundquestion/website/actions/runs/44368143751
- Exact final branch head at time of this review: \`b0bce1017554953bc6f7acbb6749619c8779a853\`.

## Review and release gates that remain
- [x] Owner's simplified home layout incorporated in GitHub draft.
- [x] Existing course, builder and labs preserved; 11 deterministic goal pathways built.
- [x] All crosslinks and static asset references tested.
- [x] Automated 447-test regression and public build passed.
- [ ] Owner editorial review of goal labels, card prominence, brevity and output readability.
- [ ] **Actual phone browser** review of viewport spacing and interaction at 360–390px, including the lower utility area and repeated Back/Reset/edit actions. Automated tests are not a substitute for manual visual/mobile QA.
- [ ] Separate explicit approval to merge PR #21 to main.
- [ ] Separate Cloudflare release authorization and verification; previous project state had auto GitHub deployments disabled.

**Do not conflate GitHub draft source, \`main\`, and the live Cloudflare site.**
