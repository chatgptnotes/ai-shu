export type UserRole = 'student' | 'parent' | 'admin';

export type Language = 'en' | 'zh' | 'hi' | 'es' | 'ar';

export type Curriculum = 'IB' | 'Edexcel' | 'Cambridge' | 'CBSE' | 'US_Common_Core';

export type Level = 'SL' | 'HL' | 'Foundation' | 'Higher';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth?: string;
  grade_level: number;
  curriculum: Curriculum;
  level?: Level;
  language: Language;
  timezone: string;
  learning_preferences?: LearningPreferences;
  parent_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface ParentProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  student_ids: string[];
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface LearningPreferences {
  has_adhd: boolean;
  is_gifted: boolean;
  preferred_teaching_style: 'socratic' | 'direct' | 'mixed';
  session_duration_minutes: number;
  needs_emotional_support: boolean;
  topics_of_interest: string[];
}

export interface NotificationPreferences {
  email_digests: boolean;
  session_reminders: boolean;
  progress_updates: boolean;
  milestone_alerts: boolean;
}
