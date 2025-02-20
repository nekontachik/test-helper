import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message: string;
  code?: string;
  onRetry?: () => void;
  onReset?: () => void;
}

export function ErrorDisplay({ message, code, onRetry, onReset }: ErrorDisplayProps) {
  return (
    <Alert variant="destructive" className="bg-red-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-red-700">Error</AlertTitle>
      <AlertDescription className="text-red-600">
        {message}
        {code && (
          <span className="block mt-1 text-sm text-red-500">
            Error code: {code}
          </span>
        )}
      </AlertDescription>
      <div className="flex gap-2 mt-2">
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
        {onReset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
          >
            Start Over
          </Button>
        )}
      </div>
    </Alert>
  );
} 