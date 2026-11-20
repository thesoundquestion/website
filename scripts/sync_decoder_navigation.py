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
    final = index == len(LESSONS) - 1
    nxt = None if final else LESSONS[index + 1]
    previous = LESSONS[index - 1] if index else None
    category_info = CATEGORIES[lesson["category"]]
    new_topic = bool(nxt and lesson["category"] != nxt["category"])
    title = html.escape(nxt["title"]) if nxt else "Choose what to explore next"
    desc = html.escape(nxt["description"]) if nxt else "Browse the lessons again, or put what you have learned to use in the listening tools and labs."
    bridge = html.escape(lesson["next_bridge"])
    category = html.escape(category_info["label"])
    if nxt:
        prefix = "NEW TOPIC: " if new_topic else ""
        kicker = f'NEXT LESSON {index + 2:02d} OF {len(LESSONS)} · {prefix}{CATEGORIES[nxt["category"]]["label"].upper()}'
        action = f'Continue to lesson {index + 2:02d}'
        destination = lesson_url(nxt)
    else:
        kicker = f'COURSE COMPLETE · ALL {len(LESSONS)} LESSONS'
        action = 'Browse all lessons'
        destination = '/decoder/'
    progress = f'{(index + 1) / len(LESSONS) * 100:.2f}%'
    if previous:
        previous_link = f'<a href="{lesson_url(previous)}">← Previous: {html.escape(previous["title"])}</a>'
    else:
        previous_link = '<a href="/decoder/#start-here">← Back to the course overview</a>'
    secondary = '<a href="/decoder/">All lessons ↗</a>' if nxt else '<a href="/labs/">Try the listening labs ↗</a>'
    top = ""  # One static navigation panel at the bottom; no duplicate top Next button.
    bottom = (
        '<!-- LESSON_NAV_BEGIN --><nav class="dl-continue container" aria-label="Continue learning">\n'
        f' <div class="dl-course-progress"><span>Lesson {index + 1:02d} of {len(LESSONS)} · {category}</span>'
        f'<span>{"Course finished" if final else "Your next lesson is below"}</span></div>\n'
        f' <div class="dl-progress-track" role="progressbar" aria-label="Lessons completed" aria-valuemin="0" aria-valuemax="{len(LESSONS)}" aria-valuenow="{index + 1}"><span style="width:{progress}"></span></div>\n'
        f' <p class="dl-lesson-bridge">{bridge}</p>\n'
        f' <a class="dl-next-card" href="{destination}">\n'
        f'  <span class="dl-next-copy"><span class="dl-next-kicker">{kicker}</span>\n'
        f'  <strong>{title}</strong><span>{desc}</span><span class="dl-next-action">{action}</span></span>\n'
        '  <span class="dl-next-arrow" aria-hidden="true">→</span>\n'
        ' </a>\n'
        f' <div class="dl-nav-utilities">{previous_link}{secondary}</div>\n'
        ' </nav><!-- LESSON_NAV_END -->'
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
    print(f"Updated {lesson['slug']}: next → {LESSONS[i + 1]['slug'] if i + 1 < len(LESSONS) else 'course overview'}")

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
