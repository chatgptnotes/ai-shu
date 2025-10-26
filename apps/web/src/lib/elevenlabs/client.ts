/**
 * ElevenLabs API Client
 * Handles text-to-speech conversion for high-quality voice synthesis
 * Documentation: https://elevenlabs.io/docs/api-reference
 */

export interface ElevenLabsConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface TextToSpeechRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.elevenlabs.io/v1';
  }

  /**
   * Convert text to speech
   * Returns audio as a Blob
   */
  async textToSpeech(request: TextToSpeechRequest): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/text-to-speech/${request.voice_id}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: request.text,
          model_id: request.model_id || 'eleven_monolingual_v1',
          voice_settings: request.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`ElevenLabs API error: ${error.error || response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Convert text to speech and get URL
   * Uploads audio to a temporary URL for use with D-ID
   */
  async textToSpeechUrl(request: TextToSpeechRequest): Promise<string> {
    const audioBlob = await this.textToSpeech(request);

    // Convert blob to base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<Voice[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`ElevenLabs API error: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return data.voices;
  }

  /**
   * Get voice details
   */
  async getVoice(voiceId: string): Promise<Voice> {
    const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
      method: 'GET',
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`ElevenLabs API error: ${error.error || response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Create an ElevenLabs client instance
 */
export function createElevenLabsClient(apiKey: string): ElevenLabsClient {
  return new ElevenLabsClient({ apiKey });
}

/**
 * Predefined voice IDs for common use cases
 * Note: These are example IDs - update with actual voice IDs from your account
 */
export const VOICE_IDS = {
  // Female voices
  RACHEL: '21m00Tcm4TlvDq8ikWAM',
  DOMI: 'AZnzlk1XvdvUeBnXmlld',
  BELLA: 'EXAVITQu4vr4xnSDxMaL',
  ELLI: 'MF3mGyEYCl7XYWbV9V6O',

  // Male voices
  JOSH: 'TxGEqnHWrfWFTfGW9XjX',
  ARNOLD: 'VR6AewLTigWG4xSOukaG',
  ADAM: 'pNInz6obpgDQGcFmaJgB',
  SAM: 'yoZ06aMxZJJ28mfd3POQ',

  // For AI-Shu (to be customized)
  AISHU: 'EXAVITQu4vr4xnSDxMaL', // Placeholder - update with custom voice
};
