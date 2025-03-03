// Simple logger implementation that works in both browser and server environments
// without causing worker thread issues

import type { NextRequest } from 'next/server';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Define logger interface
interface LoggerInterface {
  error: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  info: (message: string, meta?: unknown) => void;
  http: (message: string, meta?: unknown) => void;
  debug: (message: string, meta?: unknown) => void;
}

// Type-safe metadata interface
interface LogData {
  [key: string]: unknown;
  timestamp?: string;
  level?: string;
  message?: string;
}

// Route logging interface
interface RouteLogInfo {
  method: string;
  path: string;
  status?: number | undefined;
  duration?: number | undefined;
  userAgent?: string | undefined;
  ip?: string | undefined;
  error?: Error | unknown | undefined;
}

// Create a browser-compatible logger
const createBrowserLogger = (): LoggerInterface => {
  return {
    error: (message: string, meta?: unknown): void => {
      console.error(`${new Date().toISOString()} error: ${message}`, meta || '');
    },
    warn: (message: string, meta?: unknown): void => {
      console.warn(`${new Date().toISOString()} warn: ${message}`, meta || '');
    },
    info: (message: string, meta?: unknown): void => {
      console.info(`${new Date().toISOString()} info: ${message}`, meta || '');
    },
    http: (message: string, meta?: unknown): void => {
      console.log(`${new Date().toISOString()} http: ${message}`, meta || '');
    },
    debug: (message: string, meta?: unknown): void => {
      console.debug(`${new Date().toISOString()} debug: ${message}`, meta || '');
    }
  };
};

// Create a server logger (simplified version without winston)
const createServerLogger = (): LoggerInterface => {
  // In a real implementation, we might use winston here
  // But for simplicity and browser compatibility, we'll use console
  return {
    error: (message: string, meta?: unknown): void => {
      console.error(`${new Date().toISOString()} error: ${message}`, meta || '');
    },
    warn: (message: string, meta?: unknown): void => {
      console.warn(`${new Date().toISOString()} warn: ${message}`, meta || '');
    },
    info: (message: string, meta?: unknown): void => {
      console.info(`${new Date().toISOString()} info: ${message}`, meta || '');
    },
    http: (message: string, meta?: unknown): void => {
      console.log(`${new Date().toISOString()} http: ${message}`, meta || '');
    },
    debug: (message: string, meta?: unknown): void => {
      console.debug(`${new Date().toISOString()} debug: ${message}`, meta || '');
    }
  };
};

// Create the base logger
const baseLogger = isBrowser ? createBrowserLogger() : createServerLogger();

// Utility function to sanitize sensitive data with type safety
const sanitizeData = <T extends Record<string, unknown>>(data: T): T => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];
  const sanitized = { ...data } as T;
  
  Object.keys(sanitized).forEach(key => {
    const value = sanitized[key as keyof T];
    if (sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key as keyof T] = '[REDACTED]' as unknown as T[keyof T];
    } else if (typeof value === 'object') {
      sanitized[key as keyof T] = sanitizeData(value as Record<string, unknown>) as T[keyof T];
    }
  });
  
  return sanitized;
};

// Helper function to extract route information (server-side only)
const getRouteInfo = (req: NextRequest): RouteLogInfo => {
  const userAgent = req.headers.get('user-agent') || undefined;
  const ip = req.headers.get('x-forwarded-for') || req.ip;
  
  return {
    method: req.method,
    path: req.nextUrl.pathname,
    userAgent,
    ip,
  };
};

// Route logging middleware (server-side only)
const logRoute = async (
  req: NextRequest,
  fn: () => Promise<Response>
): Promise<Response> => {
  const startTime = Date.now();
  const routeInfo = getRouteInfo(req);

  try {
    const response = await fn();
    const duration = Date.now() - startTime;

    baseLogger.http('Route handled', {
      ...routeInfo,
      status: response.status,
      duration,
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    baseLogger.error('Route error', {
      ...routeInfo,
      error,
      duration,
    });

    throw error;
  }
};

// Create a stream object for HTTP logging
const stream = {
  write: (message: string) => {
    baseLogger.http(message.trim());
  },
};

// Extended logger interface with type safety
interface ExtendedLogger {
  error(message: string, meta?: LogData): void;
  warn(message: string, meta?: LogData): void;
  info(message: string, meta?: LogData): void;
  http(message: string, meta?: LogData): void;
  debug(message: string, meta?: LogData): void;
  stream: typeof stream;
  sanitizeData: typeof sanitizeData;
  logRoute: typeof logRoute;
}

// Create the extended logger
const logger: ExtendedLogger = {
  error: (message: string, meta?: LogData) => baseLogger.error(message, meta),
  warn: (message: string, meta?: LogData) => baseLogger.warn(message, meta),
  info: (message: string, meta?: LogData) => baseLogger.info(message, meta),
  http: (message: string, meta?: LogData) => baseLogger.http(message, meta),
  debug: (message: string, meta?: LogData) => baseLogger.debug(message, meta),
  stream,
  sanitizeData,
  logRoute
};

export default logger;
 