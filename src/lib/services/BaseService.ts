import type { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ErrorFactory } from '@/lib/errors/ErrorFactory';
import { ServiceErrorHandler } from '@/lib/services/ServiceErrorHandler';
import type { ServiceResponse } from '@/lib/utils/serviceResponse';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/utils/authUtils';
import { AppError } from '@/lib/errors/types';

interface QueryOptions<T> {
  filters?: Partial<T>;
  orderBy?: { [K in keyof T]?: 'asc' | 'desc' };
  page?: number;
  limit?: number;
}

interface PrismaDelegate<T> {
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

export abstract class BaseService<T extends { id: string }, M extends keyof PrismaClient> {
  protected readonly prisma: PrismaClient;
  protected readonly model: PrismaDelegate<T>;
  protected readonly modelName: string;

  constructor(model: PrismaClient[M], modelName: string) {
    this.prisma = prisma;
    this.model = model as unknown as PrismaDelegate<T>;
    this.modelName = modelName;
  }

  protected async checkAuth(): Promise<Session> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw ErrorFactory.unauthorized('Not authenticated');
    }
    return session;
  }

  protected async withAuth<R>(operation: () => Promise<R>): Promise<ServiceResponse<R>> {
    try {
      await authUtils.requireAuth();
      return ServiceErrorHandler.execute(operation, { context: this.modelName });
    } catch (error) {
      const appError = error instanceof AppError ? error : 
        ErrorFactory.create('UNAUTHORIZED', 'Authentication failed');
      return { success: false, error: appError };
    }
  }

  protected async withTransaction<R>(
    operation: (tx: Prisma.TransactionClient) => Promise<R>
  ): Promise<ServiceResponse<R>> {
    return ServiceErrorHandler.withTransaction(
      async () => {
        const result = await this.prisma.$transaction(operation);
        return { success: true, data: result };
      }
    );
  }

  async findById(id: string): Promise<ServiceResponse<T>> {
    return ServiceErrorHandler.execute(async () => {
      const item = await this.model.findUnique({ where: { id } });
      if (!item) throw ErrorFactory.notFound(this.modelName);
      return item;
    }, { context: `${this.modelName}FindById` });
  }

  async findMany(options: QueryOptions<T> = {}): Promise<ServiceResponse<{ data: T[]; total: number }>> {
    return ServiceErrorHandler.execute(async () => {
      const { filters, orderBy, page = 1, limit = 10 } = options;
      const [items, total] = await Promise.all([
        this.model.findMany({
          where: filters,
          orderBy,
          skip: (page - 1) * limit,
          take: limit
        }),
        this.model.count({ where: filters })
      ]);
      return { data: items, total };
    }, { context: `${this.modelName}FindMany` });
  }

  async create(data: Omit<T, 'id'>): Promise<ServiceResponse<T>> {
    return ServiceErrorHandler.execute(
      async () => this.model.create({ data }),
      { context: `${this.modelName}Create` }
    );
  }

  async update(id: string, data: Partial<T>): Promise<ServiceResponse<T>> {
    return ServiceErrorHandler.execute(
      async () => this.model.update({ where: { id }, data }),
      { context: `${this.modelName}Update` }
    );
  }

  async delete(id: string): Promise<ServiceResponse<void>> {
    return ServiceErrorHandler.execute(async () => {
      await this.model.delete({ where: { id } });
    }, { context: `${this.modelName}Delete` });
  }
} 