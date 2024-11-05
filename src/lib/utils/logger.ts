import pino from 'pino';

// Configure logger options
const options = {
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
};

// Create logger instance
export const logger = pino(options);

// Export common log levels for convenience
export const logLevels = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
} as const;

// Type for log metadata
export interface LogMetadata {
  [key: string]: unknown;
}

// Utility functions for common logging patterns
export const logError = (error: Error | unknown, metadata?: LogMetadata) => {
  logger.error({
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : error,
    ...metadata,
  });
};

export const logInfo = (message: string, metadata?: LogMetadata) => {
  logger.info(metadata, message);
};

export const logWarn = (message: string, metadata?: LogMetadata) => {
  logger.warn(metadata, message);
};

export const logDebug = (message: string, metadata?: LogMetadata) => {
  logger.debug(metadata, message);
}; 