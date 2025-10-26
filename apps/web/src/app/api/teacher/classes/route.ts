/**
 * Teacher Classes API - CRUD operations for classes
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';
import { z } from 'zod';

// Validation schema for creating a class
const createClassSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  subject: z.string().min(1).max(100),
  grade_level: z.string().max(50).optional(),
  curriculum: z.string().max(50).optional(),
  max_students: z.number().int().min(1).max(1000).optional(),
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
 * GET /api/teacher/classes
 * Get all classes for the authenticated teacher
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimiters.api.check(identifier);

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded for teacher classes', {
        route: '/api/teacher/classes',
        identifier,
        retryAfter: rateLimitResult.retryAfter,
      });

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
      logger.warn('Unauthorized teacher classes access', {
        route: '/api/teacher/classes',
      });

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
      logger.warn('Teacher profile not found', {
        route: '/api/teacher/classes',
        userId: user.id,
      });

      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    // Get all classes for this teacher
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherProfile.id)
      .order('created_at', { ascending: false });

    if (classesError) {
      logger.error(
        'Error fetching teacher classes',
        { route: '/api/teacher/classes', teacherId: teacherProfile.id },
        classesError as Error
      );

      return NextResponse.json(
        { error: 'Failed to fetch classes' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', '/api/teacher/classes', 200, duration, {
      teacherId: teacherProfile.id,
      classCount: classes?.length || 0,
    });

    return NextResponse.json({ classes: classes || [] });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in teacher classes GET',
      { route: '/api/teacher/classes' },
      error as Error
    );

    logger.apiResponse('GET', '/api/teacher/classes', 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher/classes
 * Create a new class
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = rateLimiters.api.check(identifier);

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded for create class', {
        route: '/api/teacher/classes',
        identifier,
        retryAfter: rateLimitResult.retryAfter,
      });

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
      logger.warn('Unauthorized class creation', {
        route: '/api/teacher/classes',
      });

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
      logger.warn('Teacher profile not found for class creation', {
        route: '/api/teacher/classes',
        userId: user.id,
      });

      return NextResponse.json(
        { error: 'Teacher profile not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createClassSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      logger.warn('Invalid class creation request', {
        route: '/api/teacher/classes',
        errors,
      });

      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const classData = validationResult.data;

    // Create class
    const { data: newClass, error: createError } = await supabase
      .from('classes')
      .insert({
        teacher_id: teacherProfile.id,
        name: classData.name,
        description: classData.description,
        subject: classData.subject,
        grade_level: classData.grade_level,
        curriculum: classData.curriculum,
        max_students: classData.max_students || 30,
        schedule: classData.schedule || [],
        start_date: classData.start_date,
        end_date: classData.end_date,
        meeting_link: classData.meeting_link,
        status: 'draft', // Start as draft
      })
      .select()
      .single();

    if (createError) {
      logger.error(
        'Error creating class',
        { route: '/api/teacher/classes', teacherId: teacherProfile.id },
        createError as Error
      );

      return NextResponse.json(
        { error: 'Failed to create class' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.info('Class created', {
      route: '/api/teacher/classes',
      teacherId: teacherProfile.id,
      classId: newClass.id,
      className: newClass.name,
    });

    logger.apiResponse('POST', '/api/teacher/classes', 201, duration, {
      classId: newClass.id,
    });

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in teacher classes POST',
      { route: '/api/teacher/classes' },
      error as Error
    );

    logger.apiResponse('POST', '/api/teacher/classes', 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
