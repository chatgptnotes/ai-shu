'use client';

/**
 * VersionFooter Component
 * Displays application version and last updated date
 * Should be included on all pages per project requirements
 */

const VERSION = '1.2.0';
const LAST_UPDATED = '2025-10-26';

export function VersionFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="text-center">
          <p className="text-xs text-muted-foreground/60">
            AI-Shu v{VERSION} · Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground/40">
            © 2025 Aishu&apos;s Academy Pvt. Ltd. · In partnership with Bettroi · Developed by DRM Hope Software
          </p>
        </div>
      </div>
    </footer>
  );
}
