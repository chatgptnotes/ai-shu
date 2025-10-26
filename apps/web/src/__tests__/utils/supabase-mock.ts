import { AuthError, AuthResponse, User, Session } from '@supabase/supabase-js'

export interface MockSupabaseClient {
  auth: {
    signUp: jest.Mock
    signInWithPassword: jest.Mock
    signOut: jest.Mock
    getUser: jest.Mock
    resetPasswordForEmail: jest.Mock
    updateUser: jest.Mock
    setSession: jest.Mock
  }
  from: jest.Mock
}

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    full_name: 'Test User',
    ...overrides.user_metadata,
  },
  ...overrides,
} as User)

export const createMockSession = (user: User): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user,
})

export const createMockAuthResponse = (
  user: User | null,
  session: Session | null = null,
  error: AuthError | null = null
): AuthResponse => ({
  data: {
    user,
    session: session || (user ? createMockSession(user) : null),
  },
  error,
})

export const createMockSupabaseClient = (): MockSupabaseClient => {
  const mockClient: MockSupabaseClient = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      setSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  }

  return mockClient
}

export const mockAuthError = (message: string, status: number = 400): AuthError => ({
  name: 'AuthError',
  message,
  status,
})
