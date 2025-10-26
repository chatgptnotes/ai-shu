/**
 * Integration Tests for NewSessionForm Component
 * Tests session creation flow including authentication, form validation, and redirect
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewSessionForm } from '../NewSessionForm'
import { createClient } from '@/lib/supabase/client'
import { createMockUser } from '@/__tests__/utils/supabase-mock'

// Mock the Supabase client
jest.mock('@/lib/supabase/client')
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Mock next/navigation
const mockPush = jest.fn()
const mockGetSearchParams = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGetSearchParams,
  }),
}))

describe('NewSessionForm', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockPush.mockClear()
    mockGetSearchParams.mockClear()

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication and Profile Check', () => {
    it('should redirect to login if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      render(<NewSessionForm />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('should redirect to setup-profile if student profile does not exist', async () => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }))
      mockSupabase.from = mockFrom

      render(<NewSessionForm />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/setup-profile')
      })
    })

    it('should load student profile when authenticated', async () => {
      const mockUser = createMockUser({ id: 'test-user-123' })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'student-123', user_id: 'test-user-123' },
          error: null,
        }),
      }))
      mockSupabase.from = mockFrom

      render(<NewSessionForm />)

      await waitFor(() => {
        expect(screen.getByText(/start a new session/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Rendering', () => {
    beforeEach(async () => {
      const mockUser = createMockUser({ id: 'test-user-123' })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'student-123', user_id: 'test-user-123' },
          error: null,
        }),
      }))
      mockSupabase.from = mockFrom
    })

    it('should render all form fields', async () => {
      render(<NewSessionForm />)

      await waitFor(() => {
        expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/topic/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should have default subject as physics', async () => {
      mockGetSearchParams.mockReturnValue(null)

      render(<NewSessionForm />)

      await waitFor(() => {
        const subjectSelect = screen.getByLabelText(/subject/i) as HTMLSelectElement
        expect(subjectSelect.value).toBe('physics')
      })
    })

    it('should pre-populate subject from URL query param', async () => {
      mockGetSearchParams.mockReturnValue('chemistry')

      render(<NewSessionForm />)

      await waitFor(() => {
        const subjectSelect = screen.getByLabelText(/subject/i) as HTMLSelectElement
        expect(subjectSelect.value).toBe('chemistry')
      })
    })

    it('should render all subject options', async () => {
      render(<NewSessionForm />)

      await waitFor(() => {
        const subjectSelect = screen.getByLabelText(/subject/i) as HTMLSelectElement
        const options = Array.from(subjectSelect.options).map(opt => opt.value)

        expect(options).toEqual(['physics', 'chemistry', 'mathematics', 'business', 'economics'])
      })
    })
  })

  describe('Form Validation', () => {
    beforeEach(async () => {
      const mockUser = createMockUser({ id: 'test-user-123' })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'student-123', user_id: 'test-user-123' },
          error: null,
        }),
      }))
      mockSupabase.from = mockFrom
    })

    it('should show error when topic is empty', async () => {
      render(<NewSessionForm />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument()
      })

      // Clear the topic input
      const topicInput = screen.getByLabelText(/topic/i)
      await user.clear(topicInput)

      // Try to submit
      await user.click(screen.getByRole('button', { name: /start session/i }))

      await waitFor(() => {
        expect(screen.getByText(/please enter a topic/i)).toBeInTheDocument()
      })
    })

    it('should clear error when user starts typing', async () => {
      render(<NewSessionForm />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/topic/i)).toBeInTheDocument()
      })

      // Trigger error first
      const topicInput = screen.getByLabelText(/topic/i)
      await user.clear(topicInput)
      await user.click(screen.getByRole('button', { name: /start session/i }))

      await waitFor(() => {
        expect(screen.getByText(/please enter a topic/i)).toBeInTheDocument()
      })

      // Start typing - error should clear
      await user.type(topicInput, 'Newton')

      expect(screen.queryByText(/please enter a topic/i)).not.toBeInTheDocument()
    })
  })

  describe('Session Creation - Success Flow', () => {
    beforeEach(async () => {
      const mockUser = createMockUser({ id: 'test-user-123' })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
    })

    it('should successfully create a session and redirect to chat', async () => {
      const mockSessionData = {
        id: 'session-456',
        student_id: 'student-123',
        subject: 'physics',
        topic: 'Newton Laws',
        status: 'in_progress',
        started_at: new Date().toISOString(),
      }

      const mockSelect = jest.fn().mockReturnThis()
      const mockInsert = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn()
        .mockResolvedValueOnce({
          data: { id: 'student-123', user_id: 'test-user-123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockSessionData,
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockSessionData,
          error: null,
        })

      const mockFrom = jest.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
        eq: mockEq,
        single: mockSingle,
      }))

      mockSupabase.from = mockFrom

      render(<NewSessionForm />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/topic/i)).toBeInTheDocument()
      })

      // Fill in the form
      const topicInput = screen.getByLabelText(/topic/i)
      await user.clear(topicInput)
      await user.type(topicInput, 'Newton Laws')

      // Submit
      await user.click(screen.getByRole('button', { name: /start session/i }))

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({
            student_id: 'student-123',
            subject: 'physics',
            topic: 'Newton Laws',
            status: 'in_progress',
          }),
        ])
      })

      // Should redirect to session page
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/session/session-456')
      })
    })

    it('should create session with selected subject', async () => {
      const mockSessionData = {
        id: 'session-789',
        student_id: 'student-123',
        subject: 'chemistry',
        topic: 'Periodic Table',
        status: 'in_progress',
      }

      const mockSelect = jest.fn().mockReturnThis()
      const mockInsert = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn()
        .mockResolvedValueOnce({
          data: { id: 'student-123', user_id: 'test-user-123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockSessionData,
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockSessionData,
          error: null,
        })

      const mockFrom = jest.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
        eq: mockEq,
        single: mockSingle,
      }))

      mockSupabase.from = mockFrom

      render(<NewSessionForm />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      })

      // Change subject
      await user.selectOptions(screen.getByLabelText(/subject/i), 'chemistry')

      // Fill topic
      const topicInput = screen.getByLabelText(/topic/i)
      await user.type(topicInput, 'Periodic Table')

      // Submit
      await user.click(screen.getByRole('button', { name: /start session/i }))

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({
            subject: 'chemistry',
            topic: 'Periodic Table',
          }),
        ])
      })
    })

    it('should show loading state during submission', async () => {
      const mockInsert = jest.fn().mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                data: {
                  id: 'session-999',
                  student_id: 'student-123',
                  subject: 'physics',
                  topic: 'Test Topic',
                },
                error: null,
              }),
            100
          )
        )
      )

      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: { id: 'student-123', user_id: 'test-user-123' },
        error: null,
      })

      const mockFrom = jest.fn((table: string) => {
        if (table === 'sessions') {
          return {
            select: mockSelect,
            insert: mockInsert,
            eq: mockEq,
            single: mockSingle,
          }
        }
        return {
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        }
      })

      mockSupabase.from = mockFrom

      render(<NewSessionForm />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/topic/i)).toBeInTheDocument()
      })

      const topicInput = screen.getByLabelText(/topic/i)
      await user.type(topicInput, 'Test Topic')

      await user.click(screen.getByRole('button', { name: /start session/i }))

      expect(screen.getByText('Starting...')).toBeInTheDocument()
      expect(screen.getByLabelText(/subject/i)).toBeDisabled()
      expect(screen.getByLabelText(/topic/i)).toBeDisabled()
    })
  })

  describe('Session Creation - Error Cases', () => {
    beforeEach(async () => {
      const mockUser = createMockUser({ id: 'test-user-123' })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'student-123', user_id: 'test-user-123' },
          error: null,
        }),
      }))
      mockSupabase.from = mockFrom
    })

    it('should handle database error during session creation', async () => {
      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn()
        .mockResolvedValueOnce({
          data: { id: 'student-123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Database connection failed', code: 'PGRST301' },
        })

      mockSupabase.from = jest.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
        eq: mockEq,
        single: mockSingle,
      }))

      render(<NewSessionForm />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/topic/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/topic/i), 'Test Topic')
      await user.click(screen.getByRole('button', { name: /start session/i }))

      await waitFor(() => {
        expect(screen.getByText(/database connection failed/i)).toBeInTheDocument()
      })

      expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('/session/'))
    })

    it('should handle null session data error', async () => {
      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn()
        .mockResolvedValueOnce({
          data: { id: 'student-123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: null,
        })

      mockSupabase.from = jest.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
        eq: mockEq,
        single: mockSingle,
      }))

      render(<NewSessionForm />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/topic/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/topic/i), 'Test Topic')
      await user.click(screen.getByRole('button', { name: /start session/i }))

      await waitFor(() => {
        expect(screen.getByText(/failed to create session - no data returned/i)).toBeInTheDocument()
      })
    })

    it('should handle missing session ID error', async () => {
      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn()
        .mockResolvedValueOnce({
          data: { id: 'student-123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { subject: 'physics', topic: 'Test' },
          error: null,
        })

      mockSupabase.from = jest.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
        eq: mockEq,
        single: mockSingle,
      }))

      render(<NewSessionForm />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/topic/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/topic/i), 'Test Topic')
      await user.click(screen.getByRole('button', { name: /start session/i }))

      await waitFor(() => {
        expect(screen.getByText(/failed to create session - no id returned/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cancel Button', () => {
    beforeEach(async () => {
      const mockUser = createMockUser({ id: 'test-user-123' })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockFrom = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'student-123', user_id: 'test-user-123' },
          error: null,
        }),
      }))
      mockSupabase.from = mockFrom
    })

    it('should navigate to dashboard when cancel is clicked', async () => {
      render(<NewSessionForm />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
