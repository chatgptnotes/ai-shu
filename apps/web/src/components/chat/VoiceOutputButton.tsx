/**
 * Voice Output Button Component
 * Allows users to hear AI responses read aloud
 */

'use client';

import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { toast } from 'sonner';

interface VoiceOutputButtonProps {
  text: string;
  language?: string;
  className?: string;
}

export function VoiceOutputButton({ text, language = 'en-US', className = '' }: VoiceOutputButtonProps) {
  const { isSpeaking, isSupported, speak, stop } = useVoiceOutput({
    language,
    rate: 0.95,
    onError: (err) => {
      toast.error(`Voice output error: ${err.message}`);
    },
  });

  const handleToggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  if (!isSupported || !text) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent ${className}`}
      aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
      title={isSpeaking ? 'Stop speaking' : 'Read this message aloud'}
    >
      {isSpeaking ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="animate-pulse"
        >
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
