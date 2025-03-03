import { TestResultStatus } from '@/types/testRun';

/**
 * Returns the appropriate color scheme for a test status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case TestResultStatus.PASSED:
      return 'green';
    case TestResultStatus.FAILED:
      return 'red';
    case TestResultStatus.SKIPPED:
      return 'yellow';
    case TestResultStatus.BLOCKED:
      return 'gray';
    default:
      return 'blue';
  }
};

/**
 * Formats a date string to a localized string or returns 'N/A' if undefined
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

/**
 * Formats a duration in milliseconds to a human-readable string
 */
export const formatDuration = (ms?: number): string => {
  if (!ms) return 'N/A';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}; 