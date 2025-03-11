// Simple logger implementation that works in both browser and server environments

// Define logger interface
interface LoggerInterface {
  error: (message: string, data?: LogMetadata) => void;
  warn: (message: string, data?: LogMetadata) => void;
  info: (message: string, data?: LogMetadata) => void;
  debug: (message: string, data?: LogMetadata) => void;
}

// Define metadata type
export type LogMetadata = Record<string, unknown>;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Utility function to convert any value to LogMetadata
export function toLogMetadata(data: unknown): LogMetadata {
  if (data === null || data === undefined) {
    return {};
  }
  
  if (data instanceof Error) {
    // Extract properties from Error object safely
    const metadata: LogMetadata = {
      name: data.name,
      message: data.message,
      stack: data.stack
    };
    
    // Add any additional properties that might be on custom error objects
    try {
      const errorObj = JSON.parse(JSON.stringify(data, Object.getOwnPropertyNames(data)));
      return { ...metadata, ...errorObj };
    } catch {
      return metadata;
    }
  }
  
  if (typeof data === 'object') {
    try {
      return JSON.parse(JSON.stringify(data)) as LogMetadata;
    } catch {
      return { value: String(data) };
    }
  }
  
  return { value: data };
}

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

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data ? toLogMetadata(data) : undefined);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data ? toLogMetadata(data) : undefined);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data ? toLogMetadata(data) : undefined);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data ? toLogMetadata(data) : undefined);
  }
}

export const logger = new Logger();

// Create a singleton instance of the logger
export const universalLogger = new Logger();

// Export a database logger for Prisma
export const dbLogger = {
  info: (message: string, meta?: unknown): void => logger.info(message, meta),
  warn: (message: string, meta?: unknown): void => logger.warn(message, meta),
  error: (message: string, meta?: unknown): void => logger.error(message, meta),
};

// Add default export for backward compatibility
export default logger;
