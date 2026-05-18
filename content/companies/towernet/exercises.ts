import type { Exercise } from "@/lib/grading";

export const towernetExercises: Exercise[] = [
  {
    id: 1,
    title: "Read the room",
    businessQuestion: "Is the blended churn rate acceptable?",
    skills: ["SELECT", "GROUP BY", "percentage calculation"],
    description:
      "Calculate the overall subscriber churn rate (churned ÷ total). GSMA benchmark for postpaid wireless: 2.1% monthly is the industry mean. Above 2.5% triggers an executive review. What does TowerNet look like in aggregate?",
    hint: "Count subscribers WHERE status = 'churned' divided by total subscribers.",
    referenceSQL: `SELECT
  COUNT(*) AS total_subscribers,
  SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) AS churned,
  ROUND(
    SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) * 100.0
    / COUNT(*), 2
  ) AS churn_pct
FROM subscribers;`,
    requiredColumns: ["total_subscribers", "churned", "churn_pct"],
    difficulty: "beginner",
  },
  {
    id: 2,
    title: "Subscriber and revenue map",
    businessQuestion: "Which regions and plan types represent most subscribers?",
    skills: ["JOIN", "aggregation", "GROUP BY"],
    description:
      "Join subscribers to plans. Show subscriber count and average monthly fee by region and plan type. Where is the revenue concentrated? A geographic concentration in one region means a regional incident threatens disproportionate revenue.",
    hint: "JOIN subscribers to plans on plan_id, GROUP BY region and plan type.",
    referenceSQL: `SELECT
  s.region,
  p.type AS plan_type,
  COUNT(s.id) AS subscribers,
  ROUND(AVG(p.monthly_fee_cents::numeric) / 100.0, 2) AS avg_monthly_fee
FROM subscribers s
JOIN plans p ON s.plan_id = p.id
GROUP BY s.region, p.type
ORDER BY subscribers DESC;`,
    requiredColumns: ["region", "plan_type", "subscribers", "avg_monthly_fee"],
    difficulty: "beginner",
  },
  {
    id: 3,
    title: "Churn by region",
    businessQuestion: "Which region has the highest churn rate?",
    skills: ["GROUP BY", "conditional aggregation"],
    description:
      "Calculate churn rate per region. A uniform regional rate suggests a market-wide trend (pricing, competition). A single-region outlier suggests something specific to that geography — operations, network, demographics. Look for a regional outlier.",
    hint: "GROUP BY region, compute churned/total per region.",
    referenceSQL: `SELECT
  region,
  COUNT(*) AS subscribers,
  SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) AS churned,
  ROUND(
    SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) * 100.0
    / COUNT(*), 2
  ) AS churn_pct
FROM subscribers
GROUP BY region
ORDER BY churn_pct DESC;`,
    requiredColumns: ["region", "subscribers", "churned", "churn_pct"],
    difficulty: "beginner",
  },
  {
    id: 4,
    title: "Churn by tower",
    businessQuestion: "Which tower has the highest churn rate among its subscribers?",
    skills: ["multi-table JOIN", "conditional aggregation"],
    description:
      "Drop a level deeper than region. Join subscribers to towers and calculate churn rate per tower_code. One tower should stand out sharply. If you sort by churn rate descending, SE-447 should appear at the top.",
    hint: "JOIN subscribers to towers on tower_id, GROUP BY tower_code. Towers with very few subscribers will be noisy — filter for towers with at least 20 subscribers.",
    referenceSQL: `SELECT
  t.tower_code,
  COUNT(s.id) AS subscribers,
  SUM(CASE WHEN s.status = 'churned' THEN 1 ELSE 0 END) AS churned,
  ROUND(
    SUM(CASE WHEN s.status = 'churned' THEN 1 ELSE 0 END) * 100.0
    / COUNT(s.id), 2
  ) AS churn_pct
FROM subscribers s
JOIN towers t ON s.tower_id = t.id
GROUP BY t.tower_code
HAVING COUNT(s.id) >= 20
ORDER BY churn_pct DESC
LIMIT 10;`,
    requiredColumns: ["tower_code", "subscribers", "churned", "churn_pct"],
    difficulty: "intermediate",
  },
  {
    id: 5,
    title: "Has it always been this bad?",
    businessQuestion: "When did SE-447 area churn start spiking?",
    skills: ["date bucketing", "comparative analysis"],
    description:
      "Use subscriptions.cancelled_at to time-bucket churn. Split the last 24 months into 'last 8 months' vs 'first 16 months' and compute cancellations per period for SE-447 vs other towers. SE-447's cancellation count should be flat-then-spike; other towers should be flat throughout.",
    hint: "JOIN subscriptions to subscribers to towers. Filter status='cancelled' and bucket by cancelled_at vs NOW() - INTERVAL '8 months'.",
    referenceSQL: `SELECT
  CASE WHEN t.tower_code = 'SE-447' THEN 'SE-447' ELSE 'other_towers' END AS cohort,
  CASE WHEN sub.cancelled_at >= NOW() - INTERVAL '8 months'
       THEN 'last_8mo' ELSE 'prior_16mo' END AS period,
  COUNT(*) AS cancellations
FROM subscriptions sub
JOIN subscribers s ON sub.subscriber_id = s.id
JOIN towers t ON s.tower_id = t.id
WHERE sub.status = 'cancelled'
GROUP BY cohort, period
ORDER BY cohort, period;`,
    requiredColumns: ["cohort", "period", "cancellations"],
    difficulty: "intermediate",
  },
  {
    id: 6,
    title: "Network incident concentration",
    businessQuestion: "Are network incidents distributed evenly or concentrated?",
    skills: ["GROUP BY", "ranking"],
    description:
      "Count network_incidents per tower_code. System average is ~1 incident per tower over the 24-month window. If you see a tower with double-digit incidents, that's a maintenance backlog, not bad luck. Which tower is the outlier?",
    hint: "JOIN network_incidents to towers, GROUP BY tower_code, ORDER BY count DESC.",
    referenceSQL: `SELECT
  t.tower_code,
  COUNT(ni.id) AS incidents,
  SUM(CASE WHEN ni.severity IN ('high','critical') THEN 1 ELSE 0 END) AS high_critical
FROM network_incidents ni
JOIN towers t ON ni.tower_id = t.id
GROUP BY t.tower_code
ORDER BY incidents DESC
LIMIT 10;`,
    requiredColumns: ["tower_code", "incidents", "high_critical"],
    difficulty: "intermediate",
  },
  {
    id: 7,
    title: "Support ticket pattern near SE-447",
    businessQuestion:
      "Are SE-447 subscribers complaining about something specific?",
    skills: ["multi-table JOIN", "percentage of cohort"],
    description:
      "For subscribers under SE-447, compute the share of their support tickets that are network_quality or coverage. Compare against the system-wide average for the same categories. If SE-447 is roughly double the system rate, the network is the lived experience of the customer.",
    hint: "Two queries via UNION ALL: one filtered to SE-447 subscribers, one across all.",
    referenceSQL: `WITH se447_subs AS (
  SELECT s.id
  FROM subscribers s
  JOIN towers t ON s.tower_id = t.id
  WHERE t.tower_code = 'SE-447'
),
se447_tix AS (
  SELECT
    'SE-447 subscribers' AS cohort,
    COUNT(*) AS total_tickets,
    SUM(CASE WHEN category IN ('network_quality','coverage') THEN 1 ELSE 0 END) AS network_tickets
  FROM support_tickets st
  WHERE st.subscriber_id IN (SELECT id FROM se447_subs)
),
all_tix AS (
  SELECT
    'all_subscribers' AS cohort,
    COUNT(*) AS total_tickets,
    SUM(CASE WHEN category IN ('network_quality','coverage') THEN 1 ELSE 0 END) AS network_tickets
  FROM support_tickets
)
SELECT
  cohort,
  total_tickets,
  network_tickets,
  ROUND(network_tickets * 100.0 / NULLIF(total_tickets, 0), 1) AS network_pct
FROM se447_tix
UNION ALL
SELECT
  cohort,
  total_tickets,
  network_tickets,
  ROUND(network_tickets * 100.0 / NULLIF(total_tickets, 0), 1) AS network_pct
FROM all_tix;`,
    requiredColumns: ["cohort", "total_tickets", "network_tickets", "network_pct"],
    difficulty: "intermediate",
  },
  {
    id: 8,
    title: "Revenue at risk",
    businessQuestion: "How much ARR is at risk from SE-447 area churn?",
    skills: ["multi-table SUM", "ARPU calculation", "annualization"],
    description:
      "Quantify the excess churn from SE-447. Compute SE-447 subscriber count, monthly churn delta vs system, and multiply by industry-benchmark ARPU ($45). Annualize for ARR. This is the dollar figure the board needs.",
    hint: "Calculate SE-447 subscribers and churn rate, subtract system-wide churn rate, multiply delta × subscribers × ARPU × 12. The synthetic dataset's subscriber count is a sample; the comparison panel uses the spec's 68K target.",
    referenceSQL: `WITH se447 AS (
  SELECT
    COUNT(*) AS se447_subscribers,
    SUM(CASE WHEN s.status = 'churned' THEN 1 ELSE 0 END) AS se447_churned
  FROM subscribers s
  JOIN towers t ON s.tower_id = t.id
  WHERE t.tower_code = 'SE-447'
),
others AS (
  SELECT
    SUM(CASE WHEN s.status = 'churned' THEN 1 ELSE 0 END) * 1.0
      / NULLIF(COUNT(*), 0) AS other_churn_rate
  FROM subscribers s
  JOIN towers t ON s.tower_id = t.id
  WHERE t.tower_code <> 'SE-447'
)
SELECT
  se447.se447_subscribers,
  se447.se447_churned,
  ROUND((se447.se447_churned * 100.0 / NULLIF(se447.se447_subscribers, 0))::numeric, 2) AS se447_churn_pct,
  ROUND((others.other_churn_rate * 100.0)::numeric, 2) AS other_churn_pct,
  ROUND(((se447.se447_churned * 1.0 / NULLIF(se447.se447_subscribers, 0))
         - others.other_churn_rate) * 100.0, 2) AS excess_churn_pct,
  ROUND(((se447.se447_churned * 1.0 / NULLIF(se447.se447_subscribers, 0))
         - others.other_churn_rate)
        * se447.se447_subscribers * 45 * 12, 2) AS arr_at_risk_sample
FROM se447, others;`,
    requiredColumns: [
      "se447_subscribers",
      "se447_churn_pct",
      "other_churn_pct",
      "excess_churn_pct",
      "arr_at_risk_sample",
    ],
    difficulty: "advanced",
  },
  {
    id: 9,
    title: "The smoking gun",
    businessQuestion: "Does SE-447's incident count drive its churn?",
    skills: ["correlation", "JOIN three tables"],
    description:
      "Per tower, compute (a) number of network_incidents and (b) churn rate among its subscribers. If incidents and churn correlate at the tower level — and SE-447 sits in the top right of the chart with 14 incidents and 6.2% churn while everyone else clusters near 1 incident and 1.9% — that's the smoking gun.",
    hint: "Two CTEs: one with incident counts per tower, one with churn rate per tower. Join on tower_id. Limit to towers with at least 20 subscribers to remove noise.",
    referenceSQL: `WITH tower_incidents AS (
  SELECT t.id AS tower_id, t.tower_code, COUNT(ni.id) AS incidents
  FROM towers t
  LEFT JOIN network_incidents ni ON ni.tower_id = t.id
  GROUP BY t.id, t.tower_code
),
tower_churn AS (
  SELECT t.id AS tower_id,
         COUNT(s.id) AS subs,
         ROUND(
           SUM(CASE WHEN s.status = 'churned' THEN 1 ELSE 0 END) * 100.0
           / NULLIF(COUNT(s.id), 0), 2
         ) AS churn_pct
  FROM towers t
  LEFT JOIN subscribers s ON s.tower_id = t.id
  GROUP BY t.id
)
SELECT
  ti.tower_code,
  ti.incidents,
  tc.subs,
  tc.churn_pct
FROM tower_incidents ti
JOIN tower_churn tc ON ti.tower_id = tc.tower_id
WHERE tc.subs >= 20
ORDER BY ti.incidents DESC, tc.churn_pct DESC
LIMIT 12;`,
    requiredColumns: ["tower_code", "incidents", "subs", "churn_pct"],
    difficulty: "advanced",
  },
  {
    id: 10,
    title: "Quantify the decision",
    businessQuestion: "Tower maintenance or retention credits?",
    skills: ["literal modeling", "ROI", "UNION ALL"],
    description:
      "Model both options. Option A — emergency tower maintenance: $2.1M capex, payback 23.7 months, recovers $1.06M ARR by fixing the root cause. Option B — proactive retention credits: $1.8M one-time cost, retains $0.63M revenue but does not fix the network, so churn will resume. Bring the trade-off to the board.",
    hint: "Switch from querying the dataset to literal modeling — numbers come from the comparison panel and Exercise 8.",
    referenceSQL: `SELECT
  'Option A: Tower maintenance' AS strategy,
  2100000 AS upfront_cost,
  1061424 AS arr_recovered_12mo,
  23.7 AS payback_months,
  TRUE AS network_fixed
UNION ALL
SELECT
  'Option B: Retention credits' AS strategy,
  1800000 AS upfront_cost,
  630126 AS arr_recovered_12mo,
  NULL AS payback_months,
  FALSE AS network_fixed;`,
    requiredColumns: [
      "strategy",
      "upfront_cost",
      "arr_recovered_12mo",
      "payback_months",
      "network_fixed",
    ],
    difficulty: "advanced",
  },
];
