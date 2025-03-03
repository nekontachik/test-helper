// Simple logger implementation that works in both browser and server environments
// without causing worker thread issues

import winston from 'winston';
import { format } from 'winston';
import path from 'path';
import type { NextRequest } from 'next/server';

const { combine, timestamp, json, colorize, printf } = format;

// Configuration type for logger with transport options
interface LoggerConfig {
  logDir: string;
  level: string;
  isProduction: boolean;
  maxFileSize?: number;
  maxFiles?: number;
  consoleEnabled?: boolean;
  fileEnabled?: boolean;
}

// Default configuration values
const defaultConfig: LoggerConfig = {
  logDir: path.join(process.cwd(), 'logs'),
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  isProduction: process.env.NODE_ENV === 'production',
  maxFileSize: 5242880, // 5MB
  maxFiles: 5,
  consoleEnabled: true,
  fileEnabled: process.env.NODE_ENV === 'production'
};

// Custom log levels with type safety
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

type LogLevel = keyof typeof levels;

// Custom level colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
} as const;

// Add colors to winston
winston.addColors(colors);

// Type-safe metadata interface
interface LogData {
  [key: string]: unknown;
  timestamp?: string;
  level?: LogLevel;
  message?: string;
}

// Route logging interface
interface RouteLogInfo {
  method: string;
  path: string;
  status?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  error?: Error | unknown;
}

// Custom format for development with proper type handling
const developmentFormat = printf((info: winston.Logform.TransformableInfo): string => {
  const { level, message, timestamp, ...metadata } = info;
  let msg = `${timestamp || new Date().toISOString()} [${level}]: ${String(message)}`;
  
  if (Object.keys(metadata).length > 0 && metadata.meta) {
    msg += `\nMetadata: ${JSON.stringify(metadata.meta, null, 2)}`;
  }
  return msg;
});

type LoggerType = winston.Logger | {
  error: typeof console.error;
  warn: typeof console.warn;
  info: typeof console.info;
  http: typeof console.log;
  debug: typeof console.debug;
};

// Create logger with error handling
const createLogger = (config: LoggerConfig = defaultConfig): LoggerType => {
  try {
    const logger = winston.createLogger({
      level: config.level,
      levels,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        config.isProduction ? json() : combine(colorize(), developmentFormat)
      ),
      transports: [
        new winston.transports.Console({
          handleExceptions: true,
          handleRejections: true,
        })
      ],
    });

    // Add file transports in production
    if (config.isProduction) {
      logger.add(
        new winston.transports.File({
          filename: path.join(config.logDir, 'error.log'),
          level: 'error',
          handleExceptions: true,
          handleRejections: true,
          maxsize: config.maxFileSize,
          maxFiles: config.maxFiles,
        })
      );

      logger.add(
        new winston.transports.File({
          filename: path.join(config.logDir, 'routes.log'),
          level: 'http',
          handleExceptions: true,
          handleRejections: true,
          maxsize: config.maxFileSize,
          maxFiles: config.maxFiles,
        })
      );

      logger.add(
        new winston.transports.File({
          filename: path.join(config.logDir, 'combined.log'),
          handleExceptions: true,
          handleRejections: true,
          maxsize: config.maxFileSize,
          maxFiles: config.maxFiles,
        })
      );
    }

    return logger;
  } catch (error) {
    console.error('Failed to create logger:', error);
    // Fallback to console logging
    return {
      error: console.error,
      warn: console.warn,
      info: console.info,
      http: console.log,
      debug: console.debug,
    };
  }
};

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

// Create the logger instance
const logger = createLogger();

// Helper function to extract route information
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

// Route logging middleware
const logRoute = async (
  req: NextRequest,
  fn: () => Promise<Response>
): Promise<Response> => {
  const startTime = Date.now();
  const routeInfo = getRouteInfo(req);

  try {
    const response = await fn();
    const duration = Date.now() - startTime;

    logger.http('Route handled', {
      meta: {
        ...routeInfo,
        status: response.status,
        duration,
      },
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Route error', {
      meta: {
        ...routeInfo,
        error,
        duration,
      },
    });

    throw error;
  }
};

// Create a stream object for Morgan HTTP logging
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
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

// Create the extended logger with proper type safety
const extendedLogger: ExtendedLogger = {
  error: (message: string, meta?: LogData) => logger.error(message, { meta: sanitizeData(meta || {}) }),
  warn: (message: string, meta?: LogData) => logger.warn(message, { meta: sanitizeData(meta || {}) }),
  info: (message: string, meta?: LogData) => logger.info(message, { meta: sanitizeData(meta || {}) }),
  http: (message: string, meta?: LogData) => logger.http(message, { meta: sanitizeData(meta || {}) }),
  debug: (message: string, meta?: LogData) => logger.debug(message, { meta: sanitizeData(meta || {}) }),
  stream,
  sanitizeData,
  logRoute
};

export default extendedLogger;
 