import { NextResponse } from 'next/server';
import { generateTempToken } from '@/lib/agora/token-generator';
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

    // For development: use temporary token
    // For production: implement proper token generation with agora-access-token package
    const token = AGORA_APP_CERTIFICATE
      ? generateTempToken(channelName, uid || 0)
      : null; // null token works for testing without certificate

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
