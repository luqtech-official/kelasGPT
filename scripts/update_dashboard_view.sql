-- Migration Script: Update Dashboard View to use Net Revenue (final_amount)
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE VIEW public.dashboard_summary_view AS
WITH
  malaysia_boundaries AS (
    SELECT
      (SELECT day_start FROM malaysia_day_boundaries() LIMIT 1) AS today_start,
      (SELECT day_end FROM malaysia_day_boundaries() LIMIT 1) AS today_end,
      (SELECT day_start FROM malaysia_day_boundaries(malaysia_current_date() - 1) LIMIT 1) AS yesterday_start,
      (SELECT day_end FROM malaysia_day_boundaries(malaysia_current_date() - 1) LIMIT 1) AS yesterday_end,
      (SELECT day_start FROM malaysia_day_boundaries(malaysia_current_date() - 7) LIMIT 1) AS week_start,
      (SELECT day_end FROM malaysia_day_boundaries(malaysia_current_date() - 7) LIMIT 1) AS week_end
  ),
  month_boundaries AS (
    SELECT
      (SELECT day_start FROM malaysia_day_boundaries(date_trunc('month', malaysia_current_date()::timestamp)::date) LIMIT 1) AS current_month_start,
      (SELECT day_start FROM malaysia_day_boundaries((date_trunc('month', malaysia_current_date()::timestamp) + '1 mon'::interval)::date) LIMIT 1) AS current_month_end,
      (SELECT day_start FROM malaysia_day_boundaries(date_trunc('month', malaysia_current_date() - '1 mon'::interval)::date) LIMIT 1) AS prev_month_start,
      (SELECT day_start FROM malaysia_day_boundaries(date_trunc('month', malaysia_current_date()::timestamp)::date) LIMIT 1) AS prev_month_end
  ),
  customer_metrics AS (
    SELECT
      count(*) AS total_customers,
      count(*) FILTER (WHERE customers.created_at >= (SELECT today_start FROM malaysia_boundaries) AND customers.created_at <= (SELECT today_end FROM malaysia_boundaries)) AS today_customers,
      count(*) FILTER (WHERE customers.created_at >= (SELECT yesterday_start FROM malaysia_boundaries) AND customers.created_at <= (SELECT yesterday_end FROM malaysia_boundaries)) AS yesterday_customers,
      count(*) FILTER (WHERE customers.created_at >= (SELECT week_start FROM malaysia_boundaries) AND customers.created_at <= (SELECT week_end FROM malaysia_boundaries)) AS last_week_customers,
      count(*) FILTER (WHERE customers.payment_status = 'paid') AS total_paid_customers,
      count(*) FILTER (WHERE customers.payment_status = 'paid' AND customers.created_at >= (SELECT today_start FROM malaysia_boundaries) AND customers.created_at <= (SELECT today_end FROM malaysia_boundaries)) AS today_paid_customers,
      count(*) FILTER (WHERE customers.payment_status = 'pending') AS pending_customers,
      count(*) FILTER (WHERE customers.payment_status = 'failed') AS failed_customers
    FROM customers
  ),
  revenue_metrics AS (
    SELECT
      -- CHANGED: Use COALESCE(final_amount, total_amount) to support Net Revenue
      COALESCE(sum(CASE WHEN orders.order_status = 'paid' THEN COALESCE(orders.final_amount, orders.total_amount) ELSE NULL END), 0) AS total_revenue,
      COALESCE(sum(CASE WHEN orders.order_status = 'paid' AND orders.created_at >= (SELECT today_start FROM malaysia_boundaries) AND orders.created_at <= (SELECT today_end FROM malaysia_boundaries) THEN COALESCE(orders.final_amount, orders.total_amount) ELSE NULL END), 0) AS today_revenue,
      COALESCE(sum(CASE WHEN orders.order_status = 'paid' AND orders.created_at >= (SELECT yesterday_start FROM malaysia_boundaries) AND orders.created_at <= (SELECT yesterday_end FROM malaysia_boundaries) THEN COALESCE(orders.final_amount, orders.total_amount) ELSE NULL END), 0) AS yesterday_revenue,
      COALESCE(sum(CASE WHEN orders.order_status = 'paid' AND orders.created_at >= (SELECT current_month_start FROM month_boundaries) AND orders.created_at < (SELECT current_month_end FROM month_boundaries) THEN COALESCE(orders.final_amount, orders.total_amount) ELSE NULL END), 0) AS current_month_revenue,
      COALESCE(sum(CASE WHEN orders.order_status = 'paid' AND orders.created_at >= (SELECT prev_month_start FROM month_boundaries) AND orders.created_at < (SELECT prev_month_end FROM month_boundaries) THEN COALESCE(orders.final_amount, orders.total_amount) ELSE NULL END), 0) AS previous_month_revenue
    FROM orders
  ),
  analytics_metrics AS (
    SELECT
      COALESCE(analytics_current.landing_total_visits, 0) AS today_total_visits,
      COALESCE(analytics_current.landing_unique_visitors, 0) AS today_unique_visitors,
      COALESCE(analytics_current.checkout_total_visits, 0) AS today_checkout_visits,
      COALESCE(analytics_current.checkout_unique_visitors, 0) AS today_checkout_unique_visitors,
      COALESCE(analytics_current.conversion_rate, 0) AS analytics_conversion_rate
    FROM analytics_current
    WHERE analytics_current.date = malaysia_current_date()
    LIMIT 1
  )
SELECT
  cm.total_customers,
  cm.today_customers,
  cm.yesterday_customers,
  cm.last_week_customers,
  cm.total_paid_customers,
  cm.today_paid_customers,
  cm.pending_customers,
  cm.failed_customers,
  rm.total_revenue,
  rm.today_revenue,
  rm.yesterday_revenue,
  rm.current_month_revenue,
  rm.previous_month_revenue,
  am.today_total_visits,
  am.today_unique_visitors,
  am.today_checkout_visits,
  am.today_checkout_unique_visitors,
  am.analytics_conversion_rate,
  CASE WHEN cm.total_customers > 0 THEN round(cm.total_paid_customers::numeric / cm.total_customers::numeric * 100, 2) ELSE 0 END AS conversion_rate_percent,
  CASE WHEN am.today_unique_visitors > 0 THEN round(am.today_checkout_unique_visitors::numeric / am.today_unique_visitors::numeric * 100, 1) ELSE 0 END AS sales_ctr_percent,
  CASE WHEN rm.yesterday_revenue > 0 THEN round((rm.today_revenue - rm.yesterday_revenue) / rm.yesterday_revenue * 100, 1) ELSE 0 END AS daily_revenue_change_percent,
  CASE WHEN rm.previous_month_revenue > 0 THEN round((rm.current_month_revenue - rm.previous_month_revenue) / rm.previous_month_revenue * 100, 1) ELSE 0 END AS monthly_revenue_change_percent,
  CASE WHEN cm.last_week_customers > 0 THEN round((cm.today_customers - cm.last_week_customers)::numeric / cm.last_week_customers::numeric * 100, 1) ELSE 0 END AS weekly_growth_percent,
  CURRENT_TIMESTAMP AS last_updated,
  malaysia_current_date() AS malaysia_date
FROM customer_metrics cm
CROSS JOIN revenue_metrics rm
CROSS JOIN analytics_metrics am;
