# The Sound Question | Navigation and Link Redundancy Audit
**Review:** 2026-11-18 release-candidate PR #32  
**Scope:** All 54 sitemap-listed HTML routes, read from `release-candidate/full-site-preview-20261118`. Other unindexed/local preview tools are excluded from the 54-route survey.  
**Status:** Sitewide navigation consolidation implemented in the **draft candidate only**. Automated regression and real-browser review are release gates. Do not merge to `main`, deploy, or remove contextual educational links before approval.

## What prompted this audit
The site grew from a small glossary and a few speaker/amp tools into 27 numbered lessons, recording and headphone equipment guidance, two dedicated Builders, listening labs, glossaries, a listening room, and the handbook. One-size-fits-all navigation now competes with page-specific next steps.

On many inner lessons, the same literal HTML target `/decoder/` appears five or six times: header desktop, collapsible mobile header, footer, course navigation, and related-reading areas. Desktop and mobile links are not simultaneously visible, so **do not** treat the raw count as five visible choices. Other frequent repeated global targets include `/library/`, `/about/`, and `/connect/`. A few pages are already using a slim footer, while many others retain the old multi-link footer.

Examples inspected:
- `decoder/sound-basics/`: 46 anchor links; course previous/next navigation plus top "Next", global header, footer and contextual navigation.
- `decoder/audio-interfaces-mixers/`: 70 anchor links; course navigation, top "Next" and several topic links. Preserve technical explanations and their anchor targets.
- `decoder/audiophile-glossary/`: 144 links, often repeated in individual definitions. Do not blindly deduplicate these. They connect claims to specific explanations.
- `decoder/technical-glossary/`: 89 links, with repeated technical cross-references that should remain relevant to each term.
- `journey/`: 93 links, several going to the same underlying lesson from distinct steps. Repetition can be useful here if the link explains a separate stage of the journey.
- `library/curators-listening-room/`: 102 links including a dedicated Listening Room navigation. Keep in-page movement.
- `labs/`, `tools/`, `library/`, `system-builder/` and `system-check/`: duplicate destinations between cards, header/footer and bottom panels. Prefer page-specific cards over generic crosslinks.

## KEEP
1. Inner-page six-destination site header: Lessons, Listening Labs, Tools, Library, About, Contact. Desktop visible / mobile collapsible are intentional responsive alternatives.
2. A single purposeful previous/next lesson progression at the **end of each numbered lesson**, with a route back to all lessons. Preserve sequential learning and keyboard navigation.
3. Related-reading links inline with the paragraph or glossary definition they clarify. A link is not redundant just because another independent term points to the same lesson.
4. Each page's actual content navigator when it shortens a long page: the Listening Room, Journey, glossary and long reference sections.
5. Next-action links that are specific to the current task: System Check after learning speaker sensitivity; creating/recording guidance after reading about interfaces; directly relevant listening lab after a mastering lesson.
6. Legal/policy links to Privacy and Content Use & Attribution, plus working contact information on the dedicated Contact page.
7. Read and Download actions **inside the one handbook card** in the Library. Do not create another separate homepage handbook/duplicate card.

## REPLACE (implemented in the draft candidate unless specifically marked deferred)
1. **Many-page footer navigation**: replace the repeated Journey/Decoder/Library/About/Connect cluster with a consistent compact footer containing legal/policy links, and optionally one contextual help link. Retain normal full header on all inner pages; do not remove all ways to navigate away.
2. **Lesson top-next versus lesson bottom-next**: keep bottom course progression as the prominent CTA. If a top shortcut remains, label it as a subtle "Skip to next lesson", not a second large button. Decide this globally by lesson template rather than patching chapters independently.
3. **Page-endnav on numbered lessons**: it should add a genuinely different action, e.g. "Try System Check" or "Hear the mastering comparison", not repeat the identical lesson-next target or "All lessons" within adjacent navigation. Prefer to integrate the contextual CTA with the course footer rather than stacking two panels.
4. **Short hub pages** (Tools, Library, Labs): one clear set of cards plus a contextual footer, not cards, a second list of the same destinations, and a generic "Open..." bottom CTA.
5. **Generic link labels**: replace "Learn more", "Next", "All tools" where ambiguous with specific descriptions, e.g. "Compare my equipment", "Build a recording setup", "Listen to a compressed master". Do not invent or change target URLs.
6. **Navigation ownership (maintenance follow-up)**: the six global destinations and a consistent policy footer are enforced by regression tests. Consolidating the existing static HTML copies into a generator or shared template is deferred; it is not needed to visually evaluate the cleaned navigation.

