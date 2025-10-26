'use client';

export function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
  const buildDate = new Date().toISOString().split('T')[0];

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-3">
        <p className="text-center text-xs text-muted-foreground">
          AI-Shu v{version} • Built on {buildDate} • © {new Date().getFullYear()} All Rights
          Reserved
        </p>
      </div>
    </footer>
  );
}
