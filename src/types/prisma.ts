import { Prisma } from '@prisma/client';

export interface BackupCodesData {
  codes: string[];
  updatedAt: Date;
}

// Extend Prisma JSON value type
declare global {
  namespace Prisma {
    type BackupCodesJson = BackupCodesData;
  }
}

// Type guard
export function isBackupCodesData(data: unknown): data is BackupCodesData {
  if (!data || typeof data !== 'object') return false;
  const bcd = data as BackupCodesData;
  return Array.isArray(bcd.codes) && 
         bcd.codes.every(code => typeof code === 'string') &&
         bcd.updatedAt instanceof Date;
} 