# enforce-novapay-story.ps1
# RealityDB Atelier - NovaPay Story Enforcer (v2 wrapper)
#
# Run after every:  realitydb run --pack novapay.json
# Reads:  public/data/novapay-5k.sql
# Writes: public/data/novapay-5k-baseline.sql
#
# Delegates to scripts/enforce-novapay-story.mjs which patches the INSERT
# rows in place. The output is pure CREATE + INSERT SQL safe for PGlite.

param(
    [string]$InputFile  = "C:\Users\HP\Documents\atelier\public\data\novapay-5k.sql",
    [string]$OutputFile = "C:\Users\HP\Documents\atelier\public\data\novapay-5k-baseline.sql"
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeScript = Join-Path $scriptDir "enforce-novapay-story.mjs"

if (-not (Test-Path $InputFile))  { throw "Input not found: $InputFile" }
if (-not (Test-Path $nodeScript)) { throw "Missing $nodeScript" }

Write-Host ""
Write-Host "NovaPay Story Enforcer (v2)" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

& node $nodeScript $InputFile $OutputFile
if ($LASTEXITCODE -ne 0) { throw "Enforcer exited with code $LASTEXITCODE" }

Write-Host ""
Write-Host "Verify the story by running these queries inside Exercise 9:" -ForegroundColor Yellow
Write-Host "  -- enterprise churn rate" -ForegroundColor Gray
Write-Host "  SELECT segment, COUNT(*) FILTER (WHERE status='churned') AS churned,"
Write-Host "         COUNT(*) AS total FROM customers GROUP BY segment;"
Write-Host ""
Write-Host "  -- currency-ticket correlation"     -ForegroundColor Gray
Write-Host "  SELECT s.status,"
Write-Host "         COUNT(DISTINCT c.id) AS customers,"
Write-Host "         COUNT(DISTINCT CASE WHEN st.category IN ('currency_support','fx_reconciliation')"
Write-Host "                              THEN c.id END) AS currency_customers"
Write-Host "  FROM customers c"
Write-Host "  JOIN subscriptions s ON s.customer_id = c.id"
Write-Host "  LEFT JOIN support_tickets st ON st.customer_id = c.id"
Write-Host "  WHERE c.segment = 'enterprise'"
Write-Host "  GROUP BY s.status;"
