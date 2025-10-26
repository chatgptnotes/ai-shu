/**
 * Speech Recognition Service
 * Handles voice input using Web Speech API (browser) and Whisper API (server)
 */

export interface SpeechRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.isSupported = true;
      }
    }
  }

  public isAvailable(): boolean {
    return this.isSupported;
  }

  public async startListening(
    config: SpeechRecognitionConfig = {},
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    if (this.isListening) {
      return;
    }

    this.recognition.continuous = config.continuous ?? false;
    this.recognition.interimResults = config.interimResults ?? true;
    this.recognition.lang = config.language || 'en-US';

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      onResult({
        transcript,
        confidence,
        isFinal,
      });
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (onError) {
        onError(new Error(event.error));
      }
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

/**
 * Server-side Whisper API integration (for higher accuracy)
 * Calls our API route which proxies to OpenAI Whisper
 */
export async function transcribeAudioWithWhisper(
  audioBlob: Blob,
  language: string = 'en'
): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');
  formData.append('language', language);

  try {
    const response = await fetch('/api/voice/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();

      // If service not configured, fall back to browser API
      if (errorData.fallback) {
        throw new Error('Whisper not available, use browser fallback');
      }

      throw new Error(errorData.message || 'Transcription failed');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Whisper transcription error:', error);
    throw error;
  }
}
