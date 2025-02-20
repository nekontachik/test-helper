export interface StorageError extends Error {
  name: 'QuotaExceededError' | string;
  code?: number;
} 