-- Database Reset Script for Testing
-- WARNING: This will delete ALL test data
-- Only run this in development, never in production!

-- ============================================
-- SAFETY CHECK
-- ============================================
-- This script is designed for development only.
-- If you're running this on production, STOP NOW!

-- ============================================
-- DELETE TEST USERS
-- ============================================
-- Delete all test users (those with @ai-shu.test email)
DELETE FROM auth.users
WHERE email LIKE '%@ai-shu.test';

-- Delete users created in the last hour (if needed)
-- UNCOMMENT ONLY IF YOU WANT TO DELETE RECENT TEST USERS:
-- DELETE FROM auth.users
-- WHERE created_at > NOW() - INTERVAL '1 hour';

-- ============================================
-- VERIFY DELETION
-- ============================================
-- Check remaining users
SELECT
    id,
    email,
    created_at,
    confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- CHECK DATA COUNTS
-- ============================================
-- Verify all related data was cascade deleted
SELECT
    'user_profiles' AS table_name, COUNT(*) AS remaining_records FROM user_profiles
UNION ALL
SELECT 'student_profiles', COUNT(*) FROM student_profiles
UNION ALL
SELECT 'parent_profiles', COUNT(*) FROM parent_profiles
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'quizzes', COUNT(*) FROM quizzes
UNION ALL
SELECT 'quiz_submissions', COUNT(*) FROM quiz_submissions
UNION ALL
SELECT 'homework', COUNT(*) FROM homework
UNION ALL
SELECT 'milestones', COUNT(*) FROM milestones;

-- ============================================
-- RESET SEQUENCES (Optional)
-- ============================================
-- If you want to reset auto-increment sequences, run:
-- Note: This is usually not necessary as we use UUIDs

-- ============================================
-- NOTES
-- ============================================
-- After running this script:
-- 1. All test users are deleted
-- 2. Related data (profiles, sessions, messages) is cascade deleted
-- 3. You can create fresh test accounts
-- 4. All RLS policies remain in place
-- 5. Database schema is unchanged
