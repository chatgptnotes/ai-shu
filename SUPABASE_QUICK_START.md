# Supabase Quick Start Guide - AI-Shu Platform

## Current Status

✅ **Database Schema**: Fully deployed and verified
✅ **RLS Policies**: Enabled on all tables
✅ **Environment Variables**: Configured
⚠️ **API Key**: Needs to be refreshed (see fix below)

---

## 🚨 FIRST: Fix the API Key (2 minutes)

The current API key is invalid. Follow these steps:

1. **Get Fresh Key**:
   - Go to: https://app.supabase.com
   - Select your project
   - Settings → API → Copy **anon public** key

2. **Update .env.local**:
   ```bash
   # Edit this file:
   /Users/murali/1 imp backups/Ai-shu/apps/web/.env.local

   # Update this line with your fresh key:
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-your-key-here>
   ```

3. **Disable Email Confirmations**:
   - In Supabase Dashboard: Authentication → Providers → Email
   - **UNCHECK** "Enable email confirmations"
   - Click **Save**

📖 **Detailed Instructions**: See `SUPABASE_API_KEY_FIX.md`

---

## Test URLs (After Fixing API Key)

Once you've updated the API key, test the application:

### 1. Sign Up
```
http://localhost:3002/auth/signup
```
- Create a new account
- Should NOT ask for email confirmation
- Should redirect to profile setup

### 2. Profile Setup
```
http://localhost:3002/profile/setup
```
- Fill in student details (name, grade, curriculum)
- Submit
- Should redirect to dashboard

### 3. Dashboard
```
http://localhost:3002/dashboard
```
- View your profile
- Create sessions
- View progress

### 4. Start Session
```
http://localhost:3002/session/new
```
- Select subject and topic
- Start interactive session with AI tutor

---

## Verification Commands

Run these commands to verify everything is working:

### 1. Basic Connectivity Check
```bash
cd "/Users/murali/1 imp backups/Ai-shu"
node scripts/verify-supabase-schema.js
```

**Expected Output**:
```
✅ NEXT_PUBLIC_SUPABASE_URL: https://mdzavfrynjjivxvvibnr.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGci...
✅ Successfully connected to Supabase
✅ All required tables exist
✅ DATABASE IS READY FOR PRODUCTION
```

### 2. Full Operations Test
```bash
node scripts/test-supabase-operations.js
```

**Expected Output**:
```
✅ User created successfully
✅ User profile created successfully
✅ Student profile created successfully
✅ Session created successfully
✅ Message inserted successfully
✅ RLS correctly prevents cross-user access
✅ ALL TESTS PASSED
```

### 3. Start Development Server
```bash
npm run dev
```

**Expected Output**:
```
> ai-shu@0.3.0 dev
> turbo run dev

• Running dev in 2 packages
• @ai-shu/web:dev: ready - started server on localhost:3002
```

---

## Database Schema Overview

### Core Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `user_profiles` | Base user authentication data | Links to auth.users |
| `student_profiles` | Student-specific information | Name, grade, curriculum |
| `parent_profiles` | Parent information | Linked to students |
| `sessions` | Tutoring sessions | Subject, topic, status |
| `messages` | Chat messages within sessions | Student and AI tutor messages |

### Assessment Tables

| Table | Purpose |
|-------|---------|
| `diagnostic_tests` | Initial knowledge assessment |
| `quizzes` | Session-based quizzes |
| `quiz_submissions` | Student quiz answers |
| `mastery_tracking` | Topic mastery levels |
| `progress_reports` | Periodic progress summaries |

### Additional Tables

| Table | Purpose |
|-------|---------|
| `homework` | Assigned homework |
| `homework_submissions` | Student homework submissions |
| `milestones` | Achievement tracking |
| `whiteboard_snapshots` | Saved whiteboard states |

---

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

### Students Can:
- ✅ View their own profiles and data
- ✅ Create sessions for themselves
- ✅ Insert messages in their sessions
- ✅ View their progress and assessments
- ❌ NOT view other students' data

### Parents Can:
- ✅ View their children's profiles
- ✅ View their children's sessions and progress
- ❌ NOT modify student data
- ❌ NOT view other students' data

