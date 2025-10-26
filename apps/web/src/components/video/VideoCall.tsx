'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@ai-shu/ui';
import { getAgoraManager, RemoteUser, NetworkStats } from '@/lib/agora/client';

interface VideoCallProps {
  channelName: string;
  onCallEnd?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function VideoCall({
  channelName,
  onCallEnd,
  onError,
  className = '',
}: VideoCallProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [networkQuality, setNetworkQuality] = useState<'good' | 'poor' | 'bad'>('good');
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const agoraManager = getAgoraManager();

  useEffect(() => {
    // Set up Agora event listeners
    const manager = getAgoraManager();

    manager.onUserJoined((user) => {
      console.log('Remote user joined:', user.uid);
      setRemoteUsers((prev) => [...prev, user]);
    });

    manager.onUserLeft((uid) => {
      console.log('Remote user left:', uid);
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== uid));
    });

    manager.onUserPublished((user) => {
      console.log('User published media:', user.uid);
      setRemoteUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? user : u))
      );
    });

    manager.onNetworkQuality((stats: NetworkStats) => {
      // Determine quality based on uplink/downlink
      // NetworkQuality values: 0=unknown, 1=excellent, 2=good, 3=poor, 4=bad, 5=vbad, 6=down
      const quality = Number(stats.uplinkNetworkQuality) || 0;
      if (quality <= 2) {
        setNetworkQuality('good');
      } else if (quality <= 4) {
        setNetworkQuality('poor');
      } else {
        setNetworkQuality('bad');
      }
    });

    return () => {
      // Cleanup on unmount
      if (isJoined) {
        handleLeave();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play local video when tracks are created
  useEffect(() => {
    if (isJoined && localVideoRef.current) {
      const tracks = agoraManager.getLocalTracks();
      if (tracks.videoTrack) {
        tracks.videoTrack.play(localVideoRef.current);
      }
    }
  }, [isJoined]);

  const handleJoin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get Agora token from server
      const response = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName,
          uid: 0, // Let Agora assign UID
          role: 'publisher',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Agora token');
      }

      const { token, appId } = await response.json();

      // Join the channel
      await agoraManager.join({
        appId,
        channel: channelName,
        token,
      });

      // Create local tracks
      await agoraManager.createLocalTracks();

      // Publish local tracks
      await agoraManager.publish();

      setIsJoined(true);
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to join call');
      console.error('Join error:', error);
      setError(error.message);
      setIsLoading(false);
      onError?.(error);
    }
  };

  const handleLeave = async () => {
    try {
      await agoraManager.leave();
      setIsJoined(false);
      setRemoteUsers([]);
      onCallEnd?.();
    } catch (error) {
      console.error('Leave error:', error);
    }
  };

  const handleToggleCamera = async () => {
    try {
      const enabled = await agoraManager.toggleCamera();
      setIsCameraOn(enabled);
    } catch (error) {
      console.error('Toggle camera error:', error);
    }
  };

  const handleToggleMic = async () => {
    try {
      const enabled = await agoraManager.toggleMicrophone();
      setIsMicOn(enabled);
    } catch (error) {
      console.error('Toggle mic error:', error);
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <p className="text-destructive font-semibold mb-2">Call Error</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleJoin} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">Ready to join the live session?</p>
          <Button onClick={handleJoin} disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Video Call'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Network Quality Indicator */}
      {networkQuality !== 'good' && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 p-2 mb-2">
          <p className="text-sm text-yellow-700 dark:text-yellow-200">
            {networkQuality === 'poor'
              ? 'Network connection is unstable'
              : 'Poor network connection'}
          </p>
        </div>
      )}

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Local Video */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <div ref={localVideoRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
            You {!isCameraOn && '(Camera Off)'}
          </div>
        </div>

        {/* Remote Videos */}
        {remoteUsers.map((user) => (
          <RemoteVideoPlayer key={user.uid} user={user} />
        ))}

        {/* Placeholder for waiting */}
        {remoteUsers.length === 0 && (
          <div className="bg-muted rounded-lg flex items-center justify-center aspect-video">
            <p className="text-muted-foreground">Waiting for others to join...</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 border-t bg-card">
        <Button
          variant={isMicOn ? 'default' : 'destructive'}
          size="lg"
          onClick={handleToggleMic}
          className="rounded-full w-14 h-14"
        >
          {isMicOn ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
            </svg>
          )}
        </Button>

        <Button
          variant={isCameraOn ? 'default' : 'destructive'}
          size="lg"
          onClick={handleToggleCamera}
          className="rounded-full w-14 h-14"
        >
          {isCameraOn ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z" />
            </svg>
          )}
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={handleLeave}
          className="rounded-full w-14 h-14"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

// Component for rendering remote user's video
function RemoteVideoPlayer({ user }: { user: RemoteUser }) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.videoTrack && videoRef.current) {
      user.videoTrack.play(videoRef.current);
    }

    return () => {
      if (user.videoTrack) {
        user.videoTrack.stop();
      }
    };
  }, [user.videoTrack]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
      {user.hasVideo ? (
        <div ref={videoRef} className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl text-primary-foreground">
                {user.uid.toString().charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Camera Off</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
        User {user.uid}
      </div>
      {!user.hasAudio && (
        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
          Muted
        </div>
      )}
    </div>
  );
}
