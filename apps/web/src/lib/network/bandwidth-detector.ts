/**
 * Bandwidth Detection System
 * Automatically detects connection speed and adapts features
 */

export type ConnectionQuality = 'high' | 'medium' | 'low' | 'offline';

export interface BandwidthInfo {
  quality: ConnectionQuality;
  downlink: number; // Mbps
  effectiveType: string;
  rtt: number; // Round trip time in ms
  saveData: boolean;
}

export interface AdaptiveSettings {
  enableVideo: boolean;
  enableVoice: boolean;
  enableWhiteboard: boolean;
  imageQuality: 'high' | 'medium' | 'low';
  autoPlayVideo: boolean;
  maxConcurrentRequests: number;
}

export class BandwidthDetector {
  private static instance: BandwidthDetector;
  private connection: any = null;
  private listeners: Set<(info: BandwidthInfo) => void> = new Set();
  private currentQuality: ConnectionQuality = 'high';

  private constructor() {
    if (typeof window !== 'undefined') {
      this.connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      if (this.connection) {
        this.connection.addEventListener('change', this.handleConnectionChange.bind(this));
      }

      // Also listen to online/offline events
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));

      // Initial detection
      this.detectBandwidth();
    }
  }

  public static getInstance(): BandwidthDetector {
    if (!BandwidthDetector.instance) {
      BandwidthDetector.instance = new BandwidthDetector();
    }
    return BandwidthDetector.instance;
  }

  private handleConnectionChange() {
    this.detectBandwidth();
  }

  private handleOnline() {
    this.detectBandwidth();
  }

  private handleOffline() {
    this.currentQuality = 'offline';
    this.notifyListeners();
  }

  /**
   * Detect current bandwidth and connection quality
   */
  public detectBandwidth(): BandwidthInfo {
    if (!this.connection) {
      // Fallback for browsers without Network Information API
      // Return default medium quality - will be updated by async speed test
      return {
        quality: 'medium',
        downlink: 1,
        effectiveType: '3g',
        rtt: 1000,
        saveData: false,
      };
    }

    const downlink = this.connection.downlink || 10; // Mbps
    const effectiveType = this.connection.effectiveType || '4g';
    const rtt = this.connection.rtt || 50; // Round trip time
    const saveData = this.connection.saveData || false;

    let quality: ConnectionQuality = 'high';

    if (!navigator.onLine) {
      quality = 'offline';
    } else if (saveData) {
      quality = 'low'; // User has data saver enabled
    } else if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5) {
      quality = 'low';
    } else if (effectiveType === '3g' || downlink < 2) {
      quality = 'medium';
    } else {
      quality = 'high';
    }

    this.currentQuality = quality;

    const info: BandwidthInfo = {
      quality,
      downlink,
      effectiveType,
      rtt,
      saveData,
    };

    this.notifyListeners();
    return info;
  }

  /**
   * Get adaptive settings based on connection quality
   */
  public getAdaptiveSettings(quality: ConnectionQuality = this.currentQuality): AdaptiveSettings {
    switch (quality) {
      case 'high':
        return {
          enableVideo: true,
          enableVoice: true,
          enableWhiteboard: true,
          imageQuality: 'high',
          autoPlayVideo: true,
          maxConcurrentRequests: 6,
        };
      case 'medium':
        return {
          enableVideo: false,
          enableVoice: true,
          enableWhiteboard: true,
          imageQuality: 'medium',
          autoPlayVideo: false,
          maxConcurrentRequests: 4,
        };
      case 'low':
        return {
          enableVideo: false,
          enableVoice: false,
          enableWhiteboard: false,
          imageQuality: 'low',
          autoPlayVideo: false,
          maxConcurrentRequests: 2,
        };
      case 'offline':
        return {
          enableVideo: false,
          enableVoice: false,
          enableWhiteboard: false,
          imageQuality: 'low',
          autoPlayVideo: false,
          maxConcurrentRequests: 0,
        };
    }
  }

  /**
   * Subscribe to bandwidth changes
   */
  public subscribe(callback: (info: BandwidthInfo) => void): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    const info = this.detectBandwidth();
    this.listeners.forEach(listener => listener(info));
  }

  /**
   * Get current connection quality
   */
  public getCurrentQuality(): ConnectionQuality {
    return this.currentQuality;
  }

  /**
   * Check if a feature should be enabled based on current bandwidth
   */
  public shouldEnableFeature(feature: keyof AdaptiveSettings): boolean {
    const settings = this.getAdaptiveSettings();
    return settings[feature] as boolean;
  }

  /**
   * Get recommended message for user about connection
   */
  public getConnectionMessage(): string | null {
    switch (this.currentQuality) {
      case 'offline':
        return 'You are offline. Please check your internet connection.';
      case 'low':
        return 'Slow connection detected. Some features have been disabled for better performance.';
      case 'medium':
        return 'Limited connection detected. Video features are disabled.';
      case 'high':
        return null;
    }
  }
}

// Singleton instance
export const bandwidthDetector = BandwidthDetector.getInstance();
