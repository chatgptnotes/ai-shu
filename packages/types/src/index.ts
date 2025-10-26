// User types
export * from './user';

// Session types
export * from './session';

// Assessment types
export * from './assessment';

// Progress types
export * from './progress';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// AI Service types
export interface AvatarStreamConfig {
  provider: 'd-id' | 'heygen' | 'unreal';
  quality: 'low' | 'medium' | 'high';
  resolution: '720p' | '1080p';
}

export interface VoiceConfig {
  voice_id: string;
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface LLMConfig {
  model: 'gpt-4' | 'gpt-3.5-turbo';
  temperature: number;
  max_tokens: number;
  teaching_style: 'socratic' | 'direct' | 'mixed';
}
