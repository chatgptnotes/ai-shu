/**
 * Voice Input Button Component
 * Allows users to dictate messages using speech-to-text
 */

'use client';

import { useVoiceInput } from '@/hooks/useVoiceInput';
import { toast } from 'sonner';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  language?: string;
  className?: string;
}

export function VoiceInputButton({ onTranscript, language = 'en-US', className = '' }: VoiceInputButtonProps) {
  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
  } = useVoiceInput({
    language,
    continuous: false,
    interimResults: true,
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        onTranscript(text);
      }
    },
    onError: (err) => {
      toast.error(`Voice input error: ${err.message}`);
    },
  });

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex items-center justify-center rounded-md p-2 transition-colors ${
        isListening
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      } ${className}`}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      title={isListening ? 'Click to stop recording' : 'Click to start recording'}
    >
      {isListening ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="animate-pulse"
        >
          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      )}
    </button>
  );
}
