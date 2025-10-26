/**
 * Class Enrollments API - Manage student enrollments in classes
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';
import { z } from 'zod';


export const dynamic = 'force-dynamic';
// Validation schema for enrolling a student
const enrollStudentSchema = z.object({
  student_id: z.string().uuid(),
  notes: z.string().max(1000).optional(),
});

/**
 * GET /api/teacher/classes/[classId]/enrollments
 * Get all enrollments for a class
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

    // Get enrollments with student details
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('class_enrollments')
      .select(`
        *,
        student:student_profiles(
          id,
          user_id,
          full_name,
          grade_level,
          school
        )
      `)
      .eq('class_id', classId)
      .order('enrolled_at', { ascending: false });

    if (enrollmentsError) {
      logger.error(
        'Error fetching class enrollments',
        { route: `/api/teacher/classes/${classId}/enrollments`, classId },
        enrollmentsError as Error
      );

      return NextResponse.json(
        { error: 'Failed to fetch enrollments' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', `/api/teacher/classes/${classId}/enrollments`, 200, duration, {
      classId,
      enrollmentCount: enrollments?.length || 0,
    });

    return NextResponse.json({ enrollments: enrollments || [] });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in class enrollments GET',
      { route: `/api/teacher/classes/${classId}/enrollments` },
      error as Error
    );

    logger.apiResponse('GET', `/api/teacher/classes/${classId}/enrollments`, 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher/classes/[classId]/enrollments
 * Enroll a student in the class
 */
export async function POST(
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
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, teacher_id, max_students, current_students')
      .eq('id', classId)
      .eq('teacher_id', teacherProfile.id)
      .single();

    if (classError || !classData) {
      logger.warn('Class not found or unauthorized', {
        route: `/api/teacher/classes/${classId}/enrollments`,
        teacherId: teacherProfile.id,
        classId,
      });

      return NextResponse.json(
        { error: 'Class not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if class is full
    if (classData.current_students >= classData.max_students) {
      logger.warn('Class is full', {
        route: `/api/teacher/classes/${classId}/enrollments`,
        classId,
        currentStudents: classData.current_students,
        maxStudents: classData.max_students,
      });

      return NextResponse.json(
        { error: 'Class is full' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = enrollStudentSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      logger.warn('Invalid enrollment request', {
        route: `/api/teacher/classes/${classId}/enrollments`,
        errors,
      });

      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { student_id, notes } = validationResult.data;

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      logger.warn('Student not found', {
        route: `/api/teacher/classes/${classId}/enrollments`,
        studentId: student_id,
      });

      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('class_enrollments')
      .insert({
        class_id: classId,
        student_id,
        notes,
        status: 'active',
      })
      .select()
      .single();

    if (enrollError) {
      // Check if student is already enrolled
      if (enrollError.code === '23505') {
        logger.warn('Student already enrolled', {
          route: `/api/teacher/classes/${classId}/enrollments`,
          classId,
          studentId: student_id,
        });

        return NextResponse.json(
          { error: 'Student is already enrolled in this class' },
          { status: 409 }
        );
      }

      logger.error(
        'Error creating enrollment',
        { route: `/api/teacher/classes/${classId}/enrollments`, classId, studentId: student_id },
        enrollError as Error
      );

      return NextResponse.json(
        { error: 'Failed to enroll student' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.info('Student enrolled in class', {
      route: `/api/teacher/classes/${classId}/enrollments`,
      classId,
      studentId: student_id,
      enrollmentId: enrollment.id,
    });

    logger.apiResponse('POST', `/api/teacher/classes/${classId}/enrollments`, 201, duration, {
      classId,
      enrollmentId: enrollment.id,
    });

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in class enrollments POST',
      { route: `/api/teacher/classes/${classId}/enrollments` },
      error as Error
    );

    logger.apiResponse('POST', `/api/teacher/classes/${classId}/enrollments`, 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
