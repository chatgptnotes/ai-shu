-- Teacher Classes and Class Management
-- Enables teachers to create and manage classes with students

-- Teacher profiles table (extends student_profiles)
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bio TEXT,
  specializations TEXT[], -- e.g., ['Mathematics', 'Physics']
  years_of_experience INTEGER DEFAULT 0,
  qualifications JSONB DEFAULT '[]'::jsonb, -- Array of degree/certification objects
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_ratings INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2), -- Optional hourly rate for private tutoring
  availability JSONB DEFAULT '{}'::jsonb, -- Weekly availability schedule
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL, -- e.g., 'Mathematics', 'Physics', 'Chemistry'
  grade_level TEXT, -- e.g., 'Grade 9', 'Grade 10', 'University'
  curriculum TEXT, -- e.g., 'IGCSE', 'IB', 'AP', 'CBSE'
  max_students INTEGER DEFAULT 30 CHECK (max_students > 0),
  current_students INTEGER DEFAULT 0 CHECK (current_students >= 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  schedule JSONB DEFAULT '[]'::jsonb, -- Array of {day, time, duration} objects
  start_date DATE,
  end_date DATE,
  meeting_link TEXT, -- Optional permanent meeting link
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_student_count CHECK (current_students <= max_students)
);

-- Class enrollments (students in classes)
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'dropped')),
  attendance_count INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  last_attended TIMESTAMPTZ,
  notes TEXT, -- Teacher notes about this student
  UNIQUE(class_id, student_id)
);

-- Class announcements
CREATE TABLE IF NOT EXISTS class_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class resources (shared files, links, etc.)
CREATE TABLE IF NOT EXISTS class_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'video', 'link', 'document', 'other')),
  url TEXT NOT NULL,
  file_size BIGINT, -- in bytes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_status ON class_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_class_announcements_class_id ON class_announcements(class_id);
CREATE INDEX IF NOT EXISTS idx_class_resources_class_id ON class_resources(class_id);

-- Updated at trigger for teacher_profiles
CREATE TRIGGER update_teacher_profiles_updated_at
  BEFORE UPDATE ON teacher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated at trigger for classes
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated at trigger for class_announcements
CREATE TRIGGER update_class_announcements_updated_at
  BEFORE UPDATE ON class_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated at trigger for class_resources
CREATE TRIGGER update_class_resources_updated_at
  BEFORE UPDATE ON class_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment current_students when student enrolls
CREATE OR REPLACE FUNCTION increment_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE classes
    SET current_students = current_students + 1
    WHERE id = NEW.class_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-decrement current_students when student drops
CREATE OR REPLACE FUNCTION decrement_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'active' AND (NEW.status = 'dropped' OR NEW.status = 'inactive') THEN
    UPDATE classes
    SET current_students = current_students - 1
    WHERE id = OLD.class_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER class_enrollment_increment
  AFTER INSERT ON class_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION increment_class_student_count();

CREATE TRIGGER class_enrollment_decrement
  AFTER UPDATE ON class_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION decrement_class_student_count();

-- Row Level Security
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_resources ENABLE ROW LEVEL SECURITY;

-- Teacher Profiles Policies
CREATE POLICY "Anyone can view teacher profiles"
  ON teacher_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own teacher profile"
  ON teacher_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can update their own profile"
  ON teacher_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Classes Policies
CREATE POLICY "Anyone can view active classes"
  ON classes FOR SELECT
  USING (status = 'active' OR status = 'draft');

CREATE POLICY "Teachers can create classes"
  ON classes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

CREATE POLICY "Teachers can update their own classes"
  ON classes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

CREATE POLICY "Teachers can delete their own classes"
  ON classes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

-- Class Enrollments Policies
CREATE POLICY "Students can view their own enrollments"
  ON class_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND id = student_id
    ) OR
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      JOIN classes c ON c.teacher_id = tp.id
      WHERE tp.user_id = auth.uid() AND c.id = class_id
    )
  );

CREATE POLICY "Students can enroll in classes"
  ON class_enrollments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND id = student_id
    )
  );

CREATE POLICY "Students and teachers can update enrollments"
  ON class_enrollments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND id = student_id
    ) OR
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      JOIN classes c ON c.teacher_id = tp.id
      WHERE tp.user_id = auth.uid() AND c.id = class_id
    )
  );

-- Class Announcements Policies
CREATE POLICY "Class members can view announcements"
  ON class_announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN student_profiles sp ON sp.id = ce.student_id
      WHERE sp.user_id = auth.uid() AND ce.class_id = class_announcements.class_id AND ce.status = 'active'
    ) OR
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      JOIN classes c ON c.teacher_id = tp.id
      WHERE tp.user_id = auth.uid() AND c.id = class_announcements.class_id
    )
  );

CREATE POLICY "Teachers can create announcements for their classes"
  ON class_announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      JOIN classes c ON c.teacher_id = tp.id
      WHERE tp.user_id = auth.uid() AND c.id = class_id AND tp.id = teacher_id
    )
  );

CREATE POLICY "Teachers can update their own announcements"
  ON class_announcements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

CREATE POLICY "Teachers can delete their own announcements"
  ON class_announcements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

-- Class Resources Policies
CREATE POLICY "Class members can view resources"
  ON class_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN student_profiles sp ON sp.id = ce.student_id
      WHERE sp.user_id = auth.uid() AND ce.class_id = class_resources.class_id AND ce.status = 'active'
    ) OR
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      JOIN classes c ON c.teacher_id = tp.id
      WHERE tp.user_id = auth.uid() AND c.id = class_resources.class_id
    )
  );

CREATE POLICY "Teachers can create resources for their classes"
  ON class_resources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      JOIN classes c ON c.teacher_id = tp.id
      WHERE tp.user_id = auth.uid() AND c.id = class_id AND tp.id = teacher_id
    )
  );

CREATE POLICY "Teachers can update their own resources"
  ON class_resources FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

CREATE POLICY "Teachers can delete their own resources"
  ON class_resources FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );
