/**
 * React Hook for Voice Output
 * Provides easy-to-use text-to-speech functionality
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TextToSpeechService, TextToSpeechConfig } from '@/lib/voice/text-to-speech';

export interface UseVoiceOutputOptions {
  autoPlay?: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export function useVoiceOutput(options: UseVoiceOutputOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const serviceRef = useRef<TextToSpeechService | null>(null);

  useEffect(() => {
    serviceRef.current = new TextToSpeechService();
    setIsSupported(serviceRef.current.isAvailable());

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
    };
  }, []);

  const speak = useCallback(
    async (text: string, config?: TextToSpeechConfig) => {
      if (!serviceRef.current || !isSupported) {
        const err = new Error('Text-to-speech not supported');
        setError(err);
        if (options.onError) {
          options.onError(err);
        }
        return;
      }

      setError(null);
      setIsSpeaking(true);

      const finalConfig = {
        voice: config?.voice || options.voice,
        rate: config?.rate ?? options.rate,
        pitch: config?.pitch ?? options.pitch,
        volume: config?.volume ?? options.volume,
        language: config?.language || options.language,
      };

      try {
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
      } catch (err) {
        const error = err as Error;
        setError(error);
        setIsSpeaking(false);
        if (options.onError) {
          options.onError(error);
        }
      }
    },
    [isSupported, options]
  );

  const stop = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stop();
      setIsSpeaking(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.resume();
    }
  }, []);

  return {
    isSpeaking,
    isSupported,
    voices,
    error,
    speak,
    stop,
    pause,
    resume,
  };
}
