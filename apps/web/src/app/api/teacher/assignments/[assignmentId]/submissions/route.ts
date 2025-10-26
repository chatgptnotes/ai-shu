/**
 * Assignment Submissions API - View and manage student submissions
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';

/**
 * GET /api/teacher/assignments/[assignmentId]/submissions
 * Get all submissions for an assignment
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const startTime = Date.now();
  const { assignmentId } = await params;

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

    // Verify assignment ownership
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id, teacher_id')
      .eq('id', assignmentId)
      .eq('teacher_id', teacherProfile.id)
      .single();

    if (assignmentError || !assignment) {
      logger.warn('Assignment not found or unauthorized', {
        route: `/api/teacher/assignments/${assignmentId}/submissions`,
        teacherId: teacherProfile.id,
        assignmentId,
      });

      return NextResponse.json(
        { error: 'Assignment not found or unauthorized' },
        { status: 404 }
      );
    }

    // Get submissions with student details and grades
    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        student:student_profiles(id, user_id, full_name, email),
        grade:assignment_grades(*)
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (submissionsError) {
      logger.error(
        'Error fetching assignment submissions',
        { route: `/api/teacher/assignments/${assignmentId}/submissions`, assignmentId },
        submissionsError as Error
      );

      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.apiResponse('GET', `/api/teacher/assignments/${assignmentId}/submissions`, 200, duration, {
      assignmentId,
      submissionCount: submissions?.length || 0,
    });

    return NextResponse.json({ submissions: submissions || [] });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in assignment submissions GET',
      { route: `/api/teacher/assignments/${assignmentId}/submissions` },
      error as Error
    );

    logger.apiResponse('GET', `/api/teacher/assignments/${assignmentId}/submissions`, 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
