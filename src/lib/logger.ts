// Simple logger implementation that works in both browser and server environments

// Define logger interface
interface LoggerInterface {
  error: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  info: (message: string, meta?: unknown) => void;
  http: (message: string, meta?: unknown) => void;
  debug: (message: string, meta?: unknown) => void;
}

// Define metadata type
type LogMetadata = Record<string, unknown>;

/**
 * Universal logger that works in both browser and server environments
 * This implementation uses only browser-compatible APIs
 */
class UniversalLogger implements LoggerInterface {
  private readonly level: string;
  private readonly service: string;
  
  // Define log levels and their priorities
  private readonly levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  };

  constructor(options?: { level?: string; service?: string }) {
    this.level = options?.level || 'info';
    this.service = options?.service || 'app';
  }

  private shouldLog(level: string): boolean {
    const configuredLevel = this.levels[this.level as keyof typeof this.levels] || 2; // Default to info
    const messageLevel = this.levels[level as keyof typeof this.levels] || 2;
    return messageLevel <= configuredLevel;
  }

  private formatMessage(level: string, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${this.service}] [${level.toUpperCase()}]: ${message}${metaStr}`;
  }

  error(message: string, meta?: unknown): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  warn(message: string, meta?: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  info(message: string, meta?: unknown): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  http(message: string, meta?: unknown): void {
    if (this.shouldLog('http')) {
      console.log(this.formatMessage('http', message, meta));
    }
  }

  debug(message: string, meta?: unknown): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

// Create a singleton instance of the logger
export const logger = new UniversalLogger({
  level: typeof process !== 'undefined' && process.env?.LOG_LEVEL || 'info',
  service: 'test-app'
});

// Export a database logger for Prisma
export const dbLogger = {
  info: (message: string, meta?: LogMetadata): void => logger.info(message, { metadata: meta }),
  warn: (message: string, meta?: LogMetadata): void => logger.warn(message, { metadata: meta }),
  error: (message: string, meta?: LogMetadata): void => logger.error(message, { metadata: meta }),
};

// Add default export for backward compatibility
export default logger;
