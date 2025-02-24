import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isServer = typeof window === 'undefined';

// Create Pino logger for server-side with minimal config
const pinoLogger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
    }
  } : undefined,
});

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logger = isServer ? pinoLogger : console;

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data: this.sanitizeData(data),
    };
  }

  private sanitizeData(data: unknown): unknown {
    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: this.isDevelopment ? data.stack : undefined,
      };
    }
    return data;
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: unknown): void {
    console.info(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: unknown): void {
    console.warn(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: unknown): void {
    console.error(this.formatMessage('error', message, error));
  }
}

// Export a single instance
const logger = new Logger();
export { logger };
export default logger;
 