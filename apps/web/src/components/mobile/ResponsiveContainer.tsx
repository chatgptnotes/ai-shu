/**
 * Responsive Container Component
 * Adapts padding and layout based on screen size
 */

'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobilePadding?: 'none' | 'sm' | 'md' | 'lg';
  desktopPadding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centerContent?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function ResponsiveContainer({
  children,
  className = '',
  mobilePadding = 'md',
  desktopPadding = 'lg',
  maxWidth = 'xl',
  centerContent = true,
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile();

  const padding = isMobile ? paddingClasses[mobilePadding] : paddingClasses[desktopPadding];
  const maxWidthClass = maxWidthClasses[maxWidth];
  const centerClass = centerContent ? 'mx-auto' : '';

  return (
    <div className={`${padding} ${maxWidthClass} ${centerClass} ${className}`}>
      {children}
    </div>
  );
}
