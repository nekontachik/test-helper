const isDevelopment = process.env.NODE_ENV === 'development';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';
type LogMetadata = unknown[];

interface Logger {
  error(message: string, ...meta: LogMetadata): void;
  error(obj: Record<string, unknown> | Error): void;
  warn(message: string, ...meta: LogMetadata): void;
  warn(obj: Record<string, unknown>): void;
  info(message: string, ...meta: LogMetadata): void;
  info(obj: Record<string, unknown>): void;
  debug(message: string, ...meta: LogMetadata): void;
  debug(obj: Record<string, unknown>): void;
}

function formatLogEntry(level: LogLevel, messageOrObj: string | Record<string, unknown> | Error, meta: LogMetadata = []): unknown {
  const timestamp = new Date().toISOString();
  
  if (typeof messageOrObj === 'string') {
    return {
      level,
      timestamp,
      message: messageOrObj,
      meta: meta.length > 0 ? meta : undefined
    };
  } else if (messageOrObj instanceof Error) {
    return {
      level,
      timestamp,
      message: messageOrObj.message,
      error: {
        name: messageOrObj.name,
        stack: isDevelopment ? messageOrObj.stack : undefined
      }
    };
  } else {
    return {
      level,
      timestamp,
      ...messageOrObj
    };
  }
}

// Create a browser-safe logger
export const logger: Logger = {
  error(messageOrObj: string | Record<string, unknown> | Error, ...meta: LogMetadata) {
    const formattedLog = formatLogEntry('error', messageOrObj, meta);
    console.error(JSON.stringify(formattedLog));
  },
  warn(messageOrObj: string | Record<string, unknown>, ...meta: LogMetadata) {
    const formattedLog = formatLogEntry('warn', messageOrObj, meta);
    console.warn(JSON.stringify(formattedLog));
  },
  info(messageOrObj: string | Record<string, unknown>, ...meta: LogMetadata) {
    const formattedLog = formatLogEntry('info', messageOrObj, meta);
    console.info(JSON.stringify(formattedLog));
  },
  debug(messageOrObj: string | Record<string, unknown>, ...meta: LogMetadata) {
    if (isDevelopment) {
      const formattedLog = formatLogEntry('debug', messageOrObj, meta);
      console.debug(JSON.stringify(formattedLog));
    }
  }
}; 