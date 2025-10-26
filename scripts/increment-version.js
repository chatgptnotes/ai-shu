#!/usr/bin/env node

/**
 * Auto-increment version script
 * Runs before Git push to increment version number
 * Version format: MAJOR.MINOR.PATCH (e.g., 1.2.3)
 */

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, '../VERSION');
const VERSION_COMPONENT = path.join(__dirname, '../apps/web/src/components/layout/VersionFooter.tsx');

function incrementVersion() {
  try {
    // Read current version
    const currentVersion = fs.readFileSync(VERSION_FILE, 'utf8').trim();
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    // Increment minor version (1.0 -> 1.1 -> 1.2, etc.)
    const newMinor = minor + 1;
    const newVersion = `${major}.${newMinor}.${patch}`;

    // Get current date in YYYY-MM-DD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Update VERSION file
    fs.writeFileSync(VERSION_FILE, newVersion);
    console.log(`✓ Version incremented: ${currentVersion} → ${newVersion}`);

    // Update VersionFooter component
    const componentContent = `'use client';

/**
 * VersionFooter Component
 * Displays application version and last updated date
 * Auto-incremented on each Git push
 */

const VERSION = '${newVersion}';
const LAST_UPDATED = '${dateStr}';

export function VersionFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-2">
        <p className="text-center text-xs text-muted-foreground/60">
          AI-Shu v{VERSION} · Last updated: {LAST_UPDATED}
        </p>
      </div>
    </footer>
  );
}
`;

    fs.writeFileSync(VERSION_COMPONENT, componentContent);
    console.log(`✓ VersionFooter updated with v${newVersion} (${dateStr})`);

    // Stage the updated files
    const { execSync } = require('child_process');
    execSync('git add VERSION apps/web/src/components/layout/VersionFooter.tsx', { stdio: 'inherit' });
    console.log('✓ Files staged for commit');

    return newVersion;
  } catch (error) {
    console.error('Error incrementing version:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  incrementVersion();
}

module.exports = { incrementVersion };
