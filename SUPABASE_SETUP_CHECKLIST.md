# Supabase Setup Checklist

Use this checklist to ensure your Supabase database is properly configured and ready for development.

---

## Pre-Flight Checks

- [x] Supabase project created
- [x] Database schema deployed (migrations applied)
- [x] RLS policies enabled
- [x] Environment variables configured
- [ ] API key validated
- [ ] Email confirmations disabled
- [ ] Test users cleaned up

---

## Step-by-Step Setup

### 1. Update API Key (2 minutes)

**Why**: The current API key is invalid/expired

**Steps**:
1. [ ] Go to https://app.supabase.com
2. [ ] Select your AI-Shu project
3. [ ] Click Settings (gear icon) → API
4. [ ] Find "anon public" key
5. [ ] Click Copy button
6. [ ] Open `/Users/murali/1 imp backups/Ai-shu/apps/web/.env.local`
7. [ ] Update `NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-key-here>`
8. [ ] Save file

**Verify**:
```bash
cd "/Users/murali/1 imp backups/Ai-shu"
node scripts/verify-supabase-schema.js
```

**Expected**: ✅ Successfully connected to Supabase

---

### 2. Disable Email Confirmations (1 minute)

**Why**: For testing, we don't want to require email verification

**Steps**:
1. [ ] Go to https://app.supabase.com
2. [ ] Select your AI-Shu project
3. [ ] Click Authentication → Providers
4. [ ] Click on "Email" in the list
5. [ ] Scroll to "Email confirmation settings"
6. [ ] **UNCHECK** "Enable email confirmations"
7. [ ] Click Save

**Verify**: Try signing up - should not ask for email confirmation

---

### 3. Configure URL Settings (1 minute)

**Why**: Ensure redirect URLs are correct

**Steps**:
1. [ ] In Supabase Dashboard: Authentication → URL Configuration
2. [ ] Set **Site URL**: `http://localhost:3002`
3. [ ] Add **Redirect URLs**:
   - [ ] `http://localhost:3002/**`
   - [ ] `http://localhost:3000/**`
4. [ ] Click Save

---

### 4. Clean Up Test Users (1 minute)

**Why**: Remove any "unconfirmed" users from previous tests

**Option A - Dashboard**:
1. [ ] Go to Authentication → Users
2. [ ] Delete any test users
3. [ ] Look for users with email like `test@ai-shu.test`

**Option B - SQL**:
1. [ ] Go to SQL Editor
2. [ ] Run:
   ```sql
   DELETE FROM auth.users WHERE email LIKE '%@ai-shu.test';
   ```

---

### 5. Run Verification Script (1 minute)

**Why**: Confirm database connectivity and schema

**Steps**:
```bash
cd "/Users/murali/1 imp backups/Ai-shu"
node scripts/verify-supabase-schema.js
```

**Expected Output**:
- [ ] ✅ Environment variables configured
- [ ] ✅ Successfully connected to Supabase
- [ ] ✅ All required tables exist
- [ ] ✅ DATABASE IS READY FOR PRODUCTION

**If fails**: See `SUPABASE_API_KEY_FIX.md`

---

### 6. Run Operations Test (2 minutes)

**Why**: Test full CRUD operations and RLS policies

**Steps**:
```bash
node scripts/test-supabase-operations.js
```

**Expected Output**:
- [ ] ✅ RLS correctly blocks unauthenticated access
- [ ] ✅ User created successfully
- [ ] ✅ User profile created successfully
- [ ] ✅ Student profile created successfully
- [ ] ✅ Session created successfully
- [ ] ✅ Message inserted successfully
- [ ] ✅ RLS correctly prevents cross-user data access
- [ ] ✅ ALL TESTS PASSED

**If fails**: Check error messages and see troubleshooting section

---

### 7. Start Development Server (30 seconds)

**Steps**:
```bash
cd "/Users/murali/1 imp backups/Ai-shu"
npm run dev
```

**Expected Output**:
- [ ] ✅ Server starts without errors
- [ ] ✅ Shows: `started server on localhost:3002`
- [ ] ✅ No TypeScript/ESLint errors

---

### 8. Manual Signup Test (5 minutes)

**Why**: Verify the complete user flow works

**Steps**:
1. [ ] Go to: http://localhost:3002/auth/signup
2. [ ] Enter email (use your real email)
3. [ ] Enter password (min 8 characters)
4. [ ] Click Sign Up
5. [ ] **Should NOT see "check your email" message**
6. [ ] Should redirect to profile setup page
7. [ ] Fill in profile:
   - [ ] Full name
   - [ ] Grade level (1-12)
   - [ ] Curriculum (IB, Cambridge, etc.)
   - [ ] Language (English, etc.)
   - [ ] Timezone
8. [ ] Click Save/Continue
9. [ ] Should redirect to dashboard
10. [ ] Should see your name on dashboard

**If fails at step 4-5**: Email confirmations are still enabled
**If fails at step 8**: Check browser console for errors

---

### 9. Create Test Session (2 minutes)

**Why**: Verify session creation and message insertion

