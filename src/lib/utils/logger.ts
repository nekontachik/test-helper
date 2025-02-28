// Simple logger implementation that works in both browser and server environments
// without causing worker thread issues

import winston from 'winston';
import { format } from 'winston';

const { combine, timestamp, json, colorize, printf } = format;

interface LogMetadata {
  level: string;
  message: string;
  timestamp?: string;
  [key: string]: unknown;
}

// Custom log levels
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

// Custom format for development
const developmentFormat = printf((info: winston.Logform.TransformableInfo) => {
  const { level, message, timestamp, ...metadata } = info;
  let msg = `${timestamp || new Date().toISOString()} [${level}]: ${String(message)}`;
  if (Object.keys(metadata).length > 0) {
    msg += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
  }
  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'production' 
      ? json()
      : combine(colorize(), developmentFormat)
  ),
  transports: [
    // Write all logs to console
    new winston.transports.Console(),
    
    // Write production logs to a file
    ...(process.env.NODE_ENV === 'production' 
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' })
        ]
      : [])
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Create a stream object for Morgan HTTP logging
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

type LogData = Record<string, unknown>;

// Utility function to sanitize sensitive data
const sanitizeData = (data: LogData): LogData => {
  if (!data) return data;
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key] as LogData);
    }
  });
  
  return sanitized;
};

// Extended logger interface
interface ExtendedLogger {
  error(message: string, meta?: LogData): void;
  warn(message: string, meta?: LogData): void;
  info(message: string, meta?: LogData): void;
  http(message: string, meta?: LogData): void;
  debug(message: string, meta?: LogData): void;
  stream: typeof stream;
  sanitizeData: typeof sanitizeData;
}

// Create the extended logger
const extendedLogger: ExtendedLogger = {
  error: (message: string, meta?: LogData) => logger.error(message, { meta: sanitizeData(meta || {}) }),
  warn: (message: string, meta?: LogData) => logger.warn(message, { meta: sanitizeData(meta || {}) }),
  info: (message: string, meta?: LogData) => logger.info(message, { meta: sanitizeData(meta || {}) }),
  http: (message: string, meta?: LogData) => logger.http(message, { meta: sanitizeData(meta || {}) }),
  debug: (message: string, meta?: LogData) => logger.debug(message, { meta: sanitizeData(meta || {}) }),
  stream,
  sanitizeData
};

export default extendedLogger;
 