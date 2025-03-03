interface TestRunHeaderProps {
  name: string;
  status: string;
  getStatusColor: (status: string) => string;
  isLoading: boolean;
  isPolling: boolean;
}

export function TestRunHeader({
  name,
  status,
  getStatusColor,
  isLoading: _isLoading,
  isPolling: _isPolling
}: TestRunHeaderProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Execute Test Case {name}
        </h2>
        <span className="text-sm text-muted-foreground">
          Status: {status}
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300" 
          style={{ width: `${getStatusColor(status)}` }}
        />
      </div>
    </div>
  );
} 