import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { TestResult } from '@/types/testResults';

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  localChanges: TestResult[];
  serverChanges: TestResult[];
  onResolve: (resolvedResults: TestResult[]) => void;
}

export function ConflictResolutionDialog({
  isOpen,
  onClose,
  localChanges,
  serverChanges,
  onResolve
}: ConflictResolutionDialogProps) {
  const handleResolve = (useLocal: boolean) => {
    onResolve(useLocal ? localChanges : serverChanges);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conflict Detected</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Changes have been detected on the server that conflict with your local changes.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => handleResolve(false)}>
              Use Server Changes
            </Button>
            <Button onClick={() => handleResolve(true)}>
              Keep Local Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 