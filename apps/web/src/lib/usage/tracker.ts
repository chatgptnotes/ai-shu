/**
 * Usage Tracking System
 * Records API usage and enforces subscription limits
 */

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type ServiceType =
  | 'did_avatar'
  | 'elevenlabs_tts'
  | 'agora_video'
  | 'openai_chat';

export type ResourceType =
  | 'video_generation'
  | 'audio_generation'
  | 'video_minutes'
  | 'tokens'
  | 'session'
  | 'whiteboard_export';

export interface UsageRecord {
  userId: string;
  service: ServiceType;
  resourceType: ResourceType;
  quantity: number;
  costUsd?: number;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface QuotaStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetDate: Date;
  tier: string;
}

/**
 * Record API usage
 */
export async function recordUsage(record: UsageRecord): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    // Get user's subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', record.userId)
      .eq('status', 'active')
      .single();

    // Insert usage record
    await supabaseAdmin.from('usage_records').insert({
      user_id: record.userId,
      subscription_id: subscription?.id || null,
      service: record.service,
      resource_type: record.resourceType,
      quantity: record.quantity,
      cost_usd: record.costUsd || 0,
      session_id: record.sessionId || null,
      metadata: record.metadata || {},
    });

    // Update quota counters if there's an active subscription
    if (subscription) {
      await updateQuotaCounters(subscription.id, record.resourceType, record.quantity);
    }

    console.log(`Usage recorded: ${record.service} - ${record.resourceType} (${record.quantity})`);
  } catch (error) {
    console.error('Failed to record usage:', error);
    // Don't throw - usage tracking shouldn't break the main flow
  }
}

/**
 * Update quota counters
 */
async function updateQuotaCounters(
  subscriptionId: string,
  resourceType: ResourceType,
  quantity: number
): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const fieldMap: Record<ResourceType, string> = {
    session: 'current_sessions',
    video_minutes: 'current_video_minutes',
    video_generation: 'current_avatar_generations',
    audio_generation: 'current_avatar_generations',
    whiteboard_export: 'current_whiteboard_exports',
    tokens: 'current_sessions', // Count token usage towards sessions
  };

  const field = fieldMap[resourceType];
  if (!field) return;

  await supabaseAdmin.rpc('increment_quota_counter', {
    p_subscription_id: subscriptionId,
    p_field: field,
    p_amount: quantity,
  });
}

/**
 * Check if user has quota available
 */
export async function checkQuota(
  userId: string,
  resourceType: ResourceType
): Promise<QuotaStatus> {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    // Get user's subscription with quota
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        id,
        tier,
        status,
        usage_quotas (
          max_sessions_per_month,
          max_video_minutes_per_month,
          max_avatar_generations_per_month,
          max_whiteboard_exports_per_month,
          current_sessions,
          current_video_minutes,
          current_avatar_generations,
          current_whiteboard_exports,
          next_reset_at
        )
      `)
      .eq('user_id', userId)
      .single();

    // No subscription or inactive - allow limited access
    if (!subscription || subscription.status !== 'active') {
      return {
        allowed: true, // Allow with warnings, but track usage
        remaining: 0,
        limit: 0,
        resetDate: new Date(),
        tier: 'none',
      };
    }

    const quota = subscription.usage_quotas?.[0];
    if (!quota) {
      return {
        allowed: true,
        remaining: 0,
        limit: 0,
        resetDate: new Date(),
        tier: subscription.tier,
      };
    }

    // Map resource type to quota fields
    const quotaMap: Record<
      ResourceType,
      { max: keyof typeof quota; current: keyof typeof quota }
    > = {
      session: { max: 'max_sessions_per_month', current: 'current_sessions' },
      video_minutes: {
        max: 'max_video_minutes_per_month',
        current: 'current_video_minutes',
      },
      video_generation: {
        max: 'max_avatar_generations_per_month',
        current: 'current_avatar_generations',
      },
      audio_generation: {
        max: 'max_avatar_generations_per_month',
        current: 'current_avatar_generations',
      },
      whiteboard_export: {
        max: 'max_whiteboard_exports_per_month',
        current: 'current_whiteboard_exports',
      },
      tokens: { max: 'max_sessions_per_month', current: 'current_sessions' },
    };

    const mapping = quotaMap[resourceType];
    if (!mapping) {
      return {
        allowed: true,
        remaining: 0,
        limit: 0,
        resetDate: new Date(quota.next_reset_at),
        tier: subscription.tier,
      };
    }

    const limit = quota[mapping.max] as number;
    const current = quota[mapping.current] as number;

    // -1 means unlimited
    const unlimited = limit === -1;
    const remaining = unlimited ? Infinity : Math.max(0, limit - current);
    const allowed = unlimited || current < limit;

    return {
      allowed,
      remaining: unlimited ? -1 : remaining,
      limit: unlimited ? -1 : limit,
      resetDate: new Date(quota.next_reset_at),
      tier: subscription.tier,
    };
  } catch (error) {
    console.error('Failed to check quota:', error);
    // On error, allow but log
    return {
      allowed: true,
      remaining: 0,
      limit: 0,
      resetDate: new Date(),
      tier: 'error',
    };
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(
  userId: string,
  periodStart?: Date,
  periodEnd?: Date
): Promise<{
  sessions: number;
  videoMinutes: number;
  avatarGenerations: number;
  whiteboardExports: number;
  totalCost: number;
}> {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    let query = supabaseAdmin
      .from('usage_records')
      .select('resource_type, quantity, cost_usd')
      .eq('user_id', userId);

    if (periodStart) {
      query = query.gte('recorded_at', periodStart.toISOString());
    }
    if (periodEnd) {
      query = query.lte('recorded_at', periodEnd.toISOString());
    }

    const { data: records } = await query;

    if (!records) {
      return {
        sessions: 0,
        videoMinutes: 0,
        avatarGenerations: 0,
        whiteboardExports: 0,
        totalCost: 0,
      };
    }

    const stats = {
      sessions: 0,
      videoMinutes: 0,
      avatarGenerations: 0,
      whiteboardExports: 0,
      totalCost: 0,
    };

    records.forEach((record) => {
      switch (record.resource_type) {
        case 'session':
          stats.sessions += Number(record.quantity);
          break;
        case 'video_minutes':
          stats.videoMinutes += Number(record.quantity);
          break;
        case 'video_generation':
        case 'audio_generation':
          stats.avatarGenerations += Number(record.quantity);
          break;
        case 'whiteboard_export':
          stats.whiteboardExports += Number(record.quantity);
          break;
      }
      stats.totalCost += Number(record.cost_usd || 0);
    });

    return stats;
  } catch (error) {
    console.error('Failed to get usage stats:', error);
    return {
      sessions: 0,
      videoMinutes: 0,
      avatarGenerations: 0,
      whiteboardExports: 0,
      totalCost: 0,
    };
  }
}

/**
 * Middleware helper to track and enforce quotas
 */
export async function enforceQuota(
  userId: string,
  resourceType: ResourceType
): Promise<{ allowed: boolean; status: QuotaStatus }> {
  const status = await checkQuota(userId, resourceType);
  return { allowed: status.allowed, status };
}
