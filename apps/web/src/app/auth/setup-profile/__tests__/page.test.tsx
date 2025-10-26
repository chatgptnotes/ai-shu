/**
 * Integration Tests for Setup Profile Page
 * Tests profile creation flow including authentication check and form validation
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SetupProfilePage from '../page'
import { createClient } from '@/lib/supabase/client'
import { createMockUser, mockAuthError } from '@/__tests__/utils/supabase-mock'

// Mock the Supabase client
jest.mock('@/lib/supabase/client')
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('SetupProfilePage', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockPush.mockClear()

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ error: null }),
      })),
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication Check on Mount', () => {
    it('should redirect to login if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      render(<SetupProfilePage />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('should load user data if authenticated', async () => {
      const mockUser = createMockUser({
        user_metadata: { full_name: 'John Doe' },
      })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      render(<SetupProfilePage />)

      await waitFor(() => {
        expect(screen.getByText(/complete your profile/i)).toBeInTheDocument()
      })

      expect(mockPush).not.toHaveBeenCalledWith('/auth/login')
    })

    it('should populate full name from user metadata', async () => {
      const mockUser = createMockUser({
        user_metadata: { full_name: 'Jane Smith' },
      })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      render(<SetupProfilePage />)

      await waitFor(() => {
        // The full name is stored in state but displayed in CardHeader
        expect(screen.getByText(/complete your profile/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Rendering', () => {
    beforeEach(async () => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
    })

    it('should render all form fields', async () => {
      render(<SetupProfilePage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/grade level/i)).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/curriculum/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/preferred language/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument()
    })

    it('should have default values for form fields', async () => {
      render(<SetupProfilePage />)

      await waitFor(() => {
        const gradeSelect = screen.getByLabelText(/grade level/i) as HTMLSelectElement
        expect(gradeSelect.value).toBe('9')
      })

      const curriculumSelect = screen.getByLabelText(/curriculum/i) as HTMLSelectElement
      expect(curriculumSelect.value).toBe('IB')

      const languageSelect = screen.getByLabelText(/preferred language/i) as HTMLSelectElement
      expect(languageSelect.value).toBe('en')
    })

    it('should auto-detect timezone', async () => {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      render(<SetupProfilePage />)

      await waitFor(() => {
        const timezoneInput = screen.getByLabelText(/timezone/i) as HTMLInputElement
        expect(timezoneInput.value).toBe(detectedTimezone)
      })
    })

    it('should render submit button', async () => {
      render(<SetupProfilePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
      })
    })

    it('should render all grade level options (1-12)', async () => {
      render(<SetupProfilePage />)

      await waitFor(() => {
        const gradeSelect = screen.getByLabelText(/grade level/i) as HTMLSelectElement
        const options = Array.from(gradeSelect.options).map(opt => opt.value)

        expect(options).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
      })
    })

    it('should render all curriculum options', async () => {
      render(<SetupProfilePage />)

      await waitFor(() => {
        const curriculumSelect = screen.getByLabelText(/curriculum/i) as HTMLSelectElement
        const options = Array.from(curriculumSelect.options).map(opt => opt.value)

        expect(options).toEqual(['IB', 'Edexcel', 'Cambridge', 'CBSE', 'US_Common_Core'])
      })
    })

    it('should render all supported languages', async () => {
      render(<SetupProfilePage />)

      await waitFor(() => {
        const languageSelect = screen.getByLabelText(/preferred language/i) as HTMLSelectElement
        const options = Array.from(languageSelect.options).map(opt => opt.value)

        expect(options).toEqual(['en', 'zh', 'hi', 'es', 'ar'])
      })
    })
  })

  describe('Profile Creation - Success', () => {
    beforeEach(() => {
      const mockUser = createMockUser({ id: 'test-user-123' })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
    })

    it('should successfully create profile with default values', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({ insert: mockInsert })

      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /complete setup/i }))

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({
            user_id: 'test-user-123',
            grade_level: 9,
            curriculum: 'IB',
            language: 'en',
          }),
        ])

        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should create profile with custom selections', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({ insert: mockInsert })

      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/grade level/i)).toBeInTheDocument()
      })

      await user.selectOptions(screen.getByLabelText(/grade level/i), '12')
      await user.selectOptions(screen.getByLabelText(/curriculum/i), 'Cambridge')
      await user.selectOptions(screen.getByLabelText(/preferred language/i), 'es')

      await user.click(screen.getByRole('button', { name: /complete setup/i }))

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({
            grade_level: 12,
            curriculum: 'Cambridge',
            language: 'es',
          }),
        ])
      })
    })

    it('should include full name from user metadata', async () => {
      const mockUser = createMockUser({
        id: 'test-user-123',
        user_metadata: { full_name: 'Alice Johnson' },
      })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({ insert: mockInsert })

      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /complete setup/i }))

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({
            full_name: 'Alice Johnson',
          }),
        ])
      })
    })

    it('should show loading state during submission', async () => {
      const mockInsert = jest.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )
      mockSupabase.from.mockReturnValue({ insert: mockInsert })

      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /complete setup/i }))

      expect(screen.getByText('Setting up...')).toBeInTheDocument()
      expect(screen.getByLabelText(/grade level/i)).toBeDisabled()
    })
  })

  describe('Profile Creation - Error Cases', () => {
    beforeEach(() => {
      const mockUser = createMockUser({ id: 'test-user-123' })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
    })

    it('should show error when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      render(<SetupProfilePage />)

      const user = userEvent.setup()

      // Wait for the component to try to get user
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('should handle database errors during profile creation', async () => {
      const error = { message: 'Database error' }
      const mockInsert = jest.fn().mockResolvedValue({ error })
      mockSupabase.from.mockReturnValue({ insert: mockInsert })

      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /complete setup/i }))

      await waitFor(() => {
        expect(screen.getByText(/database error/i)).toBeInTheDocument()
      })

      expect(mockPush).not.toHaveBeenCalledWith('/dashboard')
    })

    it('should handle duplicate profile error', async () => {
      const error = { message: 'duplicate key value violates unique constraint' }
      const mockInsert = jest.fn().mockResolvedValue({ error })
      mockSupabase.from.mockReturnValue({ insert: mockInsert })

      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /complete setup/i }))

      await waitFor(() => {
        expect(screen.getByText(/duplicate key value/i)).toBeInTheDocument()
      })
    })

    it('should handle network errors', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockRejectedValue(new Error('Network error')),
      })

      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /complete setup/i }))

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('should show generic error for unknown errors', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockRejectedValue({}),
      })

      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /complete setup/i }))

      await waitFor(() => {
        expect(screen.getByText(/an error occurred while setting up your profile/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Interactions', () => {
    beforeEach(() => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
    })

    it('should update grade level on selection', async () => {
      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/grade level/i)).toBeInTheDocument()
      })

      const gradeSelect = screen.getByLabelText(/grade level/i) as HTMLSelectElement

      await user.selectOptions(gradeSelect, '5')

      expect(gradeSelect.value).toBe('5')
    })

    it('should update curriculum on selection', async () => {
      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/curriculum/i)).toBeInTheDocument()
      })

      const curriculumSelect = screen.getByLabelText(/curriculum/i) as HTMLSelectElement

      await user.selectOptions(curriculumSelect, 'CBSE')

      expect(curriculumSelect.value).toBe('CBSE')
    })

    it('should update language on selection', async () => {
      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/preferred language/i)).toBeInTheDocument()
      })

      const languageSelect = screen.getByLabelText(/preferred language/i) as HTMLSelectElement

      await user.selectOptions(languageSelect, 'zh')

      expect(languageSelect.value).toBe('zh')
    })

    it('should allow manual timezone input', async () => {
      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument()
      })

      const timezoneInput = screen.getByLabelText(/timezone/i) as HTMLInputElement

      await user.clear(timezoneInput)
      await user.type(timezoneInput, 'America/New_York')

      expect(timezoneInput.value).toBe('America/New_York')
    })

    it('should clear error when user makes a selection', async () => {
      const error = { message: 'Test error' }
      const mockInsert = jest.fn().mockResolvedValue({ error })
      mockSupabase.from.mockReturnValue({ insert: mockInsert })

      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
      })

      // Trigger error
      await user.click(screen.getByRole('button', { name: /complete setup/i }))

      await waitFor(() => {
        expect(screen.getByText(/test error/i)).toBeInTheDocument()
      })

      // Change a field - error should clear
      await user.selectOptions(screen.getByLabelText(/grade level/i), '10')

      expect(screen.queryByText(/test error/i)).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
    })

    it('should handle missing full_name in metadata', async () => {
      const mockUser = createMockUser({
        user_metadata: {},
      })
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({ insert: mockInsert })

      render(<SetupProfilePage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /complete setup/i }))

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({
            full_name: '',
          }),
        ])
      })
    })

    it('should handle all grade levels', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({ insert: mockInsert })

      for (let grade = 1; grade <= 12; grade++) {
        jest.clearAllMocks()

        render(<SetupProfilePage />)

        const user = userEvent.setup()

        await waitFor(() => {
          expect(screen.getByLabelText(/grade level/i)).toBeInTheDocument()
        })

        await user.selectOptions(screen.getByLabelText(/grade level/i), grade.toString())
        await user.click(screen.getByRole('button', { name: /complete setup/i }))

        await waitFor(() => {
          expect(mockInsert).toHaveBeenCalledWith([
            expect.objectContaining({
              grade_level: grade,
            }),
          ])
        })
      }
    })

    it('should handle all supported languages', async () => {
      const languages = ['en', 'zh', 'hi', 'es', 'ar']
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({ insert: mockInsert })

      for (const lang of languages) {
        jest.clearAllMocks()

        render(<SetupProfilePage />)

        const user = userEvent.setup()

        await waitFor(() => {
          expect(screen.getByLabelText(/preferred language/i)).toBeInTheDocument()
        })

        await user.selectOptions(screen.getByLabelText(/preferred language/i), lang)
        await user.click(screen.getByRole('button', { name: /complete setup/i }))

        await waitFor(() => {
          expect(mockInsert).toHaveBeenCalledWith([
            expect.objectContaining({
              language: lang,
            }),
          ])
        })
      }
    })
  })
})
