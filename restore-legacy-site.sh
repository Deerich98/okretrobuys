#!/bin/bash
# Rolls okretrobuys.com back to the original pre-2026-redesign site.
# The old site is frozen at git tag `legacy-2020-design`; this restores every
# file from that snapshot, removes the redesign's assets/ folder, and commits.
# After running it, push (founder: fppush / GitHub Desktop) and GitHub Pages
# redeploys the old site in about a minute.
set -euo pipefail
cd "$(dirname "$0")"

git checkout legacy-2020-design -- .
rm -rf assets restore-legacy-site.sh
git add -A
git commit -m "revert: restore original site design (from legacy-2020-design tag)"

echo "✅ Old site restored and committed. Now push to make it live."
