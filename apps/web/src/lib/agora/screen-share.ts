/**
 * Agora Screen Sharing
 * Handles screen sharing functionality for collaborative whiteboard and presentations
 */

import AgoraRTC, { ILocalVideoTrack, ScreenVideoTrackInitConfig } from 'agora-rtc-sdk-ng';

export class ScreenShareManager {
  private screenTrack: ILocalVideoTrack | null = null;
  private isSharing: boolean = false;

  /**
   * Start screen sharing
   */
  async startScreenShare(config?: ScreenVideoTrackInitConfig): Promise<ILocalVideoTrack> {
    if (this.isSharing) {
      throw new Error('Already sharing screen');
    }

    try {
      // Create screen video track
      this.screenTrack = await AgoraRTC.createScreenVideoTrack(
        config || {
          encoderConfig: '1080p_1', // High quality for whiteboard sharing
          optimizationMode: 'detail', // Optimize for detailed content (vs motion)
        },
        'disable' // Disable audio sharing by default
      );

      this.isSharing = true;
      console.log('Screen sharing started');

      // Handle track end (user stops sharing via browser UI)
      this.screenTrack.on('track-ended', () => {
        this.stopScreenShare();
      });

      return this.screenTrack;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw error;
    }
  }

  /**
   * Stop screen sharing
   */
  stopScreenShare(): void {
    if (this.screenTrack) {
      this.screenTrack.close();
      this.screenTrack = null;
    }
    this.isSharing = false;
    console.log('Screen sharing stopped');
  }

  /**
   * Get current screen track
   */
  getScreenTrack(): ILocalVideoTrack | null {
    return this.screenTrack;
  }

  /**
   * Check if currently sharing screen
   */
  isSharingScreen(): boolean {
    return this.isSharing;
  }

  /**
   * Switch between camera and screen share
   */
  async toggleScreenShare(
    client: any,
    cameraTrack: ILocalVideoTrack | null,
    config?: ScreenVideoTrackInitConfig
  ): Promise<{ screenTrack: ILocalVideoTrack | null; isSharing: boolean }> {
    if (this.isSharing) {
      // Stop screen share and switch back to camera
      if (this.screenTrack) {
        await client.unpublish(this.screenTrack);
        this.stopScreenShare();
      }

      if (cameraTrack) {
        await client.publish(cameraTrack);
      }

      return { screenTrack: null, isSharing: false };
    } else {
      // Stop camera and start screen share
      if (cameraTrack) {
        await client.unpublish(cameraTrack);
      }

      const screenTrack = await this.startScreenShare(config);
      await client.publish(screenTrack);

      return { screenTrack, isSharing: true };
    }
  }
}

// Global screen share manager instance
let globalScreenShareManager: ScreenShareManager | null = null;

/**
 * Get or create the global screen share manager
 */
export function getScreenShareManager(): ScreenShareManager {
  if (!globalScreenShareManager) {
    globalScreenShareManager = new ScreenShareManager();
  }
  return globalScreenShareManager;
}

/**
 * Reset the global screen share manager
 */
export function resetScreenShareManager(): void {
  if (globalScreenShareManager) {
    globalScreenShareManager.stopScreenShare();
  }
  globalScreenShareManager = null;
}
