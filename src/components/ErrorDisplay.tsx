import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Error {error.code && `(${error.code})`}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{error.message}</p>
        {error.details && (
          <pre className="mt-2 text-sm bg-destructive/10 p-2 rounded">
            {JSON.stringify(error.details, null, 2)}
          </pre>
        )}
        {(onRetry || onDismiss) && (
          <div className="mt-4 flex gap-2">
            {onRetry && (
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
} 