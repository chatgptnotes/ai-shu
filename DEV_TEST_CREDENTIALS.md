# Development Test Credentials

## Overview

Pre-filled test credentials have been added to the login and signup pages to streamline development testing. These credentials are **only visible in development mode** (`NODE_ENV=development`) and will not appear in production builds.

## Available Test Users

The following test users have been created in Supabase and are ready to use:

### Student Accounts

1. **Primary Test User (Login Page)**
   - Email: `test@ai-shu.com`
   - Password: `TestPass123!`
   - Role: Student
   - Usage: Pre-filled on `/auth/login`

2. **Secondary Test User (Signup Page)**
   - Email: `dev@ai-shu.com`
   - Password: `DevPass123!`
   - Role: Student
   - Usage: Pre-filled on `/auth/signup`

### Teacher Account

3. **Test Teacher**
   - Email: `teacher@ai-shu.com`
   - Password: `TeacherPass123!`
   - Role: Teacher
   - Usage: Manual login for testing teacher features

### Admin Account

4. **Test Admin**
   - Email: `admin@ai-shu.com`
   - Password: `AdminPass123!`
   - Role: Admin
   - Usage: Manual login for testing admin features

## Visual Indicators

When in development mode, both login and signup pages display a blue badge at the top:

```
Development Mode: Test credentials pre-filled
Email: test@ai-shu.com | Password: TestPass123!
```

This badge:
- Only appears in development (`NODE_ENV=development`)
- Shows the pre-filled credentials
- Does not appear in production builds

## Features Implemented

### 1. Login Page (`/auth/login`)
- Pre-filled email: `test@ai-shu.com`
- Pre-filled password: `TestPass123!`
- Development mode badge with credentials displayed
- File: `apps/web/src/app/auth/login/page.tsx`

### 2. Signup Page (`/auth/signup`)
- Pre-filled full name: `Test Developer`
- Pre-filled email: `dev@ai-shu.com`
- Pre-filled password: `DevPass123!`
- Pre-filled confirm password: `DevPass123!`
- Development mode badge with credentials displayed
- File: `apps/web/src/app/auth/signup/page.tsx`

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the login page:**
   ```
   http://localhost:3002/auth/login
   ```
   - Credentials are already pre-filled
   - Click "Sign in" to log in immediately

3. **Access the signup page:**
   ```
   http://localhost:3002/auth/signup
   ```
   - All fields are pre-filled
   - Click "Sign up" to create a new account (though these test users already exist)

## Creating Additional Test Users

To add more test users, use the provided script:

```bash
node scripts/create-test-users.js
```

To modify test users, edit `scripts/create-test-users.js` and add your custom users to the `testUsers` array.

## Security Notes

- Test credentials are **only pre-filled in development mode**
- The development mode check uses `process.env.NODE_ENV === 'development'`
- In production builds, forms will be empty (no pre-filled values)
- The blue development badge will not appear in production

## Files Modified

1. `apps/web/src/app/auth/login/page.tsx` - Added pre-filled test credentials
2. `apps/web/src/app/auth/signup/page.tsx` - Added pre-filled test credentials
3. `scripts/create-test-users.js` - Script to create test users in Supabase

## Testing Checklist

- ✅ Login page shows development mode badge
- ✅ Login page has pre-filled email and password
- ✅ Signup page shows development mode badge
- ✅ Signup page has pre-filled name, email, and passwords
- ✅ Test users created in Supabase with email confirmation enabled
- ✅ All test users can successfully log in
- ✅ Student profiles created for all test users

## Troubleshooting

### Login fails with "Invalid credentials"

If login fails, re-run the user creation script:

```bash
node scripts/create-test-users.js
```

This will ensure all test users exist in Supabase with the correct credentials.

### Badge not showing

Make sure:
1. You're running in development mode: `npm run dev`
2. Check `NODE_ENV` is set to `development`
3. Hard refresh the browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Test users already exist error

The script handles this gracefully and will skip existing users. You can safely re-run it.

## Production Deployment

When deploying to production:
- All test credentials will be hidden automatically
- Forms will be empty
- No development badges will appear
- Test users remain in the database (consider removing or disabling them in production)

---

**Last Updated:** 2025-10-26
**Version:** 1.0.0
