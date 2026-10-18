#!/usr/bin/env python3
"""S67 baseline reconciliation — the gotcha-64 silent-skip law check.

Parses the CHUNKS array from a chunk runner, expands each token to
tests/e2e/<token>.spec.ts, and diffs against the on-disk inventory.
Exit 1 + report on any mismatch (missing or extra files).
"""
import re
import subprocess
import sys
from pathlib import Path

REPO = Path("/home/z/my-project/saas-company")


def runner_specs(runner: str) -> set[str]:
    src = (REPO / "scripts" / runner).read_text()
    m = re.search(r"CHUNKS=\(\n(.*?)^\)", src, re.S | re.M)
    if not m:
        sys.exit(f"no CHUNKS array found in {runner}")
    body = m.group(1)
    tokens = re.findall(r'"([^"]+)"', body)
    specs = set()
    for tok in tokens:
        for t in tok.split():
            specs.add(f"tests/e2e/{t}.spec.ts")
    return specs


def disk_specs() -> set[str]:
    out = subprocess.run(
        ["find", "tests/e2e", "-name", "*.spec.ts"], cwd=REPO,
        capture_output=True, text=True, check=True).stdout
    return set(l for l in out.splitlines() if l.strip())


def main():
    runner = sys.argv[1] if len(sys.argv) > 1 else "run-e2e-chunks-s66.sh"
    r = runner_specs(runner)
    d = disk_specs()
    missing = sorted(d - r)   # on disk, not run -> SILENT SKIP risk
    extra = sorted(r - d)     # in runner, no file -> playwright drops silently
    print(f"runner={runner}: {len(r)} specs | disk: {len(d)} specs")
    if missing:
        print("ON DISK BUT NOT IN RUNNER (silent-skip risk):")
        for f in missing:
            print(f"  - {f}")
    if extra:
        print("IN RUNNER BUT NOT ON DISK (dropped silently):")
        for f in extra:
            print(f"  - {f}")
    if not missing and not extra:
        print("FILE-SET DIFF EMPTY")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
