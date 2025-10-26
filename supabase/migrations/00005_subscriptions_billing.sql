-- Subscriptions and Billing Schema
-- Handles Stripe integration, subscription management, and usage tracking

-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');

-- Create enum for subscription tiers
CREATE TYPE subscription_tier AS ENUM ('basic', 'premium', 'school', 'enterprise');

-- Stripe customers table
CREATE TABLE public.stripe_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    stripe_customer_id UUID NOT NULL REFERENCES public.stripe_customers(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_price_id VARCHAR(255) NOT NULL,
    tier subscription_tier NOT NULL,
    status subscription_status NOT NULL DEFAULT 'incomplete',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Usage tracking table
CREATE TABLE public.usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    service VARCHAR(50) NOT NULL, -- 'did_avatar', 'elevenlabs_tts', 'agora_video', 'openai_chat'
    resource_type VARCHAR(50) NOT NULL, -- 'video_generation', 'audio_generation', 'video_minutes', 'tokens'
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cost_usd DECIMAL(10, 4) DEFAULT 0,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices table (synced from Stripe)
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_customer_id UUID NOT NULL REFERENCES public.stripe_customers(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    amount_due INTEGER NOT NULL, -- in cents
    amount_paid INTEGER NOT NULL DEFAULT 0, -- in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    status VARCHAR(50) NOT NULL, -- 'draft', 'open', 'paid', 'uncollectible', 'void'
    invoice_pdf VARCHAR(500),
    hosted_invoice_url VARCHAR(500),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- Payment methods table
CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    stripe_customer_id UUID NOT NULL REFERENCES public.stripe_customers(id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- 'card', 'bank_account', etc.
    card_brand VARCHAR(50), -- 'visa', 'mastercard', etc.
    card_last4 VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage quotas table (for rate limiting)
CREATE TABLE public.usage_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL,
    -- Monthly limits
    max_sessions_per_month INTEGER NOT NULL,
    max_video_minutes_per_month INTEGER NOT NULL,
    max_avatar_generations_per_month INTEGER NOT NULL,
    max_whiteboard_exports_per_month INTEGER NOT NULL,
    -- Current usage (resets monthly)
    current_sessions INTEGER DEFAULT 0,
    current_video_minutes INTEGER DEFAULT 0,
    current_avatar_generations INTEGER DEFAULT 0,
    current_whiteboard_exports INTEGER DEFAULT 0,
    -- Reset tracking
    last_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_reset_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(subscription_id)
);

-- Subscription tier pricing (for reference)
CREATE TABLE public.subscription_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier subscription_tier NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly_usd DECIMAL(10, 2) NOT NULL,
    price_yearly_usd DECIMAL(10, 2),
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    -- Features
    max_sessions_per_month INTEGER NOT NULL,
    max_video_minutes_per_month INTEGER NOT NULL,
    max_avatar_generations_per_month INTEGER NOT NULL,
    max_whiteboard_exports_per_month INTEGER NOT NULL,
    supports_multiple_students BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    custom_branding BOOLEAN DEFAULT FALSE,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default pricing tiers
INSERT INTO public.subscription_pricing (tier, name, description, price_monthly_usd, price_yearly_usd, max_sessions_per_month, max_video_minutes_per_month, max_avatar_generations_per_month, max_whiteboard_exports_per_month, supports_multiple_students, priority_support, features) VALUES
('basic', 'Basic', 'Perfect for individual students getting started', 49.00, 490.00, 30, 300, 300, 100, FALSE, FALSE, '["AI Avatar Tutor", "Live Video Sessions", "Interactive Whiteboard", "Chat History", "Session Recording"]'),
('premium', 'Premium', 'Best for serious learners with intensive needs', 99.00, 990.00, 100, 1000, 1000, 500, FALSE, TRUE, '["Everything in Basic", "Unlimited Sessions", "Priority Support", "Advanced Analytics", "Parent Dashboard", "Custom Learning Plans"]'),
('school', 'School', 'Designed for classrooms and institutions', 499.00, 4990.00, 1000, 10000, 10000, 5000, TRUE, TRUE, '["Everything in Premium", "Up to 50 Students", "Teacher Dashboard", "Admin Panel", "Bulk Student Management", "Custom Curriculum", "Dedicated Support"]'),
('enterprise', 'Enterprise', 'Custom solutions for large organizations', 0.00, 0.00, -1, -1, -1, -1, TRUE, TRUE, '["Everything in School", "Unlimited Students", "White Label", "Custom Integration", "SLA", "Dedicated Account Manager"]');

-- Create indexes
CREATE INDEX idx_stripe_customers_user_id ON public.stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_id ON public.stripe_customers(stripe_customer_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX idx_usage_records_session_id ON public.usage_records(session_id);
CREATE INDEX idx_usage_records_recorded_at ON public.usage_records(recorded_at);
CREATE INDEX idx_usage_records_service ON public.usage_records(service);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_stripe_id ON public.invoices(stripe_invoice_id);
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_usage_quotas_subscription_id ON public.usage_quotas(subscription_id);

-- Apply updated_at triggers
CREATE TRIGGER update_stripe_customers_updated_at BEFORE UPDATE ON public.stripe_customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_usage_quotas_updated_at BEFORE UPDATE ON public.usage_quotas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscription_pricing_updated_at BEFORE UPDATE ON public.subscription_pricing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to reset usage quotas monthly
CREATE OR REPLACE FUNCTION public.reset_usage_quotas()
RETURNS void AS $$
BEGIN
    UPDATE public.usage_quotas
    SET
        current_sessions = 0,
        current_video_minutes = 0,
        current_avatar_generations = 0,
        current_whiteboard_exports = 0,
        last_reset_at = NOW(),
        next_reset_at = NOW() + INTERVAL '1 month'
    WHERE next_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has exceeded quota
CREATE OR REPLACE FUNCTION public.check_usage_quota(
    p_subscription_id UUID,
    p_resource_type VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_quota usage_quotas%ROWTYPE;
    v_exceeded BOOLEAN := FALSE;
BEGIN
    SELECT * INTO v_quota FROM public.usage_quotas WHERE subscription_id = p_subscription_id;

    IF NOT FOUND THEN
        RETURN FALSE; -- No quota record, allow usage
    END IF;

    CASE p_resource_type
        WHEN 'session' THEN
            v_exceeded := v_quota.current_sessions >= v_quota.max_sessions_per_month AND v_quota.max_sessions_per_month != -1;
        WHEN 'video_minutes' THEN
            v_exceeded := v_quota.current_video_minutes >= v_quota.max_video_minutes_per_month AND v_quota.max_video_minutes_per_month != -1;
        WHEN 'avatar_generation' THEN
            v_exceeded := v_quota.current_avatar_generations >= v_quota.max_avatar_generations_per_month AND v_quota.max_avatar_generations_per_month != -1;
        WHEN 'whiteboard_export' THEN
            v_exceeded := v_quota.current_whiteboard_exports >= v_quota.max_whiteboard_exports_per_month AND v_quota.max_whiteboard_exports_per_month != -1;
    END CASE;

    RETURN v_exceeded;
END;
$$ LANGUAGE plpgsql;
