/**
 * Assignment Grading API - Grade student submissions
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { rateLimiters, getRateLimitIdentifier, createRateLimitHeaders } from '@/lib/security/rate-limiter';
import { z } from 'zod';

// Validation schema for grading
const gradeSubmissionSchema = z.object({
  points_earned: z.number().min(0),
  letter_grade: z.string().max(5).optional(),
  feedback: z.string().max(10000).optional(),
  rubric_scores: z.record(z.string(), z.number()).optional(),
});

/**
 * POST /api/teacher/assignments/submissions/[submissionId]/grade
 * Grade a student submission
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const startTime = Date.now();
  const { submissionId } = await params;

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
    const validationResult = gradeSubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      logger.warn('Invalid grading request', {
        route: `/api/teacher/assignments/submissions/${submissionId}/grade`,
        errors,
      });

      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const gradeData = validationResult.data;

    // Get submission and verify teacher owns the assignment
    const { data: submission, error: submissionError } = await supabase
      .from('assignment_submissions')
      .select(`
        id,
        assignment_id,
        student_id,
        assignment:assignments(id, teacher_id, total_points)
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      logger.warn('Submission not found', {
        route: `/api/teacher/assignments/submissions/${submissionId}/grade`,
        submissionId,
      });

      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Type assertion for assignment data
    const assignmentData = submission.assignment as unknown as {
      id: string;
      teacher_id: string;
      total_points: number;
    };

    // Verify teacher owns the assignment
    if (assignmentData.teacher_id !== teacherProfile.id) {
      logger.warn('Unauthorized grading attempt', {
        route: `/api/teacher/assignments/submissions/${submissionId}/grade`,
        teacherId: teacherProfile.id,
        submissionId,
      });

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Validate points don't exceed total
    if (gradeData.points_earned > assignmentData.total_points) {
      return NextResponse.json(
        { error: `Points earned cannot exceed ${assignmentData.total_points}` },
        { status: 400 }
      );
    }

    // Create or update grade
    const { data: grade, error: gradeError } = await supabase
      .from('assignment_grades')
      .upsert({
        submission_id: submissionId,
        teacher_id: teacherProfile.id,
        points_earned: gradeData.points_earned,
        letter_grade: gradeData.letter_grade,
        feedback: gradeData.feedback,
        rubric_scores: gradeData.rubric_scores || {},
        graded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (gradeError) {
      logger.error(
        'Error creating grade',
        { route: `/api/teacher/assignments/submissions/${submissionId}/grade`, submissionId },
        gradeError as Error
      );

      return NextResponse.json(
        { error: 'Failed to create grade' },
        { status: 500 }
      );
    }

    // Update submission status to graded
    await supabase
      .from('assignment_submissions')
      .update({ status: 'graded' })
      .eq('id', submissionId);

    const duration = Date.now() - startTime;
    logger.info('Submission graded', {
      route: `/api/teacher/assignments/submissions/${submissionId}/grade`,
      submissionId,
      gradeId: grade.id,
      pointsEarned: gradeData.points_earned,
    });

    logger.apiResponse('POST', `/api/teacher/assignments/submissions/${submissionId}/grade`, 201, duration, {
      submissionId,
      gradeId: grade.id,
    });

    return NextResponse.json({ grade }, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Error in grading submission',
      { route: `/api/teacher/assignments/submissions/${submissionId}/grade` },
      error as Error
    );

    logger.apiResponse('POST', `/api/teacher/assignments/submissions/${submissionId}/grade`, 500, duration);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
