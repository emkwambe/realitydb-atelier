// Quick-queries are exploration prompts, NOT exercise answers.
import type { CompanyQuickQueries } from "../novapay/quickQueries";

export const MEDCORE_QUICK_QUERIES: CompanyQuickQueries = {
  claims: [
    {
      label: "Claim status breakdown",
      sql: `SELECT claim_status, COUNT(*) AS n
FROM claims
GROUP BY claim_status
ORDER BY n DESC;`,
    },
    {
      label: "Average billed amount per claim",
      sql: `SELECT ROUND(AVG(total_charges)::numeric, 2) AS avg_billed,
       MIN(total_charges) AS min_billed,
       MAX(total_charges) AS max_billed
FROM claims;`,
    },
    {
      label: "Claims filed per month",
      sql: `SELECT DATE_TRUNC('month', filed_at) AS month, COUNT(*) AS claims
FROM claims
GROUP BY month
ORDER BY month;`,
    },
  ],
  payers: [
    {
      label: "All payers and their type",
      sql: `SELECT name, type, COUNT(*) AS rows
FROM payers
GROUP BY name, type
ORDER BY name;`,
    },
    {
      label: "Claims volume per payer",
      sql: `SELECT p.name AS payer, COUNT(c.id) AS claims
FROM claims c
JOIN payers p ON c.payer_id = p.id
GROUP BY p.name
ORDER BY claims DESC;`,
    },
  ],
  denials: [
    {
      label: "Denial reasons (carc_code)",
      sql: `SELECT carc_code, denial_category, COUNT(*) AS n
FROM denials
GROUP BY carc_code, denial_category
ORDER BY n DESC;`,
    },
    {
      label: "Denial categories per payer",
      sql: `SELECT p.name AS payer, d.denial_category, COUNT(*) AS n
FROM denials d
JOIN claims c ON d.claim_id = c.id
JOIN payers p ON c.payer_id = p.id
GROUP BY p.name, d.denial_category
ORDER BY p.name, n DESC;`,
    },
  ],
  appeals: [
    {
      label: "Appeal outcomes overall",
      sql: `SELECT outcome, COUNT(*) AS n
FROM appeals
GROUP BY outcome
ORDER BY n DESC;`,
    },
    {
      label: "Appeals per denial category",
      sql: `SELECT d.denial_category, COUNT(a.id) AS appeals
FROM appeals a
JOIN denials d ON a.denial_id = d.id
GROUP BY d.denial_category
ORDER BY appeals DESC;`,
    },
  ],
  payments: [
    {
      label: "Underpayment count by payer",
      sql: `SELECT p.name AS payer,
       SUM(CASE WHEN pm.is_underpayment = 'true' THEN 1 ELSE 0 END) AS underpayments,
       COUNT(*) AS total_payments
FROM payments pm
JOIN claims c ON pm.claim_id = c.id
JOIN payers p ON c.payer_id = p.id
GROUP BY p.name
ORDER BY underpayments DESC;`,
    },
    {
      label: "Average days to payment",
      sql: `SELECT ROUND(AVG(days_to_payment)::numeric, 1) AS avg_days,
       MAX(days_to_payment) AS max_days
FROM payments;`,
    },
  ],
  encounters: [
    {
      label: "Encounter type mix",
      sql: `SELECT encounter_type, COUNT(*) AS n
FROM encounters
GROUP BY encounter_type
ORDER BY n DESC;`,
    },
  ],
};
