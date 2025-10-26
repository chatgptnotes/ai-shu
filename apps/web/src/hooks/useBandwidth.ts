/**
 * React Hook for Bandwidth Detection
 * Provides real-time bandwidth information and adaptive settings
 */

'use client';

import { useState, useEffect } from 'react';
import { bandwidthDetector, BandwidthInfo, AdaptiveSettings } from '@/lib/network/bandwidth-detector';

export function useBandwidth() {
  const [bandwidthInfo, setBandwidthInfo] = useState<BandwidthInfo>(() =>
    bandwidthDetector.detectBandwidth()
  );
  const [adaptiveSettings, setAdaptiveSettings] = useState<AdaptiveSettings>(() =>
    bandwidthDetector.getAdaptiveSettings()
  );

  useEffect(() => {
    // Subscribe to bandwidth changes
    const unsubscribe = bandwidthDetector.subscribe((info) => {
      setBandwidthInfo(info);
      setAdaptiveSettings(bandwidthDetector.getAdaptiveSettings(info.quality));
    });

    // Initial detection
    const info = bandwidthDetector.detectBandwidth();
    setBandwidthInfo(info);
    setAdaptiveSettings(bandwidthDetector.getAdaptiveSettings(info.quality));

    return unsubscribe;
  }, []);

  return {
    quality: bandwidthInfo.quality,
    downlink: bandwidthInfo.downlink,
    rtt: bandwidthInfo.rtt,
    saveData: bandwidthInfo.saveData,
    effectiveType: bandwidthInfo.effectiveType,
    adaptiveSettings,
    isOnline: bandwidthInfo.quality !== 'offline',
    isHighSpeed: bandwidthInfo.quality === 'high',
    isLowSpeed: bandwidthInfo.quality === 'low',
    connectionMessage: bandwidthDetector.getConnectionMessage(),
  };
}
