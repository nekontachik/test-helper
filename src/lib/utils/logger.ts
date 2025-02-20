import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isServer = typeof window === 'undefined';

// Create a simple console logger for client-side
const consoleLogger = {
  debug: (...args: any[]) => isDevelopment && console.debug(...args),
  info: (...args: any[]) => console.log(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
};

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

// Export the appropriate logger based on environment
export const logger = isServer ? pinoLogger : consoleLogger;

export default logger;

export const logInfo = (component: string, message: string) => {
  console.log(`[${component}] ${message}`);
};

export const logError = (component: string, message: string) => {
  console.error(`[${component}] ${message}`);
};
 