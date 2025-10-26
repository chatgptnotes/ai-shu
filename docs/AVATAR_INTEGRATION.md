# D-ID Avatar Integration Guide

## Overview

AI-Shu uses D-ID's API to create photorealistic avatar videos of Aishu teaching students. The avatar speaks using either ElevenLabs (high-quality) or Microsoft Azure TTS (fallback) for voice synthesis.

## Architecture

```
User Message → OpenAI GPT-4 → AI Response Text
                                    ↓
                    ElevenLabs TTS (optional) → Audio
                                    ↓
                              D-ID API → Avatar Video
                                    ↓
                            AvatarVideo Component → Display
```

## Components

### 1. D-ID Client (`/lib/did/client.ts`)

Handles all D-ID API interactions:
- `createTalk()`: Generate avatar video from text/audio
- `getTalk()`: Check video generation status
- `pollTalkStatus()`: Wait for video completion
- `createStreamingTalk()`: Real-time streaming (future)

### 2. ElevenLabs Client (`/lib/elevenlabs/client.ts`)

Handles high-quality voice synthesis:
- `textToSpeech()`: Convert text to audio blob
- `textToSpeechUrl()`: Convert text to data URL for D-ID
- `getVoices()`: List available voices

### 3. Avatar Video Component (`/components/avatar/AvatarVideo.tsx`)

React component that:
- Displays the avatar video
- Handles loading states
- Implements video caching
- Provides playback controls

### 4. Avatar Cache (`/lib/avatar/cache.ts`)

In-memory cache for generated videos:
- Reduces API costs by caching repeated messages
- LRU eviction (max 5 videos by default)
- 1-hour TTL for cache entries

### 5. API Route (`/api/avatar/generate/route.ts`)

Server-side endpoint that:
- Accepts text from frontend
- Generates audio with ElevenLabs (if available)
- Creates D-ID video with audio/text
- Polls for completion
- Returns video URL

## Setup

### 1. Get API Keys

**D-ID** (Required):
1. Sign up at https://studio.d-id.com
2. Go to Account Settings → API Keys
3. Copy your API key

**ElevenLabs** (Recommended):
1. Sign up at https://elevenlabs.io
2. Go to Profile → API Keys
3. Copy your API key
4. (Optional) Create custom voice in Voice Lab

### 2. Configure Environment Variables

```bash
# Required
DID_API_KEY=your-did-api-key

# Recommended (for better voice quality)
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Optional (use custom voice)
NEXT_PUBLIC_AISHU_VOICE_ID=your-custom-voice-id

# Optional (use custom avatar image)
NEXT_PUBLIC_AISHU_AVATAR_URL=https://your-avatar-image.jpg
```

### 3. Upload Aishu's Avatar Image

**Option A: Use D-ID Studio**
1. Go to https://studio.d-id.com
2. Click "Add Presenter"
3. Upload Aishu's photo (square, high-quality, facing camera)
4. Copy the image URL
5. Set `NEXT_PUBLIC_AISHU_AVATAR_URL`

**Option B: Use External URL**
1. Upload image to CDN (Cloudinary, S3, etc.)
2. Ensure image is publicly accessible
3. Set `NEXT_PUBLIC_AISHU_AVATAR_URL`

### 4. Create Custom Voice (Optional)

**ElevenLabs Voice Cloning:**
1. Go to https://elevenlabs.io/voice-lab
2. Upload 1-5 minutes of Aishu's voice samples
3. Train the voice model
4. Copy the voice ID
5. Set `NEXT_PUBLIC_AISHU_VOICE_ID`

## Usage

### Basic Usage

```typescript
import { AvatarVideo } from '@/components/avatar/AvatarVideo';

<AvatarVideo
  text="Hello! I'm AI-Shu, your personal tutor."
  autoPlay={true}
  onVideoEnd={() => console.log('Video ended')}
  onVideoError={(error) => console.error(error)}
/>
```

### With Custom Voice

```typescript
<AvatarVideo
  text="Let's explore Newton's Laws together!"
  voiceId="your-elevenlabs-voice-id"
  autoPlay={true}
/>
```

### Disable Caching

```typescript
<AvatarVideo
  text="This is a unique message that shouldn't be cached"
  useCache={false}
/>
```

## Configuration

Edit `/config/avatar.ts` to customize:

```typescript
export const defaultAvatarConfig: AvatarConfig = {
  imageUrl: 'your-avatar-url',
  voice: {
    elevenLabsVoiceId: 'your-voice-id',
    settings: {
      stability: 0.5,        // 0-1, higher = more consistent
      similarityBoost: 0.75, // 0-1, higher = closer to original
      style: 0.0,            // 0-1, exaggeration level
      useSpeakerBoost: true, // Improve clarity
    },
  },
  video: {
    enabled: true,
    autoPlay: true,
    format: 'mp4',
    fluent: true,  // Better quality, slower generation
    stitch: true,  // Smoother transitions
  },
};
```

