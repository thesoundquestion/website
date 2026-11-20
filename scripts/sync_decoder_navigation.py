#!/usr/bin/env python3
"""Rebuild static next/previous lesson navigation from decoder/curriculum.json.

Usage (from the repository root):
    python3 scripts/sync_decoder_navigation.py

The website remains plain HTML. No JS is required for lesson navigation.
When adding a lesson, add it to curriculum.json, write its HTML, and run this.
"""
from __future__ import annotations
import html
import json
import re
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
CURRICULUM = json.loads((ROOT / "decoder" / "curriculum.json").read_text(encoding="utf-8"))
LESSONS = CURRICULUM["lessons"]
CATEGORIES = CURRICULUM["categories"]

def lesson_url(entry):
    return f'/decoder/{entry["slug"]}/'

def build_nav(index):
    lesson = LESSONS[index]
    nxt = LESSONS[(index + 1) % len(LESSONS)]
    previous = LESSONS[index - 1] if index else None
    end_of_category = lesson["category"] != nxt["category"]
    category_info = CATEGORIES[lesson["category"]]
    next_info = CATEGORIES[nxt["category"]]
    switch_info = CATEGORIES[category_info.get("switch_to", nxt["category"])]
    target = switch_info["label"].lower()
    title = html.escape(nxt["title"])
    desc = html.escape(nxt["description"])
    current_category = category_info["label"]
    next_category = next_info["label"].upper()
    top = ""  # One navigation panel at the bottom; no duplicate top Next button.
    if previous:
        previous_link = f'<a href="{lesson_url(previous)}">← Previous: {html.escape(previous["title"])}</a>'
    else:
        previous_link = f'<a href="/decoder/#{category_info["anchor"]}">← See all {category_info["label"].lower()} lessons</a>'
    switch = ""
    if end_of_category:
        switch = (
            '<aside class="dl-topic-switch"><div>'
            f'<p class="dl-switch-label">FINISHED THIS {category_info["adjective"].upper()} SERIES?</p>'
            f'<h3>Want to learn about {target}?</h3>'
            f'<p>{html.escape(switch_info["description"])}</p>'
            '</div>'
            f'<a class="dl-switch-link" href="/decoder/#{switch_info["anchor"]}">'
            f'Explore {switch_info["adjective"].lower()} lessons ↗</a></aside>'
        )
    bottom = (
        '<!-- LESSON_NAV_BEGIN --><nav class="dl-continue container" aria-label="Continue learning">\n'
        ' <div class="dl-course-progress"><span>KEEP LEARNING</span>'
        f'<span>Lesson {index + 1:02d} of {len(LESSONS):02d} · {current_category}</span></div>\n'
        f' <a class="dl-next-card" href="{lesson_url(nxt)}">\n'
        f'  <span class="dl-next-copy"><span class="dl-next-kicker">{"NEXT TOPIC" if end_of_category else "UP NEXT"} · {next_category}</span>\n'
        f'  <strong>{title}</strong><span>{desc}</span></span>\n'
        '  <span class="dl-next-arrow" aria-hidden="true">→</span>\n'
        ' </a>\n'
        f' <div class="dl-nav-utilities">{previous_link}<a href="/decoder/">All lessons ↗</a></div>\n'
        + (f' {switch}\n' if switch else "")
        + ' </nav><!-- LESSON_NAV_END -->'
    )
    return top, bottom

if len(LESSONS) < 2 or len({x["slug"] for x in LESSONS}) != len(LESSONS):
    raise SystemExit("Curriculum requires at least two lessons with unique slugs")

for lesson in LESSONS:
    if lesson["category"] not in CATEGORIES:
        raise SystemExit(f"Unknown category: {lesson['category']}")

for i, lesson in enumerate(LESSONS):
    path = ROOT / "decoder" / lesson["slug"] / "index.html"
    page = path.read_text(encoding="utf-8")
    top, bottom = build_nav(i)
    breadcrumb = re.search(
        r'(<nav class="dl-breadcrumb"[^>]*>[\s\S]*?</nav>)'
        r'(?:\s*<!-- LESSON_TOP_NAV_BEGIN -->[\s\S]*?<!-- LESSON_TOP_NAV_END -->)?',
        page
    )
    if not breadcrumb:
        raise SystemExit(f"No lesson breadcrumb found in {path}")
    page = page[:breadcrumb.start()] + breadcrumb.group(1) + "\n" + top + page[breadcrumb.end():]
    markers = re.compile(r'<!-- LESSON_NAV_BEGIN -->[\s\S]*?<!-- LESSON_NAV_END -->')
    if markers.search(page):
        page = markers.sub(lambda m: bottom, page, count=1)
    else:
        slot = '<div class="dl-end container">'
        if slot not in page:
            raise SystemExit(f"No lesson-end navigation insertion point in {path}")
        page = page.replace(slot, bottom + "\n " + slot, 1)
    page, count = re.subn(r'(<p class="section-kicker">LESSON )\d{2}',
        lambda match: match.group(1) + f'{i+1:02d}', page, count=1)
    if count != 1:
        raise SystemExit(f"Expected one numbered lesson heading in {path}")
    path.write_text(page, encoding="utf-8")
    print(f"Updated {lesson['slug']}: next → {LESSONS[(i + 1) % len(LESSONS)]['slug']}")

# Make the curriculum the single authority for homepage card numbers, too.
HUB = ROOT / "decoder" / "index.html"
hub_source = HUB.read_text(encoding="utf-8")
card_regex = re.compile(r'(<a class="dl-card" href="/decoder/([^/]+)/">(?:(?!</a>).)*?<span class="dl-number">LESSON )\d{2}', re.DOTALL)
index_by_slug = {lesson["slug"]: i + 1 for i, lesson in enumerate(LESSONS)}
found_slugs = []
def renumber_card(match):
    slug = match.group(2)
    if slug not in index_by_slug:
        raise SystemExit(f"Unknown lesson card slug: {slug}")
    found_slugs.append(slug)
    return match.group(1) + f'{index_by_slug[slug]:02d}'
updated_hub = card_regex.sub(renumber_card, hub_source)
if found_slugs != [lesson["slug"] for lesson in LESSONS[1:]]:
    raise SystemExit("Lesson cards must follow the curriculum exactly. Reorder the cards first.")
if updated_hub != hub_source:
    HUB.write_text(updated_hub, encoding="utf-8")

# Regenerate Journey topic links whenever the published lesson order is synchronized.
subprocess.run([sys.executable, str(ROOT / 'scripts' / 'sync_journey_topics.py')], check=True)
