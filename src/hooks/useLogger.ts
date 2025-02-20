import { logInfo, logError } from '@/lib/utils/logger';

interface LoggerInterface {
  logInfo: (message: string) => void;
  logError: (message: string) => void;
}

/**
 * Hook for consistent logging across components
 * @param componentName - Name of the component for log context
 */
export function useLogger(componentName: string): LoggerInterface {
  return {
    logInfo: (message: string) => logInfo(componentName, message),
    logError: (message: string) => logError(componentName, message)
  };
}
