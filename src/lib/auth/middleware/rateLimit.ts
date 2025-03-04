import { logger } from '@/lib/logger';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter for API requests
 */
export class RateLimiter {
  private limits: Map<string, RateLimitRecord> = new Map();
  
  /**
   * Check if a request exceeds the rate limit
   * @param ip - IP address of the requester
   * @param config - Rate limit configuration
   * @returns Boolean indicating if request should be limited
   */
  public isRateLimited(ip: string, config?: RateLimitConfig): boolean {
    if (!config) {
      return false;
    }
    
    const { maxRequests, windowMs } = config;
    const now = Date.now();
    
    // Get or create rate limit record
    let record = this.limits.get(ip);
    
    if (!record || now > record.resetAt) {
      // Create new record if none exists or window has expired
      record = {
        count: 1,
        resetAt: now + windowMs
      };
      this.limits.set(ip, record);
      return false;
    }
    
    // Increment request count
    record.count += 1;
    
    // Check if limit exceeded
    if (record.count > maxRequests) {
      logger.warn('Rate limit exceeded', { ip, count: record.count, maxRequests });
      return true;
    }
    
    return false;
  }
  
  /**
   * Clear all rate limit records
   * Useful for testing or when restarting the server
   */
  public clearLimits(): void {
    this.limits.clear();
  }
}

// Singleton instance for use across the application
export const rateLimiter = new RateLimiter(); 