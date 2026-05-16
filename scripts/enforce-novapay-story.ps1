# enforce-novapay-story.ps1
# RealityDB Atelier — NovaPay Story Enforcer
# Run after every: realitydb run --pack novapay.json
# Guarantees the hidden story correlations are present in the data
# Output: novapay-5k-baseline.sql (story enforced)
# 
# The hidden story:
#   Enterprise churn rising 1.1% -> 3.2% over 18 months
#   Root cause: missing multi-currency support
#   Smoking gun: 64% of churned enterprise customers filed
#                currency_support or fx_reconciliation tickets
#                in their final 90 days
#   Active enterprise: only 4% have currency tickets
#   Enterprise = 58% of MRR despite being 5% of customers

param(
    [string]$InputFile = "C:\Users\HP\Documents\atelier\public\data\novapay-5k.sql",
    [string]$OutputFile = "C:\Users\HP\Documents\atelier\public\data\novapay-5k-baseline.sql"
)

Write-Host ""
Write-Host "NovaPay Story Enforcer" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host "Input:  $InputFile"
Write-Host "Output: $OutputFile"
Write-Host ""

# Load the SQL file
if (-not (Test-Path $InputFile)) {
    Write-Host "ERROR: Input file not found: $InputFile" -ForegroundColor Red
    exit 1
}

$sql = [System.IO.File]::ReadAllText($InputFile, [System.Text.UTF8Encoding]::new($false))
Write-Host "Loaded: $([Math]::Round($sql.Length / 1024, 1)) KB" -ForegroundColor Gray

# ============================================================
# T1: Remove NOT NULL from failure_code (PGlite compatibility)
# ============================================================
Write-Host ""
Write-Host "T1: Fixing failure_code NOT NULL..." -NoNewline
$before = $sql
$sql = $sql.Replace('"failure_code" VARCHAR(50) NOT NULL,', '"failure_code" VARCHAR(50),')
if ($sql -ne $before) {
    Write-Host " FIXED" -ForegroundColor Green
} else {
    Write-Host " already clean" -ForegroundColor Gray
}

# ============================================================
# T2: Fix temporal ordering -- signed_at must be <= created_at
# ============================================================
Write-Host "T2: Fixing temporal ordering..." -NoNewline

# Add SQL statement to fix at load time
$temporalFix = @"

-- T2: Enforce temporal ordering (signed_at <= created_at)
UPDATE "customers" SET created_at = signed_at + INTERVAL '1 day'
WHERE created_at < signed_at;

"@

# Insert after the customers INSERT block
$sql = $sql + $temporalFix
Write-Host " ADDED" -ForegroundColor Green

# ============================================================
# T3: Enforce enterprise MRR concentration
# Enterprise: avg $8000-$25000/month
# SMB: avg $99-$299/month
# ============================================================
Write-Host "T3: Enforcing MRR concentration..." -NoNewline

$mrrFix = @"

-- T3: Enforce MRR concentration by segment
-- Enterprise customers should represent ~58% of MRR
UPDATE "subscriptions" s
SET mrr_cents = FLOOR(800000 + RANDOM() * 1700000)
WHERE s.customer_id IN (
    SELECT id FROM "customers" WHERE segment = 'enterprise'
);

UPDATE "subscriptions" s
SET mrr_cents = FLOOR(9900 + RANDOM() * 19901)
WHERE s.customer_id IN (
    SELECT id FROM "customers" WHERE segment = 'smb'
);

UPDATE "subscriptions" s
SET mrr_cents = FLOOR(99900 + RANDOM() * 100000)
WHERE s.customer_id IN (
    SELECT id FROM "customers" WHERE segment = 'mid_market'
);

"@

$sql = $sql + $mrrFix
Write-Host " ADDED" -ForegroundColor Green

# ============================================================
# T4: Enforce enterprise churn rising arc
# 18-12 months ago: ~1.1% monthly churn rate
# 12-6 months ago:  ~2.1% monthly churn rate
# 6-0 months ago:   ~3.2% monthly churn rate
# ============================================================
Write-Host "T4: Enforcing churn rising arc..." -NoNewline

$churnArcFix = @"

-- T4: Enforce enterprise churn rising arc over 18 months
-- First: reset all enterprise cancellations to NULL (reactivate)
UPDATE "subscriptions" s
SET status = 'active', cancelled_at = NULL
WHERE s.customer_id IN (
    SELECT id FROM "customers" WHERE segment = 'enterprise'
);

-- Then apply rising churn arc:
-- 18-12 months ago: cancel ~11% of enterprise (1.1%/mo x 10 months)
UPDATE "subscriptions" s
SET status = 'cancelled',
    cancelled_at = NOW() - INTERVAL '18 months' + (RANDOM() * INTERVAL '6 months')
WHERE s.customer_id IN (
    SELECT id FROM "customers"
    WHERE segment = 'enterprise'
    ORDER BY RANDOM()
    LIMIT (SELECT FLOOR(COUNT(*) * 0.11) FROM "customers" WHERE segment = 'enterprise')
);

