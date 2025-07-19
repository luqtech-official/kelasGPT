-- Fix for "column reference customer_id is ambiguous" error
-- This replaces the validate_payment_consistency() function with explicit aliases

DROP FUNCTION IF EXISTS public.validate_payment_consistency();

CREATE FUNCTION public.validate_payment_consistency() 
RETURNS TABLE(
    customer_id uuid, 
    email_address text, 
    customer_status text, 
    order_status text, 
    order_number text, 
    is_consistent boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.customer_id AS customer_id,              -- Explicit alias for return column
        c.email_address AS email_address,
        c.payment_status::text AS customer_status,
        o.order_status::text AS order_status,
        o.order_number AS order_number,
        (c.payment_status::text = o.order_status) AS is_consistent
    FROM customers c
    INNER JOIN orders o ON (c.customer_id = o.customer_id)  -- Explicit parentheses
    WHERE c.payment_status::text != o.order_status
    ORDER BY c.created_at DESC;
END;
$$;

-- Test the function to ensure it works
-- SELECT * FROM validate_payment_consistency() LIMIT 5;