-- Assignment Management System
-- Enables teachers to create assignments and track student submissions

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  assignment_type TEXT DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'quiz', 'test', 'project', 'practice')),
  subject TEXT NOT NULL,
  topic TEXT,
  total_points DECIMAL(10,2) DEFAULT 100.00 CHECK (total_points >= 0),
  due_date TIMESTAMPTZ,
  available_from TIMESTAMPTZ DEFAULT NOW(),
  available_until TIMESTAMPTZ,
  allow_late_submission BOOLEAN DEFAULT false,
  late_penalty_percent DECIMAL(5,2) DEFAULT 0.00 CHECK (late_penalty_percent >= 0 AND late_penalty_percent <= 100),
  required_files JSONB DEFAULT '[]'::jsonb, -- Array of required file types
  max_attempts INTEGER DEFAULT 1 CHECK (max_attempts > 0),
  time_limit_minutes INTEGER, -- Optional time limit
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignment attachments (teacher-provided resources)
CREATE TABLE IF NOT EXISTS assignment_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT, -- in bytes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE NOT NULL,
  attempt_number INTEGER DEFAULT 1 CHECK (attempt_number > 0),
  submission_text TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
  is_late BOOLEAN DEFAULT false,
  time_spent_minutes INTEGER, -- Optional tracking of time spent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id, attempt_number)
);

-- Submission files (student-uploaded files)
CREATE TABLE IF NOT EXISTS submission_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES assignment_submissions(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT, -- in bytes
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grades and feedback
CREATE TABLE IF NOT EXISTS assignment_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES assignment_submissions(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE NOT NULL,
  points_earned DECIMAL(10,2) CHECK (points_earned >= 0),
  percentage DECIMAL(5,2) CHECK (percentage >= 0 AND percentage <= 100),
  letter_grade TEXT,
  feedback TEXT,
  rubric_scores JSONB DEFAULT '{}'::jsonb, -- Structured rubric scoring
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id)
);

-- Assignment rubrics
CREATE TABLE IF NOT EXISTS assignment_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  criterion TEXT NOT NULL,
  description TEXT,
  max_points DECIMAL(10,2) NOT NULL CHECK (max_points >= 0),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignment_attachments_assignment_id ON assignment_attachments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submission_files_submission_id ON submission_files(submission_id);
CREATE INDEX IF NOT EXISTS idx_assignment_grades_submission_id ON assignment_grades(submission_id);
CREATE INDEX IF NOT EXISTS idx_assignment_grades_teacher_id ON assignment_grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignment_rubrics_assignment_id ON assignment_rubrics(assignment_id);

-- Updated at triggers
CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_submissions_updated_at
  BEFORE UPDATE ON assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignment_grades_updated_at
  BEFORE UPDATE ON assignment_grades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate percentage when points_earned changes
CREATE OR REPLACE FUNCTION calculate_grade_percentage()
RETURNS TRIGGER AS $$
DECLARE
  assignment_total DECIMAL(10,2);
BEGIN
  -- Get the total points for the assignment
  SELECT a.total_points INTO assignment_total
  FROM assignments a
  JOIN assignment_submissions s ON s.assignment_id = a.id
  WHERE s.id = NEW.submission_id;

  -- Calculate percentage
  IF assignment_total > 0 THEN
    NEW.percentage := (NEW.points_earned / assignment_total) * 100;
  ELSE
    NEW.percentage := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assignment_grades_calculate_percentage
  BEFORE INSERT OR UPDATE OF points_earned ON assignment_grades
  FOR EACH ROW
  EXECUTE FUNCTION calculate_grade_percentage();

-- Auto-mark submission as late if submitted after due date
CREATE OR REPLACE FUNCTION check_late_submission()
RETURNS TRIGGER AS $$
DECLARE
  assignment_due_date TIMESTAMPTZ;
BEGIN
  -- Get the due date for the assignment
  SELECT due_date INTO assignment_due_date
  FROM assignments
  WHERE id = NEW.assignment_id;

  -- Mark as late if submitted after due date
  IF assignment_due_date IS NOT NULL AND NEW.submitted_at > assignment_due_date THEN
    NEW.is_late := true;
  ELSE
    NEW.is_late := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assignment_submissions_check_late
  BEFORE INSERT OR UPDATE OF submitted_at ON assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_late_submission();

