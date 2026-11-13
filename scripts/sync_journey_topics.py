#!/usr/bin/env python3
"""Generate the Journey's linked topic lists from published Decoder lessons.

Run: python3 scripts/sync_journey_topics.py
CI:  python3 scripts/sync_journey_topics.py --check

Add a topic or associate a newly released lesson in journey/topic-links.json.
The check fails if a published curriculum lesson is missing from every Journey
stage, if a target does not exist, or if journey/index.html is out of sync.
No client-side JavaScript or paid APIs are needed.
"""
from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JOURNEY = ROOT / "journey" / "index.html"
TOPICS = ROOT / "journey" / "topic-links.json"
CURRICULUM = ROOT / "decoder" / "curriculum.json"
PATTERN = re.compile(
    r'(<article class="path-lesson" id="(?P<step>[^"]+)">'
    r'(?:(?!</article>).)*?<div class="path-subtopics">)'
    r'(?P<body>.*?)(</div>)',
    flags=re.DOTALL,
)


def render() -> tuple[str, str, int]:
    source = JOURNEY.read_text(encoding="utf-8")
    config = json.loads(TOPICS.read_text(encoding="utf-8"))
    curriculum = json.loads(CURRICULUM.read_text(encoding="utf-8"))
    lesson_slugs = [lesson["slug"] for lesson in curriculum["lessons"]]
    published = set(lesson_slugs)
    if len(published) != len(lesson_slugs):
        raise ValueError("Duplicate published lesson slug in curriculum.json")
    steps = config["steps"]
    linked = set()
    seen = set()

    def replace(match: re.Match[str]) -> str:
        step = match.group("step")
        if step not in steps or step in seen:
            raise ValueError(f"Unknown or duplicate Journey stage: {step}")
        seen.add(step)
        labels = set()
        items = []
        for item in steps[step]:
            label = item["label"].strip()
            if not label or label.casefold() in labels:
                raise ValueError(f"Blank or repeated topic in Journey stage {step}")
            labels.add(label.casefold())
            lesson = item.get("lesson")
            if lesson:
                if lesson not in published:
                    raise ValueError(f"{step}: {lesson} is not a published Decoder lesson")
                page = ROOT / "decoder" / lesson / "index.html"
                if not page.is_file():
                    raise ValueError(f"{step}: destination page missing: {page}")
                fragment = item.get("fragment", "")
                if fragment and (not re.fullmatch(r"#[a-zA-Z0-9_-]+", fragment)
                                 or f'id="{fragment[1:]}"' not in page.read_text(encoding="utf-8")):
                    raise ValueError(f"{step}: target anchor not found: {lesson}/{fragment}")
                linked.add(lesson)
                target = f"/decoder/{lesson}/{fragment}"
                items.append(f'<a href="{target}">{html.escape(label)}</a>')
            else:
                if "fragment" in item:
                    raise ValueError(f"{step}: fragment on unlinked topic {label}")
                items.append(html.escape(label))
        return (match.group(1) + "<strong>Topics to explore:</strong> "
                + ", ".join(items) + match.group(4))

    updated, count = PATTERN.subn(replace, source)
    if count != len(steps) or seen != set(steps):
        raise ValueError(f"Found {count} stages but expected {len(steps)}: {sorted(set(steps) - seen)}")
    unlinked = published - linked
    if unlinked:
        raise ValueError("Newly published lessons need a Journey topic link: "
                         + ", ".join(sorted(unlinked)))
    return source, updated, count


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check links without modifying files")
    args = parser.parse_args()
    try:
        before, after, count = render()
    except (ValueError, KeyError, OSError) as error:
        parser.exit(1, f"Journey topic check failed: {error}\n")
    if args.check:
        if before != after:
            parser.exit(1, "Journey topic links are stale. Run python3 scripts/sync_journey_topics.py and commit the result.\n")
        print(f"Journey topic links are current across {count} stages.")
    elif before != after:
        JOURNEY.write_text(after, encoding="utf-8")
        print(f"Updated Journey topic links across {count} stages.")
    else:
        print(f"Journey topic links already current across {count} stages.")


if __name__ == "__main__":
    main()
