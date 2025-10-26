# 🔑 Required Credentials & Configurations for AI-Shu

**Status**: 📋 Checklist for Full Feature Activation
**Date**: 2025-10-26
**Priority**: Complete these items to activate all platform features

---

## 📊 Quick Overview

| Category | Items | Priority | Estimated Time |
|----------|-------|----------|----------------|
| Database | 1 item | 🔴 CRITICAL | 2 minutes |
| Payment | 8 items | 🔴 CRITICAL | 15 minutes |
| AI Services | 4 services | 🟡 HIGH | 30 minutes |
| Video/Avatar | 2 services | 🟢 MEDIUM | 20 minutes |
| Optional | 3 items | ⚪ LOW | 10 minutes |
| **TOTAL** | **18 items** | - | **~75 minutes** |

---

## 🔴 CRITICAL (Required for Core Features)

### 1. Supabase Database ⚠️ IMMEDIATE

**What**: Fresh API key from Supabase dashboard
**Why**: Current API key is invalid - authentication won't work
**Time**: 2 minutes
**Priority**: 🔴 CRITICAL - Fix immediately

#### Steps:
1. Go to: https://app.supabase.com
2. Select your AI-Shu project
3. Navigate to: **Settings → API**
4. Copy the **"anon public"** key (NOT service_role)
5. Update in Vercel:
   - Go to: https://vercel.com/chatgptnotes-6366s-projects/ai-shu/settings/environment-variables
   - Find: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Update with new key
   - Redeploy

#### Also Update Locally:
```bash
# Edit this file:
apps/web/.env.local

# Update this line:
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-your-fresh-key-here>
```

**Documentation**: See `SUPABASE_API_KEY_FIX.md`

---

### 2. Stripe Payment Processing 💳

**What**: Stripe API keys and product price IDs
**Why**: Users cannot subscribe to paid plans without Stripe
**Time**: 15 minutes
**Priority**: 🔴 CRITICAL - Required for revenue

#### Steps:

##### A. Get API Keys (5 min)
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy **Publishable key** (starts with `pk_`)
3. Copy **Secret key** (starts with `sk_`)
4. Go to: https://dashboard.stripe.com/webhooks
5. Click "Add endpoint"
6. Set URL: `https://your-vercel-url.vercel.app/api/stripe/webhook`
7. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
8. Copy **Signing secret** (starts with `whsec_`)

##### B. Create Products & Prices (10 min)
1. Go to: https://dashboard.stripe.com/products
2. Create 3 products with monthly & yearly prices:

**Product 1: Basic Plan**
- Name: "AI-Shu Basic"
- Monthly price: $9.99/month
- Yearly price: $99/year
- Copy Price IDs

**Product 2: Pro Plan**
- Name: "AI-Shu Pro"
- Monthly price: $19.99/month
- Yearly price: $199/year
- Copy Price IDs

**Product 3: School Plan**
- Name: "AI-Shu School"
- Monthly price: $29.99/month
- Yearly price: $299/year
- Copy Price IDs

##### C. Add to Vercel Environment Variables
Go to: https://vercel.com/chatgptnotes-6366s-projects/ai-shu/settings/environment-variables

