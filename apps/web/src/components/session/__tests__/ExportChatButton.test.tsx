import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportChatButton } from '../ExportChatButton';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ExportChatButton', () => {
  const mockMessages = [
    {
      id: '1',
      content: 'Hello, can you help me with physics?',
      role: 'user' as const,
      timestamp: '2025-10-26T10:00:00Z',
    },
    {
      id: '2',
      content: 'Of course! What topic would you like to explore?',
      role: 'assistant' as const,
      timestamp: '2025-10-26T10:00:05Z',
    },
  ];

  it('renders export button with messages', () => {
    render(
      <ExportChatButton
        sessionId="test-session-123"
        sessionTopic="Physics - Newton's Laws"
        messages={mockMessages}
      />
    );

    const button = screen.getByText('Export Chat');
    expect(button).toBeTruthy();
  });

  it('does not render when there are no messages', () => {
    const { container } = render(
      <ExportChatButton
        sessionId="test-session-123"
        sessionTopic="Physics - Newton's Laws"
        messages={[]}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows loading state when exporting', async () => {
    render(
      <ExportChatButton
        sessionId="test-session-123"
        sessionTopic="Physics - Newton's Laws"
        messages={mockMessages}
      />
    );

    const button = screen.getByText('Export Chat');
    fireEvent.click(button);

    // Button should show exporting state
    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeTruthy();
    });
  });

  it('creates downloadable markdown file', async () => {
    // Mock URL.createObjectURL and document methods
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();

    const mockClick = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    document.createElement = jest.fn().mockReturnValue({
      click: mockClick,
      href: '',
      download: '',
    });
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    render(
      <ExportChatButton
        sessionId="test-session-123"
        sessionTopic="Physics - Newton's Laws"
        messages={mockMessages}
      />
    );

    const button = screen.getByText('Export Chat');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});
