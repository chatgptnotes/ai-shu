'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Input } from '@ai-shu/ui';

interface Message {
  id: string;
  role: 'student' | 'ai_tutor';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  sessionId: string;
  subject: string;
  topic: string;
  studentName: string;
  onEndSession: () => void;
}

export function ChatInterface({ sessionId, subject, topic, studentName, onEndSession }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Validate required props
  useEffect(() => {
    if (!sessionId) {
      console.error('ChatInterface: sessionId is required but was undefined');
      setError('Session ID is missing. Please try starting a new session.');
      return;
    }
    if (!subject) {
      console.error('ChatInterface: subject is required but was undefined');
      setError('Subject is missing. Please try starting a new session.');
      return;
    }
    if (!topic) {
      console.error('ChatInterface: topic is required but was undefined');
      setError('Topic is missing. Please try starting a new session.');
      return;
    }
  }, [sessionId, subject, topic]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only proceed if we have a valid sessionId
    if (!sessionId) {
      console.error('ChatInterface useEffect: Cannot load messages - sessionId is undefined');
      return;
    }

    console.log('ChatInterface: Loading session data for sessionId:', sessionId);
    // Load existing messages
    loadMessages();
    // Send initial greeting
    sendInitialGreeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const loadMessages = async () => {
    if (!sessionId) {
      console.error('loadMessages: Cannot load - sessionId is undefined');
      return;
    }

    console.log('loadMessages: Fetching messages for sessionId:', sessionId);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages`);
      console.log('loadMessages: Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('loadMessages: Received messages:', data.messages?.length || 0);
        setMessages(data.messages || []);
      } else {
        const errorText = await response.text();
        console.error('loadMessages: Failed with status', response.status, errorText);
      }
    } catch (error) {
      console.error('loadMessages: Exception caught:', error);
    }
  };

  const sendInitialGreeting = async () => {
    if (!sessionId) {
      console.error('sendInitialGreeting: Cannot send - sessionId is undefined');
      return;
    }

    console.log('sendInitialGreeting: Sending initial greeting for sessionId:', sessionId);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: null, // Null message triggers initial greeting
          subject,
          topic,
          studentName,
          isInitial: true,
        }),
      });

      console.log('sendInitialGreeting: Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('sendInitialGreeting: Received reply:', data.reply ? 'yes' : 'no');
        if (data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'ai_tutor',
              content: data.reply,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } else {
        const errorText = await response.text();
        console.error('sendInitialGreeting: Failed with status', response.status, errorText);
      }
    } catch (error) {
      console.error('sendInitialGreeting: Exception caught:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'student',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage.content,
          subject,
          topic,
          studentName,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai_tutor',
          content: data.reply,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai_tutor',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show error state if critical props are missing
  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
        <div className="rounded-md bg-destructive/10 p-6 text-center max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Session Error</h2>
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button onClick={onEndSession} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{topic}</h2>
            <p className="text-sm text-muted-foreground capitalize">{subject}</p>
          </div>
          <Button variant="destructive" onClick={onEndSession}>
            End Session
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'student'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm font-medium mb-1">
                {message.role === 'student' ? 'You' : 'AI-Shu'}
              </p>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-muted p-3">
              <p className="text-sm font-medium mb-1">AI-Shu</p>
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
