/**
 * Voice Settings Hook
 * Manages user preferences for voice output (ElevenLabs vs Browser TTS)
 */

'use client';

import { useState, useEffect } from 'react';
import { ELEVENLABS_VOICE_PRESETS, ElevenLabsVoiceSettings } from '@/lib/voice/text-to-speech';

export type VoiceProvider = 'elevenlabs' | 'browser';
export type VoicePreset = keyof typeof ELEVENLABS_VOICE_PRESETS;

export interface VoiceSettings {
  provider: VoiceProvider;
  voiceId: string;
  voicePreset: VoicePreset;
  elevenLabsSettings: ElevenLabsVoiceSettings;
  browserSettings: {
    rate: number;
    pitch: number;
    volume: number;
  };
}

const DEFAULT_SETTINGS: VoiceSettings = {
  provider: 'browser', // Default to browser for free usage
  voiceId: ELEVENLABS_VOICE_PRESETS.educator_female,
  voicePreset: 'educator_female',
  elevenLabsSettings: {
    stability: 0.75,
    similarity_boost: 0.85,
    style: 0.5,
    use_speaker_boost: true,
  },
  browserSettings: {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  },
};

export function useVoiceSettings() {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [isElevenLabsAvailable, setIsElevenLabsAvailable] = useState<boolean>(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ai-shu-voice-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse voice settings:', error);
      }
    }

    // Check if ElevenLabs is available by checking env var
    checkElevenLabsAvailability();
  }, []);

  // Check if ElevenLabs API is configured
  const checkElevenLabsAvailability = async () => {
    try {
      // Try to make a test request to our API
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' }),
      });

      // If we get a 503 with fallback flag, it means API key is not configured
      if (response.status === 503) {
        const data = await response.json();
        setIsElevenLabsAvailable(!data.fallback);
      } else {
        setIsElevenLabsAvailable(response.ok);
      }
    } catch {
      setIsElevenLabsAvailable(false);
    }
  };

  // Update settings and persist to localStorage
  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...newSettings };

    // If changing preset, update voiceId
    if (newSettings.voicePreset) {
      updated.voiceId = ELEVENLABS_VOICE_PRESETS[newSettings.voicePreset];
    }

    setSettings(updated);
    localStorage.setItem('ai-shu-voice-settings', JSON.stringify(updated));
  };

  // Set voice provider
  const setProvider = (provider: VoiceProvider) => {
    updateSettings({ provider });
  };

  // Set voice preset (ElevenLabs)
  const setVoicePreset = (preset: VoicePreset) => {
    updateSettings({
      voicePreset: preset,
      voiceId: ELEVENLABS_VOICE_PRESETS[preset],
    });
  };

  // Update ElevenLabs settings
  const updateElevenLabsSettings = (newSettings: Partial<ElevenLabsVoiceSettings>) => {
    updateSettings({
      elevenLabsSettings: { ...settings.elevenLabsSettings, ...newSettings },
    });
  };

  // Update browser TTS settings
  const updateBrowserSettings = (newSettings: Partial<VoiceSettings['browserSettings']>) => {
    updateSettings({
      browserSettings: { ...settings.browserSettings, ...newSettings },
    });
  };

  return {
    settings,
    isElevenLabsAvailable,
    setProvider,
    setVoicePreset,
    updateElevenLabsSettings,
    updateBrowserSettings,
    updateSettings,
  };
}
