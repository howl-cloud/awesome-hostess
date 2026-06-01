BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

CREATE TABLE IF NOT EXISTS business.customers (
  customer_id integer PRIMARY KEY,
  company_name text NOT NULL,
  segment text NOT NULL,
  region text NOT NULL,
  signup_date date NOT NULL,
  account_owner text NOT NULL
);

CREATE TABLE IF NOT EXISTS business.products (
  product_id integer PRIMARY KEY,
  product_name text NOT NULL,
  category text NOT NULL,
  unit_price numeric(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS business.orders (
  order_id integer PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES business.customers(customer_id),
  order_date date NOT NULL,
  sales_channel text NOT NULL,
  status text NOT NULL
);

CREATE TABLE IF NOT EXISTS business.order_items (
  order_id integer NOT NULL REFERENCES business.orders(order_id) ON DELETE CASCADE,
  product_id integer NOT NULL REFERENCES business.products(product_id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  discount_pct numeric(5,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (order_id, product_id)
);

CREATE TABLE IF NOT EXISTS business.support_tickets (
  ticket_id integer PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES business.customers(customer_id),
  opened_at timestamp NOT NULL,
  priority text NOT NULL,
  status text NOT NULL,
  issue_type text NOT NULL,
  resolution_hours numeric(6,2)
);

CREATE TABLE IF NOT EXISTS business.marketing_campaigns (
  campaign_id integer PRIMARY KEY,
  campaign_name text NOT NULL,
  channel text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  spend numeric(12,2) NOT NULL,
  attributed_revenue numeric(12,2) NOT NULL,
  leads integer NOT NULL
);

TRUNCATE TABLE
  business.order_items,
  business.orders,
  business.support_tickets,
  business.marketing_campaigns,
  business.products,
  business.customers;

INSERT INTO business.customers (customer_id, company_name, segment, region, signup_date, account_owner) VALUES
  (1, 'Northstar Retail', 'Mid-market', 'North America', DATE '2024-02-12', 'Maya Chen'),
  (2, 'Beacon Health Group', 'Enterprise', 'North America', DATE '2023-08-03', 'Maya Chen'),
  (3, 'Copperline Supply', 'SMB', 'North America', DATE '2025-01-18', 'Drew Patel'),
  (4, 'Atlas Manufacturing', 'Enterprise', 'Europe', DATE '2023-11-27', 'Riley Stone'),
  (5, 'Brightpath Learning', 'Mid-market', 'Europe', DATE '2024-06-04', 'Riley Stone'),
  (6, 'Harbor Foods', 'SMB', 'North America', DATE '2025-03-09', 'Drew Patel'),
  (7, 'Summit Logistics', 'Mid-market', 'Asia Pacific', DATE '2024-09-15', 'Lena Ortiz'),
  (8, 'Urban Grid Energy', 'Enterprise', 'Asia Pacific', DATE '2023-05-22', 'Lena Ortiz');

INSERT INTO business.products (product_id, product_name, category, unit_price) VALUES
  (101, 'Analytics Starter', 'Subscription', 299.00),
  (102, 'Analytics Pro', 'Subscription', 899.00),
  (103, 'Data Warehouse Connector', 'Integration', 249.00),
  (104, 'Priority Support', 'Support', 199.00),
  (105, 'Implementation Workshop', 'Services', 2500.00),
  (106, 'Executive Dashboard Pack', 'Services', 1500.00),
  (107, 'Security Audit Add-on', 'Compliance', 1200.00),
  (108, 'Advanced Forecasting', 'AI', 1750.00);

INSERT INTO business.orders (order_id, customer_id, order_date, sales_channel, status) VALUES
  (10001, 1, DATE '2026-01-08', 'Inside sales', 'paid'),
  (10002, 2, DATE '2026-01-19', 'Field sales', 'paid'),
  (10003, 4, DATE '2026-02-03', 'Partner', 'paid'),
  (10004, 3, DATE '2026-02-11', 'Self serve', 'paid'),
  (10005, 5, DATE '2026-02-24', 'Inside sales', 'paid'),
  (10006, 8, DATE '2026-03-04', 'Field sales', 'paid'),
  (10007, 7, DATE '2026-03-16', 'Partner', 'paid'),
  (10008, 6, DATE '2026-03-22', 'Self serve', 'paid'),
  (10009, 1, DATE '2026-04-02', 'Inside sales', 'paid'),
  (10010, 2, DATE '2026-04-14', 'Field sales', 'paid'),
  (10011, 5, DATE '2026-04-28', 'Inside sales', 'invoiced'),
  (10012, 8, DATE '2026-05-08', 'Field sales', 'paid'),
  (10013, 4, DATE '2026-05-13', 'Partner', 'invoiced'),
  (10014, 7, DATE '2026-05-21', 'Inside sales', 'paid');

INSERT INTO business.order_items (order_id, product_id, quantity, unit_price, discount_pct) VALUES
  (10001, 101, 3, 299.00, 0),
  (10001, 103, 2, 249.00, 5),
  (10002, 102, 8, 899.00, 12),
  (10002, 105, 1, 2500.00, 10),
  (10002, 107, 1, 1200.00, 0),
  (10003, 102, 6, 899.00, 15),
  (10003, 106, 2, 1500.00, 8),
  (10004, 101, 1, 299.00, 0),
  (10005, 102, 3, 899.00, 5),
  (10005, 104, 3, 199.00, 0),
  (10006, 102, 10, 899.00, 18),
  (10006, 108, 2, 1750.00, 10),
  (10007, 101, 5, 299.00, 0),
  (10007, 103, 4, 249.00, 5),
  (10008, 101, 2, 299.00, 0),
  (10009, 104, 3, 199.00, 0),
  (10009, 106, 1, 1500.00, 5),
  (10010, 108, 3, 1750.00, 12),
  (10010, 107, 1, 1200.00, 0),
  (10011, 102, 4, 899.00, 8),
  (10011, 105, 1, 2500.00, 0),
  (10012, 102, 10, 899.00, 20),
  (10012, 103, 6, 249.00, 10),
  (10013, 107, 2, 1200.00, 5),
  (10013, 108, 1, 1750.00, 0),
  (10014, 104, 5, 199.00, 0),
  (10014, 106, 1, 1500.00, 0);

INSERT INTO business.support_tickets (ticket_id, customer_id, opened_at, priority, status, issue_type, resolution_hours) VALUES
  (5001, 1, TIMESTAMP '2026-01-11 09:34:00', 'medium', 'resolved', 'Dashboard configuration', 6.5),
  (5002, 2, TIMESTAMP '2026-01-28 14:12:00', 'high', 'resolved', 'SSO setup', 18.0),
  (5003, 4, TIMESTAMP '2026-02-08 08:45:00', 'low', 'resolved', 'Billing question', 2.0),
  (5004, 3, TIMESTAMP '2026-02-19 11:20:00', 'medium', 'resolved', 'Connector timeout', 9.0),
  (5005, 8, TIMESTAMP '2026-03-07 16:10:00', 'high', 'resolved', 'Forecast model import', 22.5),
  (5006, 7, TIMESTAMP '2026-03-19 13:03:00', 'medium', 'resolved', 'User provisioning', 5.0),
  (5007, 6, TIMESTAMP '2026-04-01 10:25:00', 'low', 'resolved', 'Report export', 3.0),
  (5008, 2, TIMESTAMP '2026-04-18 15:50:00', 'medium', 'open', 'API rate limit', NULL),
  (5009, 5, TIMESTAMP '2026-05-02 12:05:00', 'high', 'resolved', 'Slow dashboard', 14.0),
  (5010, 8, TIMESTAMP '2026-05-16 09:10:00', 'critical', 'open', 'Production data sync', NULL),
  (5011, 4, TIMESTAMP '2026-05-24 17:32:00', 'medium', 'open', 'Access review', NULL);

INSERT INTO business.marketing_campaigns (campaign_id, campaign_name, channel, start_date, end_date, spend, attributed_revenue, leads) VALUES
  (9001, 'Q1 Pipeline Refresh', 'Email', DATE '2026-01-05', DATE '2026-01-31', 4200.00, 18500.00, 214),
  (9002, 'Retail Analytics Webinar', 'Webinar', DATE '2026-02-01', DATE '2026-02-21', 7800.00, 32600.00, 168),
  (9003, 'Partner Marketplace Push', 'Partner', DATE '2026-03-01', DATE '2026-03-31', 12250.00, 54100.00, 119),
  (9004, 'Executive Dashboard Trial', 'Paid search', DATE '2026-04-03', DATE '2026-04-28', 9350.00, 40150.00, 241),
  (9005, 'Forecasting Launch', 'Paid social', DATE '2026-05-01', DATE '2026-05-25', 15100.00, 67200.00, 287);

CREATE OR REPLACE VIEW business.order_summary AS
SELECT
  o.order_id,
  o.order_date,
  o.status,
  o.sales_channel,
  c.company_name,
  c.segment,
  c.region,
  sum(oi.quantity * oi.unit_price * (1 - oi.discount_pct / 100.0))::numeric(12,2) AS order_revenue
FROM business.orders o
JOIN business.customers c ON c.customer_id = o.customer_id
JOIN business.order_items oi ON oi.order_id = o.order_id
GROUP BY o.order_id, o.order_date, o.status, o.sales_channel, c.company_name, c.segment, c.region;

CREATE OR REPLACE VIEW business.customer_lifetime_value AS
WITH revenue_by_customer AS (
  SELECT
    o.customer_id,
    count(DISTINCT o.order_id) AS order_count,
    sum(oi.quantity * oi.unit_price * (1 - oi.discount_pct / 100.0))::numeric(12,2) AS lifetime_value
  FROM business.orders o
  JOIN business.order_items oi ON oi.order_id = o.order_id
  GROUP BY o.customer_id
),
open_tickets_by_customer AS (
  SELECT
    customer_id,
    count(*) AS open_tickets
  FROM business.support_tickets
  WHERE status = 'open'
  GROUP BY customer_id
)
SELECT
  c.customer_id,
  c.company_name,
  c.segment,
  c.region,
  c.account_owner,
  COALESCE(r.order_count, 0) AS order_count,
  COALESCE(r.lifetime_value, 0)::numeric(12,2) AS lifetime_value,
  COALESCE(t.open_tickets, 0) AS open_tickets
FROM business.customers c
LEFT JOIN revenue_by_customer r ON r.customer_id = c.customer_id
LEFT JOIN open_tickets_by_customer t ON t.customer_id = c.customer_id;

COMMIT;
