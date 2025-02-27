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

// Define a more specific type for metadata
type LogMetadata = Record<string, unknown>[];

interface Logger {
  log(level: LogLevel, message: string, ...meta: LogMetadata): void;
  log(level: LogLevel, obj: Record<string, unknown>): void;
  error(message: string, ...meta: LogMetadata): void;
  error(obj: Record<string, unknown> | Error): void;
  warn(message: string, ...meta: LogMetadata): void;
  warn(obj: Record<string, unknown>): void;
  info(message: string, ...meta: LogMetadata): void;
  info(obj: Record<string, unknown>): void;
  debug(message: string, ...meta: LogMetadata): void;
  debug(obj: Record<string, unknown>): void;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const customLogger: Logger = {
  log(level: LogLevel, messageOrObj: string | Record<string, unknown>, ...meta: LogMetadata) {
    if (typeof messageOrObj === 'string') {
      logger[level](messageOrObj, ...meta);
    } else {
      logger[level](messageOrObj);
    }
  },
  error(messageOrObj: string | Record<string, unknown> | Error, ...meta: LogMetadata) {
    if (typeof messageOrObj === 'string') {
      logger.error(messageOrObj, ...meta);
    } else {
      logger.error(messageOrObj);
    }
  },
  warn(messageOrObj: string | Record<string, unknown>, ...meta: LogMetadata) {
    if (typeof messageOrObj === 'string') {
      logger.warn(messageOrObj, ...meta);
    } else {
      logger.warn(messageOrObj);
    }
  },
  info(messageOrObj: string | Record<string, unknown>, ...meta: LogMetadata) {
    if (typeof messageOrObj === 'string') {
      logger.info(messageOrObj, ...meta);
    } else {
      logger.info(messageOrObj);
    }
  },
  debug(messageOrObj: string | Record<string, unknown>, ...meta: LogMetadata) {
    if (typeof messageOrObj === 'string') {
      logger.debug(messageOrObj, ...meta);
    } else {
      logger.debug(messageOrObj);
    }
  },
};

export default customLogger;
