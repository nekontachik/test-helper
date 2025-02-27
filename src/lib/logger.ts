// Simple logger implementation without worker threads

const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || 'info';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  component?: string;
  data?: unknown;
}

class SimpleLogger {
  private component?: string;

  constructor(component?: string) {
    this.component = component;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      component: this.component,
      data: this.sanitizeData(data),
    };
  }

  private sanitizeData(data: unknown): unknown {
    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: isDevelopment ? data.stack : undefined,
      };
    }
    return data;
  }

  child(options: { component: string }): SimpleLogger {
    return new SimpleLogger(options.component);
  }

  debug(message: string, data?: unknown): void {
    if (isDevelopment || logLevel === 'debug') {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: unknown): void {
    if (['debug', 'info'].includes(logLevel)) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: unknown): void {
    if (['debug', 'info', 'warn'].includes(logLevel)) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: unknown): void {
    console.error(this.formatMessage('error', message, error));
  }
}

// Create a single instance
const logger = new SimpleLogger();

export const routeLogger = logger.child({ component: 'route' });
export const apiLogger = logger.child({ component: 'api' });
export const dbLogger = logger.child({ component: 'database' });

export default logger;
