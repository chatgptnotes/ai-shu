/**
 * Teacher Assignments API - CRUD operations for assignments
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';
import { z } from 'zod';

// Validation schema for creating an assignment
const createAssignmentSchema = z.object({
  class_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  instructions: z.string().max(10000).optional(),
  assignment_type: z.enum(['homework', 'quiz', 'test', 'project', 'practice']).optional(),
  subject: z.string().min(1).max(100),
  topic: z.string().max(200).optional(),
  total_points: z.number().min(0).max(10000).optional(),
  due_date: z.string().datetime().optional(),
  available_from: z.string().datetime().optional(),
  available_until: z.string().datetime().optional(),
  allow_late_submission: z.boolean().optional(),
  late_penalty_percent: z.number().min(0).max(100).optional(),
  required_files: z.array(z.string()).optional(),
  max_attempts: z.number().int().min(1).max(100).optional(),
  time_limit_minutes: z.number().int().min(1).max(1440).optional(),
});

/**
 * GET /api/teacher/assignments
 * Get all assignments for the authenticated teacher
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

    // Get query parameters
    const url = new URL(request.url);
    const classId = url.searchParams.get('class_id');

    // Build query
    let query = supabase
      .from('assignments')
      .select('*, attachments:assignment_attachments(count)')
      .eq('teacher_id', teacherProfile.id)
      .order('created_at', { ascending: false });

    // Filter by class if specified
    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data: assignments, error: assignmentsError } = await query;

    if (assignmentsError) {
      logger.error(
        'Error fetching teacher assignments',
        { route: '/api/teacher/assignments', teacherId: teacherProfile.id },
        assignmentsError as Error
      );

      return NextResponse.json(
        { error: 'Failed to fetch assignments' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', '/api/teacher/assignments', 200, duration, {
      teacherId: teacherProfile.id,
      assignmentCount: assignments?.length || 0,
    });

    return NextResponse.json({ assignments: assignments || [] });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in teacher assignments GET',
      { route: '/api/teacher/assignments' },
      error as Error
    );

    logger.apiResponse('GET', '/api/teacher/assignments', 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher/assignments
 * Create a new assignment
 */
export async function POST(request: Request) {
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createAssignmentSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      logger.warn('Invalid assignment creation request', {
        route: '/api/teacher/assignments',
        errors,
      });

      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const assignmentData = validationResult.data;

    // Verify class ownership
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, teacher_id')
      .eq('id', assignmentData.class_id)
      .eq('teacher_id', teacherProfile.id)
      .single();

    if (classError || !classData) {
      logger.warn('Class not found or unauthorized', {
        route: '/api/teacher/assignments',
        teacherId: teacherProfile.id,
        classId: assignmentData.class_id,
      });

      return NextResponse.json(
        { error: 'Class not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create assignment
    const { data: newAssignment, error: createError } = await supabase
      .from('assignments')
      .insert({
        ...assignmentData,
        teacher_id: teacherProfile.id,
        status: 'draft', // Start as draft
      })
      .select()
      .single();

    if (createError) {
      logger.error(
        'Error creating assignment',
        { route: '/api/teacher/assignments', teacherId: teacherProfile.id },
        createError as Error
      );

      return NextResponse.json(
        { error: 'Failed to create assignment' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.info('Assignment created', {
      route: '/api/teacher/assignments',
      teacherId: teacherProfile.id,
      assignmentId: newAssignment.id,
      title: newAssignment.title,
    });

    logger.apiResponse('POST', '/api/teacher/assignments', 201, duration, {
      assignmentId: newAssignment.id,
    });

    return NextResponse.json({ assignment: newAssignment }, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in teacher assignments POST',
      { route: '/api/teacher/assignments' },
      error as Error
    );

    logger.apiResponse('POST', '/api/teacher/assignments', 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
