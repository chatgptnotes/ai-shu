/**
 * Whisper Speech-to-Text API Route
 * Transcribes audio to text using OpenAI Whisper
 */

import { NextResponse } from 'next/server';
import { withRateLimit } from '@/middleware/rate-limit';
import { rateLimiters } from '@/lib/security/rate-limiter';
import { withCsrfProtection } from '@/lib/security/csrf-middleware';
import { validateFileUpload } from '@/lib/security/validation';
import OpenAI from 'openai';

async function handler(request: Request): Promise<Response> {
  // Apply CSRF protection
  const csrfCheck = await withCsrfProtection(request);
  if (csrfCheck) return csrfCheck;

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'en';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Validate file using helper function
    const fileValidation = validateFileUpload(audioFile, {
      maxSize: 25 * 1024 * 1024, // 25MB for Whisper
      allowedTypes: ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/webm', 'audio/ogg'],
    });

    if (!fileValidation.success) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Whisper API not configured',
          message: 'OPENAI_API_KEY not set. Using browser fallback.',
          fallback: true,
        },
        { status: 503 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: language.split('-')[0], // Whisper uses 2-letter codes
      response_format: 'json',
    });

    return NextResponse.json({
      text: transcription.text,
      language,
    });
  } catch (error) {
    console.error('Whisper transcription error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if it's an API key error
    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          message: 'Invalid or missing OpenAI API key',
          fallback: true,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Transcription failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Apply rate limiting - 50 requests per hour (same as voice)
export const POST = withRateLimit(handler, rateLimiters.voice);
