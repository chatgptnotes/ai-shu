/**
 * Agora Device Manager
 * Handles camera, microphone, and speaker selection
 */

import AgoraRTC from 'agora-rtc-sdk-ng';

export class DeviceManager {
  /**
   * Get all available cameras
   */
  async getCameras(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await AgoraRTC.getCameras();
      console.log('Available cameras:', devices);
      return devices;
    } catch (error) {
      console.error('Failed to get cameras:', error);
      return [];
    }
  }

  /**
   * Get all available microphones
   */
  async getMicrophones(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await AgoraRTC.getMicrophones();
      console.log('Available microphones:', devices);
      return devices;
    } catch (error) {
      console.error('Failed to get microphones:', error);
      return [];
    }
  }

  /**
   * Get all available speakers/playback devices
   */
  async getSpeakers(): Promise<MediaDeviceInfo[]> {
    try {
      // Note: getPlaybackDevices is only supported on Electron
      if (typeof window !== 'undefined' && (window as any).electron) {
        const devices = await AgoraRTC.getPlaybackDevices();
        console.log('Available speakers:', devices);
        return devices;
      }
      return [];
    } catch (error) {
      console.error('Failed to get speakers:', error);
      return [];
    }
  }

  /**
   * Request camera permissions
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  /**
   * Request microphone permissions
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Request both camera and microphone permissions
   */
  async requestMediaPermissions(): Promise<{ camera: boolean; microphone: boolean }> {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      return { camera: true, microphone: true };
    } catch (error) {
      console.error('Media permissions denied:', error);
      return { camera: false, microphone: false };
    }
  }

  /**
   * Check if device has camera
   */
  async hasCamera(): Promise<boolean> {
    const cameras = await this.getCameras();
    return cameras.length > 0;
  }

  /**
   * Check if device has microphone
   */
  async hasMicrophone(): Promise<boolean> {
    const microphones = await this.getMicrophones();
    return microphones.length > 0;
  }

  /**
   * Get default camera
   */
  async getDefaultCamera(): Promise<MediaDeviceInfo | null> {
    const cameras = await this.getCameras();
    return cameras.length > 0 ? cameras[0] : null;
  }

  /**
   * Get default microphone
   */
  async getDefaultMicrophone(): Promise<MediaDeviceInfo | null> {
    const microphones = await this.getMicrophones();
    return microphones.length > 0 ? microphones[0] : null;
  }
}

// Global device manager instance
let globalDeviceManager: DeviceManager | null = null;

/**
 * Get or create the global device manager
 */
export function getDeviceManager(): DeviceManager {
  if (!globalDeviceManager) {
    globalDeviceManager = new DeviceManager();
  }
  return globalDeviceManager;
}
