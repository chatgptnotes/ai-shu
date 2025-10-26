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

/**
 * ElevenLabs Voice Settings
 */
export interface ElevenLabsVoiceSettings {
  stability?: number; // 0-1, how stable/consistent the voice is
  similarity_boost?: number; // 0-1, how much to boost similarity to original voice
  style?: number; // 0-1, how much style to apply
  use_speaker_boost?: boolean; // Enhance clarity
}

/**
 * Predefined voice presets for different use cases
 */
export const ELEVENLABS_VOICE_PRESETS = {
  // Female educator voice - warm and clear
  educator_female: 'EXAVITQu4vr4xnSDxMaL', // Sarah
  // Male educator voice - authoritative and friendly
  educator_male: 'TxGEqnHWrfWFTfGW9XjX', // Josh
  // Young student-friendly voice
  friendly: 'jsCqWAovK2LkecY7zXl4', // Freya
  // Professional narrator
  narrator: 'pNInz6obpgDQGcFmaJgB', // Adam
  // Multi-lingual support
  multilingual: 'XB0fDUnXU5powFXDhCwa', // Charlotte
};

/**
 * Server-side ElevenLabs API integration (for higher quality voice)
 * Supports multiple languages and voice customization
 */
export async function generateSpeechWithElevenLabs(
  text: string,
  voiceId: string = ELEVENLABS_VOICE_PRESETS.educator_female,
  config: ElevenLabsVoiceSettings = {}
): Promise<Blob> {
  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured. Add to .env.local to enable high-quality TTS.');
  }

  // Default voice settings optimized for education
  const voiceSettings: ElevenLabsVoiceSettings = {
    stability: config.stability ?? 0.75,
    similarity_boost: config.similarity_boost ?? 0.85,
    style: config.style ?? 0.5,
    use_speaker_boost: config.use_speaker_boost ?? true,
  };

  try {
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
          model_id: 'eleven_multilingual_v2', // Supports multiple languages
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `ElevenLabs API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    throw error;
  }
}

/**
 * Client-side wrapper for ElevenLabs TTS with automatic fallback
 * Tries ElevenLabs first, falls back to browser TTS on failure
 */
export async function speakWithElevenLabs(
  text: string,
  voiceId?: string,
  config?: ElevenLabsVoiceSettings,
  onEnd?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // Try ElevenLabs first
    const audioBlob = await generateSpeechWithElevenLabs(text, voiceId, config);

    // Play the audio
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      if (onError) onError(new Error('Audio playback failed'));
    };

    await audio.play();
  } catch (error) {
    console.warn('ElevenLabs TTS failed, falling back to browser TTS:', error);

    // Fallback to browser TTS
    const ttsService = new TextToSpeechService();
    if (ttsService.isAvailable()) {
      await ttsService.speak(text, {}, onEnd, onError);
    } else {
      if (onError) onError(error as Error);
    }
  }
}
