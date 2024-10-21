import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

type LogLevel =
  | 'error'
  | 'warn'
  | 'info'
  | 'http'
  | 'verbose'
  | 'debug'
  | 'silly';

interface LogMethod {
  (message: string, ...meta: any[]): void;
  (message: any): void;
}

interface Logger {
  log(level: LogLevel, message: string, ...meta: any[]): void;
  error: LogMethod;
  warn: LogMethod;
  info: LogMethod;
  verbose: LogMethod;
  debug: LogMethod;
  silly: LogMethod;
}

const customLogger: Logger = {
  log: (level: LogLevel, message: string, ...meta: any[]) => {
    logger.log(level, message, ...meta);
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
  verbose: (message: string | any, ...meta: any[]) => {
    logger.verbose(message, ...meta);
  },
  debug: (message: string | any, ...meta: any[]) => {
    logger.debug(message, ...meta);
  },
  silly: (message: string | any, ...meta: any[]) => {
    logger.silly(message, ...meta);
  },
};

export default customLogger;
