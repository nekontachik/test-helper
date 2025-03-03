// Simple logger implementation without worker threads

import winston from 'winston';
import { format } from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define the format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.colorize({ all: true }),
  format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.metadata ? ' ' + JSON.stringify(info.metadata) : ''}`
  )
);

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    format.json()
  ),
  defaultMeta: { service: 'test-app' },
  transports: [
    // Write logs to console in development
    new winston.transports.Console({
      format: logFormat,
    }),
    // Write to all logs with level 'info' and below to combined.log
    new winston.transports.File({ filename: 'logs/combined.log' }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

// Export a database logger for Prisma
export const dbLogger = {
  info: (message: string, meta?: any) => logger.info(message, { metadata: meta }),
  warn: (message: string, meta?: any) => logger.warn(message, { metadata: meta }),
  error: (message: string, meta?: any) => logger.error(message, { metadata: meta }),
};

// If we're not in production, log to the console with the format:
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: logFormat,
    })
  );
}
