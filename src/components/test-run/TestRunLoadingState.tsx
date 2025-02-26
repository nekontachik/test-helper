import { Loader } from 'lucide-react';

export function TestRunLoadingState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading test run...</p>
    </div>
  );
} 