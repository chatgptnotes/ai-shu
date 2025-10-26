/**
 * Connection Status Component
 * Shows user their current connection quality and adapted features
 */

'use client';

import { useBandwidth } from '@/hooks/useBandwidth';

export function ConnectionStatus() {
  const { quality, connectionMessage, downlink, rtt, isOnline } = useBandwidth();

  if (!connectionMessage) {
    return null; // Don't show anything for high-quality connections
  }

  const getStatusColor = () => {
    switch (quality) {
      case 'offline':
        return 'bg-red-500';
      case 'low':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-green-500';
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) {
      return (
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
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      );
    }

    return (
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
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className={`rounded-lg ${getStatusColor()} p-4 text-white shadow-lg`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{getStatusIcon()}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{connectionMessage}</p>
            {quality !== 'offline' && (
              <p className="mt-1 text-xs opacity-90">
                Speed: {downlink.toFixed(1)} Mbps • Latency: {rtt}ms
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
