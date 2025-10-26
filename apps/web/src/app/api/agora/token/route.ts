import { NextResponse } from 'next/server';
import { generateTempToken } from '@/lib/agora/token-generator';

const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

export async function POST(request: Request) {
  try {
    const { channelName, uid } = await request.json();

    if (!channelName) {
      return NextResponse.json(
        { error: 'Channel name is required' },
        { status: 400 }
      );
    }

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
