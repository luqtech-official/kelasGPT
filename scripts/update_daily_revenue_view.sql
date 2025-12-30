-- Migration Script: Update Daily Revenue View to use Net Revenue (final_amount)
-- Maintains existing logic for time boundaries but fixes the revenue summation.

CREATE OR REPLACE VIEW public.daily_revenue_view AS
WITH
  date_series AS (
    SELECT
      target_date.target_date::date AS target_date,
      (
        SELECT malaysia_day_boundaries.day_start
        FROM malaysia_day_boundaries(target_date.target_date::date)
      ) AS day_start,
      (
        SELECT malaysia_day_boundaries.day_end
        FROM malaysia_day_boundaries(target_date.target_date::date)
      ) AS day_end,
      to_char(target_date.target_date::date::timestamp, 'Dy') AS day_short_name,
      (target_date.target_date::date = malaysia_current_date()) AS is_today
    FROM
      generate_series(
        malaysia_current_date() - '29 days'::interval,
        malaysia_current_date()::timestamp,
        '1 day'::interval
      ) target_date(target_date)
  ),
  daily_revenue AS (
    SELECT
      ds.target_date AS malaysia_date,
      ds.day_short_name,
      ds.is_today,
      -- FIX: Use final_amount if available (Net Revenue)
      COALESCE(sum(COALESCE(o.final_amount, o.total_amount)), 0) AS revenue,
      count(o.order_id) AS paid_orders_count
    FROM
      date_series ds
      LEFT JOIN orders o ON o.created_at >= ds.day_start
      AND o.created_at <= ds.day_end
      AND o.order_status = 'paid'
    GROUP BY
      ds.target_date,
      ds.day_short_name,
      ds.is_today
  )
SELECT
  malaysia_date,
  day_short_name,
  is_today,
  revenue,
  paid_orders_count,
  avg(revenue) OVER (
    ORDER BY malaysia_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS seven_day_avg_revenue,
  lag(revenue, 1) OVER (
    ORDER BY malaysia_date
  ) AS previous_day_revenue,
  sum(revenue) OVER (
    PARTITION BY date_trunc('month', malaysia_date::timestamp)
    ORDER BY malaysia_date
  ) AS month_to_date_revenue,
  CURRENT_TIMESTAMP AS last_updated
FROM
  daily_revenue
ORDER BY
  malaysia_date DESC;