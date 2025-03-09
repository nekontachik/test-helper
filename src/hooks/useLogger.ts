import { logger } from '@/lib/logger';

interface LoggerInterface {
  logInfo: (message: string) => void;
  logError: (message: string, error?: unknown) => void;
}

/**
 * Hook for consistent logging across components
 * @param componentName - Name of the component for log context
 */
export function useLogger(componentName: string): LoggerInterface {
  return {
    logInfo: (message: string) => {
      logger.info(`[${componentName}] ${message}`);
    },
    logError: (message: string, error?: unknown) => {
      logger.error(`[${componentName}] ${message}`, { error });
    }
  };
}
