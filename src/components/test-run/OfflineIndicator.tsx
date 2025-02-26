import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BATCH_SIZE } from '@/constants';

interface OfflineIndicatorProps {
  isOnline: boolean;
  hasQueuedOperations: boolean;
  hasPendingOperations: boolean;
  isProcessing: boolean;
  isSyncing: boolean;
  queueLength: number;
  pendingOperations: unknown[];
  onSync: () => void;
}

export function OfflineIndicator({
  isOnline,
  hasQueuedOperations,
  hasPendingOperations,
  isProcessing,
  isSyncing,
  queueLength,
  pendingOperations,
  onSync
}: OfflineIndicatorProps): JSX.Element | null {
  if (!hasQueuedOperations && !hasPendingOperations) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 p-4 rounded-lg shadow-lg z-50">
      <div className="flex flex-col gap-2">
        {!isOnline && (
          <div className="text-sm font-semibold text-yellow-800">
            Offline Mode
          </div>
        )}
        {hasQueuedOperations && (
          <div className="text-sm">
            {isProcessing 
              ? `Processing ${queueLength} operations...`
              : `${queueLength} operations queued`}
            {isProcessing && (
              <div className="mt-2">
                <Progress value={(queueLength / BATCH_SIZE) * 100} />
              </div>
            )}
          </div>
        )}
        {hasPendingOperations && (
          <div className="text-sm">
            {isSyncing 
              ? `Syncing ${pendingOperations.length} changes...`
              : `${pendingOperations.length} changes pending sync`}
          </div>
        )}
        {(hasQueuedOperations || hasPendingOperations) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={!isOnline || isSyncing}
          >
            Sync Now
          </Button>
        )}
      </div>
    </div>
  );
} 