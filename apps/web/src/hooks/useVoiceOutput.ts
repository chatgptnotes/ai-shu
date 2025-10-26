/**
 * React Hook for Voice Output
 * Provides easy-to-use text-to-speech functionality with ElevenLabs support
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TextToSpeechService, TextToSpeechConfig } from '@/lib/voice/text-to-speech';
import { useVoiceSettings } from './useVoiceSettings';

export interface UseVoiceOutputOptions {
  autoPlay?: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
  useElevenLabs?: boolean; // Force use of ElevenLabs if available
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export function useVoiceOutput(options: UseVoiceOutputOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [usingElevenLabs, setUsingElevenLabs] = useState(false);

  const serviceRef = useRef<TextToSpeechService | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { settings, isElevenLabsAvailable } = useVoiceSettings();

  useEffect(() => {
    serviceRef.current = new TextToSpeechService();
    setIsSupported(serviceRef.current.isAvailable() || isElevenLabsAvailable);

    // Load voices
    const loadVoices = () => {
      if (serviceRef.current) {
        const availableVoices = serviceRef.current.getVoices();
        setVoices(availableVoices);
      }
    };

    loadVoices();

    // Voices may load asynchronously
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (serviceRef.current) {
        serviceRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isElevenLabsAvailable]);

  /**
   * Speak using ElevenLabs API
   */
  const speakWithElevenLabs = useCallback(
    async (text: string) => {
      try {
        const response = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceId: settings.voiceId,
            settings: settings.elevenLabsSettings,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // If service not configured, fall back to browser TTS
          if (errorData.fallback) {
            throw new Error('ElevenLabs not available, using fallback');
          }
          throw new Error(errorData.message || 'TTS API error');
        }

        // Play audio
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsSpeaking(false);
          setUsingElevenLabs(false);
          if (options.onEnd) {
            options.onEnd();
          }
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          setIsSpeaking(false);
          setUsingElevenLabs(false);
          const err = new Error('Audio playback failed');
          setError(err);
          if (options.onError) {
            options.onError(err);
          }
        };

        await audio.play();
        setUsingElevenLabs(true);
      } catch (error) {
        console.warn('ElevenLabs failed, falling back to browser TTS:', error);
        // Fall back to browser TTS
        throw error;
      }
    },
    [settings, options]
  );

  /**
   * Speak using browser TTS
   */
  const speakWithBrowser = useCallback(
    async (text: string, config?: TextToSpeechConfig) => {
      if (!serviceRef.current) {
        throw new Error('Text-to-speech not supported');
      }

      const finalConfig = {
        voice: config?.voice || options.voice,
        rate: config?.rate ?? settings.browserSettings.rate,
        pitch: config?.pitch ?? settings.browserSettings.pitch,
        volume: config?.volume ?? settings.browserSettings.volume,
        language: config?.language || options.language,
      };

      await serviceRef.current.speak(
        text,
        finalConfig,
        () => {
          setIsSpeaking(false);
          if (options.onEnd) {
            options.onEnd();
          }
        },
        (err) => {
          setError(err);
          setIsSpeaking(false);
          if (options.onError) {
            options.onError(err);
          }
        }
      );
    },
    [settings, options]
  );

  /**
   * Main speak function with automatic provider selection
   */
  const speak = useCallback(
    async (text: string, config?: TextToSpeechConfig) => {
      if (!isSupported) {
        const err = new Error('Text-to-speech not supported');
        setError(err);
        if (options.onError) {
          options.onError(err);
        }
        return;
      }

      setError(null);
      setIsSpeaking(true);

      // Determine provider: use ElevenLabs if available and preferred, otherwise browser
      const useElevenLabs =
        (options.useElevenLabs || settings.provider === 'elevenlabs') &&
        isElevenLabsAvailable;

      try {
        if (useElevenLabs) {
          try {
            await speakWithElevenLabs(text);
          } catch {
            // Fallback to browser TTS
            console.warn('Falling back to browser TTS');
            await speakWithBrowser(text, config);
          }
        } else {
          await speakWithBrowser(text, config);
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        setIsSpeaking(false);
        if (options.onError) {
          options.onError(error);
        }
      }
    },
    [isSupported, settings, isElevenLabsAvailable, options, speakWithElevenLabs, speakWithBrowser]
  );

  const stop = useCallback(() => {
    // Stop browser TTS
    if (serviceRef.current) {
      serviceRef.current.stop();
    }
    // Stop ElevenLabs audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setUsingElevenLabs(false);
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else if (serviceRef.current) {
      serviceRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    } else if (serviceRef.current) {
      serviceRef.current.resume();
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    voices,
    error,
    usingElevenLabs,
    isElevenLabsAvailable,
    speak,
    stop,
    pause,
    resume,
  };
}
