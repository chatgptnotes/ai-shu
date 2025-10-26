export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type Subject = 'physics' | 'chemistry' | 'mathematics' | 'business' | 'economics';

export interface Session {
  id: string;
  student_id: string;
  subject: Subject;
  topic: string;
  status: SessionStatus;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  duration_minutes: number;
  transcript_url?: string;
  recording_url?: string;
  summary?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionSummary {
  session_id: string;
  key_concepts: string[];
  questions_asked: number;
  questions_answered: number;
  topics_mastered: string[];
  topics_to_review: string[];
  homework_assigned: string[];
  next_session_suggestions: string[];
  ai_notes: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'student' | 'ai_tutor';
  content: string;
  timestamp: string;
  audio_url?: string;
}

export interface WhiteboardSnapshot {
  id: string;
  session_id: string;
  snapshot_data: string; // JSON serialized tldraw data
  timestamp: string;
  label?: string;
}
