-- ============================================
-- FIX RLS POLICIES FOR SIGNUP
-- Run this in Supabase SQL Editor
-- ============================================

-- First, drop any existing INSERT policies (in case they exist)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Students can insert own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Parents can insert own profile" ON public.parent_profiles;

-- Now create the correct INSERT policies
-- Allow users to insert their own user_profile during signup
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own student_profile
CREATE POLICY "Students can insert own profile"
ON public.student_profiles
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = student_profiles.user_id
        AND up.id = auth.uid()
    )
);

-- Allow users to insert their own parent_profile
CREATE POLICY "Parents can insert own profile"
ON public.parent_profiles
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = parent_profiles.user_id
        AND up.id = auth.uid()
    )
);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('user_profiles', 'student_profiles', 'parent_profiles')
ORDER BY tablename, cmd;