-- 12-6 months ago: cancel ~13% of remaining active enterprise (2.1%/mo x 6 months)
UPDATE "subscriptions" s
SET status = 'cancelled',
    cancelled_at = NOW() - INTERVAL '12 months' + (RANDOM() * INTERVAL '6 months')
WHERE s.customer_id IN (
    SELECT id FROM "customers" WHERE segment = 'enterprise'
) AND s.status = 'active'
AND s.customer_id IN (
    SELECT customer_id FROM "subscriptions"
    WHERE status = 'active'
    AND customer_id IN (SELECT id FROM "customers" WHERE segment = 'enterprise')
    ORDER BY RANDOM()
    LIMIT (SELECT FLOOR(COUNT(*) * 0.13)
           FROM "subscriptions"
           WHERE status = 'active'
           AND customer_id IN (SELECT id FROM "customers" WHERE segment = 'enterprise'))
);

-- Last 6 months: cancel ~19% of remaining active enterprise (3.2%/mo x 6 months)
UPDATE "subscriptions" s
SET status = 'cancelled',
    cancelled_at = NOW() - INTERVAL '6 months' + (RANDOM() * INTERVAL '6 months')
WHERE s.customer_id IN (
    SELECT id FROM "customers" WHERE segment = 'enterprise'
) AND s.status = 'active'
AND s.customer_id IN (
    SELECT customer_id FROM "subscriptions"
    WHERE status = 'active'
    AND customer_id IN (SELECT id FROM "customers" WHERE segment = 'enterprise')
    ORDER BY RANDOM()
    LIMIT (SELECT FLOOR(COUNT(*) * 0.19)
           FROM "subscriptions"
           WHERE status = 'active'
           AND customer_id IN (SELECT id FROM "customers" WHERE segment = 'enterprise'))
);

-- Sync customers.status with subscriptions.status
UPDATE "customers" c
SET status = 'churned'
WHERE c.segment = 'enterprise'
AND c.id IN (
    SELECT customer_id FROM "subscriptions"
    WHERE status = 'cancelled'
    AND customer_id IN (SELECT id FROM "customers" WHERE segment = 'enterprise')
);

UPDATE "customers" c
SET status = 'active'
WHERE c.segment = 'enterprise'
AND c.id IN (
    SELECT customer_id FROM "subscriptions"
    WHERE status = 'active'
    AND customer_id IN (SELECT id FROM "customers" WHERE segment = 'enterprise')
)
AND c.status != 'churned';

"@

$sql = $sql + $churnArcFix
Write-Host " ADDED" -ForegroundColor Green

# ============================================================
# T5: Enforce currency ticket correlation -- THE SMOKING GUN
# 64% of churned enterprise customers have currency tickets
# Active enterprise: only 4% have currency tickets
# ============================================================
Write-Host "T5: Enforcing currency ticket correlation..." -NoNewline

$currencyFix = @"

-- T5: Enforce currency ticket correlation -- THE SMOKING GUN
-- For 64% of churned enterprise customers:
--   update their support tickets to currency_support or fx_reconciliation

-- Step A: Update tickets for churned enterprise customers (64%)
UPDATE "support_tickets" st
SET category = CASE
    WHEN RANDOM() < 0.6 THEN 'currency_support'
    ELSE 'fx_reconciliation'
END
WHERE st.customer_id IN (
    SELECT id FROM "customers"
    WHERE segment = 'enterprise' AND status = 'churned'
    ORDER BY RANDOM()
    LIMIT (
        SELECT FLOOR(COUNT(*) * 0.64)
        FROM "customers"
        WHERE segment = 'enterprise' AND status = 'churned'
    )
)
AND st.id IN (
    SELECT id FROM "support_tickets" WHERE customer_id = st.customer_id
    ORDER BY RANDOM()
    LIMIT 2
);

-- Step B: Reset currency tickets for active enterprise (keep only 4%)
-- First clear all currency tickets from active enterprise
UPDATE "support_tickets" st
SET category = CASE
    WHEN RANDOM() < 0.25 THEN 'billing_question'
    WHEN RANDOM() < 0.50 THEN 'api_integration'
    WHEN RANDOM() < 0.75 THEN 'onboarding'
    ELSE 'feature_request'
END
WHERE st.customer_id IN (
    SELECT id FROM "customers"
    WHERE segment = 'enterprise' AND status = 'active'
)
AND st.category IN ('currency_support', 'fx_reconciliation');

-- Then add currency tickets back for 4% of active enterprise
UPDATE "support_tickets" st
SET category = 'currency_support'
WHERE st.customer_id IN (
    SELECT id FROM "customers"
    WHERE segment = 'enterprise' AND status = 'active'
    ORDER BY RANDOM()
    LIMIT (
        SELECT FLOOR(COUNT(*) * 0.04)
        FROM "customers"
        WHERE segment = 'enterprise' AND status = 'active'
    )
)
AND st.id IN (
    SELECT id FROM "support_tickets" WHERE customer_id = st.customer_id
    ORDER BY RANDOM() LIMIT 1
);

