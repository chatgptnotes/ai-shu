export interface ProgressReport {
  id: string;
  student_id: string;
  period_start: string;
  period_end: string;
  total_sessions: number;
  total_minutes: number;
  subjects_covered: SubjectProgress[];
  overall_improvement: number; // percentage
  strengths: string[];
  areas_for_improvement: string[];
  parent_note: string;
  generated_at: string;
}

export interface SubjectProgress {
  subject: string;
  sessions_count: number;
  topics_covered: string[];
  average_quiz_score: number;
  improvement_rate: number; // percentage
  mastery_level: number; // 0-100
}

export interface Homework {
  id: string;
  student_id: string;
  session_id?: string;
  subject: string;
  topic: string;
  title: string;
  description: string;
  questions: string[];
  due_date: string;
  status: 'assigned' | 'submitted' | 'graded';
  submission?: HomeworkSubmission;
  created_at: string;
}

export interface HomeworkSubmission {
  homework_id: string;
  submitted_at: string;
  answers: string[];
  feedback?: string;
  score?: number;
  graded_at?: string;
}

export interface Milestone {
  id: string;
  student_id: string;
  type: 'topic_mastered' | 'streak_achieved' | 'improvement_milestone' | 'quiz_perfect_score';
  title: string;
  description: string;
  achieved_at: string;
  icon: string;
}
