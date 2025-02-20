'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { TestCase, TestResult } from '@/types';
import { useTestRunExecution } from '@/hooks/useTestRunExecution';
import { Progress } from '@/components/ui/progress';
import { FilePreview } from '@/components/FilePreview';
import { useTestRunProgress } from '@/hooks/useTestRunProgress';
import { useTestRunRecovery } from '@/hooks/useTestRunRecovery';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { TestRunSummary } from '@/components/TestRunSummary';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useOfflineState } from '@/hooks/useOfflineState';
import { useToast } from '@/hooks/useToast';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { ConflictResolutionDialog } from '@/components/ConflictResolutionDialog';
import { useOperationQueue } from '@/hooks/useOperationQueue';
import { useTestRunWebSocket } from '@/hooks/useTestRunWebSocket';
import { useQueueProcessor } from '@/hooks/useQueueProcessor';
import type { TestRunProgress } from '@/types';
import { cn } from "@/lib/utils";

// Using enum instead of const object for better type safety
enum TestRunStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  BLOCKED = 'BLOCKED',
  SKIPPED = 'SKIPPED',
}

interface TestRunResult extends TestResult {
  testCaseId: string;
  status: TestRunStatus;
  notes?: string;
  evidenceUrls: string[];
}

const resultSchema = z.object({
  status: z.nativeEnum(TestRunStatus),
  notes: z.string().optional(),
  evidenceUrls: z.array(z.string()),
});

type FormData = z.infer<typeof resultSchema>;

type ExecuteTestRunProps = {
  testCases: TestCase[];
  projectId: string;
  testRunId: string;
  onComplete: () => void;
  onCancel: () => void;
};

const BATCH_SIZE = 3;

interface TestRunProgress {
  projectId: string;
  testRunId: string;
  currentIndex: number;
  results: TestRunResult[];
}

