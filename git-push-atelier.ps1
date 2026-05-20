# Atelier — Git Push to GitHub
# Run from PowerShell in C:\Users\HP\Documents\atelier
# Usage: paste each block one at a time, or run the full script

# Step 1 — verify you are in the right directory
Set-Location "C:\Users\HP\Documents\atelier"
Get-Location

# Step 2 — check current status before staging anything
git status

# Step 3 — stage all changes
git add -A

# Step 4 — verify what is staged
git diff --cached --stat

# Step 5 — commit with a descriptive message
# Edit the message between the quotes before running
git commit -m "docs: add source of truth, addendums 01-02, adjusted plan docs v2

- ATELIER-SOURCE-OF-TRUTH.md — canonical reference for product, pricing, segments, build status
- ATELIER-SOT-ADDENDUM-01.md — dimension naming (Augmented Intelligence), theoretical grounding
- ATELIER-SOT-ADDENDUM-02.md — six scaffolding modules mapped to dimensions and product
- 00-master-roadmap-adjusted.md — four-segment architecture, pricing unified, sequencing fixed
- 01-hot-cases-adjusted.md — renamed from Weekly Briefs, launch timing adjusted
- 02-atelier-rank-adjusted.md — Boardroom dependency moved to Wk 2-3
- 03-data-split-adjusted.md — Hot Cases naming, pricing, boardroom_transcript column
- 04-stripe-wiring-adjusted.md — pricing unified, per-module subscription removed"

# Step 6 — push to GitHub
git push origin master

# Step 7 — confirm pushed commit
git log --oneline -5
