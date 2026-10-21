#!/usr/bin/env python3
"""S76 gate reconciliation (the gotcha-67 form): expand the runner FILE
ITSELF (never a re-typed copy) against the on-disk spec inventory."""
import glob
import re
import sys

src = open("scripts/run-e2e-chunks-s77.sh").read()
chunks = re.findall(r'"([^"]+)"', src.split("CHUNKS=(")[1].split(")")[0])
specs = []
for ch in chunks:
    specs.extend(ch.split())
files = sorted(f"tests/e2e/{s}.spec.ts" for s in specs)
ondisk = sorted(glob.glob("tests/e2e/*.spec.ts"))
if files == ondisk:
    print(f"file-set diff EMPTY {len(files)}/{len(ondisk)}")
    sys.exit(0)
print(f"DIFF: runner-only={set(files)-set(ondisk)} disk-only={set(ondisk)-set(files)}")
sys.exit(1)
