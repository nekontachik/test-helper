import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOperationQueue } from '@/hooks/useOperationQueue';
import { useQueueProcessor } from '@/hooks/useQueueProcessor';

export function useTestRunSync(projectId: string, _testRunId: string) {
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