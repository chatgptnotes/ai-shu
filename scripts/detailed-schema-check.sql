-- Detailed Supabase Database Schema Verification
-- Run this in Supabase SQL Editor to get detailed schema information

-- ============================================
-- 1. CHECK ALL TABLES EXIST
-- ============================================
SELECT
    tablename,
    schemaname
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- 2. VERIFY STUDENT_PROFILES TABLE
-- ============================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'student_profiles'
ORDER BY ordinal_position;

-- ============================================
-- 3. VERIFY SESSIONS TABLE
-- ============================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sessions'
ORDER BY ordinal_position;

-- ============================================
-- 4. VERIFY MESSAGES TABLE
-- ============================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- ============================================
-- 5. CHECK FOREIGN KEY RELATIONSHIPS
-- ============================================
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('student_profiles', 'sessions', 'messages')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 6. CHECK INDEXES
-- ============================================
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('student_profiles', 'sessions', 'messages')
ORDER BY tablename, indexname;

-- ============================================
-- 7. VERIFY RLS IS ENABLED
-- ============================================
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('student_profiles', 'sessions', 'messages', 'user_profiles')
ORDER BY tablename;

-- ============================================
-- 8. CHECK RLS POLICIES
-- ============================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('student_profiles', 'sessions', 'messages', 'user_profiles')
ORDER BY tablename, policyname;

-- ============================================
-- 9. CHECK ENUM TYPES
-- ============================================
SELECT
    t.typname AS enum_name,
    e.enumlabel AS enum_value,
    e.enumsortorder
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('user_role', 'language', 'curriculum', 'session_status', 'subject', 'teaching_style')
ORDER BY t.typname, e.enumsortorder;

-- ============================================
-- 10. CHECK TRIGGERS
-- ============================================
SELECT
    event_object_table AS table_name,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND event_object_table IN ('student_profiles', 'sessions', 'messages', 'user_profiles')
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 11. COUNT RECORDS (for verification)
-- ============================================
SELECT 'user_profiles' AS table_name, COUNT(*) AS record_count FROM public.user_profiles
UNION ALL
SELECT 'student_profiles', COUNT(*) FROM public.student_profiles
UNION ALL
SELECT 'sessions', COUNT(*) FROM public.sessions
UNION ALL
SELECT 'messages', COUNT(*) FROM public.messages;

-- ============================================
-- 12. CHECK AUTH CONFIGURATION
-- ============================================
-- Note: This requires service role access
-- SELECT * FROM auth.users LIMIT 1;
