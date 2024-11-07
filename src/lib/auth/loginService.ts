import { prisma } from '@/lib/prisma';
import { SecurityService } from './securityService';
import { createRateLimiter } from '@/middleware/rateLimit';
import { RateLimitError } from '@/lib/errors';
import type { RateLimitConfig } from '@/lib/rate-limit/RateLimiter';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const AUTH_RATE_LIMIT: RateLimitConfig = {
  points: 5,
  duration: 300, // 5 minutes
};

export class LoginService {
  private static rateLimiter = createRateLimiter();

  static async attemptLogin(email: string, password: string, ip: string) {
    // Check rate limit first
    await this.rateLimiter.checkLimit(ip, AUTH_RATE_LIMIT);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        twoFactorEnabled: true,
        emailVerified: true,
      },
    });

    if (!user) {
      // Still increment rate limit to prevent user enumeration
      await this.rateLimiter.recordFailedAttempt(ip, 'auth:login');
      throw new Error('Invalid credentials');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 1000
      );
      throw new RateLimitError('Account is locked', remainingTime);
    }

    const isValidPassword = await SecurityService.verifyPassword(
      password,
      user.password
    );

    if (!isValidPassword) {
      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updates: any = { failedLoginAttempts: failedAttempts };

      // Lock account if max attempts exceeded
      if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });

      await this.rateLimiter.recordFailedAttempt(ip, 'auth:login');
      throw new Error('Invalid credentials');
    }

    // Reset failed attempts and lockout on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Reset rate limit attempts
    await this.rateLimiter.resetAttempts(ip, 'auth:login');

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      emailVerified: user.emailVerified,
    };
  }
} 