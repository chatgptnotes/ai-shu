/**
 * Integration Tests for ChatInterface Component
 * Tests chat functionality, prop validation, message handling, and error states
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInterface } from '../ChatInterface'

// Mock fetch globally
global.fetch = jest.fn()

describe('ChatInterface', () => {
  const defaultProps = {
    sessionId: 'session-123',
    subject: 'physics',
    topic: 'Newton Laws',
    studentName: 'John Doe',
    onEndSession: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Prop Validation and Error Handling', () => {
    it('should render error state when sessionId is missing', () => {
      const props = { ...defaultProps, sessionId: '' }

      render(<ChatInterface {...props} />)

      expect(screen.getByText(/session id is missing/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /return to dashboard/i })).toBeInTheDocument()
    })

    it('should render error state when subject is missing', () => {
      const props = { ...defaultProps, subject: '' }

      render(<ChatInterface {...props} />)

      expect(screen.getByText(/subject is missing/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /return to dashboard/i })).toBeInTheDocument()
    })

    it('should render error state when topic is missing', () => {
      const props = { ...defaultProps, topic: '' }

      render(<ChatInterface {...props} />)

      expect(screen.getByText(/topic is missing/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /return to dashboard/i })).toBeInTheDocument()
    })

    it('should call onEndSession when return to dashboard is clicked from error state', async () => {
      const mockOnEndSession = jest.fn()
      const props = { ...defaultProps, sessionId: '', onEndSession: mockOnEndSession }

      render(<ChatInterface {...props} />)

      const user = userEvent.setup()
      const returnButton = screen.getByRole('button', { name: /return to dashboard/i })

      await user.click(returnButton)

      expect(mockOnEndSession).toHaveBeenCalledTimes(1)
    })

    it('should not render error state when all required props are provided', () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ messages: [] }),
      })

      render(<ChatInterface {...defaultProps} />)

      expect(screen.queryByText(/is missing/i)).not.toBeInTheDocument()
      expect(screen.getByText(defaultProps.topic)).toBeInTheDocument()
      expect(screen.getByText(defaultProps.subject)).toBeInTheDocument()
    })
  })

  describe('Component Rendering', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ messages: [] }),
      })
    })

    it('should render chat interface with topic and subject', () => {
      render(<ChatInterface {...defaultProps} />)

      expect(screen.getByText('Newton Laws')).toBeInTheDocument()
      expect(screen.getByText(/physics/i)).toBeInTheDocument()
    })

    it('should render message input field', () => {
      render(<ChatInterface {...defaultProps} />)

      const input = screen.getByPlaceholderText(/ask a question or share your thoughts/i)
      expect(input).toBeInTheDocument()
      expect(input).toBeEnabled()
    })

    it('should render send button', () => {
      render(<ChatInterface {...defaultProps} />)

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toBeInTheDocument()
    })

    it('should render end session button', () => {
      render(<ChatInterface {...defaultProps} />)

      const endButton = screen.getByRole('button', { name: /end session/i })
      expect(endButton).toBeInTheDocument()
    })

    it('should have send button disabled when input is empty', () => {
      render(<ChatInterface {...defaultProps} />)

      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toBeDisabled()
    })
  })

  describe('Initial Load and Greeting', () => {
    it('should load existing messages on mount', async () => {
      const mockMessages = [
        {
          id: '1',
          role: 'ai_tutor',
          content: 'Hello! Ready to learn about Newton Laws?',
          timestamp: new Date().toISOString(),
        },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ messages: mockMessages }),
      })

      render(<ChatInterface {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Hello! Ready to learn about Newton Laws?')).toBeInTheDocument()
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/sessions/session-123/messages')
    })

    it('should send initial greeting on mount', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            reply: 'Welcome! I am excited to teach you about Newton Laws.',
          }),
        })

      render(<ChatInterface {...defaultProps} />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'session-123',
            message: null,
            subject: 'physics',
            topic: 'Newton Laws',
            studentName: 'John Doe',
            isInitial: true,
          }),
        })
      })

      await waitFor(() => {
        expect(screen.getByText('Welcome! I am excited to teach you about Newton Laws.')).toBeInTheDocument()
      })
    })

    it('should handle error when loading messages fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      })

      render(<ChatInterface {...defaultProps} />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should not send initial greeting if sessionId is missing', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      render(<ChatInterface {...defaultProps} sessionId="" />)

      expect(global.fetch).not.toHaveBeenCalledWith(
        '/api/chat',
        expect.objectContaining({ method: 'POST' })
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Message Sending', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ messages: [] }),
      })
    })

    it('should send a message when send button is clicked', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'Great question!' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'AI greeting' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'Great question!' }),
        })

      render(<ChatInterface {...defaultProps} />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/ask a question/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      await user.type(input, 'What is the first law?')
      await user.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText('What is the first law?')).toBeInTheDocument()
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/chat',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('What is the first law?'),
        })
      )
    })

    it('should display user message immediately after sending', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'AI greeting' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'AI response' }),
        })

      render(<ChatInterface {...defaultProps} />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/ask a question/i)
      await user.type(input, 'Test message')
      await user.click(screen.getByRole('button', { name: /send/i }))

      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should display AI response after sending message', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'AI greeting' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'This is the AI response' }),
        })

      render(<ChatInterface {...defaultProps} />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/ask a question/i)
      await user.type(input, 'Tell me more')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(screen.getByText('This is the AI response')).toBeInTheDocument()
      })
    })

    it('should clear input after sending message', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'AI greeting' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'Response' }),
        })

      render(<ChatInterface {...defaultProps} />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/ask a question/i) as HTMLInputElement
      await user.type(input, 'Test')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('should show loading state while waiting for response', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'AI greeting' }),
        })
        .mockImplementationOnce(
          () =>
            new Promise(resolve =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: async () => ({ reply: 'Response' }),
                  }),
                100
              )
            )
        )

      render(<ChatInterface {...defaultProps} />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/ask a question/i)
      await user.type(input, 'Question')
      await user.click(screen.getByRole('button', { name: /send/i }))

      expect(screen.getByText('Thinking...')).toBeInTheDocument()
    })

    it('should disable input and button during loading', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'AI greeting' }),
        })
        .mockImplementationOnce(
          () =>
            new Promise(resolve =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: async () => ({ reply: 'Response' }),
                  }),
                100
              )
            )
        )

      render(<ChatInterface {...defaultProps} />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/ask a question/i)
      const sendButton = screen.getByRole('button', { name: /send/i })

      await user.type(input, 'Question')
      await user.click(sendButton)

      expect(input).toBeDisabled()
      expect(sendButton).toBeDisabled()
    })

    it('should not send empty messages', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ messages: [] }),
      })

      render(<ChatInterface {...defaultProps} />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
      })

      const sendButton = screen.getByRole('button', { name: /send/i })

      expect(sendButton).toBeDisabled()

      await user.click(sendButton)

      // Only initial calls, no message send
      expect(global.fetch).toHaveBeenCalledTimes(2) // load messages + initial greeting
    })

    it('should handle API error gracefully', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'AI greeting' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })

      render(<ChatInterface {...defaultProps} />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText(/ask a question/i)
      await user.type(input, 'Test')
      await user.click(screen.getByRole('button', { name: /send/i }))

      await waitFor(() => {
        expect(screen.getByText(/i'm sorry, i encountered an error/i)).toBeInTheDocument()
      })
    })
  })

  describe('End Session', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ messages: [] }),
      })
    })

    it('should call onEndSession when end session button is clicked', async () => {
      const mockOnEndSession = jest.fn()
      const props = { ...defaultProps, onEndSession: mockOnEndSession }

      render(<ChatInterface {...props} />)

      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /end session/i })).toBeInTheDocument()
      })

      const endButton = screen.getByRole('button', { name: /end session/i })
      await user.click(endButton)

      expect(mockOnEndSession).toHaveBeenCalledTimes(1)
    })
  })

  describe('Message Display', () => {
    it('should display messages with correct roles', async () => {
      const mockMessages = [
        {
          id: '1',
          role: 'ai_tutor',
          content: 'AI message',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          role: 'student',
          content: 'Student message',
          timestamp: new Date().toISOString(),
        },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ messages: mockMessages }),
      })

      render(<ChatInterface {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('AI message')).toBeInTheDocument()
        expect(screen.getByText('Student message')).toBeInTheDocument()
      })

      expect(screen.getAllByText('AI-Shu')).toHaveLength(1)
      expect(screen.getAllByText('You')).toHaveLength(1)
    })

    it('should preserve whitespace in messages', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ messages: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ reply: 'Line 1\n\nLine 2\n\nLine 3' }),
        })

      render(<ChatInterface {...defaultProps} />)

      await waitFor(() => {
        const messageElement = screen.getByText(/Line 1/)
        expect(messageElement).toHaveClass('whitespace-pre-wrap')
      })
    })
  })
})
