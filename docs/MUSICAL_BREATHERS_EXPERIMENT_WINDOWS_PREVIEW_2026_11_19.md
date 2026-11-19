# The Sound Question — Musical Breathers Editorial Experiment

**Status:** **ABANDONED editorial experiment**, not a release candidate. Never merged or deployed.  
**Branch:** `draft/musical-breathers-experiment-20261119`  
**Base:** `draft/consolidated-prelaunch-20261119`

## Outcome: owner rejected this editorial direction

**Decision (2026-11-19): Abandoned. Do not merge, deploy, reuse these musical passages, or treat this as a release candidate.**

Review found that stitching multiple musical references into written instructional passages feels forced and interrupts natural teaching. Keep the website's references occasional and effortless; reserve most more overt puns and jokes for personally delivered video/live content. This branch is retained only as historical experimental work. The consolidated website draft never received these five experimental page edits.

## What changed
Five pages have a short musical passage woven into the existing explanation or introductory goal question:
- `decoder/bass-extension/index.html`: *Friends in Low Places* / *Rolling in the Deep* after the everyday bass-roll-off explanation.
- `decoder/amplifier-distortion/index.html`: perceived congestion listening scenario using several familiar references; deliberately **not** a diagnosis.
- `decoder/recording-resolution/index.html`: the dynamic rise in *I Will Always Love You* and recording gain limits.
- `decoder/speaker-types/index.html`: home listening versus audience reinforcement.
- `tools/find-my-setup/index.html`: familiar music references to different equipment goals.

The review landing page is `/experiments/musical-breathers/`. It uses a **two-column desktop layout**, readable text, and links to each actual edited page; at smaller widths it collapses to one column.

## Windows laptop: review locally

Open **PowerShell** and run:

```powershell
git clone --single-branch --branch draft/musical-breathers-experiment-20261119 https://github.com/thesoundquestion/website.git tsq-musical-preview
Set-Location .\tsq-musical-preview
.\START_MUSICAL_PREVIEW.cmd
```

The CMD launcher requires Python 3, starts a server bound to `127.0.0.1:8765` and opens your default browser at:

`http://127.0.0.1:8765/experiments/musical-breathers/`

Close the additional console named **TSQ Musical Preview Server** to stop serving the preview.

If Git is already set up with a local copy, check out the branch and launch `START_MUSICAL_PREVIEW.cmd` from that branch's root.

### Alternative, no launcher

From the repo root, use `py -m http.server 8765 --bind 127.0.0.1`; then enter the preview URL in your desktop browser. For a second run, use an available port if 8765 is occupied.

## Editorial review gates
- Song references must be widely recognizable as **used in the text**, not generic coincidences.
- Short passage only; preserve the technical narrative and beginner readability.
- No lyrics copied or closely paraphrased.
- No added requirements to the System Builder, System Check, calculator, or graphs.
- Experimental passages should be reviewed for flow and duplication before any future merge.
- This review page and Windows launcher are **draft-only artifacts**, not public-site content.
