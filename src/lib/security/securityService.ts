import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export class SecurityService {
  static async generateCsrfToken(sessionId: string): Promise<string> {
    const token = nanoid();
    await redis.set(
      `csrf:${sessionId}:${token}`,
      true,
      { ex: 3600 } // 1 hour expiry
    );
    return token;
  }

  static async validateCsrfToken(sessionId: string, token: string): Promise<boolean> {
    const isValid = await redis.get(`csrf:${sessionId}:${token}`);
    if (isValid) {
      // Delete token after use to prevent replay attacks
      await redis.del(`csrf:${sessionId}:${token}`);
    }
    return !!isValid;
  }

  static getSecurityHeaders() {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data:",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "block-all-mixed-content",
        "upgrade-insecure-requests",
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };
  }
} 