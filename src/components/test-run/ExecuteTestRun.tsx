import { useState } from 'react';
import { TestCaseView } from './TestCaseView';
import { TestResultForm } from './TestResultForm';
import { OfflineIndicator } from './OfflineIndicator';
import { TestRunHeader } from './TestRunHeader';
import { ConflictResolutionDialog } from './ConflictResolutionDialog';
import { ConfirmDialog } from '../ConfirmDialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { TestRunSummary } from '../TestRunSummary';
import type { TestCase } from '@/types';
import type { TestResult, TestResultWithEvidence } from '@/types/testResults';
import React from 'react';
import { useTestRunConflicts } from '@/hooks/useTestRunConflicts';
import { useTestRunWebSocket } from '@/hooks/useTestRunWebSocket';
import { useTestRunState } from './hooks/useTestRunState';
import { useTestRunSync } from './hooks/useTestRunSync';

interface ExecuteTestRunProps {
  testCases: TestCase[];
  projectId: string;
  testRunId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function ExecuteTestRun({ testCases, projectId, testRunId, onComplete, onCancel }: ExecuteTestRunProps) {
  const {
    currentTestCase,
    isLastTestCase,
    progress,
    handleSubmit,
    isSubmitting,
    executeTestRun
  } = useTestRunState({ testCases, projectId, testRunId, onComplete });

  const {
    isOnline,
    hasQueuedOperations,
    isProcessing,
    queueLength
  } = useTestRunSync(projectId, testRunId);

  const {
    showConflictDialog,
    setShowConflictDialog,
    serverChanges,
    handleConflictDetected
  } = useTestRunConflicts();

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const completionProgress = ((progress.currentIndex + 1) / testCases.length) * 100;

  const handleConflictResolution = async (resolvedResults: TestResult[]) => {
    try {
      const resultsWithEvidence: TestResultWithEvidence[] = resolvedResults.map(result => ({
        ...result,
        notes: result.notes || '',
        evidenceUrls: result.evidenceUrls || [],
        evidence: undefined
      }));
      await executeTestRun(resultsWithEvidence);
      setShowConflictDialog(false);
    } catch (err) {
      console.error('Failed to resolve conflicts:', err);
    }
  };

  useTestRunWebSocket(projectId, testRunId, handleConflictDetected);

  // Memoize TestRunSummary to prevent unnecessary re-renders
  const MemoizedTestRunSummary = React.memo(TestRunSummary);

  return (
    <>
      {!isOnline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-sm text-yellow-700">
            You are currently offline. Changes will be saved and synchronized when you're back online.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <TestRunHeader 
                currentIndex={progress.currentIndex}
                totalCases={testCases.length}
                progress={completionProgress}
              />
            </CardHeader>
            <CardContent>
              <TestCaseView testCase={currentTestCase} />
              <TestResultForm
                testRunId={testRunId}
                testCaseId={currentTestCase.id}
                projectId={projectId}
                onSuccess={handleSubmit}
                isSubmitting={isSubmitting}
                isLastCase={isLastTestCase}
                onCancel={() => setShowCancelDialog(true)}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <MemoizedTestRunSummary results={progress.results} />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancelDialog}
        onConfirm={() => { setShowCancelDialog(false); onCancel(); }}
        onCancel={() => setShowCancelDialog(false)}
        title="Cancel Test Run?"
        description="You have unsaved changes. Are you sure you want to cancel?"
        confirmText="Yes, Cancel"
        cancelText="No, Continue"
      />

      <ConflictResolutionDialog
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        localChanges={progress.results}
        serverChanges={serverChanges}
        onResolve={handleConflictResolution}
      />

      <OfflineIndicator
        isOnline={isOnline}
        hasQueuedOperations={hasQueuedOperations}
        hasPendingOperations={false}
        isProcessing={isProcessing}
        isSyncing={false}
        queueLength={queueLength}
        pendingOperations={[]}
        onSync={() => {}}
      />
    </>
  );
} 