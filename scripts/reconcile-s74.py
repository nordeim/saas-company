#!/usr/bin/env python3
"""S74 F7 — the file-set reconciliation (the gotcha-67 discipline: expand
the runner FILE ITSELF, never a re-typed copy). Verifies the runner's spec
list equals the on-disk tests/e2e/*.spec.ts inventory exactly.
"""
import re
from pathlib import Path

REPO = Path(__file__).parent.parent
runner = (REPO / "scripts" / "run-e2e-chunks-s74.sh").read_text()
m = re.search(r"CHUNKS=\(([\s\S]*?)\n\)", runner)
specs = []
for tok in m.group(1).split('"'):
    for s in tok.split():
        if s and not s.startswith("#"):
            specs.append(s if s.endswith(".spec.ts") else f"{s}.spec.ts")

on_disk = sorted(p.name for p in (REPO / "tests" / "e2e").glob("*.spec.ts"))
in_runner = sorted(set(specs))

print(f"runner specs: {len(in_runner)}  on-disk specs: {len(on_disk)}")
missing = set(on_disk) - set(in_runner)
extra = set(in_runner) - set(on_disk)
print(f"file-set diff EMPTY: {not missing and not extra}")
if missing:
    print("MISSING from runner:", sorted(missing))
if extra:
    print("EXTRA in runner:", sorted(extra))
raise SystemExit(0 if not missing and not extra else 1)
