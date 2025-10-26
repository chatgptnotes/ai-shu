# AI-Shu Testing Guide

## v0.2.0 - Authentication System Testing

**Date**: January 31, 2025
**Server**: http://localhost:3000

---

## 🧪 Test Complete Authentication Flow

### Test 1: New User Signup

**Steps:**
1. Visit http://localhost:3000
2. Click "Get Started" button
3. Fill in the signup form:
   - Full Name: "Test Student"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Click "Sign up"

**Expected Result:**
- ✅ Form submits successfully
- ✅ Redirects to `/auth/setup-profile`
- ✅ User is authenticated (cookies set)

---

### Test 2: Profile Setup

**Steps:**
1. After signup, you should be on `/auth/setup-profile`
2. Fill in profile details:
   - Grade Level: Select any (e.g., "Grade 10")
   - Curriculum: Select "IB" (or any other)
   - Preferred Language: Select "English"
   - Timezone: Auto-filled (you can change if needed)
3. Click "Complete setup"

**Expected Result:**
- ✅ Profile created successfully
- ✅ Redirects to `/dashboard`
- ✅ Dashboard shows welcome message with your name
- ✅ Shows "Total Sessions: 0"
- ✅ Shows your curriculum and grade level

---

### Test 3: Dashboard Features

**Steps:**
1. On the dashboard, verify you can see:
   - Welcome message with your name
   - Quick stats card showing:
     - Total Sessions
     - Curriculum
     - Grade Level
   - Start Learning card with subject buttons
   - Recent Sessions card (empty for new users)

**Expected Result:**
- ✅ All sections visible
- ✅ User name displayed correctly
- ✅ Stats match your profile

---

### Test 4: Logout and Login

**Steps:**
1. Manually navigate to `/auth/login` (logout functionality not yet implemented)
2. Or open an incognito window and visit http://localhost:3000/auth/login
3. Enter credentials:
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Sign in"

**Expected Result:**
- ✅ Login successful
- ✅ Redirects to `/dashboard`
- ✅ User data persists

---

### Test 5: Password Reset Flow

**Steps:**
1. Visit http://localhost:3000/auth/login
2. Click "Forgot password?"
3. Enter email: "test@example.com"
4. Click "Send reset link"

**Expected Result:**
- ✅ Shows success message
- ✅ "Check your email" card appears
- ✅ In Supabase dashboard, check Auth > Users to verify reset email was sent

---

### Test 6: Form Validation

**Test 6a: Signup Validation**

Visit `/auth/signup` and test:

| Test Case | Input | Expected Error |
|-----------|-------|----------------|
| Empty form | All fields blank | "All fields are required" |
| Invalid email | "notanemail" | "Please enter a valid email address" |
| Short password | "12345" | "Password must be at least 6 characters" |
| Passwords don't match | password: "abc123", confirm: "abc456" | "Passwords do not match" |

**Test 6b: Login Validation**

Visit `/auth/login` and test:

| Test Case | Input | Expected Error |
|-----------|-------|----------------|
| Wrong password | Correct email, wrong password | "Invalid email or password" |
| Non-existent user | "nonexistent@example.com" | "Invalid email or password" |

---

## 🔒 Protected Routes Testing

### Test 7: Dashboard Access Without Auth

**Steps:**
1. Open incognito window
2. Visit http://localhost:3000/dashboard

**Expected Result:**
- ✅ Redirects to `/auth/login`
- ✅ Cannot access dashboard without authentication

---

### Test 8: Setup Profile Access Without Auth

**Steps:**
1. Open incognito window
2. Visit http://localhost:3000/auth/setup-profile

**Expected Result:**
- ✅ Redirects to `/auth/login`
- ✅ Protected from unauthorized access

---

## 📊 Database Verification

### Test 9: Verify Data in Supabase

**Steps:**
1. Visit https://supabase.com/dashboard/project/mdzavfrynjjivxvvibnr
2. Go to "Table Editor"
3. Check these tables:

**auth.users:**
- ✅ New user exists
- ✅ Email matches
- ✅ user_metadata contains full_name

**user_profiles:**
- ✅ Record exists for user
- ✅ role = 'student'

**student_profiles:**
- ✅ Record exists linked to user_id
- ✅ full_name matches
- ✅ grade_level correct
- ✅ curriculum correct
- ✅ language correct

---

## 🐛 Known Issues & Limitations

### Current Limitations (v0.2.0):
- ⏳ No logout button (manual URL navigation needed)
- ⏳ No email verification (users can sign in immediately)
- ⏳ No profile editing after setup
- ⏳ Session links on dashboard lead to 404 (not yet built)
- ⏳ No parent account creation
- ⏳ No actual tutoring sessions yet

---

## 🎯 Success Criteria

**All authentication features working if:**
- ✅ Can create new account
- ✅ Form validation works
- ✅ Profile setup completes
- ✅ Dashboard loads with user data
- ✅ Login works after logout
- ✅ Password reset emails sent
- ✅ Protected routes redirect to login
- ✅ Data persists in Supabase

---

## 📝 Test Results Checklist

After testing, verify:
- [ ] Signup flow complete
- [ ] Login flow complete
- [ ] Password reset flow complete
- [ ] Profile setup flow complete
- [ ] Dashboard displays correctly
- [ ] Protected routes working
- [ ] Form validations working
- [ ] Database records created correctly
- [ ] Session persistence working

---

## 🚀 Next Testing Phase

**Week 3 Features to Test:**
- Email verification
- User logout
- Profile editing
- Parent account creation
- Session scheduling (when implemented)

---

**Testing completed on**: _________
**Tested by**: _________
**Version**: v0.2.0
**Status**: All tests passing ✅ / Issues found ⚠️

---

## 💡 Tips for Testing

1. **Use Chrome DevTools**:
   - Network tab to see API calls
   - Application > Cookies to verify session tokens
   - Console for any errors

2. **Check Supabase Logs**:
   - Go to Logs > Auth Logs in Supabase dashboard
   - View real-time authentication events

3. **Test on Multiple Browsers**:
   - Chrome
   - Safari
   - Firefox
   - Mobile browsers (responsive design)

4. **Clear Data Between Tests**:
   - Use incognito/private windows
   - Or clear cookies/localStorage between tests
