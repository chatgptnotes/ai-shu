/**
 * Admin Stats API - System statistics and metrics
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';

/**
 * Check if user is admin
 */
async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  return profile?.role === 'admin';
}

/**
 * GET /api/admin/stats
 * Get system statistics (admin only)
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimiters.api.check(identifier);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminCheck = await isAdmin(supabase, user.id);
    if (!adminCheck) {
      logger.warn('Non-admin attempted to access admin stats API', {
        route: '/api/admin/stats',
        userId: user.id,
      });

      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get various statistics in parallel
    const [
      { count: totalUsers },
      { count: totalSessions },
      { count: activeSubscriptions },
      { count: totalClasses },
      { count: totalAssignments },
    ] = await Promise.all([
      supabase.from('student_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('sessions').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('assignments').select('*', { count: 'exact', head: true }),
    ]);

    // Get user breakdown by role
    const { data: usersByRole } = await supabase
      .from('student_profiles')
      .select('role')
      .then(result => ({
        data: result.data?.reduce((acc, user) => {
          const role = user.role || 'student';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        error: result.error,
      }));

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: newUsersLast7Days } = await supabase
      .from('student_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: newSessionsLast7Days } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    // Get session statistics
    const { data: sessionStats } = await supabase
      .from('sessions')
      .select('status')
      .then(result => ({
        data: result.data?.reduce((acc, session) => {
          const status = session.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        error: result.error,
      }));

    // Compile statistics
    const stats = {
      users: {
        total: totalUsers || 0,
        byRole: usersByRole || {},
        newLast7Days: newUsersLast7Days || 0,
      },
      sessions: {
        total: totalSessions || 0,
        byStatus: sessionStats || {},
        newLast7Days: newSessionsLast7Days || 0,
      },
      subscriptions: {
        active: activeSubscriptions || 0,
      },
      classes: {
        total: totalClasses || 0,
      },
      assignments: {
        total: totalAssignments || 0,
      },
    };

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', '/api/admin/stats', 200, duration);

    return NextResponse.json({ stats });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in admin stats GET',
      { route: '/api/admin/stats' },
      error as Error
    );

    logger.apiResponse('GET', '/api/admin/stats', 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
