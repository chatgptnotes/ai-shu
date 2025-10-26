/**
 * Agora RTC Client
 * Handles real-time video/audio communication for AI-Shu live tutoring sessions
 * Documentation: https://docs.agora.io/en/video-calling/get-started/get-started-sdk
 */

import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  UID,
} from 'agora-rtc-sdk-ng';

export interface AgoraConfig {
  appId: string;
  channel: string;
  token?: string;
  uid?: UID;
}

export interface LocalTracks {
  videoTrack: ICameraVideoTrack | null;
  audioTrack: IMicrophoneAudioTrack | null;
}

export interface RemoteUser {
  uid: UID;
  hasVideo: boolean;
  hasAudio: boolean;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
}

export interface NetworkStats {
  uplinkNetworkQuality: number;
  downlinkNetworkQuality: number;
}

export interface CallStats {
  duration: number; // in seconds
  sendBitrate: number;
  recvBitrate: number;
  sendPacketsLost: number;
  recvPacketsLost: number;
}

export class AgoraRTCManager {
  private client: IAgoraRTCClient | null = null;
  private localTracks: LocalTracks = {
    videoTrack: null,
    audioTrack: null,
  };
  private remoteUsers: Map<UID, RemoteUser> = new Map();
  private isJoined: boolean = false;
  private config: AgoraConfig | null = null;

  // Event handlers
  private onUserJoinedCallback?: (user: RemoteUser) => void;
  private onUserLeftCallback?: (uid: UID) => void;
  private onUserPublishedCallback?: (user: RemoteUser) => void;
  private onUserUnpublishedCallback?: (uid: UID, mediaType: 'audio' | 'video') => void;
  private onNetworkQualityCallback?: (stats: NetworkStats) => void;
  private onConnectionStateCallback?: (
    curState: string,
    revState: string,
    reason?: string
  ) => void;

  constructor() {
    // Enable SDK logging for debugging (disable in production)
    if (process.env.NODE_ENV === 'development') {
      AgoraRTC.setLogLevel(1); // 0 = DEBUG, 1 = INFO, 2 = WARNING, 3 = ERROR, 4 = NONE
    } else {
      AgoraRTC.setLogLevel(3);
    }
  }

  /**
   * Initialize the Agora client
   */
  private initializeClient(): IAgoraRTCClient {
    if (this.client) {
      return this.client;
    }

    this.client = AgoraRTC.createClient({
      mode: 'rtc', // Real-time communication
      codec: 'vp8', // Video codec (vp8 or h264)
    });

    // Set up event listeners
    this.setupEventListeners();

    return this.client;
  }

  /**
   * Set up Agora event listeners
   */
  private setupEventListeners(): void {
    if (!this.client) return;

    // User joined the channel
    this.client.on('user-joined', (user: IAgoraRTCRemoteUser) => {
      console.log('User joined:', user.uid);
      const remoteUser: RemoteUser = {
        uid: user.uid,
        hasVideo: false,
        hasAudio: false,
      };
      this.remoteUsers.set(user.uid, remoteUser);
      this.onUserJoinedCallback?.(remoteUser);
    });

    // User left the channel
    this.client.on('user-left', (user: IAgoraRTCRemoteUser, reason: string) => {
      console.log('User left:', user.uid, 'Reason:', reason);
      this.remoteUsers.delete(user.uid);
      this.onUserLeftCallback?.(user.uid);
    });

    // User published media
    this.client.on(
      'user-published',
      async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        console.log('User published:', user.uid, 'Media:', mediaType);

        // Subscribe to the remote user
        await this.client!.subscribe(user, mediaType);

        const remoteUser = this.remoteUsers.get(user.uid);
        if (remoteUser) {
          if (mediaType === 'video') {
            remoteUser.hasVideo = true;
            remoteUser.videoTrack = user.videoTrack;
          } else if (mediaType === 'audio') {
            remoteUser.hasAudio = true;
            remoteUser.audioTrack = user.audioTrack;
            // Auto-play audio
            user.audioTrack?.play();
          }
          this.onUserPublishedCallback?.(remoteUser);
        }
      }
    );

