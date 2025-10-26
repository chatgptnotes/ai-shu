import { NextResponse } from 'next/server';
import { generateAgoraToken, generateTempToken } from '@/lib/agora/token-generator';
import { withCsrfProtection } from '@/lib/security/csrf-middleware';
import { validateRequestBody, agoraTokenSchema } from '@/lib/security/validation';

const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

export async function POST(request: Request) {
  // Apply CSRF protection
  const csrfCheck = await withCsrfProtection(request);
  if (csrfCheck) return csrfCheck;

  // Validate request body
  const validation = await validateRequestBody(request, agoraTokenSchema);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', message: validation.error },
      { status: 400 }
    );
  }

  try {
    const { channelName, uid } = validation.data;

    if (!AGORA_APP_ID) {
      return NextResponse.json(
        { error: 'Agora App ID not configured' },
        { status: 500 }
      );
    }

    let token: string | null = null;

    // Production: use secure token generation with certificate
    if (AGORA_APP_CERTIFICATE) {
      try {
        token = generateAgoraToken({
          appId: AGORA_APP_ID,
          appCertificate: AGORA_APP_CERTIFICATE,
          channelName,
          uid: uid || 0,
          role: 'publisher', // Default to publisher role for video calls
          privilegeExpireTime: 86400, // 24 hours
        });
      } catch (error) {
        console.error('Production token generation failed:', error);
        return NextResponse.json(
          { error: 'Failed to generate secure token' },
          { status: 500 }
        );
      }
    } else {
      // Development: use temporary token (less secure, for testing only)
      console.warn('AGORA_APP_CERTIFICATE not set - using temporary token for development only');
      token = generateTempToken(channelName, uid || 0);
    }

    return NextResponse.json({
      token,
      appId: AGORA_APP_ID,
      channel: channelName,
      uid: uid || 0,
      expiresIn: 86400, // 24 hours
    });
  } catch (error) {
    console.error('Agora token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
