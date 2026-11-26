#!/usr/bin/env python3
"""Conservative TSQ branch retirement. Defaults to read-only; never merges or deploys."""
import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys
from urllib.parse import quote

REPO = "thesoundquestion/website"
DEFAULT = "main"
GRACE_DAYS = 7
MAX_DELETIONS = 20
# Existing ancestor-only refs audited 2026-11-26. Exact SHA is required.
LEGACY = {
    "compare-my-gear": "2af1b5a6c2123d62ec720f28abd9f81357547312",
    "draft/abx-shared-framework-20261116": "73566a3701b2e366b5ca9fe6cd3f18dc20213d08",
    "draft/audio-interfaces-mixers-20261118": "9a735a6354a3cdaf84379a70393bdf018cd033d6",
    "draft/goal-first-home-entry-20261118": "21a51b109776066d5e921bd44a4c40911110c084",
    "draft/mixing-lab-preview-20261114": "7683c8304e2e09e6f07fa49541b2775c9ead00e4",
    "draft/phase2-comparison-model-20261118": "c8e44d4edb02b834cd3bab46d296010d0c2576ec",
    "draft/phase3-recording-chain-check-20261118": "b24351c6dd0ac47d016a2134f4fb4b6c8d643800",
    "draft/recording-input-inventory-v1-20261118": "8e185f4f760e50a54967d61b09ace010c381b696",
    "draft/technical-glossary-pump-20261118": "f8854de219c11f5fec0c28e4c862d9bc38e9b6eb",
    "feature/curators-listening-room-20261115": "24ef36f442451f731651acc9c4d2d50daa42ad85",
    "fix/google-favicon-20261118": "d06d5de9be2972d81eab078b34aded1a0b1625cb",
    "integration/glossary-for-full-preview-20261118": "562ae50d88aeffb9e781ceb61d3fdc5ba87870d7",
    "lesson-22-mono-and-space": "0ce9bc08612259922119d2dcdf3f88c379815a73",
    "release-candidate/full-site-preview-20261118": "49220bcd1b31f7ff29130d2a73da8633bcf4ac04",
}
MANAGED = ("audit/", "docs/", "draft/", "edit/", "feature/", "fix/", "improve/",
           "integration/", "maintenance/", "planning/", "qa/", "seo/", "staging/",
           "release-candidate/", "release/")
PROTECTED = ("archive/", "backup/", "keep/", "production/", "hotfix/")

def cmd(*args):
    return subprocess.run(args, check=True, text=True, stdout=subprocess.PIPE).stdout.strip()

def api(path):
    return json.loads(cmd("gh", "api", "repos/" + REPO + "/" + path))

def pages(path):
    payload = json.loads(cmd("gh", "api", "--paginate", "--slurp",
                             "repos/" + REPO + "/" + path))
    if not isinstance(payload, list) or any(not isinstance(p, list) for p in payload):
        raise RuntimeError("Unexpected paginated response")
    return [item for page in payload for item in page]

def ref_names(prs):
    # Conservatively block both head and base names even for forks.
    return {pr[side]["ref"] for pr in prs for side in ("head", "base")}

def old_enough(value, now):
    when = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    return now - when >= dt.timedelta(days=GRACE_DAYS)

def eligible(branch, main_sha, open_names, closed_prs, now, ancestor, commit_date):
    name, sha = branch["name"], branch["commit"]["sha"]
    if name == DEFAULT or branch.get("protected", True) or name.startswith(PROTECTED):
        return False, "protected or reserved"
    if name in open_names:
        return False, "referenced by open PR"
    if not re.fullmatch(r"[0-9a-f]{40}", sha):
        return False, "invalid SHA"
    if name in LEGACY:
        if LEGACY[name] != sha:
            return False, "legacy head changed; manual review"
    else:
        if not name.startswith(MANAGED):
            return False, "unmanaged branch"
        # Require an actual closed PR for this exact head, not just its name.
        matching = [p for p in closed_prs if p["head"]["ref"] == name
                    and p["head"]["sha"] == sha
                    and (p["head"].get("repo") or {}).get("full_name") == REPO]
        if not matching:
            return False, "no closed PR for exact head"
        if not all(p.get("closed_at") and old_enough(p["closed_at"], now) for p in matching):
            return False, "closed PR grace period"
    if not old_enough(commit_date(sha), now):
        return False, "recent commit"
    if not ancestor(sha, main_sha):
        return False, "unique history: retain and review"
    return True, "ancestor of main; retirement eligible"

