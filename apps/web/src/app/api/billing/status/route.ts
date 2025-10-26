import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription with quota info
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        tier,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        canceled_at,
        trial_end,
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
      .eq('user_id', user.id)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      // PGRST116 is "not found", which is okay
      throw subError;
    }

    // Get recent invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get usage stats for current period
    const periodStart = subscription?.current_period_start
      ? new Date(subscription.current_period_start)
      : new Date(new Date().setDate(1)); // First of month

    const { data: usageRecords } = await supabase
      .from('usage_records')
      .select('resource_type, quantity, cost_usd, recorded_at')
      .eq('user_id', user.id)
      .gte('recorded_at', periodStart.toISOString());

    return NextResponse.json({
      subscription: subscription || null,
      invoices: invoices || [],
      usage: usageRecords || [],
    });
  } catch (error) {
    console.error('Billing status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing status' },
      { status: 500 }
    );
  }
}