## REMOVE
1. Duplicate links in **the homepage's top menu**, since the homepage already has three large Jump Straight In cards, six Choose Your Path choices and eight smaller destination cards.
2. The homepage's bottom full link menu and redundant "Find your audio path" bottom panel; the goal guide is already in the card section.
3. The homepage's tiny social-network share text links; keep native Share and Copy site link buttons with no third-party scripts.
4. Homepage fine-print links for handbook PDF, email address and equipment inquiry: the Library and Contact cards lead to dedicated pages, where those actions remain discoverable.
5. Extra in-page "All lessons" / "All tools" buttons **only where** the same action is already present immediately alongside. Do not delete instructional backlinks spread throughout the actual text.
6. "Back to top" on short pages only when there is no navigation/accessibility benefit. Retain on long glossaries, the Listening Room, Journey and large lessons.

## IMPLEMENTED NOW: homepage and sitewide
- Removed duplicate top header navigation. Main logo and slogan stay in the hero.
- Kept exactly three large entry cards: Lessons, Listening Labs, Tools.
- Kept six smaller Choose Your Path cards and eight compact secondary destination cards.
- Removed the extra bottom end-of-page navigation panel.
- Removed micro-links repeating the handbook, contact/outreach and social-sharing destinations.
- Kept Share / Copy working controls and the two unobtrusive legal links in the footer.
- Updated the other 53 sitemap-listed pages, plus the 404 page and both unpublished tool previews, using a compact two-link policy footer.
- Kept full six-destination main headers on inner pages, including an accessible mobile menu; standardized the 404 navigation.
- All 27 lessons now use **one bottom course progression**, without a duplicate top-next or a second end-of-page CTA panel. Genuine related next steps are preserved next to that progression.
- Lessons, Labs, Tools and Library hubs rely on their main discovery cards instead of repeating those cards in another bottom nav.
- Other pages keep one useful local contextual CTA, a Back to top link, and an optional meaningful Previous link, without extra generic Home / All lessons / All tools.
- The standalone mastering and MP3 formats labs retain their own visual presentation but now include policy-only footers.
- Added `tests/sitewide-navigation-consolidation.test.mjs` to lock these rules for sitemap routes, lesson progression and preview pages.
- Preserved glossary and body-text crossreferences rather than deleting repeated targets mechanically.

## Release checklist (still mandatory)
- [x] Review every route in the 54-page public sitemap.
- [x] Implement one sitewide navigation hierarchy: accessible inner-page headers, one course route for lessons, one contextual action elsewhere, card-only hubs, compact policy footers.
- [x] Include 404, non-indexed preview tools and custom-styled Listening Labs in the consistency pass.
- [x] Add source-controlled regression checks for route presence, footer policies and course progression.
- [ ] Complete the latest automated regression and browser smoke workflows with no failures.
- [ ] Verify desktop and mobile layout, scrolling, focus and keyboard navigation in the user's **unpublished** Windows preview.
- [ ] Obtain explicit release approval after the user is satisfied with the full navigation experience.

### Release gate
**Hard release blocker:** Do not merge PR #32 or deploy until the entire sitewide navigation cleanup and visual regression checklist are complete and the user explicitly approves a release. This audit does not authorize changes to recording/audio engineering.
