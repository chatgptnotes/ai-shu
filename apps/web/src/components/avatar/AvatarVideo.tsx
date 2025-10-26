'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@ai-shu/ui';
import { getAvatarCache } from '@/lib/avatar/cache';

interface AvatarVideoProps {
  text?: string;
  autoPlay?: boolean;
  onVideoEnd?: () => void;
  onVideoError?: (error: Error) => void;
  className?: string;
  voiceId?: string;
  useCache?: boolean;
}

export function AvatarVideo({
  text,
  autoPlay = false,
  onVideoEnd,
  onVideoError,
  className = '',
  voiceId,
  useCache = true,
}: AvatarVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const cache = useCache ? getAvatarCache() : null;

  // Generate avatar video when text changes
  useEffect(() => {
    if (!text || text.trim() === '') {
      return;
    }

    // Check cache first
    if (cache) {
      const cachedUrl = cache.get(text, voiceId);
      if (cachedUrl) {
        console.log('Using cached avatar video');
        setVideoUrl(cachedUrl);
        setIsLoading(false);
        return;
      }
    }

    generateAvatarVideo(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, voiceId]);

  // Auto-play when video URL is ready
  useEffect(() => {
    if (videoUrl && autoPlay && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Auto-play failed:', error);
      });
    }
  }, [videoUrl, autoPlay]);

  const generateAvatarVideo = async (textToSpeak: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/avatar/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToSpeak,
          voiceId: voiceId,
          useElevenLabs: true, // Use high-quality voice by default
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate avatar video');
      }

      const data = await response.json();
      setVideoUrl(data.videoUrl);

      // Cache the result
      if (cache) {
        cache.set(textToSpeak, data.videoUrl, voiceId);
      }

      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('Avatar generation error:', error);
      setError(error.message);
      setIsLoading(false);
      onVideoError?.(error);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onVideoEnd?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const error = new Error('Video playback error');
    console.error('Video error:', e);
    setError('Failed to play video');
    onVideoError?.(error);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm text-destructive mb-2">Avatar Error</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Generating avatar...</p>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">Avatar ready</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        playsInline
      />

      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlayPause}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
