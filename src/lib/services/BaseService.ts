import type { PrismaClient } from '@prisma/client';

/** @internal */
interface _QueryOptions<T> {
  filters?: Partial<T>;
  orderBy?: { [K in keyof T]?: 'asc' | 'desc' };
  page?: number;
  limit?: number;
}

/** @internal */
interface _PrismaDelegate<T> {
  findUnique: (args: { where: { id: string } }) => Promise<T | null>;
  findMany: (args: { 
    where?: Partial<T>;
    orderBy?: { [K in keyof T]?: 'asc' | 'desc' };
    skip?: number;
    take?: number;
  }) => Promise<T[]>;
  create: (args: { data: Omit<T, 'id'> }) => Promise<T>;
  update: (args: { where: { id: string }; data: Partial<T> }) => Promise<T>;
  delete: (args: { where: { id: string } }) => Promise<T>;
  count: (args: { where?: Partial<T> }) => Promise<number>;
}

// This class is marked for removal. Use specific service implementations instead.
/** @deprecated Use specific service implementations instead */
export class _BaseService<_T, _K extends keyof PrismaClient> {
  // Implementation removed
} 