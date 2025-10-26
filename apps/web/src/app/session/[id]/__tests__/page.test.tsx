/**
 * Integration Tests for Session Page
 * Tests server-side session fetching, params compatibility (Next.js 14 vs 15), and ChatInterface integration
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import SessionPage from '../page'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('@/components/chat/ChatInterface', () => ({
  ChatInterface: ({ sessionId, subject, topic, studentName, onEndSession }: any) => (
    <div data-testid="chat-interface">
      <div data-testid="session-id">{sessionId}</div>
      <div data-testid="subject">{subject}</div>
      <div data-testid="topic">{topic}</div>
      <div data-testid="student-name">{studentName}</div>
      <button onClick={onEndSession}>End Session Mock</button>
    </div>
  ),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('SessionPage', () => {
  let mockSupabase: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      })),
    }

    mockCreateClient.mockResolvedValue(mockSupabase as any)
  })

  describe('Params Compatibility - Next.js 14 vs 15', () => {
    it('should handle params as a plain object (Next.js 14)', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
      }

      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        full_name: 'John Doe',
        grade_level: 10,
      }

      const mockSession = {
        id: 'session-456',
        student_id: 'profile-123',
        subject: 'physics',
        topic: 'Newton Laws',
        status: 'in_progress',
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFrom = jest.fn((table: string) => {
        if (table === 'student_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockSession,
              error: null,
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
        }
      })

      mockSupabase.from = mockFrom

      // Next.js 14 style params
      const params = { id: 'session-456' }

      const component = await SessionPage({ params })
      render(component)

      expect(screen.getByTestId('chat-interface')).toBeInTheDocument()
      expect(screen.getByTestId('session-id')).toHaveTextContent('session-456')
      expect(screen.getByTestId('subject')).toHaveTextContent('physics')
      expect(screen.getByTestId('topic')).toHaveTextContent('Newton Laws')
      expect(screen.getByTestId('student-name')).toHaveTextContent('John Doe')
    })

    it('should handle params as a Promise (Next.js 15)', async () => {
      const mockUser = {
        id: 'user-789',
        email: 'test2@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
      }

      const mockProfile = {
        id: 'profile-789',
        user_id: 'user-789',
        full_name: 'Jane Smith',
        grade_level: 11,
      }

      const mockSession = {
        id: 'session-999',
        student_id: 'profile-789',
        subject: 'chemistry',
        topic: 'Periodic Table',
        status: 'in_progress',
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFrom = jest.fn((table: string) => {
        if (table === 'student_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockSession,
              error: null,
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
        }
      })

      mockSupabase.from = mockFrom

      // Next.js 15 style params (Promise)
      const params = Promise.resolve({ id: 'session-999' })

      const component = await SessionPage({ params })
      render(component)

      expect(screen.getByTestId('chat-interface')).toBeInTheDocument()
      expect(screen.getByTestId('session-id')).toHaveTextContent('session-999')
      expect(screen.getByTestId('subject')).toHaveTextContent('chemistry')
      expect(screen.getByTestId('topic')).toHaveTextContent('Periodic Table')
      expect(screen.getByTestId('student-name')).toHaveTextContent('Jane Smith')
    })
  })

  describe('Authentication and Authorization', () => {
    it('should redirect to login if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const params = { id: 'session-123' }

      await expect(SessionPage({ params })).rejects.toThrow()

      expect(mockRedirect).toHaveBeenCalledWith('/auth/login')
    })

    it('should redirect to login if auth error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      })

      const params = { id: 'session-123' }

      await expect(SessionPage({ params })).rejects.toThrow()

      expect(mockRedirect).toHaveBeenCalledWith('/auth/login')
    })

    it('should redirect to setup-profile if student profile does not exist', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const params = { id: 'session-123' }

      await expect(SessionPage({ params })).rejects.toThrow()

      expect(mockRedirect).toHaveBeenCalledWith('/auth/setup-profile')
    })

    it('should redirect to setup-profile if profile fetch fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile not found' },
        }),
      })

      const params = { id: 'session-123' }

      await expect(SessionPage({ params })).rejects.toThrow()

      expect(mockRedirect).toHaveBeenCalledWith('/auth/setup-profile')
    })
  })

  describe('Session Fetching and Validation', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
    }

    const mockProfile = {
      id: 'profile-123',
      user_id: 'user-123',
      full_name: 'Test User',
      grade_level: 10,
    }

    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
    })

    it('should redirect to dashboard if session is not found', async () => {
      const mockFrom = jest.fn((table: string) => {
        if (table === 'student_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Session not found', code: 'PGRST116' },
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
        }
      })

      mockSupabase.from = mockFrom

      const params = { id: 'nonexistent-session' }

      await expect(SessionPage({ params })).rejects.toThrow()

      expect(mockRedirect).toHaveBeenCalledWith('/dashboard?error=session_not_found')
    })

    it('should redirect if session data is null despite no error', async () => {
      const mockFrom = jest.fn((table: string) => {
        if (table === 'student_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
        }
      })

      mockSupabase.from = mockFrom

      const params = { id: 'session-123' }

      await expect(SessionPage({ params })).rejects.toThrow()

      expect(mockRedirect).toHaveBeenCalledWith('/dashboard?error=session_not_found')
    })

    it('should fetch session with correct filters', async () => {
      const mockSession = {
        id: 'session-456',
        student_id: 'profile-123',
        subject: 'physics',
        topic: 'Test Topic',
        status: 'in_progress',
      }

      const mockSelectSessions = jest.fn().mockReturnThis()
      const mockEqSessions = jest.fn().mockReturnThis()
      const mockSingleSessions = jest.fn().mockResolvedValue({
        data: mockSession,
        error: null,
      })

      const mockFrom = jest.fn((table: string) => {
        if (table === 'student_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }
        }
        if (table === 'sessions') {
          return {
            select: mockSelectSessions,
            eq: mockEqSessions,
            single: mockSingleSessions,
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
        }
      })

      mockSupabase.from = mockFrom

      const params = { id: 'session-456' }

      await SessionPage({ params })

      expect(mockSelectSessions).toHaveBeenCalledWith('*')
      expect(mockEqSessions).toHaveBeenCalledWith('id', 'session-456')
      expect(mockEqSessions).toHaveBeenCalledWith('student_id', 'profile-123')
    })
  })

  describe('ChatInterface Props Validation', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
    }

    const mockProfile = {
      id: 'profile-123',
      user_id: 'user-123',
      full_name: 'Alice Wonder',
      grade_level: 9,
    }

    it('should pass all required props to ChatInterface', async () => {
      const mockSession = {
        id: 'session-789',
        student_id: 'profile-123',
        subject: 'mathematics',
        topic: 'Algebra Basics',
        status: 'in_progress',
        started_at: new Date().toISOString(),
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFrom = jest.fn((table: string) => {
        if (table === 'student_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockSession,
              error: null,
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
        }
      })

      mockSupabase.from = mockFrom

      const params = { id: 'session-789' }

      const component = await SessionPage({ params })
      render(component)

      // Verify all required props are passed correctly
      expect(screen.getByTestId('session-id')).toHaveTextContent('session-789')
      expect(screen.getByTestId('subject')).toHaveTextContent('mathematics')
      expect(screen.getByTestId('topic')).toHaveTextContent('Algebra Basics')
      expect(screen.getByTestId('student-name')).toHaveTextContent('Alice Wonder')
    })

    it('should render page header with AI-Shu title', async () => {
      const mockSession = {
        id: 'session-123',
        student_id: 'profile-123',
        subject: 'physics',
        topic: 'Test',
        status: 'in_progress',
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFrom = jest.fn((table: string) => {
        if (table === 'student_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockSession,
              error: null,
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
        }
      })

      mockSupabase.from = mockFrom

      const params = { id: 'session-123' }

      const component = await SessionPage({ params })
      render(component)

      expect(screen.getByText('AI-Shu')).toBeInTheDocument()
    })
  })

  describe('Error Prevention - Bug Fixes', () => {
    it('should verify session exists before passing to ChatInterface', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
      }

      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        full_name: 'Test User',
        grade_level: 10,
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFrom = jest.fn((table: string) => {
        if (table === 'student_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
        }
      })

      mockSupabase.from = mockFrom

      const params = { id: 'session-123' }

      // Should redirect instead of rendering ChatInterface with undefined session
      await expect(SessionPage({ params })).rejects.toThrow()
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard?error=session_not_found')
    })

    it('should ensure session.id exists before redirect', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
      }

      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        full_name: 'Test User',
        grade_level: 10,
      }

      const mockSession = {
        id: 'valid-session-id',
        student_id: 'profile-123',
        subject: 'physics',
        topic: 'Test',
        status: 'in_progress',
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockFrom = jest.fn((table: string) => {
        if (table === 'student_profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }
        }
        if (table === 'sessions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockSession,
              error: null,
            }),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn(),
        }
      })

      mockSupabase.from = mockFrom

      const params = { id: 'valid-session-id' }

      const component = await SessionPage({ params })
      render(component)

      // Session ID should be passed to ChatInterface
      expect(screen.getByTestId('session-id')).toHaveTextContent('valid-session-id')
    })
  })
})
