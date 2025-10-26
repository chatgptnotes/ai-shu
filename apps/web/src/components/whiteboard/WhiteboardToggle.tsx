/**
 * Whiteboard Toggle Component
 * Toggles the whiteboard panel in the session interface
 */

'use client';

interface WhiteboardToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function WhiteboardToggle({ isOpen, onToggle, className = '' }: WhiteboardToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${className}`}
      aria-label={isOpen ? 'Hide whiteboard' : 'Show whiteboard'}
      title={isOpen ? 'Hide whiteboard' : 'Show whiteboard for visual explanations'}
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
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 7h10" />
        <path d="M7 12h10" />
        <path d="M7 17h10" />
      </svg>
      {isOpen ? 'Hide' : 'Show'} Whiteboard
    </button>
  );
}