Add these 9 variables:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_BASIC_YEARLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_SCHOOL_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_SCHOOL_YEARLY=price_xxxxx
```

##### D. Update Subscription Config
Edit: `apps/web/src/config/subscription-tiers.ts`
- Update stripe price IDs with your actual Stripe price IDs

**After completing**: Redeploy on Vercel

---

## 🟡 HIGH PRIORITY (Core AI Features)

### 3. OpenAI API (GPT-4 + Whisper) 🤖

**What**: OpenAI API key for AI chat and speech-to-text
**Why**: Core teaching functionality relies on GPT-4
**Time**: 5 minutes
**Priority**: 🟡 HIGH - Core feature

#### Steps:
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Add to Vercel environment variables:
   ```
   OPENAI_API_KEY=sk-xxxxxxxxxxxxx
   ```

**Cost**: ~$0.002 per message (GPT-4)
**Monthly estimate**: ~$50-200 depending on usage

**Note**: Without this, AI chat will not work (no fallback)

---

### 4. ElevenLabs Voice Cloning 🎤

**What**: ElevenLabs API key for Aishu's voice
**Why**: Text-to-speech for AI responses
**Time**: 10 minutes
**Priority**: 🟡 HIGH - Better user experience

#### Steps:
1. Go to: https://elevenlabs.io/sign-up
2. Navigate to: https://elevenlabs.io/api
3. Copy your API key
4. **(Optional but recommended)** Clone Aishu's voice:
   - Go to: https://elevenlabs.io/voice-lab
   - Upload 1-5 minute audio sample of Aishu speaking
   - Name it "Aishu"
   - Copy the Voice ID
5. Add to Vercel environment variables:
   ```
   ELEVENLABS_API_KEY=xxxxxxxxxxxxx
   NEXT_PUBLIC_ELEVENLABS_VOICE_ID=xxxxxxxxxxxxx  # If you cloned voice
   ```

**Cost**: Free tier: 10,000 characters/month, then ~$5/month
**Fallback**: Browser TTS (lower quality) if not configured

---

## 🟢 MEDIUM PRIORITY (Enhanced Features)

### 5. D-ID Avatar Generation 🎭

**What**: D-ID API key for photorealistic AI avatar
**Why**: Creates video avatar of Aishu for sessions
**Time**: 10 minutes
**Priority**: 🟢 MEDIUM - Enhanced experience

#### Steps:
1. Go to: https://studio.d-id.com/account-settings
2. Sign up / Sign in
3. Navigate to API keys section
4. Create new API key
5. **(Optional)** Upload Aishu's photo/video for custom avatar
6. Add to Vercel environment variables:
   ```
   DID_API_KEY=xxxxxxxxxxxxx
   NEXT_PUBLIC_AISHU_AVATAR_URL=https://url-to-aishu-image.jpg  # Optional
   ```

**Cost**: Free tier: 20 credits, then ~$0.30 per video minute
**Fallback**: Static avatar image if not configured

---

### 6. Agora.io WebRTC 📹

**What**: Agora App ID and Certificate for video calls
**Why**: Real-time video calls with AI avatar
**Time**: 10 minutes
**Priority**: 🟢 MEDIUM - Advanced feature

#### Steps:
1. Go to: https://console.agora.io/
2. Sign up / Sign in
3. Create a new project: "AI-Shu Production"
4. Enable "Secured mode: APP ID + Token"
5. Copy **App ID** and **App Certificate**
6. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_AGORA_APP_ID=xxxxxxxxxxxxx
   AGORA_APP_CERTIFICATE=xxxxxxxxxxxxx
   ```

**Cost**: Free tier: 10,000 minutes/month, then ~$0.99 per 1000 minutes
**Fallback**: Text-only chat if not configured

---

## ⚪ OPTIONAL (Nice to Have)

### 7. Sentry Error Tracking 🐛

**What**: Sentry DSN for error monitoring
**Why**: Track and fix production errors
**Time**: 5 minutes
**Priority**: ⚪ LOW - Production monitoring

#### Steps:
1. Go to: https://sentry.io/signup/
2. Create new project: "AI-Shu"
3. Select "Next.js" as platform
4. Copy the DSN (looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)
5. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

**Cost**: Free tier: 5,000 errors/month, then ~$26/month
**Note**: Already configured in code, just needs DSN

---

### 8. Google Analytics 📊

**What**: Google Analytics tracking ID
**Why**: Track user behavior and conversions
**Time**: 5 minutes
**Priority**: ⚪ LOW - Analytics

