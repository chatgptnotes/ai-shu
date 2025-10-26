/**
 * Assignment Management Types
 */

export interface Assignment {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  assignment_type: 'homework' | 'quiz' | 'test' | 'project' | 'practice';
  subject: string;
  topic: string | null;
  total_points: number;
  due_date: string | null;
  available_from: string;
  available_until: string | null;
  allow_late_submission: boolean;
  late_penalty_percent: number;
  required_files: string[];
  max_attempts: number;
  time_limit_minutes: number | null;
  status: 'draft' | 'published' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface AssignmentAttachment {
  id: string;
  assignment_id: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  attempt_number: number;
  submission_text: string | null;
  submitted_at: string;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  is_late: boolean;
  time_spent_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFile {
  id: string;
  submission_id: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  uploaded_at: string;
}

export interface AssignmentGrade {
  id: string;
  submission_id: string;
  teacher_id: string;
  points_earned: number;
  percentage: number;
  letter_grade: string | null;
  feedback: string | null;
  rubric_scores: Record<string, number>;
  graded_at: string;
  returned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentRubric {
  id: string;
  assignment_id: string;
  criterion: string;
  description: string | null;
  max_points: number;
  order_index: number;
  created_at: string;
}

// API Request/Response types
export interface CreateAssignmentRequest {
  class_id: string;
  title: string;
  description?: string;
  instructions?: string;
  assignment_type?: 'homework' | 'quiz' | 'test' | 'project' | 'practice';
  subject: string;
  topic?: string;
  total_points?: number;
  due_date?: string;
  available_from?: string;
  available_until?: string;
  allow_late_submission?: boolean;
  late_penalty_percent?: number;
  required_files?: string[];
  max_attempts?: number;
  time_limit_minutes?: number;
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  instructions?: string;
  assignment_type?: 'homework' | 'quiz' | 'test' | 'project' | 'practice';
  subject?: string;
  topic?: string;
  total_points?: number;
  due_date?: string;
  available_from?: string;
  available_until?: string;
  allow_late_submission?: boolean;
  late_penalty_percent?: number;
  required_files?: string[];
  max_attempts?: number;
  time_limit_minutes?: number;
  status?: 'draft' | 'published' | 'closed' | 'archived';
}

export interface SubmitAssignmentRequest {
  assignment_id: string;
  submission_text?: string;
  attempt_number?: number;
  time_spent_minutes?: number;
}

export interface GradeSubmissionRequest {
  submission_id: string;
  points_earned: number;
  letter_grade?: string;
  feedback?: string;
  rubric_scores?: Record<string, number>;
}

export interface AddRubricRequest {
  assignment_id: string;
  criterion: string;
  description?: string;
  max_points: number;
  order_index?: number;
}

// Extended types with relations
export interface AssignmentWithDetails extends Assignment {
  attachments: AssignmentAttachment[];
  rubrics: AssignmentRubric[];
  submission_count?: number;
  graded_count?: number;
}

export interface SubmissionWithDetails extends AssignmentSubmission {
  student: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
  };
  files: SubmissionFile[];
  grade?: AssignmentGrade;
}

export interface AssignmentStats {
  total_assignments: number;
  total_submissions: number;
  graded_submissions: number;
  pending_submissions: number;
  average_score: number;
  on_time_percentage: number;
  late_percentage: number;
}