-- Row Level Security
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_rubrics ENABLE ROW LEVEL SECURITY;

-- Assignments Policies
CREATE POLICY "Students can view published assignments for their classes"
  ON assignments FOR SELECT
  USING (
    status = 'published' AND EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN student_profiles sp ON sp.id = ce.student_id
      WHERE sp.user_id = auth.uid() AND ce.class_id = assignments.class_id AND ce.status = 'active'
    ) OR
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      WHERE tp.user_id = auth.uid() AND tp.id = teacher_id
    )
  );

CREATE POLICY "Teachers can create assignments for their classes"
  ON assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      JOIN classes c ON c.teacher_id = tp.id
      WHERE tp.user_id = auth.uid() AND c.id = class_id AND tp.id = teacher_id
    )
  );

CREATE POLICY "Teachers can update their own assignments"
  ON assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

CREATE POLICY "Teachers can delete their own assignments"
  ON assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

-- Assignment Attachments Policies
CREATE POLICY "Students and teachers can view assignment attachments"
  ON assignment_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN class_enrollments ce ON ce.class_id = a.class_id
      JOIN student_profiles sp ON sp.id = ce.student_id
      WHERE sp.user_id = auth.uid() AND a.id = assignment_id AND a.status = 'published' AND ce.status = 'active'
    ) OR
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN teacher_profiles tp ON tp.id = a.teacher_id
      WHERE tp.user_id = auth.uid() AND a.id = assignment_id
    )
  );

CREATE POLICY "Teachers can manage assignment attachments"
  ON assignment_attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN teacher_profiles tp ON tp.id = a.teacher_id
      WHERE tp.user_id = auth.uid() AND a.id = assignment_id
    )
  );

-- Assignment Submissions Policies
CREATE POLICY "Students can view their own submissions"
  ON assignment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND id = student_id
    ) OR
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN teacher_profiles tp ON tp.id = a.teacher_id
      WHERE tp.user_id = auth.uid() AND a.id = assignment_id
    )
  );

CREATE POLICY "Students can create their own submissions"
  ON assignment_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND id = student_id
    )
  );

CREATE POLICY "Students can update their own ungraded submissions"
  ON assignment_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE user_id = auth.uid() AND id = student_id
    ) AND status IN ('draft', 'submitted')
  );

-- Submission Files Policies
CREATE POLICY "Students and teachers can view submission files"
  ON submission_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignment_submissions s
      JOIN student_profiles sp ON sp.id = s.student_id
      WHERE sp.user_id = auth.uid() AND s.id = submission_id
    ) OR
    EXISTS (
      SELECT 1 FROM assignment_submissions s
      JOIN assignments a ON a.id = s.assignment_id
      JOIN teacher_profiles tp ON tp.id = a.teacher_id
      WHERE tp.user_id = auth.uid() AND s.id = submission_id
    )
  );

CREATE POLICY "Students can manage their own submission files"
  ON submission_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignment_submissions s
      JOIN student_profiles sp ON sp.id = s.student_id
      WHERE sp.user_id = auth.uid() AND s.id = submission_id
    )
  );

-- Assignment Grades Policies
CREATE POLICY "Students can view their own grades"
  ON assignment_grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignment_submissions s
      JOIN student_profiles sp ON sp.id = s.student_id
      WHERE sp.user_id = auth.uid() AND s.id = submission_id
    ) OR
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

CREATE POLICY "Teachers can manage grades"
  ON assignment_grades FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE user_id = auth.uid() AND id = teacher_id
    )
  );

-- Assignment Rubrics Policies
CREATE POLICY "Students and teachers can view rubrics"
  ON assignment_rubrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN class_enrollments ce ON ce.class_id = a.class_id
      JOIN student_profiles sp ON sp.id = ce.student_id
      WHERE sp.user_id = auth.uid() AND a.id = assignment_id AND a.status = 'published' AND ce.status = 'active'
    ) OR
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN teacher_profiles tp ON tp.id = a.teacher_id
      WHERE tp.user_id = auth.uid() AND a.id = assignment_id
    )
  );

CREATE POLICY "Teachers can manage rubrics for their assignments"
  ON assignment_rubrics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN teacher_profiles tp ON tp.id = a.teacher_id
      WHERE tp.user_id = auth.uid() AND a.id = assignment_id
    )
  );
