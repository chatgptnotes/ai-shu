'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface ExportChatButtonProps {
  sessionId: string;
  sessionTopic: string;
  messages: Message[];
}

export function ExportChatButton({
  sessionId,
  sessionTopic,
  messages,
}: ExportChatButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Format messages
      let content = `# ${sessionTopic}\n\n`;
      content += `Session ID: ${sessionId}\n`;
      content += `Exported: ${new Date().toLocaleString()}\n`;
      content += `Total Messages: ${messages.length}\n\n`;
      content += `---\n\n`;

      messages.forEach((message, index) => {
        const role = message.role === 'user' ? 'You' : 'AI-Shu';
        const timestamp = new Date(message.timestamp).toLocaleTimeString();

        content += `## ${role} (${timestamp})\n\n`;
        content += `${message.content}\n\n`;

        if (index < messages.length - 1) {
          content += `---\n\n`;
        }
      });

      // Create blob and download
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-shu-session-${sessionId.slice(0, 8)}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Chat history exported successfully');
    } catch (error) {
      console.error('Error exporting chat:', error);
      toast.error('Failed to export chat history');
    } finally {
      setIsExporting(false);
    }
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {isExporting ? 'Exporting...' : 'Export Chat'}
    </button>
  );
}
