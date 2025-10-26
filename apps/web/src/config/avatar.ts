/**
 * Avatar Configuration
 * Centralized configuration for AI-Shu avatar settings
 */

import { VOICE_IDS } from '@/lib/elevenlabs/client';

export interface AvatarConfig {
  // Avatar image URL (Aishu's face)
  imageUrl: string;

  // Voice settings
  voice: {
    // ElevenLabs voice ID
    elevenLabsVoiceId: string;
    // Microsoft voice ID (fallback)
    microsoftVoiceId: string;
    // Voice settings for ElevenLabs
    settings: {
      stability: number;
      similarityBoost: number;
      style: number;
      useSpeakerBoost: boolean;
    };
  };

  // Video settings
  video: {
    // Enable/disable avatar
    enabled: boolean;
    // Auto-play videos
    autoPlay: boolean;
    // Result format
    format: 'mp4' | 'gif' | 'mov';
    // Video quality
    fluent: boolean;
    // Enable stitching for smoother playback
    stitch: boolean;
  };

  // Performance settings
  performance: {
    // Prefetch avatar videos
    prefetch: boolean;
    // Maximum number of videos to cache
    maxCacheSize: number;
    // Video generation timeout (ms)
    timeout: number;
  };
}

/**
 * Default avatar configuration for AI-Shu
 */
export const defaultAvatarConfig: AvatarConfig = {
  // TODO: Replace with actual Aishu avatar image
  imageUrl:
    process.env.NEXT_PUBLIC_AISHU_AVATAR_URL ||
    'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg',

  voice: {
    elevenLabsVoiceId: process.env.NEXT_PUBLIC_AISHU_VOICE_ID || VOICE_IDS.AISHU,
    microsoftVoiceId: 'en-US-JennyNeural',
    settings: {
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.0,
      useSpeakerBoost: true,
    },
  },

  video: {
    enabled: true,
    autoPlay: true,
    format: 'mp4',
    fluent: true,
    stitch: true,
  },

  performance: {
    prefetch: false, // Disable prefetch by default to save costs
    maxCacheSize: 5, // Cache last 5 videos
    timeout: 120000, // 2 minutes
  },
};

/**
 * Get avatar configuration with environment variable overrides
 */
export function getAvatarConfig(): AvatarConfig {
  return {
    ...defaultAvatarConfig,
    // Add any runtime overrides here
  };
}

/**
 * Avatar presets for different scenarios
 */
export const avatarPresets = {
  // Standard learning mode
  standard: {
    ...defaultAvatarConfig,
  },

  // Low bandwidth mode (disabled avatar, text-to-speech only)
  lowBandwidth: {
    ...defaultAvatarConfig,
    video: {
      ...defaultAvatarConfig.video,
      enabled: false,
    },
  },

  // High quality mode (best quality, slower)
  highQuality: {
    ...defaultAvatarConfig,
    video: {
      ...defaultAvatarConfig.video,
      fluent: true,
      stitch: true,
    },
    voice: {
      ...defaultAvatarConfig.voice,
      settings: {
        stability: 0.6,
        similarityBoost: 0.85,
        style: 0.2,
        useSpeakerBoost: true,
      },
    },
  },

  // Fast mode (quicker generation, lower quality)
  fast: {
    ...defaultAvatarConfig,
    video: {
      ...defaultAvatarConfig.video,
      fluent: false,
      stitch: false,
    },
    performance: {
      ...defaultAvatarConfig.performance,
      timeout: 60000, // 1 minute
    },
  },
};
