# Quick Win Modules - AI-Shu

Modules organized by implementation time and complexity.

---

## SUPER QUICK (15-30 minutes each)

### 1. Empty State Illustrations
- **Where**: Dashboard when no sessions exist
- **Effort**: 15-20 min
- **Files**: `apps/web/src/app/dashboard/page.tsx`
- **What**: Add friendly message and "Create First Session" button when sessions array is empty
- **Dependencies**: None

### 2. Subject Icons
- **Where**: Dashboard session cards, new session form
- **Effort**: 20-30 min
- **Files**: `apps/web/src/app/dashboard/page.tsx`, `apps/web/src/app/session/new/NewSessionForm.tsx`
- **What**: Add Google Material Icons for each subject (Math: calculate, Physics: science, etc.)
- **Dependencies**: None (Material Icons already specified in CLAUDE.md)

### 3. Loading States
- **Where**: Dashboard, session page
- **Effort**: 20-30 min
- **Files**: `apps/web/src/app/dashboard/page.tsx`, `apps/web/src/app/session/[id]/page.tsx`
- **What**: Add skeleton screens using Shadcn/ui Skeleton component
- **Dependencies**: None (Shadcn UI already installed)

### 4. Session Duration Display
- **Where**: Dashboard session cards
- **Effort**: 15-20 min
- **Files**: `apps/web/src/app/dashboard/page.tsx`
- **What**: Calculate and display time between created_at and updated_at
- **Dependencies**: None (data already in database)

### 5. Help/FAQ Page
- **Where**: New route `/help`
- **Effort**: 30 min
- **Files**: Create `apps/web/src/app/help/page.tsx`
- **What**: Static page with common questions about AI-Shu
- **Dependencies**: None

---

## QUICK (30-60 minutes each)

### 6. About Page
- **Where**: New route `/about`
- **Effort**: 30-45 min
- **Files**: Create `apps/web/src/app/about/page.tsx`
- **What**: Explain Three-C Model, teaching philosophy, team
- **Dependencies**: Content from CLAUDE.md

### 7. Toast Notifications
- **Where**: Global (all forms, actions)
- **Effort**: 45-60 min
- **Files**: Create `apps/web/src/components/ui/toast.tsx`, add to layout
- **What**: Success/error/info notifications using Shadcn Toast
- **Dependencies**: Install @radix-ui/react-toast

### 8. Confirmation Modals
- **Where**: Delete session action
- **Effort**: 45-60 min
- **Files**: Create `apps/web/src/components/ui/confirm-dialog.tsx`
- **What**: "Are you sure?" modal before destructive actions
- **Dependencies**: Shadcn Dialog component

### 9. Delete Session Feature
- **Where**: Dashboard session cards
- **Effort**: 45-60 min
- **Files**: `apps/web/src/app/dashboard/page.tsx`, create API route
- **What**: Delete button on each session with confirmation
- **Dependencies**: Confirmation modal (#8)

### 10. Keyboard Shortcuts
- **Where**: Global (all pages)
- **Effort**: 45-60 min
- **Files**: Create `apps/web/src/hooks/useKeyboardShortcuts.ts`
- **What**: Escape to close modals, Ctrl+N for new session, / for search
- **Dependencies**: None

---

## MEDIUM (1-2 hours each)

### 11. User Profile Page
- **Where**: New route `/profile`
- **Effort**: 60-90 min
- **Files**: Create `apps/web/src/app/profile/page.tsx`
- **What**: Edit name, email, preferences; update Supabase profiles table
- **Dependencies**: None (table already exists)

### 12. Search/Filter Sessions
- **Where**: Dashboard
- **Effort**: 60-90 min
- **Files**: `apps/web/src/app/dashboard/page.tsx`
- **What**: Search bar + filter dropdowns (subject, date range, status)
- **Dependencies**: None

### 13. Session Statistics Widget
- **Where**: Dashboard top section
- **Effort**: 75-90 min
- **Files**: `apps/web/src/app/dashboard/page.tsx`
- **What**: Cards showing: Total sessions, Hours learned, Favorite subject, This week's progress
- **Dependencies**: Session data

### 14. Export Chat History
- **Where**: Session page
- **Effort**: 90-120 min
- **Files**: `apps/web/src/app/session/[id]/page.tsx`, create export utility
- **What**: Download button to export messages as .txt or .md file
- **Dependencies**: None

### 15. Dark Mode Toggle
- **Where**: Header/Settings
- **Effort**: 90-120 min
- **Files**: `apps/web/src/app/layout.tsx`, create theme provider
- **What**: Toggle between light/dark themes, persist preference
- **Dependencies**: next-themes package

---

## IMPLEMENTATION PRIORITY (Recommended Order)

### Phase 1: UX Polish (Day 1)
1. Empty state illustrations (20 min)
2. Loading states (30 min)
3. Subject icons (30 min)
4. Session duration display (20 min)
**Total: ~2 hours**

### Phase 2: Core Features (Day 2)
5. Toast notifications (60 min)
6. Confirmation modals (60 min)
7. Delete session feature (60 min)
8. Session statistics widget (90 min)
**Total: ~4.5 hours**

### Phase 3: Enhancement (Day 3)
9. Search/filter sessions (90 min)
10. User profile page (90 min)
11. Keyboard shortcuts (60 min)
12. Help/FAQ page (30 min)
**Total: ~4.5 hours**

### Phase 4: Advanced (Day 4)
13. Dark mode toggle (120 min)
14. Export chat history (120 min)
15. About page (45 min)
**Total: ~4.75 hours**

---

## TECHNICAL NOTES

### Already Available
- Shadcn/ui components (Button, Card, Dialog, etc.)
- Tailwind CSS for styling
- Supabase client configured
- TypeScript setup
- Next.js App Router

### Need to Install
- `@radix-ui/react-toast` for notifications
- `next-themes` for dark mode
- `lucide-react` for icons (if not already installed)

### Database Changes Required
- None! All modules work with existing schema

### Files to Create
- Toast component wrapper
- Confirmation dialog component
- Keyboard shortcuts hook
- Theme provider component
- Help page
- About page
- Profile page
- Export utility function

---

## ESTIMATED TOTAL TIME

- **All 15 modules**: ~15-20 hours
- **Phase 1 only (UX Polish)**: ~2 hours
- **Phases 1-2 (UX + Core)**: ~6.5 hours
- **Phases 1-3 (Everything except Advanced)**: ~11 hours

---

## COMPLEXITY BREAKDOWN

| Complexity | Count | Examples |
|------------|-------|----------|
| Super Quick | 5 | Empty states, icons, loading, duration, help page |
| Quick | 5 | About, toasts, modals, delete, shortcuts |
| Medium | 5 | Profile, search, stats, export, dark mode |

---

## RECOMMENDED STARTING POINT

**Start with Phase 1 (UX Polish)** - These give immediate visual improvements with minimal effort:

1. Empty state illustrations - Makes dashboard friendly for new users
2. Loading states - Professional feel during data fetching
3. Subject icons - Visual appeal and better UX
4. Session duration - Useful metric for students

Then move to **Delete session** + **Toast notifications** for practical functionality.

---

**All modules are production-ready and require no breaking changes to existing code.**
