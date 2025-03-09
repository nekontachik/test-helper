// Simple logger implementation that works in both browser and server environments

// Define logger interface
interface LoggerInterface {
  error: (message: string, data?: LogMetadata) => void;
  warn: (message: string, data?: LogMetadata) => void;
  info: (message: string, data?: LogMetadata) => void;
  debug: (message: string, data?: LogMetadata) => void;
}

// Define metadata type
type LogMetadata = Record<string, unknown>;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger implements LoggerInterface {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: LogMetadata): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, data || {});
          break;
        case 'info':
          console.info(formattedMessage, data || {});
          break;
        case 'warn':
          console.warn(formattedMessage, data || {});
          break;
        case 'error':
          console.error(formattedMessage, data || {});
          break;
      }
    }
  }

  debug(message: string, data?: LogMetadata): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: LogMetadata): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogMetadata): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: LogMetadata): void {
    this.log('error', message, data);
  }
}

export const logger = new Logger();

// Create a singleton instance of the logger
export const universalLogger = new Logger();

// Export a database logger for Prisma
export const dbLogger = {
  info: (message: string, meta?: LogMetadata): void => logger.info(message, meta ? { metadata: meta } : {}),
  warn: (message: string, meta?: LogMetadata): void => logger.warn(message, meta ? { metadata: meta } : {}),
  error: (message: string, meta?: LogMetadata): void => logger.error(message, meta ? { metadata: meta } : {}),
};

// Add default export for backward compatibility
export default logger;
