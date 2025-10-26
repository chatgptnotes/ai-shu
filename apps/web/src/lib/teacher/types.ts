/**
 * Teacher and Class Management Types
 */

export interface TeacherProfile {
  id: string;
  user_id: string;
  bio: string | null;
  specializations: string[];
  years_of_experience: number;
  qualifications: Qualification[];
  rating: number;
  total_ratings: number;
  hourly_rate: number | null;
  availability: WeeklyAvailability;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  field: string;
}

export interface WeeklyAvailability {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  subject: string;
  grade_level: string | null;
  curriculum: string | null;
  max_students: number;
  current_students: number;
  status: 'active' | 'archived' | 'draft';
  schedule: ClassSchedule[];
  start_date: string | null;
  end_date: string | null;
  meeting_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time: string; // HH:MM format
  duration: number; // minutes
}

export interface ClassEnrollment {
  id: string;
  class_id: string;
  student_id: string;
  enrolled_at: string;
  status: 'active' | 'inactive' | 'completed' | 'dropped';
  attendance_count: number;
  total_sessions: number;
  last_attended: string | null;
  notes: string | null;
}

export interface ClassAnnouncement {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface ClassResource {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  resource_type: 'pdf' | 'video' | 'link' | 'document' | 'other';
  url: string;
  file_size: number | null;
  created_at: string;
  updated_at: string;
}

// API Request/Response types
export interface CreateClassRequest {
  name: string;
  description?: string;
  subject: string;
  grade_level?: string;
  curriculum?: string;
  max_students?: number;
  schedule?: ClassSchedule[];
  start_date?: string;
  end_date?: string;
  meeting_link?: string;
}

export interface UpdateClassRequest {
  name?: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  curriculum?: string;
  max_students?: number;
  status?: 'active' | 'archived' | 'draft';
  schedule?: ClassSchedule[];
  start_date?: string;
  end_date?: string;
  meeting_link?: string;
}

export interface EnrollStudentRequest {
  class_id: string;
  student_id: string;
  notes?: string;
}

export interface UpdateEnrollmentRequest {
  status?: 'active' | 'inactive' | 'completed' | 'dropped';
  notes?: string;
}

export interface CreateAnnouncementRequest {
  class_id: string;
  title: string;
  content: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface CreateResourceRequest {
  class_id: string;
  title: string;
  description?: string;
  resource_type: 'pdf' | 'video' | 'link' | 'document' | 'other';
  url: string;
  file_size?: number;
}

// Extended types with relations
export interface ClassWithTeacher extends Class {
  teacher: TeacherProfile;
}

export interface ClassWithEnrollments extends Class {
  enrollments: ClassEnrollment[];
}

export interface EnrollmentWithStudent extends ClassEnrollment {
  student: {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}
