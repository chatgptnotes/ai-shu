/**
 * ElevenLabs Text-to-Speech API Route
 * Generates high-quality voice audio from text
 */

import { NextResponse } from 'next/server';
import { generateSpeechWithElevenLabs, ELEVENLABS_VOICE_PRESETS, ElevenLabsVoiceSettings } from '@/lib/voice/text-to-speech';
import { withRateLimit } from '@/middleware/rate-limit';
import { rateLimiters } from '@/lib/security/rate-limiter';

async function handler(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { text, voiceId, settings } = body;

    // Validation
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 5000 characters' },
        { status: 400 }
      );
    }

    // Use default voice if not specified
    const selectedVoiceId = voiceId || ELEVENLABS_VOICE_PRESETS.educator_female;

    // Generate speech
    const audioBlob = await generateSpeechWithElevenLabs(
      text,
      selectedVoiceId,
      settings as ElevenLabsVoiceSettings
    );

    // Convert blob to buffer
    const buffer = await audioBlob.arrayBuffer();

    // Return audio response
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if it's an API key error
    if (errorMessage.includes('not configured')) {
      return NextResponse.json(
        {
          error: 'TTS service not configured',
          message: 'ElevenLabs API key is not set. Using browser fallback.',
          fallback: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Text-to-speech generation failed', message: errorMessage },
      { status: 500 }
    );
  }
}

// Apply rate limiting - 50 requests per hour
export const POST = withRateLimit(handler, rateLimiters.voice);