def ancestor(sha, main_sha):
    status = subprocess.run(["git", "merge-base", "--is-ancestor", sha, main_sha]).returncode
    if status not in (0, 1):
        raise RuntimeError("Unable to prove ancestry")
    return status == 0

def commit_date(sha):
    return cmd("git", "show", "-s", "--format=%cI", sha)

def inspect():
    info = api("")
    if info["full_name"] != REPO or info["default_branch"] != DEFAULT:
        raise RuntimeError("Unexpected repository or default branch")
    if cmd("git", "remote", "get-url", "origin") != "https://github.com/" + REPO + ".git":
        raise RuntimeError("Unexpected git remote")
    # Full history required; fetch all current branches and prune stale tracking refs.
    if cmd("git", "rev-parse", "--is-shallow-repository") != "false":
        raise RuntimeError("Refusing shallow repository")
    cmd("git", "fetch", "--prune", "--no-tags", "origin",
        "+refs/heads/*:refs/remotes/origin/*")
    main_sha = cmd("git", "rev-parse", "refs/remotes/origin/" + DEFAULT)
    branches = pages("branches?per_page=100")
    if next(b["commit"]["sha"] for b in branches if b["name"] == DEFAULT) != main_sha:
        raise RuntimeError("Main changed during inventory; retry later")
    opened = pages("pulls?state=open&per_page=100")
    closed = pages("pulls?state=closed&per_page=100")
    now = dt.datetime.now(dt.timezone.utc)
    candidates = []
    for branch in branches:
        name, sha = branch["name"], branch["commit"]["sha"]
        # Only evaluate if the exact API head matches the fetched ref.
        remote_sha = cmd("git", "rev-parse", "refs/remotes/origin/" + name)
        if remote_sha != sha:
            raise RuntimeError("Branch changed during inventory: " + name)
        ok, reason = eligible(branch, main_sha, ref_names(opened), closed,
                              now, ancestor, commit_date)
        print(("CANDIDATE" if ok else "KEEP") + " " + name + " " + sha + " — " + reason)
        if ok:
            candidates.append(branch)
    print("Open PRs (report only):", ", ".join("#" + str(p["number"]) for p in opened))
    return main_sha, candidates, closed

def run(apply):
    main_sha, candidates, closed = inspect()
    print("Eligible:", len(candidates), "Mode:", "DELETE" if apply else "DRY RUN")
    if not apply:
        return
    # Fail closed if the main ref changes. Verify current head/protection and all
    # open PR references again immediately before each deletion. The git lease
    # atomically rejects a changed branch head even after the API checks.
    for branch in candidates[:MAX_DELETIONS]:
        name, sha = branch["name"], branch["commit"]["sha"]
        if api("branches/" + DEFAULT)["commit"]["sha"] != main_sha:
            raise RuntimeError("Main advanced; stop and re-inventory")
        fresh = api("branches/" + quote(name, safe=""))
        if fresh["commit"]["sha"] != sha:
            print("SKIP changed head:", name)
            continue
        opened = pages("pulls?state=open&per_page=100")
        # Refresh closed PRs as well in case one was reopened/reclosed.
        closed = pages("pulls?state=closed&per_page=100")
        ok, reason = eligible(fresh, main_sha, ref_names(opened), closed,
                              dt.datetime.now(dt.timezone.utc), ancestor, commit_date)
        if not ok:
            print("SKIP", name, reason)
            continue
        target = "refs/heads/" + name
        cmd("git", "push", "--force-with-lease=" + target + ":" + sha, "origin", ":" + target)
        print("DELETED", name, sha)
    if len(candidates) > MAX_DELETIONS:
        print("Deletion cap reached; remaining candidates deferred")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="delete verified eligible refs")
    args = parser.parse_args()
    if args.apply and (os.environ.get("GITHUB_REPOSITORY") != REPO
                       or os.environ.get("GITHUB_REF") != "refs/heads/main"):
        raise RuntimeError("Apply restricted to the main-branch GitHub Actions runner")
    run(args.apply)

if __name__ == "__main__":
    main()
