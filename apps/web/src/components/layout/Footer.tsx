'use client';

import Link from 'next/link';

export function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
  const buildDate = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/help', label: 'Help & Support' },
      ],
    },
    {
      title: 'For Students',
      links: [
        { href: '/auth/signup', label: 'Sign Up Free' },
        { href: '/auth/login', label: 'Sign In' },
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/session/new', label: 'Start Learning' },
      ],
    },
    {
      title: 'For Teachers',
      links: [
        { href: '/teacher/dashboard', label: 'Teacher Dashboard' },
        { href: '/auth/signup', label: 'Become a Teacher' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { href: '/help', label: 'Help Center' },
        { href: '/about', label: 'About AI-Shu' },
      ],
    },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-primary mb-4">AI-Shu</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stop memorizing. Start understanding.
            </p>
            <p className="text-xs text-muted-foreground">
              Powered by Aiswarya&apos;s Teaching Philosophy
            </p>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {currentYear} AI-Shu by Bettroi. All Rights Reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              v{version} • Built on {buildDate}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
