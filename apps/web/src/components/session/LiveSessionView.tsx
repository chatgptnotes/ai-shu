'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ai-shu/ui';
import { VideoCall } from '@/components/video/VideoCall';
import { ChatInterface } from '@/components/chat/ChatInterface';

interface LiveSessionViewProps {
  sessionId: string;
  subject: string;
  topic: string;
  studentName: string;
}

export function LiveSessionView({
  sessionId,
  subject,
  topic,
  studentName,
}: LiveSessionViewProps) {
  const router = useRouter();
  const [showVideo, setShowVideo] = useState(true);
  const [videoCallError, setVideoCallError] = useState<Error | null>(null);

  // Generate channel name from session ID
  const channelName = `session-${sessionId}`;

  // Handle end session - navigate back to dashboard
  const handleEndSession = () => {
    router.push('/dashboard');
  };

  const handleCallEnd = () => {
    console.log('Video call ended');
  };

  const handleCallError = (error: Error) => {
    console.error('Video call error:', error);
    setVideoCallError(error);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{topic}</h2>
            <p className="text-sm text-muted-foreground capitalize">{subject} - Live Session</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVideo(!showVideo)}
            >
              {showVideo ? 'Hide Video' : 'Show Video'}
            </Button>
            <Button variant="destructive" onClick={handleEndSession}>
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Section */}
        {showVideo && (
          <div className="w-full md:w-1/2 lg:w-2/5 border-r">
            <VideoCall
              channelName={channelName}
              onCallEnd={handleCallEnd}
              onError={handleCallError}
              className="h-full"
            />
            {videoCallError && (
              <div className="p-4 bg-destructive/10 border-t">
                <p className="text-sm text-destructive">
                  Video call unavailable. Continue with chat only.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Chat Section */}
        <div className={showVideo ? 'flex-1' : 'w-full'}>
          <ChatInterface
            sessionId={sessionId}
            subject={subject}
            topic={topic}
            studentName={studentName}
          />
        </div>
      </div>
    </div>
  );
}
