/**
 * Unit Tests for Supabase Client Creation
 * Tests the browser-side Supabase client initialization and error handling
 */

import { createClient } from '../client'

// Mock the @supabase/ssr module
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn((url: string, key: string) => ({
    url,
    key,
    auth: {},
    from: jest.fn(),
  })),
}))

describe('Supabase Client (Browser)', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules()
    process.env = { ...originalEnv }
    jest.clearAllMocks()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('createClient', () => {
    it('should create a Supabase client with valid environment variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      const client = createClient()

      expect(client).toBeDefined()
      expect(client.url).toBe('https://test.supabase.co')
      expect(client.key).toBe('test-anon-key')
    })

    it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      expect(() => createClient()).toThrow(
        'Supabase configuration is missing. Please check your environment variables.'
      )
    })

    it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      expect(() => createClient()).toThrow(
        'Supabase configuration is missing. Please check your environment variables.'
      )
    })

    it('should throw error when both environment variables are missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      expect(() => createClient()).toThrow(
        'Supabase configuration is missing. Please check your environment variables.'
      )
    })

    it('should log error details when environment variables are missing', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      expect(() => createClient()).toThrow()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Missing Supabase environment variables:',
        expect.objectContaining({
          hasUrl: false,
          hasKey: true,
          url: 'MISSING',
        })
      )

      consoleErrorSpy.mockRestore()
    })

    it('should log URL when creating client successfully', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      createClient()

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Creating Supabase client with URL:',
        'https://test.supabase.co'
      )

      consoleLogSpy.mockRestore()
    })
  })
})
