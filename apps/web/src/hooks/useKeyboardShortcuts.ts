'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+N or Cmd+N: New session
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        router.push('/session/new');
        return;
      }

      // Ctrl+H or Cmd+H: Go to dashboard (Home)
      if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
        event.preventDefault();
        router.push('/dashboard');
        return;
      }

      // Ctrl+/ or Cmd+/: Help page
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        router.push('/help');
        return;
      }

      // Escape: Close modals (handled by components)
      // This is just for documentation
      if (event.key === 'Escape') {
        // AlertDialog and other modals handle this automatically
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);
}
