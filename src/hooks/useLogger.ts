import winston from 'winston';

// Create the logger instance outside the hook for better performance
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Define the logger interface
interface LoggerInterface {
  info: (message: string, ...meta: any[]) => void;
  error: (message: string, ...meta: any[]) => void;
  warn: (message: string, ...meta: any[]) => void;
  debug: (message: string, ...meta: any[]) => void;
}

// Create the hook that returns the logger methods
export function useLogger(): LoggerInterface {
  return {
    info: (message: string, ...meta: any[]) => logger.info(message, ...meta),
    error: (message: string, ...meta: any[]) => logger.error(message, ...meta),
    warn: (message: string, ...meta: any[]) => logger.warn(message, ...meta),
    debug: (message: string, ...meta: any[]) => logger.debug(message, ...meta),
  };
}

export default useLogger;
