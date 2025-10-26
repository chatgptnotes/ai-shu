/**
 * Admin Users API - Manage all users
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';
import { z } from 'zod';

// Validation schema for updating user role
const updateUserRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['student', 'teacher', 'admin']),
});

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
 * GET /api/admin/users
 * Get all users (admin only)
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
      logger.warn('Non-admin attempted to access admin users API', {
        route: '/api/admin/users',
        userId: user.id,
      });

      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('student_profiles')
      .select(`
        id,
        user_id,
        full_name,
        email,
        role,
        grade_level,
        school,
        created_at,
        updated_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error: usersError, count } = await query;

    if (usersError) {
      logger.error(
        'Error fetching users',
        { route: '/api/admin/users' },
        usersError as Error
      );

      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', '/api/admin/users', 200, duration, {
      userCount: users?.length || 0,
      totalCount: count,
      page,
    });

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in admin users GET',
      { route: '/api/admin/users' },
      error as Error
    );

    logger.apiResponse('GET', '/api/admin/users', 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * Update user role (admin only)
 */
export async function PATCH(request: Request) {
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
      logger.warn('Non-admin attempted to update user role', {
        route: '/api/admin/users',
        userId: user.id,
      });

      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateUserRoleSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      logger.warn('Invalid user role update request', {
        route: '/api/admin/users',
        errors,
      });

      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { user_id, role } = validationResult.data;

    // Update user role
    const { data: updatedProfile, error: updateError } = await supabase
      .from('student_profiles')
      .update({ role })
      .eq('user_id', user_id)
      .select()
      .single();

    if (updateError) {
      logger.error(
        'Error updating user role',
        { route: '/api/admin/users', targetUserId: user_id, newRole: role },
        updateError as Error
      );

      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.info('User role updated by admin', {
      route: '/api/admin/users',
      adminId: user.id,
      targetUserId: user_id,
      newRole: role,
    });

    logger.apiResponse('PATCH', '/api/admin/users', 200, duration, {
      userId: user_id,
    });

    return NextResponse.json({ user: updatedProfile });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in admin users PATCH',
      { route: '/api/admin/users' },
      error as Error
    );

    logger.apiResponse('PATCH', '/api/admin/users', 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
