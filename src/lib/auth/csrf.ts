import { randomBytes } from 'crypto';

export const CSRF_COOKIE_NAME = 'next-auth.csrf-token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false;
  }
  return token === storedToken;
}

export const csrfOptions = {
  cookie: {
    name: CSRF_COOKIE_NAME,
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  header: {
    name: CSRF_HEADER_NAME,
  },
} as const; 