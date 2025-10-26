# AI-Shu Quick Start

Get the AI-Shu platform running in 5 minutes.

## Prerequisites

- Node.js 18+ and npm 9+
- A Supabase account (already configured)
- OpenAI API key (already configured)

## Step 1: Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo including:
- Next.js frontend
- Shared packages (UI, types, config)
- Development tools

## Step 2: Deploy Database Schema

The database migrations need to be applied to your Supabase project. You have two options:

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref mdzavfrynjjivxvvibnr

# Push migrations
supabase db push
```

### Option B: Manual via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/mdzavfrynjjivxvvibnr/editor
2. Navigate to SQL Editor
3. Run the following files in order:
   - Copy content from `supabase/migrations/00001_init_schema.sql` → Execute
   - Copy content from `supabase/migrations/00002_assessments_progress.sql` → Execute
   - Copy content from `supabase/migrations/00003_rls_policies.sql` → Execute

## Step 3: Deploy Edge Functions (Optional for MVP)

To deploy the session summary generator Edge Function:

```bash
# Deploy all Edge Functions
supabase functions deploy

# Or deploy a specific function
supabase functions deploy generate-session-summary
```

## Step 4: Start Development Server

```bash
npm run dev
```

This will start:
- Next.js dev server at http://localhost:3000
- Turbo watch mode for all packages

## Step 5: Open the App

Visit http://localhost:3000 in your browser.

You should see the AI-Shu welcome page with options to sign up or sign in.

## What's Configured

✅ Supabase connection (production instance)
- URL: https://mdzavfrynjjivxvvibnr.supabase.co
- Authentication ready
- Database schema ready (after Step 2)

✅ OpenAI GPT-4 integration
- API key configured
- Ready for AI tutoring features

⏳ Pending Configuration (Optional for MVP):
- ElevenLabs (voice cloning) - Add `ELEVENLABS_API_KEY` to `.env.local`
- D-ID (avatar) - Add `DID_API_KEY` to `.env.local`
- Agora.io (WebRTC) - Add `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` to `.env.local`

## Next Steps

### 1. Create Your First User

Navigate to http://localhost:3000 and click "Get Started" to create a student account.

### 2. Check Supabase Dashboard

- Tables: https://supabase.com/dashboard/project/mdzavfrynjjivxvvibnr/editor
- Auth: https://supabase.com/dashboard/project/mdzavfrynjjivxvvibnr/auth/users
- Storage: https://supabase.com/dashboard/project/mdzavfrynjjivxvvibnr/storage/buckets

### 3. Start Building Features

The MVP roadmap is in `claude.md`. Current phase: Month 1 - Foundation & Core Setup

Priority features to build:
1. Authentication (signup/login pages)
2. Student dashboard
3. Session creation
4. Basic AI tutor chat interface

## Testing

```bash
# Run all tests (when implemented)
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## Troubleshooting

### Port already in use

If port 3000 is taken:
```bash
PORT=3001 npm run dev
```

### Environment variables not loading

Make sure you're in the correct directory:
```bash
cd /Users/murali/1\ imp\ backups/Ai-shu
```

### Supabase connection errors

Verify your credentials in `apps/web/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` should be `https://mdzavfrynjjivxvvibnr.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` should match your Supabase dashboard

### Database migration errors

Make sure you're running migrations in the correct order (00001, 00002, 00003).

## Project Structure

```
ai-shu/
├── apps/
│   └── web/              # Next.js app (http://localhost:3000)
├── packages/
│   ├── ui/               # Shared components
│   ├── types/            # TypeScript types
│   └── config/           # ESLint/Prettier configs
├── supabase/
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migrations
└── .env files configured with your credentials
```

## Available Commands

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps for production
- `npm run lint` - Lint all code
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean all build artifacts

## Support

- Documentation: See `README.md` and `SETUP.md`
- Masterplan: See `AI-Shu Masterplan` document
- Development roadmap: See `claude.md`

---

**You're all set!** Start building the future of AI-powered education. 🚀
