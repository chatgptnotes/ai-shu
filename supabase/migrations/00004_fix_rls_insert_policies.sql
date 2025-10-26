-- Fix RLS policies: Add INSERT permissions for user profiles and student profiles

-- Allow users to insert their own user_profile during signup
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to insert their own student_profile
CREATE POLICY "Students can insert own profile" ON public.student_profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = student_profiles.user_id AND up.id = auth.uid())
);

-- Allow users to insert their own parent_profile
CREATE POLICY "Parents can insert own profile" ON public.parent_profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = parent_profiles.user_id AND up.id = auth.uid())
);