    // User unpublished media
    this.client.on(
      'user-unpublished',
      (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        console.log('User unpublished:', user.uid, 'Media:', mediaType);

        const remoteUser = this.remoteUsers.get(user.uid);
        if (remoteUser) {
          if (mediaType === 'video') {
            remoteUser.hasVideo = false;
            remoteUser.videoTrack = undefined;
          } else if (mediaType === 'audio') {
            remoteUser.hasAudio = false;
            remoteUser.audioTrack = undefined;
          }
          this.onUserUnpublishedCallback?.(user.uid, mediaType);
        }
      }
    );

    // Network quality
    this.client.on('network-quality', (stats) => {
      this.onNetworkQualityCallback?.({
        uplinkNetworkQuality: Number(stats.uplinkNetworkQuality) || 0,
        downlinkNetworkQuality: Number(stats.downlinkNetworkQuality) || 0,
      });
    });

    // Connection state change
    this.client.on('connection-state-change', (curState, revState, reason) => {
      console.log(
        'Connection state changed:',
        revState,
        '->',
        curState,
        reason ? `(${reason})` : ''
      );
      this.onConnectionStateCallback?.(curState, revState, reason);
    });

    // Token expiring soon
    this.client.on('token-privilege-will-expire', () => {
      console.warn('Token will expire soon, renew it!');
      // TODO: Implement token renewal
    });

