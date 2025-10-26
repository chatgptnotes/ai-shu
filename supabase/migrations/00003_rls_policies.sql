-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Student profiles: Students can view/update their own, parents can view their children's
CREATE POLICY "Students can view own profile" ON public.student_profiles FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.student_parents sp
        JOIN public.parent_profiles pp ON sp.parent_id = pp.id
        WHERE sp.student_id = student_profiles.id AND pp.user_id = auth.uid()
    )
);

CREATE POLICY "Students can update own profile" ON public.student_profiles FOR UPDATE USING (user_id = auth.uid());

-- Parent profiles: Parents can view/update their own
CREATE POLICY "Parents can view own profile" ON public.parent_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Parents can update own profile" ON public.parent_profiles FOR UPDATE USING (user_id = auth.uid());

-- Sessions: Students can view their own, parents can view their children's
CREATE POLICY "Students can view own sessions" ON public.sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = sessions.student_id AND sp.user_id = auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.student_parents spar
        JOIN public.parent_profiles pp ON spar.parent_id = pp.id
        WHERE spar.student_id = sessions.student_id AND pp.user_id = auth.uid()
    )
);

CREATE POLICY "Students can insert own sessions" ON public.sessions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = student_id AND sp.user_id = auth.uid())
);

-- Messages: Viewable by session participants
CREATE POLICY "Session participants can view messages" ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.student_profiles sp ON s.student_id = sp.id
        WHERE s.id = messages.session_id AND sp.user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.student_parents spar ON s.student_id = spar.student_id
        JOIN public.parent_profiles pp ON spar.parent_id = pp.id
        WHERE s.id = messages.session_id AND pp.user_id = auth.uid()
    )
);

CREATE POLICY "Students can insert messages in own sessions" ON public.messages FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.student_profiles sp ON s.student_id = sp.id
        WHERE s.id = session_id AND sp.user_id = auth.uid()
    )
);

-- Whiteboard snapshots: Same as messages
CREATE POLICY "Session participants can view whiteboard" ON public.whiteboard_snapshots FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.student_profiles sp ON s.student_id = sp.id
        WHERE s.id = whiteboard_snapshots.session_id AND sp.user_id = auth.uid()
    )
);

CREATE POLICY "Students can insert whiteboard snapshots" ON public.whiteboard_snapshots FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.student_profiles sp ON s.student_id = sp.id
        WHERE s.id = session_id AND sp.user_id = auth.uid()
    )
);

-- Quizzes: Students can view quizzes in their sessions
CREATE POLICY "Students can view quizzes" ON public.quizzes FOR SELECT USING (
    session_id IS NULL OR
    EXISTS (
        SELECT 1 FROM public.sessions s
        JOIN public.student_profiles sp ON s.student_id = sp.id
        WHERE s.id = quizzes.session_id AND sp.user_id = auth.uid()
    )
);

-- Quiz submissions: Students can view their own submissions
CREATE POLICY "Students can view own quiz submissions" ON public.quiz_submissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = student_id AND sp.user_id = auth.uid())
);

CREATE POLICY "Students can insert quiz submissions" ON public.quiz_submissions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = student_id AND sp.user_id = auth.uid())
);

-- Mastery tracking: Students and their parents can view
CREATE POLICY "Students can view own mastery" ON public.mastery_tracking FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = student_id AND sp.user_id = auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.student_parents spar
        JOIN public.parent_profiles pp ON spar.parent_id = pp.id
        WHERE spar.student_id = mastery_tracking.student_id AND pp.user_id = auth.uid()
    )
);

-- Progress reports: Students and their parents can view
CREATE POLICY "Students can view own progress reports" ON public.progress_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = student_id AND sp.user_id = auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.student_parents spar
        JOIN public.parent_profiles pp ON spar.parent_id = pp.id
        WHERE spar.student_id = progress_reports.student_id AND pp.user_id = auth.uid()
    )
);

-- Homework: Students can view their own
CREATE POLICY "Students can view own homework" ON public.homework FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = student_id AND sp.user_id = auth.uid())
);

-- Milestones: Students and their parents can view
CREATE POLICY "Students can view own milestones" ON public.milestones FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.student_profiles sp WHERE sp.id = student_id AND sp.user_id = auth.uid()) OR
    EXISTS (
        SELECT 1 FROM public.student_parents spar
        JOIN public.parent_profiles pp ON spar.parent_id = pp.id
        WHERE spar.student_id = milestones.student_id AND pp.user_id = auth.uid()
    )
);
