/**
 * Teacher Classes API - Update and Delete specific class
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';
import { z } from 'zod';

// Validation schema for updating a class
const updateClassSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  subject: z.string().min(1).max(100).optional(),
  grade_level: z.string().max(50).optional(),
  curriculum: z.string().max(50).optional(),
  max_students: z.number().int().min(1).max(1000).optional(),
  status: z.enum(['active', 'archived', 'draft']).optional(),
  schedule: z.array(z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    duration: z.number().int().min(15).max(480),
  })).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  meeting_link: z.string().url().max(500).optional(),
});

/**
 * GET /api/teacher/classes/[classId]
 * Get specific class details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const startTime = Date.now();
  const { classId } = await params;

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

    // Get class with teacher check
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select(`
        *,
        teacher:teacher_profiles(id, user_id, bio, specializations, verified)
      `)
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      logger.warn('Class not found', {
        route: '/api/teacher/classes/[classId]',
        classId,
      });

      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', `/api/teacher/classes/${classId}`, 200, duration, {
      classId,
    });

    return NextResponse.json({ class: classData });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in teacher class GET',
      { route: `/api/teacher/classes/${classId}` },
      error as Error
    );

    logger.apiResponse('GET', `/api/teacher/classes/${classId}`, 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/teacher/classes/[classId]
 * Update specific class
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const startTime = Date.now();
  const { classId } = await params;

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

    // Get teacher profile
    const { data: teacherProfile, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (teacherError || !teacherProfile) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    // Verify class ownership
    const { data: existingClass, error: checkError } = await supabase
      .from('classes')
      .select('id, teacher_id')
      .eq('id', classId)
      .eq('teacher_id', teacherProfile.id)
      .single();

    if (checkError || !existingClass) {
      logger.warn('Class not found or unauthorized', {
        route: `/api/teacher/classes/${classId}`,
        teacherId: teacherProfile.id,
        classId,
      });

      return NextResponse.json(
        { error: 'Class not found or unauthorized' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateClassSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      logger.warn('Invalid class update request', {
        route: `/api/teacher/classes/${classId}`,
        errors,
      });

      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    // Update class
    const { data: updatedClass, error: updateError } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', classId)
      .select()
      .single();

    if (updateError) {
      logger.error(
        'Error updating class',
        { route: `/api/teacher/classes/${classId}`, classId },
        updateError as Error
      );

      return NextResponse.json(
        { error: 'Failed to update class' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.info('Class updated', {
      route: `/api/teacher/classes/${classId}`,
      classId,
      updates: Object.keys(updates),
    });

    logger.apiResponse('PATCH', `/api/teacher/classes/${classId}`, 200, duration, {
      classId,
    });

    return NextResponse.json({ class: updatedClass });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in teacher class PATCH',
      { route: `/api/teacher/classes/${classId}` },
      error as Error
    );

    logger.apiResponse('PATCH', `/api/teacher/classes/${classId}`, 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teacher/classes/[classId]
 * Delete specific class
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const startTime = Date.now();
  const { classId } = await params;

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

    // Get teacher profile
    const { data: teacherProfile, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (teacherError || !teacherProfile) {
      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    // Verify class ownership and delete
    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId)
      .eq('teacher_id', teacherProfile.id);

    if (deleteError) {
      logger.error(
        'Error deleting class',
        { route: `/api/teacher/classes/${classId}`, classId },
        deleteError as Error
      );

      return NextResponse.json(
        { error: 'Failed to delete class' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.info('Class deleted', {
      route: `/api/teacher/classes/${classId}`,
      classId,
      teacherId: teacherProfile.id,
    });

    logger.apiResponse('DELETE', `/api/teacher/classes/${classId}`, 200, duration, {
      classId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in teacher class DELETE',
      { route: `/api/teacher/classes/${classId}` },
      error as Error
    );

    logger.apiResponse('DELETE', `/api/teacher/classes/${classId}`, 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
