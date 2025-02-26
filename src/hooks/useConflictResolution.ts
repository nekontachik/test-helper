import { useState, useCallback, useMemo } from 'react';
import type { ConflictResolutionStrategy } from '@/lib/sync/conflictResolver';
import { ConflictResolver } from '@/lib/sync/conflictResolver';
import type { TestCaseResult } from '@prisma/client';

export function useConflictResolution(strategy: ConflictResolutionStrategy = 'last-write-wins'): {
  resolveConflict: (
    clientVersion: TestCaseResult,
    serverVersion: TestCaseResult,
    metadata: { userId: string; timestamp: number }
  ) => Promise<TestCaseResult>;
  isResolving: boolean;
} {
  const [isResolving, setIsResolving] = useState(false);
  
  // Use useMemo to create the resolver only when strategy changes
  const resolver = useMemo(() => new ConflictResolver(strategy), [strategy]);

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