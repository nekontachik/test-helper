import { useState, useCallback } from 'react';
import { ConflictResolver, ConflictResolutionStrategy } from '@/lib/sync/conflictResolver';
import { TestCaseResult } from '@prisma/client';

export function useConflictResolution(strategy: ConflictResolutionStrategy = 'last-write-wins') {
  const [isResolving, setIsResolving] = useState(false);
  const resolver = new ConflictResolver(strategy);

  const resolveConflict = useCallback(async (
    clientVersion: TestCaseResult,
    serverVersion: TestCaseResult,
    metadata: { userId: string; timestamp: number }
  ) => {
    setIsResolving(true);
    try {
      const resolved = await resolver.resolveConflict(clientVersion, serverVersion, {
        clientVersion,
        serverVersion,
        ...metadata
      });
      return resolved;
    } finally {
      setIsResolving(false);
    }
  }, [resolver]);

  return {
    resolveConflict,
    isResolving
  };
} 