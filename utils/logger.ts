import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'yyyy-mm-dd HH:MM:ss',
    }
  } : undefined,
});

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogMethod {
  (message: string, ...meta: any[]): void;
  (message: any): void;
}

interface Logger {
  log(level: LogLevel, message: string, ...meta: any[]): void;
  error: LogMethod;
  warn: LogMethod;
  info: LogMethod;
  debug: LogMethod;
}

const customLogger: Logger = {
  log: (level: LogLevel, message: string, ...meta: any[]) => {
    logger[level](message, ...meta);
  },
  error: (message: string | any, ...meta: any[]) => {
    logger.error(message, ...meta);
  },
  warn: (message: string | any, ...meta: any[]) => {
    logger.warn(message, ...meta);
  },
  info: (message: string | any, ...meta: any[]) => {
    logger.info(message, ...meta);
  },
  debug: (message: string | any, ...meta: any[]) => {
    logger.debug(message, ...meta);
  },
};

export default customLogger;
