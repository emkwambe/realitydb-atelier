// Quick-queries are exploration prompts, NOT exercise answers.
import type { CompanyQuickQueries } from "../novapay/quickQueries";

export const CLEARBANK_QUICK_QUERIES: CompanyQuickQueries = {
  customers: [
    {
      label: "Customer mix by type",
      sql: `SELECT customer_type, COUNT(*) AS customers
FROM customers
GROUP BY customer_type
ORDER BY customers DESC;`,
    },
    {
      label: "High-risk customers",
      sql: `SELECT id, customer_type, risk_rating, kyc_status, kyc_tier, edd_required
FROM customers
WHERE risk_rating = 'high'
ORDER BY kyc_status, id
LIMIT 25;`,
    },
    {
      label: "EDD required but not completed",
      sql: `SELECT id, customer_type, kyc_status, edd_required, edd_completed_date
FROM customers
WHERE edd_required = 'true' AND edd_completed_date IS NULL;`,
    },
  ],
  accounts: [
    {
      label: "Accounts by type and status",
      sql: `SELECT account_type, status, COUNT(*) AS accounts,
       ROUND(AVG(balance_usd)::numeric, 0) AS avg_balance
FROM accounts
GROUP BY account_type, status
ORDER BY account_type, accounts DESC;`,
    },
    {
      label: "Top balances",
      sql: `SELECT id, account_number, account_type, balance_usd
FROM accounts
ORDER BY balance_usd DESC
LIMIT 15;`,
    },
  ],
  wires: [
    {
      label: "Outgoing volume by destination country",
      sql: `SELECT destination_country, COUNT(*) AS wires,
       ROUND(SUM(amount_cents)::numeric / 100.0, 2) AS total_usd
FROM wires
WHERE direction = 'outgoing'
GROUP BY destination_country
ORDER BY wires DESC;`,
    },
    {
      label: "Sub-threshold wire share by purpose",
      sql: `SELECT purpose_code,
       COUNT(*) AS wires,
       SUM(CASE WHEN amount_cents < 950000 THEN 1 ELSE 0 END) AS sub_threshold,
       ROUND(
         SUM(CASE WHEN amount_cents < 950000 THEN 1 ELSE 0 END) * 100.0
         / NULLIF(COUNT(*), 0), 1
       ) AS sub_threshold_pct
FROM wires
WHERE direction = 'outgoing'
GROUP BY purpose_code
ORDER BY sub_threshold_pct DESC;`,
    },
    {
      label: "Wire status overview",
      sql: `SELECT status, direction, COUNT(*) AS wires
FROM wires
GROUP BY status, direction
ORDER BY wires DESC;`,
    },
    {
      label: "Top correspondent banks (outgoing)",
      sql: `SELECT correspondent_bank, COUNT(*) AS wires
FROM wires
WHERE direction = 'outgoing'
GROUP BY correspondent_bank
ORDER BY wires DESC;`,
    },
  ],
  fraud_alerts: [
    {
      label: "Alerts by type and severity",
      sql: `SELECT alert_type, severity, COUNT(*) AS alerts
FROM fraud_alerts
GROUP BY alert_type, severity
ORDER BY
  CASE WHEN severity = 'critical' THEN 0 WHEN severity = 'high' THEN 1 ELSE 2 END,
  alerts DESC;`,
    },
    {
      label: "Open critical alerts",
      sql: `SELECT id, account_id, alert_type, rule_triggered, detected_at
FROM fraud_alerts
WHERE severity = 'critical' AND status IN ('open','under_review')
ORDER BY detected_at DESC;`,
    },
    {
      label: "Rules most triggered",
      sql: `SELECT rule_triggered, COUNT(*) AS alerts
FROM fraud_alerts
GROUP BY rule_triggered
ORDER BY alerts DESC;`,
    },
  ],
  sar_filings: [
    {
      label: "SAR status mix",
      sql: `SELECT status, activity_type, COUNT(*) AS filings,
       ROUND(SUM(amount_cents)::numeric / 100.0, 2) AS total_usd
FROM sar_filings
GROUP BY status, activity_type
ORDER BY filings DESC;`,
    },
    {
      label: "Draft SARs (action needed)",
      sql: `SELECT id, account_id, activity_type, amount_cents, activity_start_date, activity_end_date
FROM sar_filings
WHERE status = 'draft'
ORDER BY activity_end_date DESC;`,
    },
  ],
  kyc_records: [
    {
      label: "Verification status mix",
      sql: `SELECT document_type, verification_status, COUNT(*) AS records
FROM kyc_records
GROUP BY document_type, verification_status
ORDER BY document_type, records DESC;`,
    },
    {
      label: "Unverified records",
      sql: `SELECT customer_id, document_type, verification_status, created_at
FROM kyc_records
WHERE verification_status IN ('pending','failed')
ORDER BY created_at ASC
LIMIT 25;`,
    },
  ],
  beneficial_owners: [
    {
      label: "Owners by country of residence",
      sql: `SELECT country_of_residence, COUNT(*) AS owners,
       SUM(CASE WHEN id_verified = 'false' THEN 1 ELSE 0 END) AS unverified
FROM beneficial_owners
GROUP BY country_of_residence
ORDER BY owners DESC;`,
    },
    {
      label: "Shared owner names (network risk)",
      sql: `SELECT owner_name, COUNT(DISTINCT customer_id) AS customers,
       MIN(country_of_residence) AS country
FROM beneficial_owners
GROUP BY owner_name
HAVING COUNT(DISTINCT customer_id) > 1
ORDER BY customers DESC
LIMIT 15;`,
    },
  ],
  transactions: [
    {
      label: "Transaction channel mix",
      sql: `SELECT channel, transaction_type, COUNT(*) AS txns
FROM transactions
GROUP BY channel, transaction_type
ORDER BY txns DESC;`,
    },
  ],
};
