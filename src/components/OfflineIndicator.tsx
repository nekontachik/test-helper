import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Globe, X } from 'lucide-react';

interface OfflineIndicatorProps {
  hasQueuedOperations: boolean;
  queueLength: number;
  onSync?: () => void;
}

export function OfflineIndicator({ 
  hasQueuedOperations,
  queueLength,
  onSync 
}: OfflineIndicatorProps): React.ReactElement | null {
  const isOnline = useOnlineStatus();

  if (isOnline && !hasQueuedOperations) {
    return null;
  }

  return (
    <Alert variant={isOnline ? "default" : "destructive"}>
      <div className="flex items-center gap-2">
        {isOnline ? <Globe className="h-4 w-4" /> : <X className="h-4 w-4" />}
        <AlertTitle>
          {isOnline ? 'Syncing Data' : 'You are offline'}
        </AlertTitle>
      </div>
      <AlertDescription>
        {!isOnline && (
          <p>Changes will be saved locally and synced when you&apos;re back online.</p>
        )}
        {hasQueuedOperations && (
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Pending operations: {queueLength}</span>
              {isOnline && onSync && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onSync}
                >
                  Sync Now
                </Button>
              )}
            </div>
            <Progress value={(queueLength / 10) * 100} />
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
} 