"""Unit tests for the repository cleanup eligibility contract; no network or writes."""
import datetime as dt
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("housekeeping", Path(__file__).resolve().parents[1] / "scripts/repository-housekeeping.py")
h = importlib.util.module_from_spec(spec)
spec.loader.exec_module(h)
NOW = dt.datetime(2026, 11, 26, tzinfo=dt.timezone.utc)
OLD = "2026-11-15T00:00:00Z"
NEW = "2026-11-25T00:00:00Z"
SHA = "a" * 40
MAIN = "b" * 40

class Eligibility(unittest.TestCase):
    def branch(self, name="feature/example", sha=SHA, protected=False):
        return {"name": name, "commit": {"sha": sha}, "protected": protected}
    def pr(self, name="feature/example", sha=SHA, closed=OLD, repo=h.REPO):
        return {"head": {"ref": name, "sha": sha, "repo": {"full_name": repo}},
                "closed_at": closed}
    def eligible(self, b=None, prs=None, opened=None, ancestor=True, date=OLD):
        return h.eligible(b or self.branch(), MAIN, opened or set(),
                          [self.pr()] if prs is None else prs, NOW,
                          lambda *_: ancestor, lambda *_: date)[0]
    def test_closed_exact_ancestor(self):
        self.assertTrue(self.eligible())
    def test_main_never(self):
        self.assertFalse(self.eligible(self.branch("main")))
    def test_protected(self):
        self.assertFalse(self.eligible(self.branch(protected=True)))
    def test_reserved(self):
        self.assertFalse(self.eligible(self.branch("backup/keep")))
    def test_unmanaged(self):
        self.assertFalse(self.eligible(self.branch("unknown")))
    def test_open_head_and_base(self):
        self.assertEqual(h.ref_names([{"head": {"ref": "head"}, "base": {"ref": "base"}}]), {"head", "base"})
        self.assertFalse(self.eligible(opened={"feature/example"}))
    def test_unique_history(self):
        self.assertFalse(self.eligible(ancestor=False))
    def test_no_closed_pr(self):
        self.assertFalse(self.eligible(prs=[]))
    def test_wrong_sha(self):
        self.assertFalse(self.eligible(prs=[self.pr(sha="c"*40)]))
    def test_wrong_repo(self):
        self.assertFalse(self.eligible(prs=[self.pr(repo="fork/website")]))
    def test_recent_close(self):
        self.assertFalse(self.eligible(prs=[self.pr(closed=NEW)]))
    def test_recent_commit(self):
        self.assertFalse(self.eligible(date=NEW))
    def test_legacy_exact_sha(self):
        name, sha = next(iter(h.LEGACY.items()))
        self.assertTrue(self.eligible(self.branch(name, sha), prs=[]))
        self.assertFalse(self.eligible(self.branch(name, SHA), prs=[]))
        self.assertFalse(self.eligible(self.branch(name, sha), prs=[], ancestor=False))
    def test_invalid_sha(self):
        self.assertFalse(self.eligible(self.branch(sha="not-a-sha")))
    def test_missing_protection_field_fails_closed(self):
        b = self.branch()
        del b["protected"]
        self.assertFalse(self.eligible(b))

if __name__ == "__main__":
    unittest.main()
