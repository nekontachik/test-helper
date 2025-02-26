import { prisma } from '@/lib/prisma';
import { ConflictResolver } from './conflictResolver';
import { CacheManager } from '../cache/cacheStrategy';
import { dbLogger } from '@/lib/logger';
import type { PrismaClient, TestCaseResult } from '@prisma/client';

type PrismaModels = Exclude<keyof PrismaClient, `$${string}`>;

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

  async queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
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

  async sync(): Promise<void> {
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

  private async processSyncOperation(operation: SyncOperation): Promise<unknown> {
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

  private async handleCreate(operation: SyncOperation): Promise<unknown> {
    const { entity, data } = operation;
    const model = prisma[entity] as unknown as { create: (args: { data: unknown }) => Promise<unknown> };
    return model.create({ data });
  }

  private async handleUpdate(operation: SyncOperation): Promise<unknown> {
    const { entity, data } = operation;
    const model = prisma[entity] as unknown as {
      findUnique: (args: { where: { id: string } }) => Promise<unknown>;
      update: (args: { where: { id: string }; data: unknown }) => Promise<unknown>;
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
          userId: typedData.executedById
        }
      );
    }

    return model.update({
      where: { id: typedData.id },
      data: typedData
    });
  }

  private async handleDelete(operation: SyncOperation): Promise<unknown> {
    const { entity, data } = operation;
    const model = prisma[entity] as unknown as { 
      delete: (args: { where: { id: string } }) => Promise<unknown> 
    };
    const typedData = data as { id: string };
    
    return model.delete({
      where: { id: typedData.id }
    });
  }

  private async persistQueue(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }
  }

  private async loadQueue(): Promise<void> {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('syncQueue');
      this.syncQueue = saved ? JSON.parse(saved) : [];
    }
  }
} 