**Steps**:
1. [ ] On dashboard, click "New Session" or "Start Session"
2. [ ] Select subject (e.g., Mathematics)
3. [ ] Enter topic (e.g., "Algebra")
4. [ ] Click Start
5. [ ] Session should start
6. [ ] Try sending a message: "Hello, can you help me?"
7. [ ] Message should appear in chat
8. [ ] Check browser console - should be no errors

**If fails**: Check browser console and network tab

---

### 10. Verify Database Records (1 minute)

**Why**: Confirm data is being saved correctly

**Steps**:
1. [ ] Go to Supabase Dashboard → Table Editor
2. [ ] Check `student_profiles` table:
   - [ ] Your profile should be visible
   - [ ] Full name, grade, curriculum should match what you entered
3. [ ] Check `sessions` table:
   - [ ] Your session should be visible
   - [ ] Subject and topic should match
   - [ ] Status should be "in_progress" or "completed"
4. [ ] Check `messages` table:
   - [ ] Your message(s) should be visible
   - [ ] session_id should match your session
   - [ ] content should match your message

---

## Troubleshooting

### Issue: "Invalid API key"
**Solution**:
- [ ] Get fresh anon key from Dashboard (Settings → API)
- [ ] Update `.env.local`
- [ ] Restart dev server
- [ ] See: `SUPABASE_API_KEY_FIX.md`

### Issue: "Check your email for confirmation"
**Solution**:
- [ ] Disable email confirmations (Authentication → Providers → Email)
- [ ] Delete test user
- [ ] Try signup again
- [ ] See: `SUPABASE_EMAIL_FIX.md`

### Issue: "Invalid credentials" after signup
**Solution**:
- [ ] User is in "unconfirmed" state
- [ ] Delete user from dashboard
- [ ] Disable email confirmations
- [ ] Sign up again

### Issue: Tables don't exist
**Solution**:
```bash
cd "/Users/murali/1 imp backups/Ai-shu"
supabase db push
```

### Issue: Cannot see data in tables
**Solution**:
- [ ] RLS is blocking access (this is correct)
- [ ] Use SQL Editor to query with service role
- [ ] Or check via application when logged in

### Issue: Verification script fails
**Solutions**:
- [ ] Check environment variables in `.env.local`
- [ ] Verify Supabase URL is correct
- [ ] Verify anon key is fresh
- [ ] Check internet connection
- [ ] Check Supabase project is active

---

## Production Readiness Checklist

Before deploying to production:

### Security
- [ ] Enable email confirmations
- [ ] Configure SMTP provider (SendGrid/Mailgun/AWS SES)
- [ ] Review all RLS policies
- [ ] Audit service role key usage
- [ ] Configure CORS for production domain
- [ ] Set up rate limiting
- [ ] Enable API request logging

### Performance
- [ ] Review and optimize slow queries
- [ ] Set up connection pooling
- [ ] Configure caching strategy
- [ ] Load test with realistic data

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up database performance monitoring
- [ ] Configure alerts for errors/downtime

### Backup & Recovery
- [ ] Enable automated backups
- [ ] Test restore procedure
- [ ] Document backup retention policy
- [ ] Set up backup alerts

### Configuration
- [ ] Update Site URL to production domain
- [ ] Update redirect URLs
- [ ] Configure production environment variables
- [ ] Set up staging environment
- [ ] Document deployment process

---

## Quick Reference

### Important Files
- **Environment**: `/Users/murali/1 imp backups/Ai-shu/apps/web/.env.local`
- **Migrations**: `/Users/murali/1 imp backups/Ai-shu/supabase/migrations/`
- **Config**: `/Users/murali/1 imp backups/Ai-shu/supabase/config.toml`

### Important Scripts
- **Verify**: `node scripts/verify-supabase-schema.js`
- **Test**: `node scripts/test-supabase-operations.js`

### Important URLs
- **Dashboard**: https://app.supabase.com
- **Project**: https://mdzavfrynjjivxvvibnr.supabase.co
- **Local App**: http://localhost:3002

### Documentation
- **Full Report**: `SUPABASE_VERIFICATION_REPORT.md`
- **Quick Start**: `SUPABASE_QUICK_START.md`
- **API Fix**: `SUPABASE_API_KEY_FIX.md`
- **Email Fix**: `SUPABASE_EMAIL_FIX.md`
- **Summary**: `SUPABASE_CONFIGURATION_SUMMARY.md`

---

## Completion Status

**Overall Progress**: [ ] Complete

### Critical Tasks
- [ ] API key updated and working
- [ ] Email confirmations disabled
- [ ] Verification script passes
- [ ] Operations test passes
- [ ] Manual signup works
- [ ] Session creation works

### Optional Tasks
- [ ] Test users cleaned up
- [ ] Multiple users tested
- [ ] RLS cross-user protection verified
- [ ] Parent-student relationship tested
- [ ] All documentation reviewed

---

## Success Criteria

You're ready to start development when:

- ✅ All critical tasks above are complete
- ✅ You can sign up without email confirmation
- ✅ You can create a profile
- ✅ You can create and join sessions
- ✅ You can send and receive messages
- ✅ No errors in browser console
- ✅ No errors in verification scripts

---

**Estimated Setup Time**: 15-20 minutes

**Last Updated**: 2025-10-26
