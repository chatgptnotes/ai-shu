# AI-Shu - Photorealistic AI Tutor Platform

AI-Shu is a photorealistic AI-powered personal tutor designed to scale engaging, personalized education for K-12 and university students.

## Project Structure

```
ai-shu/
├── apps/
│   └── web/              # Next.js frontend application
├── packages/
│   ├── ui/               # Shared React component library
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared configuration (ESLint, TS, etc.)
├── supabase/
│   ├── functions/        # Edge Functions (Deno-based serverless)
│   └── migrations/       # Database schema migrations
└── turbo.json            # Turborepo configuration
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18, TypeScript)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **3D Avatar**: D-ID API
- **Real-time**: Agora.io WebRTC
- **Whiteboard**: Tldraw

### Backend
- **Platform**: Supabase (fully managed)
- **Database**: PostgreSQL with Row Level Security
- **Auth**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage (S3-compatible)
- **Realtime**: Supabase Realtime (WebSocket subscriptions)
- **Edge Functions**: Deno-based serverless functions

### AI Services
- **Avatar**: D-ID (photorealistic video generation)
- **Voice Clone**: ElevenLabs
- **Speech-to-Text**: OpenAI Whisper
- **LLM**: OpenAI GPT-4
- **Orchestration**: LangChain

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase CLI (optional): `npm install -g supabase`

### Quick Start

**See [QUICKSTART.md](./QUICKSTART.md) for detailed 5-minute setup instructions.**

```bash
# 1. Install dependencies
npm install

# 2. Deploy database schema (choose one):
# Option A: Using Supabase CLI
supabase link --project-ref mdzavfrynjjivxvvibnr
supabase db push

# Option B: Run SQL manually in Supabase Dashboard
# Copy content from supabase/migrations/*.sql into SQL Editor

# 3. Start development
npm run dev

# 4. Visit http://localhost:3000
```

Environment variables are already configured in `apps/web/.env.local` and `supabase/.env.local`.

### Development Commands

```bash
npm run dev      # Start all apps in development mode
npm run build    # Build all apps
npm run lint     # Lint all apps
npm run test     # Run tests for all apps
npm run format   # Format code with Prettier
```

## Environment Variables

**Already configured!** No setup needed unless adding new API keys.

### Web App (apps/web/.env.local)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (configured)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (configured)
- ✅ `OPENAI_API_KEY` - OpenAI API key (configured)
- ⏳ `ELEVENLABS_API_KEY` - ElevenLabs API key (optional)
- ⏳ `DID_API_KEY` - D-ID API key (optional)
- ⏳ `NEXT_PUBLIC_AGORA_APP_ID` - Agora.io app ID (optional)

### Edge Functions (supabase/.env.local)
- ✅ `SUPABASE_URL` - Supabase project URL (configured)
- ✅ `SUPABASE_ANON_KEY` - Supabase anonymous key (configured)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key (configured)
- ✅ `OPENAI_API_KEY` - OpenAI API key (configured)
- ⏳ `ELEVENLABS_API_KEY` - ElevenLabs API key (optional)
- ⏳ `DID_API_KEY` - D-ID API key (optional)
- ⏳ `AGORA_APP_ID` - Agora.io app ID (optional)
- ⏳ `AGORA_APP_CERTIFICATE` - Agora.io app certificate (optional)

## Architecture

### Phase 1 MVP (6 months)
1. Month 1: Foundation & Authentication
2. Month 2: AI Avatar Integration
3. Month 3: LLM Teaching Engine
4. Month 4: Interactive Classroom Tools
5. Month 5: Session Management & Notes
6. Month 6: Parent Dashboard & Polish

## License

Proprietary - All Rights Reserved