"@

$sql = $sql + $currencyFix
Write-Host " ADDED" -ForegroundColor Green

# ============================================================
# T6: Enforce board_metrics story values
# ============================================================
Write-Host "T6: Enforcing board_metrics story values..." -NoNewline

$boardFix = @"

-- T6: Enforce board_metrics with story values
-- Delete generated board_metrics and insert accurate story values
DELETE FROM "board_metrics";

INSERT INTO "board_metrics" ("id", "metric_name", "value_decimal", "period", "recorded_at", "created_at") VALUES
(gen_random_uuid(), 'blended_churn_rate',    0.014, '2025-03', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.032, '2025-03', NOW(), NOW()),
(gen_random_uuid(), 'smb_churn_rate',        0.009, '2025-03', NOW(), NOW()),
(gen_random_uuid(), 'nrr',                   0.96,  '2025-03', NOW(), NOW()),
(gen_random_uuid(), 'ltv_cac_ratio',         3.2,   '2025-03', NOW(), NOW()),
(gen_random_uuid(), 'cac_payback_months',    14.0,  '2025-03', NOW(), NOW()),
(gen_random_uuid(), 'gross_margin_pct',      71.0,  '2025-03', NOW(), NOW()),
(gen_random_uuid(), 'runway_months',         18.0,  '2025-03', NOW(), NOW()),
(gen_random_uuid(), 'total_arr',             2100000.0, '2025-03', NOW(), NOW()),
(gen_random_uuid(), 'mrr_growth_pct',        0.08,  '2025-03', NOW(), NOW()),
-- Enterprise segment breakdown
(gen_random_uuid(), 'enterprise_churn_rate', 0.011, '2023-09', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.013, '2023-10', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.012, '2023-11', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.014, '2023-12', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.015, '2024-01', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.017, '2024-02', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.019, '2024-03', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.021, '2024-04', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.024, '2024-05', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.026, '2024-06', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.028, '2024-07', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.029, '2024-08', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.030, '2024-09', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.031, '2024-10', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.031, '2024-11', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.032, '2024-12', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.032, '2025-01', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.032, '2025-02', NOW(), NOW()),
(gen_random_uuid(), 'enterprise_churn_rate', 0.032, '2025-03', NOW(), NOW());

"@

$sql = $sql + $boardFix
Write-Host " ADDED" -ForegroundColor Green

# ============================================================
# T7: Add verification queries (run at end to confirm story)
# ============================================================
$verifyBlock = @"

-- ============================================================
-- STORY VERIFICATION QUERIES
-- Run these to confirm the hidden story is enforced
-- ============================================================

-- Check 1: Enterprise churn rate (should be ~3.2%)
-- SELECT segment,
--        COUNT(CASE WHEN status = 'churned' THEN 1 END) as churned,
--        COUNT(*) as total,
--        ROUND(COUNT(CASE WHEN status = 'churned' THEN 1 END) * 100.0 / COUNT(*), 1) as churn_pct
-- FROM customers GROUP BY segment;

-- Check 2: Currency ticket correlation (should be ~64% for churned enterprise)
-- SELECT c.status,
--        COUNT(CASE WHEN st.category IN ('currency_support','fx_reconciliation') THEN 1 END) as currency_tickets,
--        COUNT(*) as total_tickets,
--        ROUND(COUNT(CASE WHEN st.category IN ('currency_support','fx_reconciliation') THEN 1 END) * 100.0 / NULLIF(COUNT(*),0), 1) as pct
-- FROM customers c
-- JOIN support_tickets st ON c.id = st.customer_id
-- WHERE c.segment = 'enterprise'
-- GROUP BY c.status;

-- Check 3: Enterprise MRR concentration
-- SELECT c.segment, SUM(s.mrr_cents)/100.0 as total_mrr
-- FROM customers c JOIN subscriptions s ON c.id = s.customer_id
-- WHERE s.status = 'active'
-- GROUP BY c.segment ORDER BY total_mrr DESC;

"@

$sql = $sql + $verifyBlock

# ============================================================
# Write output file
# ============================================================
Write-Host ""
Write-Host "Writing output file..." -NoNewline
[System.IO.File]::WriteAllText($OutputFile, $sql, [System.Text.UTF8Encoding]::new($false))
$sizeKB = [Math]::Round((Get-Item $OutputFile).Length / 1024, 1)
Write-Host " DONE ($sizeKB KB)" -ForegroundColor Green

Write-Host ""
Write-Host "Story enforcement complete!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Output: $OutputFile" -ForegroundColor White
Write-Host ""
Write-Host "Verify the story by running these queries in the exercise:" -ForegroundColor Yellow
Write-Host "  Exercise 4: Enterprise churn should show ~3.2%" -ForegroundColor Yellow
Write-Host "  Exercise 9: Currency tickets should show ~64% for churned enterprise" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next step: run generate-scenarios.ps1 to create scenario-a and scenario-b" -ForegroundColor Gray