#### Steps:
1. Go to: https://analytics.google.com/
2. Create new property: "AI-Shu"
3. Copy Measurement ID (looks like: `G-XXXXXXXXXX`)
4. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```

**Cost**: Free
**Note**: Already configured in code, just needs ID

---

### 9. Custom Domain (Optional) 🌐

**What**: Custom domain for professional branding
**Why**: Better brand identity (e.g., app.ai-shu.com)
**Time**: 10 minutes
**Priority**: ⚪ LOW - Branding

#### Steps:
1. Purchase domain (e.g., from Namecheap, GoDaddy)
2. In Vercel: https://vercel.com/chatgptnotes-6366s-projects/ai-shu/settings/domains
3. Click "Add Domain"
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-30 minutes)

**Cost**: ~$10-15 per year

---

## 📝 Summary Checklist

### Before Users Can Sign Up:
- [ ] ✅ Update Supabase API key (CRITICAL)
- [ ] ✅ Configure Stripe (keys + products) (CRITICAL)
- [ ] ✅ Add OpenAI API key (HIGH)

### Before Full Features Work:
- [ ] ✅ Add ElevenLabs API key (HIGH)
- [ ] ✅ Add D-ID API key (MEDIUM)
- [ ] ✅ Add Agora.io credentials (MEDIUM)

### Before Production Launch:
- [ ] ⚪ Add Sentry DSN (OPTIONAL)
- [ ] ⚪ Add Google Analytics (OPTIONAL)
- [ ] ⚪ Configure custom domain (OPTIONAL)

---

## 🚀 Quick Start (Minimum Viable)

If you want to test ASAP, start with just these 3:

1. **Supabase API Key** (2 min) - Authentication
2. **Stripe Publishable Key** (2 min) - Basic payment UI
3. **OpenAI API Key** (2 min) - AI chat

**Total**: 6 minutes to basic functionality

Then add others as needed.

---

## 💰 Cost Estimate

### Monthly Costs (Rough):
- Supabase: $0 (free tier)
- Vercel: $0 (free tier, unless heavy traffic)
- OpenAI: $50-200 (depending on usage)
- ElevenLabs: $5-22 (after free tier)
- D-ID: $10-30 (after free tier)
- Agora.io: $0-20 (after free tier)
- Stripe: 2.9% + $0.30 per transaction
- Sentry: $0 (free tier)
- Google Analytics: $0 (free)

**Total**: ~$65-272/month (depending on usage)

**Note**: Most services have generous free tiers for testing

---

## 📚 Documentation

### Configuration Guides:
- `SETUP.md` - Development setup guide
- `SUPABASE_API_KEY_FIX.md` - Supabase troubleshooting
- `SUPABASE_CONFIGURATION_SUMMARY.md` - Database status
- `.env.example` - All environment variables with descriptions

### Testing:
- Run `node scripts/verify-supabase-schema.js` after Supabase setup
- Run `npm run build` to verify all configs are correct
- Test signup flow: https://your-vercel-url.vercel.app/auth/signup

---

## 🆘 Need Help?

### Priority Support:
1. **Supabase Issues**: Check `SUPABASE_API_KEY_FIX.md`
2. **Stripe Setup**: https://stripe.com/docs/keys
3. **OpenAI API**: https://platform.openai.com/docs/api-reference

### Quick Links:
- **Vercel Dashboard**: https://vercel.com/chatgptnotes-6366s-projects/ai-shu
- **Supabase Dashboard**: https://app.supabase.com/project/mdzavfrynjjivxvvibnr
- **GitHub Repo**: https://github.com/chatgptnotes/ai-shu

---

## ✅ After Configuration

Once all credentials are added:

1. **Redeploy on Vercel**:
   ```bash
   cd "/Users/murali/1 imp backups/Ai-shu"
   vercel --prod
   ```

2. **Test Core Features**:
   - Sign up with test account
   - Create a learning session
   - Send a message (tests OpenAI)
   - Try voice (tests ElevenLabs)
   - Upgrade plan (tests Stripe)

3. **Monitor**:
   - Check Sentry for errors
   - Check Stripe for payments
   - Check Supabase for user data

---

**Status**: 🟡 Ready for configuration
**Next Step**: Update Supabase API key in Vercel (2 min)
**ETA to Full Features**: ~75 minutes total

---

*Last Updated: 2025-10-26*
*Version: 1.0*
