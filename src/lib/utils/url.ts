/**
 * Valid internal paths that can be used as redirect URLs
 */
export const VALID_REDIRECT_PATHS = [
  '/dashboard',
  '/profile',
  '/settings',
  '/auth/signin',
  '/auth/register',
] as const;

type ValidRedirectPath = typeof VALID_REDIRECT_PATHS[number];

interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl: string;
  error?: string;
}

/**
 * Validates and sanitizes internal URLs to prevent open redirect vulnerabilities
 * @param url - The URL to sanitize
 * @param defaultPath - The fallback path if URL is invalid
 * @returns A safe internal URL path
 */
export function sanitizeInternalUrl(
  url: string | null | undefined, 
  defaultPath: ValidRedirectPath = '/dashboard'
): string {
  // Early return for empty URLs
  if (!url?.trim()) {
    return defaultPath;
  }

  try {
    // Handle absolute URLs
    if (url.includes('://')) {
      const urlObj = new URL(url);
      
      // Only allow URLs from the same origin
      if (typeof window !== 'undefined' && urlObj.origin === window.location.origin) {
        return sanitizePath(urlObj.pathname + urlObj.search);
      }
      
      return defaultPath;
    }

    // Handle relative paths
    if (url.startsWith('/')) {
      return sanitizePath(url);
    }

    return defaultPath;
  } catch {
    return defaultPath;
  }
}

/**
 * Sanitizes a URL path to prevent path traversal and other attacks
 * @param path - The path to sanitize
 * @returns A sanitized path string
 */
function sanitizePath(path: string): string {
  // Remove fragments and ensure we have a string
  const withoutFragment = path.split('#')[0] || '';

  // Normalize slashes and remove path traversal
  const normalized = withoutFragment
    .replace(/\/+/g, '/') // Replace multiple slashes with single
    .replace(/\.\.\//g, '') // Remove path traversal attempts
    .replace(/^\/+/, '/'); // Ensure single leading slash

  // Only allow safe characters
  const sanitized = normalized.replace(/[^\w\-/?.=&]/g, '');

  // Validate against allowed paths
  const basePath = sanitized.split('?')[0];
  if (VALID_REDIRECT_PATHS.includes(basePath as ValidRedirectPath)) {
    return sanitized;
  }

  return '/dashboard';
}

/**
 * Validates if a URL is safe to use as a redirect target
 * @param url - The URL to validate
 * @returns Validation result with sanitized URL
 */
export function validateRedirectUrl(url: string | null | undefined): UrlValidationResult {
  if (!url?.trim()) {
    return {
      isValid: false,
      sanitizedUrl: '/dashboard',
      error: 'URL is empty',
    };
  }

  try {
    const sanitized = sanitizeInternalUrl(url);
    return {
      isValid: sanitized !== '/dashboard', // Not fallback
      sanitizedUrl: sanitized,
    };
  } catch (error) {
    return {
      isValid: false,
      sanitizedUrl: '/dashboard',
      error: error instanceof Error ? error.message : 'Invalid URL',
    };
  }
} 