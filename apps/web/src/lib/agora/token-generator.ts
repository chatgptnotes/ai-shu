/**
 * Agora RTC Token Generator
 * Generates tokens for secure Agora RTC channel access
 *
 * Note: This is a simplified implementation for development.
 * For production, use the Agora Token Server package for proper token generation.
 *
 * Documentation: https://docs.agora.io/en/video-calling/develop/authentication-workflow
 */

// import crypto from 'crypto'; // Unused for now, will be needed for production token generation

export interface TokenConfig {
  appId: string;
  appCertificate: string;
  channelName: string;
  uid: string | number;
  role: 'publisher' | 'subscriber';
  privilegeExpireTime?: number; // in seconds, default 24 hours
}

/**
 * Role types for Agora RTC
 */
export enum AgoraRole {
  PUBLISHER = 1, // Can publish and subscribe
  SUBSCRIBER = 2, // Can only subscribe
}

/**
 * Privilege types
 */
export enum AgoraPrivilege {
  JOIN_CHANNEL = 1,
  PUBLISH_AUDIO_STREAM = 2,
  PUBLISH_VIDEO_STREAM = 3,
  PUBLISH_DATA_STREAM = 4,
}

/**
 * Generate Agora RTC Token
 *
 * IMPORTANT: This implementation requires the agora-access-token package
 * Install with: npm install agora-access-token
 *
 * For now, we'll provide a placeholder that should be replaced with actual implementation
 */
export function generateAgoraToken(config: TokenConfig): string {
  const {
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpireTime = 86400, // 24 hours
  } = config;

  // Check if required environment variables are set
  if (!appId || !appCertificate) {
    throw new Error('Agora App ID and Certificate are required');
  }

  // TODO: Replace with actual Agora token generation
  // This is a placeholder for development
  console.warn(
    'Using placeholder token generation. Implement proper Agora token generation for production!'
  );

  // For development without agora-access-token package
  // Return a mock token format
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpire = currentTimestamp + privilegeExpireTime;

  // This is NOT a real Agora token - just a placeholder
  // In production, use the agora-access-token package
  const mockToken = Buffer.from(
    JSON.stringify({
      appId,
      channel: channelName,
      uid: uid.toString(),
      role,
      expire: privilegeExpire,
    })
  ).toString('base64');

  return mockToken;
}

/**
 * Validate token expiration
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return decoded.expire < currentTimestamp;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.expire;
  } catch {
    return null;
  }
}

/**
 * Generate a simple temporary token for development
 * WARNING: Only use for development/testing!
 */
export function generateTempToken(channelName: string, uid: string | number): string {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpire = currentTimestamp + 86400; // 24 hours

  return Buffer.from(
    JSON.stringify({
      channel: channelName,
      uid: uid.toString(),
      expire: privilegeExpire,
      temp: true,
    })
  ).toString('base64');
}

/**
 * Production-ready token generation using agora-access-token package
 *
 * To use this, install: npm install agora-access-token
 * Then uncomment and use this function instead
 */
/*
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export function generateProductionToken(config: TokenConfig): string {
  const {
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpireTime = 86400,
  } = config;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpire = currentTimestamp + privilegeExpireTime;

  const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  // Build the token
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    typeof uid === 'string' ? parseInt(uid) : uid,
    agoraRole,
    privilegeExpire
  );

  return token;
}
*/
