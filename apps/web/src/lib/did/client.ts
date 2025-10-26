/**
 * D-ID API Client
 * Handles avatar video generation and streaming
 * Documentation: https://docs.d-id.com/reference/api-overview
 */

export interface DIDConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface CreateTalkRequest {
  source_url: string; // URL of the avatar image
  script: {
    type: 'text' | 'audio';
    input: string; // Text to speak or audio URL
    provider?: {
      type: 'microsoft' | 'elevenlabs' | 'amazon';
      voice_id?: string;
    };
  };
  config?: {
    fluent?: boolean;
    pad_audio?: number;
    stitch?: boolean;
    result_format?: 'mp4' | 'gif' | 'mov';
  };
  webhook?: string;
}

export interface CreateTalkResponse {
  id: string;
  status: 'created' | 'processing' | 'done' | 'error';
  created_at: string;
  result_url?: string;
  error?: {
    kind: string;
    description: string;
  };
}

export interface TalkStream {
  id: string;
  status: string;
  result_url?: string;
}

export class DIDClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: DIDConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.d-id.com';
  }

  /**
   * Create a new talk (avatar video)
   */
  async createTalk(request: CreateTalkRequest): Promise<CreateTalkResponse> {
    const response = await fetch(`${this.baseUrl}/talks`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`D-ID API error: ${error.error || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get talk status and result URL
   */
  async getTalk(talkId: string): Promise<CreateTalkResponse> {
    const response = await fetch(`${this.baseUrl}/talks/${talkId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`D-ID API error: ${error.error || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Delete a talk
   */
  async deleteTalk(talkId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/talks/${talkId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`D-ID API error: ${error.error || response.statusText}`);
    }
  }

  /**
   * Create streaming talk (for real-time interaction)
   */
  async createStreamingTalk(request: CreateTalkRequest): Promise<TalkStream> {
    const response = await fetch(`${this.baseUrl}/talks/streams`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`D-ID API error: ${error.error || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Poll talk status until completion or error
   * @param talkId - The talk ID to poll
   * @param maxAttempts - Maximum number of polling attempts (default: 60)
   * @param intervalMs - Polling interval in milliseconds (default: 2000)
   */
  async pollTalkStatus(
    talkId: string,
    maxAttempts: number = 60,
    intervalMs: number = 2000
  ): Promise<CreateTalkResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const talk = await this.getTalk(talkId);

      if (talk.status === 'done') {
        return talk;
      }

      if (talk.status === 'error') {
        throw new Error(`Talk failed: ${talk.error?.description || 'Unknown error'}`);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Talk generation timed out');
  }
}

/**
 * Create a DID client instance
 */
export function createDIDClient(apiKey: string): DIDClient {
  return new DIDClient({ apiKey });
}
