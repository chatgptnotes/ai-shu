-- Feature Flags System
-- Allows gradual rollout and A/B testing of features

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  user_targeting JSONB DEFAULT '[]'::jsonb,
  environment TEXT DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production', 'all')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Feature flag user overrides (for testing specific users)
CREATE TABLE IF NOT EXISTS feature_flag_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id UUID REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(flag_id, user_id)
);

-- Feature flag analytics
CREATE TABLE IF NOT EXISTS feature_flag_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id UUID REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  enabled BOOLEAN NOT NULL,
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_environment ON feature_flags(environment);
CREATE INDEX IF NOT EXISTS idx_feature_flag_overrides_flag_user ON feature_flag_overrides(flag_id, user_id);
CREATE INDEX IF NOT EXISTS idx_feature_flag_analytics_flag ON feature_flag_analytics(flag_id);
CREATE INDEX IF NOT EXISTS idx_feature_flag_analytics_date ON feature_flag_analytics(evaluated_at);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_analytics ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read feature flags
CREATE POLICY "Anyone can read feature flags"
  ON feature_flags FOR SELECT
  USING (true);

-- Policies: Only admins can modify feature flags
CREATE POLICY "Only admins can insert feature flags"
  ON feature_flags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update feature flags"
  ON feature_flags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete feature flags"
  ON feature_flags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies: Users can read their own overrides
CREATE POLICY "Users can read their own overrides"
  ON feature_flag_overrides FOR SELECT
  USING (user_id = auth.uid());

-- Policies: Only admins can manage overrides
CREATE POLICY "Only admins can insert overrides"
  ON feature_flag_overrides FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update overrides"
  ON feature_flag_overrides FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete overrides"
  ON feature_flag_overrides FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies: Analytics are write-only for all, read by admins
CREATE POLICY "Anyone can insert analytics"
  ON feature_flag_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can read analytics"
  ON feature_flag_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default feature flags
INSERT INTO feature_flags (name, description, enabled, rollout_percentage, environment) VALUES
  ('teacher_dashboard', 'Enable teacher dashboard features', false, 0, 'production'),
  ('admin_panel', 'Enable admin panel access', false, 0, 'production'),
  ('ai_voice_mode', 'Enable AI voice interaction mode', true, 100, 'production'),
  ('video_sessions', 'Enable live video sessions with Agora', true, 100, 'production'),
  ('payment_system', 'Enable Stripe payment processing', false, 0, 'production'),
  ('whiteboard', 'Enable interactive whiteboard', true, 50, 'production'),
  ('session_recording', 'Enable session recording and replay', false, 0, 'production'),
  ('multi_language', 'Enable multi-language support (i18n)', false, 0, 'production'),
  ('advanced_analytics', 'Enable advanced learning analytics', false, 0, 'production'),
  ('mobile_app', 'Enable mobile app features', false, 0, 'production')
ON CONFLICT (name) DO NOTHING;
