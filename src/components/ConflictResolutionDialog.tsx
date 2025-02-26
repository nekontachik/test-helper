'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TestResult } from '@/types/testResults';

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  localChanges: TestResult[];
  serverChanges: TestResult[];
  onResolve: (resolvedResults: TestResult[]) => Promise<void>;
}

interface ConflictItem {
  testCaseId: string;
  local: TestResult;
  server: TestResult;
  selected?: 'local' | 'server';
}

export function ConflictResolutionDialog({
  isOpen,
  onClose,
  localChanges,
  serverChanges,
  onResolve,
}: ConflictResolutionDialogProps): JSX.Element {
  const [conflicts, setConflicts] = useState<ConflictItem[]>(() => 
    localChanges.map((local, index) => ({
      testCaseId: local.testCaseId,
      local,
      server: serverChanges[index],
      selected: undefined,
    }))
  );

  useEffect(() => {
    if (isOpen) {
      setConflicts(localChanges.map((local, index) => ({
        testCaseId: local.testCaseId,
        local,
        server: serverChanges[index],
        selected: undefined,
      })));
    }
  }, [isOpen, localChanges, serverChanges]);

  const handleSelect = (testCaseId: string, selection: 'local' | 'server'): void => {
    setConflicts(prev => 
      prev.map(conflict => 
        conflict.testCaseId === testCaseId
          ? { ...conflict, selected: selection }
          : conflict
      )
    );
  };

  const handleResolve = async (): Promise<void> => {
    try {
      const resolvedResults = conflicts.map(conflict => 
        conflict.selected === 'server' ? conflict.server : conflict.local
      );
      await onResolve(resolvedResults);
    } catch (error) {
      console.error('Failed to resolve conflicts:', error);
    }
  };

  const getStatusStyles = (status: string): string => {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
    switch (status) {
      case 'PASSED': return cn(baseStyles, "bg-green-100 text-green-800");
      case 'FAILED': return cn(baseStyles, "bg-red-100 text-red-800");
      case 'BLOCKED': return cn(baseStyles, "bg-yellow-100 text-yellow-800");
      case 'SKIPPED': return cn(baseStyles, "bg-gray-100 text-gray-800");
      default: return cn(baseStyles, "bg-gray-100 text-gray-800");
    }
  };

  const renderConflict = (conflict: ConflictItem): JSX.Element | null => {
    const hasChanges = 
      conflict.local.status !== conflict.server.status ||
      conflict.local.notes !== conflict.server.notes;

    if (!hasChanges) return null;

    return (
      <div key={conflict.testCaseId} className="border p-4 rounded-lg">
        <h3 className="font-medium mb-2">Test Case {conflict.testCaseId}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className={cn(
              "p-3 rounded transition-colors",
              conflict.selected === 'local' 
                ? "bg-blue-50 border-2 border-blue-500" 
                : "bg-gray-50"
            )}
          >
            <h4 className="font-medium mb-2">Local Changes</h4>
            <div className="space-y-2">
              <span className={getStatusStyles(conflict.local.status)}>
                {conflict.local.status}
              </span>
              {conflict.local.notes && (
                <p className="text-sm">{conflict.local.notes}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => handleSelect(conflict.testCaseId, 'local')}
              >
                Use Local
              </Button>
            </div>
          </div>

          <div 
            className={cn(
              "p-3 rounded transition-colors",
              conflict.selected === 'server' 
                ? "bg-blue-50 border-2 border-blue-500" 
                : "bg-gray-50"
            )}
          >
            <h4 className="font-medium mb-2">Server Changes</h4>
            <div className="space-y-2">
              <span className={getStatusStyles(conflict.server.status)}>
                {conflict.server.status}
              </span>
              {conflict.server.notes && (
                <p className="text-sm">{conflict.server.notes}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => handleSelect(conflict.testCaseId, 'server')}
              >
                Use Server
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const unresolved = conflicts.filter(c => !c.selected).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resolve Conflicts</DialogTitle>
          <DialogDescription>
            Changes were made to this test run while you were offline. 
            Please resolve the conflicts ({unresolved} remaining).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {conflicts.map(renderConflict)}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleResolve}
            disabled={unresolved > 0}
          >
            Apply Resolution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}