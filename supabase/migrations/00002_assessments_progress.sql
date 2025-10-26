-- Create enum types for assessments
CREATE TYPE question_type AS ENUM ('multiple_choice', 'short_answer', 'math_expression', 'true_false');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'expert');
CREATE TYPE mastery_level AS ENUM ('novice', 'developing', 'proficient', 'advanced');
CREATE TYPE homework_status AS ENUM ('assigned', 'submitted', 'graded');
CREATE TYPE milestone_type AS ENUM ('topic_mastered', 'streak_achieved', 'improvement_milestone', 'quiz_perfect_score');

-- Diagnostic tests
CREATE TABLE public.diagnostic_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    subject subject NOT NULL,
    curriculum curriculum NOT NULL,
    level level_type,
    total_questions INTEGER NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Diagnostic results
CREATE TABLE public.diagnostic_results (
    test_id UUID PRIMARY KEY REFERENCES public.diagnostic_tests(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
    topic_scores JSONB NOT NULL,
    knowledge_gaps TEXT[],
    strengths TEXT[],
    recommended_level difficulty_level
);

-- Quizzes
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    subject subject NOT NULL,
    topic VARCHAR(255) NOT NULL,
    questions JSONB NOT NULL,
    time_limit_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz submissions
CREATE TABLE public.quiz_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0),
    max_score DECIMAL(5,2) NOT NULL CHECK (max_score > 0),
    time_taken_minutes INTEGER,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mastery tracking
CREATE TABLE public.mastery_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    subject subject NOT NULL,
    topic VARCHAR(255) NOT NULL,
    mastery_score DECIMAL(5,2) NOT NULL CHECK (mastery_score >= 0 AND mastery_score <= 100),
    attempts INTEGER NOT NULL DEFAULT 1,
    last_practiced TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_review_date TIMESTAMPTZ,
    is_mastered BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, subject, topic)
);

-- Progress reports
CREATE TABLE public.progress_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_minutes INTEGER NOT NULL DEFAULT 0,
    subjects_covered JSONB NOT NULL,
    overall_improvement DECIMAL(5,2),
    strengths TEXT[],
    areas_for_improvement TEXT[],
    parent_note TEXT,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Homework
CREATE TABLE public.homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    subject subject NOT NULL,
    topic VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    status homework_status NOT NULL DEFAULT 'assigned',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Homework submissions
CREATE TABLE public.homework_submissions (
    homework_id UUID PRIMARY KEY REFERENCES public.homework(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    answers JSONB NOT NULL,
    feedback TEXT,
    score DECIMAL(5,2),
    graded_at TIMESTAMPTZ
);

-- Milestones
CREATE TABLE public.milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    type milestone_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_diagnostic_tests_student_id ON public.diagnostic_tests(student_id);
CREATE INDEX idx_quizzes_session_id ON public.quizzes(session_id);
CREATE INDEX idx_quiz_submissions_student_id ON public.quiz_submissions(student_id);
CREATE INDEX idx_mastery_tracking_student_id ON public.mastery_tracking(student_id);
CREATE INDEX idx_progress_reports_student_id ON public.progress_reports(student_id);
CREATE INDEX idx_homework_student_id ON public.homework(student_id);
CREATE INDEX idx_homework_status ON public.homework(status);
CREATE INDEX idx_milestones_student_id ON public.milestones(student_id);

-- Apply updated_at trigger to mastery_tracking
CREATE TRIGGER update_mastery_tracking_updated_at BEFORE UPDATE ON public.mastery_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