    // Token expired
    this.client.on('token-privilege-did-expire', () => {
      console.error('Token expired!');
      // TODO: Implement token renewal and rejoin
    });
  }

  /**
   * Join an Agora channel
   */
  async join(config: AgoraConfig): Promise<UID> {
    this.config = config;
    const client = this.initializeClient();

    try {
      const uid = await client.join(
        config.appId,
        config.channel,
        config.token || null,
        config.uid || null
      );

      this.isJoined = true;
      console.log('Joined channel:', config.channel, 'UID:', uid);
      return uid;
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }

  /**
   * Leave the Agora channel
   */
  async leave(): Promise<void> {
    if (!this.client || !this.isJoined) {
      console.warn('Not in a channel');
      return;
    }

    // Unpublish and destroy local tracks
    await this.unpublish();
    await this.destroyLocalTracks();

    // Leave the channel
    await this.client.leave();
    this.isJoined = false;
    this.remoteUsers.clear();
    console.log('Left channel');
  }

  /**
   * Create local audio and video tracks
   */
  async createLocalTracks(
    audioConfig?: any,
    videoConfig?: any
  ): Promise<LocalTracks> {
    try {
      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(audioConfig),
        AgoraRTC.createCameraVideoTrack(videoConfig),
      ]);

      this.localTracks = { audioTrack, videoTrack };
      console.log('Created local tracks');
      return this.localTracks;
    } catch (error) {
      console.error('Failed to create local tracks:', error);
      throw error;
    }
  }

  /**
   * Create only audio track
   */
  async createAudioTrack(config?: any): Promise<IMicrophoneAudioTrack> {
    try {
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack(config);
      this.localTracks.audioTrack = audioTrack;
      console.log('Created audio track');
      return audioTrack;
    } catch (error) {
      console.error('Failed to create audio track:', error);
      throw error;
    }
  }

  /**
   * Create only video track
   */
  async createVideoTrack(config?: any): Promise<ICameraVideoTrack> {
    try {
      const videoTrack = await AgoraRTC.createCameraVideoTrack(config);
      this.localTracks.videoTrack = videoTrack;
      console.log('Created video track');
      return videoTrack;
    } catch (error) {
      console.error('Failed to create video track:', error);
      throw error;
    }
  }

  /**
   * Publish local tracks to the channel
   */
  async publish(): Promise<void> {
    if (!this.client || !this.isJoined) {
      throw new Error('Not joined to a channel');
    }

    const tracks = [];
    if (this.localTracks.audioTrack) tracks.push(this.localTracks.audioTrack);
    if (this.localTracks.videoTrack) tracks.push(this.localTracks.videoTrack);

    if (tracks.length === 0) {
      throw new Error('No local tracks to publish');
    }

    await this.client.publish(tracks);
    console.log('Published local tracks');
  }

  /**
   * Unpublish local tracks from the channel
   */
  async unpublish(): Promise<void> {
    if (!this.client || !this.isJoined) {
      return;
    }

    const tracks = [];
    if (this.localTracks.audioTrack) tracks.push(this.localTracks.audioTrack);
    if (this.localTracks.videoTrack) tracks.push(this.localTracks.videoTrack);

    if (tracks.length > 0) {
      await this.client.unpublish(tracks);
      console.log('Unpublished local tracks');
    }
  }

  /**
   * Destroy local tracks
   */
  async destroyLocalTracks(): Promise<void> {
    if (this.localTracks.audioTrack) {
      this.localTracks.audioTrack.close();
      this.localTracks.audioTrack = null;
    }
    if (this.localTracks.videoTrack) {
      this.localTracks.videoTrack.close();
      this.localTracks.videoTrack = null;
    }
    console.log('Destroyed local tracks');
  }

  /**
   * Toggle microphone on/off
   */
  async toggleMicrophone(): Promise<boolean> {
    if (!this.localTracks.audioTrack) {
      throw new Error('No audio track available');
    }

    const enabled = this.localTracks.audioTrack.enabled;
    await this.localTracks.audioTrack.setEnabled(!enabled);
    console.log('Microphone:', !enabled ? 'enabled' : 'disabled');
    return !enabled;
  }

  /**
   * Toggle camera on/off
   */
  async toggleCamera(): Promise<boolean> {
    if (!this.localTracks.videoTrack) {
      throw new Error('No video track available');
    }

    const enabled = this.localTracks.videoTrack.enabled;
    await this.localTracks.videoTrack.setEnabled(!enabled);
    console.log('Camera:', !enabled ? 'enabled' : 'disabled');
    return !enabled;
  }

  /**
   * Get local tracks
   */
  getLocalTracks(): LocalTracks {
    return this.localTracks;
  }

  /**
   * Get all remote users
   */
  getRemoteUsers(): RemoteUser[] {
    return Array.from(this.remoteUsers.values());
  }

  /**
   * Get a specific remote user
   */
  getRemoteUser(uid: UID): RemoteUser | undefined {
    return this.remoteUsers.get(uid);
  }

  /**
   * Get RTC stats
   */
  async getStats(): Promise<CallStats | null> {
    if (!this.client || !this.isJoined) {
      return null;
    }

    const stats = this.client.getRTCStats();
    return {
      duration: stats.Duration,
      sendBitrate: Number(stats.SendBitrate) || 0,
      recvBitrate: Number(stats.RecvBitrate) || 0,
      sendPacketsLost: Number(stats.OutgoingAvailableBandwidth) || 0,
      recvPacketsLost: Number(stats.RTT) || 0,
    };
  }

  /**
   * Check if joined to channel
   */
  isInChannel(): boolean {
    return this.isJoined;
  }

  /**
   * Get current channel name
   */
  getChannelName(): string | null {
    return this.config?.channel || null;
  }

  // Event handler setters
  onUserJoined(callback: (user: RemoteUser) => void): void {
    this.onUserJoinedCallback = callback;
  }

  onUserLeft(callback: (uid: UID) => void): void {
    this.onUserLeftCallback = callback;
  }

  onUserPublished(callback: (user: RemoteUser) => void): void {
    this.onUserPublishedCallback = callback;
  }

  onUserUnpublished(callback: (uid: UID, mediaType: 'audio' | 'video') => void): void {
    this.onUserUnpublishedCallback = callback;
  }

  onNetworkQuality(callback: (stats: NetworkStats) => void): void {
    this.onNetworkQualityCallback = callback;
  }

  onConnectionState(
    callback: (curState: string, revState: string, reason?: string) => void
  ): void {
    this.onConnectionStateCallback = callback;
  }
}

/**
 * Global Agora RTC manager instance
 */
let globalAgoraManager: AgoraRTCManager | null = null;

/**
 * Get or create the global Agora manager
 */
export function getAgoraManager(): AgoraRTCManager {
  if (!globalAgoraManager) {
    globalAgoraManager = new AgoraRTCManager();
  }
  return globalAgoraManager;
}

/**
 * Reset the global Agora manager
 */
export async function resetAgoraManager(): Promise<void> {
  if (globalAgoraManager) {
    await globalAgoraManager.leave();
  }
  globalAgoraManager = null;
}
