# Claude Autonomous Build Instructions

## MISSION
Build and ship AI-Shu, a photorealistic AI-powered personal tutor platform that enables K-12 and university students to learn interactively from an AI avatar that looks and sounds like Aishu, with adaptive teaching, real-time interaction, and comprehensive classroom tools.

## TECH STACK & TARGETS
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: NestJS, Node.js, TypeScript
- **Database**: PostgreSQL via Supabase
- **AI Services**: D-ID (avatar), ElevenLabs (voice), OpenAI GPT-4 (LLM), Whisper (STT)
- **Real-time**: Agora.io WebRTC, Socket.io
- **Deployment**: Vercel (frontend), AWS/Railway (backend)
- **Monorepo**: Turborepo with npm workspaces

## REPO/ENV
- **Repo**: /Users/murali/1 imp backups/Ai-shu
- **Package Manager**: npm
- **OS**: macOS (Darwin 24.6.0)
- **Node**: >=18.0.0

## DEADLINES/BOUNDS
- Phase 1 MVP: 6 months
- Use mocks for AI services until API keys provided
- Auto-downgrade features for low-bandwidth scenarios
- Support 5 languages: English, Chinese, Hindi, Spanish, Arabic

## OPERATING RULES (AUTONOMOUS MODE)
- ✅ No confirmation requests - make sensible decisions
- ✅ Work in verifiable increments with local tests
- ✅ Choose alternatives when blocked, document deviations
- ✅ Production-grade: security, error handling, logging
- ✅ No emojis - use Google Material Icons
- ✅ Version footer on all pages (version + date)
- ✅ Suggest test URLs after completing tasks

## DELIVERABLES
1. ✅ Working code with meaningful commits
2. ✅ `npm run dev` and `npm run build` scripts
3. ✅ Tests covering core logic
4. ✅ `.env.example` with documentation
5. ✅ README.md with quickstart & deploy steps
6. ✅ Graceful error handling
7. ✅ `npm run lint:fix` configured
8. ✅ Final CHANGELOG

## QUALITY BARS
- Zero TypeScript/ESLint errors
- All tests passing
- No secrets in code
- Input validation & rate limiting
- Documentation matches actual behavior

## CURRENT PHASE
Phase 1, Month 1: Foundation & Core Setup (Weeks 1-4)
