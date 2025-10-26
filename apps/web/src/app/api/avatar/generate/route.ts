import { NextResponse } from 'next/server';
import { createDIDClient } from '@/lib/did/client';
import { createElevenLabsClient, VOICE_IDS } from '@/lib/elevenlabs/client';

const DID_API_KEY = process.env.DID_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Default Aishu avatar image URL (to be replaced with actual image)
const DEFAULT_AVATAR_URL = 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg';

// Default voice for AI-Shu
const DEFAULT_VOICE_ID = VOICE_IDS.AISHU;

export async function POST(request: Request) {
  try {
    const { text, voiceId, avatarUrl, useElevenLabs } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!DID_API_KEY) {
      return NextResponse.json(
        { error: 'D-ID API key not configured' },
        { status: 500 }
      );
    }

    const didClient = createDIDClient(DID_API_KEY);

    // Configure voice provider
    const scriptConfig: any = {
      type: 'text',
      input: text,
    };

    // Use ElevenLabs for high-quality voice if requested and API key is available
    if (useElevenLabs !== false && ELEVENLABS_API_KEY) {
      try {
        const elevenLabsClient = createElevenLabsClient(ELEVENLABS_API_KEY);

        // Generate audio with ElevenLabs
        const audioBlob = await elevenLabsClient.textToSpeech({
          text,
          voice_id: voiceId || DEFAULT_VOICE_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        });

        // Convert blob to data URL
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');
        const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

        // Use audio URL with D-ID
        scriptConfig.type = 'audio';
        scriptConfig.audio_url = audioDataUrl;
        delete scriptConfig.input;
      } catch (elevenLabsError) {
        console.error('ElevenLabs error, falling back to Microsoft:', elevenLabsError);
        // Fall through to Microsoft fallback
      }
    }

    // Fallback to text with provider if ElevenLabs not used
    if (scriptConfig.type === 'text') {
      if (ELEVENLABS_API_KEY && voiceId) {
        scriptConfig.provider = {
          type: 'elevenlabs',
          voice_id: voiceId || DEFAULT_VOICE_ID,
        };
      } else {
        // Fallback to Microsoft Azure TTS
        scriptConfig.provider = {
          type: 'microsoft',
          voice_id: 'en-US-JennyNeural', // Female voice, can be customized
        };
      }
    }

    // Create talk request
    const talkRequest = {
      source_url: avatarUrl || DEFAULT_AVATAR_URL,
      script: scriptConfig,
      config: {
        fluent: true,
        pad_audio: 0,
        stitch: true,
        result_format: 'mp4' as const,
      },
    };

    // Create the talk
    const talk = await didClient.createTalk(talkRequest);

    // Poll for completion
    const completedTalk = await didClient.pollTalkStatus(talk.id);

    if (!completedTalk.result_url) {
      throw new Error('Video generation completed but no result URL');
    }

    return NextResponse.json({
      id: completedTalk.id,
      videoUrl: completedTalk.result_url,
      status: completedTalk.status,
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate avatar video' },
      { status: 500 }
    );
  }
}
