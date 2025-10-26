/**
 * Content Sanitization Utilities
 *
 * Sanitize user-generated content to prevent XSS and injection attacks
 * Server-side implementation for API routes
 */

/**
 * Sanitize HTML content
 * Removes potentially dangerous HTML/JavaScript
 */
export function sanitizeHtml(html: string): string {
  // Simple HTML stripping for server-side - removes all tags except safe ones
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: protocol
}

/**
 * Sanitize plain text
 * Removes all HTML tags and dangerous characters
 */
export function sanitizePlainText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/[<>]/g, '') // Remove remaining angle brackets
    .trim();
}

/**
 * Sanitize markdown content
 * Allows safe markdown formatting while removing dangerous content
 */
export function sanitizeMarkdown(markdown: string): string {
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Only allow http(s) and mailto protocols
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize filename
 * Removes dangerous characters and path traversal attempts
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace non-alphanumeric with underscore
    .replace(/\.{2,}/g, '.') // Remove multiple dots (path traversal)
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Sanitize SQL-like input (basic protection)
 * Note: Use parameterized queries instead when possible
 */
export function sanitizeSqlInput(input: string): string {
  return input.replace(/['";\\]/g, ''); // Remove common SQL injection characters
}

/**
 * Sanitize JSON input
 * Validates and re-serializes JSON to prevent injection
 */
export function sanitizeJson(jsonString: string): string | null {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
}

/**
 * Escape special characters for safe display
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Remove null bytes that can cause issues
 */
export function removeNullBytes(text: string): string {
  return text.replace(/\0/g, '');
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Sanitize chat message
 * Combines multiple sanitization steps for chat messages
 */
export function sanitizeChatMessage(message: string): string {
  let sanitized = removeNullBytes(message);
  sanitized = sanitizePlainText(sanitized);
  sanitized = normalizeWhitespace(sanitized);

  // Limit length
  if (sanitized.length > 5000) {
    sanitized = sanitized.substring(0, 5000);
  }

  return sanitized;
}

/**
 * Sanitize user profile data
 */
export function sanitizeProfileData(data: {
  full_name?: string;
  learning_goals?: string;
  [key: string]: any;
}) {
  return {
    ...data,
    full_name: data.full_name ? sanitizePlainText(data.full_name) : undefined,
    learning_goals: data.learning_goals ? sanitizePlainText(data.learning_goals) : undefined,
  };
}

/**
 * Sanitize topic or subject name
 */
export function sanitizeTopicName(topic: string): string {
  let sanitized = removeNullBytes(topic);
  sanitized = sanitizePlainText(sanitized);
  sanitized = normalizeWhitespace(sanitized);

  // Limit length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }

  return sanitized;
}
