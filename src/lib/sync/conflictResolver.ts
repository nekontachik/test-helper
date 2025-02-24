import { prisma } from '@/lib/prisma';
import { TestCaseResult } from '@prisma/client';

export type ConflictResolutionStrategy = 'client-wins' | 'server-wins' | 'last-write-wins' | 'manual';

interface ConflictMetadata {
  clientVersion: TestCaseResult;
  serverVersion: TestCaseResult;
  timestamp: number;
  userId: string;
}

export class ConflictResolver {
  private strategy: ConflictResolutionStrategy;

  constructor(strategy: ConflictResolutionStrategy = 'last-write-wins') {
    this.strategy = strategy;
  }

  async resolveConflict(
    clientVersion: TestCaseResult,
    serverVersion: TestCaseResult,
    metadata: ConflictMetadata
  ): Promise<TestCaseResult> {
    switch (this.strategy) {
      case 'client-wins':
        return this.resolveClientWins(clientVersion, serverVersion);
      case 'server-wins':
        return this.resolveServerWins(clientVersion, serverVersion);
      case 'last-write-wins':
        return this.resolveLastWriteWins(clientVersion, serverVersion, metadata);
      case 'manual':
        return this.resolveManually(clientVersion, serverVersion, metadata);
      default:
        return this.resolveLastWriteWins(clientVersion, serverVersion, metadata);
    }
  }

  private async resolveClientWins(
    clientVersion: TestCaseResult,
    _serverVersion: TestCaseResult
  ): Promise<TestCaseResult> {
    return prisma.testCaseResult.update({
      where: { id: clientVersion.id },
      data: {
        status: clientVersion.status,
        notes: clientVersion.notes,
        updatedAt: new Date()
      }
    });
  }

  private async resolveServerWins(
    _clientVersion: TestCaseResult,
    serverVersion: TestCaseResult
  ): Promise<TestCaseResult> {
    return serverVersion;
  }

  private async resolveLastWriteWins(
    clientVersion: TestCaseResult,
    serverVersion: TestCaseResult,
    metadata: ConflictMetadata
  ): Promise<TestCaseResult> {
    const clientTimestamp = new Date(clientVersion.updatedAt).getTime();
    const serverTimestamp = new Date(serverVersion.updatedAt).getTime();

    return clientTimestamp > serverTimestamp
      ? this.resolveClientWins(clientVersion, serverVersion)
      : this.resolveServerWins(clientVersion, serverVersion);
  }

  private async resolveManually(
    clientVersion: TestCaseResult,
    serverVersion: TestCaseResult,
    metadata: ConflictMetadata
  ): Promise<TestCaseResult> {
    // Store conflict for manual resolution
    await prisma.syncConflict.create({
      data: {
        clientVersion: clientVersion as any,
        serverVersion: serverVersion as any,
        userId: metadata.userId,
        timestamp: new Date(metadata.timestamp),
        status: 'PENDING'
      }
    });

    // Return server version for now
    return serverVersion;
  }
} 