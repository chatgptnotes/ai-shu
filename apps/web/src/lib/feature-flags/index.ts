/**
 * Feature Flags System
 * Enables gradual rollout, A/B testing, and feature toggling
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rollout_percentage: number;
  user_targeting: string[];
  environment: 'development' | 'staging' | 'production' | 'all';
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagOverride {
  id: string;
  flag_id: string;
  user_id: string;
  enabled: boolean;
  created_at: string;
}

/**
 * Feature flag names (centralized enum for type safety)
 */
export enum FeatureFlags {
  TEACHER_DASHBOARD = 'teacher_dashboard',
  ADMIN_PANEL = 'admin_panel',
  AI_VOICE_MODE = 'ai_voice_mode',
  VIDEO_SESSIONS = 'video_sessions',
  PAYMENT_SYSTEM = 'payment_system',
  WHITEBOARD = 'whiteboard',
  SESSION_RECORDING = 'session_recording',
  MULTI_LANGUAGE = 'multi_language',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  MOBILE_APP = 'mobile_app',
}

/**
 * Feature flags service
 */
export class FeatureFlagsService {
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
  }

  /**
   * Check if a feature flag is enabled for a user
   */
  async isEnabled(flagName: string, userId?: string): Promise<boolean> {
    try {
      const supabase = await createClient();

      // Check for user-specific override first
      if (userId) {
        const { data: override } = await supabase
          .from('feature_flag_overrides')
          .select('enabled')
          .eq('user_id', userId)
          .eq('flag_id', (
            await supabase
              .from('feature_flags')
              .select('id')
              .eq('name', flagName)
              .single()
          ).data?.id || '')
          .single();

        if (override) {
          this.trackEvaluation(flagName, userId, override.enabled);
          return override.enabled;
        }
      }

      // Get feature flag
      const { data: flag, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('name', flagName)
        .single();

      if (error || !flag) {
        logger.warn(`Feature flag not found: ${flagName}`, { flagName });
        return false;
      }

      // Check environment
      if (flag.environment !== 'all' && flag.environment !== this.environment) {
        return false;
      }

      // If flag is globally disabled, return false
      if (!flag.enabled) {
        this.trackEvaluation(flagName, userId, false);
        return false;
      }

      // Check rollout percentage
      if (flag.rollout_percentage === 100) {
        this.trackEvaluation(flagName, userId, true);
        return true;
      }

      if (flag.rollout_percentage === 0) {
        this.trackEvaluation(flagName, userId, false);
        return false;
      }

      // Percentage-based rollout with consistent hashing
      const isInRollout = userId
        ? this.hashUserId(userId, flagName) < flag.rollout_percentage
        : Math.random() * 100 < flag.rollout_percentage;

      this.trackEvaluation(flagName, userId, isInRollout);
      return isInRollout;
    } catch (error) {
      logger.error('Error checking feature flag', { flagName, userId }, error as Error);
      return false; // Fail closed - safer to disable features on error
    }
  }

  /**
   * Get all feature flags
   */
  async getAllFlags(): Promise<FeatureFlag[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name');

      if (error) {
        logger.error('Error fetching feature flags', {}, error as Error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error fetching all feature flags', {}, error as Error);
      return [];
    }
  }

  /**
   * Get feature flags for a specific user
   */
  async getUserFlags(userId: string): Promise<Record<string, boolean>> {
    try {
      const flags = await this.getAllFlags();
      const results: Record<string, boolean> = {};

      for (const flag of flags) {
        results[flag.name] = await this.isEnabled(flag.name, userId);
      }

      return results;
    } catch (error) {
      logger.error('Error getting user flags', { userId }, error as Error);
      return {};
    }
  }

  /**
   * Create or update a feature flag
   */
  async setFlag(
    name: string,
    data: {
      description?: string;
      enabled?: boolean;
      rollout_percentage?: number;
      environment?: string;
    },
    adminUserId: string
  ): Promise<FeatureFlag | null> {
    try {
      const supabase = await createClient();

      const { data: flag, error } = await supabase
        .from('feature_flags')
        .upsert({
          name,
          ...data,
          updated_by: adminUserId,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error setting feature flag', { name, data }, error as Error);
        return null;
      }

      logger.info('Feature flag updated', { name, data, adminUserId });
      return flag;
    } catch (error) {
      logger.error('Error setting feature flag', { name, data }, error as Error);
      return null;
    }
  }

  /**
   * Set user-specific override
   */
  async setUserOverride(
    flagName: string,
    userId: string,
    enabled: boolean,
    adminUserId: string
  ): Promise<boolean> {
    try {
      const supabase = await createClient();

      // Get flag ID
      const { data: flag } = await supabase
        .from('feature_flags')
        .select('id')
        .eq('name', flagName)
        .single();

      if (!flag) {
        logger.warn('Cannot set override - flag not found', { flagName });
        return false;
      }

      const { error } = await supabase
        .from('feature_flag_overrides')
        .upsert({
          flag_id: flag.id,
          user_id: userId,
          enabled,
          created_by: adminUserId,
        });

      if (error) {
        logger.error('Error setting user override', { flagName, userId }, error as Error);
        return false;
      }

      logger.info('User override set', { flagName, userId, enabled, adminUserId });
      return true;
    } catch (error) {
      logger.error('Error setting user override', { flagName, userId }, error as Error);
      return false;
    }
  }

  /**
   * Remove user-specific override
   */
  async removeUserOverride(flagName: string, userId: string): Promise<boolean> {
    try {
      const supabase = await createClient();

      // Get flag ID
      const { data: flag } = await supabase
        .from('feature_flags')
        .select('id')
        .eq('name', flagName)
        .single();

      if (!flag) {
        return false;
      }

      const { error } = await supabase
        .from('feature_flag_overrides')
        .delete()
        .eq('flag_id', flag.id)
        .eq('user_id', userId);

      if (error) {
        logger.error('Error removing user override', { flagName, userId }, error as Error);
        return false;
      }

      logger.info('User override removed', { flagName, userId });
      return true;
    } catch (error) {
      logger.error('Error removing user override', { flagName, userId }, error as Error);
      return false;
    }
  }

  /**
   * Track feature flag evaluation (for analytics)
   */
  private async trackEvaluation(flagName: string, userId: string | undefined, enabled: boolean): Promise<void> {
    // Fire and forget - don't block on analytics
    try {
      const supabase = await createClient();

      // Get flag ID
      const { data: flag } = await supabase
        .from('feature_flags')
        .select('id')
        .eq('name', flagName)
        .single();

      if (!flag) return;

      await supabase.from('feature_flag_analytics').insert({
        flag_id: flag.id,
        user_id: userId || null,
        enabled,
      });
    } catch {
      // Silently fail - analytics shouldn't break functionality
    }
  }

  /**
   * Hash user ID for consistent percentage-based rollout
   */
  private hashUserId(userId: string, flagName: string): number {
    // Simple hash function for consistent percentage assignment
    const str = `${userId}:${flagName}`;
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to 0-100 range
    return Math.abs(hash) % 100;
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagsService();