export function ExecuteTestRun({ 
  testCases, 
  projectId,
  testRunId,
  onComplete, 
  onCancel 
}: ExecuteTestRunProps) {
  const { executeTestRun } = useTestRunExecution(projectId, testRunId);
  const { progress: savedProgress, updateProgress, clearProgress } = useTestRunProgress<TestRunProgress>(projectId, testRunId);
  const { recoveryState, clearRecovery, canRetry } = useTestRunRecovery(projectId, testRunId);
  const { 
    uploadFiles, 
    isUploading: fileUploading, 
    progress: fileProgress, 
    error: uploadError, 
    canRetry: fileCanRetry 
  } = useFileUpload(projectId);
  const { 
    isOnline, 
    hasPendingOperations, 
    pendingOperations,
  } = useOfflineState(projectId, testRunId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { toast } = useToast();
  const { isSyncing, syncNow } = useBackgroundSync(projectId, testRunId);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [serverChanges, setServerChanges] = useState<TestRunResult[]>([]);
  const { 
    addToQueue, 
    hasOperations: hasQueuedOperations 
  } = useOperationQueue(projectId);
  const { isProcessing, queueLength } = useQueueProcessor(projectId);

  const form = useForm<FormData>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      status: TestRunStatus.PASSED,
      notes: '',
      evidenceUrls: [],
    },
  });

  const currentTestCase = testCases[savedProgress.currentIndex];
  const isLastTestCase = savedProgress.currentIndex === testCases.length - 1;
  const completionProgress = ((savedProgress.currentIndex + 1) / testCases.length) * 100;

  // Auto-save form data
  useEffect(() => {
    const formData = form.getValues();
    const storageKey = `testrun:${projectId}:${testRunId}:${savedProgress.currentIndex}`;
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }, [form.watch(), savedProgress.currentIndex, projectId, testRunId]);

  // Load saved form data
  useEffect(() => {
    const storageKey = `testrun:${projectId}:${testRunId}:${savedProgress.currentIndex}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const formData = JSON.parse(saved);
      form.reset(formData);
    }
  }, [savedProgress.currentIndex, projectId, testRunId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    form.setValue('evidenceUrls', files.map(f => f.name), { shouldValidate: true });
  };

  const handleFileRemove = (index: number) => {
    const currentFiles = form.getValues('evidenceUrls') || [];
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    form.setValue('evidenceUrls', newFiles, { shouldValidate: true });
  };

  const handleOptimisticUpdate = useCallback((result: TestRunResult) => {
    updateProgress((prev: TestRunProgress): TestRunProgress => ({
      ...prev,
      results: [...prev.results, result],
      currentIndex: prev.currentIndex + 1,
    }));
  }, [updateProgress]);

  const checkForConflicts = useCallback(async () => {
    const response = await fetch(
      `/api/projects/${projectId}/test-runs/${testRunId}/conflicts`
    );
    if (!response.ok) return false;
    
    const { conflicts } = await response.json();
    if (conflicts?.length) {
      setServerChanges(conflicts);
      setShowConflictDialog(true);
      return true;
    }
    return false;
  }, [projectId, testRunId]);

  const handleConflictResolution = async (resolvedResults: TestRunResult[]) => {
    try {
      setIsSubmitting(true);
      await executeTestRun(resolvedResults);
      clearProgress();
      clearRecovery();
      onComplete();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save resolved changes';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const revertOptimisticUpdate = useCallback((prev: TestRunProgress) => ({
    ...prev,
    results: prev.results.slice(0, -1),
    currentIndex: prev.currentIndex - 1,
  }), []);

  const handleNext = form.handleSubmit(async (data) => {
    try {
      setError(null);
      const result: TestRunResult = {
        testCaseId: currentTestCase.id,
        status: data.status,
        notes: data.notes,
        evidenceUrls: [],
      };

      if (!isOnline) {
        if (data.evidenceUrls?.length) {
          // Queue file uploads with high priority
          data.evidenceUrls.forEach((file, index) => {
            addToQueue('upload', {
              file,
              testCaseId: currentTestCase.id,
              testRunId,
              index, // Keep track of order
            }, 'high');
          });
        }

        // Queue test result with medium priority
        addToQueue('testResult', {
          ...result,
          testRunId,
          timestamp: Date.now(),
        }, 'medium');

        handleOptimisticUpdate(result);
        
        if (isLastTestCase) {
          toast({
            description: "Test run completed. Changes will sync when online.",
            variant: "default"
          });
          onComplete();
        }
      } else {
        try {
          if (data.evidenceUrls?.length) {
            const uploadedUrls = await uploadFiles(
              data.evidenceUrls.map(name => new File([], name))
            );
            result.evidenceUrls = uploadedUrls;
          }

          if (isLastTestCase) {
            const hasConflicts = await checkForConflicts();
            if (hasConflicts) return;

            setIsSubmitting(true);
            await executeTestRun([...savedProgress.results, result]);
            clearProgress();
            clearRecovery();
            onComplete();
          } else {
            handleOptimisticUpdate(result);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
          
          updateProgress((prev: TestRunProgress): TestRunProgress => revertOptimisticUpdate(prev));

          // Queue failed operation
          addToQueue('testResult', {
            ...result,
            testRunId,
            timestamp: Date.now(),
          }, 'high');

          toast({
            description: "Operation queued for retry",
            variant: "default"
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleRetry = async () => {
    if (!canRetry) {
      toast({
        title: "Error",
        description: "Maximum retry attempts reached. Please contact support.",
        variant: "destructive"
      });
      return;
    }

    setError(null);
    form.reset(form.getValues());
    
    try {
      setIsSubmitting(true);
      await executeTestRun(savedProgress.results);
      clearProgress();
      clearRecovery();
      onComplete();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry test run execution';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    const hasUnsavedChanges = form.formState.isDirty;
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      onCancel();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    onCancel();
  };

  // Update OfflineIndicator to show more detailed status
  const OfflineIndicator = () => {
    if (!hasQueuedOperations && !hasPendingOperations) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 p-4 rounded-lg shadow-lg z-50">
        <div className="flex flex-col gap-2">
          {!isOnline && (
            <div className="text-sm font-semibold text-yellow-800">
              Offline Mode
            </div>
          )}
          {hasQueuedOperations && (
            <div className="text-sm">
              {isProcessing 
                ? `Processing ${queueLength} operations...`
                : `${queueLength} operations queued`}
              {isProcessing && (
                <div className="mt-2">
                  <Progress value={(queueLength / BATCH_SIZE) * 100} />
                </div>
              )}
            </div>
          )}
          {hasPendingOperations && (
            <div className="text-sm">
              {isSyncing 
                ? `Syncing ${pendingOperations.length} changes...`
                : `${pendingOperations.length} changes pending sync`}
            </div>
          )}
          {(hasQueuedOperations || hasPendingOperations) && (
            <Button
              variant="outline"
              size="sm"
              onClick={syncNow}
              disabled={!isOnline || isSyncing}
            >
              Sync Now
            </Button>
          )}
        </div>
      </div>
    );
  };

  const handleConflictDetected = useCallback((changes: TestResult[]) => {
    setServerChanges(changes as TestRunResult[]);
    setShowConflictDialog(true);
  }, []);

  useTestRunWebSocket(projectId, testRunId, handleConflictDetected);

  return (
    <>
      {!isOnline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You are currently offline. Changes will be saved and synchronized when you're back online.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="w-full mx-auto">
            <CardHeader className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  Execute Test Case {savedProgress.currentIndex + 1} of {testCases.length}
                </h2>
                <span className="text-sm text-muted-foreground">
                  Progress: {Math.round(completionProgress)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${completionProgress}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="border p-4 rounded-md">
                <h3 className="font-semibold">{currentTestCase.title}</h3>
                <p className="mt-2 text-muted-foreground">{currentTestCase.description}</p>
                <div className="mt-4">
                  <h4 className="font-medium">Steps:</h4>
                  <pre className="mt-1 whitespace-pre-wrap">{currentTestCase.steps}</pre>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium">Expected Result:</h4>
                  <p className="mt-1">{currentTestCase.expectedResult}</p>
                </div>
              </div>

              <form onSubmit={handleNext} className="space-y-4">
                <FormField
                  name="status"
                  render={() => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select
                          {...form.register('status')}
                          className="w-full p-2 border rounded-md"
                        >
                          {Object.values(TestRunStatus).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="notes"
                  render={() => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <textarea
                          {...form.register('notes')}
                          placeholder="Add any notes or observations..."
                          className="w-full p-2 border rounded-md min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="evidenceUrls"
                  render={() => (
                    <FormItem>
                      <FormLabel>Evidence</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                          disabled={fileUploading}
                        />
                      </FormControl>
                      {fileUploading && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading evidence...</span>
                            <span>{Math.round(fileProgress)}%</span>
                          </div>
                          <Progress value={fileProgress} />
                        </div>
                      )}
                      {uploadError && (
                        <div className="space-y-2">
                          <p className="text-sm text-red-500">{uploadError}</p>
                          {fileCanRetry && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const files = form.getValues('evidenceUrls');
                                if (files?.length) uploadFiles(files.map(name => new File([], name)));
                              }}
                            >
                              Retry Upload
                            </Button>
                          )}
                        </div>
                      )}
                      {(form.watch('evidenceUrls')?.length ?? 0) > 0 && (
                        <div className="mt-4">
                          <FilePreview
                            files={form.watch('evidenceUrls')?.map(name => ({ name })) ?? []}
                            onRemove={handleFileRemove}
                          />
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="space-y-2">
                    <div className="text-sm text-red-500">{error}</div>
                    {canRetry && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleRetry} disabled={isSubmitting}>
                          Retry Submission
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {3 - recoveryState.retryCount} attempts remaining
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelClick}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLastTestCase ? 'Complete' : 'Next Test Case'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <TestRunSummary
            results={savedProgress.results}
            total={testCases.length}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancelDialog}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelDialog(false)}
        title="Cancel Test Run?"
        description="You have unsaved changes. Are you sure you want to cancel? All progress will be lost."
        confirmText="Yes, Cancel"
        cancelText="No, Continue Testing"
      />

      <OfflineIndicator />

      <ConflictResolutionDialog
        isOpen={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
        localChanges={savedProgress.results}
        serverChanges={serverChanges}
        onResolve={handleConflictResolution as (results: TestResult[]) => void}
      />
    </>
  );
}
