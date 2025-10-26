# AI-Shu Setup Guide

This guide will walk you through setting up the AI-Shu development environment.

## Prerequisites

- Node.js 18+ and npm 9+
- Supabase CLI: `npm install -g supabase`
- Git

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Local Development

```bash
# Start Supabase local instance (requires Docker)
supabase start

# This will output your local Supabase credentials:
# - API URL: http://localhost:54321
# - Anon key: <your-anon-key>
# - Service role key: <your-service-role-key>
```

### 3. Configure Environment Variables

#### Web App Environment

```bash
# Copy the example file
cp apps/web/.env.example apps/web/.env.local

# Edit apps/web/.env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-supabase-start>
```

#### Supabase Edge Functions Environment

```bash
# Copy the example file
cp supabase/.env.example supabase/.env.local

# Add your AI service API keys (optional for initial development)
# OPENAI_API_KEY=sk-...
# ELEVENLABS_API_KEY=...
# DID_API_KEY=...
```

### 4. Run Migrations

```bash
# Apply database migrations
supabase db reset
```

### 5. Start Development Servers

```bash
# Start all apps (Next.js frontend)
npm run dev

# In a separate terminal, deploy Edge Functions locally
supabase functions serve
```

### 6. Access the Application

- **Web App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **Edge Functions**: http://localhost:54321/functions/v1

## Development Workflow

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint

# Fix linting issues automatically
npm run format
```

### Building for Production

```bash
npm run build
```

## AI Services Setup (Optional for MVP)

The platform integrates with several AI services. These are optional during initial development as the system uses mocks when API keys are not provided.

### OpenAI GPT-4

1. Sign up at https://platform.openai.com
2. Generate an API key
3. Add to `supabase/.env.local`: `OPENAI_API_KEY=sk-...`

### ElevenLabs Voice Cloning

1. Sign up at https://elevenlabs.io
2. Create a voice clone of Aishu (requires 1-5 min audio sample)
3. Get API key from account settings
4. Add to `supabase/.env.local`: `ELEVENLABS_API_KEY=...`

### D-ID Avatar

1. Sign up at https://studio.d-id.com
2. Upload a photo/video of Aishu
3. Get API key from account settings
4. Add to `supabase/.env.local`: `DID_API_KEY=...`

### Agora.io WebRTC

1. Sign up at https://console.agora.io
2. Create a new project
3. Get App ID and Certificate
4. Add to both `apps/web/.env.local` and `supabase/.env.local`:
   ```
   NEXT_PUBLIC_AGORA_APP_ID=...
   AGORA_APP_CERTIFICATE=...
   ```

## Database Management

### View Database

Access Supabase Studio at http://localhost:54323 to view and manage your database.

### Create New Migration

```bash
supabase migration new <migration_name>
```

### Reset Database

```bash
supabase db reset
```

## Troubleshooting

### Supabase won't start

- Ensure Docker is running
- Check if ports 54321-54323 are available
- Run `supabase stop` and `supabase start` again

### Node modules issues

```bash
rm -rf node_modules
npm install
```

### Build errors

```bash
npm run clean
npm run build
```

## Project Structure

```
ai-shu/
├── apps/
│   └── web/              # Next.js frontend
├── packages/
│   ├── ui/               # Shared React components
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared configs (ESLint, etc.)
├── supabase/
│   ├── functions/        # Edge Functions (Deno)
│   └── migrations/       # Database migrations
└── turbo.json            # Turborepo config
```

## Next Steps

1. Review the [Architecture Documentation](./README.md)
2. Check out the [Development Roadmap](./claude.md)
3. Start building! The first milestone is authentication setup.

## Support

For issues or questions, check the documentation or open an issue in the repository.
