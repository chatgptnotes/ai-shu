/**
 * Text-to-Speech Service
 * Handles voice output using Web Speech API (browser) and ElevenLabs API (server)
 */

export interface TextToSpeechConfig {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  public isAvailable(): boolean {
    return this.isSupported;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  public async speak(
    text: string,
    config: TextToSpeechConfig = {},
    onEnd?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Text-to-speech is not supported in this browser');
    }

    // Cancel any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);

    // Configure voice
    const voices = this.getVoices();
    if (config.voice) {
      const selectedVoice = voices.find(v => v.name === config.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else if (config.language) {
      const languageVoice = voices.find(v => v.lang.startsWith(config.language!));
      if (languageVoice) {
        utterance.voice = languageVoice;
      }
    }

    utterance.rate = config.rate ?? 1.0;
    utterance.pitch = config.pitch ?? 1.0;
    utterance.volume = config.volume ?? 1.0;

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      this.isSpeaking = false;
      if (onError) {
        onError(new Error(event.error));
      }
    };

    this.synthesis.speak(utterance);
    this.isSpeaking = true;
  }

  public stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  public resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

// Server-side ElevenLabs API integration (for higher quality voice)
export async function generateSpeechWithElevenLabs(
  text: string,
  voiceId: string = 'EXAVITQu4vr4xnSDxMaL', // Default voice ID
  config: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
  } = {}
): Promise<Blob> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: config.stability ?? 0.5,
          similarity_boost: config.similarity_boost ?? 0.5,
          style: config.style ?? 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  return await response.blob();
}
