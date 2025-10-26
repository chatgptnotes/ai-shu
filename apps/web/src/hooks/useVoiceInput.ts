/**
 * React Hook for Voice Input
 * Provides easy-to-use voice recording functionality
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognitionService, SpeechRecognitionResult } from '@/lib/voice/speech-recognition';

export interface UseVoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const serviceRef = useRef<SpeechRecognitionService | null>(null);

  useEffect(() => {
    serviceRef.current = new SpeechRecognitionService();
    setIsSupported(serviceRef.current.isAvailable());
  }, []);

  const handleResult = useCallback(
    (result: SpeechRecognitionResult) => {
      if (options.onTranscript) {
        options.onTranscript(result.transcript, result.isFinal);
      }
    },
    [options]
  );

  const handleError = useCallback(
    (err: Error) => {
      setIsListening(false);
      if (options.onError) {
        options.onError(err);
      }
    },
    [options]
  );

  const startListening = useCallback(async () => {
    if (!serviceRef.current || !isSupported) {
      const err = new Error('Speech recognition not supported');
      handleError(err);
      return;
    }

    try {
      await serviceRef.current.startListening(
        {
          language: options.language || 'en-US',
          continuous: options.continuous ?? false,
          interimResults: options.interimResults ?? true,
        },
        handleResult,
        handleError
      );
      setIsListening(true);
    } catch (err) {
      handleError(err as Error);
    }
  }, [isSupported, options, handleResult, handleError]);

  const stopListening = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stopListening();
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}