### Presets

```typescript
import { avatarPresets } from '@/config/avatar';

// Low bandwidth mode (no avatar video)
const config = avatarPresets.lowBandwidth;

// High quality mode (best quality, slower)
const config = avatarPresets.highQuality;

// Fast mode (quick generation, lower quality)
const config = avatarPresets.fast;
```

## Performance Optimization

### 1. Caching

Videos are automatically cached in memory:
- Cache key: `${voiceId}:${normalizedText}`
- Max size: 5 videos
- TTL: 1 hour

### 2. Prefetching (Future)

```typescript
// Prefetch common greetings
const commonPhrases = [
  "Hello! I'm AI-Shu, your personal tutor.",
  "Great job! You're making excellent progress.",
  "Let me explain that concept in a different way.",
];

commonPhrases.forEach(async (phrase) => {
  await fetch('/api/avatar/generate', {
    method: 'POST',
    body: JSON.stringify({ text: phrase }),
  });
});
```

### 3. Network Optimization

- Videos are streamed from D-ID's CDN
- No need to store videos locally
- Use `fluent: false` for faster generation if needed

## Cost Optimization

### Free Tier Limits

- **D-ID**: 20 videos/month
- **ElevenLabs**: 10,000 characters/month
- **OpenAI GPT-4**: $5 free credit (new accounts)

### Cost Calculation

Example: 100 students, 10 messages/session, 30 sessions/month

```
D-ID: 30,000 videos × $0.05 = $1,500/month
ElevenLabs: 3M characters × $0.0003 = $900/month
OpenAI: 3M tokens × $0.03 = $90/month
Total: ~$2,490/month
```

### Reduce Costs

1. **Enable caching**: Saves 30-50% on repeated messages
2. **Use text-only mode for simple responses**: Skip avatar for short confirmations
3. **Batch messages**: Combine multiple short messages into one avatar video
4. **Use Microsoft TTS**: Free, but lower quality

## Fallback Behavior

If D-ID API key is missing:
- Avatar component shows error message
- Chat continues to work with text only
- Voice output button still available (browser TTS)

If ElevenLabs API key is missing:
- Falls back to Microsoft Azure TTS
- Lower voice quality but still functional
- No additional cost

## Troubleshooting

### Video Generation Fails

**Symptoms**: "D-ID API error" message

**Solutions**:
1. Check API key is valid: `DID_API_KEY`
2. Verify account has credits: https://studio.d-id.com
3. Check avatar image URL is accessible
4. Review D-ID console logs: https://studio.d-id.com/talks

### Poor Voice Quality

**Symptoms**: Robotic or unnatural voice

**Solutions**:
1. Add ElevenLabs API key for better quality
2. If using ElevenLabs, adjust voice settings:
   - Increase `stability` for consistency
   - Increase `similarityBoost` for authenticity
3. Use custom voice clone for Aishu's actual voice

### Slow Generation

**Symptoms**: Takes >30 seconds to generate video

**Solutions**:
1. Use `fluent: false` in avatar config (faster, lower quality)
2. Disable `stitch` for quicker generation
3. Keep messages under 200 characters
4. Check network connection to D-ID API

### Videos Not Caching

**Symptoms**: Same message generates new video each time

**Solutions**:
1. Verify `useCache={true}` prop is set
2. Check cache stats in browser console:
   ```typescript
   import { getAvatarCache } from '@/lib/avatar/cache';
   console.log(getAvatarCache().getStats());
   ```
3. Ensure text is identical (case-sensitive)

## API Reference

### POST /api/avatar/generate

Generate avatar video from text.

**Request:**
```json
{
  "text": "Hello! I'm AI-Shu.",
  "voiceId": "optional-elevenlabs-voice-id",
  "avatarUrl": "optional-custom-avatar-url",
  "useElevenLabs": true
}
```

**Response:**
```json
{
  "id": "talk-abc123",
  "videoUrl": "https://d-id.com/video.mp4",
  "status": "done"
}
```

**Errors:**
- `400`: Missing required field (text)
- `500`: D-ID API key not configured
- `500`: Video generation failed

## Future Enhancements

1. **Real-time streaming** (D-ID Streaming API)
   - Lower latency for interactive sessions
   - Real-time lip-sync with user's audio input

2. **Avatar customization UI**
   - Upload custom images
   - Select voice from dropdown
   - Preview before sending

3. **Advanced caching**
   - Persistent cache (IndexedDB)
   - Predictive prefetching based on topic
   - Share cache across sessions

4. **Background generation**
   - Generate videos while user types
   - Queue system for batch processing
   - Progress indicators

## Resources

- D-ID Documentation: https://docs.d-id.com
- ElevenLabs Documentation: https://docs.elevenlabs.io
- D-ID Pricing: https://www.d-id.com/pricing
- ElevenLabs Pricing: https://elevenlabs.io/pricing
- Support: https://github.com/chatgptnotes/ai-shu/issues
