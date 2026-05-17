import type { Exercise } from "@/lib/grading";

export const medcoreExercises: Exercise[] = [
  {
    id: 1,
    title: "Read the room",
    businessQuestion: "Is the revenue cycle healthy?",
    skills: ["SELECT", "GROUP BY", "percentage calculation"],
    description:
      "Count total claims by status (paid, denied, pending, partial). What percentage are denied? Is this within industry benchmarks? HFMA benchmark: denial rate under 10% is excellent, 10–15% acceptable, above 15% is a warning sign.",
    hint: "Use the claims table, GROUP BY claim_status, calculate percentage with a window SUM.",
    referenceSQL: `SELECT
  claim_status,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM claims
GROUP BY claim_status
ORDER BY count DESC;`,
    requiredColumns: ["claim_status", "count", "pct"],
    difficulty: "beginner",
  },
  {
    id: 2,
    title: "Where is revenue coming from?",
    businessQuestion: "Which payers represent the most claim volume and value?",
    skills: ["JOIN", "aggregation", "ranking"],
    description:
      "Join claims to payers. Show claim count and total billed amount by payer. Which payer is most important to the revenue cycle? Watch for outliers in volume — they're the ones whose policy changes hurt the most.",
    hint: "JOIN claims to payers on payer_id and SUM total_charges. Note that payers.name can repeat across types, so GROUP BY name to roll up.",
    referenceSQL: `SELECT
  p.name AS payer,
  COUNT(c.id) AS claim_count,
  ROUND(SUM(c.total_charges)::numeric, 2) AS total_billed,
  ROUND(COUNT(c.id) * 100.0 / SUM(COUNT(c.id)) OVER (), 1) AS volume_pct
FROM claims c
JOIN payers p ON c.payer_id = p.id
GROUP BY p.name
ORDER BY claim_count DESC;`,
    requiredColumns: ["payer", "claim_count", "total_billed", "volume_pct"],
    difficulty: "beginner",
  },
  {
    id: 3,
    title: "Denial rate by payer",
    businessQuestion: "Are all payers denying at similar rates?",
    skills: ["JOIN", "conditional aggregation"],
    description:
      "Calculate denial rate per payer. A uniform denial rate across payers suggests a coding or clinical issue. An outlier payer suggests a contract or policy change. Which pattern do you see?",
    hint: "Count denied claims divided by total claims per payer.",
    referenceSQL: `SELECT
  p.name AS payer,
  COUNT(*) AS total_claims,
  SUM(CASE WHEN c.claim_status = 'denied' THEN 1 ELSE 0 END) AS denied,
  ROUND(
    SUM(CASE WHEN c.claim_status = 'denied' THEN 1 ELSE 0 END) * 100.0
    / COUNT(*), 1
  ) AS denial_rate_pct
FROM claims c
JOIN payers p ON c.payer_id = p.id
GROUP BY p.name
ORDER BY denial_rate_pct DESC;`,
    requiredColumns: ["payer", "total_claims", "denied", "denial_rate_pct"],
    difficulty: "beginner",
  },
  {
    id: 4,
    title: "Has it always been this bad?",
    businessQuestion: "Is the denial rate getting worse over time?",
    skills: ["date functions", "comparative analysis"],
    description:
      "Split claim history into two periods using encounter_date: first 18 months vs last 6 months. Compare denial rates per payer across both periods. Is the overall rate rising, or is it specific to one payer?",
    hint: "JOIN claims to encounters for the service date, then bucket with CASE WHEN encounter_date < NOW() - INTERVAL '6 months'.",
    referenceSQL: `SELECT
  p.name AS payer,
  CASE WHEN e.encounter_date < NOW() - INTERVAL '6 months'
       THEN 'first_18_months' ELSE 'last_6_months' END AS period,
  COUNT(*) AS total_claims,
  ROUND(
    SUM(CASE WHEN c.claim_status = 'denied' THEN 1 ELSE 0 END) * 100.0
    / COUNT(*), 1
  ) AS denial_rate_pct
FROM claims c
JOIN encounters e ON c.encounter_id = e.id
JOIN payers p ON c.payer_id = p.id
GROUP BY p.name, period
ORDER BY p.name, period;`,
    requiredColumns: ["payer", "period", "total_claims", "denial_rate_pct"],
    difficulty: "intermediate",
  },
  {
    id: 5,
    title: "What type of denials?",
    businessQuestion: "Why are claims being denied?",
    skills: ["multi-table JOIN", "GROUP BY two dimensions"],
    description:
      "Join denials to claims to payers. Group by denial category and carc_code. Is one denial reason dominating? Is it concentrated at one payer? Authorization denials (CO-97) suggest a policy change. Coding denials suggest internal issues.",
    hint: "JOIN denials to claims to payers, GROUP BY denial_category and payer, count per payer.",
    referenceSQL: `SELECT
  p.name AS payer,
  d.denial_category,
  d.carc_code,
  COUNT(*) AS denial_count,
  ROUND(
    COUNT(*) * 100.0
    / SUM(COUNT(*)) OVER (PARTITION BY p.name), 1
  ) AS pct_of_payer_denials
FROM denials d
JOIN claims c ON d.claim_id = c.id
JOIN payers p ON c.payer_id = p.id
GROUP BY p.name, d.denial_category, d.carc_code
ORDER BY p.name, denial_count DESC;`,
    requiredColumns: ["payer", "denial_category", "carc_code", "denial_count"],
    difficulty: "intermediate",
  },
  {
    id: 6,
    title: "Appeals performance",
    businessQuestion: "Are we winning our appeals?",
    skills: ["multi-table JOIN", "outcome rate calculation"],
    description:
      "Join appeals to denials to claims to payers. Calculate appeal overturn rate by payer. A high overturn rate means the denials are wrong — the payer is making errors or applying new rules retroactively. KFF benchmark: 63% of appealed denials are overturned.",
    hint: "Chain JOINs from appeals through denials and claims to payers, then COUNT outcome='overturned' / total appeals.",
    referenceSQL: `SELECT
  p.name AS payer,
  COUNT(a.id) AS total_appeals,
  SUM(CASE WHEN a.outcome = 'overturned' THEN 1 ELSE 0 END) AS overturned,
  ROUND(
    SUM(CASE WHEN a.outcome = 'overturned' THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(a.id), 0), 1
  ) AS overturn_rate_pct
FROM appeals a
JOIN denials d ON a.denial_id = d.id
JOIN claims c ON d.claim_id = c.id
JOIN payers p ON c.payer_id = p.id
GROUP BY p.name
ORDER BY overturn_rate_pct DESC;`,
    requiredColumns: ["payer", "total_appeals", "overturned", "overturn_rate_pct"],
    difficulty: "intermediate",
  },
  {
    id: 7,
    title: "Underpayment signal",
    businessQuestion: "Are paid claims being paid correctly?",
    skills: ["JOIN", "boolean-as-text filtering"],
    description:
      "Even paid claims can be underpaid. Check the underpayment rate per payer. A payer with both high denial rate AND high underpayment rate is a double problem — they deny what they can and underpay what they cannot deny. Industry benchmark (Experian Health): 8% underpayment rate.",
    hint: "is_underpayment is stored as the text 'true' or 'false'. Filter with pm.is_underpayment = 'true'.",
    referenceSQL: `SELECT
  p.name AS payer,
  COUNT(pm.id) AS total_payments,
  SUM(CASE WHEN pm.is_underpayment = 'true' THEN 1 ELSE 0 END) AS underpayments,
  ROUND(
    SUM(CASE WHEN pm.is_underpayment = 'true' THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(pm.id), 0), 1
  ) AS underpayment_rate_pct
FROM payments pm
JOIN claims c ON pm.claim_id = c.id
JOIN payers p ON c.payer_id = p.id
GROUP BY p.name
ORDER BY underpayment_rate_pct DESC;`,
    requiredColumns: ["payer", "total_payments", "underpayments", "underpayment_rate_pct"],
    difficulty: "intermediate",
  },
  {
    id: 8,
    title: "Revenue at risk",
    businessQuestion: "How much money is MidState Mutual costing us?",
    skills: ["filtering", "SUM with annualization"],
    description:
      "Calculate the financial impact of MidState Mutual denials. Take denied claims, sum their billed amount, and annualize by the number of months in the data. This is the number you bring to the CFO.",
    hint: "JOIN denials → claims → payers, filter on payer name = 'MidState Mutual' and category = 'authorization'. SUM total_charges and annualize over the encounter-date span.",
    referenceSQL: `WITH denied_charges AS (
  SELECT
    p.name AS payer,
    c.total_charges,
    e.encounter_date
  FROM denials d
  JOIN claims c ON d.claim_id = c.id
  JOIN encounters e ON c.encounter_id = e.id
  JOIN payers p ON c.payer_id = p.id
  WHERE d.denial_category = 'authorization'
)
SELECT
  payer,
  COUNT(*) AS denied_claims,
  ROUND(SUM(total_charges)::numeric, 2) AS denied_billed_amount,
  ROUND(
    SUM(total_charges)::numeric * 12.0
    / GREATEST(EXTRACT(EPOCH FROM (MAX(encounter_date) - MIN(encounter_date))) / (30 * 86400), 1),
    2
  ) AS annualized_at_risk
FROM denied_charges
GROUP BY payer
ORDER BY denied_billed_amount DESC;`,
    requiredColumns: ["payer", "denied_claims", "denied_billed_amount", "annualized_at_risk"],
    difficulty: "advanced",
  },
  {
    id: 9,
    title: "The smoking gun",
    businessQuestion:
      "Is the authorization denial spike a MidState Mutual problem or systemic?",
    skills: ["period split", "filtered join", "comparative percentage"],
    description:
      "The definitive test. Compare MidState Mutual authorization denial rate in the last 6 months vs the first 18 months, then compare against all other payers in the same window. If MidState shows a sharp inflection while others stay flat — the problem is their policy change, not your coding.",
    hint: "LEFT JOIN denials filtered to 'authorization' so claims without an auth denial still count toward the denominator. Bucket by encounter_date < NOW() - INTERVAL '6 months'.",
    referenceSQL: `SELECT
  p.name AS payer,
  CASE WHEN e.encounter_date < NOW() - INTERVAL '6 months'
       THEN 'baseline_18mo' ELSE 'spike_6mo' END AS period,
  COUNT(c.id) AS total_claims,
  SUM(CASE WHEN d.id IS NOT NULL THEN 1 ELSE 0 END) AS auth_denials,
  ROUND(
    SUM(CASE WHEN d.id IS NOT NULL THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(c.id), 0), 1
  ) AS auth_denial_rate_pct
FROM claims c
JOIN encounters e ON c.encounter_id = e.id
JOIN payers p ON c.payer_id = p.id
LEFT JOIN denials d
  ON d.claim_id = c.id AND d.denial_category = 'authorization'
GROUP BY p.name, period
ORDER BY p.name, period;`,
    requiredColumns: [
      "payer",
      "period",
      "total_claims",
      "auth_denials",
      "auth_denial_rate_pct",
    ],
    difficulty: "advanced",
  },
  {
    id: 10,
    title: "Quantify the decision",
    businessQuestion: "What is the ROI of renegotiating vs pivoting?",
    skills: ["literal modeling", "ROI math", "UNION ALL"],
    description:
      "You have found the problem, identified the cause, and quantified the revenue at risk. Now model the two options. Option A — renegotiate the MidState Mutual contract ($150K cost, full $2.4M recovery). Option B — reduce MidState volume 60% ($800K short-term impact, $1.6M net 12-month benefit). Calculate payback months and 12-month net position for each. This is the recommendation you bring to the CFO.",
    hint: "Switch from querying the dataset to literal modeling — the numbers come from the comparison panel and Exercise 8.",
    referenceSQL: `SELECT
  'Option A: Renegotiate' AS strategy,
  2400000 AS revenue_at_risk,
  150000 AS intervention_cost,
  ROUND(150000.0 / (2400000.0 / 12.0), 1) AS payback_months,
  2400000 - 150000 AS net_12mo_benefit
UNION ALL
SELECT
  'Option B: Volume Pivot' AS strategy,
  2400000 AS revenue_at_risk,
  800000 AS intervention_cost,
  ROUND(800000.0 / (1600000.0 / 12.0), 1) AS payback_months,
  1600000 - 800000 AS net_12mo_benefit;`,
    requiredColumns: [
      "strategy",
      "revenue_at_risk",
      "intervention_cost",
      "payback_months",
      "net_12mo_benefit",
    ],
    difficulty: "advanced",
  },
];
