import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { KeyboardShortcutsProvider } from '@/components/layout/KeyboardShortcutsProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { MobileNav } from '@/components/mobile/MobileNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI-Shu | Photorealistic AI Tutor',
  description:
    'Learn interactively with AI-Shu, your personalized AI tutor for Physics, Chemistry, Math, Business, and Economics.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI-Shu',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <KeyboardShortcutsProvider>
            <div className="flex min-h-screen flex-col pb-safe-area-inset-bottom">
              <main className="flex-1 mb-16 md:mb-0">{children}</main>
              <Footer />
              <MobileNav />
            </div>
            <Toaster />
          </KeyboardShortcutsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
