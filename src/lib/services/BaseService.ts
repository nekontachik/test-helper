import { Prisma, PrismaClient } from '@prisma/client';
import { ApiError } from '@/lib/api/errorHandler';
import { logger } from '@/lib/utils/logger';
import type { QueryOptions } from '@/lib/db/queryBuilder';
import { PrismaQueryBuilder } from '@/lib/db/queryBuilder';

export class BaseService<
  T extends { id: string },
  M extends keyof PrismaClient
> {
  protected queryBuilder: PrismaQueryBuilder<T>;

  constructor(
    protected readonly model: PrismaClient[M],
    protected readonly modelName: string
  ) {
    this.queryBuilder = new PrismaQueryBuilder<T>(modelName);
  }

  protected async handleServiceError(error: unknown, operation: string): Promise<never> {
    logger.error(`${this.modelName} service error:`, { error, operation });
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': // Unique constraint
          throw new ApiError(`${this.modelName} already exists`, 409);
        case 'P2025': // Not found
          throw new ApiError(`${this.modelName} not found`, 404);
        case 'P2003': // Foreign key
          throw new ApiError('Related record not found', 400);
        default:
          throw new ApiError('Database error', 500);
      }
    }

    throw error instanceof ApiError ? error : new ApiError('Unexpected error', 500);
  }

  async findById(id: string): Promise<T> {
    try {
      const item = await (this.model as any).findUnique({ where: { id } });
      if (!item) throw new ApiError(`${this.modelName} not found`, 404);
      return item;
    } catch (error) {
      throw this.handleServiceError(error, 'findById');
    }
  }

  async findMany(options?: QueryOptions<T>): Promise<{ data: T[]; total: number }> {
    try {
      const query = this.queryBuilder.buildQuery(options || {});
      const [items, total] = await Promise.all([
        (this.model as any).findMany(query),
        (this.model as any).count(query)
      ]);

      return { data: items, total };
    } catch (error) {
      throw this.handleServiceError(error, 'findMany');
    }
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    try {
      return await (this.model as any).create({ data });
    } catch (error) {
      logger.error(`Error creating ${this.modelName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      return await (this.model as any).update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error(`Error updating ${this.modelName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await (this.model as any).delete({
        where: { id }
      });
    } catch (error) {
      logger.error(`Error deleting ${this.modelName}:`, error);
      throw error;
    }
  }
} 