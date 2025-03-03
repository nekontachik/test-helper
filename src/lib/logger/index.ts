import pino from 'pino';

// Create a single logger instance
const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Export a standardized logger interface
export const logger = {
  debug: (message: string, data?: object) => pinoLogger.debug(data || {}, message),
  info: (message: string, data?: object) => pinoLogger.info(data || {}, message),
  warn: (message: string, data?: object) => pinoLogger.warn(data || {}, message),
  error: (message: string, data?: object) => pinoLogger.error(data || {}, message),
};

// Default export for backward compatibility
export default logger; 