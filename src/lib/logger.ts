import pino from 'pino';

// Create a simpler logger configuration without worker threads
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      // Disable worker threads to avoid the error
      worker: { enabled: false }
    },
  } : undefined,
});

export const routeLogger = logger.child({ component: 'route' });
export const apiLogger = logger.child({ component: 'api' });
export const dbLogger = logger.child({ component: 'database' });

export default logger;
