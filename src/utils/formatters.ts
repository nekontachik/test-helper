/**
 * Formats a duration in milliseconds to a human-readable string
 * @param ms Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 30m 15s")
 */
export function formatDuration(ms: number): string {
  if (!ms) return '0s';
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  
  parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

/**
 * Formats a date to a human-readable string
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

/**
 * Truncates a string to a specified length
 * @param str String to truncate
 * @param length Maximum length
 * @returns Truncated string with ellipsis if needed
 */
export function truncate(str: string, length = 50): string {
  if (!str) return '';
  if (str.length <= length) return str;
  
  return `${str.substring(0, length)}...`;
} 