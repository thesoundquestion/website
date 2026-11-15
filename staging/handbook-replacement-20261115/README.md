# The Sound Question: illustrated handbook replacement

**Status:** Pending final PDF binary transfer. Staging branch only. Do not deploy or merge until the PDF is present and builds pass.

## Correct source

The final currently identified publication file in the owner's ChatGPT Library is `Make_Audio_Make_Sense_Listening_Lab_Links.pdf`, created November 14, 2026. This replaces the currently deployed three-page quick guide.

- Length: **59 pages**, US Letter
- File size: **11,674,414 bytes**
- SHA-256 of the identified Library copy: `fb88f867cd4a584dbc042cb392237345e1071a207d5a0d634b184ba3e1097507`
- Navigation: **69 bookmarks** and **84 PDF links**
- Source: ChatGPT Library file ID `file_00000000c6c48212b569207c4fe54323` (not currently in GitHub)
- Target repository path: `library/make-audio-make-sense/make-audio-make-sense-illustrated.pdf`

## What is staged

- Retire the three-page **Download the current quick guide** card in the Library and replace its destination and copy with the 59-page illustrated handbook.
- Update the reference page download button to point to the new PDF.
- Exclude the old three-page PDF from the Cloudflare public output.
- Require the new PDF in `scripts/build-public-site.mjs` so an incomplete site **cannot deploy successfully**.

## Gate

1. Copy the exact approved Library PDF binary to the target repository path.
2. Verify byte size and SHA-256; do not replace with a sample, placeholder, or an older PDF revision.
3. Run `node --test` and `node scripts/build-public-site.mjs`.
4. Ensure `site-dist/library/make-audio-make-sense/make-audio-make-sense-illustrated.pdf` exists and the old `make-audio-make-sense.pdf` is not published.
5. Only then merge into `main` and schedule one Cloudflare Pages deployment.

The currently live production website is deliberately unchanged by this staging work.
