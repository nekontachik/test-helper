import logger from './logger';

export const securityLogger = {
  info: (message: string, metadata?: Record<string, unknown>) => {
    logger.info(`[SECURITY] ${message}`, {
      ...metadata,
      timestamp: new Date().toISOString(),
      securityEvent: true
    });
  },
  
  warn: (message: string, metadata?: Record<string, unknown>) => {
    logger.warn(`[SECURITY] ${message}`, {
      ...metadata,
      timestamp: new Date().toISOString(),
      securityEvent: true
    });
  },
  
  error: (message: string, metadata?: Record<string, unknown>) => {
    logger.error(`[SECURITY] ${message}`, {
      ...metadata,
      timestamp: new Date().toISOString(),
      securityEvent: true
    });
  },
  
  critical: (message: string, metadata?: Record<string, unknown>) => {
    logger.error(`[SECURITY-CRITICAL] ${message}`, {
      ...metadata,
      timestamp: new Date().toISOString(),
      securityEvent: true,
      criticalSeverity: true
    });
  },
  
  authAttempt: (success: boolean, metadata: {
    userId?: string;
    email: string;
    ip?: string;
    userAgent?: string;
    reason?: string;
  }) => {
    const method = success ? 'info' : 'warn';
    const message = success ? 'Authentication successful' : 'Authentication failed';
    
    logger[method](`[SECURITY] ${message}`, {
      ...metadata,
      authEvent: true,
      success,
      timestamp: new Date().toISOString()
    });
  }
}; 