---

## Environment Configuration

**Location**: `/Users/murali/1 imp backups/Ai-shu/apps/web/.env.local`

**Required Variables**:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mdzavfrynjjivxvvibnr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3002
NODE_ENV=development

# AI Services (optional - will use mocks)
DID_API_KEY=
ELEVENLABS_API_KEY=
OPENAI_API_KEY=<your-key>
NEXT_PUBLIC_AGORA_APP_ID=
AGORA_APP_CERTIFICATE=
```

---

## Common Issues and Solutions

### Issue: "Invalid API key"
**Solution**: Get fresh anon key from Supabase Dashboard (Settings → API)

### Issue: "Invalid credentials" after signup
**Solution**: Disable email confirmations in Supabase Dashboard

### Issue: "Row-level security policy violation"
**Solution**: This is normal for unauthenticated access. Make sure you're logged in.

### Issue: Cannot see sessions after creating them
**Solution**: Check that the student_id in sessions matches your student_profile id

### Issue: Tables don't exist
**Solution**: Run migrations:
```bash
cd "/Users/murali/1 imp backups/Ai-shu"
supabase db push
```

---

## Useful SQL Queries

Run these in Supabase SQL Editor to inspect data:

### View all students
```sql
SELECT
    sp.full_name,
    sp.grade_level,
    sp.curriculum,
    up.role,
    sp.created_at
FROM student_profiles sp
JOIN user_profiles up ON sp.user_id = up.id
ORDER BY sp.created_at DESC;
```

### View recent sessions
```sql
SELECT
    s.id,
    sp.full_name AS student_name,
    s.subject,
    s.topic,
    s.status,
    s.started_at,
    s.ended_at
FROM sessions s
JOIN student_profiles sp ON s.student_id = sp.id
ORDER BY s.created_at DESC
LIMIT 10;
```

### View messages in a session
```sql
SELECT
    m.role,
    m.content,
    m.timestamp
FROM messages m
WHERE m.session_id = '<session-id>'
ORDER BY m.timestamp ASC;
```

### Count records by table
```sql
SELECT
    'user_profiles' AS table_name, COUNT(*) AS count FROM user_profiles
UNION ALL
SELECT 'student_profiles', COUNT(*) FROM student_profiles
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;
```

---

## Resources

### Documentation
- **Full Verification Report**: `SUPABASE_VERIFICATION_REPORT.md`
- **API Key Fix Guide**: `SUPABASE_API_KEY_FIX.md`
- **Email Fix Guide**: `SUPABASE_EMAIL_FIX.md`
- **Project Instructions**: `CLAUDE.md`

### Scripts
- **Schema Verification**: `scripts/verify-supabase-schema.js`
- **Operations Test**: `scripts/test-supabase-operations.js`
- **SQL Inspection**: `scripts/detailed-schema-check.sql`

### Migrations
- **Location**: `supabase/migrations/`
- **Files**:
  - `00001_init_schema.sql` - Core tables
  - `00002_assessments_progress.sql` - Assessment tables
  - `00003_rls_policies.sql` - Security policies
  - `00004_fix_rls_insert_policies.sql` - Policy fixes

### Supabase Dashboard
- **URL**: https://app.supabase.com
- **Project**: https://mdzavfrynjjivxvvibnr.supabase.co

---

## Next Steps

### Today
1. ✅ Fix API key (see `SUPABASE_API_KEY_FIX.md`)
2. ✅ Verify email confirmations are disabled
3. ✅ Run verification scripts
4. ✅ Test signup flow at http://localhost:3002/auth/signup
5. ✅ Create a test session

### This Week
1. Test complete user journey (signup → profile → session → messages)
2. Test with multiple users
3. Verify RLS prevents cross-user access
4. Test parent-student relationships
5. Load test with sample data

### Before Production
1. Enable email confirmations with SMTP provider
2. Update Site URL to production domain
3. Review and tighten RLS policies
4. Set up monitoring and logging
5. Configure automated backups
6. Security audit
7. Load testing

---

**Last Updated**: 2025-10-26
**Status**: Ready for testing after API key fix
**Support**: See documentation files listed above
