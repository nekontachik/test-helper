// Simple console-based logger without worker threads

const isDevelopment = process.env.NODE_ENV === 'development';

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

// Format log entry for console output
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const customLogger: Logger = {
  log(level: LogLevel, messageOrObj: string | Record<string, unknown>, ...meta: LogMetadata) {
    const formattedLog = formatLogEntry(level, messageOrObj, meta);
    console[level](formattedLog);
  },
  error(messageOrObj: string | Record<string, unknown> | Error, ...meta: LogMetadata) {
    const formattedLog = formatLogEntry('error', messageOrObj, meta);
    console.error(formattedLog);
  },
  warn(messageOrObj: string | Record<string, unknown>, ...meta: LogMetadata) {
    const formattedLog = formatLogEntry('warn', messageOrObj, meta);
    console.warn(formattedLog);
  },
  info(messageOrObj: string | Record<string, unknown>, ...meta: LogMetadata) {
    const formattedLog = formatLogEntry('info', messageOrObj, meta);
    console.info(formattedLog);
  },
  debug(messageOrObj: string | Record<string, unknown>, ...meta: LogMetadata) {
    if (isDevelopment) {
      const formattedLog = formatLogEntry('debug', messageOrObj, meta);
      console.debug(formattedLog);
    }
  },
};

export default customLogger;
