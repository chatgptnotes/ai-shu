-- Function to safely increment quota counters
CREATE OR REPLACE FUNCTION public.increment_quota_counter(
    p_subscription_id UUID,
    p_field VARCHAR,
    p_amount INTEGER
)
RETURNS void AS $$
BEGIN
    -- Dynamically update the specified field
    EXECUTE format('
        UPDATE public.usage_quotas
        SET %I = %I + $1
        WHERE subscription_id = $2
    ', p_field, p_field)
    USING p_amount, p_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.increment_quota_counter TO authenticated, service_role;
