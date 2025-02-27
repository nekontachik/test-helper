import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOperationQueue } from '@/hooks/useOperationQueue';
import { useQueueProcessor } from '@/hooks/useQueueProcessor';

interface TestRunSyncResult {
  isOnline: boolean;
  hasQueuedOperations: boolean;
  isProcessing: boolean;
  queueLength: number;
}

export function useTestRunSync(projectId: string, _testRunId: string): TestRunSyncResult {
  const isOnline = useOnlineStatus();
  const { hasOperations: hasQueuedOperations } = useOperationQueue(projectId);
  const { isProcessing, queueLength } = useQueueProcessor(projectId);

  return {
    isOnline,
    hasQueuedOperations,
    isProcessing,
    queueLength
  };
} 