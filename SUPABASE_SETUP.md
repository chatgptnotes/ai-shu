# Supabase Setup Guide for AI-Shu

## Prerequisites
- Supabase account (https://supabase.com)
- AI-Shu project created in Supabase

## Step 1: Configure Authentication Settings

1. Go to your Supabase Dashboard
2. Navigate to `Authentication` → `URL Configuration`
3. Add the following URLs:

### For Local Development:
- **Site URL**: `http://localhost:3002`
- **Redirect URLs**:
  - `http://localhost:3002/**`
  - `http://localhost:3000/**` (legacy support)

### For Production:
- **Site URL**: Your deployed domain (e.g., `https://ai-shu.vercel.app`)
- **Redirect URLs**:
  - `https://your-domain.vercel.app/**`
  - `http://localhost:3002/**` (keep for development)

## Step 2: Email Confirmation Settings

Go to `Authentication` → `Email Auth`:

### For Development (Recommended):
- ✅ Enable Email Provider
- ❌ Disable Email Confirmations
- This allows faster testing without email verification

### For Production:
- ✅ Enable Email Provider
- ✅ Enable Email Confirmations
- ✅ Enable Double Confirm Email Changes
- This ensures security but requires email verification

## Step 3: Run Database Migrations

The following migrations need to be applied in order:

```sql
-- 1. Initial Schema
-- Run: supabase/migrations/00001_init_schema.sql

-- 2. Assessments & Progress
-- Run: supabase/migrations/00002_assessments_progress.sql

-- 3. RLS Policies
-- Run: supabase/migrations/00003_rls_policies.sql

-- 4. Fix RLS INSERT Policies
-- Run: supabase/migrations/00004_fix_rls_insert_policies.sql
```

Or use the Supabase CLI:
```bash
supabase db push
```

## Step 4: Get Your Credentials

1. Go to `Settings` → `API`
2. Copy the following values to your `.env.local` file:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 5: Configure Email Templates (Optional)

Go to `Authentication` → `Email Templates` and customize:

1. **Confirm Signup** - Sent when users sign up
2. **Reset Password** - Sent when users request password reset
3. **Magic Link** - Sent for passwordless login

### Important Template Variables:
- `{{ .ConfirmationURL }}` - Email confirmation link
- `{{ .Token }}` - Auth token
- `{{ .TokenHash }}` - Token hash
- `{{ .SiteURL }}` - Your site URL

## Common Issues & Fixes

### Issue: "Auth session missing!" error
**Fix**: Ensure redirect URLs include your local development port (3002) in Supabase dashboard

### Issue: "No link with id: XXXXX" error
**Fix**:
1. Check if email confirmation is enabled but user hasn't confirmed email
2. Verify redirect URLs match in Supabase settings
3. Ensure password reset link hasn't expired (default: 1 hour)

### Issue: "Failed to fetch" during signup/login
**Fix**:
1. Verify Supabase credentials in `.env.local`
2. Check if Supabase project is active and not paused
3. Ensure RLS policies are properly configured

### Issue: Users can't complete profile setup
**Fix**: Run migration `00004_fix_rls_insert_policies.sql` to add INSERT permissions

## Testing Authentication

1. **Sign Up**: http://localhost:3002/auth/signup
   - If email confirmation is disabled, redirects immediately to profile setup
   - If enabled, shows message to check email

2. **Log In**: http://localhost:3002/auth/login
   - Redirects to dashboard if profile exists
   - Redirects to profile setup if new user

3. **Password Reset**: http://localhost:3002/auth/reset-password
   - Sends email with reset link
   - Link expires in 1 hour
   - Redirects to update-password page

## Security Notes

- Never commit `.env.local` to git
- Keep your anon key public-facing (it's safe)
- Keep your service_role key SECRET (never expose to client)
- RLS policies protect data even with anon key
- Use HTTPS in production for all authentication flows

## Production Deployment Checklist

- [ ] Email confirmations enabled
- [ ] Production domain added to redirect URLs
- [ ] Email templates customized
- [ ] RLS policies tested and verified
- [ ] Service role key secured
- [ ] Rate limiting configured
- [ ] CORS settings verified
