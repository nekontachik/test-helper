interface TestRunHeaderProps {
  currentIndex: number;
  totalCases: number;
  progress: number;
}

export function TestRunHeader({ currentIndex, totalCases, progress }: TestRunHeaderProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Execute Test Case {currentIndex + 1} of {totalCases}
        </h2>
        <span className="text-sm text-muted-foreground">
          Progress: {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
} 