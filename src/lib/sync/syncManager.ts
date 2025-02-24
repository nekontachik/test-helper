import { prisma } from '@/lib/prisma';
import { ConflictResolver } from './conflictResolver';
import { CacheManager } from '../cache/cacheStrategy';
import { dbLogger } from '@/lib/logger';
import { Prisma, PrismaClient, TestCaseResult } from '@prisma/client';

type PrismaModels = Exclude<keyof PrismaClient, `$${string}`>;
type ModelActions = 'create' | 'update' | 'delete' | 'findUnique';

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: PrismaModels;
  data: unknown;
  timestamp: number;
  retryCount: number;
}

export class SyncManager {
  private conflictResolver: ConflictResolver;
  private cacheManager: CacheManager;
  private syncQueue: SyncOperation[] = [];
  private isSyncing = false;

  constructor() {
    this.conflictResolver = new ConflictResolver();
    this.cacheManager = new CacheManager();
  }

  async queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>) {
    const syncOp: SyncOperation = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
      ...operation
    };

    this.syncQueue.push(syncOp);
    await this.persistQueue();

    if (navigator.onLine) {
      await this.sync();
    }
  }

  async sync() {
    if (this.isSyncing || !navigator.onLine || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      for (const operation of [...this.syncQueue]) {
        try {
          await this.processSyncOperation(operation);
          this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
          await this.persistQueue();
        } catch (error) {
          dbLogger.error('Sync operation failed:', { operation, error });
          
          if (operation.retryCount < 3) {
            operation.retryCount++;
            await this.persistQueue();
          } else {
            this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
            await this.persistQueue();
          }
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async processSyncOperation(operation: SyncOperation) {
    switch (operation.type) {
      case 'CREATE':
        return this.handleCreate(operation);
      case 'UPDATE':
        return this.handleUpdate(operation);
      case 'DELETE':
        return this.handleDelete(operation);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private async handleCreate(operation: SyncOperation) {
    const { entity, data } = operation;
    const model = prisma[entity] as unknown as { create: (args: unknown) => Promise<unknown> };
    return model.create({ data: data as any });
  }

  private async handleUpdate(operation: SyncOperation) {
    const { entity, data } = operation;
    const model = prisma[entity] as unknown as {
      findUnique: (args: unknown) => Promise<unknown>;
      update: (args: unknown) => Promise<unknown>;
    };
    
    const typedData = data as TestCaseResult;
    const serverVersion = await model.findUnique({
      where: { id: typedData.id }
    }) as TestCaseResult | null;

    if (!serverVersion) {
      throw new Error(`Entity not found: ${String(entity)} ${typedData.id}`);
    }

    // Check for conflicts
    if (serverVersion.updatedAt > new Date(operation.timestamp)) {
      return this.conflictResolver.resolveConflict(
        typedData,
        serverVersion,
        {
          clientVersion: typedData,
          serverVersion,
          timestamp: operation.timestamp,
          userId: typedData.userId
        }
      );
    }

    return model.update({
      where: { id: typedData.id },
      data: typedData
    });
  }

  private async handleDelete(operation: SyncOperation) {
    const { entity, data } = operation;
    const model = prisma[entity] as unknown as { delete: (args: unknown) => Promise<unknown> };
    const typedData = data as { id: string };
    
    return model.delete({
      where: { id: typedData.id }
    });
  }

  private async persistQueue() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }
  }

  private async loadQueue() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('syncQueue');
      this.syncQueue = saved ? JSON.parse(saved) : [];
    }
  }
} 