/**
 * Integration Tests for Update Password Page
 * Tests password update flow including token handling and validation
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UpdatePasswordPage from '../page'
import { createClient } from '@/lib/supabase/client'
import { mockAuthError, createMockUser } from '@/__tests__/utils/supabase-mock'

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

describe('UpdatePasswordPage', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockPush.mockClear()

    mockSupabase = {
      auth: {
        setSession: jest.fn(),
        getUser: jest.fn(),
        updateUser: jest.fn(),
      },
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)

    // Mock window location hash
    delete (window as any).location
    window.location = {
      hash: '#access_token=test-token&refresh_token=test-refresh-token',
    } as any
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Token Exchange on Mount', () => {
    it('should extract tokens from URL hash and set session', async () => {
      mockSupabase.auth.setSession.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      await waitFor(() => {
        expect(mockSupabase.auth.setSession).toHaveBeenCalledWith({
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
        })
      })
    })

    it('should show error when tokens are invalid', async () => {
      const error = mockAuthError('Invalid token')
      mockSupabase.auth.setSession.mockResolvedValue({ error })

      render(<UpdatePasswordPage />)

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired reset link/i)).toBeInTheDocument()
      })
    })

    it('should handle error in URL hash parameters', async () => {
      window.location.hash = '#error=access_denied&error_description=User cancelled'

      render(<UpdatePasswordPage />)

      await waitFor(() => {
        expect(screen.getByText(/authentication error:.*user cancelled/i)).toBeInTheDocument()
      })
    })

    it('should check for existing session when no tokens in URL', async () => {
      window.location.hash = ''
      const mockUser = createMockUser()
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })

      render(<UpdatePasswordPage />)

      await waitFor(() => {
        expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      })
    })

    it('should show error when no session and no tokens', async () => {
      window.location.hash = ''
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      render(<UpdatePasswordPage />)

      await waitFor(() => {
        expect(screen.getByText(/no active session/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Rendering', () => {
    it('should render password fields after successful token exchange', async () => {
      mockSupabase.auth.setSession.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument()
      })
    })

    it('should render submit button', async () => {
      mockSupabase.auth.setSession.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument()
      })
    })

    it('should render cancel link', async () => {
      mockSupabase.auth.setSession.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      await waitFor(() => {
        const cancelLink = screen.getByRole('link', { name: /cancel/i })
        expect(cancelLink).toHaveAttribute('href', '/auth/login')
      })
    })
  })

  describe('Password Update Flow - Success', () => {
    beforeEach(() => {
      mockSupabase.auth.setSession.mockResolvedValue({ error: null })
    })

    it('should successfully update password', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
          password: 'newpassword123',
        })
      })
    })

    it('should show success message after password update', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(screen.getByText('Password updated!')).toBeInTheDocument()
        expect(screen.getByText(/your password has been successfully updated/i)).toBeInTheDocument()
      })
    })

    it('should redirect to login after successful update', async () => {
      jest.useFakeTimers()
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      const user = userEvent.setup({ delay: null })

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(screen.getByText('Password updated!')).toBeInTheDocument()
      })

      // Fast-forward time
      jest.advanceTimersByTime(2000)

      expect(mockPush).toHaveBeenCalledWith('/auth/login')

      jest.useRealTimers()
    })

    it('should show loading state during update', async () => {
      mockSupabase.auth.updateUser.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )

      render(<UpdatePasswordPage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')

      await user.click(screen.getByRole('button', { name: /update password/i }))

      expect(screen.getByText('Updating...')).toBeInTheDocument()
      expect(screen.getByLabelText(/^new password$/i)).toBeDisabled()
    })
  })

  describe('Password Validation', () => {
    beforeEach(() => {
      mockSupabase.auth.setSession.mockResolvedValue({ error: null })
    })

    it('should validate minimum password length', async () => {
      render(<UpdatePasswordPage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), '12345')
      await user.type(screen.getByLabelText(/confirm new password/i), '12345')

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
      })

      expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled()
    })

    it('should validate password confirmation match', async () => {
      render(<UpdatePasswordPage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'different123')

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })

      expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled()
    })

    it('should accept password with exactly 6 characters', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), '123456')
      await user.type(screen.getByLabelText(/confirm new password/i), '123456')

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.updateUser).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockSupabase.auth.setSession.mockResolvedValue({ error: null })
    })

    it('should handle update password errors', async () => {
      const error = mockAuthError('Password update failed')
      mockSupabase.auth.updateUser.mockResolvedValue({ error })

      render(<UpdatePasswordPage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(screen.getByText(/password update failed/i)).toBeInTheDocument()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should handle network errors during update', async () => {
      mockSupabase.auth.updateUser.mockRejectedValue(new Error('Network error'))

      render(<UpdatePasswordPage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('should show generic error for unknown errors', async () => {
      mockSupabase.auth.updateUser.mockRejectedValue({})

      render(<UpdatePasswordPage />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), 'newpassword123')
      await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword123')

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(screen.getByText(/failed to update password/i)).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockSupabase.auth.setSession.mockResolvedValue({ error: null })
    })

    it('should handle very long passwords', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      const user = userEvent.setup()
      const longPassword = 'a'.repeat(200)

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), longPassword)
      await user.type(screen.getByLabelText(/confirm new password/i), longPassword)

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
          password: longPassword,
        })
      })
    })

    it('should handle special characters in password', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      const user = userEvent.setup()
      const specialPassword = 'P@ssw0rd!#$%^&*()'

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), specialPassword)
      await user.type(screen.getByLabelText(/confirm new password/i), specialPassword)

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
          password: specialPassword,
        })
      })
    })

    it('should handle Unicode characters in password', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      const user = userEvent.setup()
      const unicodePassword = 'pässwörd123'

      await waitFor(() => {
        expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/^new password$/i), unicodePassword)
      await user.type(screen.getByLabelText(/confirm new password/i), unicodePassword)

      await user.click(screen.getByRole('button', { name: /update password/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
          password: unicodePassword,
        })
      })
    })
  })

  describe('URL Hash Parsing', () => {
    it('should handle URL hash with additional parameters', async () => {
      window.location.hash = '#access_token=test-token&refresh_token=test-refresh-token&type=recovery&extra=param'
      mockSupabase.auth.setSession.mockResolvedValue({ error: null })

      render(<UpdatePasswordPage />)

      await waitFor(() => {
        expect(mockSupabase.auth.setSession).toHaveBeenCalledWith({
          access_token: 'test-token',
          refresh_token: 'test-refresh-token',
        })
      })
    })

    it('should handle malformed URL hash', async () => {
      window.location.hash = '#malformed-hash'

      render(<UpdatePasswordPage />)

      await waitFor(() => {
        expect(screen.getByText(/no active session/i)).toBeInTheDocument()
      })
    })
  })
})
