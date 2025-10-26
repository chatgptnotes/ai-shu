export type QuestionType = 'multiple_choice' | 'short_answer' | 'math_expression' | 'true_false';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface DiagnosticTest {
  id: string;
  student_id: string;
  subject: string;
  curriculum: string;
  level?: string;
  total_questions: number;
  completed_at?: string;
  results?: DiagnosticResults;
  created_at: string;
}

export interface DiagnosticResults {
  test_id: string;
  overall_score: number; // 0-100
  topic_scores: TopicScore[];
  knowledge_gaps: string[];
  strengths: string[];
  recommended_level: DifficultyLevel;
}

export interface TopicScore {
  topic: string;
  score: number; // 0-100
  mastery_level: 'novice' | 'developing' | 'proficient' | 'advanced';
}

export interface Quiz {
  id: string;
  session_id?: string;
  subject: string;
  topic: string;
  questions: Question[];
  time_limit_minutes?: number;
  created_at: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  question_text: string;
  options?: string[]; // For multiple choice
  correct_answer: string;
  explanation?: string;
  difficulty: DifficultyLevel;
  points: number;
}

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: QuizAnswer[];
  score: number;
  max_score: number;
  completed_at: string;
  time_taken_minutes: number;
}

export interface QuizAnswer {
  question_id: string;
  student_answer: string;
  is_correct: boolean;
  points_earned: number;
}

export interface MasteryTracking {
  student_id: string;
  subject: string;
  topic: string;
  mastery_score: number; // 0-100
  attempts: number;
  last_practiced: string;
  next_review_date: string;
  is_mastered: boolean;
}
