import { useState } from 'react';
import type { TestResult } from '@/types/testResults';

export function useTestRunConflicts() {
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [serverChanges, setServerChanges] = useState<TestResult[]>([]);

  const handleConflictDetected = (changes: TestResult[]) => {
    setServerChanges(changes.map(change => ({
      testCaseId: change.testCaseId,
      status: change.status,
      notes: change.notes || '',
      evidenceUrls: change.evidenceUrls || []
    })));
    setShowConflictDialog(true);
  };

  return {
    showConflictDialog,
    setShowConflictDialog,
    serverChanges,
    handleConflictDetected
  };
} 