/**
 * Mobile Navigation Component
 * Bottom navigation bar optimized for mobile devices
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Home',
    matchPaths: ['/dashboard'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/sessions',
    label: 'Sessions',
    matchPaths: ['/sessions', '/session'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/session/new',
    label: 'New',
    matchPaths: ['/session/new'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="2" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: '/help',
    label: 'Help',
    matchPaths: ['/help'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    matchPaths: ['/profile'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Don't show on auth pages or desktop
  if (!isMobile || pathname?.startsWith('/auth')) {
    return null;
  }

  const isActive = (item: NavItem) => {
    if (!pathname) return false;
    return item.matchPaths?.some(path => pathname.startsWith(path)) || pathname === item.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                active
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`transition-transform ${active ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
