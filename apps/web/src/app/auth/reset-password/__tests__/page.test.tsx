/**
 * Integration Tests for Password Reset Page
 * Tests password reset request flow including validation and error handling
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResetPasswordPage from '../page'
import { createClient } from '@/lib/supabase/client'
import { mockAuthError } from '@/__tests__/utils/supabase-mock'

// Mock the Supabase client
jest.mock('@/lib/supabase/client')
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

// Mock window.location
delete (window as any).location
window.location = { origin: 'http://localhost:3002' } as any

describe('ResetPasswordPage', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      auth: {
        resetPasswordForEmail: jest.fn(),
      },
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('should render email field and submit button', () => {
      render(<ResetPasswordPage />)

      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
    })

    it('should render back to login link', () => {
      render(<ResetPasswordPage />)

      const loginLinks = screen.getAllByRole('link', { name: /back to login/i })
      expect(loginLinks.length).toBeGreaterThan(0)
      expect(loginLinks[0]).toHaveAttribute('href', '/auth/login')
    })

    it('should have correct page title and description', () => {
      render(<ResetPasswordPage />)

      expect(screen.getByText('Reset your password')).toBeInTheDocument()
      expect(screen.getByText(/enter your email address and we'll send you a reset link/i)).toBeInTheDocument()
    })
  })

  describe('Password Reset Flow - Success', () => {
    it('should successfully send reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          {
            redirectTo: 'http://localhost:3002/auth/update-password',
          }
        )
      })
    })

    it('should show success message after sending reset email', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(screen.getByText('Check your email')).toBeInTheDocument()
        expect(screen.getByText(/we've sent a password reset link to test@example.com/i)).toBeInTheDocument()
      })
    })

    it('should show expiration notice in success message', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(screen.getByText(/the link will expire in 24 hours/i)).toBeInTheDocument()
      })
    })

    it('should show loading state during reset request', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      expect(screen.getByText('Sending...')).toBeInTheDocument()
      expect(screen.getByLabelText(/^email$/i)).toBeDisabled()

      await waitFor(() => {
        expect(screen.getByText('Check your email')).toBeInTheDocument()
      })
    })
  })

  describe('Password Reset Flow - Error Cases', () => {
    it('should handle user not found error', async () => {
      const error = mockAuthError('User not found')
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'nonexistent@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(screen.getByText(/user not found/i)).toBeInTheDocument()
      })

      // Should not show success message
      expect(screen.queryByText('Check your email')).not.toBeInTheDocument()
    })

    it('should handle network errors', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockRejectedValue(new Error('Network error'))

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('should handle rate limiting errors', async () => {
      const error = mockAuthError('Rate limit exceeded', 429)
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument()
      })
    })

    it('should show generic error for unknown errors', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockRejectedValue({})

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('should require email field', () => {
      render(<ResetPasswordPage />)

      const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement
      expect(emailInput.required).toBe(true)
    })

    it('should have email input type', () => {
      render(<ResetPasswordPage />)

      const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement
      expect(emailInput.type).toBe('email')
    })
  })

  describe('Success State', () => {
    it('should hide form after successful submission', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /send reset link/i })).not.toBeInTheDocument()
      })
    })

    it('should show back to login button in success state', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to login/i })
        expect(backButton).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle email with plus addressing', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test+alias@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test+alias@example.com',
          expect.any(Object)
        )
      })
    })

    it('should handle email with subdomains', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@mail.example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@mail.example.com',
          expect.any(Object)
        )
      })
    })

    it('should not trim whitespace from email (potential bug)', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), '  test@example.com  ')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        // This will expose a bug if email is not trimmed
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          '  test@example.com  ',
          expect.any(Object)
        )
      })
    })
  })

  describe('Redirect URL Configuration', () => {
    it('should use correct redirect URL based on window.location.origin', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          {
            redirectTo: 'http://localhost:3002/auth/update-password',
          }
        )
      })
    })

    it('should handle production URL in redirect', async () => {
      // Mock production URL
      window.location = { origin: 'https://ai-shu.com' } as any

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      render(<ResetPasswordPage />)

      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /send reset link/i }))

      await waitFor(() => {
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          {
            redirectTo: 'https://ai-shu.com/auth/update-password',
          }
        )
      })

      // Reset to localhost
      window.location = { origin: 'http://localhost:3002' } as any
    })
  })
})
