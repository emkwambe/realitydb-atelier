import type { Exercise } from "@/lib/grading";

export const clearbankExercises: Exercise[] = [
  {
    id: 1,
    title: "Read the bank portfolio",
    businessQuestion: "What does a normal SMB wire look like at ClearBank?",
    skills: ["SELECT", "GROUP BY", "JOIN"],
    description:
      "Establish the baseline. Count customers, accounts, and wires by type. Look at average wire amounts. You can't recognize an anomaly without a sense of what 'normal' looks like at this bank — most wires here are small business payments in the $500–$50,000 range.",
    hint: "Three small queries: customer count by customer_type, account count by account_type, and AVG wire amount by direction.",
    referenceSQL: `SELECT
  account_type,
  COUNT(*) AS accounts,
  ROUND(AVG(balance_usd)::numeric, 0) AS avg_balance
FROM accounts
GROUP BY account_type
ORDER BY accounts DESC;`,
    requiredColumns: ["account_type", "accounts", "avg_balance"],
    difficulty: "beginner",
  },
  {
    id: 2,
    title: "Wire volume by customer segment",
    businessQuestion: "Which customer type drives the most wire volume?",
    skills: ["multi-table JOIN", "aggregation"],
    description:
      "Join wires → accounts → customers and sum wire amount by customer_type. Business accounts (LLC, corporation, partnership) should dominate — that's where regulatory exposure lives.",
    hint: "Sum wires.amount_cents grouped by customers.customer_type.",
    referenceSQL: `SELECT
  c.customer_type,
  COUNT(w.id) AS wire_count,
  ROUND(SUM(w.amount_cents)::numeric / 100.0, 2) AS total_volume_usd
FROM wires w
JOIN accounts a ON w.account_id = a.id
JOIN customers c ON a.customer_id = c.id
GROUP BY c.customer_type
ORDER BY total_volume_usd DESC;`,
    requiredColumns: ["customer_type", "wire_count", "total_volume_usd"],
    difficulty: "beginner",
  },
  {
    id: 3,
    title: "Flag rate overview",
    businessQuestion: "What does ClearBank's fraud-alert workload look like?",
    skills: ["GROUP BY", "percentage calculation"],
    description:
      "Group fraud_alerts by status and severity. Critical-severity open alerts are the workload that matters most — those are the ones a BSA officer would investigate first. How many critical alerts are open?",
    hint: "GROUP BY status, severity. Filter or order to put critical/open at the top.",
    referenceSQL: `SELECT
  status,
  severity,
  COUNT(*) AS alerts
FROM fraud_alerts
GROUP BY status, severity
ORDER BY
  CASE WHEN severity = 'critical' THEN 0 ELSE 1 END,
  alerts DESC;`,
    requiredColumns: ["status", "severity", "alerts"],
    difficulty: "beginner",
  },
  {
    id: 4,
    title: "Identify the outlier accounts",
    businessQuestion: "Which accounts have wire volume far above the average?",
    skills: ["JOIN", "HAVING", "comparison vs mean"],
    description:
      "Compute total outgoing wire count per account. Compare to the average across business_checking accounts. An account with 3x the average count is statistically unusual — and worth a closer look. Look for the top 3-5.",
    hint: "Subquery for the AVG outgoing wire count per business_checking account; outer query filters HAVING count > 3 * avg.",
    referenceSQL: `SELECT
  a.id AS account_id,
  a.account_number,
  a.account_type,
  COUNT(w.id) AS outgoing_wires
FROM accounts a
JOIN wires w ON w.account_id = a.id
WHERE w.direction = 'outgoing'
  AND a.account_type = 'business_checking'
GROUP BY a.id, a.account_number, a.account_type
ORDER BY outgoing_wires DESC
LIMIT 10;`,
    requiredColumns: ["account_id", "account_number", "account_type", "outgoing_wires"],
    difficulty: "intermediate",
  },
  {
    id: 5,
    title: "The sub-threshold pattern",
    businessQuestion: "Are these outliers structuring under the CTR threshold?",
    skills: ["conditional aggregation", "percentage"],
    description:
      "For the top wire-volume accounts, compute the percentage of outgoing wires below $9,500. The CTR (Currency Transaction Report) threshold is $10,000 — sub-$9,500 wires are a deliberate avoidance signal under BSA 31 USC 5324. Industry baseline is under 25%. Anything near 94% is structuring.",
    hint: "amount_cents < 950000 means amount < $9,500. Wrap in a CASE WHEN and divide by COUNT(*).",
    referenceSQL: `SELECT
  a.id AS account_id,
  COUNT(w.id) AS outgoing_wires,
  SUM(CASE WHEN w.amount_cents < 950000 THEN 1 ELSE 0 END) AS sub_threshold,
  ROUND(
    SUM(CASE WHEN w.amount_cents < 950000 THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(w.id), 0), 1
  ) AS sub_threshold_pct
FROM accounts a
JOIN wires w ON w.account_id = a.id
WHERE w.direction = 'outgoing'
GROUP BY a.id
HAVING COUNT(w.id) >= 10
ORDER BY sub_threshold_pct DESC, outgoing_wires DESC
LIMIT 10;`,
    requiredColumns: [
      "account_id",
      "outgoing_wires",
      "sub_threshold",
      "sub_threshold_pct",
    ],
    difficulty: "intermediate",
  },
  {
    id: 6,
    title: "Wire velocity and timing",
    businessQuestion: "How quickly do funds move through these accounts?",
    skills: ["timestamp arithmetic", "ranking"],
    description:
      "For the top-flagged account, compute the time gap between large incoming wires and the subsequent outgoing wires. Money that arrives and leaves within 48 hours — especially in smaller pieces — is classic layering. Patient money sits. Suspicious money moves.",
    hint: "For each outgoing wire, find the most recent incoming wire on the same account before it. Use a window function or a self-join.",
    referenceSQL: `WITH ranked AS (
  SELECT
    account_id,
    direction,
    amount_cents,
    initiated_at,
    LAG(CASE WHEN direction = 'incoming' THEN initiated_at END)
      OVER (PARTITION BY account_id ORDER BY initiated_at) AS prev_incoming
  FROM wires
)
SELECT
  account_id,
  direction,
  ROUND(amount_cents / 100.0, 2) AS amount_usd,
  initiated_at,
  prev_incoming,
  CASE
    WHEN direction = 'outgoing' AND prev_incoming IS NOT NULL
    THEN ROUND(EXTRACT(EPOCH FROM (initiated_at - prev_incoming)) / 3600.0, 1)
  END AS hours_since_incoming
FROM ranked
WHERE direction = 'outgoing'
ORDER BY hours_since_incoming ASC NULLS LAST
LIMIT 20;`,
    requiredColumns: ["account_id", "direction", "amount_usd", "initiated_at"],
    difficulty: "intermediate",
  },
  {
    id: 7,
    title: "Offshore destination analysis",
    businessQuestion: "Where is the money going?",
    skills: ["JOIN", "country aggregation"],
    description:
      "Count outgoing wires per destination_country for the top-flagged accounts. KY (Cayman Islands), CY (Cyprus), and PA (Panama) appear on every BSA/AML examination manual as high-risk jurisdictions for layering. Most US small businesses do not wire to these countries.",
    hint: "GROUP BY destination_country for the top-flagged accounts. Compare against the system baseline.",
    referenceSQL: `WITH flagged AS (
  SELECT a.id AS account_id
  FROM accounts a
  JOIN wires w ON w.account_id = a.id
  WHERE w.direction = 'outgoing'
  GROUP BY a.id
  HAVING COUNT(w.id) >= 30
)
SELECT
  destination_country,
  COUNT(*) AS wires,
  ROUND(
    COUNT(*) * 100.0
    / SUM(COUNT(*)) OVER (), 1
  ) AS pct_of_total
FROM wires w
WHERE w.account_id IN (SELECT account_id FROM flagged)
  AND w.direction = 'outgoing'
GROUP BY destination_country
ORDER BY wires DESC;`,
    requiredColumns: ["destination_country", "wires", "pct_of_total"],
    difficulty: "intermediate",
  },
  {
    id: 8,
    title: "KYC and EDD failure",
    businessQuestion: "Did the bank ever finish due diligence on these accounts?",
    skills: ["multi-table JOIN", "filter"],
    description:
      "For the customers behind the flagged accounts, check their kyc_records and beneficial_owners. If verification_status is still pending months after onboarding, and id_verified is false, the bank was supposed to act and never did. Under the FinCEN CDD Final Rule this is a recordkeeping violation in itself.",
    hint: "JOIN flagged accounts → customers → kyc_records and beneficial_owners. Filter to verification_status != 'verified' and id_verified = 'false'.",
    referenceSQL: `WITH flagged_customers AS (
  SELECT DISTINCT a.customer_id
  FROM accounts a
  JOIN wires w ON w.account_id = a.id
  WHERE w.direction = 'outgoing'
  GROUP BY a.id, a.customer_id
  HAVING COUNT(w.id) >= 30
)
SELECT
  c.id AS customer_id,
  c.kyc_status,
  c.kyc_tier,
  c.edd_required,
  c.risk_rating,
  bo.owner_name,
  bo.country_of_residence,
  bo.id_verified,
  bo.ownership_pct
FROM flagged_customers fc
JOIN customers c ON c.id = fc.customer_id
LEFT JOIN beneficial_owners bo ON bo.customer_id = c.id
ORDER BY c.id;`,
    requiredColumns: [
      "customer_id",
      "kyc_status",
      "edd_required",
      "risk_rating",
      "country_of_residence",
      "id_verified",
    ],
    difficulty: "advanced",
  },
  {
    id: 9,
    title: "The smoking gun",
    businessQuestion: "Are these three accounts a coordinated network?",
    skills: ["beneficial-owner correlation", "summary statistics"],
    description:
      "Combine every signal. The three flagged accounts share a beneficial owner name. All three have offshore-resident owners (KY/CY/PA), id_verified = false, ownership 100%. All three have open critical fraud alerts for structuring. None of them have completed EDD despite the request being 11 months old. This is layering under BSA 31 USC 5324, not a coincidence.",
    hint: "Aggregate by beneficial_owners.owner_name. Count distinct customers and accounts under the same name. Look at the owner's country.",
    referenceSQL: `SELECT
  bo.owner_name,
  COUNT(DISTINCT bo.customer_id) AS customers,
  COUNT(DISTINCT a.id) AS accounts,
  bo.country_of_residence,
  bo.id_verified,
  bo.ownership_pct,
  SUM(CASE WHEN fa.severity = 'critical' THEN 1 ELSE 0 END) AS critical_alerts
FROM beneficial_owners bo
JOIN accounts a ON a.customer_id = bo.customer_id
LEFT JOIN fraud_alerts fa ON fa.account_id = a.id
GROUP BY bo.owner_name, bo.country_of_residence, bo.id_verified, bo.ownership_pct
HAVING COUNT(DISTINCT bo.customer_id) >= 2
ORDER BY critical_alerts DESC, customers DESC
LIMIT 5;`,
    requiredColumns: [
      "owner_name",
      "customers",
      "accounts",
      "country_of_residence",
      "id_verified",
      "critical_alerts",
    ],
    difficulty: "advanced",
  },
  {
    id: 10,
    title: "Quantify regulatory exposure",
    businessQuestion: "File SAR or enhanced monitoring?",
    skills: ["literal modeling", "regulatory citation"],
    description:
      "You have the pattern, the network, and the regulatory basis. Now model the decision. Option A — file SAR within 30 days under 31 CFR 1020.320, freeze accounts. Cost: $180K annual relationship revenue. Benefit: avoid up to $15M FinCEN civil money penalty for failure-to-file. Option B — enhanced monitoring with a 30-day EDD window. Cheaper short-term but risks late-SAR penalty if the structuring continues, and the FinCEN exam is in 60 days. What do you recommend to the CCO?",
    hint: "Switch from querying the dataset to literal modeling. Numbers come from the comparison panel.",
    referenceSQL: `SELECT
  'Option A: File SAR + freeze' AS strategy,
  180000 AS revenue_lost_annual,
  15000000 AS regulatory_fine_avoided,
  14820000 AS net_benefit,
  30 AS days_to_act,
  '31 CFR 1020.320' AS regulatory_basis
UNION ALL
SELECT
  'Option B: Enhanced monitoring' AS strategy,
  0 AS revenue_lost_annual,
  NULL AS regulatory_fine_avoided,
  NULL AS net_benefit,
  30 AS days_to_act,
  'FinCEN CDD Final Rule (EDD)' AS regulatory_basis;`,
    requiredColumns: [
      "strategy",
      "revenue_lost_annual",
      "regulatory_fine_avoided",
      "net_benefit",
      "days_to_act",
      "regulatory_basis",
    ],
    difficulty: "advanced",
  },
];
