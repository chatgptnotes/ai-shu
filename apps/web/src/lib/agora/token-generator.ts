/**
 * Agora RTC Token Generator
 * Generates tokens for secure Agora RTC channel access
 *
 * Uses the agora-token package for production-ready token generation.
 *
 * Documentation: https://docs.agora.io/en/video-calling/develop/authentication-workflow
 */

import { RtcTokenBuilder, RtcRole } from 'agora-token';

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
 * Production-ready token generation using agora-token package
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
    throw new Error('Agora App ID and Certificate are required for token generation');
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpire = currentTimestamp + privilegeExpireTime;

  // Convert role to Agora role type
  const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  // Convert uid to number if it's a string
  const numericUid = typeof uid === 'string' ? parseInt(uid, 10) : uid;

  // Build the production token
  // buildTokenWithUid(appId, appCertificate, channelName, uid, role, tokenExpire, privilegeExpire)
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    numericUid,
    agoraRole,
    privilegeExpire, // Token expiration timestamp
    privilegeExpire  // Privilege expiration timestamp (same as token)
  );

  return token;
}

/**
 * Generate a simple temporary token for development/testing
 * WARNING: Only use when AGORA_APP_CERTIFICATE is not configured!
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
