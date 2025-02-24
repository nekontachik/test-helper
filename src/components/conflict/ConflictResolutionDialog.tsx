import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TestCaseResult } from '@prisma/client';
import { format } from 'date-fns';

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientVersion: TestCaseResult;
  serverVersion: TestCaseResult;
  onResolve: (resolution: 'client' | 'server' | 'merge') => Promise<void>;
}

export function ConflictResolutionDialog({
  isOpen,
  onClose,
  clientVersion,
  serverVersion,
  onResolve
}: ConflictResolutionDialogProps) {
  const [resolution, setResolution] = useState<'client' | 'server' | 'merge'>('client');
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await onResolve(resolution);
      onClose();
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resolve Sync Conflict</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup 
            value={resolution} 
            onValueChange={(value: string) => setResolution(value as 'client' | 'server' | 'merge')}
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="client" id="client" />
              <Label htmlFor="client">
                <div className="font-medium">Use Local Version</div>
                <div className="text-sm text-gray-500">
                  Status: {clientVersion.status}<br />
                  Modified: {format(new Date(clientVersion.updatedAt), 'PPp')}
                </div>
              </Label>
            </div>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="server" id="server" />
              <Label htmlFor="server">
                <div className="font-medium">Use Server Version</div>
                <div className="text-sm text-gray-500">
                  Status: {serverVersion.status}<br />
                  Modified: {format(new Date(serverVersion.updatedAt), 'PPp')}
                </div>
              </Label>
            </div>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="merge" id="merge" />
              <Label htmlFor="merge">
                <div className="font-medium">Merge Changes</div>
                <div className="text-sm text-gray-500">
                  Combine notes and keep latest status
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={isResolving}>
            {isResolving ? 'Resolving...' : 'Resolve Conflict'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 